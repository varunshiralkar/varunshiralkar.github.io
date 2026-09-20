type GrapheneMarkProps = {
  className?: string;
};

/** Minimal fused-hex lattice (graphene). Stroke uses currentColor. */
export default function GrapheneMark({ className }: GrapheneMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4.5 8.5 8 6.5l3.5 2v4L8 14.5 4.5 12.5Z" />
      <path d="M11.5 8.5 15 6.5l3.5 2v4L15 14.5l-3.5-2Z" />
      <path d="M11.5 12.5 15 14.5v4L11.5 20.5 8 18.5v-4Z" />
    </svg>
  );
}
