-- Add video_url column to items table for Video Themes
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN public.items.video_url IS 'URL to video file (Cloudinary/S3) for Theme previews or backgrounds';
