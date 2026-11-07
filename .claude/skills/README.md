# Skills de diseño de este proyecto

Skills de terceros copiadas tal cual desde sus repositorios oficiales (Claude Code las carga desde `.claude/skills/`).
Las licencias están en [`THIRD_PARTY_LICENSES/`](THIRD_PARTY_LICENSES/).

| Skill(s) | Autor | Origen y versión copiada | Licencia |
| --- | --- | --- | --- |
| `emil-design-eng`, `animate`, `animation-performance`, `animation-vocabulary`, `apple-design`, `break-ui`, `choreograph`, `find-animation-opportunities`, `improve-animations`, `mobile-native`, `pick-ui-library`, `prototype`, `remove-animations`, `review-animations` | Emil Kowalski | [emilkowalski/skill](https://github.com/emilkowalski/skill) @ `c8a7962` | MIT |
| `impeccable` (v4.8.0, motor 0.1.18) | Paul Bakaus | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) @ `687bc38` | Apache-2.0 |
| `taste-skill` (nombre interno `design-taste-frontend`, v2.5.0) | Leonxlnx | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) @ `9b4bf93` | MIT |
| `frontend-design`, `web-artifacts-builder` | Anthropic | [anthropics/skills](https://github.com/anthropics/skills) @ `2c5958e` | Apache-2.0 (`LICENSE.txt` dentro de cada carpeta) |
| 13 skills `threejs-*` (fundamentals, geometry, materials, lighting, shaders, postprocessing, animation, interaction, loaders, textures, performance, asset-pipeline, react-three-fiber) | CloudAI-X | [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills) @ `0e18186` | MIT |
| 8 skills `gsap-*` (core, timeline, scrolltrigger, plugins, react, frameworks, performance, utils) | GreenSock (oficial) | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) @ `aed9cfd` | MIT |
| `design-dna` | zanwei | [zanwei/design-dna](https://github.com/zanwei/design-dna) @ `593e39b` | MIT |
| `motion-design` | LottieFiles | [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) @ `f9a8a04` | MIT |
| `cast`, `paint`, `bunshin` + módulos `_jutsu/` (v4.1.3) | AThevon | [AThevon/genjutsu](https://github.com/AThevon/genjutsu) @ `5e00595` | MIT (el módulo `ui-ux-pro-max` trae su licencia MIT original en `_jutsu/ui-ux-pro-max/LICENSE-upstream.txt`) |

## Qué se omitió a propósito

- **Emil Kowalski:** `animate-expo` (React Native), `write-swift` (Swift) y `ask-sonner` (librería de toasts para React). No aplican a un sitio HTML/CSS/JS estático. Se pueden añadir copiando su carpeta desde el repo de origen.
- **Taste:** se copió solo la guía en Markdown (`SKILL.md`, `references/`, `library/`). No se incluyó `assets/` (38 MB: plantillas, escenas, imágenes) ni `scripts/` (verificador con Node + Chrome), para no inflar el repositorio. Las partes de la skill que mencionan esos archivos no funcionarán aquí. Para la versión completa: `npx skills add Leonxlnx/taste-skill` en tu computadora (queda en tu carpeta de usuario, no en el repo).
- **Impeccable:** se copió la skill (`SKILL.md`, `reference/`, `scripts/`) como la distribuye su autor. **No** se activaron sus *hooks* ni sus agentes (ver abajo).

## Three.js, GSAP, Design DNA, Motion Design y Genjutsu: notas

- **Three.js (13) y GSAP (8):** solo Markdown. Este sitio no usa 3D ni GSAP hoy, así que no aportan nada hasta que se añadan; cada skill suma su descripción al contexto de las sesiones. Si estorban, basta borrar sus carpetas.
- **Design DNA:** extrae el "ADN de diseño" (tokens, estilo, efectos) de imágenes o URLs de referencia y genera UI a partir de él. Sus scripts de medición de color son opcionales y usan `sharp`: la skill ejecuta `npm install` dentro de `design-dna/scripts/` (el `node_modules` resultante está ignorado por git). No se copiaron sus tests ni las imágenes de documentación.
- **Genjutsu** se invoca como `/cast`, `/paint` y `/bunshin` (no como `/genjutsu:cast`, que es el nombre cuando se instala como plugin). Las carpetas `cast/`, `paint/`, `bunshin/` y `_jutsu/` deben seguir **juntas**: así encuentran sus módulos.
  - `cast`: añade movimiento a una interfaz concreta, proponiendo antes una "tesis de interacción" para tu aprobación.
  - `paint`: rediseña la identidad visual completa. En un proyecto con diseño existente pregunta primero si mantener la marca; en Terrafirma, responder siempre que se **mantiene** el logo y la paleta.
  - `bunshin`: reconstruye un sitio entero con muchos subagentes. Anuncia su costo y pide confirmación antes de empezar; no usarla sin querer rehacer todo.
  - Incluye módulos para Android y Apple que no aplican a este sitio. Sus scripts (`shoot.mjs` lanza un Chrome local, `audit.py` es análisis estático, `search.py` consulta un CSV local) solo corren si se invocan. Sin hooks.
- **Solapamiento:** Impeccable, Taste, `frontend-design`, `paint`, `motion-design` y las skills de Emil dan guías distintas para lo mismo. Pide **una** por tarea y nómbrala.

## Anthropic: notas

- `frontend-design` es solo guía de diseño (sin scripts). Impeccable se apoya en ella, así que sus criterios se solapan; si dos skills dan indicaciones opuestas, gana lo que pida el brief del proyecto.
- `web-artifacts-builder` sirve para crear *artifacts* de claude.ai con React + Vite + Tailwind + shadcn/ui, empaquetados en un solo HTML. **No encaja con este sitio** (HTML/CSS/JS estático sin paso de compilación); está aquí por si se necesita. Su `init-artifact.sh` instala `pnpm` de forma **global** si no lo encuentra y descarga dependencias de npm; solo se ejecuta si se invoca la skill.

## Impeccable: lo que conviene saber

- Su lanzador (`impeccable/scripts/impeccable`) descarga una vez, desde las *releases* oficiales de GitHub, un binario del motor y lo **verifica contra un SHA-256** incluido en `scripts/engine-checksums.txt`; si no coincide, no lo ejecuta. Necesita acceso de red a GitHub. Sin él, la skill sigue funcionando en modo reducido (lee `PRODUCT.md` y `DESIGN.md` del proyecto).
- El autor propone *hooks* que ejecutan ese binario al iniciar la sesión, tras cada `Edit`/`Write` y al terminar cada turno. **Aquí están desactivados.** Si los quieres, instala el plugin oficial desde Claude Code: `/plugin marketplace add pbakaus/impeccable`.
- Uso: `/impeccable` con un subcomando (`audit`, `critique`, `polish`, `animate`, `layout`, `typeset`, `init`…). `init` genera `PRODUCT.md` y `DESIGN.md`.

## Figma

`/.mcp.json` declara el servidor MCP remoto oficial de Figma (`https://mcp.figma.com/mcp`). En Claude Code, ejecuta `/mcp`, elige `figma` e inicia sesión con tu cuenta de Figma (la autenticación es tuya; no se guarda ninguna credencial en el repo).
