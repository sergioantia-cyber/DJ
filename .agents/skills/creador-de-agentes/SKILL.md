---
name: creador-de-agentes
description: Guía y metodología para diseñar, configurar y crear Agentes Personalizados (Custom Agents) en Google Antigravity (Antigravity 2.0, Antigravity CLI y Antigravity IDE), basándose en la especificación oficial de Google Antigravity.
---

# Habilidad: Creador de Agentes Personalizados (Google Antigravity)

Esta habilidad enseña a diseñar, estructurar y desplegar **Agentes Personalizados (Custom Agents)** en Google Antigravity según la arquitectura oficial anunciada en Antigravity 2.0 y Antigravity CLI.

---

## 1. ¿Qué es un Custom Agent y por qué usarlo?

Los asistentes de codificación de propósito general sufren de dos limitaciones fundamentales:
1. **Falta de especialización:** Desconocen las convenciones internas de pruebas, arquitectura o despliegue del proyecto a menos que se les explique repetidamente.
2. **Saturación de contexto (*Context Window Bloat*):** Cargar un prompt monolítico con todas las guías del repositorio en cada interacción consume el presupuesto de tokens y ralentiza al modelo.

Un **Custom Agent** es una configuración declarativa basada en un archivo Markdown (`.md`) con cabecera YAML Frontmatter que define:
- Un rol hiperespecífico.
- Instrucciones de sistema delimitadas (*scoped instructions*).
- Un conjunto estricto de herramientas permitidas (*scoped tools*).
- Habilidades específicas asignadas (*curated skills*).
- Políticas de seguridad y ejecución autónoma de comandos.

---

## 2. Ubicación de Archivos de Agentes

Antigravity descubre automáticamente los agentes en dos niveles:

| Ámbito | Ruta | Propósito |
| :--- | :--- | :--- |
| **Workspace (Proyecto)** | `.agents/agents/<nombre-agente>.md` | Compartido con todo el equipo mediante control de versiones (Git). Disponible al clonar el repo. |
| **Global (Usuario)** | `~/.gemini/config/agents/<nombre-agente>.md` | Disponible para todas las carpetas y proyectos en tu máquina local. |

---

## 3. Estructura y Especificación del Archivo (`.md`)

Cada agente se define en un único archivo Markdown compuesto por:
1. **Cabecera YAML Frontmatter:** Metadatos de ejecución, permisos y herramientas.
2. **Cuerpo Markdown:** Las instrucciones centrales (*Core Instructions*) compiladas directamente en el System Prompt del agente.

### Plantilla Estándar:

```markdown
---
name: nombre-del-agente
description: Descripción concisa del rol del agente y cuándo debe ser invocado por el orquestador.
model: flash | pro | inherit
mainAgent: true
subagent: true
permissionMode: acceptEdits
commandExecutionPolicy: auto
tools:
  - view_file
  - replace_file_content
  - write_to_file
  - run_command
  - manage_task
skills:
  - skills/mi-habilidad-especifica
---

# Instrucciones Principales
Eres un agente especializado en [Rol]. Tu objetivo es [Objetivo].

## Reglas Operativas
1. [Regla 1]
2. [Regla 2]

## Flujo de Trabajo
1. Analizar el problema.
2. Ejecutar cambios mínimos y precisos.
3. Verificar con pruebas automáticas.
```

---

## 4. Campos del Frontmatter (Propiedades Únicas de Antigravity)

### A. Simetría de Ejecución (`mainAgent` vs `subagent`)
A diferencia de otras plataformas donde los agentes personalizados solo pueden ser subagentes ocultos:
- `mainAgent: true`: Permite seleccionar el agente directamente desde el selector de la interfaz gráfica de **Antigravity 2.0** o iniciarlo desde la terminal con:
  ```bash
  agy --agent nombre-del-agente
  ```
- `subagent: true`: Permite que un agente orquestador invoque a este agente de forma dinámica en segundo plano para tareas delegadas.

### B. Políticas de Seguridad de Comandos (`commandExecutionPolicy`)
- `commandExecutionPolicy: auto`: Permite que el agente ejecute comandos seguros de compilación, pruebas y análisis (ej. `npm test`, `pytest`, `cargo check`) de forma autónoma sin pedir confirmaciones manuales continuas, mientras que los comandos destructivos o de alto riesgo permanecen bloqueados para aprobación del usuario.
- `permissionMode: acceptEdits`: Aplica ediciones de código eficientemente en el espacio de trabajo.

### C. Herramientas y Habilidades Restringidas (`tools` y `skills`)
Evita la confusión de herramientas y el desperdicio de tokens restringiendo exactamente lo que el agente necesita:
```yaml
tools:
  - view_file
  - replace_file_content
  - run_command
skills:
  - skills/package-upgrade-rules
```

---

## 5. Proceso para Crear un Nuevo Agente Paso a Paso

Cuando el usuario pida crear un nuevo agente:
1. **Definir el propósito:** Determinar el rol (ej. `auditor-seguridad`, `optimizador-bd`, `redactor-tests`, `migrador-supabase`).
2. **Seleccionar el modelo:**
   - `flash`: Para tareas ágiles, pruebas, migraciones de paquetes y refactorizaciones directas.
   - `pro`: Para arquitectura compleja, razonamiento profundo y diseño de sistemas.
3. **Restringir herramientas:** Incluir únicamente las herramientas indispensables para su función.
4. **Redactar el System Prompt:** Instrucciones claras, directas, con ejemplos de entrada y salida esperada.
5. **Guardar el archivo:**
   - En el proyecto: `.agents/agents/<nombre>.md`
   - O global: `~/.gemini/config/agents/<nombre>.md`
6. **Verificar:** Confirmar que la sintaxis YAML sea válida y que el archivo esté en la ubicación correcta.
