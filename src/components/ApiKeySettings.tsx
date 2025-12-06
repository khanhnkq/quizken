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
          title: t("apiKeySettings.saveError"),
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
          title: t("apiKeySettings.deleteError"),
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
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      {/* Header - Matching Dashboard "Hello" Style */}
      <div className="flex flex-col items-center text-center space-y-3 pt-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border-2 border-slate-400 text-slate-600 font-bold text-sm shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span>Cài đặt nâng cao</span>
        </div>

        {/* Title with SVG underline */}
        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-foreground drop-shadow-sm">
          API{' '}
          <span className="text-slate-600 relative inline-block">
            Settings
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-slate-300 -z-10 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="12" fill="none" />
            </svg>
          </span>
          <span className="inline-block animate-wave ml-2 origin-[70%_70%]">🔑</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground font-medium max-w-lg">
          {t("apiKeySettings.description")}
        </p>
      </div>

      {/* Gemini API Key Form - Compact Card */}
      <Card className="rounded-2xl border-3 border-primary/20 shadow-md overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-secondary/30 to-transparent">
          <CardTitle className="flex items-center justify-between text-lg font-heading">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg border-2 border-primary/10">
                <Key className="w-4 h-4 text-primary" />
              </div>
              API Key Gemini AI
            </div>
            {apiKeys.some((k) => k.provider === "gemini") && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                <Check className="w-3 h-3" />
                <span>{t("apiKeySettings.connected")}</span>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-sm font-medium">
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
        <CardContent className="space-y-3 p-4 pt-3">
          {/* Input field */}
          <div className="space-y-1.5">
            <Label htmlFor="gemini-key" className="text-sm font-heading font-bold text-foreground/80">
              {t("apiKeySettings.pasteKey")}
            </Label>
            <div className="relative group">
              <Input
                id="gemini-key"
                type={showKeys["gemini"] ? "text" : "password"}
                placeholder={t("apiKeySettings.placeholder")}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="pr-10 h-11 rounded-xl border-3 border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-base transition-all duration-200"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg hover:bg-secondary/50 text-muted-foreground"
                onClick={() => toggleKeyVisibility("gemini")}>
                {showKeys["gemini"] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div>
              {geminiKeyError ? (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {geminiKeyError}
                </p>
              ) : (
                <p className="text-xs font-medium text-muted-foreground">
                  {t("apiKeySettings.secureNote")}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => saveApiKey("gemini")}
              disabled={
                saving === "gemini" ||
                !geminiKey.trim() ||
                geminiKey === "••••••••••••••••••••••••••••••••" ||
                !isValid
              }
              size="default"
              variant="hero"
              className="flex-1 rounded-xl font-heading text-sm shadow-md hover:shadow-lg transition-all duration-200">
              {saving === "gemini" ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                  {t("apiKeySettings.saving")}
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
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
                size="default"
                className="flex-1 sm:flex-none rounded-xl border-3 border-border hover:border-primary/50 hover:bg-secondary/30 font-heading text-sm">
                {testLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  t("apiKeySettings.test")
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handlePasteFromClipboard}
                className="flex-1 sm:flex-none rounded-xl border-3 border-border hover:border-primary/50 hover:bg-secondary/30 font-heading"
                title={t("apiKeySettings.pasteFromClipboard")}>
                <ClipboardPaste className="h-3.5 w-3.5" />
              </Button>

              {apiKeys.some((k) => k.provider === "gemini") && (
                <Button
                  onClick={() => deleteApiKey("gemini")}
                  variant="outline"
                  size="default"
                  className="rounded-xl border-3 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Success message */}
          {apiKeys.some((k) => k.provider === "gemini") && (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              <div className="p-0.5 bg-green-200 rounded-full">
                <Check className="h-3 w-3 text-green-700" />
              </div>
              <span className="font-bold font-heading">
                {t("apiKeySettings.apiReady")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Setup Tip - Compact */}
      <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-2xl shadow-sm">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-bold font-heading text-sm text-foreground">{t("apiKeySettings.tip.title")}</h4>
            <p className="text-xs font-medium text-muted-foreground">
              {t("apiKeySettings.tip.description")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div >
  );
};

export default ApiKeySettings;
