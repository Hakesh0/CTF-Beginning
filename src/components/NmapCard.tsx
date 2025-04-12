
'use client';

import { performNmapScan } from '@/services/nmap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

const NmapCard = () => {
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
    <Card className="w-full md:w-1/2">
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
            <Textarea
              readOnly
              className="resize-none bg-muted"
              value={output}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NmapCard;
