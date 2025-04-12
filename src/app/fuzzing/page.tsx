'use client';

import { useState, useRef, useEffect } from 'react';
import { performFuzzing } from '@/services/fuzzing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const FuzzingPage = () => {
  const [url, setUrl] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef(new FitAddon());
  const [currentProcess, setCurrentProcess] = useState<any>(null);

  const tools = ['ffuf', 'wfuzz', 'gobuster'];

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

  const handleToolSelect = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleFuzzing = async () => {
    if (selectedTools.length === 0) {
      term.current?.writeln('Please select at least one fuzzing tool.');
      return;
    }

    setLoading(true);
    setIsRunning(true);

    try {
      for (const tool of selectedTools) {
        term.current?.writeln(`Starting ${tool} on ${url}\r\n`);
        const process = performFuzzing(url, tool);
        setCurrentProcess(process);
        const result = await process;

        term.current?.writeln(result.output);
        term.current?.writeln(`\r\n${tool} completed.\r\n`);

      }
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
      currentProcess.cancel(); // Assuming performFuzzing returns a promise that can be cancelled
      term.current?.writeln('\r\nFuzzing interrupted by user.\r\n');
      setIsRunning(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Fuzzing</CardTitle>
          <CardDescription>Perform fuzzing using various tools.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="url">URL with FUZZ keyword</Label>
            <Input
              id="url"
              placeholder="Enter URL with FUZZ keyword (e.g., http://ip.com/FUZZ)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div className="grid gap-2">
            <Label>Select Fuzzing Tools</Label>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={tool}
                    checked={selectedTools.includes(tool)}
                    onCheckedChange={() => handleToolSelect(tool)}
                    disabled={isRunning}
                  />
                  <Label htmlFor={tool}>{tool}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleFuzzing} disabled={loading || isRunning}>
              {loading ? 'Fuzzing...' : 'Start Fuzzing'}
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

export default FuzzingPage;
