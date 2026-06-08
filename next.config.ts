import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Permite que outros computadores/celulares na mesma rede local acessem o servidor
  // de desenvolvimento (necessário para apresentar o sistema em outro PC durante o dev).
  // Em produção (npm run build && npm start) essa restrição não existe.
  allowedDevOrigins: ["192.168.100.207", "localhost", "127.0.0.1"],
};

export default nextConfig;
