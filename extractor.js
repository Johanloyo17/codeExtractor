const fs = require('fs');
const path = require('path');

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

// Función para verificar si un archivo es un archivo de código
function isCodeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CODE_EXTENSIONS.includes(ext);
}

// Función para extraer código de forma recursiva
async function extractCodeRecursive(dirPath, basePath, outputStream) {
  try {
    // Leer los archivos en el directorio actual
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);
      
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
    console.error(`Error al leer el directorio ${dirPath}:`, error.message);
  }
}

// Función principal
async function main() {
  try {
    console.log(`Iniciando extracción de código desde: ${CODE_DATA_DIR}`);
    
    // Verificar si el directorio existe
    try {
      await fs.promises.access(CODE_DATA_DIR);
    } catch (error) {
      console.error(`El directorio ${CODE_DATA_DIR} no existe. Creándolo...`);
      await fs.promises.mkdir(CODE_DATA_DIR, { recursive: true });
      console.log(`Directorio ${CODE_DATA_DIR} creado. Por favor, coloca tus archivos de código ahí y vuelve a ejecutar el script.`);
      return;
    }
    
    // Crear stream de escritura para el archivo de salida
    const outputStream = fs.createWriteStream(OUTPUT_FILE);
    
    // Escribir encabezado en el archivo de salida
    outputStream.write(`EXTRACCIÓN DE CÓDIGO PARA ENTRENAMIENTO DE IA\n`);
    outputStream.write(`Fecha de extracción: ${new Date().toISOString()}\n`);
    outputStream.write(`${'='.repeat(80)}\n\n`);
    
    // Procesar todos los archivos recursivamente
    await extractCodeRecursive(CODE_DATA_DIR, CODE_DATA_DIR, outputStream);
    
    // Cerrar el stream de escritura
    outputStream.end();
    
    console.log(`\nProceso completado. El código extraído se ha guardado en: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error en el proceso principal:', error.message);
  }
}

// Ejecutar la función principal
main();