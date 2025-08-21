#!/usr/bin/env node
const readline = require('readline');
const path = require('path');
const { extractCode } = require('./CodeExtractor');
const { generarDiff } = require('./DiffExtractor');
const { extractUnstagedDiff } = require('./UnstagedDiffExtractor');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\nBienvenido al Extractor de Código y Diff de Proyectos!');
  console.log('---------------------------------------------------');

  let choice;
  while (true) {
    console.log('\nPor favor, selecciona una opción:');
    console.log('1. Extraer Código del Proyecto (para IA como Gemini/Claude)');
    console.log('2. Generar Diff de un Repositorio Git (entre ramas)');
    console.log('3. Extraer Diff de Cambios No Commiteados (unstaged)');
    choice = await askQuestion('Ingresa el número de tu elección (1, 2 o 3): ');
    if (choice === '1' || choice === '2' || choice === '3') {
      break;
    } else {
      console.log('Opción no válida. Por favor, ingresa 1, 2 o 3.');
    }
  }

  const inputPath = await askQuestion('\nIngresa la ruta completa de la carpeta/repositorio a procesar: ');
  const absoluteInputPath = path.resolve(inputPath); // Convertir a ruta absoluta

  let success = false;

  if (choice === '1') {
    const outputFileName = `codigo_extraido_${path.basename(absoluteInputPath)}_${Date.now()}.txt`;
    const outputFilePath = path.join(process.cwd(), outputFileName);
    console.log(`\nIniciando extracción de código desde: ${absoluteInputPath}`);
    console.log(`El resultado se guardará en: ${outputFilePath}`);
    success = await extractCode(absoluteInputPath, outputFilePath);
    if (success) {
      console.log('\n✅ ¡Extracción de código completada con éxito!');
      console.log(`Archivo de salida: ${outputFilePath}`);
    } else {
      console.log('\n❌ La extracción de código falló. Revisa los mensajes anteriores para más detalles.');
    }
  } else if (choice === '2') {
    console.log(`\nIniciando generación de diff entre ramas para el repositorio: ${absoluteInputPath}`);
    success = await generarDiff(absoluteInputPath);
    if (success) {
      console.log('\n✅ ¡Generación de diff entre ramas completada con éxito!');
    } else {
      console.log('\n❌ La generación de diff entre ramas falló. Revisa los mensajes anteriores para más detalles.');
    }
  } else if (choice === '3') {
    console.log(`\nIniciando extracción de diff de cambios no commiteados para el repositorio: ${absoluteInputPath}`);
    success = await extractUnstagedDiff(absoluteInputPath);
    if (success) {
      console.log('\n✅ ¡Extracción de diff de cambios no commiteados completada con éxito!');
    } else {
      console.log('\n❌ La extracción de diff de cambios no commiteados falló. Revisa los mensajes anteriores para más detalles.');
    }
  }

  rl.close();
  console.log('\nProceso finalizado.');
}

main();
