'use server';

import { promisify } from 'util';

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
export async function performFuzzing(url: string, tool: string): Promise<FuzzingResult> {
  if (!execAsync) {
    await initialize();
  }
  try {
    if (!execAsync) {
      console.error('execAsync is not initialized.  This indicates an issue with the environment.');
      return {
        url: url,
        tool: tool,
        output: 'Error: Server environment not properly initialized.',
      };
    }
    const { stdout, stderr } = await execAsync(`${tool} -u ${url}`);

    if (stderr) {
      console.error(`${tool} produced an error:`, stderr);
    }

    return {
      url: url,
      tool: tool,
      output: stdout || stderr,
    };
  } catch (error: any) {
    console.error(`Failed to execute ${tool}:`, error);
    return {
      url: url,
      tool: tool,
      output: `Error: ${error.message}`,
    };
  }
}
