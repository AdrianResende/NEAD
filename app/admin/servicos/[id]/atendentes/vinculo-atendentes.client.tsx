"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Link2, Link2Off, Search } from "lucide-react";
import {
  Badge,
  Button,
  Field,
  Form,
  Input,
  Pagination,
  Table,
  TableBody,
  TableEmpty,
  TableHead,
  Td,
  Th,
  Tr,
} from "@/components/ui";
import { PAGINATION, ROUTES } from "@/lib/constants";
import { adicionarAtendenteAction, removerAtendenteAction } from "@/app/admin/servicos/actions";
import { notifyError, notifySuccess } from "@/lib/toast";

type Atendente = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
};

type Props = {
  servico: {
    id: number;
    nome: string;
    setor: { id: number; nome: string };
    vinculados: Atendente[];
  };
  atendentesDisponiveis: Atendente[];
};

export function VinculoAtendentesClient({ servico, atendentesDisponiveis }: Props) {
  const router = useRouter();
  const [filtroVinculados, setFiltroVinculados] = useState("");
  const [filtroDisponiveis, setFiltroDisponiveis] = useState("");
  const [paginaVinculados, setPaginaVinculados] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const [paginaDisponiveis, setPaginaDisponiveis] = useState<number>(PAGINATION.DEFAULT_PAGE);

  const [addState, addAction, adding] = useActionState(adicionarAtendenteAction, {});
  const [removeState, removeAction, removing] = useActionState(removerAtendenteAction, {});

  useEffect(() => {
    if (addState.success || removeState.success) {
      router.refresh();
    }
  }, [addState.success, removeState.success, router]);

  useEffect(() => {
    if (addState.success) notifySuccess("Atendente vinculado com sucesso.");
    if (addState.error) notifyError(addState.error);
  }, [addState.error, addState.success]);

  useEffect(() => {
    if (removeState.success) notifySuccess("Atendente removido com sucesso.");
    if (removeState.error) notifyError(removeState.error);
  }, [removeState.error, removeState.success]);

  const idsVinculados = useMemo(() => new Set(servico.vinculados.map((item) => item.id)), [servico.vinculados]);

  const vinculadosFiltrados = useMemo(() => {
    const termo = filtroVinculados.trim().toLowerCase();
    return servico.vinculados.filter((atendente) => {
      if (!termo) return true;
      return (
        atendente.nome.toLowerCase().includes(termo) ||
        atendente.email.toLowerCase().includes(termo)
      );
    });
  }, [filtroVinculados, servico.vinculados]);

  const disponiveisFiltrados = useMemo(() => {
    const termo = filtroDisponiveis.trim().toLowerCase();
    return atendentesDisponiveis.filter((atendente) => {
      if (idsVinculados.has(atendente.id)) return false;
      if (!atendente.ativo) return false;
      if (!termo) return true;
      return (
        atendente.nome.toLowerCase().includes(termo) ||
        atendente.email.toLowerCase().includes(termo)
      );
    });
  }, [atendentesDisponiveis, filtroDisponiveis, idsVinculados]);

  const totalPaginasVinculados = Math.max(1, Math.ceil(vinculadosFiltrados.length / PAGINATION.DEFAULT_PER_PAGE));
  const totalPaginasDisponiveis = Math.max(1, Math.ceil(disponiveisFiltrados.length / PAGINATION.DEFAULT_PER_PAGE));

  const paginaVinculadosNormalizada = Math.min(paginaVinculados, totalPaginasVinculados);
  const paginaDisponiveisNormalizada = Math.min(paginaDisponiveis, totalPaginasDisponiveis);

  const vinculadosPaginados = useMemo(() => {
    const start = (paginaVinculadosNormalizada - 1) * PAGINATION.DEFAULT_PER_PAGE;
    return vinculadosFiltrados.slice(start, start + PAGINATION.DEFAULT_PER_PAGE);
  }, [paginaVinculadosNormalizada, vinculadosFiltrados]);

  const disponiveisPaginados = useMemo(() => {
    const start = (paginaDisponiveisNormalizada - 1) * PAGINATION.DEFAULT_PER_PAGE;
    return disponiveisFiltrados.slice(start, start + PAGINATION.DEFAULT_PER_PAGE);
  }, [disponiveisFiltrados, paginaDisponiveisNormalizada]);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-zinc-100/60 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-900 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Vincular Atendentes</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Serviço: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{servico.nome}</span> · Setor {servico.setor.nome}
            </p>
          </div>
          <Link href={`${ROUTES.SETORES}/${servico.setor.id}/servicos`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar para serviços
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Atendentes vinculados</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Remova quem não deve mais atender este serviço.</p>
            </div>
            <Badge variant="info">{servico.vinculados.length}</Badge>
          </div>

          <Field label="Filtro" htmlFor="filtro-vinculados">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="filtro-vinculados"
                value={filtroVinculados}
                onChange={(event) => {
                  setFiltroVinculados(event.target.value);
                  setPaginaVinculados(PAGINATION.DEFAULT_PAGE);
                }}
                placeholder="Buscar por nome ou e-mail"
                className="pl-9"
              />
            </div>
          </Field>

          <div className="mt-2">

          <Table>
            <TableHead>
              <tr>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th className="text-center">Status</Th>
                <Th className="text-right">Ação</Th>
              </tr>
            </TableHead>
            <TableBody>
              {vinculadosPaginados.length === 0 ? (
                <TableEmpty colSpan={4} message="Nenhum atendente vinculado para este filtro." />
              ) : (
                vinculadosPaginados.map((atendente) => (
                  <Tr key={atendente.id}>
                    <Td className="font-medium">{atendente.nome}</Td>
                    <Td className="text-zinc-500 dark:text-zinc-400">{atendente.email}</Td>
                    <Td className="text-center">
                      <Badge variant={atendente.ativo ? "success" : "warning"}>
                        {atendente.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </Td>
                    <Td className="text-right">
                      <Form action={removeAction}>
                        <input type="hidden" name="servico_id" value={servico.id} />
                        <input type="hidden" name="user_id" value={atendente.id} />
                        <Button type="submit" size="sm" variant="outline" loading={removing}>
                          <Link2Off className="h-4 w-4" aria-hidden="true" />
                          Remover
                        </Button>
                      </Form>
                    </Td>
                  </Tr>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          <Pagination
            page={paginaVinculadosNormalizada}
            totalPages={totalPaginasVinculados}
            totalItems={vinculadosFiltrados.length}
            perPage={PAGINATION.DEFAULT_PER_PAGE}
            onPageChange={setPaginaVinculados}
            label="atendentes vinculados"
          />
        </section>

        <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Atendentes disponíveis</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Somente atendentes ativos e ainda não vinculados.</p>
            </div>
            <Badge variant="default">{disponiveisFiltrados.length}</Badge>
          </div>

          <Field label="Filtro" htmlFor="filtro-disponiveis">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                id="filtro-disponiveis"
                value={filtroDisponiveis}
                onChange={(event) => {
                  setFiltroDisponiveis(event.target.value);
                  setPaginaDisponiveis(PAGINATION.DEFAULT_PAGE);
                }}
                placeholder="Buscar por nome ou e-mail"
                className="pl-9"
              />
            </div>
          </Field>

        <div className="mt-2">
          <Table>
            <TableHead>
              <tr>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th className="text-right">Ação</Th>
              </tr>
            </TableHead>
            <TableBody>
              {disponiveisPaginados.length === 0 ? (
                <TableEmpty colSpan={3} message="Nenhum atendente disponível para este filtro." />
              ) : (
                disponiveisPaginados.map((atendente) => (
                  <Tr key={atendente.id}>
                    <Td className="font-medium">{atendente.nome}</Td>
                    <Td className="text-zinc-500 dark:text-zinc-400">{atendente.email}</Td>
                    <Td className="text-right">
                      <Form action={addAction}>
                        <input type="hidden" name="servico_id" value={servico.id} />
                        <input type="hidden" name="user_id" value={atendente.id} />
                        <Button type="submit" size="sm" loading={adding}>
                          <Link2 className="h-4 w-4" aria-hidden="true" />
                          Vincular
                        </Button>
                      </Form>
                    </Td>
                  </Tr>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          <Pagination
            page={paginaDisponiveisNormalizada}
            totalPages={totalPaginasDisponiveis}
            totalItems={disponiveisFiltrados.length}
            perPage={PAGINATION.DEFAULT_PER_PAGE}
            onPageChange={setPaginaDisponiveis}
            label="atendentes disponíveis"
          />
        </section>
      </div>
    </div>
  );
}
