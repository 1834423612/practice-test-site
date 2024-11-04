import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeLatex(text) {
    return text.replace(/\\/g, '\\\\');
}

async function fixAMCJson() {
    try {
        // Adjust the file paths to be relative to the current directory
        const inputPath = path.join(__dirname, 'src', 'data', 'AMC', '2023_12A.json');
        const outputPath = path.join(__dirname, 'src', 'data', 'AMC', '2023_12A_fixed.json');

        const data = await fs.readFile(inputPath, 'utf8');
        const json = JSON.parse(data);

        // Fix LaTeX content in questions and options
        json.problems = json.problems.map(problem => ({
            ...problem,
            question: escapeLatex(problem.question),
            options: problem.options.map(option => ({
                ...option,
                value: escapeLatex(option.value)
            })),
            solution: Array.isArray(problem.solution)
                ? problem.solution.map(escapeLatex)
                : escapeLatex(problem.solution)
        }));

        // Write the fixed JSON back to file
        await fs.writeFile(outputPath, JSON.stringify(json, null, 2), 'utf8');

        console.log('Successfully fixed AMC JSON file');
    } catch (error) {
        console.error('Error fixing AMC JSON:', error);
    }
}

// Run the function
fixAMCJson();