import { Palette, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUserItems } from "@/hooks/useUserItems";
import { useItems } from "@/hooks/useItems";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { ThemeTransitionOverlay } from "./ThemeTransitionOverlay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function NavbarThemeSelector() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profileData, refetch: refetchProfile } = useProfile(user?.id);
  const { data: ownedItems = [] } = useUserItems();
  const { data: allItems = [] } = useItems();
  const [open, setOpen] = useState(false);
  
  // Animation State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState<{x: number, y: number} | null>(null);
  const [targetThemeColor, setTargetThemeColor] = useState("#8b5cf6");

  // Filter owned themes and join with details
  // Filter owned themes, join with details, and DEDUPLICATE
  const uniqueThemesMap = new Map();
  
  ownedItems.forEach(owned => {
      const details = allItems.find(i => i.id === owned.item_id);
      if (details?.type === 'theme') {
          // If already exists, we keep the first one (or latest depending on order, doesn't matter much for display)
          if (!uniqueThemesMap.has(owned.item_id)) {
              uniqueThemesMap.set(owned.item_id, { ...owned, details });
          }
      }
  });

  const myThemes = Array.from(uniqueThemesMap.values());

  const handleEquipTheme = async (item: any, e: React.MouseEvent) => {
    if (profileData?.equipped_theme === item.item_id) return;

    // 1. Set Animation Origin
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTransitionOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    });

    // 2. Determine Theme Color based on item_id (simple mapping for now)
    let color = "#8b5cf6"; // Default violet
    if (!item.item_id) {
        color = "#64748b"; // Slate for default
    } else {
        switch (item.item_id) {
           case 'theme_vietnam_spirit': color = "#ef4444"; break; // Red
           case 'theme_neon_night': color = "#06b6d4"; break; // Cyan
           case 'theme_pastel_dream': color = "#f9a8d4"; break; // Pink
           case 'theme_comic_manga': color = "#f59e0b"; break; // Amber
           case 'theme_jujutsu_kaisen': color = "#7f1d1d"; break; // Dark Red
        }
    }
    setTargetThemeColor(color);
    
    // 3. Start Animation
    setIsTransitioning(true);
    setOpen(false); // Close popover immediately

    // 4. Perform Update (during animation)
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ equipped_theme: item.item_id } as any)
            .eq('id', user?.id);

        if (error) throw error;
        
        await refetchProfile();

        // 5. Complete
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
        setIsTransitioning(false); // Cancel animation on error
    }
  };

  if (myThemes.length === 0) return null;

  return (
    <>
        <ThemeTransitionOverlay 
            isActive={isTransitioning} 
            origin={transitionOrigin} 
            themeColor={targetThemeColor}
            onComplete={() => setIsTransitioning(false)}
        />

        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-10 h-10 border-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary hover:bg-white/50 transition-all duration-300 relative group hidden sm:flex"
            title={t('inventory.changeTheme', 'Change Theme')}
            >
            <Palette className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span className="sr-only">Change Theme</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[340px] p-0 overflow-hidden rounded-2xl border-slate-200 shadow-xl">
            <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    {t('inventory.myThemes', 'My Themes')}
                </h3>
                <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                    {myThemes.length} owned
                </span>
            </div>
            
            <ScrollArea className="h-[280px] p-3">
                <div className="grid grid-cols-2 gap-3">
                    {/* Default/None option */}
                    <button
                        onClick={(e) => handleEquipTheme({ item_id: null, details: { name: "Default" } }, e)}
                        className={cn(
                            "relative group flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 text-center space-y-2",
                            !profileData?.equipped_theme 
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20" 
                                : "bg-card border-border hover:border-primary/50 hover:bg-accent/50 hover:scale-[1.02]"
                        )}
                    >
                        {!profileData?.equipped_theme && (
                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5 shadow-sm">
                                <Check className="w-3 h-3" />
                            </div>
                        )}
                        
                        <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center text-2xl shadow-inner group-hover:shadow-md transition-all overflow-hidden p-1">
                            <img 
                                src="/images/mascot/happy.png" 
                                alt="Default"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        
                        <div>
                            <div className="font-bold text-xs truncate max-w-[120px]">
                                Default
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {!profileData?.equipped_theme ? t('inventory.equipped') : t('inventory.equip')}
                            </div>
                        </div>
                    </button>
                    
                    {myThemes.map((theme) => {
                        const isEquipped = profileData?.equipped_theme === theme.item_id;
                        return (
                            <button
                                key={theme.id}
                                onClick={(e) => handleEquipTheme(theme, e)}
                                className={cn(
                                    "relative group flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 text-center space-y-2",
                                    isEquipped 
                                        ? "bg-primary/5 border-primary ring-1 ring-primary/20" 
                                        : "bg-card border-border hover:border-primary/50 hover:bg-accent/50 hover:scale-[1.02]"
                                )}
                            >
                                {isEquipped && (
                                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5 shadow-sm">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                                
                                <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center text-2xl shadow-inner group-hover:shadow-md transition-all">
                                    {theme.details?.image_url ? (
                                        <img src={theme.details.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <span>{theme.details?.icon || "🎨"}</span>
                                    )}
                                </div>
                                
                                <div>
                                    <div className="font-bold text-xs truncate max-w-[120px]">
                                        {theme.details?.name}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        {isEquipped ? t('inventory.equipped') : t('inventory.equip')}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
            
            {/* Footer: Link to Gacha */}
            <div className="p-3 border-t bg-muted/40 text-center">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs font-bold text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    onClick={() => {
                        setOpen(false);
                        navigate("/user/dashboard?tab=lucky-draw");
                    }}
                >
                    <Sparkles className="w-3 h-3 mr-2" />
                    {t('inventory.getMoreThemes', 'Get more themes')}
                </Button>
            </div>
        </PopoverContent>
        </Popover>
    </>
  );
}
