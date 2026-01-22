import { useState } from "react";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ChatRoom } from "@/components/chat";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { SeoMeta } from "@/components/SeoMeta";

export default function ChatPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <SeoMeta
        title="Phòng Chat Chung | QuizKen"
        description="Trao đổi và trò chuyện với cộng đồng QuizKen"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Chat</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container with Sidebar */}
        <main className="h-[calc(100vh-65px)] flex">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block">
            <ChatSidebar />
          </div>
          
          {/* Chat Room - Full width */}
          <div className="flex-1">
            <ChatRoom onLoginClick={() => setShowAuthModal(true)} />
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
      />
    </>
  );
}
