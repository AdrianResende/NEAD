"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { Button, Field, Form, Input, Select } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { abrirChamadoAction } from "./actions";

export type ServicoOption = {
  id: number;
  nome: string;
  setor: string;
  setor_id: number;
};

const PRIORIDADE_OPTIONS = [
  { value: "baixa", label: "Baixa" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export function NovoChamadoForm({ servicos }: { servicos: ServicoOption[] }) {
  const [state, action, pending] = useActionState(abrirChamadoAction, {});
  const [setorSelecionado, setSetorSelecionado] = useState<string>("");

  const setorOptions = useMemo(
    () =>
      Array.from(new Map(servicos.map((s) => [s.setor_id, s.setor])).entries())
        .map(([id, nome]) => ({ value: String(id), label: nome }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [servicos],
  );

  const servicoOptions = useMemo(
    () =>
      servicos
        .filter((s) => (setorSelecionado ? String(s.setor_id) === setorSelecionado : false))
        .map((s) => ({ value: String(s.id), label: s.nome })),
    [servicos, setorSelecionado],
  );

  return (
    <>
      {state.error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {state.error}
        </div>
      )}

      <Form action={action}>
        <Field label="Setor" htmlFor="setor_id" required>
          <Select
            id="setor_id"
            name="setor_id"
            options={setorOptions}
            placeholder="Selecione o setor"
            onChange={(event) => setSetorSelecionado(event.target.value)}
            value={setorSelecionado}
          />
        </Field>

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
            placeholder={
              setorSelecionado
                ? "Selecione o tipo de serviço"
                : "Selecione primeiro o setor"
            }
            disabled={!setorSelecionado}
            key={setorSelecionado || "sem-setor"}
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
          {pending ? "Enviando..." : "Solicitar Serviço"}
        </Button>
      </Form>
    </>
  );
}
