'use client';

import { useState, useRef, useEffect } from 'react';
import { performNmapScan } from '@/services/nmap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import 'xterm/css/xterm.css';
import { toast } from '@/hooks/use-toast';
import path from 'path';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"
import { Textarea } from '@/components/ui/textarea';
import {Icons} from "@/components/icons";

let Terminal: any;
let FitAddon: any;

const NmapPage = () => {
  const [tabs, setTabs] = useState([{ id: 'tab1', target: '', command: 'nmap -sC -sV -p-', outputPath: '' }]);
  const [activeTab, setActiveTab] = useState('tab1');

  const addTab = () => {
    const newTabId = `tab${tabs.length + 1}`;
    setTabs([...tabs, { id: newTabId, target: '', command: 'nmap -sC -sV -p-', outputPath: '' }]);
    setActiveTab(newTabId);
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

  return (
    <div className="flex justify-center items-start h-full pt-8">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Nmap Scan</CardTitle>
          <CardDescription>Perform an Nmap scan on a given IP address or domain.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger value={tab.id} key={tab.id}>
                  {tab.id}
                  {tabs.length > 1 && (
                    <span
                      className="ml-2 rounded-md p-1 hover:bg-gray-200 cursor-pointer"
                      onClick={() => removeTab(tab.id)}
                    >
                      <Icons.close className="h-4 w-4" />
                    </span>
                  )}
                </TabsTrigger>
              ))}
              <Button variant="outline" size="sm" onClick={addTab}>
                Add New Scan
              </Button>
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent value={tab.id} key={tab.id} className="mt-4">
                <NmapTabContent
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

interface NmapTabContentProps {
  tabId: string;
  target: string;
  command: string;
  outputPath: string;
  updateTab: (tabId: string, field: string, value: string) => void;
}

const NmapTabContent: React.FC<NmapTabContentProps> = ({
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
      const fileContent = await (await fetch(`/api/readFile?filePath=${filePath}`)).text();
      setScanResult(fileContent);
      toast({
        title: "Success",
        description: `Nmap scan completed and output saved to ${filePath}`,
      });
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
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`target-${tabId}`}>Target</Label>
        <Input
          id={`target-${tabId}`}
          placeholder="Enter IP address or domain"
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
    </div>
  );
};

export default NmapPage;
