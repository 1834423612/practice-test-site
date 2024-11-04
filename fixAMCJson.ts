import { promises as fs } from 'fs';

interface Option {
    label: string;
    value: string;
}

interface Problem {
    id: string;
    question: string;
    options: Option[];
    correct_option: string;
    solution: string | string[];
}

interface AMCData {
    problems: Problem[];
}

async function fixAMCJson(): Promise<void> {
    try {
        const data = await fs.readFile('./src/data/AMC/2023_12A.json', 'utf8');
        const json: AMCData = JSON.parse(data);

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
        await fs.writeFile(
            './src/data/AMC/2023_12A_fixed.json',
            JSON.stringify(json, null, 2),
            'utf8'
        );

        console.log('Successfully fixed AMC JSON file');
    } catch (error) {
        console.error('Error fixing AMC JSON:', error);
    }
}

function escapeLatex(text: string): string {
    return text.replace(/\\/g, '\\\\');
}

fixAMCJson();

// Run the function
fixAMCJson().then(() => console.log('Finished processing AMC JSON'));