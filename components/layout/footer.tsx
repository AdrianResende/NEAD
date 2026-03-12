import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const footerLinks = [
  {
    title: "Plataforma",
    links: [
      { href: "/cursos", label: "Cursos" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contato", label: "Contato" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacidade", label: "Privacidade" },
      { href: "/termos", label: "Termos de Uso" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {APP_NAME}
            </span>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Núcleo de Educação a Distância
            </p>
          </div>

          {/* Links */}
          {footerLinks.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {title}
              </h3>
              <ul className="mt-4 space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            &copy; {year} {APP_NAME}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
