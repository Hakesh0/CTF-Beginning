'use server';

import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

let execAsync: any;

async function initialize() {
  if (typeof window === 'undefined') {
    const { exec } = await import('child_process');
    execAsync = promisify(exec);
  }
}

/**
 * Represents the result of a fuzzing attempt.
 */
export interface FuzzingResult {
  /**
   * The URL that was fuzzed.
   */
  url: string;
  /**
   * The tool that was used for fuzzing (e.g., ffuf, wfuzz, gobuster).
   */
  tool: string;
  /**
   * The raw output from the fuzzing tool.
   */
  output: string;
}

/**
 * Asynchronously performs fuzzing on a given URL using a specified tool.
 *
 * @param url The URL to fuzz, containing the FUZZ keyword.
 * @param tool The fuzzing tool to use.
 * @param outputPath The path to the file where the output should be saved.
 * @returns A promise that resolves to a FuzzingResult object.
 */
export async function performFuzzing(url: string, tool: string, outputPath: string): Promise<FuzzingResult> {
  return new Promise((resolve, reject) => {
    const fullCommand = `${tool} -u ${url}`;

    const { exec } = require('child_process');
    exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject({
          url: url,
          tool: tool,
          output: `Error: ${error.message}`,
        });
        return;
      }
      if (stderr) {
        console.error(`⚠️ stderr: ${stderr}`);
      }

      try {
        const dirname = path.dirname(outputPath);
        fs.mkdirSync(dirname, { recursive: true });
        fs.writeFileSync(outputPath, stdout, 'utf8');
        console.log(`✅ Fuzzing with ${tool} complete. Output saved to: ${outputPath}`);
        resolve({
          url: url,
          tool: tool,
          output: '',
        });
      } catch (saveError: any) {
        resolve({
          url: url,
          tool: tool,
          output: `Fuzzing completed, but failed to save output to ${outputPath}: ${saveError.message}`,
        });
      }
    });
  });
}
