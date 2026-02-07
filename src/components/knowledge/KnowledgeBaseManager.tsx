import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromFile } from "@/utils/pdfExtractor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Trash2, Upload, Loader2, CheckCircle, AlertCircle, Edit2, Save, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Document {
  id: string;
  title: string;
  created_at: string;
  file_size: number;
}

export const KnowledgeBaseManager = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      console.error("Error fetching documents:", error);
      toast({
        title: t("knowledgeBase.fetchError"),
        description: t("knowledgeBase.fetchErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t("knowledgeBase.loginRequired"));

      // 1. Extract text (Client-side)
      setUploadProgress(30);
      const textContent = await extractTextFromFile(file);

      // 2. Upload raw file to Storage
      setUploadProgress(50);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (storageError) throw storageError;

      // 3. Insert metadata to DB
      setUploadProgress(70);
      const { data: docData, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: file.name,
          storage_path: filePath,
          mime_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 4. Call Edge Function to process/embed
      setUploadProgress(90);
      const { error: funcError } = await supabase.functions.invoke("process-document", {
        body: {
          documentId: docData.id,
          content: textContent,
          title: file.name,
        },
      });

      if (funcError) throw funcError;

      setUploadProgress(100);
      toast({
        title: t("knowledgeBase.uploadSuccess"),
        description: t("knowledgeBase.uploadSuccessDesc"),
      });
      fetchDocuments(); // Refresh list
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: t("knowledgeBase.uploadError"),
        description: error.message || t("knowledgeBase.uploadError"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (event.target) event.target.value = ""; // Reset input
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm(t("knowledgeBase.deleteConfirm"))) return;

    try {
      // 1. Delete from Storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([path]);

      if (storageError) console.warn("Storage delete warning:", storageError);

      // 2. Delete from DB (Cascade deletes sections)
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast({
        title: t("knowledgeBase.deleted"),
        description: t("knowledgeBase.deletedDesc"),
      });
      fetchDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: t("knowledgeBase.deleteError"),
        description: t("knowledgeBase.deleteErrorDesc"),
        variant: "destructive",
      });
    }
  };

  const startEditing = (doc: Document) => {
    setEditingId(doc.id);
    setEditTitle(doc.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveTitle = async (id: string) => {
    if (!editTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from("documents")
        .update({ title: editTitle.trim() })
        .eq("id", id);
      
      if (error) throw error;
      
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, title: editTitle.trim() } : d));
      toast({ title: t("knowledgeBase.updated"), description: t("knowledgeBase.updatedDesc") });
      setEditingId(null);
    } catch (error) {
      console.error("Update error:", error);
       toast({
        title: t("knowledgeBase.updateError"),
        description: t("knowledgeBase.updateErrorDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-comic">{t("knowledgeBase.title")}</h2>
          <p className="text-sm text-gray-500">{t("knowledgeBase.description")}</p>
        </div>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg border-2 border-dashed border-border">
        <label className="block mb-2 font-bold text-sm uppercase tracking-wide text-muted-foreground">{t("knowledgeBase.addDocument")}</label>
        
        <div className="group relative">
           <Input
            id="file-upload"
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-background border-2 border-dashed border-muted-foreground/20 rounded-lg group-hover:border-primary group-hover:bg-accent transition-all cursor-pointer">
            <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="font-bold text-sm truncate text-muted-foreground group-hover:text-primary">
              {isUploading ? t("knowledgeBase.uploading") : t("knowledgeBase.selectFile")}
            </span>
          </div>
        </div>

        {isUploading && (
          <div className="mt-3 space-y-1">
             <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>{t("knowledgeBase.processing")}</span>
                <span>{uploadProgress}%</span>
             </div>
             <Progress value={uploadProgress} className="h-2 w-full bg-secondary" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
             <div className="flex justify-center py-8">
               <Loader2 className="animate-spin w-8 h-8 text-primary" />
             </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-border">
            <p>{t("knowledgeBase.noDocuments")}</p>
            <p className="text-sm">{t("knowledgeBase.uploadToStart")}</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.id} 
              className="card group p-3 rounded-lg border bg-card text-card-foreground shadow-sm hover:translate-y-[-2px] transition-all duration-200 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  {editingId === doc.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-8 text-sm font-bold border-input focus-visible:ring-ring"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" onClick={() => saveTitle(doc.id)} className="h-8 w-8 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50 rounded-md">
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cancelEditing} className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-md">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-md border border-border shrink-0 text-primary">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm truncate" title={doc.title}>
                        {doc.title}
                      </h3>
                    </div>
                  )}
                </div>
                
                {editingId !== doc.id && (
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(doc)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                      title={t("knowledgeBase.rename")}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id, (doc as any).storage_path)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                      title={t("knowledgeBase.delete")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium border-t border-border pt-2 mt-2">
                <span>{new Date(doc.created_at).toLocaleDateString("vi-VN")}</span>
                <span className="bg-muted px-2 py-0.5 rounded-full border border-border">
                  {(doc.file_size / 1024).toFixed(0)} KB
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
