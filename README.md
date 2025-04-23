# Extractor de Código

Este script simple busca recursivamente archivos de código dentro de un directorio específico (`codeData`) y concatena todo su contenido en un único archivo de salida (`codigo_extraido.txt`). Cada fragmento de código en el archivo de salida está precedido por un encabezado que indica la ruta del archivo original.

Es útil para consolidar múltiples archivos de código fuente en uno solo, por ejemplo, para análisis o para preparar datos para modelos de IA.

## Requisitos

* [Node.js](https://nodejs.org/) instalado en tu sistema.

## Cómo Usarlo

1.  **Prepara tus archivos:**
    * Crea una carpeta llamada `codeData` en el mismo directorio donde guardaste `extractor.js`.
    * **Importante:** Coloca todas las carpetas y archivos de código que deseas procesar *dentro* de esta carpeta `codeData`. El script buscará recursivamente en su interior.
    * *(Nota: Si la carpeta `codeData` no existe la primera vez que ejecutas el script, este intentará crearla y te pedirá que coloques los archivos dentro y lo vuelvas a ejecutar).*

2.  **Ejecuta el Script:**
    * Abre tu terminal o línea de comandos.
    * Navega hasta el directorio donde se encuentran `extractor.js` y la carpeta `codeData`.
    * Ejecuta el siguiente comando:
        ```bash
        node extractor.js
        ```

3.  **Resultado:**
    * El script comenzará a procesar los archivos dentro de `codeData`. Verás en la consola los nombres de los archivos a medida que se procesan.
    * Una vez que termine, encontrarás un nuevo archivo llamado `codigo_extraido.txt` en el mismo directorio. Este archivo contendrá todo el código de los archivos encontrados, concatenado.

## Configuración (Opcional)

Si necesitas procesar tipos de archivo diferentes a los predefinidos, puedes editar directamente el script `extractor.js` y modificar la lista `CODE_EXTENSIONS` para incluir o quitar las extensiones de archivo que necesites.

```javascript
const CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx',
  '.py', '.java', '.c', '.cpp', '.cs',
  // ... (agrega o quita extensiones aquí)
];
