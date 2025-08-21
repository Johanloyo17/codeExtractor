const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- CONFIGURACIÓN ---
const BASE_BRANCH = 'develop';
// --------------------

function generarDiff(repoPath) {
    const originalCwd = process.cwd(); // Guardamos el directorio original

    try {
        // 1. Verificar si la ruta existe y es un directorio
        if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
            throw new Error(`La ruta proporcionada no existe o no es un directorio: ${repoPath}`);
        }

        // Cambiamos al directorio del repositorio para ejecutar los comandos de git
        process.chdir(repoPath);

        // 2. Verificar que es un repositorio de git
        execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });

        // 3. Obtener el nombre de la rama actual
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        console.log(`Repositorio: ${path.basename(repoPath)}`);
        console.log(`Rama actual detectada: ${currentBranch}`);

        if (currentBranch === BASE_BRANCH) {
            console.log(`
Advertencia: Ya estás en la rama "${BASE_BRANCH}". No hay nada que comparar.`);
            return true; // Indicar éxito aunque no haya diff
        }

        // 4. Actualizar la información del remoto para tener la última versión de 'develop'
        console.log('Actualizando información del repositorio remoto (git fetch)...');
        execSync('git fetch', { stdio: 'inherit' }); // 'inherit' para ver el progreso

        const remoteBaseBranch = `origin/${BASE_BRANCH}`;

        // 5. Generar el contenido del diff
        console.log(`Generando diff entre "${remoteBaseBranch}" y "${currentBranch}"...`);
        const diffContent = execSync(`git diff ${remoteBaseBranch}...HEAD`).toString();

        if (!diffContent.trim()) {
            console.log(`
No se encontraron diferencias entre "${remoteBaseBranch}" y "${currentBranch}". No se generará ningún archivo.`);
            return true; // Indicar éxito aunque no haya diff
        }
        
        // Reemplazar slashes en nombres de rama (ej. feature/login -> feature-login) para un nombre de archivo válido
        const sanitizedBranchName = currentBranch.replace(/\//g, '-');
        
        // 6. Crear el nombre del archivo de salida
        const fileName = `diff de "${sanitizedBranchName} - ${BASE_BRANCH}".txt`;
        const outputPath = path.join(originalCwd, fileName);

        // 7. Escribir el diff en el archivo en el directorio original
        fs.writeFileSync(outputPath, diffContent);

        console.log('\n✅ ¡Éxito!');
        console.log(`El diff ha sido guardado en: ${outputPath}`);
        return true; // Indicar éxito

    } catch (error) {
        console.error('\n❌ Error: No se pudo generar el diff.');
        // Imprime un mensaje más amigable dependiendo del error
        if (error.message.includes('is-inside-work-tree')) {
            console.error(`La carpeta "${repoPath}" no parece ser un repositorio de Git.`);
        } else if (error.stderr && error.stderr.toString().includes(`pathspec '${BASE_BRANCH}' did not match`)) {
            console.error(`No se pudo encontrar la rama "${BASE_BRANCH}" o "${remoteBaseBranch}" en el repositorio.`);
        } else {
            console.error('Detalle:', error.message);
        }
        return false; // Indicar fallo
    } finally {
        // Asegurarnos de volver siempre al directorio original
        process.chdir(originalCwd);
    }
}

module.exports = { generarDiff };
