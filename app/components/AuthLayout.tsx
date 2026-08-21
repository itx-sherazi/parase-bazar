import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-100 px-4 py-8 md:bg-white md:px-0 md:py-0">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:min-h-screen md:max-w-none md:flex-row md:rounded-none md:shadow-none">
        <div className="flex w-full items-center justify-center p-6 sm:p-10 md:w-2/5">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <div className="relative hidden overflow-hidden md:block md:w-3/5">
          <Image
            src="/authanticate-image.png"
            alt="ParasBazar — everything you need, all in one marketplace"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
