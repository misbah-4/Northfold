/**
 * ImageSlot — styled placeholder that mirrors the original <image-slot> behaviour.
 * Drop in a real <img> later by replacing the inner content.
 */
export default function ImageSlot({ label = '', dark = false, style = {} }) {
  return (
    <div
      className={`img-slot${dark ? ' img-slot--dark' : ''}`}
      style={style}
      aria-label={label}
    >
      <span>{label || 'Image'}</span>
    </div>
  );
}
