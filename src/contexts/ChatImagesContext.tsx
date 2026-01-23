import React, { createContext, useContext, useEffect, useState } from "react";
import { CHAT_BACKGROUND_URLS as LOCAL_IMAGES } from "@/lib/chatImages";

interface ChatImagesContextType {
  images: string[];
  isLoading: boolean;
  source: "local" | "cloudinary";
}

const ChatImagesContext = createContext<ChatImagesContextType>({
  images: LOCAL_IMAGES,
  isLoading: false,
  source: "local",
});

export const useChatImages = () => useContext(ChatImagesContext);

export const ChatImagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [images, setImages] = useState<string[]>(LOCAL_IMAGES);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<"local" | "cloudinary">("local");

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const tag = "chat_bg";

  useEffect(() => {
    const fetchCloudinaryImages = async () => {
      if (!cloudName) {
        console.log("Cloudinary Cloud Name not found, using local images.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch resource list (requires Resource List enabled in Cloudinary Security settings)
        // URL format: https://res.cloudinary.com/<cloud_name>/image/list/<tag>.json
        const response = await fetch(
          `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Cloudinary resource list (Check if Resource List is enabled in Settings)");
        }

        const data = await response.json();
        
        // Map resources to full URLs
        // Data format: { resources: [ { public_id, version, format, ... } ] }
        const cloudinaryUrls = data.resources.map((res: any) => {
          return `https://res.cloudinary.com/${cloudName}/image/upload/v${res.version}/${res.public_id}.${res.format}`;
        });

        if (cloudinaryUrls.length > 0) {
          // Sort to promote consistency (optional, by created_at or public_id)
          // Simple sort by public_id
          cloudinaryUrls.sort();
          setImages(cloudinaryUrls);
          setSource("cloudinary");
          console.log(`Loaded ${cloudinaryUrls.length} images from Cloudinary.`);
        } else {
            console.log("Cloudinary list empty, using local.");
        }
      } catch (error) {
        console.warn("Error loading Cloudinary images, falling back to local:", error);
        // Fallback is already set to LOCAL_IMAGES
      } finally {
        setIsLoading(false);
      }
    };

    fetchCloudinaryImages();
  }, [cloudName]);

  return (
    <ChatImagesContext.Provider value={{ images, isLoading, source }}>
      {children}
    </ChatImagesContext.Provider>
  );
};
