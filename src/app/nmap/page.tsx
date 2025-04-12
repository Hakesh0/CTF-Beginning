'use client';

import { useState, useRef, useEffect } from 'react';
import { performNmapScan } from '@/services/nmap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const NmapPage = () => {
  const [target, setTarget] = useState('');
  const [command, setCommand] = useState('nmap -sC -sV -p-');
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());
  const [currentProcess, setCurrentProcess] = useState<any>(null);

  useEffect(() => {
    if (terminalRef.current) {
      term.current = new Terminal();
      term.current.loadAddon(fitAddon.current);
      term.current.open(terminalRef.current);
      fitAddon.current.fit();
    }

    return () => {
      term.current?.dispose();
    };
  }, []);

  const handleNmapScan = async () => {
    if (!target) {
      term.current?.writeln('Please enter a target IP address or domain.');
      return;
    }

    setLoading(true);
    setIsRunning(true);

    try {
      term.current?.writeln(`Starting Nmap scan on ${target} with command: ${command}\r\n`);
      const process = performNmapScan(target, command);
      setCurrentProcess(process);
      const result = await process;

      term.current?.writeln(result.output);
      term.current?.writeln('\r\nNmap scan completed.\r\n');

    } catch (error: any) {
      term.current?.writeln(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setIsRunning(false);
      setCurrentProcess(null);
    }
  };

  const handleInterrupt = () => {
    if (currentProcess) {
      currentProcess.cancel(); // Assuming performNmapScan returns a promise that can be cancelled
      term.current?.writeln('\r\nNmap scan interrupted by user.\r\n');
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
            <div ref={terminalRef} className="terminal-container bg-black text-green-400 font-mono text-sm" style={{ height: '400px', width: '100%' }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NmapPage;
