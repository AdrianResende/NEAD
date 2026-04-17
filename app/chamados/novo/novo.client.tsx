"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Field, Form, Input, Select } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { abrirChamadoAction } from "./actions";
import { ROUTES } from "@/lib/constants";

type Servico = { id: number; nome: string; setor: string };

const PRIORIDADE_OPTIONS = [
  { value: "baixa", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export function NovoChamadoClient({ servicos }: { servicos: Servico[] }) {
  const [state, action, pending] = useActionState(abrirChamadoAction, {});

  const servicoOptions = servicos.map((s) => ({
    value: String(s.id),
    label: `${s.nome} — ${s.setor}`,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={ROUTES.CHAMADOS}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Voltar para chamados
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Abrir Chamado</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Descreva o que você precisa e nossa equipe entrará em contato.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {state.error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {state.error}
          </div>
        )}

        <Form action={action}>
          <Field label="Título" htmlFor="titulo" required>
            <Input
              id="titulo"
              name="titulo"
              placeholder="Ex: Computador não liga"
              maxLength={200}
            />
          </Field>

          <Field label="Serviço" htmlFor="servico_id" required>
            <Select
              id="servico_id"
              name="servico_id"
              options={servicoOptions}
              placeholder="Selecione o tipo de serviço"
            />
          </Field>

          <Field label="Prioridade" htmlFor="prioridade">
            <Select
              id="prioridade"
              name="prioridade"
              options={PRIORIDADE_OPTIONS}
              defaultValue="normal"
            />
          </Field>

          <Field label="Descrição" htmlFor="descricao" required>
            <Textarea
              id="descricao"
              name="descricao"
              rows={5}
              placeholder="Descreva detalhadamente o problema ou solicitação..."
            />
          </Field>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Enviando..." : "Abrir Chamado"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
