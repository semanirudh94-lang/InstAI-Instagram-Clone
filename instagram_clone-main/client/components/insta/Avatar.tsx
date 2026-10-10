"use client";

interface AvatarProps {
  src?: string;
  name?: string;
  className?: string;
}

// Accounts created before a picture was uploaded have an empty profilePicture,
// which used to render the browser's broken-image icon.
export default function Avatar({ src, name = "", className = "" }: AvatarProps) {
  if (src) {
    return (
      <img src={src} alt={name} className={`w-full h-full object-cover ${className}`} />
    );
  }
  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-ig-border text-ig-text font-semibold ${className}`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}
