import { 
  Users, 
  Crown, 
  Flame, 
  Star, 
  Gift, 
  Megaphone,
  Hash,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTopUsers } from "@/hooks/useTopUsers";
import { useAnnouncements } from "@/hooks/useAnnouncements";

const chatRooms = [
  { id: "general", name: "Phòng Chat Chung", icon: Hash, isActive: true },
  { id: "quiz", name: "Thảo luận Quiz", icon: Megaphone, isActive: false },
  { id: "help", name: "Hỏi đáp", icon: Star, isActive: false },
];

interface ChatSidebarProps {
  onBack?: () => void;
}

export function ChatSidebar({ onBack }: ChatSidebarProps) {
  const { users: topUsers, isLoading: isLoadingTopUsers } = useTopUsers(20);
  const { announcements, isLoading: isLoadingAnnouncements } = useAnnouncements();

  return (
    <div className="w-80 h-full bg-background border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2 mr-1"
              onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Cộng đồng
          </h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {/* Chat Rooms */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Phòng chat
            </h3>
            <div className="space-y-1">
              {chatRooms.map((room) => (
                <button
                  key={room.id}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    room.isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  <room.icon className="h-4 w-4" />
                  {room.name}
                </button>
              ))}
            </div>
          </div>

          {/* Top Users Leaderboard */}
          <div className="relative">
            <h3 className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 py-2 flex items-center gap-1">
              <Crown className="h-3 w-3 text-yellow-500" />
              Top người chơi
            </h3>
            {isLoadingTopUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : topUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {topUsers.map((user, index) => (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 && "bg-yellow-100 text-yellow-700",
                      index === 1 && "bg-gray-100 text-gray-600",
                      index === 2 && "bg-orange-100 text-orange-700",
                      index > 2 && "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                    <Avatar className="h-7 w-7">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {user.display_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Lv.{user.user_level} • {user.total_xp} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="relative">
            <h3 className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 py-2 flex items-center gap-1">
              <Megaphone className="h-3 w-3 text-primary" />
              Thông báo
            </h3>
            {isLoadingAnnouncements ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2">Không có thông báo mới</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      item.type === 'event' 
                        ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100" 
                        : "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10"
                    )}
                  >
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Streak */}
          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-orange-700">Streak: 5 ngày</span>
            </div>
            <p className="text-xs text-orange-600">
              Đăng nhập hàng ngày để nhận thêm phần thưởng!
            </p>
          </div>

          {/* Daily Gift */}
          <button className="w-full p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:from-purple-100 hover:to-pink-100 transition-colors">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-500" />
              <span className="font-semibold text-purple-700">Nhận quà hàng ngày</span>
            </div>
            <p className="text-xs text-purple-600 mt-1 text-left">
              Click để mở hộp quà bí ẩn!
            </p>
          </button>
        </div>
      </ScrollArea>
    </div>
  );
}
