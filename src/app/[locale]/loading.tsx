export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}
