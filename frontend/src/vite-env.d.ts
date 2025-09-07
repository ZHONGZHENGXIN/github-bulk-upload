/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_DEBUG?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_VERSION?: string
  readonly MODE: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}