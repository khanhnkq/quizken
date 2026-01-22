import { useState, useRef, useEffect } from "react";
import { Camera, Save, Loader2, X, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/lib/cloudinary";
import type { User } from "@supabase/supabase-js";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onProfileUpdated?: () => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [originalDisplayName, setOriginalDisplayName] = useState("");
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current profile from profiles table when dialog opens
  useEffect(() => {
    if (open && user) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await (supabase as any)
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching profile:", error);
          }

          // Use profiles data, fallback to Google metadata
          const name = data?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || "";
          const avatar = data?.avatar_url || user.user_metadata?.avatar_url || "";
          
          setDisplayName(name);
          setAvatarUrl(avatar);
          setOriginalDisplayName(name);
          setOriginalAvatarUrl(avatar);
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchProfile();
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [open, user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh (jpg, png, gif...)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let newAvatarUrl = avatarUrl;

      if (selectedFile) {
        setIsUploading(true);
        try {
          newAvatarUrl = await uploadAvatar(selectedFile);
        } catch (error) {
          console.error("Error uploading avatar:", error);
          toast({
            title: "Lỗi upload ảnh",
            description: "Không thể tải ảnh lên. Vui lòng thử lại.",
            variant: "destructive",
          });
          setIsSaving(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // Save to profiles table instead of auth.users
      const { error } = await (supabase as any)
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          avatar_url: newAvatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Thành công!",
        description: "Đã cập nhật thông tin cá nhân",
      });

      onOpenChange(false);
      onProfileUpdated?.();
      
      // Reload to update the profile
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarUrl = previewUrl || avatarUrl;
  const hasChanges =
    displayName !== originalDisplayName ||
    selectedFile !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Chỉnh sửa hồ sơ
          </DialogTitle>
          <DialogDescription>
            Thay đổi ảnh đại diện và tên hiển thị của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                {currentAvatarUrl && (
                  <AvatarImage src={currentAvatarUrl} alt={displayName} />
                )}
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {displayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Click vào ảnh để thay đổi
            </p>

            {selectedFile && (
              <p className="text-sm text-primary font-medium">
                📷 Đã chọn: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Display Name Input */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nhập tên hiển thị..."
              className="rounded-xl"
              maxLength={50}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploading ? "Đang tải ảnh..." : "Đang lưu..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
