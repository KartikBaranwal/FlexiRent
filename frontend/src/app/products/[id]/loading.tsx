export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="rounded-[2.5rem] bg-slate-100 aspect-square w-full" />
        <div className="py-6 space-y-6">
          <div className="h-10 bg-slate-100 rounded-xl w-3/4" />
          <div className="h-6 bg-slate-50 rounded-lg w-1/4" />
          <div className="h-32 bg-slate-50 rounded-2xl w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-14 bg-slate-100 rounded-2xl w-full" />
            <div className="h-14 bg-slate-100 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
