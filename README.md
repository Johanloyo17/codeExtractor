# Code & Diff Extractor CLI

Este proyecto proporciona una herramienta de línea de comandos (CLI) para ayudarte a extraer código de proyectos o generar diferencias (diffs) de repositorios Git. Está diseñado para facilitar la preparación de contexto de código para modelos de IA como Gemini y Claude.

## Características

*   **Extracción de Código:** Consolida el contenido de múltiples archivos de código fuente en un único archivo de texto, útil para análisis o para proporcionar contexto a modelos de IA. Incluye la estructura del directorio y el contenido de los archivos.
*   **Generación de Diff de Git:** Genera un archivo de diferencias entre tu rama actual y una rama base (por defecto `develop`), ideal para revisar cambios o para proporcionar a la IA un resumen de las modificaciones.
*   **Interfaz de Consola Interactiva:** Una aplicación de consola fácil de usar que te guía a través de las opciones y solicita las rutas necesarias.

## Requisitos

*   [Node.js](https://nodejs.org/) (versión 14 o superior) instalado en tu sistema.
*   Para la funcionalidad de `Diff`, `Git` debe estar instalado y el directorio proporcionado debe ser un repositorio Git válido.

## Instalación

1.  **Clona o descarga el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd codeExtrator
    ```
2.  **Instala las dependencias (si las hubiera):**
    Aunque este proyecto utiliza principalmente módulos incorporados de Node.js, es una buena práctica ejecutar:
    ```bash
    npm install
    ```

## Cómo Usarlo

Puedes ejecutar la aplicación de dos maneras:

### Opción 1: Usando `npm start`

Desde el directorio raíz del proyecto:
```bash
npm start
```

### Opción 2: Ejecutando directamente el script CLI

Desde el directorio raíz del proyecto:
```bash
./cli.js
```
*(Asegúrate de que `cli.js` tenga permisos de ejecución: `chmod +x cli.js`)*

### Interacción en la Consola

Una vez que inicies la aplicación, se te presentará un menú:

1.  **Extraer Código del Proyecto:**
    *   Se te pedirá la ruta completa de la carpeta de la cual deseas extraer el código.
    *   El script recorrerá recursivamente la carpeta, ignorando directorios comunes como `node_modules`, `.git`, etc.
    *   Generará un archivo `codigo_extraido_<nombre_carpeta>_<timestamp>.txt` en el directorio actual, que contendrá la estructura del proyecto y el contenido de los archivos de código.

2.  **Generar Diff de un Repositorio Git (entre ramas):**
    *   Se te pedirá la ruta completa del repositorio Git.
    *   El script detectará tu rama actual y generará un diff contra la rama `develop` (por defecto).
    *   Se creará un archivo `diff de <rama_actual> - develop.txt` en el directorio actual con las diferencias.

3.  **Extraer Diff de Cambios No Commiteados (unstaged):**
    *   Se te pedirá la ruta completa del repositorio Git.
    *   El script generará un diff que incluye solo los cambios que aún no han sido añadidos al área de staging o commiteados.
    *   Se creará un archivo `unstaged_diff_<nombre_repositorio>_<timestamp>.txt` en el directorio actual con estos cambios.

## Configuración (Opcional)

*   **Extensiones de Código (`CodeExtractor.js`):** Puedes modificar la lista `CODE_EXTENSIONS` en `CodeExtractor.js` para incluir o excluir tipos de archivos específicos.
*   **Rama Base para Diff (`DiffExtractor.js`):** Puedes cambiar la `BASE_BRANCH` en `DiffExtractor.js` si deseas generar diffs contra una rama diferente a `develop`.