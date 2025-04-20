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

const FuzzingPage = () => {
  const [tabs, setTabs] = useState([{ id: 'ffuf-tab', target: '', command: 'ffuf -u http://target/FUZZ', outputPath: '' }]);
  const [activeTab, setActiveTab] = useState('ffuf-tab');
  const [nextTabNumber, setNextTabNumber] = useState(2);

  const addTab = (tool: string) => {
    const newTabId = `${tool}-tab${nextTabNumber}`;
    setTabs([...tabs, { id: newTabId, target: '', command: `${tool} -u http://target/FUZZ`, outputPath: '' }]);
    setActiveTab(newTabId);
    setNextTabNumber(nextTabNumber + 1);
  };

  const removeTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);
    setActiveTab(newTabs[0].id);
  };

  const updateTab = (tabId: string, field: string, value: string) => {
    setTabs(tabs.map(tab => tab.id === tabId ? { ...tab, [field]: value } : tab));
  };

  const resetTabs = () => {
    setTabs([{ id: 'ffuf-tab', target: '', command: 'ffuf -u http://target/FUZZ', outputPath: '' }]);
    setActiveTab('ffuf-tab');
    setNextTabNumber(2);
  };

  const tools = ['ffuf', 'wfuzz', 'gobuster'];

  return (
    <div className="flex justify-center items-start h-full pt-8">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Fuzzing</CardTitle>
          <CardDescription>Perform fuzzing using various tools.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs defaultValue={activeTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList>
                {tools.map((tool) => {
                  const tabId = `${tool}-tab`;
                  return (
                    <TabsTrigger value={tabId} key={tabId}>
                      {tool}
                      {tabs.length > 1 && (
                        <span
                          className="ml-2 rounded-md p-1 hover:bg-gray-200 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTab(tabId);
                          }}
                        >
                          <Icons.close className="h-4 w-4" />
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
                <Button variant="outline" size="sm" onClick={() => addTab("ffuf")}>
                  Add New Scan
                </Button>
              </TabsList>
              <Button variant="ghost" size="icon" onClick={resetTabs}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            {tabs.map((tab) => (
              <TabsContent value={tab.id} key={tab.id} className="mt-4">
                <FuzzingTabContent
                  tabId={tab.id}
                  target={tabs.find(t => t.id === tab.id)?.target || ''}
                  command={tabs.find(t => t.id === tab.id)?.command || ''}
                  outputPath={tabs.find(t => t.id === tab.id)?.outputPath || ''}
                  updateTab={updateTab}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface FuzzingTabContentProps {
  tabId: string;
  target: string;
  command: string;
  outputPath: string;
  updateTab: (tabId: string, field: string, value: string) => void;
}

const FuzzingTabContent: React.FC<FuzzingTabContentProps> = ({
  tabId,
  target,
  command,
  outputPath,
  updateTab,
}) => {
  const [scanResult, setScanResult] = useState('');
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
      const tool = tabId.split('-')[0];
      const filePath = path.join(outputPath, `${tool}_${tabId}.txt`);
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
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`target-${tabId}`}>Target</Label>
        <Input
          id={`target-${tabId}`}
          placeholder="Enter URL with FUZZ keyword (e.g., http://ip.com/FUZZ)"
          value={target}
          onChange={(e) => updateTab(tabId, 'target', e.target.value)}
          disabled={isRunning}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`command-${tabId}`}>Command</Label>
        <Input
          id={`command-${tabId}`}
          className="resize-none"
          value={command}
          onChange={(e) => updateTab(tabId, 'command', e.target.value)}
          disabled={isRunning}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`outputPath-${tabId}`}>Output File Path</Label>
        <Input
          id={`outputPath-${tabId}`}
          placeholder="Enter output file path"
          value={outputPath}
          onChange={(e) => updateTab(tabId, 'outputPath', e.target.value)}
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
    </div>
  );
};

export default FuzzingPage;
