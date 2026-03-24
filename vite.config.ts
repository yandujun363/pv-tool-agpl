export default defineConfig({
  base: process.env.GITHUB_REPOSITORY 
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : (process.env.VITE_BASE ?? '/'),
  plugins: [FullReload(['src/**/*'])],
})