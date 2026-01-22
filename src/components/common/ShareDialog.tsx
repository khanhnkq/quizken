import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
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
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

import logo from "@/assets/logo/logo.png";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  quizTitle?: string;
  questionCount?: number;
}

export function ShareDialog({ isOpen, onClose, url, title, quizTitle, questionCount }: ShareDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
      toast({
        title: t('share.copied'),
        description: t('share.copiedDesc'),
        variant: "default",
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({
        title: t('share.copyFailed'),
        description: t('share.copyFailedDesc'),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0 overflow-visible">
        <div className="bg-gradient-to-br from-violet-50 to-pink-50 border-4 border-white p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative text-center space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-gray-800 tracking-tight">
                    {title || t('share.title')}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 font-medium">
                     {t('share.description')}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-6">
                  {/* QR Code Card */}
                  <div className="p-4 bg-white rounded-[2rem] shadow-lg border-2 border-dashed border-gray-200 relative transform transition-transform hover:scale-105 duration-300 hover:rotate-2">
                    <QRCodeCanvas
                      value={url}
                      size={180}
                      level={"H"}
                      includeMargin={true}
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full p-1 shadow-md border-2 border-white">
                       <img 
                         src={logo} 
                         alt="Logo" 
                         className="w-full h-full object-cover rounded-full bg-gray-50" 
                       />
                    </div>
                  </div>

                  {/* Quiz Info Badge */}
                  {quizTitle && (
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm w-full max-w-[240px]">
                          <h3 className="font-bold text-gray-800 truncate leading-tight mb-1">{quizTitle}</h3>
                          {questionCount !== undefined && (
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  {questionCount} {t('share.questions')}
                              </p>
                          )}
                      </div>
                  )}
                  
                  {/* Link & Copy Button */}
                  <div className="flex items-center space-x-2 w-full bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
                    <div className="flex-1 px-4 truncate font-mono text-xs text-gray-500">
                        {url}
                    </div>
                    <Button 
                        size="sm" 
                        onClick={handleCopy} 
                        className={`rounded-full px-6 transition-all duration-300 font-bold ${
                            hasCopied 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : "bg-gray-900 hover:bg-gray-800 text-white"
                        }`}
                    >
                      {hasCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{t('share.copy')}</span>
                      )}
                    </Button>
                  </div>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
