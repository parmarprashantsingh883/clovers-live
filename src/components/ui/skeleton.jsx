export default function Skeleton({
  type = "text",
  width,
  height,
  animation = "shimmer",
  className = "",
}) {
  const style = { width, height };

  return (
    <div
      className={`skl skl--${type} skl--${animation} ${className}`}
      style={style}
    />
  );
}
