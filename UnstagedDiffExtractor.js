const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function extractUnstagedDiff(repoPath) {
    const originalCwd = process.cwd(); // Save original working directory

    try {
        // 1. Verify if the path exists and is a directory
        if (!fs.existsSync(repoPath) || !fs.statSync(repoPath).isDirectory()) {
            throw new Error(`The provided path does not exist or is not a directory: ${repoPath}`);
        }

        // Change to the repository directory to execute git commands
        process.chdir(repoPath);

        // 2. Verify that it is a git repository
        execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });

        console.log(`\nGenerating unstaged diff for repository: ${path.basename(repoPath)}`);

        // 3. Generate the unstaged diff for MODIFIED and DELETED files
        let diffContent = execSync('git diff --patience').toString();

        // 4. Get content of NEW (untracked) files
        const untrackedFilesOutput = execSync('git ls-files --others --exclude-standard').toString().trim();
        const untrackedFiles = untrackedFilesOutput ? untrackedFilesOutput.split('\n') : [];

        if (untrackedFiles.length > 0) {
            console.log(`Found ${untrackedFiles.length} new (untracked) files.`);
            const newFilesContent = untrackedFiles.map(file => {
                try {
                    // Git diff uses forward slashes even on Windows
                    const gitStylePath = file.replace(/\\/g, '/');
                    const filePath = path.join(repoPath, file);
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    
                    // Ignore empty files
                    if (!fileContent.trim()) {
                        return null;
                    }

                    const lines = fileContent.split(/\r?\n/).map(line => `+${line}`).join('\n');
                    const lineCount = fileContent.split(/\r?\n/).length;

                    // Create a git-style header for the new file
                    const header = `diff --git a/${gitStylePath} b/${gitStylePath}\nnew file mode 100644\nindex 0000000..e69de29\n--- /dev/null\n+++ b/${gitStylePath}\n`;
                    const content = `@@ -0,0 +1,${lineCount} @@\n${lines}`;
                    
                    return `${header}${content}`;
                } catch (readError) {
                    console.warn(`Could not read new file ${file}, skipping. Error: ${readError.message}`);
                    return null;
                }
            }).filter(Boolean).join('\n\n');

            if (newFilesContent) {
                 diffContent = diffContent ? `${diffContent}\n${newFilesContent}` : newFilesContent;
            }
        }

        if (!diffContent.trim()) {
            console.log(`\nNo unstaged changes found in "${repoPath}". No file will be generated.`);
            return true; // Indicate success even if no diff
        }
        
        // 5. Create the output file name
        const fileName = `unstaged_diff_${path.basename(repoPath)}_${Date.now()}.txt`;
        const outputPath = path.join(originalCwd, fileName);

        // 6. Write the diff to the file in the original directory
        fs.writeFileSync(outputPath, diffContent);

        console.log('\n✅ Success!');
        console.log(`Unstaged diff saved to: ${outputPath}`);
        return true; // Indicate success

    } catch (error) {
        console.error('\n❌ Error: Could not generate unstaged diff.');
        if (error.message.includes('is-inside-work-tree')) {
            console.error(`The folder "${repoPath}" does not seem to be a Git repository.`);
        } else {
            console.error('Detail:', error.message);
        }
        return false; // Indicate failure
    } finally {
        // Ensure we always return to the original directory
        process.chdir(originalCwd);
    }
}

module.exports = { extractUnstagedDiff };