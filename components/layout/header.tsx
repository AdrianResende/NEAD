import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import logo from "@/app/assets/logo.png";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Image
          src={logo}
          alt="Logo do NEAD"
          width={180}
          height={90}
          className="h-10 w-auto object-contain"
        />

        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.LOGIN}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
