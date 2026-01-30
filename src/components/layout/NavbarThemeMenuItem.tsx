import { Palette, Check, ChevronRight } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserItems } from "@/hooks/useUserItems";
import { useItems } from "@/hooks/useItems";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function NavbarThemeMenuItem() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profileData, refetch: refetchProfile } = useProfile(user?.id);
  const { data: ownedItems = [] } = useUserItems();
  const { data: allItems = [] } = useItems();

  // Filter owned themes and join with details and DEDUPLICATE
  const uniqueThemesMap = new Map();
  
  ownedItems.forEach(owned => {
      const details = allItems.find(i => i.id === owned.item_id);
      if (details?.type === 'theme') {
          if (!uniqueThemesMap.has(owned.item_id)) {
              uniqueThemesMap.set(owned.item_id, { ...owned, details });
          }
      }
  });

  const myThemes = Array.from(uniqueThemesMap.values());

  const handleEquipTheme = async (item: any) => {
    if (profileData?.equipped_theme === item.item_id) return;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ equipped_theme: item.item_id } as any)
            .eq('id', user?.id);

        if (error) throw error;
        
        await refetchProfile();

        toast({
            title: t('inventory.equipSuccess', 'Applied Theme!'),
            description: item.details?.name || "New Theme Equipped",
        });

    } catch (error) {
        console.error("Error changing theme:", error);
        toast({
            title: "Error",
            description: "Could not change theme.",
            variant: "destructive"
        });
    }
  };

  if (myThemes.length === 0) return null;

  return (
    <DropdownMenuSub>
        <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>{t('inventory.myThemes', 'Themes')}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
            <DropdownMenuSubContent sideOffset={-220} alignOffset={-4} collisionPadding={10} className="w-56 max-h-[300px] overflow-y-auto">
                <DropdownMenuItem
                    onClick={() => handleEquipTheme({ item_id: null, details: { name: "Default" } })}
                    className="flex items-center justify-between"
                >
                    <span className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-300 dark:border-slate-600 dark:bg-slate-800" />
                        Default
                    </span>
                    {!profileData?.equipped_theme && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                
                {myThemes.map((theme) => {
                    const isEquipped = profileData?.equipped_theme === theme.item_id;
                    return (
                        <DropdownMenuItem
                            key={theme.id}
                            onClick={() => handleEquipTheme(theme)}
                            className="flex items-center justify-between"
                        >
                            <span className="flex items-center gap-2">
                                {theme.details?.image_url ? (
                                    <img src={theme.details.image_url} alt="" className="w-4 h-4 object-cover rounded-full" />
                                ) : (
                                    <span className="text-xs">{theme.details?.icon || "🎨"}</span>
                                )}
                                <span className="truncate max-w-[120px]">{theme.details?.name}</span>
                            </span>
                            {isEquipped && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuSubContent>
        </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
