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
 * @returns A promise that resolves to a FuzzingResult object.
 */
export async function performFuzzing(url: string, tool: string, outputPath: string): Promise<FuzzingResult> {
  if (!execAsync) {
    await initialize();
  }

  const abortController = new AbortController();
  const signal = abortController.signal;

  const promise = new Promise<FuzzingResult>(async (resolve, reject) => {
    try {
       if (!execAsync) {
         console.error('execAsync is not initialized.  This indicates an issue with the environment.');
         resolve({
           url: url,
           tool: tool,
           output: 'Error: Server environment not properly initialized.',
         });
         return;
       }

       const nmapCommand = `${tool} -u ${url}`;
        console.log(`Executing: ${nmapCommand}`);
       const { stdout, stderr } = await execAsync(nmapCommand, { signal });

        try {
          const dirname = path.dirname(outputPath);
          await fs.mkdir(dirname, { recursive: true });
          await fs.writeFile(outputPath, stdout, 'utf8');
          resolve({
            url: url,
            tool: tool,
            output: `Fuzzing completed. Output saved to: ${outputPath}`,
          });
        } catch (saveError: any) {
          resolve({
            url: url,
            tool: tool,
            output: `Fuzzing completed, but failed to save output to ${outputPath}: ${saveError.message}`,
          });
        }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(`${tool} was aborted by the user.`);
        resolve({
          url: url,
          tool: tool,
          output: `${tool} was aborted.`,
        });
      } else {
        console.error(`Failed to execute ${tool}:`, error);
        resolve({
          url: url,
          tool: tool,
          output: `Error: ${error.message}`,
        });
      }
    }
  });

  (promise as any).cancel = () => {
    abortController.abort();
  };

  return promise;
}


