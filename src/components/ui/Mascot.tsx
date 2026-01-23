import React from "react";

// Định nghĩa các loại cảm xúc dựa trên tên file bạn sẽ đặt
export type MascotEmotion =
  | "happy"
  | "sad"
  | "confused"
  | "celebrate"
  | "thinking"
  | "wave"
  | "angry"
  | "cool"
  | "amazed"
  | "party"
  | "neutral";

interface MascotProps {
  emotion?: MascotEmotion;
  size?: number;
  className?: string;
  alt?: string;
}

const Mascot: React.FC<MascotProps> = ({
  emotion = "neutral",
  size = 40,
  className = "",
  alt,
}) => {
  // Đường dẫn tới thư mục public
  const imagePath = `/images/mascot/${emotion}.png`;

  return (
    <img
      src={imagePath}
      alt={alt || `Mascot ${emotion}`}
      width={size}
      height={size}
      className={`inline-block object-contain transition-transform hover:scale-110 ${className}`}
      // Xử lý khi ảnh chưa tồn tại hoặc lỗi -> hiện ảnh placeholder hoặc ẩn
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none"; // Ẩn nếu không tìm thấy ảnh
        console.warn(`Mascot image not found: ${imagePath}`);
      }}
    />
  );
};

export default Mascot;
