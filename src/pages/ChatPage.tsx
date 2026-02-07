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
  const [activeRoomId, setActiveRoomId] = useState("general");

  return (
    <>
      <SeoMeta
        title="Phòng Chat Chung | QuizKen"
        description="Trao đổi và trò chuyện với cộng đồng QuizKen"
      />

      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <ChatSidebar 
            onBack={() => window.history.back()} 
            selectedRoomId={activeRoomId}
            onRoomSelect={setActiveRoomId}
          />
        </div>

        {/* Chat Room - Full width */}
        <div className="flex-1 min-w-0">
          <ChatRoom 
            roomId={activeRoomId}
            onLoginClick={() => setShowAuthModal(true)} 
          />
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
