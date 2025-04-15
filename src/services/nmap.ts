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
}

/**
 * Asynchronously performs an Nmap scan on a given IP address or domain.
 *
 * @param target The IP address or domain to scan.
 * @param command The Nmap command to execute.
 * @param outputPath The path to the file where the output should be saved.
 * @returns A promise that resolves when the scan is complete.
 */
export async function performNmapScan(target: string, command: string, outputPath: string): Promise<NmapScanResult> {
  return new Promise((resolve, reject) => {
    const fullCommand = `${command} ${target}`;

    const { exec } = require('child_process');
    exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject({
          target: target,
          command: command,
        });
        return;
      }
      if (stderr) {
        console.error(`⚠️ stderr: ${stderr}`);
      }

      try {
        const dirname = path.dirname(outputPath);
        fs.mkdirSync(dirname, { recursive: true });
        fs.writeFileSync(outputPath, stdout);
        console.log(`✅ Nmap scan complete. Output saved to: ${outputPath}`);
        resolve({
          target: target,
          command: command,
        });
      } catch (err: any) {
        console.error(`❌ Error writing to file: ${err.message}`);
        reject({
          target: target,
          command: command,
        });
      }
    });
  });
}
