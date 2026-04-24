/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HEALTH_ANALYSIS_URL: string
  readonly VITE_GRAPH_ANALYSIS_URL: string
  readonly VITE_CHRONIC_ANALYSIS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
