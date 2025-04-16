'use client';

import { useState, useRef, useEffect } from 'react';
import { performNmapScan } from '@/services/nmap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import 'xterm/css/xterm.css';
import { toast } from '@/hooks/use-toast';
import path from 'path';

let Terminal: any;
let FitAddon: any;

const NmapPage = () => {
  const [target, setTarget] = useState('');
  const [command, setCommand] = useState('nmap -sC -sV -p-');
  const [outputPath, setOutputPath] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<any | null>(null);
  const fitAddon = useRef<any>(null);
  const [currentProcess, setCurrentProcess] = useState<any>(null);

  useEffect(() => {
  }, []);

  const handleNmapScan = async () => {
    if (!target) {
      toast({
        title: "Error",
        description: 'Please enter a target IP address or domain.',
      });
      return;
    }

    if (!outputPath) {
      toast({
        title: "Error",
        description: 'Please enter an output file path.',
      });
      return;
    }

    setLoading(true);
    setIsRunning(true);
    setScanResult('');

    try {
      const filePath = path.join(outputPath, 'nmap_output.txt');
      const process = performNmapScan(target, command, filePath);
      setCurrentProcess(process);
      const result = await process;

      if (result.output) {
        setScanResult(result.output);
        toast({
          title: "Error",
          description: result.output,
        });
      } else {
        // Read the content of the file and set it to scanResult
        const fileContent = await (await fetch(`/api/readFile?filePath=${filePath}`)).text();
        setScanResult(fileContent);
        toast({
          title: "Success",
          description: `Nmap scan completed and output saved to ${filePath}`,
        });
      }
    } catch (error: any) {
       setScanResult(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: `Nmap scan failed: ${error.message}`,
      });
    } finally {
      setLoading(false);
      setIsRunning(false);
      setCurrentProcess(null);
    }
  };

  const handleInterrupt = () => {
    if (currentProcess) {
      currentProcess.cancel();
      toast({
        title: "Info",
        description: 'Nmap scan interrupted by user.',
      });
      setIsRunning(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Nmap Scan</CardTitle>
          <CardDescription>Perform an Nmap scan on a given IP address or domain.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="target">Target</Label>
            <Input
              id="target"
              placeholder="Enter IP address or domain"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="command">Command</Label>
            <Input
              id="command"
              className="resize-none"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="outputPath">Output File Path</Label>
            <Input
              id="outputPath"
              placeholder="Enter output file path"
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNmapScan} disabled={loading || isRunning}>
              {loading ? 'Scanning...' : 'Start Scan'}
            </Button>
            <Button
              onClick={handleInterrupt}
              disabled={!isRunning}
              variant="destructive"
            >
              Interrupt
            </Button>
          </div>
          <div className="grid gap-2">
            <Label>Output</Label>
            <Textarea
              readOnly
              className="resize-none bg-secondary"
              value={scanResult}
              placeholder="Nmap scan output will be displayed here."
              style={{ height: '400px' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NmapPage;
