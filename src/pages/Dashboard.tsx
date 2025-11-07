import { useState, useEffect } from "react";
import { PersonalDashboard } from "@/components/dashboard/PersonalDashboard";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogInIcon, UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
        } else {
          // Redirect to home if not authenticated
          navigate("/");
        }
      } catch (error) {
        console.error("Error getting user:", error);
        // Redirect to home on error
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B5CC89]"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto p-8 border-2 border-[#B5CC89]/30 rounded-2xl bg-white/50 backdrop-blur-sm">
          <div className="inline-flex p-4 bg-[#B5CC89]/20 rounded-2xl mb-4">
            <UserIcon className="h-16 w-16 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-muted-foreground mb-6">
            Bạn cần đăng nhập để xem dashboard cá nhân.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-[#B5CC89] hover:bg-black hover:text-white text-black font-semibold transition-colors">
            <LogInIcon className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <PersonalDashboard userId={userId} />
    </div>
  );
}
