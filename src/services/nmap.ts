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
 * Represents the result of an Nmap scan.
 */
export interface NmapScanResult {
  /**
   * The IP address or domain that was scanned.
   */
  target: string;
  /**
   * The command that was executed.
   */
  command: string;
  /**
   * The raw output from Nmap.
   */
  output: string;
}

/**
 * Asynchronously performs an Nmap scan on a given IP address or domain.
 *
 * @param target The IP address or domain to scan.
 * @param command The Nmap command to execute.
 * @returns A promise that resolves to an NmapScanResult object.
 */
export async function performNmapScan(target: string, command: string): Promise<NmapScanResult> {
  if (!execAsync) {
    await initialize();
  }

  try {
    if (!execAsync) {
      console.error('execAsync is not initialized.  This indicates an issue with the environment.');
      return {
        target: target,
        command: command,
        output: 'Error: Server environment not properly initialized.',
      };
    }
    const { stdout, stderr } = await execAsync(`${command} ${target}`);

    if (stderr) {
      console.error('Nmap scan produced an error:', stderr);
    }

    return {
      target: target,
      command: command,
      output: stdout || stderr,
    };
  } catch (error: any) {
    console.error('Failed to execute Nmap scan:', error);
    return {
      target: target,
      command: command,
      output: `Error: ${error.message}`,
    };
  }
}
