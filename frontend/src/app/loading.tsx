export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-6" />
      <div className="space-y-3 w-full max-w-xs">
        <div className="h-4 bg-slate-50 rounded-full w-full animate-pulse" />
        <div className="h-4 bg-slate-50 rounded-full w-2/3 mx-auto animate-pulse" />
      </div>
    </div>
  );
}
