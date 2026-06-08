import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const formasPagamento = ["Dinheiro", "Pix", "Cartão de Débito", "Cartão de Crédito"];
  for (const nome of formasPagamento) {
    await prisma.formaPagamento.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  await prisma.usuario.upsert({
    where: { login: "admin" },
    update: {},
    create: {
      nome: "Administrador",
      login: "admin",
      senha: hashSync("admin123", 10),
    },
  });

  console.log("Seed concluído: formas de pagamento e usuário admin (login: admin / senha: admin123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
