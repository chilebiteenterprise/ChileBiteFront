# Diagnóstico: vinculación y desvinculación de Google en Supabase Auth

## Contexto

En ChileBite usamos Supabase Auth para autenticación y una tabla `profile` para guardar los datos de negocio del usuario dentro de la app.

Es importante separar estos dos conceptos:

- `auth.users` y `user.identities` pertenecen a Supabase Auth.
- `profile` pertenece a la base de datos de ChileBite y solo guarda información del usuario para la aplicación.

El problema documentado aquí afecta a la **vinculación y desvinculación de cuentas de Google** desde la sección de Settings.

## Síntoma observado

Al intentar desvincular Google desde Settings, la app mostraba errores como:

- `MFA enroll is disabled for TOTP`
- `toast.error is not a function`
- `422 Unprocessable Content` al hacer `DELETE /auth/v1/user/identities/...`

Después de corregir los errores de interfaz, quedó claro que el problema real era de **estado de identidad en Supabase Auth**, no del frontend.

## Evidencia recolectada

Se añadió un diagnóstico visible en la UI de Cuentas vinculadas. El resultado fue:

- `Proveedor principal: google`
- `Identidades Supabase: google`
- `Email ausente`

Además, al inspeccionar el registro del usuario, se observó algo muy importante:

- existe `encrypted_password`
- existe `email`
- pero `raw_app_meta_data` sigue marcando solo:
  - `provider: "google"`
  - `providers: ["google"]`

Eso indica que el usuario **sí puede iniciar sesión con email y contraseña**, pero Supabase Auth **no está exponiendo una identidad `email`/`password` separada** dentro de `user.identities`.

## Qué significa esto

En Supabase, la operación de desvincular Google no depende del password guardado en `auth.users` ni del `profile`.

La operación depende de las **identidades Auth reales** del usuario.

Por eso:

- tener `encrypted_password` no garantiza que exista una identidad `email`
- tener un perfil en `profile` no crea una identidad Auth
- si Supabase solo ve `google` como identidad, `unlinkIdentity` puede fallar con `422`

## Cómo se detectó

Se agregaron mensajes de diagnóstico en la UI y se revisó el objeto del usuario.

El patrón fue consistente:

1. Login con Google funcionaba.
2. Login con email y contraseña también funcionaba en incógnito.
3. Al intentar desvincular Google, Supabase respondía con `422`.
4. La UI mostraba que solo existía la identidad `google`.

Esto nos lleva a una conclusión práctica:

> La cuenta tiene credenciales reutilizables para entrar, pero no necesariamente tiene una segunda identidad Auth enlazada que permita retirar Google de forma segura.

## Causa probable

La causa más probable es una combinación de estos factores:

- la cuenta se originó como cuenta Google-first
- posteriormente se habilitó o cambió el comportamiento de password
- Supabase guarda la contraseña, pero no necesariamente convierte eso en una identidad `email` separada para `user.identities`
- `unlinkIdentity` solo funciona si hay una identidad alternativa válida para no dejar la cuenta sin acceso

En otras palabras:

- el password existe
- el login funciona
- pero la cuenta sigue viéndose como `google-only` desde el punto de vista de identidad enlazada

## Qué ya se corrigió en la app

Se hicieron correcciones de UI y manejo de errores:

- se reemplazó el uso incorrecto de `toast.error` por `toast.danger`
- se agregó diagnóstico visible de identidades
- se evitó que la app crashee al fallar la desvinculación
- se mostró un mensaje más claro cuando Supabase rechaza el unlink

Esto mejora la experiencia, pero **no cambia la limitación estructural de la identidad**.

## Reproducción resumida

Si se necesita volver a validar el problema:

1. Iniciar sesión en Settings con la cuenta afectada.
2. Abrir `Cuentas vinculadas`.
3. Verificar que solo aparece Google como identidad.
4. Intentar desvincular Google.
5. Supabase responde con `422`.

## Limitación importante

No confundir:

- `profile` de ChileBite
- `encrypted_password` en `auth.users`
- `user.identities`

Son cosas distintas.

El estado que importa para `unlinkIdentity` es `user.identities`.

## Solución de fondo recomendada

Para que la vinculación y desvinculación de Google funcione de forma confiable a futuro, hay que asegurar que cada usuario tenga **al menos dos identidades Auth reales** o un flujo de migración bien definido.

### Ruta recomendada para cuentas nuevas

Para cuentas nuevas, el flujo ideal es:

1. Crear cuenta con `email + password`.
2. Confirmar que `user.identities` incluye identidad de email.
3. Vincular Google después.
4. Permitir desvinculación solo cuando exista otra identidad válida.

Con este flujo, `unlinkIdentity` tiene una segunda identidad real como respaldo.

### Ruta recomendada para cuentas antiguas

Para cuentas ya creadas como Google-first, hace falta una estrategia de migración:

- revisar si la cuenta realmente tiene una identidad `email`
- si no la tiene, reconstruir el flujo de vínculo para que la identidad quede formalmente enlazada
- evitar asumir que un password existente en `auth.users` ya equivale a identidad enlazada

## Reglas sugeridas para la UI

Mientras no se resuelva la migración de fondo, la UI debería:

- mostrar el diagnóstico de identidades
- ocultar o deshabilitar “Desvincular Google” cuando solo exista una identidad
- explicar con texto claro que no basta con tener password; Supabase debe ver una identidad alternativa

## Reglas sugeridas para backend / auth

Cuando se retome este tema, conviene validar:

- cómo se crea el password en la cuenta Google-first
- si Supabase está generando una identidad `email` o solo actualizando el registro de autenticación
- si la versión del SDK soporta el flujo esperado para el caso de vinculación/desvinculación
- si existe alguna acción de administración o migración que permita normalizar identidades en cuentas antiguas

## Estado actual

Estado funcional de la app:

- login con Google: funciona
- login con email y contraseña: funciona
- MFA TOTP: depende de que esté habilitado en Supabase
- desvinculación de Google: falla cuando Supabase solo ve `google` como identidad

## Próximo paso sugerido

Si se va a retomar esto más adelante, el orden recomendado es:

1. Revisar el flujo exacto con el que se creó la contraseña en la cuenta afectada.
2. Confirmar si Supabase puede exponer una identidad `email` real para esa cuenta.
3. Definir una política de negocio: no permitir unlink si no hay otra identidad enlazada.
4. Si hace falta, migrar las cuentas antiguas a un esquema de identidades consistente.

## Resumen corto

El fallo no está en el `profile` de ChileBite.

El fallo está en que Supabase Auth sigue viendo la cuenta como una cuenta de Google, aunque exista contraseña y el login por correo funcione.

Por eso la desvinculación devuelve `422`.

Este documento debe servir como punto de partida para resolverlo de forma definitiva en el futuro.
