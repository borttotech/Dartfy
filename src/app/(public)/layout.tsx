export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ambient min-h-dvh">
      <div className="mx-auto min-h-dvh max-w-md px-5">{children}</div>
    </div>
  );
}
