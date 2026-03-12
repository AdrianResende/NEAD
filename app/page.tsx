import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <section className="mx-auto max-w-3xl space-y-8 text-center">
        <span className="inline-block rounded-full border border-[#f5c6c6] bg-primary-light px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary dark:border-[#5a1010] dark:bg-[#2a0808] dark:text-[#f87171]">
          Plataforma EAD
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Aprenda no seu{" "}
          <span className="text-primary dark:text-[#f87171]">próprio ritmo</span>
        </h1>

        <p className="mx-auto max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
          O NEAD oferece cursos online de qualidade para quem busca crescimento
          profissional e acadêmico com flexibilidade.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={ROUTES.COURSES}>
            <Button size="lg">Explorar cursos</Button>
          </Link>
          <Link href={ROUTES.LOGIN}>
            <Button size="lg" variant="outline">
              Fazer login
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
