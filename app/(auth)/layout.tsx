// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Remove items-center, justify-center, and max-w-md
    // Use bg-[#020202] to match the login page theme
    <div className="min-h-screen w-full bg-[#020202]">{children}</div>
  );
}
