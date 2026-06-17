"use client";

import { useMemo, useState } from "react";

type ServicoOption = { value: string; label: string; setor_id: number };

/**
 * Encapsula o estado e a lógica de seleção de setores e serviços vinculados.
 * Elimina duplicação entre os formulários de criação e edição de usuários.
 */
export function useSetorServico(servicoOptions: ServicoOption[]) {
  const [setorIds, setSetorIds] = useState<string[]>([]);
  const [servicoIds, setServicoIds] = useState<string[]>([]);

  const filteredServicoOptions = useMemo(() => {
    if (setorIds.length === 0) return [];
    const setorSet = new Set(setorIds.map((id) => Number(id)));
    return servicoOptions.filter((s) => setorSet.has(s.setor_id));
  }, [setorIds, servicoOptions]);

  function handleSetorToggle(value: string, checked: boolean) {
    setSetorIds((prev) => {
      const next = checked
        ? prev.includes(value) ? prev : [...prev, value]
        : prev.filter((id) => id !== value);

      // Remove serviços que não pertencem mais aos setores selecionados
      const allowedSetores = new Set(next.map((id) => Number(id)));
      const allowedServicos = new Set(
        servicoOptions.filter((s) => allowedSetores.has(s.setor_id)).map((s) => s.value),
      );
      setServicoIds((prev) => prev.filter((id) => allowedServicos.has(id)));

      return next;
    });
  }

  function toggleServico(value: string, checked: boolean) {
    setServicoIds((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((id) => id !== value),
    );
  }

  function reset() {
    setSetorIds([]);
    setServicoIds([]);
  }

  function init(initialSetorIds: string[], initialServicoIds: string[]) {
    setSetorIds(initialSetorIds);
    setServicoIds(initialServicoIds);
  }

  return { setorIds, servicoIds, filteredServicoOptions, handleSetorToggle, toggleServico, reset, init };
}
