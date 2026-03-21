interface AvatarProps {
  name?: string | null;
  image?: string | null;
  size?: number;
}

export function Avatar({ name, image, size = 28 }: AvatarProps) {
  const initials = (name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User"}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--foreground)",
        color: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
