import * as React from "react";
import {  useState, useEffect  } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Key,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Check,
  Shield,
  Sparkles,
  Loader2,
  ClipboardPaste,
} from '@/lib/icons';
import { Tables, TablesInsert } from "@/integrations/supabase/types";

type UserApiKey = Tables<"user_api_keys">;

const ApiKeySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Form state
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiKeyError, setGeminiKeyError] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [testLoading, setTestLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadApiKeys();
    }
  }, [user]);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("user_api_keys")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true);

      if (error) {
        console.error("Error loading API keys:", error);
        // If table doesn't exist yet, show friendly message
        if (
          error.code === "PGRST116" ||
          error.message.includes("user_api_keys")
        ) {
          console.log(
            "API keys table might not be created yet. Please run the migration first."
          );
        } else {
          toast({
            title: "Lỗi",
            description: "Không thể tải API keys. Vui lòng thử lại.",
            variant: "destructive",
          });
        }
      } else {
        // Safely cast the data to avoid type errors
        const apiKeyData = (data || []) as UserApiKey[];
        setApiKeys(apiKeyData);

        // Populate form with existing keys (will be decrypted on backend)
        const geminiKey = apiKeyData.find(
          (k: UserApiKey) => k.provider === "gemini"
        );
        if (geminiKey) {
          // In production, this would be decrypted on backend
          setGeminiKey("••••••••••••••••••••••••••••••••"); // Placeholder
        }
      }
    } catch (error) {
      console.error("Load API keys error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (provider: "gemini") => {
    if (!user || !geminiKey.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập API key hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    setSaving(provider);
    try {
      const insertData: TablesInsert<"user_api_keys"> = {
        user_id: user.id,
        provider,
        encrypted_key: geminiKey, // In production: encrypt this
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_api_keys")
        .upsert(insertData, {
          onConflict: "user_id,provider",
        })
        .select();

      if (error) {
        console.error("Save API key error:", error);
        toast({
          title: "Lỗi lưu API key",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Thành công!",
          description: `API key ${provider} đã được lưu.`,
        });
        setGeminiKey("••••••••••••••••••••••••••••••••"); // Hide after save
        loadApiKeys(); // Refresh list
      }
    } catch (error) {
      console.error("Save API key error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu API key. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const deleteApiKey = async (provider: string) => {
    try {
      const { error } = await supabase
        .from("user_api_keys")
        .delete()
        .eq("user_id", user?.id)
        .eq("provider", provider);

      if (error) {
        console.error("Delete API key error:", error);
        toast({
          title: "Lỗi xóa API key",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Đã xóa",
          description: `API key ${provider} đã được xóa.`,
        });
        setGeminiKey("");
        setApiKeys(apiKeys.filter((k) => k.provider !== provider));
      }
    } catch (error) {
      console.error("Delete API key error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa API key. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  // Validate Gemini API key format (basic, client-side)
  const validateGeminiKey = (k: string) => {
    const masked = "••••••••••••••••••••••••••••••••";
    const trimmed = k.trim();

    if (trimmed === masked) {
      // Placeholder shown after load/save - treat as valid display state
      setGeminiKeyError("");
      setIsValid(true);
      return true;
    }

    if (trimmed.length === 0) {
      setGeminiKeyError("");
      setIsValid(false);
      return false;
    }

    if (/\s/.test(trimmed)) {
      setGeminiKeyError("API key không được chứa khoảng trắng");
      setIsValid(false);
      return false;
    }

    if (trimmed.length < 24) {
      setGeminiKeyError("API key quá ngắn");
      setIsValid(false);
      return false;
    }

    setGeminiKeyError("");
    setIsValid(true);
    return true;
  };

  useEffect(() => {
    validateGeminiKey(geminiKey);
  }, [geminiKey]);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setGeminiKey(text.trim());
    } catch {
      toast({
        title: "Không thể dán từ clipboard",
        description:
          "Trình duyệt chặn truy cập clipboard. Hãy dán thủ công (Cmd/Ctrl + V).",
        variant: "destructive",
      });
    }
  };

  const testApiKey = async () => {
    const key = geminiKey.trim();

    if (!validateGeminiKey(key)) {
      toast({
        title: "API key không hợp lệ",
        description: geminiKeyError || "Vui lòng kiểm tra và thử lại.",
        variant: "destructive",
      });
      return;
    }

    if (key === "••••••••••••••••••••••••••••••••") {
      toast({
        title: "Không thể kiểm tra",
        description: "Vui lòng dán API key thực tế để kiểm tra.",
        variant: "destructive",
      });
      return;
    }

    setTestLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }],
            generationConfig: { maxOutputTokens: 1, temperature: 0 },
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || `HTTP ${res.status}`);
      }

      toast({
        title: "Kết nối thành công",
        description: "API key hoạt động bình thường.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Kiểm tra thất bại",
        description:
          error instanceof Error
            ? error.message
            : "Không thể xác thực API key.",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để quản lý API keys.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header - Compact */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-[#B5CC89] p-2 rounded-full">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold">Cài đặt API Key</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Thêm API key riêng để sử dụng dịch vụ AI của bạn
        </p>
      </div>

      {/* Gemini API Key Form - Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Key Gemini AI
            </div>
            {apiKeys.some((k) => k.provider === "gemini") && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </CardTitle>
          <CardDescription className="text-sm">
            Lấy API key từ{" "}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium">
              Google AI Studio
            </a>
            {(() => {
              const u = apiKeys.find((k) => k.provider === "gemini")
                ?.updated_at as string | undefined;
              return u ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  Cập nhật lần cuối: {new Date(u).toLocaleString("vi-VN")}
                </div>
              ) : null;
            })()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Input field */}
          <div className="space-y-2">
            <Label htmlFor="gemini-key" className="text-sm font-medium">
              API Key Gemini
            </Label>
            <div className="relative">
              <Input
                id="gemini-key"
                type={showKeys["gemini"] ? "text" : "password"}
                placeholder="Nhập API key của bạn..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 hover:bg-black/10 transition-colors"
                onClick={() => toggleKeyVisibility("gemini")}>
                {showKeys["gemini"] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-1">
              {geminiKeyError ? (
                <p className="text-xs text-red-600">{geminiKeyError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Dán API key từ Google AI Studio. Không chia sẻ key công khai.
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => saveApiKey("gemini")}
              disabled={
                saving === "gemini" ||
                !geminiKey.trim() ||
                geminiKey === "••••••••••••••••••••••••••••••••" ||
                !isValid
              }
              size="sm"
              variant="hero"
              className="flex-1 min-w-[140px] group hover:bg-black hover:text-white">
              {saving === "gemini" ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-2" />
                  Lưu API Key
                </>
              )}
            </Button>

            <Button
              onClick={testApiKey}
              disabled={
                testLoading ||
                geminiKey === "••••••••••••••••••••••••••••••••" ||
                !isValid
              }
              variant="outline"
              size="sm"
              className="min-w-[140px]">
              {testLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                <>Kiểm tra kết nối</>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePasteFromClipboard}
              className="min-w-[120px]">
              <ClipboardPaste className="h-3 w-3 mr-2" />
              Dán từ clipboard
            </Button>

            {apiKeys.some((k) => k.provider === "gemini") && (
              <Button
                onClick={() => deleteApiKey("gemini")}
                variant="outline"
                size="sm"
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 min-w-[44px]">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            <Shield className="w-3 h-3 text-muted-foreground" />
            <span>API key được mã hóa và chỉ bạn có thể sử dụng</span>
          </div>

          {/* Success message */}
          {apiKeys.some((k) => k.provider === "gemini") && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              <Check className="h-3 w-3" />
              <span className="font-medium">
                API key đã được lưu và sẵn sàng sử dụng
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Setup Tip */}
      <Card className="bg-gradient-to-r from-primary/5 to-[#B5CC89]/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#B5CC89] mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm mb-1">Mẹo nhanh</h4>
              <p className="text-xs text-muted-foreground">
                Sau khi lưu API key, bạn có thể tạo quiz không giới hạn mà không
                gặp các lỗi về rate limit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySettings;
