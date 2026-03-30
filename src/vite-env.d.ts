/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** 64 caractères hex = AES-256 ; doit correspondre à `CLIENT_PAYLOAD_AES_KEY` sur l’API. */
  readonly VITE_CLIENT_PAYLOAD_AES_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
