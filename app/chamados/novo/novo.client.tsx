"use client";

import Link from "next/link";
import { NovoChamadoForm, type ServicoOption } from "./novo-form";
import { ROUTES } from "@/lib/constants";

export function NovoChamadoClient({ servicos }: { servicos: ServicoOption[] }) {

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={ROUTES.CHAMADOS}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Voltar para serviços
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Solicitar Serviço</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Escolha o serviço, descreva a necessidade e acompanhe o atendimento por aqui.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <NovoChamadoForm servicos={servicos} />
      </div>
    </div>
  );
}
