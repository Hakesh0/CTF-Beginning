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

  const abortController = new AbortController();
  const signal = abortController.signal;

  const promise = new Promise<NmapScanResult>(async (resolve, reject) => {
    try {
      if (!execAsync) {
        console.error('execAsync is not initialized.  This indicates an issue with the environment.');
        resolve({
          target: target,
          command: command,
          output: 'Error: Server environment not properly initialized.',
        });
        return;
      }

      const { stdout, stderr } = await execAsync(`${command} ${target}`, { signal });

      if (stderr) {
        console.error('Nmap scan produced an error:', stderr);
      }

      resolve({
        target: target,
        command: command,
        output: stdout || stderr,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Nmap scan was aborted by the user.');
        resolve({
          target: target,
          command: command,
          output: 'Nmap scan was aborted.',
        });
      } else {
        console.error('Failed to execute Nmap scan:', error);
        resolve({
          target: target,
          command: command,
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
