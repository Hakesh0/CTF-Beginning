# **App Name**: CTF Toolkit

## Core Features:

- Nmap Scan: Perform a default Nmap scan (nmap -sC -sV -p- <ip-address>) on a given IP address or domain. The Nmap page should have the default command pre-filled and ready to execute. Nmap should have flag suggest when clicked should be added to the pre-filled command
- Fuzzing: Perform fuzzing using various tools like ffuf, wfuzz, and gobuster. The user should be able to input a URL with a FUZZ keyword (e.g., http://ip.com/FUZZ) and select one or more fuzzing tools to use.
- Results Display: Display the results of the Nmap scans and fuzzing attempts in a clear and organized table. Each entry should have an associated confidence score and a link to more detailed information.

## Style Guidelines:

- Primary color: Dark blue (#303f9f) similar to Firebase Studio's dark theme.
- Secondary color: Dark grey (#424242) for content areas.
- Accent: Orange (#FFB347) for CTAs and highlights.
- Use a card-based layout similar to Firebase Studio for displaying scan results and options.
- Use icons from a library like Material Icons to represent different tools and CTF platforms.

## Original User Request:
Assume this website is running on kali linux machine, i need to create a website that based only to solve CTF's (Capture the flag) from various platforms like picoctf, tryhackme, hackthebox, and more
the core features: (ip or domain is given)
1. nmap scan [ nmap -sC -sV -p- ,ip-address. ], in nmap page the default command should be ready to start 
2. fuzzing- must contain various tools like ffuf, wfuzz, gobuster , given a directory example: http://ip.com/FUZZ , should ask for which command to use and multiple commands can be used
more feature will be added in the future
The theme must be in same as firebase studio
  