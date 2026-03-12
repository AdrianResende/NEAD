import type { Metadata } from "next";
import {
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  Form,
  Field,
  FormSection,
  FormActions,
  Table,
  TableHead,
  TableBody,
  Th,
  Tr,
  Td,
  TableEmpty,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Componentes",
};

/* ------------------------------------------------------------------ */
/* Dados de exemplo para a tabela                                       */
/* ------------------------------------------------------------------ */
const courses = [
  {
    id: "1",
    title: "Introdução ao EAD",
    instructor: "Maria Silva",
    level: "Iniciante",
    status: "Publicado",
  },
  {
    id: "2",
    title: "Gestão de Projetos",
    instructor: "João Souza",
    level: "Intermediário",
    status: "Rascunho",
  },
  {
    id: "3",
    title: "Liderança Educacional",
    instructor: "Ana Lima",
    level: "Avançado",
    status: "Publicado",
  },
];

const statusVariant: Record<
  string,
  "success" | "default" | "warning" | "danger"
> = {
  Publicado: "success",
  Rascunho: "default",
  Arquivado: "warning",
  Removido: "danger",
};

/* ------------------------------------------------------------------ */
/* Seção visual                                                         */
/* ------------------------------------------------------------------ */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="border-b border-zinc-200 pb-2 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                               */
/* ------------------------------------------------------------------ */
export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-14 px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Design System — NEAD
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Referência visual dos componentes disponíveis.
        </p>
      </div>

      {/* ---- BOTÕES ---- */}
      <Section title="Botões">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Perigo</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeno</Button>
          <Button size="md">Médio</Button>
          <Button size="lg">Grande</Button>
          <Button loading>Carregando</Button>
          <Button disabled>Desabilitado</Button>
        </div>
      </Section>

      {/* ---- BADGES ---- */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Padrão</Badge>
          <Badge variant="success">Publicado</Badge>
          <Badge variant="warning">Pendente</Badge>
          <Badge variant="danger">Removido</Badge>
          <Badge variant="info">Informação</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      {/* ---- INPUTS ---- */}
      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" htmlFor="name" required>
            <Input id="name" placeholder="Ex.: João da Silva" />
          </Field>

          <Field
            label="E-mail"
            htmlFor="email"
            hint="Nunca compartilharemos seu e-mail."
          >
            <Input
              id="email"
              type="email"
              placeholder="joao@exemplo.com.br"
            />
          </Field>

          <Field label="Com erro" htmlFor="error-input" error="Campo obrigatório.">
            <Input id="error-input" placeholder="Inválido" error />
          </Field>

          <Field label="Desabilitado" htmlFor="disabled-input">
            <Input id="disabled-input" value="Somente leitura" disabled />
          </Field>
        </div>
      </Section>

      {/* ---- SELECT ---- */}
      <Section title="Select">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nível do curso" htmlFor="level">
            <Select
              id="level"
              placeholder="Selecione um nível"
              options={[
                { value: "beginner", label: "Iniciante" },
                { value: "intermediate", label: "Intermediário" },
                { value: "advanced", label: "Avançado" },
              ]}
            />
          </Field>

          <Field label="Status" htmlFor="status" error="Selecione um status.">
            <Select
              id="status"
              error
              placeholder="Selecione"
              options={[
                { value: "published", label: "Publicado" },
                { value: "draft", label: "Rascunho" },
              ]}
            />
          </Field>
        </div>
      </Section>

      {/* ---- TEXTAREA ---- */}
      <Section title="Textarea">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Descrição" htmlFor="desc" hint="Máximo de 500 caracteres.">
            <Textarea id="desc" placeholder="Descreva o curso..." />
          </Field>
          <Field label="Com erro" htmlFor="desc-err" error="Descrição obrigatória.">
            <Textarea id="desc-err" placeholder="Campo inválido" error />
          </Field>
        </div>
      </Section>

      {/* ---- FORMULÁRIO COMPLETO ---- */}
      <Section title="Formulário">
        <Form>
          <FormSection
            title="Dados do curso"
            description="Preencha as informações básicas do novo curso."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título" htmlFor="title" required>
                <Input id="title" placeholder="Nome do curso" />
              </Field>
              <Field label="Instrutor" htmlFor="instructor" required>
                <Input id="instructor" placeholder="Nome do instrutor" />
              </Field>
            </div>
            <Field label="Descrição" htmlFor="form-desc">
              <Textarea id="form-desc" placeholder="Descreva o objetivo do curso..." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nível" htmlFor="form-level">
                <Select
                  id="form-level"
                  placeholder="Selecione"
                  options={[
                    { value: "beginner", label: "Iniciante" },
                    { value: "intermediate", label: "Intermediário" },
                    { value: "advanced", label: "Avançado" },
                  ]}
                />
              </Field>
              <Field label="Status" htmlFor="form-status">
                <Select
                  id="form-status"
                  placeholder="Selecione"
                  options={[
                    { value: "published", label: "Publicado" },
                    { value: "draft", label: "Rascunho" },
                  ]}
                />
              </Field>
            </div>
          </FormSection>

          <FormActions>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
            <Button type="submit">Salvar curso</Button>
          </FormActions>
        </Form>
      </Section>

      {/* ---- TABELA ---- */}
      <Section title="Tabela">
        <Table>
          <TableHead>
            <Tr>
              <Th>#</Th>
              <Th>Título</Th>
              <Th>Instrutor</Th>
              <Th>Nível</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </Tr>
          </TableHead>
          <TableBody>
            {courses.length === 0 ? (
              <TableEmpty colSpan={6} />
            ) : (
              courses.map((course) => (
                <Tr key={course.id} clickable>
                  <Td muted>{course.id}</Td>
                  <Td>{course.title}</Td>
                  <Td muted>{course.instructor}</Td>
                  <Td muted>{course.level}</Td>
                  <Td>
                    <Badge variant={statusVariant[course.status] ?? "default"}>
                      {course.status}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                      <Button size="sm" variant="danger">
                        Excluir
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </TableBody>
        </Table>
      </Section>
    </div>
  );
}
