import * as React from "react";
import { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";
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

// Define types locally since they are missing in generated types
interface UserApiKey {
  user_id: string;
  provider: string;
  encrypted_key: string;
  is_active: boolean;
  updated_at: string;
}

interface UserApiKeyInsert {
  user_id: string;
  provider: string;
  encrypted_key: string;
  is_active?: boolean;
  updated_at?: string;
}

const ApiKeySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
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
            title: t("apiKeySettings.toasts.loadError"),
            description: t("apiKeySettings.toasts.loadErrorDesc"),
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
        title: t("apiKeySettings.toasts.invalidKey"),
        description: t("apiKeySettings.toasts.invalidKeyDesc"),
        variant: "destructive",
      });
      return;
    }

    setSaving(provider);
    try {
      const insertData: UserApiKeyInsert = {
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
          title: t("apiKeySettings.toasts.saveSuccess"),
          description: t("apiKeySettings.toasts.saveSuccessDesc", { provider }),
        });
        setGeminiKey("••••••••••••••••••••••••••••••••"); // Hide after save
        loadApiKeys(); // Refresh list
      }
    } catch (error) {
      console.error("Save API key error:", error);
      toast({
        title: t("apiKeySettings.toasts.genericSaveError"),
        description: t("apiKeySettings.toasts.genericSaveErrorDesc"),
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
          title: t("apiKeySettings.toasts.deleteSuccess"),
          description: t("apiKeySettings.toasts.deleteSuccessDesc", { provider }),
        });
        setGeminiKey("");
        setApiKeys(apiKeys.filter((k) => k.provider !== provider));
      }
    } catch (error) {
      console.error("Delete API key error:", error);
      toast({
        title: t("apiKeySettings.toasts.genericDeleteError"),
        description: t("apiKeySettings.toasts.genericDeleteErrorDesc"),
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
      setGeminiKeyError(t("apiKeySettings.toasts.noWhitespace"));
      setIsValid(false);
      return false;
    }

    if (trimmed.length < 24) {
      setGeminiKeyError(t("apiKeySettings.toasts.tooShort"));
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
        title: t("apiKeySettings.toasts.clipboardError"),
        description:
          t("apiKeySettings.toasts.clipboardErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const testApiKey = async () => {
    const key = geminiKey.trim();

    if (!validateGeminiKey(key)) {
      toast({
        title: t("apiKeySettings.toasts.invalidKeyToast"),
        description: geminiKeyError || t("apiKeySettings.toasts.invalidKeyToastDesc"),
        variant: "destructive",
      });
      return;
    }

    if (key === "••••••••••••••••••••••••••••••••") {
      toast({
        title: t("apiKeySettings.toasts.cannotTest"),
        description: t("apiKeySettings.toasts.cannotTestDesc"),
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
        title: t("apiKeySettings.toasts.testSuccess"),
        description: t("apiKeySettings.toasts.testSuccessDesc"),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: t("apiKeySettings.toasts.testFailed"),
        description:
          error instanceof Error
            ? error.message
            : t("apiKeySettings.toasts.testFailedDesc"),
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
            {t("apiKeySettings.loginRequired")}
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
    <div className="max-w-2xl mx-auto p-2 space-y-6">
      {/* Header - Playful */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-4 bg-secondary/40 rounded-3xl mb-2 animate-bounce-subtle">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-bold font-heading text-primary">{t("apiKeySettings.title")}</h2>
        <p className="text-base text-muted-foreground font-medium max-w-md mx-auto">
          {t("apiKeySettings.description")}
        </p>
      </div>

      {/* Gemini API Key Form - Playful Card */}
      <Card className="rounded-3xl border-4 border-primary/20 shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-secondary/30 to-transparent">
          <CardTitle className="flex items-center justify-between text-xl font-heading">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-xl border-2 border-primary/10">
                <Key className="w-5 h-5 text-primary" />
              </div>
              API Key Gemini AI
            </div>
            {apiKeys.some((k) => k.provider === "gemini") && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold border-2 border-green-200">
                <Check className="w-4 h-4" />
                <span>{t("apiKeySettings.connected")}</span>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-base font-medium ml-1">
            {t("apiKeySettings.getFreeKey")}{" "}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold">
              Google AI Studio
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          {/* Input field */}
          <div className="space-y-2">
            <Label htmlFor="gemini-key" className="text-base font-heading font-bold text-foreground/80 ml-1">
              {t("apiKeySettings.pasteKey")}
            </Label>
            <div className="relative group">
              <Input
                id="gemini-key"
                type={showKeys["gemini"] ? "text" : "password"}
                placeholder={t("apiKeySettings.placeholder")}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="pr-12 h-14 rounded-2xl border-4 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/10 text-lg transition-all duration-200"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-10 w-10 rounded-xl hover:bg-secondary/50 text-muted-foreground"
                onClick={() => toggleKeyVisibility("gemini")}>
                {showKeys["gemini"] ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="ml-1">
              {geminiKeyError ? (
                <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                  {geminiKeyError}
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">
                  {t("apiKeySettings.secureNote")}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => saveApiKey("gemini")}
              disabled={
                saving === "gemini" ||
                !geminiKey.trim() ||
                geminiKey === "••••••••••••••••••••••••••••••••" ||
                !isValid
              }
              size="lg"
              variant="hero"
              className="flex-1 rounded-2xl font-heading text-base shadow-md hover:shadow-lg transition-all duration-200">
              {saving === "gemini" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("apiKeySettings.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("apiKeySettings.saveKey")}
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={testApiKey}
                disabled={
                  testLoading ||
                  geminiKey === "••••••••••••••••••••••••••••••••" ||
                  !isValid
                }
                variant="outline"
                size="lg"
                className="flex-1 sm:flex-none rounded-2xl border-4 border-border hover:border-primary/50 hover:bg-secondary/30 font-heading">
                {testLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("apiKeySettings.test")
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handlePasteFromClipboard}
                className="flex-1 sm:flex-none rounded-2xl border-4 border-border hover:border-primary/50 hover:bg-secondary/30 font-heading"
                title={t("apiKeySettings.pasteFromClipboard")}>
                <ClipboardPaste className="h-4 w-4" />
              </Button>

              {apiKeys.some((k) => k.provider === "gemini") && (
                <Button
                  onClick={() => deleteApiKey("gemini")}
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-4 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Success message */}
          {apiKeys.some((k) => k.provider === "gemini") && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-2xl text-green-700 animate-in fade-in slide-in-from-top-2">
              <div className="p-1 bg-green-200 rounded-full">
                <Check className="h-4 w-4 text-green-700" />
              </div>
              <span className="font-bold font-heading">
                {t("apiKeySettings.apiReady")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Setup Tip - Playful Style */}
      <Card className="bg-gradient-to-br from-[#B5CC89]/20 to-primary/5 border-4 border-[#B5CC89]/30 rounded-3xl shadow-sm">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm rotate-3">
            <Sparkles className="w-6 h-6 text-[#B5CC89]" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold font-heading text-lg text-foreground">Mẹo nhỏ</h4>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              Sử dụng API key riêng giúp bạn tạo quiz nhanh hơn và không bao giờ lo bị giới hạn số lượng câu hỏi! 🌟
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySettings;
