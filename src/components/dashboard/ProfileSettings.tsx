import { useState, useRef } from "react";
import { User, Camera, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar } from "@/lib/cloudinary";
import { useTranslation } from "react-i18next";

export function ProfileSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ""
  );
  const [avatarUrl, setAvatarUrl] = useState(
    user?.user_metadata?.avatar_url || ""
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh (jpg, png, gif...)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
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
    if (!user) return;

    setIsSaving(true);
    try {
      let newAvatarUrl = avatarUrl;

      // Upload new avatar if selected
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

      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: displayName.trim(),
          avatar_url: newAvatarUrl,
        },
      });

      if (error) throw error;

      setAvatarUrl(newAvatarUrl);
      setSelectedFile(null);
      setPreviewUrl(null);

      toast({
        title: "Thành công!",
        description: "Đã cập nhật thông tin cá nhân",
      });
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
    displayName !== (user?.user_metadata?.full_name || user?.user_metadata?.name || "") ||
    selectedFile !== null;

  if (!user) {
    return (
      <Card className="rounded-2xl border-2 border-white shadow-lg bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Vui lòng đăng nhập để chỉnh sửa hồ sơ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-2 border-white shadow-lg bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Thông tin cá nhân
        </CardTitle>
        <CardDescription>
          Cập nhật ảnh đại diện và tên hiển thị của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
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
            Click vào ảnh để thay đổi (tối đa 5MB)
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
          <p className="text-xs text-muted-foreground">
            Tên này sẽ hiển thị trong chat và trên trang cá nhân của bạn
          </p>
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user.email || ""}
            disabled
            className="rounded-xl bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email không thể thay đổi
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full rounded-xl"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUploading ? "Đang tải ảnh lên..." : "Đang lưu..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
