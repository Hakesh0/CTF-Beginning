'use client';

import { useState, useRef, useEffect } from 'react';
import { performNmapScan } from '@/services/nmap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import 'xterm/css/xterm.css';

let Terminal: any;
let FitAddon: any;

const NmapPage = () => {
  const [target, setTarget] = useState('');
  const [command, setCommand] = useState('nmap -sC -sV -p-');
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<any | null>(null);
  const fitAddon = useRef<any>(null);
  const [currentProcess, setCurrentProcess] = useState<any>(null);

  useEffect(() => {
    const initTerminal = async () => {
      Terminal = (await import('xterm')).Terminal;
      FitAddon = (await import('xterm-addon-fit')).FitAddon;
      fitAddon.current = new FitAddon();
      if (terminalRef.current) {
        term.current = new Terminal({
          theme: {
            background: '#2E3440', // Nord Dark - Polar Night 0
            foreground: '#D8DEE9', // Nord Dark - Snow Storm 3
            cursor: '#D8DEE9',
            selectionBackground: 'rgba(255, 255, 255, 0.3)',
          },
          fontFamily: 'Menlo, monospace',
          fontSize: 12,
          cursorStyle: 'bar',
          cursorBlink: true,
        });
        term.current.loadAddon(fitAddon.current);
        term.current.open(terminalRef.current);
        fitAddon.current.fit();
      }
    };

    if (typeof window !== 'undefined') {
      initTerminal();
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
            <div className="rounded-lg bg-[#1E1E1E] shadow-md">
              <div className="flex items-center h-8 rounded-t-lg bg-[#333333] px-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                </div>
              </div>
              <div ref={terminalRef} className="terminal-container font-mono text-sm px-4 py-2" style={{ height: '400px', width: '100%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NmapPage;
