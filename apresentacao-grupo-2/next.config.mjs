/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // O site é HTML estático dentro de /public. No GitHub Pages ele é publicado
  // direto; aqui só espelhamos a mesma raiz para o preview.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
        { source: '/controle', destination: '/controle.html' },
      ],
    }
  },
}

export default nextConfig
