import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Image as ImageIcon, X, Loader2, FileType, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import useQuizGeneration from '@/hooks/useQuizGeneration';
import type { Quiz } from '@/types/quiz';

interface FileUploadInterfaceProps {
  onComplete: (quizId: string) => void;
  onCancel: () => void;
  isComic?: boolean;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUploadInterface: React.FC<FileUploadInterfaceProps> = ({ 
  onComplete, 
  onCancel,
  isComic = false
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressText, setProgressText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook for polling generation status
  const { startPolling, stopPolling, progress, status } = useQuizGeneration<Quiz>();

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: t('common.error'),
        description: "File size must be less than 10MB",
        variant: "destructive"
      });
      return false;
    }

    const isValidType = Object.keys(ACCEPTED_TYPES).some(type => {
        if (type === file.type) return true;
        return false;
    }) || file.type.startsWith('image/');

    if (!isValidType) {
      toast({
        title: t('common.error'),
        description: "Only PDF and Image files are supported",
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [t, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  }, [validateFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setShowProgress(true);
      setProgressText("Uploading & Analyzing...");

      // Convert file to base64
      const base64Data = await convertFileToBase64(file);
      const mimeType = file.type;
      
      // Call Backend
      const { data, error } = await supabase.functions.invoke('generate-quiz-from-file/start-quiz', {
        body: {
          fileData: base64Data,
          mimeType: mimeType,
          fileName: file.name,
          questionCount: 10, // Default to 10 for now
          language: 'vi' // Default or get from i18n
        }
      });

      if (error) throw error;

      if (data?.id) {
        // Start polling instead of immediate navigation
        setProgressText("Generating Questions...");
        
        startPolling(data.id, {
          onCompleted: ({ quiz }) => {
            setIsUploading(false);
            toast({
              title: "Success",
              description: `Generated ${quiz.questions?.length || 0} questions from file`,
              variant: "success"
            });
            onComplete(data.id);
          },
          onFailed: (msg) => {
            setIsUploading(false);
            setShowProgress(false);
            toast({
              title: "Generation Failed",
              description: msg || "Unknown error occurred",
              variant: "destructive"
            });
          },
          onExpired: () => {
            setIsUploading(false);
            setShowProgress(false);
            toast({
              title: "Timeout",
              description: "Generation took too long",
              variant: "warning"
            });
          },
          onProgress: (status, msg) => {
            setProgressText(msg);
          }
        });
      } else {
        throw new Error("No quiz ID returned");
      }

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: t('common.error'),
        description: error.message || "Failed to generate quiz from file",
        variant: "destructive"
      });
      setIsUploading(false);
      setShowProgress(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent p-6 relative">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Upload Material</h3>
        <p className="text-sm text-muted-foreground">
          Upload PDF notes or images of questions. AI will extract and create a quiz for you.
        </p>
      </div>

      <div 
        className={cn(
          "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer relative overflow-hidden",
          isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-secondary/50",
          isComic && "border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50",
          file && "border-solid bg-secondary/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf,image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {showProgress ? (
           <div className="flex flex-col items-center justify-center animate-in fade-in duration-300">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="font-semibold text-lg">{progressText || progress || "Processing..."}</p>
              <p className="text-sm text-muted-foreground mt-2">Please wait, AI is reading your file...</p>
           </div>
        ) : file ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-colors shadow-sm z-10"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </button>
            
            {file.type.startsWith('image/') ? (
               <div className="relative w-32 h-32 mb-4 rounded-lg overflow-hidden border shadow-sm">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
               </div>
            ) : (
               <FileType className="w-20 h-20 text-blue-500 mb-4" />
            )}

            <p className="font-semibold text-lg text-center break-all max-w-[80%]">{file.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors",
              isComic ? "bg-yellow-100 border-2 border-black" : "bg-primary/10"
            )}>
              <Upload className={cn("w-10 h-10", isComic ? "text-black" : "text-primary")} />
            </div>
            <p className="font-medium text-lg mb-1">Click or Drag file here</p>
            <p className="text-xs opacity-70">Support PDF, JPG, PNG (Max 10MB)</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
         <Button variant="ghost" onClick={onCancel} disabled={isUploading}>
            {t('common.cancel')}
         </Button>
         <Button 
            onClick={handleGenerate} 
            disabled={!file || isUploading}
            className={cn(
              isComic && "bg-black text-white hover:bg-black/80 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
            )}
         >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Quiz
              </>
            )}
         </Button>
      </div>
    </div>
  );
};
