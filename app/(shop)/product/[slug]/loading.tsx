export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-white px-4 py-8 sm:px-6">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-xl bg-zinc-100" />
        <div className="flex flex-col gap-3">
          <div className="h-7 w-3/4 animate-pulse rounded bg-zinc-100" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-100" />
          <div className="h-6 w-1/4 animate-pulse rounded bg-zinc-100" />
          <div className="h-12 w-full animate-pulse rounded-full bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
