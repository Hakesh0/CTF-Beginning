'use server';
 import { promisify } from 'util';
 import path from 'path';

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
   * The raw output from the fuzzing tool.
   */
  output: string;
 }

 /**
  * Asynchronously performs an Nmap scan on a given IP address or domain.
  *
  * @param target The IP address or domain to scan.
  * @param command The Nmap command to execute.
  * @param outputPath The path to the file where the output should be saved.
  * @returns A promise that resolves when the scan is complete.
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

      const nmapCommand = `${command} ${target}`;
      console.log(`Executing: ${nmapCommand}`);
      const { stdout, stderr } = await execAsync(nmapCommand, { signal });

      resolve({
        target: target,
        command: command,
        output: stdout,
      });
    } catch (error :any) {
      if (error.name === 'AbortError') {
        console.log('Nmap scan was aborted by the user.');
        resolve({
          target: target,
          command: command,
          output: 'Nmap scan was aborted.',
        });
      } else {
        console.error(`❌ Error: ${error.message}`);
        resolve({
          target: target,
          command: command,
          output: `Nmap scan failed: ${error.message}`,
        });
      }
    }
  });

  (promise as any).cancel = () => {
    abortController.abort();
  };

  return promise;
}
