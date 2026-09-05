# KALEIDO — Edición personal

Esta rama está preparada como edición de uso personal de KALEIDO.

## Web

La aplicación web usa Vite y es instalable como PWA desde un navegador compatible. El objetivo es usarla en tu propio ordenador y mantener el proyecto fuera de una distribución pública.

## Android

GitHub Actions construye un APK de depuración instalable directamente en un dispositivo Android. No requiere Google Play.

## iPhone / iPad

GitHub Actions prepara la aplicación iOS y un paquete IPA sin firma. Para un IPA instalable en un dispositivo real, Apple exige una identidad y perfil de firma pertenecientes a la creadora.

## Importante

El repositorio original es público. Por tanto, cualquier URL de GitHub Pages sería pública aunque la aplicación incluya `noindex`. Para uso realmente privado, sirve `dist/` en un ordenador, una red local privada o un proveedor con autenticación.
