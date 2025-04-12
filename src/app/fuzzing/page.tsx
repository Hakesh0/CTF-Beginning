'use client';

import { useState } from 'react';
import { performFuzzing } from '@/services/fuzzing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const FuzzingPage = () => {
  const [url, setUrl] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const tools = ['ffuf', 'wfuzz', 'gobuster'];

  const handleToolSelect = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleFuzzing = async () => {
    if (selectedTools.length === 0) {
      setOutput('Please select at least one fuzzing tool.');
      return;
    }

    setLoading(true);
    try {
      let allOutputs = '';
      for (const tool of selectedTools) {
        const result = await performFuzzing(url, tool);
        allOutputs += `Tool: ${tool}\n${result.output}\n\n`;
      }
      setOutput(allOutputs);
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
                    />
                    <Label htmlFor={tool}>{tool}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleFuzzing} disabled={loading}>
              {loading ? 'Fuzzing...' : 'Start Fuzzing'}
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

export default FuzzingPage;
