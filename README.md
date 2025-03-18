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
  - Página principal: Resumen de promesas y decisiones recientes.
  - Votos en el congreso: Decisiones ordenadas por fecha. Con búsqueda por texto de expediente.
  - Promesas electorales: Promesas y decisiones agrupadas por temas.
  - Visualización de datos: Gráficos y tablas interactivas. cuando se clicka en los votos
  - Simulacros de votación: Votaciones simuladas sobre temas de actualidad.
  - Aportación de información: Formulario para añadir promesas y decisiones. (NO MVP)
  - Denuncias de manipulación: Formulario para denunciar información falsa. (NO MVP)
  - Manifiesto: Información sobre el proyecto y sus creadores.
  - Contacto: Formulario de contacto.

## Tecnologías

- **Frontend**: Next.js, Typescript
- **Backend**: Express (o Next.js), Bun.js, Docker

## Base de Datos

```mermaid
erDiagram
    users {
        int id PK
        varchar email
        varchar password
        date register_date
    }

    user_devices {
        int id PK
        int user_id FK
        varchar device_hash UNIQUE
        timestamp added_at
    }

    political_parties {
        int id PK
        varchar name
        text logo
        varchar abbreviation UNIQUE
    }

    sources {
        int id PK
        text url
        date date
        int user_id FK
        varchar source_type
    }

    proposals {
        int id PK
        text title
        text url
        int session
        text expedient_text
        jsonb votes_parties_json
        int parliament_presence
        int votes_for
        int abstentions
        int votes_against
        int no_vote
        boolean assent
        date date
    }

    proposal_likes {
        int id PK
        int proposal_id FK
        int user_id FK
        timestamp created_at
    }

    proposal_dislikes {
        int id PK
        int proposal_id FK
        int user_id FK
        timestamp created_at
    }

    promises {
        int id PK
        text text
        text url
        int political_party_id FK
        date date
    }

    promises_status_reached {
        int id PK
        int promise_id FK
        int user_id FK
        timestamp created_at
    }

    promises_status_not_reached {
        int id PK
        int promise_id FK
        int user_id FK
        timestamp created_at
    }

    users ||--o{ user_devices : "one-to-many"
    users ||--o{ sources : "one-to-many"
    users ||--o{ proposal_likes : "one-to-many"
    users ||--o{ proposal_dislikes : "one-to-many"
    users ||--o{ promises_status_reached : "one-to-many"
    users ||--o{ promises_status_not_reached : "one-to-many"
    political_parties ||--o{ promises : "one-to-many"
    proposals ||--o{ proposal_likes : "one-to-many"
    proposals ||--o{ proposal_dislikes : "one-to-many"
    promises ||--o{ promises_status_reached : "one-to-many"
    promises ||--o{ promises_status_not_reached : "one-to-many"
```

## Instalación

1.  Clona el repositorio: `git clone git@github.com:gabrielmoris/Demosratio.git`
2.  Navega al directorio del proyecto: `cd Demosratio`
3.  Instala las dependencias: `bun install`
4.  Inicia el servidor de desarrollo: `bun run next dev`

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
