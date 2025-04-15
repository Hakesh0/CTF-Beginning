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

  let fs: any;

  if (typeof window === 'undefined') {
    fs = await import('fs/promises');
  }


  let Terminal: any;
  let FitAddon: any;
  const NmapPage = () => {
   const [target, setTarget] = useState('');
   const [command, setCommand] = useState('nmap -sC -sV -p-');
   const [output, setOutput] = useState('');
   const [loading, setLoading] = useState(false);
   const terminalRef = useRef<HTMLDivElement>(null);
   const term = useRef<any | null>(null);
   const fitAddon = useRef<any>(null);
   const [isRunning, setIsRunning] = useState(false);
   const [currentProcess, setCurrentProcess] = useState<any>(null);
   const [outputPath, setOutputPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
     return localStorage.getItem('nmapOutputPath') || '/home/kali/Desktop/';
    }
    return '/home/kali/Desktop/';
   });

   useEffect(() => {
    const initTerminal = async () => {
     Terminal = (await import('xterm')).Terminal;
     FitAddon = (await import('xterm-addon-fit')).FitAddon;
     fitAddon.current = new FitAddon();
     if (terminalRef.current) {
      term.current = new Terminal({
       theme: {
        background: '#2E3440',
        foreground: '#D8DEE9',
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
     toast({
      title: "Error",
      description: 'Please enter a target IP address or domain.',
     });
     return;
    }
    if (!outputPath) {
     term.current?.writeln('Please enter an output file path.');
     toast({
      title: "Error",
      description: 'Please enter an output file path.',
     });
     return;
    }

    setLoading(true);
    setIsRunning(true);

    try {
     const filePath = `${outputPath}/nmap`;
     term.current?.writeln(`Starting Nmap scan on ${target}\r\n`);
     const process = performNmapScan(target, command, filePath);
     setCurrentProcess(process);
     const result = await process;
     term.current?.writeln(`Scan completed and output saved to ${filePath}\r\n`);
     const fileContent = await fs.readFile(filePath, 'utf-8');
     term.current?.writeln(fileContent);
     toast({
      title: "Success",
      description: `Nmap scan completed. Output read from ${filePath}`,
     });

    } catch (error: any) {
     term.current?.writeln(`Error: ${error.message}`);
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
     term.current?.writeln('\r\nNmap scan interrupted by user.\r\n');
     setIsRunning(false);
     setLoading(false);
    }
   };

   const handleOutputPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.target.value;
    setOutputPath(newPath);
    localStorage.setItem('nmapOutputPath', newPath);
   };

   return (
    <>

       Nmap Scan
       Perform an Nmap scan on a given IP address or domain.

       
        Target
        
         Enter IP address or domain
         
        
       
       
        Command
        
         
        
       
       
        Output File Path
        
         
        
       
       
        
         {loading ? 'Scanning...' : 'Start Scan'}
        
         Interrupt
        
       
       
        Output
        
         
          
           
            
            
            
           
          
          {/* <div ref={terminalRef} className="terminal-container font-mono text-sm px-4 py-2" style={{ height: '400px', width: '100%' }} /> */}
          
         
        
       
     
    </>
   );
  };

  export default NmapPage;
