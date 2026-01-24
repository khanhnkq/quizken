import { useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/lib/auth";

export function ThemeManager() {
  const { user } = useAuth();
  const { profileData } = useProfile(user?.id);

  useEffect(() => {
    // List of all known theme classes to clean up
    const themeClasses = ["theme-neon", "theme-pastel", "theme-comic", "theme-vn", "theme-jjk"];
    
    // Remove all theme classes first
    document.documentElement.classList.remove(...themeClasses);

    // If user has a theme equipped, add it
    if (profileData?.equipped_theme) {
       // Retrieve the class from metadata (ideally) or just assume the ID maps to class?
       // In my seed data: metadata: {"css_class": "theme-neon"}
       // But wait, the profile only stores `equipped_theme` which is the ID (e.g. 'theme_neon_night').
       // I need to map ID -> CSS Class.
       // Option 1: Store CSS Class in profile (easier).
       // Option 2: Hardcode mapping here.
       // Option 3: Fetch item details? No, too slow.
       
       // Let's assume for this MVP that the ID contains the class or I map it casually.
       // My seed IDs: 'theme_neon_night', 'theme_pastel_dream'.
       // My CSS classes: 'theme-neon', 'theme-pastel'.
       
       let themeClass = "";
       let isDarkTheme = false; // Default tracking

       if (profileData.equipped_theme === "theme_neon_night") {
           themeClass = "theme-neon";
           isDarkTheme = true;
       }
       else if (profileData.equipped_theme === "theme_pastel_dream") {
           themeClass = "theme-pastel";
           isDarkTheme = false;
       }
       else if (profileData.equipped_theme === "theme_comic_manga") {
           themeClass = "theme-comic";
           isDarkTheme = false; // Comic is essentially light mode with heavy contrast
       }
       else if (profileData.equipped_theme === "theme_vietnam_spirit") {
           themeClass = "theme-vn";
           isDarkTheme = false; 
       }
       else if (profileData.equipped_theme === "theme_jujutsu_kaisen") {
           themeClass = "theme-jjk";
           isDarkTheme = true;
       }
       
       if (themeClass) {
           document.documentElement.classList.add(themeClass);
           
           // Force Dark/Light mode to match the theme's nature
           // This requires coordinating with the existing ThemeProvider
           // We'll manually override the class for now.
           if (isDarkTheme) {
               document.documentElement.classList.add("dark");
               document.documentElement.classList.remove("light");
           } else {
               document.documentElement.classList.remove("dark");
               document.documentElement.classList.add("light");
           }
       }
    }
  }, [profileData?.equipped_theme]);

  return null; // This component renders nothing
}
