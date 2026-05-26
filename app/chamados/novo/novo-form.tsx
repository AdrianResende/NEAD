"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { abrirChamadoAction } from "./actions";
import { ROUTES } from "@/lib/constants";
import { notifyError, notifySuccess } from "@/lib/toast";

export type ServicoOption = {
  id: number;
  nome: string;
  setor: string;
  setor_id: number;
};

export function NovoChamadoForm({ servicos }: { servicos: ServicoOption[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(abrirChamadoAction, {});
  const [urgente, setUrgente] = useState<string>("nao");
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<string>("");
  const [filtroServico, setFiltroServico] = useState<string>("");
  const anexosInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success) {
      notifySuccess("Chamado criado com sucesso!");
      setTimeout(() => {
        router.push(`${ROUTES.CHAMADOS}/${state.chamadoId}`);
      }, 1500);
    }
  }, [state.success, state.chamadoId, router]);

  useEffect(() => {
    if (state.error) {
      notifyError(state.error);
    }
  }, [state.error]);

  const servicoOptions = useMemo(
    () =>
      [...servicos]
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        .map((s) => ({ value: String(s.id), label: `${s.nome} · ${s.setor}` })),
    [servicos],
  );

  const servicoOptionsFiltrados = useMemo(() => {
    const termo = filtroServico.trim().toLowerCase();
    if (!termo) {
      return servicoOptions;
    }

    return servicoOptions.filter((s) => s.label.toLowerCase().includes(termo));
  }, [filtroServico, servicoOptions]);

  const servicoSelecionadoLabel = useMemo(
    () => servicoOptions.find((s) => s.value === servicoSelecionado)?.label,
    [servicoOptions, servicoSelecionado],
  );

  function handleSelecionarArquivos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setArquivosSelecionados(files);
  }

  function handleRemoverArquivo(index: number) {
    if (!anexosInputRef.current) return;

    const proximosArquivos = arquivosSelecionados.filter((_, fileIndex) => fileIndex !== index);
    const dataTransfer = new DataTransfer();

    for (const arquivo of proximosArquivos) {
      dataTransfer.items.add(arquivo);
    }

    anexosInputRef.current.files = dataTransfer.files;
    setArquivosSelecionados(proximosArquivos);
  }

  return (
    <>
      <form action={action}>
        <Field label="Serviço" htmlFor="servico_id" required>
          <Input
            id="filtro_servico"
            type="text"
            placeholder="Filtrar serviço por nome"
            value={filtroServico}
            onChange={(event) => setFiltroServico(event.target.value)}
            className="mb-2"
          />

          <Select
            id="servico_id"
            name="servico_id"
            options={servicoOptionsFiltrados}
            placeholder="Selecione um serviço"
            value={servicoSelecionado}
            onChange={(event) => setServicoSelecionado(event.target.value)}
            required
          />

          {servicoOptionsFiltrados.length === 0 && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Nenhum serviço encontrado para o filtro informado.
            </p>
          )}

          {servicoSelecionadoLabel && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Serviço selecionado: <span className="font-medium text-zinc-700 dark:text-zinc-200">{servicoSelecionadoLabel}</span>
            </p>
          )}
        </Field>

        <Field label="Título" htmlFor="titulo" required>
          <Input
            id="titulo"
            name="titulo"
            placeholder="Ex: Computador não liga"
            maxLength={200}
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

        <Field label="Prioridade" htmlFor="urgente" required>
          <Select
            id="urgente"
            name="urgente"
            options={[
              { value: "nao", label: "Não urgente" },
              { value: "sim", label: "Urgente" },
            ]}
            value={urgente}
            onChange={(event) => setUrgente(event.target.value)}
          />
        </Field>

        {urgente === "sim" && (
          <Field label="Por que é urgente?" htmlFor="urgencia_descricao" required>
            <Textarea
              id="urgencia_descricao"
              name="urgencia_descricao"
              rows={3}
              maxLength={800}
              required
              placeholder="Descreva o impacto e o motivo da urgência..."
            />
          </Field>
        )}

        <Field
          label="Anexos"
          htmlFor="anexos"
          hint="Aceita imagens (PNG, JPG, WEBP) e PDF. Máximo de 5 arquivos com até 5MB cada."
        >
          <input
            id="anexos"
            ref={anexosInputRef}
            name="anexos"
            type="file"
            multiple
            onChange={handleSelecionarArquivos}
            accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
            className="sr-only"
          />

          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => anexosInputRef.current?.click()}
              className="w-full justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M8.47 3.22a3.75 3.75 0 0 1 5.3 5.3l-5.9 5.91a2.25 2.25 0 0 1-3.18-3.18l5.2-5.2a.75.75 0 1 1 1.06 1.06l-5.2 5.2a.75.75 0 1 0 1.06 1.06l5.9-5.9a2.25 2.25 0 0 0-3.18-3.19l-5.9 5.9a3.75 3.75 0 0 0 5.3 5.3l4.84-4.83a.75.75 0 0 1 1.06 1.06L9 17.54a5.25 5.25 0 0 1-7.42-7.42l5.9-5.9Z" />
              </svg>
              <span>Selecionar arquivos</span>
            </Button>

            {arquivosSelecionados.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {arquivosSelecionados.map((arquivo, index) => (
                  <div
                    key={`${arquivo.name}-${arquivo.size}-${index}`}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    <span className="max-w-[180px] truncate" title={arquivo.name}>{arquivo.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoverArquivo(index)}
                      className="rounded-full p-0.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                      aria-label={`Remover ${arquivo.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Button type="submit" disabled={pending || !servicoSelecionado} className="w-full">
          {pending ? "Enviando..." : "Solicitar Chamado"}
        </Button>
      </form>
    </>
  );
}

