'use client';

import { useState, useRef, useEffect } from 'react';
import { performFuzzing } from '@/services/fuzzing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import 'xterm/css/xterm.css';
import { toast } from '@/hooks/use-toast';

let Terminal: any;
let FitAddon: any;

const FuzzingPage = () => {
  const [url, setUrl] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<any | null>(null);
  const fitAddon = useRef<any>(null);
  const [currentProcess, setCurrentProcess] = useState<any>(null);
    const [outputPath, setOutputPath] = useState<string>(() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('fuzzingOutputPath') || '/home/kali/Desktop/';
      }
      return '/home/kali/Desktop/';
    });


  const tools = ['ffuf', 'wfuzz', 'gobuster'];

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

  const handleToolSelect = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleFuzzing = async () => {
    if (selectedTools.length === 0) {
      term.current?.writeln('Please select at least one fuzzing tool.');
      toast({
        title: "Error",
        description: 'Please select at least one fuzzing tool.',
      });
      return;
    }

    setLoading(true);
    setIsRunning(true);

    try {
      for (const tool of selectedTools) {
         const filePath = `${outputPath}${tool}`; // Construct the output file path
         term.current?.writeln(`Starting ${tool} on ${url}\r\n`);
         const process = performFuzzing(url, tool, filePath);
        setCurrentProcess(process);
        const result = await process;

        term.current?.writeln(result.output);
        term.current?.writeln(`\r\n${tool} completed.\r\n`);
         term.current?.writeln(`Scan completed and output saved to ${filePath}`);
                toast({
                  title: "Success",
                  description: `Fuzzing completed. Output read from ${filePath}`,
                });

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
    const handleOutputPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPath = e.target.value;
      setOutputPath(newPath);
      localStorage.setItem('fuzzingOutputPath', newPath);
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
            <Label htmlFor="outputPath">Output File Path</Label>
            <Input
              id="outputPath"
              placeholder="Enter output file path"
              value={outputPath}
              onChange={handleOutputPathChange}
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

export default FuzzingPage;

