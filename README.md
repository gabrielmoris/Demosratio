# Demosratio

[Read in English](README.en.md)

Una herramienta online para verificar el cumplimiento de promesas y decisiones políticas, fomentando la transparencia y la participación ciudadana.

## ¿Qué problema soluciona?

Demosratio busca resolver la falta de transparencia en la política, permitiendo a los ciudadanos informarse de manera clara y objetiva sobre las promesas de los políticos y las decisiones que toman. La plataforma evita los filtros políticos de la prensa actual, brindando acceso directo a la información y facilitando la participación ciudadana.

## ¿Cómo funciona?

Demosratio recopila y organiza información sobre las promesas electorales de los políticos y las decisiones que toman en el gobierno. Los usuarios pueden acceder a esta información de forma sencilla, verificar las fuentes oficiales y participar en simulacros de votación.

## Funcionalidades

- **Información clara y accesible**: Base de datos con promesas y decisiones, enlazadas a fuentes oficiales.
- **Seguimiento fácil**: Estado de las promesas (cumplidas, no cumplidas, en curso) y resultados de las decisiones (aprobadas, rechazadas, en curso).
- **Participación ciudadana**: Aportación de información verificable, denuncias de manipulación y simulacros de votación.
- **Visualización de datos**: Gráficos y tablas interactivas para analizar la información.
- **Secciones de la web**:
  - Página principal: Cartas para ver promesas y decisiones recientes.
  - Votos en el congreso: Decisiones ordenadas por fecha. Con búsqueda por texto de expediente.
  - Promesas electorales: Promesas y decisiones agrupadas por temas.
  - Visualización de datos: Gráficos y tablas interactivas. cuando se clicka en los votos
  - Manifiesto: Información sobre el proyecto y sus creadores.

## Tecnologías

- **Frontend**: Next.js, Typescript
- **Backend**: Next.js, Supabase

## Primera instalación

- Antes de la primera instalación se debe hacer una cuenta en [supabase](https://supabase.com/).
- Crea un proyecto en supabase y un documento .env en ROOT del código
- En subapabse: Configuracuón > DATA API Copiar y pegar el `Project URL`, y los 2 `Projet API keys`.
- en el código: `npm run dev` y visitar la url `http://localhost:3000/api/create-tables`

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Application Configuration
DAYS_TO_CHECK_VOTES=30 # Cuantos dias de anterioridad quieres ver los votos que se hicieron en el congreso
JWT_KEY=<RANDOM_STRING>
ENCRYPTION_KEY=<GENERATED_ENCRIPTION_KEY> #openssl rand -base64 64 | tr -dc 'a-zA-Z0-9' | head -c 64

```

- Crea un proyecto en supabase
- En la consola: `npx supabase login`
- Ir a Supabase y buscar Database > Migrations y seguir los pasos (añadiendo npx al principio)
  - `npx supabase link --project-ref <TU_PROJECT_REF>`
  - `npx supabase migration new new-migration`
  - Ir a `supabase/migrations/<ID>_new-migration.sql` y pegar el contenido de `schema.sql`
  - `npx supabase db push`

## Base de Datos

```mermaid
erDiagram
    parties {
        bigint id PK
        timestamp created_at
        text name UK
        text logo_url
    }

    campaigns {
        bigint id PK
        timestamp created_at
        bigint year
        bigint party_id FK
        varchar campaign_pdf_url
    }

    promises {
        bigint id PK
        timestamp created_at
        bigint campaign_id FK
        bigint subject_id FK
        text promise
        bigint party_id FK
    }

    subjects {
        bigint id PK
        timestamp created_at
        text name UK
        varchar description
    }

    promises_readiness_index {
        bigint id PK
        timestamp created_at
        bigint campaign_id FK
        bigint user_id FK
        bigint readiness_score
    }

    proposals {
        bigint id PK
        text title
        text url
        bigint session
        text expedient_text
        jsonb votes_parties_json
        bigint parliament_presence
        bigint votes_for
        bigint abstentions
        bigint votes_against
        bigint no_vote
        boolean assent
        timestamp date
        text BOE
    }

    proposal_likes {
        bigint id PK
        timestamp created_at
        bigint proposal_id FK
        bigint user_id FK
    }

    proposal_dislikes {
        bigint id PK
        timestamp created_at
        bigint proposal_id FK
        bigint user_id FK
    }

    users {
        bigint id PK
        timestamp register_date
        text name
        text password
        boolean is_admin
    }

    user_devices {
        bigint id PK
        bigint user_id FK
        varchar device_hash UK
        timestamp added_at
    }

    parties ||--o{ campaigns : has
    campaigns ||--o{ promises : contains
    parties ||--o{ promises : makes
    subjects ||--o{ promises : categorizes
    campaigns ||--o{ promises_readiness_index : evaluated_by
    users ||--o{ promises_readiness_index : creates
    proposals ||--o{ proposal_likes : receives
    users ||--o{ proposal_likes : gives
    proposals ||--o{ proposal_dislikes : receives
    users ||--o{ proposal_dislikes : gives
    users ||--o{ user_devices : owns
```

## Instalación

1.  Clona el repositorio: `git clone git@github.com:gabrielmoris/Demosratio.git`
2.  Navega al directorio del proyecto: `cd Demosratio`
3.  Instala las dependencias: `npm install`
4.  Inicia el servidor de desarrollo: `npm run next dev`

## Contribución

¡Las contribuciones son bienvenidas! Si deseas contribuir al proyecto, por favor, sigue estos pasos:

1.  Haz un fork del repositorio.
2.  Crea una nueva rama para tu contribución: `git checkout -b mi-contribucion`
3.  Realiza tus cambios y asegúrate de que las pruebas pasen.
4.  Envía un pull request con una descripción clara de tus cambios.

## Licencia

Este proyecto está bajo la Licencia Pública General de GNU v3.0.

## Creadores

- Gabriel Moris

## Contacto

Puedes contactarnos a través de nuestro perfil de GitHub: <https://github.com/gabrielmoris>

## Convención de branching

Utilizaremos la siguiente convención de branching:

- `main`: Rama principal con el código en producción.
- `develop`: Rama de desarrollo donde se integran los cambios.
- `feature/nombre-de-la-funcionalidad`: Ramas para desarrollar nuevas funcionalidades.
- `bugfix/nombre-del-error`: Ramas para corregir errores.

## Próximos pasos

- Implementar pruebas unitarias y de integración.
- Configurar el proceso de despliegue.
