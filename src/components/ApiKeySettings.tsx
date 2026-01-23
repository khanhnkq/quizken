import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
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
  Zap,
  Cpu
} from 'lucide-react';

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
  const queryClient = useQueryClient();
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
        const apiKeyData = (data || []) as UserApiKey[];
        setApiKeys(apiKeyData);

        const geminiKey = apiKeyData.find(
          (k: UserApiKey) => k.provider === "gemini"
        );
        if (geminiKey) {
          setGeminiKey("••••••••••••••••••••••••••••••••");
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
        encrypted_key: geminiKey,
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
        setGeminiKey("••••••••••••••••••••••••••••••••");
        loadApiKeys();
        queryClient.invalidateQueries({ queryKey: ["user-quota"] });
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
        queryClient.invalidateQueries({ queryKey: ["user-quota"] });
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

  const validateGeminiKey = (k: string) => {
    const masked = "••••••••••••••••••••••••••••••••";
    const trimmed = k.trim();

    if (trimmed === masked) {
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
        description: t("apiKeySettings.toasts.clipboardErrorDesc"),
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
      <div className="flex justify-center items-center p-12 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-muted-foreground dark:text-gray-400 font-medium flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t("apiKeySettings.loginRequired")}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isGeminiConnected = apiKeys.some((k) => k.provider === "gemini");

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* Header Area */}
      <div className="flex flex-col items-center text-center space-y-4 pt-2">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border-2 border-violet-200 shadow-[0_4px_12px_rgba(139,92,246,0.1)] animate-bounce-slow">
          <Sparkles className="w-4 h-4 text-violet-500 fill-violet-500" />
          <span className="font-bold text-sm text-violet-700">{t('dashboard.settings.title')}</span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-white drop-shadow-sm">
          API{' '}
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
            Settings
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-violet-300 -z-10 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="12" fill="none" />
            </svg>
          </span>
          <span className="inline-block animate-wave ml-3 origin-[70%_70%]">🔑</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-lg">
          {t('dashboard.settings.description')}
        </p>
      </div>

      {/* Main Card - Claymorphism Style */}
      <div className="relative group">
        {/* Decorative elements behind */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-200 via-indigo-200 to-cyan-200 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-500"></div>

        <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-indigo-50 dark:border-indigo-900 shadow-[0_20px_40px_rgba(0,0,0,0.05),inset_0_-2px_6px_rgba(0,0,0,0.02)] p-6 md:p-10 overflow-hidden">

          {/* Header inside card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-200 transform rotate-3">
                <Cpu className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  Gemini AI
                  {isGeminiConnected && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      {t("apiKeySettings.connected")}
                    </span>
                  )}
                </h2>
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  {t("apiKeySettings.getFreeKey")}
                  <Zap className="w-3 h-3 fill-current" />
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="gemini-key" className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide ml-1">
                {t("apiKeySettings.pasteKey")}
              </Label>

              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className={`h-5 w-5 transition-colors ${isValid ? 'text-emerald-500' : 'text-slate-400'}`} />
                </div>
                <Input
                  id="gemini-key"
                  type={showKeys["gemini"] ? "text" : "password"}
                  placeholder={t("apiKeySettings.placeholder")}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="pl-12 pr-12 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-violet-400 dark:focus:border-violet-600 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900/20 text-lg transition-all duration-300 font-medium text-slate-800 placeholder:text-slate-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => toggleKeyVisibility("gemini")}
                >
                  {showKeys["gemini"] ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Error / Status Message */}
              <AnimatePresence mode="wait">
                {geminiKeyError ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-rose-500 text-sm font-medium pl-1"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {geminiKeyError}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-slate-400 text-sm font-medium pl-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {t("apiKeySettings.secureNote")}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {/* Save Button - Large & Hero */}
              <Button
                onClick={() => saveApiKey("gemini")}
                disabled={saving === "gemini" || !geminiKey.trim() || geminiKey === "••••••••••••••••••••••••••••••••" || !isValid}
                className={`
                  col-span-1 sm:col-span-2 h-14 rounded-2xl text-base font-bold shadow-lg transition-all duration-300 transform active:scale-[0.98]
                  bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white
                  shadow-violet-200 hover:shadow-violet-300
                `}
              >
                {saving === "gemini" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {t("apiKeySettings.saving")}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {t("apiKeySettings.saveKey")}
                  </>
                )}
              </Button>

              {/* Secondary Actions */}
              <div className="flex gap-3 col-span-1 sm:col-span-2">
                <Button
                  onClick={testApiKey}
                  disabled={testLoading || geminiKey === "••••••••••••••••••••••••••••••••" || !isValid}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-700 dark:text-gray-200 hover:text-violet-700 dark:hover:text-violet-300 font-bold transition-all"
                >
                  {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("apiKeySettings.test")}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePasteFromClipboard}
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-300 font-bold transition-all"
                  title={t("apiKeySettings.pasteFromClipboard")}
                >
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  Paste
                </Button>

                {isGeminiConnected && (
                  <Button
                    onClick={() => deleteApiKey("gemini")}
                    variant="ghost"
                    className="h-12 w-12 rounded-xl border-2 border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:border-rose-200 hover:text-rose-600 transition-all p-0 flex items-center justify-center shrink-0"
                    title="Delete Key"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tip Card - Sticky Note Style */}
      <div className="relative transform rotate-1 hover:rotate-0 transition-transform duration-300 max-w-lg mx-auto">
        <div className="absolute top-0 left-0 w-full h-full bg-yellow-400 dark:bg-yellow-600 rounded-2xl transform translate-x-2 translate-y-2 -z-10 rounded-br-[3rem]"></div>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-5 rounded-br-[3rem] shadow-sm flex items-start gap-4">
          <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2.5 rounded-xl border border-yellow-200 dark:border-yellow-700 shrink-0 transform -rotate-6">
            <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-200 text-lg mb-1 font-heading">{t("apiKeySettings.tip.title")}</h4>
            <p className="text-amber-700/80 dark:text-amber-400/80 text-sm font-medium leading-relaxed">
              {t("apiKeySettings.tip.description")}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ApiKeySettings;
