'use client';

import { useState, useRef, useEffect } from 'react';
import { performFuzzing } from '@/services/fuzzing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import path from 'path';

const FuzzingPage = () => {
  const [url, setUrl] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [outputPath, setOutputPath] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<any>(null);

  const tools = ['ffuf', 'wfuzz', 'gobuster'];

  const handleToolSelect = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleFuzzing = async () => {
    if (selectedTools.length === 0) {
      toast({
        title: "Error",
        description: 'Please select at least one fuzzing tool.',
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
      let allOutputs = '';
      for (const tool of selectedTools) {
        const filePath = path.join(outputPath, `${tool}_output.txt`);
        const process = performFuzzing(url, tool, filePath);
        setCurrentProcess(process);
        const result = await process;
        if (result.output) {
          setScanResult(result.output);
          toast({
            title: "Error",
            description: result.output,
          });
        } else {
          const fileContent = await (await fetch(`/api/readFile?filePath=${filePath}`)).text();
          setScanResult(fileContent);
          toast({
            title: "Success",
            description: `Fuzzing with ${tool} completed and output saved to ${filePath}`,
          });
        }
      }
    } catch (error: any) {
      setScanResult(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: `Fuzzing failed: ${error.message}`,
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
        description: 'Fuzzing interrupted by user.',
      });
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
            <Textarea
              readOnly
              className="resize-none bg-secondary"
              value={scanResult}
              placeholder="Fuzzing output will be displayed here."
              style={{ height: '400px' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuzzingPage;
