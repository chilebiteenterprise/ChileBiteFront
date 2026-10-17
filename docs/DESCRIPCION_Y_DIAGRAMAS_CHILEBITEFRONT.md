# 📘 Especificación Técnica y Descriptiva de Diagramas y Arquitectura
## ChileBiteFront — Plataforma Web Gastronómica y Nutricional

**Documento:** Memoria de Ingeniería de Software, Procesos, Modelo de Datos, Comunicaciones, Infraestructura y Arquitectura TI  
**Alcance:** Exclusivo para **ChileBiteFront** (Recetario Chileno, Calculadora de Macros e Ingredientes, Chef IA Copilot, Perfiles y Colecciones)  
**Versión:** 3.0.0  
**Fecha:** 2026-10-12  

---

## 📑 Tabla de Contenidos
1. [Diagrama 1: BPMN — Búsqueda, Filtrado y Visualización Detallada de Recetas](#1-diagrama-bpmn-1--búsqueda-filtrado-y-visualización-detallada-de-recetas)
2. [Diagrama 2: BPMN — Cálculo Nutricional por Ingredientes y Asistente Chef IA](#2-diagrama-bpmn-2--cálculo-nutricional-por-ingredientes-y-asistente-chef-ia)
3. [Diagrama 3: BPMN — Identidad, Perfil y Curaduría de Colecciones (Favoritos)](#3-diagrama-bpmn-3--identidad-perfil-y-curaduría-de-colecciones-favoritos)
4. [Diagrama 4: UML — Casos de Uso de ChileBiteFront](#4-diagrama-uml--casos-de-uso-de-chilebitefront)
5. [Diagrama 5: UML — Componentes Lógicos y Físicos de la Solución](#5-diagrama-uml--componentes-lógicos-y-físicos-de-la-solución)
6. [Diagrama 6: Modelo de Datos — Diagrama Entidad-Relación Lógico (ERD)](#6-diagrama-de-modelo-de-datos--entidad-relación-lógico-erd)
7. [Anexo al Modelo de Datos: Diccionario de Datos Completo](#7-anexo-al-modelo-de-datos-diccionario-de-datos-completo)
8. [Paso 2.4: Detalle de la Topología de Comunicaciones](#8-paso-24-detalle-de-la-topología-de-comunicaciones)
9. [Paso 2.5: Diagrama de Infraestructura](#9-paso-25-diagrama-de-infraestructura)
10. [Paso 2.6: Diagrama de Arquitectura (Software y Hardware)](#10-paso-26-diagrama-de-arquitectura-software-y-hardware)

---

## 1. Diagrama BPMN 1 — Búsqueda, Filtrado y Visualización Detallada de Recetas

* **Archivos asociados:** [Ver SVG](diagramas/bpmn_1_recetario_exploracion.svg) · [Descargar PNG](diagramas/bpmn_1_recetario_exploracion.png) · [Código MMD](diagramas/bpmn_1_recetario_exploracion.mmd)

```mermaid
flowchart TD
    subgraph Pool_Recetario ["Pool: Exploración y Consulta de Recetas Chilenas (ChileBiteFront)"]
        
        subgraph Lane_Usuario ["Lane: Comensal / Usuario Web"]
            U1((Inicio: Ingreso a la plataforma)) --> U2["Navegar a Galería de Recetas (/recipes)"]
            U2 --> U3["Ingresar término de búsqueda o aplicar filtros"]
            U3 --> U4{"¿Existen recetas coincidentes?"}
            U4 -- No --> U5["Ver mensaje de 'Sin resultados' y sugerencias"]
            U5 --> U3
            U4 -- Sí --> U6["Visualizar tarjetas de recetas (RecipeCard)"]
            U6 --> U7["Seleccionar una receta típica chilena"]
            U7 --> U8["Ver página detallada con ingredientes y pasos"]
            U8 --> U9["Ajustar número de porciones deseadas"]
            U9 --> U10((Fin: Receta lista para cocinar))
        end

        subgraph Lane_Front ["Lane: Frontend Astro + React Islands"]
            U3 -.-> F1["RecipeToolbar & RecipeFilters capturan estado"]
            F1 --> F2["Aplicar debounce en búsqueda y filtrar por tags"]
            F2 --> F3["Solicitar catálogo a base de datos"]
            F4 --> F5["Renderizar RecipeGrid con transiciones suaves"]
            F5 -.-> U6
            U9 -.-> F6["Recalcular dinámicamente gramajes de ingredientes"]
            F6 -.-> U10
        end

        subgraph Lane_Supabase ["Lane: Supabase BaaS (Datos & Caché)"]
            F3 --> S1["Consultar tabla core_receta"]
            S1 --> S2{"¿Consulta exitosa?"}
            S2 -- Sí --> S3["Retornar listado de recetas ordenadas"]
            S3 --> F4["Transmitir payload JSON al cliente"]
            S2 -- No --> S4["Retornar error controlado"]
            S4 --> F4
        end

    end
```

### 📝 Descripción Detallada del Proceso

#### Objetivo de Negocio:
Facilitar el descubrimiento rápido de preparaciones gastronómicas tradicionales chilenas, permitiendo adaptar los ingredientes según la cantidad de raciones sin recargar la página.

#### Participantes y Carriles (Lanes):
* **Lane Comensal / Usuario Web:** Representa al visitante que interactúa con la interfaz gráfica en su navegador.
* **Lane Frontend Astro + React Islands:** Orquesta la reactividad del lado del cliente a través de componentes interactivos aislados (`RecipeToolbar`, `RecipeFilters`, `RecipeGrid` y `RecipeDetail`).
* **Lane Supabase BaaS:** Capa backend en la nube que expone los datos de `core_receta` mediante PostgREST.

#### Secuencia de Actividades y Compuertas:
1. **Inicio y Búsqueda:** El usuario ingresa a la ruta `/recipes`. En la barra de herramientas puede escribir el nombre de un plato o aplicar filtros por tiempo, categoría culinaria o dificultad.
2. **Control de Flujo con Debounce:** La interfaz aplica una pausa controlada (*debounce*) antes de consultar el catálogo para no saturar la red ante pulsaciones rápidas.
3. **Compuerta de Validación:** Si no hay platos que cumplan los criterios seleccionados, el sistema muestra una interfaz vacía con sugerencias de búsqueda. Si hay coincidencias, se despliega la cuadrícula animada de tarjetas `RecipeCard`.
4. **Inspección y Escalabilidad:** Al entrar a la ficha de la receta, el comensal puede manipular el selector numérico de porciones. El sistema calcula en memoria el factor de escala `(nuevasPorciones / porcionesBase)` y recalcula al instante los gramos o medidas de cada ingrediente.

---

## 2. Diagrama BPMN 2 — Cálculo Nutricional por Ingredientes y Asistente Chef IA

* **Archivos asociados:** [Ver SVG](diagramas/bpmn_2_calculadora_macros.svg) · [Descargar PNG](diagramas/bpmn_2_calculadora_macros.png) · [Código MMD](diagramas/bpmn_2_calculadora_macros.mmd)

```mermaid
flowchart TD
    subgraph Pool_Calculadora ["Pool: Cálculo Nutricional y Asistente Chef IA (ChileBiteFront)"]
        
        subgraph Lane_Usuario ["Lane: Comensal / Usuario Web"]
            M1((Inicio: Ingreso a /calculadora)) --> M2{"¿Cómo desea armar su preparación?"}
            
            M2 -- "Búsqueda Manual" --> M3["Escribir ingrediente en buscador (ej: pollo, arroz, palta)"]
            M3 --> M4["Seleccionar ingrediente sugerido del catálogo"]
            M4 --> M5["Definir cantidad y unidad: Gramos, Unidades, Cucharadas o Tazas"]
            M5 --> M6["Presionar 'Agregar' al plato"]
            M6 --> M7["Visualizar píldoras de macros acumuladas (Kcal, Proteínas, Carbs, Grasas)"]
            
            M2 -- "Chef IA Copilot" --> M8["Abrir modal de Chef IA (CopilotChat)"]
            M8 --> M9["Escribir qué ingredientes tiene en el refrigerador o qué desea comer"]
            M9 --> M10["Recibir sugerencias de recetas saludables con pasos e ingredientes"]
            M10 --> M11{"¿Desea transferir la receta a la calculadora?"}
            M11 -- Sí --> M12["Pulsar 'Usar Receta' en la tarjeta sugerida"]
            M12 --> M13["Ver ingredientes cargados automáticamente en la calculadora"]
            M13 --> M7
            M11 -- No --> M14["Continuar conversando o cerrar chat"]
            M14 --> M7
            
            M7 --> M15{"¿Desea ajustar ingredientes?"}
            M15 -- Sí --> M16["Modificar cantidades o eliminar ingredientes del plato"]
            M16 --> M7
            M15 -- No --> M17((Fin: Información nutricional del plato obtenida))
        end

        subgraph Lane_CalculadoraEngine ["Lane: Calculadora de Macros (MacroCalculator.jsx)"]
            M3 -.-> C1["Búsqueda predictiva con normalize() en lista de ingredientes"]
            C1 -.-> M4
            M6 -.-> C2["Convertir unidad seleccionada a gramos base"]
            C2 --> C3["Calcular aporte proporcional de calorías, proteínas, carbohidratos y grasas"]
            C3 --> C4["Sumar al total acumulado y renderizar MacroPill reactivos"]
            C4 -.-> M7
            M12 -.-> C5["onClear(): Limpiar plato actual"]
            C5 --> C6["onSetRecipeName() y onSetRecipeSteps(): Asignar nombre y pasos"]
            C6 --> C7["Iterar ingredientes y agregarlos síncronamente al plato"]
            C7 -.-> M13
        end

        subgraph Lane_ChefIA ["Lane: Chef IA y Base de Datos (CopilotChat.jsx & Supabase)"]
            M9 -.-> I1["Enviar historial de conversación a /api/copilot"]
            I1 --> I2["Generar propuesta culinaria adaptada a los ingredientes disponibles"]
            I2 -.-> M10
            M12 -.-> I3["handleUseRecipe: Mapear ingredientes devueltos"]
            I3 --> I4["Consultar tabla core_ingrediente con ilike() y filtro stop-words"]
            I4 --> I5["Obtener datos nutricionales exactos de cada ingrediente coincidente"]
            I5 -.-> C7
        end

    end
```

### 📝 Descripción Detallada del Proceso

#### Objetivo de Negocio:
Permitir a los comensales calcular con exactitud los macronutrientes de cualquier comida o preparación sumando ingredientes específicos, con la opción de apoyarse en el asistente inteligente **Chef IA Copilot** para crear recetas personalizadas a partir de lo que tengan disponible en su cocina o refrigerador.

#### Participantes y Carriles (Lanes):
* **Lane Comensal / Usuario Web:** Añade ingredientes manualmente o interactúa con el Chef IA para obtener ideas culinarias.
* **Lane Calculadora de Macros (`MacroCalculator.jsx`):** Gestiona el buscador predictivo `IngredientSearch`, la conversión de unidades (`g`, `unidad`, `cda`, `taza`) y la acumulación síncrona en las tarjetas `MacroPill`.
* **Lane Chef IA y Base de Datos (`CopilotChat.jsx` y Supabase):** Procesa el diálogo con la IA en `/api/copilot`, identifica los ingredientes propuestos y los enlaza con la tabla `core_ingrediente`.

#### Secuencia de Actividades y Compuertas:
1. **Punto de Partida:** El usuario decide si cargar ingredientes manualmente o consultar al asistente inteligente.
2. **Camino A — Armado Manual de Ingredientes:**
   - El usuario escribe en el input con autocompletado (ej. *"pechuga de pollo"*). La función `normalize()` filtra la lista en tiempo real.
   - El usuario elige la cantidad y la unidad mediante el selector `CustomUnitSelect` (`g`, `unidad`, `cda` o `taza`).
   - Al pulsar "Agregar", el motor convierte la unidad a gramos base usando los pesos unitarios de `core_ingrediente` y calcula calorías, proteínas, carbohidratos y grasas.
   - Las píldoras visuales `MacroPill` se actualizan reactivamente.
3. **Camino B — Asistencia del Chef IA (CopilotChat):**
   - El usuario abre el modal del Chef IA y escribe qué ingredientes tiene disponibles en casa (ejemplo: *"tengo papas, zapallo, porotos verdes y cebolla"*).
   - El endpoint `/api/copilot` procesa la petición y responde con opciones de recetas saludables estructuradas con nombre, porciones, ingredientes y pasos.
   - Si el usuario decide utilizar la sugerencia, pulsa el botón **"Usar Receta"**.
   - La función `handleUseRecipe` limpia la calculadora (`onClear()`), asigna el nombre y pasos de la receta, busca cada ingrediente en `core_ingrediente` (usando búsqueda con tolerancia a stop-words) e inyecta la receta en la calculadora con sus valores nutricionales calculados al instante.

---

## 3. Diagrama BPMN 3 — Identidad, Perfil y Curaduría de Colecciones (Favoritos)

* **Archivos asociados:** [Ver SVG](diagramas/bpmn_3_perfil_colecciones.svg) · [Descargar PNG](diagramas/bpmn_3_perfil_colecciones.png) · [Código MMD](diagramas/bpmn_3_perfil_colecciones.mmd)

```mermaid
flowchart TD
    subgraph Pool_Perfil_Colecciones ["Pool: Identidad, Perfil y Curaduría de Colecciones (ChileBiteFront)"]
        
        subgraph Lane_Usuario ["Lane: Usuario Registrado"]
            P1((Inicio: Usuario autenticado)) --> P2["Acceder a /profile o ver una receta"]
            P2 --> P3{"¿Qué acción desea realizar?"}
            
            P3 -- "Personalizar Perfil" --> P4["Editar Bio, Nombres y cargar nuevo Avatar"]
            P4 --> P5["Guardar cambios de perfil"]
            P5 --> P6((Perfil actualizado))
            
            P3 -- "Organizar Colección" --> P7["Presionar 'Guardar en Colección' en una receta"]
            P7 --> P8["Abrir CollectionPickerModal"]
            P8 --> P9{"¿Crear nueva colección o seleccionar existente?"}
            P9 -- "Nueva" --> P10["Ingresar nombre y descripción"]
            P10 --> P11["Confirmar creación y asociación de receta"]
            P9 -- "Existente" --> P12["Marcar / desmarcar colección deseada"]
            P11 --> P13["Ver mosaico de 4 portadas actualizado en /profile"]
            P12 --> P13
            P13 --> P14((Fin: Receta guardada en colección))
        end

        subgraph Lane_ServiciosFront ["Lane: Servicios Frontend (profileService.js & collectionService.js)"]
            P5 -.-> S1["updateProfile: Actualizar fila en tabla profiles"]
            P4 -.-> S2["uploadAvatar: Subir binario a Supabase Storage"]
            P8 -.-> S3["getCollectionsWithRecipeStatus: Consultar listas del usuario"]
            S3 -.-> P8
            P11 -.-> S4["createCollection y toggleRecipeInCollection"]
            P12 -.-> S5["toggleRecipeInCollection: Insertar o borrar relación"]
            S4 --> S6["getUserCollections: Recalcular portadas de mosaico"]
            S5 --> S6
            S6 -.-> P13
        end

        subgraph Lane_SupabaseBaaS ["Lane: Supabase Cloud (Auth, DB & Storage)"]
            S2 --> B1["Bucket 'avatars': Almacenar imagen y generar Public URL"]
            B1 --> S1
            S1 --> B2["Actualizar public.profiles y user_metadata"]
            B2 -.-> P6
            S4 --> B3["Insertar en core_coleccion y core_coleccion_receta"]
            S5 --> B4["Mutación atómica en core_coleccion_receta"]
            B3 --> B5["Consultar últimas 4 imágenes de core_receta"]
            B4 --> B5
            B5 -.-> S6
        end

    end
```

### 📝 Descripción Detallada del Proceso

#### Objetivo de Negocio:
Permitir a los usuarios registrados gestionar su identidad comunitaria y organizar sus recetas predilectas en carpetas privadas (Favoritos).

#### Participantes y Carriles (Lanes):
* **Lane Usuario Registrado:** Realiza operaciones de perfil o guarda recetas en listas.
* **Lane Servicios Frontend:** Funciones encapsuladas en `src/lib/` (`profileService.js` y `collectionService.js`).
* **Lane Supabase Cloud:** Gestiona el almacenamiento de avatares en el bucket `avatars`, políticas RLS y mutaciones en PostgreSQL.

#### Secuencia de Actividades:
1. **Flujo de Perfil y Avatar:** `uploadAvatar` sube la imagen al bucket `avatars` con política `upsert: true` y `updateProfile` persiste la biografía y nombres en `public.profiles`.
2. **Flujo de Colecciones:** Al pulsar "Guardar", se abre `CollectionPickerModal.jsx`. El usuario puede crear una colección (`createCollection`) o alternar (`toggleRecipeInCollection`). Al terminar, `getUserCollections` recupera las últimas cuatro imágenes de recetas vinculadas para componer un mosaico de portada en `/profile`.

---

## 4. Diagrama UML — Casos de Uso de ChileBiteFront

* **Archivos asociados:** [Ver SVG](diagramas/casos_de_uso_uml.svg) · [Descargar PNG](diagramas/casos_de_uso_uml.png) · [Código MMD](diagramas/casos_de_uso_uml.mmd)

```mermaid
flowchart LR
    actor_visitante["Visitante Anónimo"]
    actor_usuario["Usuario Registrado"]
    actor_admin["Administrador de Contenido"]
    actor_supabase["Proveedor Auth (Supabase / Google)"]

    actor_usuario -.->|Generaliza| actor_visitante

    subgraph Front_App ["Sistema ChileBiteFront (Plataforma de Recetas Chilenas)"]
        %% Exploración y Consulta
        UC1["CU01: Explorar Catálogo de Recetas"]
        UC2["CU02: Filtrar por Categoría, Tiempo y Dificultad"]
        UC3["CU03: Ver Detalle, Ingredientes y Pasos"]
        UC4["CU04: Ajustar Porciones de la Receta"]
        
        %% Calculadora y Nutrición
        UC5["CU05: Calcular Macronutrientes por Ingredientes"]
        UC6["CU06: Consultar Chef IA Copilot (Qué cocinar según el refri)"]

        %% Autenticación e Identidad
        UC7["CU07: Registrarse con Email y Contraseña"]
        UC8["CU08: Iniciar Sesión con Google OAuth"]
        UC9["CU09: Gestionar Perfil (Nombres y Biografía)"]
        UC10["CU10: Subir Foto de Avatar Personal"]
        UC11["CU11: Eliminar Cuenta de Usuario (Edge Function)"]

        %% Social y Colecciones
        UC12["CU12: Crear Colección de Recetas"]
        UC13["CU13: Guardar / Quitar Receta de Colección"]
        UC14["CU14: Publicar Comentario en Receta"]
        UC15["CU15: Sanitizar Contenido HTML (DOMPurify XSS)"]

        %% Gestión Editorial
        UC16["CU16: Crear / Modificar Receta en Catálogo"]
    end

    actor_visitante --> UC1
    actor_visitante --> UC2
    actor_visitante --> UC3
    actor_visitante --> UC4
    actor_visitante --> UC5
    actor_visitante --> UC6
    actor_visitante --> UC7
    actor_visitante --> UC8

    actor_usuario --> UC9
    actor_usuario --> UC10
    actor_usuario --> UC11
    actor_usuario --> UC12
    actor_usuario --> UC13
    actor_usuario --> UC14

    actor_admin --> UC16

    actor_supabase -.-> UC7
    actor_supabase -.-> UC8

    UC1 -.->|<<extend>>| UC2
    UC3 -.->|<<extend>>| UC4
    UC5 -.->|<<extend>>| UC6
    UC14 -.->|<<include>>| UC15
    UC13 -.->|<<include>>| UC12
    UC10 -.->|<<include>>| UC9
```

---

## 5. Diagrama UML — Componentes Lógicos y Físicos de la Solución

* **Archivos asociados:** [Ver SVG](diagramas/componentes_uml.svg) · [Descargar PNG](diagramas/componentes_uml.png) · [Código MMD](diagramas/componentes_uml.mmd)

```mermaid
flowchart TD
    subgraph INFRA_CLIENTE ["Capa de Cliente y Navegador"]
        Browser_Web["Navegador Web Comensal (Desktop / Mobile)"]
    end

    subgraph CLOUD_EDGE ["Capa de Presentación y Frontend (Vercel Edge Platform)"]
        subgraph ChileBiteFront_App ["Componente: ChileBiteFront (Astro 5 + React 19)"]
            
            subgraph Astro_Engine ["Núcleo Astro SSR & Static Generation"]
                Astro_Router["Astro Router & Dynamic Pages (/recipes, /calculadora, /profile)"]
                Shared_Layout["Shared Layout (Navbar.jsx, Footer.jsx, BaseHead.astro)"]
            end

            subgraph React_Islands ["Islas Interactivas React 19 (Client Hydration)"]
                Island_Auth["AuthContext (Singleton Session Provider)"]
                Island_Recipes["RecipeGrid, RecipeFilters & RecipeDetail"]
                Island_Macros["MacroCalculator & CopilotChat (Nutrición)"]
                Island_Comments["CommentSection (Interacción y Reseñas)"]
                Island_Collections["CollectionPickerModal & ProfileManager"]
            end

            subgraph UI_DesignSystem ["Sistema de Diseño y Estilos"]
                HeroUI_Lib["HeroUI v3 Components (Modal, Button, Select, Toast)"]
                Tailwind_V4["Tailwind CSS v4 Engine (Glassmorphism & Copper Palette)"]
                Security_DOMPurify["DOMPurify (Sanitización anti-XSS)"]
            end

        end
    end

    subgraph SERVICES_LAYER ["Capa de Servicios de Acceso a Datos (src/lib)"]
        Client_Supabase["supabaseClient.js (Instancia Supabase SDK)"]
        Service_Profile["profileService.js (Operaciones de Usuario y Avatar)"]
        Service_Collection["collectionService.js (Gestión de Favoritos)"]
    end

    subgraph SUPABASE_BAAS ["Infraestructura Backend-as-a-Service (Supabase Cloud)"]
        subgraph Auth_Service ["Supabase Auth"]
            GoTrue_Engine["GoTrue Engine (Email/Password, Google OAuth, JWT)"]
        end

        subgraph Storage_Service ["Supabase Storage"]
            Bucket_Avatars["Bucket: avatars (Imágenes de Perfil de Usuarios)"]
        end

        subgraph Edge_Runtime ["Supabase Serverless Edge Functions"]
            Func_DeleteUser["delete-user (Eliminación Segura de Cuenta con Service Role)"]
        end

        subgraph DB_PostgreSQL ["Base de Datos PostgreSQL 15"]
            Table_Profiles[("public.profiles")]
            Table_Recetas[("public.core_receta")]
            Table_Ingredientes[("public.core_ingrediente")]
            Table_RecetaIngrediente[("public.core_recetaingrediente")]
            Table_Colecciones[("public.core_coleccion")]
            Table_ColeccionReceta[("public.core_coleccion_receta")]
            Table_Comentarios[("public.core_comentario")]
            Security_RLS["Row Level Security (RLS) & Triggers PL/pgSQL"]
        end
    end

    Browser_Web -->|"HTTPS / HTML & JavaScript Hydration"| Astro_Router

    Astro_Router --- Shared_Layout
    Shared_Layout --- Island_Auth
    Island_Recipes --- HeroUI_Lib
    Island_Macros --- Tailwind_V4
    Island_Comments --- Security_DOMPurify
    Island_Collections --- HeroUI_Lib

    Island_Auth -->|"Consumo de Sesión"| Client_Supabase
    Island_Recipes -->|"Consultas Directas"| Client_Supabase
    Island_Collections -->|"Gestión de Listas"| Service_Collection
    Island_Comments -->|"Lectura / Escritura"| Client_Supabase
    Island_Auth -->|"Actualización y Avatar"| Service_Profile

    Client_Supabase -->|"Supabase JS SDK v2"| GoTrue_Engine
    Client_Supabase -->|"PostgREST API"| Table_Recetas
    Client_Supabase -->|"PostgREST API"| Table_Ingredientes
    Client_Supabase -->|"PostgREST API"| Table_Comentarios
    Service_Profile -->|"PostgREST API"| Table_Profiles
    Service_Profile -->|"Multipart Upload"| Bucket_Avatars
    Service_Profile -->|"HTTPS POST (Bearer Token)"| Func_DeleteUser
    Service_Collection -->|"PostgREST API"| Table_Colecciones
    Service_Collection -->|"PostgREST API"| Table_ColeccionReceta

    Table_Profiles --- Security_RLS
    Table_Colecciones --- Security_RLS
    Table_ColeccionReceta --- Table_Colecciones
    Table_ColeccionReceta --- Table_Recetas
    Table_RecetaIngrediente --- Table_Recetas
    Table_RecetaIngrediente --- Table_Ingredientes
    Table_Comentarios --- Table_Recetas
    Table_Comentarios --- Table_Profiles
```

---

## 6. Diagrama de Modelo de Datos — Entidad-Relación Lógico (ERD)

* **Archivos asociados:** [Ver SVG](diagramas/modelo_datos_erd.svg) · [Descargar PNG](diagramas/modelo_datos_erd.png) · [Código MMD](diagramas/modelo_datos_erd.mmd)

```mermaid
erDiagram
    PROFILES ||--o{ CORE_COLECCION : "crea y administra"
    PROFILES ||--o{ CORE_COMENTARIO : "escribe"
    
    CORE_RECETA ||--o{ CORE_COLECCION_RECETA : "es guardada en"
    CORE_RECETA ||--o{ CORE_COMENTARIO : "recibe"
    CORE_RECETA ||--o{ CORE_RECETAINGREDIENTE : "se compone de"
    
    CORE_INGREDIENTE ||--o{ CORE_RECETAINGREDIENTE : "es utilizado en"
    
    CORE_COLECCION ||--o{ CORE_COLECCION_RECETA : "contiene"

    PROFILES {
        uuid id PK
        string username UK
        string nombres
        string apellido_paterno
        string apellido_materno
        text bio
        string avatar_url
        timestamp created_at
        timestamp updated_at
    }

    CORE_RECETA {
        bigint id PK
        string nombre
        text descripcion_corta
        text descripcion_larga
        text preparacion
        string dificultad
        integer tiempo_preparacion_minutos
        integer tiempo_coccion_minutos
        integer porciones
        string imagen_url
        float calorias_totales
        timestamp created_at
    }

    CORE_INGREDIENTE {
        bigint id PK
        string nombre UK
        string categoria
        float calorias_por_100g
        float proteinas_por_100g
        float grasas_por_100g
        float carbohidratos_por_100g
        float fibra_por_100g
        float azucares_por_100g
        float sodio_mg_por_100g
        float peso_por_unidad_gramos
        float peso_por_taza_gramos
        float peso_por_cucharada_gramos
        boolean es_vegano
        boolean es_libre_de_gluten
    }

    CORE_RECETAINGREDIENTE {
        bigint id PK
        bigint receta_id FK
        bigint ingrediente_id FK
        float cantidad
        string unidad
    }

    CORE_COLECCION {
        uuid id PK
        uuid user_id FK
        string nombre
        text descripcion
        boolean es_privada
        timestamp fecha_creacion
    }

    CORE_COLECCION_RECETA {
        bigint id PK
        uuid coleccion_id FK
        bigint receta_id FK
        timestamp fecha_agregado
    }

    CORE_COMENTARIO {
        uuid id PK
        bigint receta_id FK
        uuid user_id FK
        text contenido
        integer valoracion
        timestamp created_at
    }
```

---

## 7. Anexo al Modelo de Datos: Diccionario de Datos Completo

A continuación se detalla exhaustivamente cada tabla del modelo relacional de **ChileBiteFront** en PostgreSQL (Supabase):

### 7.1. Tabla: `profiles`
*Almacena la identidad pública, biografía y datos personales de cada usuario registrado en la plataforma.*
| Campo | Tipo de Dato | Nulo | Clave | Valor por Defecto | Descripción Técnica y Funcional |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `UUID` | No | PK, FK | `auth.uid()` | Identificador universal único del usuario, vinculado con clave foránea en cascada a `auth.users.id`. |
| `username` | `VARCHAR(50)` | No | UK | - | Nombre de usuario visible y único en la comunidad gastronómica. |
| `nombres` | `VARCHAR(100)` | Sí | - | `NULL` | Nombres de pila del usuario. |
| `apellido_paterno` | `VARCHAR(100)` | Sí | - | `NULL` | Primer apellido del usuario. |
| `apellido_materno` | `VARCHAR(100)` | Sí | - | `NULL` | Segundo apellido del usuario. |
| `bio` | `TEXT` | Sí | - | `NULL` | Biografía culinaria, gustos y presentación personal. |
| `avatar_url` | `TEXT` | Sí | - | `NULL` | Enlace público al archivo de imagen en el bucket `avatars` de Supabase Storage. |
| `created_at` | `TIMESTAMPTZ` | No | - | `NOW()` | Fecha y hora de creación de la cuenta en el sistema. |
| `updated_at` | `TIMESTAMPTZ` | No | - | `NOW()` | Fecha y hora de la última modificación del perfil. |

---

### 7.2. Tabla: `core_receta`
*Catálogo maestro de recetas típicas chilenas expuestas en el recetario público.*
| Campo | Tipo de Dato | Nulo | Clave | Valor por Defecto | Descripción Técnica y Funcional |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `BIGINT` | No | PK | `AUTOINCREMENT` | Identificador numérico secuencial primario de la receta. |
| `nombre` | `VARCHAR(200)` | No | - | - | Nombre tradicional de la preparación chilena (ej. Cazuela de Vacuno, Charquicán). |
| `descripcion_corta` | `TEXT` | Sí | - | `''` | Resumen breve mostrado en las tarjetas del catálogo (`RecipeCard`). |
| `descripcion_larga` | `TEXT` | Sí | - | `''` | Reseña cultural, historia o tips adicionales del plato. |
| `preparacion` | `TEXT` | No | - | - | Instrucciones paso a paso del procedimiento de cocina. |
| `dificultad` | `VARCHAR(20)` | No | - | `'Media'` | Complejidad culinaria (`Fácil`, `Media`, `Difícil`). |
| `tiempo_preparacion_minutos`| `INTEGER` | No | - | `20` | Tiempo estimado de preparación previa (corte, lavado, mise en place). |
| `tiempo_coccion_minutos` | `INTEGER` | No | - | `40` | Tiempo de cocción en fuego u horno. |
| `porciones` | `INTEGER` | No | - | `4` | Raciones estándar calculadas como base para el escalador de porciones. |
| `imagen_url` | `TEXT` | Sí | - | `NULL` | URL de la fotografía de alta calidad del plato terminado. |
| `calorias_totales` | `NUMERIC(8,2)` | Sí | - | `0.0` | Sumatoria total de calorías calculadas por porción estándar. |
| `created_at` | `TIMESTAMPTZ` | No | - | `NOW()` | Marca temporal de publicación de la receta. |

---

### 7.3. Tabla: `core_ingrediente`
*Base de datos nutricional de alimentos y materias primas utilizada por la Calculadora de Macros y el Chef IA.*
| Campo | Tipo de Dato | Nulo | Clave | Valor por Defecto | Descripción Técnica y Funcional |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `BIGINT` | No | PK | `AUTOINCREMENT` | Identificador único del ingrediente base. |
| `nombre` | `VARCHAR(150)` | No | UK | - | Nombre común del ingrediente (ej. Pollo pechuga, Arroz grano largo, Palta hass). |
| `categoria` | `VARCHAR(50)` | No | - | `'general'` | Clasificación nutricional (`cereal`, `grano`, `pasta`, `grasa`, `pescado`, `marisco`, `verdura`, `fruta`, etc.). |
| `calorias_por_100g` | `NUMERIC(7,2)` | No | - | `0.0` | Aporte energético por cada 100 gramos comestibles (kcal). |
| `proteinas_por_100g` | `NUMERIC(6,2)` | No | - | `0.0` | Gramos de proteína por cada 100g. |
| `grasas_por_100g` | `NUMERIC(6,2)` | No | - | `0.0` | Gramos de lípidos/grasas totales por cada 100g. |
| `carbohidratos_por_100g`| `NUMERIC(6,2)` | No | - | `0.0` | Gramos de hidratos de carbono disponibles por cada 100g. |
| `fibra_por_100g` | `NUMERIC(6,2)` | Sí | - | `0.0` | Gramos de fibra dietética por cada 100g. |
| `azucares_por_100g` | `NUMERIC(6,2)` | Sí | - | `0.0` | Gramos de azúcares simples por cada 100g. |
| `sodio_mg_por_100g` | `NUMERIC(7,2)` | Sí | - | `0.0` | Miligramos de sodio por cada 100g. |
| `peso_por_unidad_gramos`| `NUMERIC(6,2)` | Sí | - | `NULL` | Factor de conversión: gramos equivalentes a 1 unidad promedio del alimento. |
| `peso_por_taza_gramos` | `NUMERIC(6,2)` | Sí | - | `NULL` | Factor de conversión: gramos equivalentes a 1 taza medidora. |
| `peso_por_cucharada_gramos`| `NUMERIC(6,2)` | Sí | - | `NULL` | Factor de conversión: gramos equivalentes a 1 cucharada sopera estándar. |
| `es_vegano` | `BOOLEAN` | No | - | `FALSE` | Bandera de compatibilidad para dietas veganas estrictas. |
| `es_libre_de_gluten` | `BOOLEAN` | No | - | `FALSE` | Bandera de aptitud para celíacos (sin TACC). |

---

### 7.4. Tabla: `core_recetaingrediente`
*Tabla relacional intermedia que desglosa los ingredientes cuantitativos de cada receta.*
| Campo | Tipo de Dato | Nulo | Clave | Valor por Defecto | Descripción Técnica y Funcional |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `BIGINT` | No | PK | `AUTOINCREMENT` | Identificador de la tupla de ingrediente en la receta. |
| `receta_id` | `BIGINT` | No | FK | - | Clave foránea referenciada a `core_receta.id` (`ON DELETE CASCADE`). |
| `ingrediente_id` | `BIGINT` | No | FK | - | Clave foránea referenciada a `core_ingrediente.id`. |
| `cantidad` | `NUMERIC(8,2)` | No | - | `1.0` | Valor cuantitativo asignado en la receta base. |
| `unidad` | `VARCHAR(30)` | No | - | `'g'` | Unidad de medida (`g`, `kg`, `ml`, `unidad`, `cda`, `taza`, etc.). |

---

### 7.5. Tabla: `core_coleccion`
*Carpetas o listas de favoritos creadas por los usuarios.*
| Campo | Tipo de Dato | Nulo | Clave | Valor por Defecto | Descripción Técnica y Funcional |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `UUID` | No | PK | `gen_random_uuid()` | Identificador universal único de la colección. |
| `user_id` | `UUID` | No | FK | - | Usuario propietario referenciado a `profiles.id` (`ON DELETE CASCADE`). |
| `nombre` | `VARCHAR(100)` | No | - | - | Nombre de la colección (ej. "Favoritos Dieciocheros", "Almuerzos Fit"). |
| `descripcion` | `TEXT` | Sí | - | `''` | Descripción opcional del contenido de la colección. |
| `es_privada` | `BOOLEAN` | No | - | `TRUE` | Estado de visibilidad privada o comunitaria. |
| `fecha_creacion` | `TIMESTAMPTZ` | No | - | `NOW()` | Fecha y hora en que se creó la colección. |

---

### 7.6. Tabla: `core_coleccion_receta`
*Asociación de muchas a muchas entre colecciones y recetas.*
| Campo | Tipo de Dato | Nulo | Clave | Valor por Defecto | Descripción Técnica y Funcional |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `BIGINT` | No | PK | `AUTOINCREMENT` | Clave primaria autoincremental de la asociación. |
| `coleccion_id` | `UUID` | No | FK | - | Identificador de la colección referenciado a `core_coleccion.id` (`ON DELETE CASCADE`). |
| `receta_id` | `BIGINT` | No | FK | - | Identificador de la receta referenciado a `core_receta.id` (`ON DELETE CASCADE`). |
| `fecha_agregado` | `TIMESTAMPTZ` | No | - | `NOW()` | Fecha y hora de guardado de la receta en la colección. |

---

### 7.7. Tabla: `core_comentario`
*Comentarios, valoraciones y calificaciones dejadas por comensales en las recetas.*
| Campo | Tipo de Dato | Nulo | Clave | Valor por Defecto | Descripción Técnica y Funcional |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `id` | `UUID` | No | PK | `gen_random_uuid()` | Identificador único del comentario. |
| `receta_id` | `BIGINT` | No | FK | - | Receta comentada referenciada a `core_receta.id` (`ON DELETE CASCADE`). |
| `user_id` | `UUID` | No | FK | - | Autor del comentario referenciado a `profiles.id` (`ON DELETE CASCADE`). |
| `contenido` | `TEXT` | No | - | - | Texto del comentario, sanitizado con DOMPurify para prevenir inyecciones XSS. |
| `valoracion` | `INTEGER` | No | - | `5` | Puntuación otorgada al plato en una escala entera de 1 a 5 estrellas. |
| `created_at` | `TIMESTAMPTZ` | No | - | `NOW()` | Fecha y hora exacta de publicación de la opinión. |

---

## 8. Paso 2.4: Detalle de la Topología de Comunicaciones

* **Archivos asociados:** [Ver SVG](diagramas/topologia_comunicaciones.svg) · [Descargar PNG](diagramas/topologia_comunicaciones.png) · [Código MMD](diagramas/topologia_comunicaciones.mmd)

```mermaid
flowchart TD
    subgraph CLIENT_TIER ["Capa de Clientes (Dispositivos de Usuario)"]
        Client_Mobile["Dispositivo Móvil (Smartphone iOS/Android)"]
        Client_Desktop["Computador de Escritorio / Laptop (Web Browser)"]
    end

    subgraph NETWORK_INGRESS ["Capa de Transporte y Red Perimetral"]
        DNS_Edge["DNS Anycast Global (Resolución de nombres / DoH / UDP 53)"]
        Vercel_PoP["Punto de Presencia Edge Vercel (PoP Santiago / São Paulo)"]
    end

    subgraph FRONTEND_EDGE_TIER ["Plataforma Frontend y Cómputo Edge (Vercel)"]
        Static_CDN["CDN Estático (HTML, CSS Tailwind v4, JS Bundles)"]
        Serverless_SSR["Astro SSR Runtime (Renderizado dinámico en servidor)"]
        API_Copilot["Ruta API Serverless: /api/copilot (Orquestador Chef IA)"]
    end

    subgraph EXTERNAL_AI ["Proveedor Externo de Inteligencia Artificial"]
        LLM_Provider["API de Inferencia LLM (Google Gemini / OpenAI)"]
    end

    subgraph BAAS_GATEWAY ["Puerta de Entrada BaaS (Supabase Cloud Gateway)"]
        Kong_Gateway["Kong API Gateway (Reverse Proxy, SSL Termination, Rate Limiting)"]
    end

    subgraph SUPABASE_SERVICES ["Servicios de Backend y Aplicación (Supabase Cloud)"]
        Auth_GoTrue["GoTrue Auth Service (Manejo de Tokens JWT, OAuth)"]
        API_PostgREST["PostgREST Service (Exposición REST automática sobre DB)"]
        Realtime_Engine["Realtime WebSocket Service (Elixir/Phoenix)"]
        Storage_API["Storage Service (API S3-compatible para imágenes)"]
        Edge_Func["Edge Function Worker (Deno Runtime: delete-user)"]
    end

    subgraph STORAGE_PERSISTENCE ["Capa de Persistencia de Datos"]
        DB_Postgres[("Base de Datos PostgreSQL 15 (Instancia con RLS y Triggers)")]
        Bucket_S3[("Supabase Storage: Bucket 'avatars' (S3 Object Storage)")]
    end

    Client_Mobile -->|"1. Consulta DNS / UDP 53 o DoH"| DNS_Edge
    Client_Desktop -->|"1. Consulta DNS / UDP 53 o DoH"| DNS_Edge
    DNS_Edge -.->|"Resuelve IP Anycast de PoP cercano"| Vercel_PoP

    Client_Mobile -->|"2. HTTPS / HTTP/2 - HTTP/3 (TLS 1.3, TCP/UDP 443)"| Vercel_PoP
    Client_Desktop -->|"2. HTTPS / HTTP/2 - HTTP/3 (TLS 1.3, TCP/UDP 443)"| Vercel_PoP

    Vercel_PoP -->|"Caché Hit (Archivos estáticos precompilados)"| Static_CDN
    Vercel_PoP -->|"Caché Miss / Rutas dinámicas SSR"| Serverless_SSR
    Vercel_PoP -->|"Peticiones de chat culinario"| API_Copilot

    API_Copilot -->|"HTTPS / TLS 1.3 (JSON REST + SSE Streaming)"| LLM_Provider

    Client_Mobile -->|"3. HTTPS REST / PostgREST (JSON, Bearer JWT, TLS 1.3)"| Kong_Gateway
    Client_Desktop -->|"3. HTTPS REST / PostgREST (JSON, Bearer JWT, TLS 1.3)"| Kong_Gateway
    Client_Mobile -->|"4. WSS / WebSockets Seguros (TLS 1.3, Puerto 443)"| Kong_Gateway
    Client_Desktop -->|"4. WSS / WebSockets Seguros (TLS 1.3, Puerto 443)"| Kong_Gateway
    Client_Mobile -->|"5. HTTPS Multipart/form-data (Subida de Avatar)"| Kong_Gateway
    Client_Desktop -->|"5. HTTPS Multipart/form-data (Subida de Avatar)"| Kong_Gateway

    Kong_Gateway -->|"Enrutamiento interno /auth/v1"| Auth_GoTrue
    Kong_Gateway -->|"Enrutamiento interno /rest/v1"| API_PostgREST
    Kong_Gateway -->|"Enrutamiento interno /realtime/v1"| Realtime_Engine
    Kong_Gateway -->|"Enrutamiento interno /storage/v1"| Storage_API
    Kong_Gateway -->|"Enrutamiento interno /functions/v1"| Edge_Func

    Auth_GoTrue -->|"Conexión TCP Cifrada (Puerto 5432 / TLS)"| DB_Postgres
    API_PostgREST -->|"Conexión TCP Cifrada (Pooler PgBouncer / Puerto 5432)"| DB_Postgres
    Realtime_Engine -->|"Replicación lógica WAL / TCP 5432"| DB_Postgres
    Edge_Func -->|"Conexión administrativa Service Role / TCP 5432"| DB_Postgres
    Storage_API -->|"Metadatos de archivo / TCP 5432"| DB_Postgres
    Storage_API -->|"HTTPS S3 API (Lectura y Escritura de Blobs)"| Bucket_S3
```

### 📡 Características de Transmisión y Protocolos de Comunicaciones

Para soportar las operaciones de **ChileBiteFront** con alta disponibilidad, baja latencia y cifrado de extremo a extremo, se implementan los siguientes estándares de comunicación:

1. **Protocolo de Enrutamiento y Resolución de Nombres (DNS Anycast):**
   * *Protocolos:* DNS estándar sobre UDP puerto 53 y DNS-over-HTTPS (DoH) sobre puerto 443.
   * *Función:* Resuelve la dirección IP del Punto de Presencia (PoP) de Vercel más próximo al usuario en Sudamérica (Santiago de Chile `scl1` o São Paulo `gru1`), reduciendo el tiempo de *Time to First Byte* (TTFB) a menos de $30\text{ ms}$.

2. **Protocolo de Transporte Seguro Web (HTTPS / HTTP/2 y HTTP/3 sobre TLS 1.3):**
   * *Características:* Cifrado asimétrico mediante curvas elípticas (ECDSA X25519) y cifrado simétrico AES-256-GCM.
   * *Multiplexación:* HTTP/2 y HTTP/3 (QUIC sobre UDP 443) permiten enviar múltiples solicitudes de recursos CSS, JS e imágenes en un único canal sin bloqueo de cabeza de línea (*Head-of-Line Blocking*).
   * *Compresión:* Respuestas comprimidas mediante **Brotli (`br`)** y **Gzip**, reduciendo el peso de transferencia de los bundles de Astro y HeroUI en más de un $70\%$.

3. **Protocolo de Acceso a Datos (REST / PostgREST sobre HTTPS):**
   * *Formato de Payload:* `application/json` con codificación UTF-8.
   * *Seguridad de Acceso:* Cada petición al API de Supabase incluye cabeceras `apikey` (clave anónima pública) y `Authorization: Bearer <JWT>`, permitiendo que la capa de base de datos valide las políticas RLS (*Row Level Security*) del usuario antes de retornar datos.

4. **Protocolo de Eventos en Tiempo Real (WSS - WebSockets Seguros):**
   * *Protocolo:* WSS (WebSocket sobre TLS puerto 443).
   * *Función:* Mantiene una conexión persistente bidireccional entre el navegador y el motor Realtime de Supabase (construido en Elixir/Phoenix), permitiendo recibir actualizaciones instantáneas de nuevos comentarios o cambios en las recetas guardadas.

5. **Streaming de Inteligencia Artificial (SSE - Server-Sent Events):**
   * *Protocolo:* `text/event-stream` sobre HTTP POST autenticado.
   * *Función:* La ruta `/api/copilot` envía la respuesta del Chef IA token por token al navegador del usuario, logrando una experiencia interactiva sin esperar a que el modelo LLM complete toda la receta.

6. **Transferencia de Archivos Binarios (Multipart/form-data):**
   * *Protocolo:* HTTPS POST con delimitadores de frontera *multipart*.
   * *Función:* Utilizado por `uploadAvatar` para transmitir imágenes fotográficas desde el selector de archivos local hacia la API de Supabase Storage, que valida el tipo MIME (`image/jpeg`, `image/png`, `image/webp`) y almacena el archivo en S3.


---

### 8.1. Topología de Conexiones de Red y Equipos (Enfoque Físico/Hardware)
*Diagrama alternativo enfocado en la distribución física de servidores, routers, switches y terminales clientes, replicando el esquema clásico de topología de red de comunicaciones.*

* **Documento Editable en Lucidchart:** [Abrir en Lucidchart (ChileBite - Topologia de Comunicaciones de Red)](https://lucid.app/lucidchart/c265dfa1-dda8-4481-9222-42d93555c213/edit)
* **Archivos asociados:** [Ver SVG](diagramas/topologia_comunicaciones_red.svg) · [Descargar PNG](diagramas/topologia_comunicaciones_red.png) · [Código MMD](diagramas/topologia_comunicaciones_red.mmd)

```mermaid
flowchart TB
    %% Nodos Principales de Red
    Internet(("☁️ INTERNET / RED WAN<br/>(Proveedores ISP)"))
    Firewall["🧱 FIREWALL / WAF<br/>(Vercel & Cloudflare DDoS Shield)"]
    Router["🔀 ROUTER DE BORDE / EDGE POP<br/>(Enrutador Anycast Santiago/Sao Paulo)"]
    Switch["🎛️ SWITCH / API GATEWAY<br/>(Kong Gateway & Balanceador Virtual)"]

    %% Enlaces de Perímetro
    Internet -->|"Enlace Troncal Fibra Optica (WAN)"| Firewall
    Firewall -->|"Cable UTP Cat 6A / Enlace 10 Gbps"| Router
    Router -->|"Canal Virtual mTLS / Fibra 10GbE"| Switch

    %% AREA SERVIDORES (Zona Azul)
    subgraph AREA_SERVIDORES["🟦 AREA DE SERVIDORES (Cloud VPC / Backend BaaS)"]
        direction TB
        ServerWeb["🖥️ SERVIDOR WEB / SSR<br/>(Astro 5 & Route /api/copilot)"]
        ServerAPI["⚙️ SERVIDOR API REST<br/>(PostgREST 12 & GoTrue Auth)"]
        ServerBD[("🗄️ SERVIDOR BASE DE DATOS<br/>(PostgreSQL 15 & PgBouncer)")]
        ServerStorage["📦 SERVIDOR STORAGE<br/>(S3 Bucket 'avatars')"]

        ServerWeb ---|"Red Privada Virtual (VPC LAN)"| ServerAPI
        ServerAPI ---|"Pool TCP 5432 / Socket Interno"| ServerBD
        ServerAPI ---|"Enlace Interno AWS S3"| ServerStorage
    end

    %% AREA CLIENTES ESCRITORIO (Zona Amarilla)
    subgraph AREA_ESCRITORIO["🟨 AREA DE CLIENTES ESCRITORIO (Hogar / Oficina)"]
        direction TB
        PCEscritorio["🖥️ PC / NOTEBOOK USUARIO<br/>(Navegador Desktop Chrome/Edge)"]
        ImpresoraRecetas["🖨️ IMPRESORA / SALIDA PDF<br/>(Fichas de Recetas Guardadas)"]

        PCEscritorio ---|"Cable USB / Impresion Local"| ImpresoraRecetas
    end

    %% AREA DISPOSITIVOS MOVILES (Zona Roja/Coral)
    subgraph AREA_MOVIL["🟥 AREA DE DISPOSITIVOS MOVILES (En Cocina / Comensal)"]
        direction TB
        SmartMobile["📱 SMARTPHONE / TABLET COCINA<br/>(PWA / Navegador Movil iOS/Android)"]
        BalanzaCocina["⚖️ SMART SCALE / ACCESORIO<br/>(Control de Gramos e Insumos)"]

        SmartMobile -.-|"Bluetooth / Enlace Local"| BalanzaCocina
    end

    %% AREA SERVICIOS EXTERNOS IA (Zona Purpura)
    subgraph AREA_IA["🟪 AREA DE SERVICIOS EXTERNOS (Motor de Inteligencia Artificial)"]
        direction TB
        ServerIA["🧠 SERVIDOR INFERENCIA LLM<br/>(Google Gemini API / Vertex AI)"]
    end

    %% Conexiones desde el Router y Switch a las Areas
    Router -->|"Enlace Ethernet UTP / Virtual LAN"| AREA_SERVIDORES
    Switch -->|"Cable UTP / Red LAN Domiciliaria"| AREA_ESCRITORIO
    Router -->|"Enlace Inalambrico Wi-Fi 6 / 4G-5G LTE"| AREA_MOVIL
    ServerWeb -->|"Enlace WAN Seguro / HTTPS REST"| AREA_IA

    %% Estilos de color para coincidir con la imagen de referencia
    style AREA_SERVIDORES fill:#d0e7ff,stroke:#0066cc,stroke-width:2px,color:#003366
    style AREA_ESCRITORIO fill:#fff1cc,stroke:#d69e2e,stroke-width:2px,color:#744210
    style AREA_MOVIL fill:#ffd6d6,stroke:#e53e3e,stroke-width:2px,color:#742a2a
    style AREA_IA fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#581c87
    style Firewall fill:#ffeedd,stroke:#dd6b20,stroke-width:2px
    style Router fill:#e2e8f0,stroke:#4a5568,stroke-width:2px
    style Switch fill:#e2e8f0,stroke:#4a5568,stroke-width:2px
```

#### Descripción de la Topología de Red y Enlaces Físicos:
1. **Punto de Entrada e Internet:** La nube pública representa la red WAN e ISPs que transportan el tráfico de los usuarios finales a través de enlaces troncales de fibra óptica.
2. **Firewall / WAF:** El perímetro de seguridad inspecciona cada trama entrante, bloqueando ataques DDoS en capas 3, 4 y 7 y filtrando accesos no autorizados antes de ingresar al router de borde.
3. **Router de Borde (Edge PoP):** Encamina las solicitudes hacia la infraestructura local o de nube de menor latencia (PoP Santiago de Chile) conectado a 10 Gbps.
4. **Switch Central / Gateway:** Actúa como conmutador de distribución entre la capa de servidores internos y los clientes finales.
5. **Área Servidores (Data Center / VPC):** Agrupa el servidor web de renderizado SSR (Astro), el servidor de APIs REST (PostgREST/GoTrue) y el servidor de base de datos relacional (PostgreSQL con pool PgBouncer), interconectados mediante una LAN privada de alta velocidad.
6. **Áreas de Clientes y Terminales:**
   * **Clientes Escritorio:** Computadores de usuario conectados vía cable Ethernet UTP / LAN hogareña, con periféricos locales como impresoras de recetas conectadas por USB.
   * **Dispositivos Móviles:** Teléfonos inteligentes y tabletas ubicados en la cocina o mesón, comunicados por radiofrecuencia (Wi-Fi 6 y redes móviles 4G/5G), con capacidad de enlace Bluetooth hacia accesorios como balanzas de cocina inteligentes para el pesaje de gramos.
7. **Servicios Externos de IA:** Conexión WAN cifrada punto a punto hacia el clúster de inferencia de modelos LLM (Google Gemini API).

---


## 9. Paso 2.5: Diagrama de Infraestructura

* **Archivos asociados:** [Ver SVG](diagramas/diagrama_infraestructura.svg) · [Descargar PNG](diagramas/diagrama_infraestructura.png) · [Código MMD](diagramas/diagrama_infraestructura.mmd)

```mermaid
flowchart TD
    subgraph INFRA_CLIENTS ["Infraestructura de Clientes y Dispositivos"]
        DEV_MOB["Smartphones (iOS / Android con navegadores Chromium & Safari)"]
        DEV_DESK["Laptops / Computadores (Windows / macOS / Linux)"]
    end

    subgraph CLOUD_VERCEL ["Infraestructura de Hosting y Cómputo Edge (Vercel Cloud)"]
        subgraph VERCEL_EDGE ["Vercel Edge Network (Red Distribuida Global)"]
            EDGE_ROUTER["Edge DNS & Anycast Routing"]
            SSL_TERM["Terminación SSL/TLS & Escudo anti-DDoS"]
            STATIC_STORAGE["Almacenamiento de Assets Estáticos (HTML, JS, CSS, Media)"]
        end

        subgraph VERCEL_COMPUTE ["Capa de Cómputo Serverless (Micro-VMs)"]
            SSR_NODE["Astro SSR Serverless Execution Node (Node.js 20.x)"]
            COPILOT_NODE["Copilot API Serverless Function Node (/api/copilot)"]
        end
    end

    subgraph EXT_PROVIDERS ["Servicios de Terceros e Inteligencia Artificial"]
        GOOGLE_OAUTH["Google Identity Provider (OAuth 2.0 / OpenID Connect)"]
        AI_LLM_CLOUD["Plataforma de Inferencia LLM (Google Gemini / OpenAI API)"]
    end

    subgraph CLOUD_SUPABASE ["Infraestructura Gestionada BaaS (Supabase Cloud en AWS)"]
        subgraph SUPABASE_INGRESS ["Capa de Acceso Perimetral y Seguridad"]
            KONG_PROXY["Kong API Gateway (Proxy Inverso, Rate Limiter, CORS)"]
        end

        subgraph SUPABASE_CONTAINERS ["Capa de Microservicios en Contenedores"]
            GOTRUE_CONT["GoTrue Container (Servicio de Autenticación & JWT)"]
            POSTGREST_CONT["PostgREST Container (Generación dinámica de API REST)"]
            REALTIME_CONT["Realtime Server Container (Elixir Phoenix WebSockets)"]
            STORAGE_CONT["Storage Daemon Container (API de Gestión de Archivos)"]
            DENO_WORKER["Deno Edge Worker (Ejecución de Edge Function delete-user)"]
        end

        subgraph SUPABASE_DATA ["Capa de Persistencia Gestionada"]
            POOLER_PG["Supavisor / PgBouncer (Agrupador de Conexiones a BD)"]
            POSTGRES_CORE[("Instancia PostgreSQL 15 (Compute Dedicado + NVMe SSD)")]
            S3_BUCKET[("Amazon S3 Object Storage (Bucket 'avatars')")]
            WAL_BACKUP[("Almacenamiento de Respaldos WAL & Snapshots Diarios")]
        end
    end

    DEV_MOB -->|"Petición Web (HTTPS 443)"| EDGE_ROUTER
    DEV_DESK -->|"Petición Web (HTTPS 443)"| EDGE_ROUTER
    EDGE_ROUTER --> SSL_TERM

    SSL_TERM -->|"Caché Hit"| STATIC_STORAGE
    SSL_TERM -->|"Caché Miss / Rutas SSR"| SSR_NODE
    SSL_TERM -->|"Ruta /api/copilot"| COPILOT_NODE

    COPILOT_NODE -->|"HTTPS / TLS 1.3"| AI_LLM_CLOUD

    DEV_MOB -->|"Autenticación OAuth"| GOOGLE_OAUTH
    DEV_DESK -->|"Autenticación OAuth"| GOOGLE_OAUTH
    GOOGLE_OAUTH -.->|"Redirección con Token"| GOTRUE_CONT

    DEV_MOB -->|"API Calls (HTTPS / WSS)"| KONG_PROXY
    DEV_DESK -->|"API Calls (HTTPS / WSS)"| KONG_PROXY

    KONG_PROXY --> GOTRUE_CONT
    KONG_PROXY --> POSTGREST_CONT
    KONG_PROXY --> REALTIME_CONT
    KONG_PROXY --> STORAGE_CONT
    KONG_PROXY --> DENO_WORKER

    POSTGREST_CONT --> POOLER_PG
    GOTRUE_CONT --> POOLER_PG
    DENO_WORKER --> POOLER_PG
    POOLER_PG --> POSTGRES_CORE

    REALTIME_CONT -->|"Lectura de WAL"| POSTGRES_CORE
    POSTGRES_CORE -.->|"Replicación y Backup"| WAL_BACKUP

    STORAGE_CONT --> S3_BUCKET
    STORAGE_CONT --> POOLER_PG
```

### 🏗️ Diseño de la Infraestructura Física y en la Nube

1. **Capa de Clientes:**
   * Dispositivos de usuario final heterogéneos con navegadores modernos (Chrome, Firefox, Safari, Edge) ejecutando código JavaScript compilado de React 19.

2. **Capa Edge y Cómputo Frontend (Vercel Cloud):**
   * *Red Global Anycast:* Red perimetral distribuida que absorbe picos de tráfico y ataques distribuidos (DDoS mitigado a nivel L3/L4/L7).
   * *Nodos de Cómputo Serverless:* Micro-máquinas virtuales efímeras (AWS Lambda / Firecracker subyacente) que ejecutan el motor de Astro SSR y la ruta `/api/copilot` bajo demanda con autoescalado a cero.

3. **Capa Backend-as-a-Service (Supabase Cloud en AWS):**
   * *Kong API Gateway:* Actúa como reverse proxy perimetral de Supabase gestionando limitación de tasa (*rate limiting*), CORS y enrutamiento hacia los microservicios.
   * *GoTrue & PostgREST:* Contenedores Docker de alto rendimiento que resuelven autenticación stateless y mapeo relacional a endpoints JSON.
   * *Deno Edge Worker:* Servidor V8 aislado que ejecuta la Edge Function `delete-user` con acceso al `service_role`.

4. **Capa de Persistencia y Base de Datos:**
   * *PostgreSQL 15 Gestionado:* Instancia dedicada en la nube con pool de conexiones gestionado por **Supavisor**, almacenamiento en discos NVMe de baja latencia y respaldos automáticos de logs de transacciones (WAL archiving).
   * *Amazon S3:* Repositorio de almacenamiento de objetos distribuido geográficamente con redundancia 99.999999999% (11 nueves) para los avatares multimedia.

---

## 10. Paso 2.6: Diagrama de Arquitectura (Software y Hardware)

* **Archivos asociados:** [Ver SVG](diagramas/diagrama_arquitectura.svg) · [Descargar PNG](diagramas/diagrama_arquitectura.png) · [Código MMD](diagramas/diagrama_arquitectura.mmd)

```mermaid
flowchart TD
    subgraph TIER_CLIENT ["1. Capa de Clientes y Presentación de Usuario"]
        subgraph HW_CLIENT ["Infraestructura de Hardware (Dispositivos)"]
            HW_USER["Smartphones & PCs: SoC ARM64 / x86_64, 4GB-16GB RAM, WiFi 6 / 5G LTE"]
        end
        subgraph SW_CLIENT ["Componentes de Software (Frontend Client)"]
            SW_APP["Astro 5 Islands + React 19 Hydration"]
            SW_UI["HeroUI v3 + Tailwind CSS v4 + Framer Motion"]
            SW_SEC["DOMPurify (Filtro XSS) + Supabase JS Client v2"]
        end
        HW_USER --- SW_APP
        SW_APP --- SW_UI
        SW_UI --- SW_SEC
    end

    subgraph TIER_EDGE ["2. Capa Perimetral y Entrega de Contenidos (Edge Network)"]
        subgraph HW_EDGE ["Infraestructura de Hardware Edge"]
            HW_POPS["Servidores Edge en PoPs: AMD EPYC / Xeon, 64GB-128GB RAM, NICs 100GbE"]
        end
        subgraph SW_EDGE ["Componentes de Software Edge"]
            SW_DNS["DNS Anycast + Balanceador de Carga Capa 7 + Terminación TLS 1.3"]
            SW_CDN["Vercel Static Edge Cache (Compresión Brotli/Gzip)"]
        end
        HW_POPS --- SW_DNS
        SW_DNS --- SW_CDN
    end

    subgraph TIER_COMPUTE ["3. Capa de Cómputo de Aplicación (Serverless Cloud)"]
        subgraph HW_COMPUTE ["Infraestructura de Hardware Serverless"]
        HW_VMS["Nodos Host AWS: Micro-VMs Firecracker (1-2 vCPU compartida, 1024MB-2048MB vRAM)"]
        end
        subgraph SW_COMPUTE ["Componentes de Software de Ejecución"]
            SW_SSR["Astro SSR Execution Runtime (Node.js 20.x)"]
            SW_API_COPILOT["Ruta API Serverless (/api/copilot - Orquestador Chef IA)"]
            SW_DENO["Deno Runtime (Supabase Serverless Worker: delete-user)"]
        end
        HW_VMS --- SW_SSR
        SW_SSR --- SW_API_COPILOT
        SW_API_COPILOT --- SW_DENO
    end

    subgraph TIER_BAAS ["4. Capa de Microservicios Backend (Supabase Managed Cloud)"]
        subgraph HW_BAAS ["Infraestructura de Hardware de Contenedores"]
            HW_CONTAINERS["Instancias Cloud Gestionadas en AWS sa-east-1 / us-east-1"]
        end
        subgraph SW_BAAS ["Componentes de Software Backend"]
            SW_KONG["Kong API Gateway (Reverse Proxy, Rate Limiter)"]
            SW_GOTRUE["GoTrue Engine (Auth Service, Emisor JWT)"]
            SW_POSTGREST["PostgREST 12 (Generador automático de APIs REST)"]
            SW_REALTIME["Realtime Engine (Elixir / Phoenix WebSockets)"]
            SW_STORAGE["Storage Service Daemon (API S3 compatible)"]
        end
        HW_CONTAINERS --- SW_KONG
        SW_KONG --- SW_GOTRUE
        SW_GOTRUE --- SW_POSTGREST
        SW_POSTGREST --- SW_REALTIME
        SW_REALTIME --- SW_STORAGE
    end

    subgraph TIER_DATA ["5. Capa de Almacenamiento y Persistencia de Datos"]
        subgraph HW_DATA ["Infraestructura de Hardware de Almacenamiento"]
            HW_DB["Servidor BD Dedicado: 2 vCPUs, 4GB-8GB ECC RAM, NVMe SSD (3000 IOPS)"]
            HW_S3["Clúster de Almacenamiento Distribuido AWS S3 (Triple Replicación)"]
        end
        subgraph SW_DATA ["Componentes de Software de Base de Datos"]
            SW_POOLER["Supavisor / PgBouncer (Pool de Conexiones PostgreSQL)"]
            SW_PG["PostgreSQL 15 (Motor RDBMS con ACID estricto)"]
            SW_EXT["Extensiones: pgcrypto, uuid-ossp, pg_trgm"]
            SW_RLS["Políticas Row-Level Security (RLS) & Triggers PL/pgSQL"]
            SW_BUCKET["Bucket de Objetos: 'avatars'"]
        end
        HW_DB --- SW_POOLER
        SW_POOLER --- SW_PG
        SW_PG --- SW_EXT
        SW_EXT --- SW_RLS
        HW_S3 --- SW_BUCKET
    end

    TIER_CLIENT -->|"HTTPS / TLS 1.3"| TIER_EDGE
    TIER_EDGE -->|"Peticiones dinámicas SSR"| TIER_COMPUTE
    TIER_CLIENT -->|"API Calls directas con JWT"| TIER_BAAS
    TIER_COMPUTE -->|"Llamadas de servicio administrativo"| TIER_BAAS
    TIER_BAAS -->|"Conexiones TCP PostgreSQL (Puerto 5432)"| TIER_DATA
```

### 🖥️ Especificaciones Técnicas de Hardware y Software

| Capa | Componentes de Hardware | Componentes de Software |
| :--- | :--- | :--- |
| **1. Clientes** | • Smartphones y Computadores de escritorio.<br>• CPUs Apple Silicon (M-series), Qualcomm Snapdragon, Intel Core i5/i7/i9, AMD Ryzen.<br>• Memoria: 4 GB a 16 GB LPDDR4x/DDR5.<br>• Interfaces de red: WiFi 5/6 (802.11ax), Ethernet Gigabit, redes móviles 4G/5G LTE. | • **Navegadores:** Chromium 120+, Gecko (Firefox), WebKit (Safari).<br>• **Framework:** Astro 5 con arquitectura de islas.<br>• **UI Library:** React 19, HeroUI v3 Beta, Lucide React, Framer Motion.<br>• **Estilos:** Tailwind CSS v4 Engine.<br>• **Seguridad Client-side:** DOMPurify v3. |
| **2. Red Perimetral (Edge)** | • Servidores de rack de alta densidad en Data Centers Edge (Puntos de Presencia en Santiago de Chile y São Paulo).<br>• CPUs AMD EPYC 7003 / Intel Xeon Scalable.<br>• Tarjetas de red NIC redundantes con enlaces dobles de 100 GbE.<br>• Conmutadores Top-of-Rack con soporte BGP Anycast. | • **Enrutamiento:** Anycast BGP Routing.<br>• **Balanceo:** L4/L7 Load Balancing.<br>• **Terminación TLS:** TLS 1.3 con certificados wildcard ECDSA.<br>• **Caché:** Vercel Edge Cache con purga atómica e invalidación bajo demanda. |
| **3. Cómputo Serverless** | • Nodos hipervisores en la nube (AWS EC2 bare-metal).<br>• Micro-máquinas virtuales **Firecracker**: arranque en $<10\text{ ms}$, aislamiento estricto por tenant.<br>• Asignación elástica: 1 vCPU a 2 vCPU dedicadas, 1024 MB a 2048 MB de vRAM efímera por función. | • **Runtime Servidor:** Node.js 20 LTS / Deno 1.4x.<br>• **Adaptador:** `@astrojs/vercel` para compilación Serverless SSR.<br>• **Orquestador IA:** Endpoint `/api/copilot` con streaming HTTP.<br>• **Serverless Edge Function:** `delete-user` de Supabase. |
| **4. Microservicios BaaS** | • Clúster de instancias cloud en Amazon Web Services (AWS) región `sa-east-1` (São Paulo) / `us-east-1`.<br>• Cómputo gestionado en contenedores Docker / Kubernetes.<br>• Red interna VPC aislada con enlaces de baja latencia inter-AZ. | • **API Gateway:** Kong Gateway (OpenResty/Nginx) con rate-limiting.<br>• **Autenticación:** GoTrue Auth Engine con soporte OAuth 2.0 y JWT RS256.<br>• **Capa API:** PostgREST 12.<br>• **Sockets:** Elixir Phoenix Realtime Engine.<br>• **Servicio de Archivos:** Storage Daemon S3-compatible. |
| **5. Persistencia y Almacenamiento** | • **Instancia PostgreSQL:** 2 vCPUs dedicadas, 4 GB a 8 GB de memoria ECC, almacenamiento SSD NVMe de alto rendimiento con 3000 IOPS garantizados.<br>• **Almacenamiento de Objetos:** Clúster de almacenamiento distribuido Amazon S3 con replicación triple de bloques en múltiples zonas de disponibilidad físicas. | • **Base de Datos:** PostgreSQL 15.<br>• **Pooler:** Supavisor / PgBouncer gestionando hasta 500 conexiones concurrentes.<br>• **Extensiones:** `pgcrypto`, `uuid-ossp`, `pg_trgm`.<br>• **Seguridad RDBMS:** Políticas Row-Level Security (RLS) y Triggers PL/pgSQL.<br>• **Buckets:** Bucket público `avatars`. |
