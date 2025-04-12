'use client';

import { useState } from 'react';
import { performNmapScan } from '@/services/nmap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const NmapPage = () => {
  const [target, setTarget] = useState('');
  const [command, setCommand] = useState('nmap -sC -sV -p-');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNmapScan = async () => {
    setLoading(true);
    try {
      const result = await performNmapScan(target, command);
      setOutput(result.output);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex flex-col items-center p-4">
        <Card className="w-full max-w-2xl">
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="command">Command</Label>
              <Textarea
                id="command"
                className="resize-none"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
            </div>
            <Button onClick={handleNmapScan} disabled={loading}>
              {loading ? 'Scanning...' : 'Start Scan'}
            </Button>
            {output && (
                <div className="grid gap-2">
                  <Label>Output</Label>
                  <ScrollArea className="h-80 rounded-md border p-4 bg-black text-green-400 font-mono text-sm">
                    <pre>{output}</pre>
                  </ScrollArea>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default NmapPage;
