const fs = require('fs');
const path = require('path');
const { Writable } = require('stream'); // Necesario para la estructura

// Directorio que contiene los archivos de código a procesar
const CODE_DATA_DIR = path.join(__dirname, 'codeData');
// Archivo de salida donde se guardará todo el código extraído
const OUTPUT_FILE = path.join(__dirname, 'codigo_extraido.txt');

// Extensiones de archivo a considerar como código
// Puedes modificar esta lista según tus necesidades
const CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx',
  '.py', '.java', '.c', '.cpp', '.cs',
  '.go', '.rb', '.php', '.swift',
  '.html', '.css', '.scss', '.less',
  '.json', '.xml', '.yaml', '.yml',
  '.md', '.sh', '.bash', '.sql'
];

// Patrones (nombres de directorio/archivo) a ignorar
const IGNORE_PATTERNS = [
    'node_modules',
    '.git',
    '.vscode',
    'dist',
    'build',
    'coverage',
    '.DS_Store' // Común en macOS
];

// Función para verificar si una ruta debe ser ignorada
function shouldIgnore(entryPath) {
    const baseName = path.basename(entryPath);
    return IGNORE_PATTERNS.some(pattern => baseName === pattern);
}

// Función para verificar si un archivo es un archivo de código
function isCodeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CODE_EXTENSIONS.includes(ext);
}

// Nueva función para obtener la estructura del directorio
async function getDirectoryStructure(dirPath, indent = '', outputStream) {
    try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (shouldIgnore(fullPath)) {
                continue; // Saltar si coincide con un patrón de ignorar
            }
            outputStream.write(`${indent}${entry.isDirectory() ? '┗━━ ' : '┣━━ '}${entry.name}\n`);
            if (entry.isDirectory()) {
                await getDirectoryStructure(fullPath, indent + '    ', outputStream);
            }
        }
    } catch (error) {
        console.error(`Error al leer la estructura del directorio ${dirPath}:`, error.message);
        outputStream.write(`${indent}┣━━ ERROR AL LEER DIRECTORIO: ${path.basename(dirPath)}\n`);
    }
}

// Función para extraer código de forma recursiva (modificada para ignorar)
async function extractCodeRecursive(dirPath, basePath, outputStream) {
  try {
    // Leer los archivos en el directorio actual
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      // Ignorar si coincide con patrones
      if (shouldIgnore(fullPath)) {
          console.log(`Ignorando: ${relativePath}`);
          continue;
      }

      if (entry.isDirectory()) {
        // Si es un directorio, procesarlo recursivamente
        await extractCodeRecursive(fullPath, basePath, outputStream);
      } else if (entry.isFile() && isCodeFile(fullPath)) {
        // Si es un archivo de código, leer su contenido y escribirlo en el archivo de salida
        try {
          const content = await fs.promises.readFile(fullPath, 'utf8');
          
          // Escribir la ruta relativa del archivo como encabezado
          outputStream.write(`\n\n${'='.repeat(80)}\n`);
          outputStream.write(`ARCHIVO: ${relativePath}\n`);
          outputStream.write(`${'='.repeat(80)}\n\n`);
          
          // Escribir el contenido del archivo
          outputStream.write(content);
          
          console.log(`Procesado: ${relativePath}`);
        } catch (error) {
          console.error(`Error al leer el archivo ${relativePath}:`, error.message);
        }
      }
    }
  } catch (error) {
    // Solo mostrar error si no es porque el directorio fue ignorado
    if (!shouldIgnore(dirPath)) {
        console.error(`Error al leer el directorio ${dirPath}:`, error.message);
    }
  }
}

// Función principal (modificada para añadir estructura y manejar errores de directorio)
async function extractCode(inputDirPath, outputFilePath) {
  let outputStream;
  try {
    console.log(`Iniciando extracción de código desde: ${inputDirPath}`);
    
    // Verificar si el directorio existe
    try {
      await fs.promises.access(inputDirPath);
    } catch (error) {
      console.error(`El directorio ${inputDirPath} no existe.`);
      throw new Error(`El directorio de entrada no es válido: ${inputDirPath}`);
    }
    
    // Crear stream de escritura para el archivo de salida
    outputStream = fs.createWriteStream(outputFilePath);
    
    // Escribir encabezado en el archivo de salida
    outputStream.write(`EXTRACCIÓN DE CÓDIGO PARA ENTRENAMIENTO DE IA\n`);
    outputStream.write(`Fecha de extracción: ${new Date().toISOString()}\n`);
    outputStream.write(`Directorio base: ${inputDirPath}\n`); // Añadir directorio base
    outputStream.write(`${'='.repeat(80)}\n\n`);

    // Escribir la estructura del directorio
    outputStream.write(`ESTRUCTURA DEL PROYECTO:\n`);
    outputStream.write(`${path.basename(inputDirPath)}\n`); // Nombre del directorio raíz
    await getDirectoryStructure(inputDirPath, '    ', outputStream);
    outputStream.write(`\n${'='.repeat(80)}\n\n`);
    outputStream.write(`CONTENIDO DE LOS ARCHIVOS:\n`);

    // Procesar todos los archivos recursivamente
    await extractCodeRecursive(inputDirPath, inputDirPath, outputStream);
    
    // Cerrar el stream de escritura
    outputStream.end();
    
    console.log(`\nProceso completado. El código extraído se ha guardado en: ${outputFilePath}`);
    return true; // Indicar éxito
  } catch (error) {
    console.error('Error en el proceso principal de extracción de código:', error.message);
    // Asegurarse de cerrar el stream si hubo un error antes de end()
    if (outputStream && !outputStream.closed) {
        outputStream.end();
    }
    return false; // Indicar fallo
  }
}

module.exports = { extractCode };
