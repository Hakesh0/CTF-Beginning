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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, Eye, EyeOff } from "lucide-react"
import { Icons } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const WfuzzPage = () => {
  const [target, setTarget] = useState('');
  const [command, setCommand] = useState('wfuzz -u http://target/FUZZ');
  const [scanResult, setScanResult] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<any>(null);
  const [showOutput, setShowOutput] = useState(true);

  const handleFuzzing = async () => {
    if (!target) {
      toast({
        title: "Error",
        description: 'Please enter a target URL with FUZZ keyword.',
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
      const tool = "wfuzz";
      const filePath = path.join(outputPath, `wfuzz.txt`);
      const process = performFuzzing(target, command, filePath);
      setCurrentProcess(process);
      await process;
      const fileContent = await (await fetch(`/api/readFile?filePath=${filePath}`)).text();
      setScanResult(fileContent);
      toast({
        title: "Success",
        description: `Fuzzing with ${tool} completed and output saved to ${filePath}`,
      });
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
    <div className="flex justify-center items-start h-full pt-8">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>WFuzz</CardTitle>
          <CardDescription>Perform fuzzing using wfuzz.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`target-wfuzz`}>Target</Label>
            <Input
              id={`target-wfuzz`}
              placeholder="Enter URL with FUZZ keyword (e.g., http://ip.com/FUZZ)"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`command-wfuzz`}>Command</Label>
            <Input
              id={`command-wfuzz`}
              className="resize-none"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`outputPath-wfuzz`}>Output File Path</Label>
            <Input
              id={`outputPath-wfuzz`}
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowOutput(!showOutput)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Toggle Output Visibility
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {showOutput && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WfuzzPage;
