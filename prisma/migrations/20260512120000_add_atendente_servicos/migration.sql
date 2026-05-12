-- CreateTable
CREATE TABLE "atendente_servicos" (
    "user_id" INTEGER NOT NULL,
    "servico_id" INTEGER NOT NULL,

    CONSTRAINT "atendente_servicos_pkey" PRIMARY KEY ("user_id", "servico_id")
);

-- AddForeignKey
ALTER TABLE "atendente_servicos" ADD CONSTRAINT "atendente_servicos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendente_servicos" ADD CONSTRAINT "atendente_servicos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
