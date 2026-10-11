import { FileItem } from '../types/ide';

export interface CommandResult {
  output: string;
  isError?: boolean;
}

export function executeTerminalCommand(cmd: string, files: FileItem[], onClear: () => void): CommandResult {
  const trimmed = cmd.trim();
  if (!trimmed) return { output: '' };

  const parts = trimmed.split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (command === 'clear') {
    onClear();
    return { output: '' };
  }

  if (command === 'help') {
    return {
      output: `Available IDE Terminal Commands:
  ls                     List files and directories
  cat <filename>         Display content of a file
  python <file.py>       Run Python script in virtual runtime
  node <file.js>         Execute JavaScript file
  npm run dev            Start development dev server
  npm run build          Build production bundle
  git status             Check Git working tree & poluanjali/IDE status
  git commit -m "msg"    Record changes to repository
  git push               Push changes to GitHub main branch
  theme                  List available themes
  date                   Display current system date & time
  whoami                 Print active user
  clear                  Clear the terminal screen
  help                   Show this command list`
    };
  }

  if (command === 'whoami') {
    return { output: 'poluanjali (github: poluanjali/IDE)' };
  }

  if (command === 'date') {
    return { output: new Date().toUTCString() };
  }

  if (command === 'ls') {
    const list = files
      .map(f => `${f.isFolder ? '📁 ' : '📄 '} ${f.name}   \x1b[90m(${f.isFolder ? 'dir' : f.language})\x1b[0m`)
      .join('\n');
    return { output: list };
  }

  if (command === 'cat') {
    if (!args[0]) return { output: 'Usage: cat <filename>', isError: true };
    const target = files.find(f => f.name.toLowerCase() === args[0].toLowerCase());
    if (!target) return { output: `cat: ${args[0]}: No such file or directory`, isError: true };
    if (target.isFolder) return { output: `cat: ${args[0]}: Is a directory`, isError: true };
    return { output: target.content };
  }

  if (command === 'git') {
    const sub = args[0]?.toLowerCase();
    if (sub === 'status') {
      return {
        output: `On branch main
Your branch is up to date with 'origin/main' (github.com/poluanjali/IDE).

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)

	modified:   index.html
	modified:   README.md

no changes added to commit (use "git add")`
      };
    }
    if (sub === 'commit') {
      return {
        output: `[main 7aed17c] ${args.slice(1).join(' ') || 'Update IDE workspace and components'}
 3 files changed, 142 insertions(+), 8 deletions(-)
 Ready to push to origin/main`
      };
    }
    if (sub === 'push') {
      return {
        output: `Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 8 threads
Compressing objects: 100% (7/7), done.
Writing objects: 100% (7/7), 2.45 KiB | 2.45 MiB/s, done.
Total 7 (delta 4), reused 0 (delta 0), pack-reused 0
To https://github.com/poluanjali/IDE.git
   7aed17c..8bf43e9  main -> main
Everything up-to-date with poluanjali/IDE!`
      };
    }
    if (sub === 'pull') {
      return {
        output: `From https://github.com/poluanjali/IDE
 * branch            main     -> FETCH_HEAD
Already up to date.`
      };
    }
    return {
      output: `git ${sub || ''}: command recognized. Target repository: https://github.com/poluanjali/IDE`
    };
  }

  if (command === 'npm') {
    if (args[0] === 'run' && args[1] === 'dev') {
      return {
        output: `> poluanjali-ide-preview@1.0.0 dev
> vite

  VITE v5.4.1  ready in 184 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help`
      };
    }
    if (args[0] === 'run' && args[1] === 'build') {
      return {
        output: `> poluanjali-ide-preview@1.0.0 build
> vite build

vite v5.4.1 building for production...
✓ 4 modules transformed.
dist/index.html                   0.82 kB │ gzip: 0.42 kB
dist/assets/index-C3e8r9a.css     2.14 kB │ gzip: 0.91 kB
dist/assets/index-Bt87w2y.js     14.52 kB │ gzip: 5.12 kB
✓ built in 220ms`
      };
    }
    return { output: `npm: executed ${args.join(' ')} successfully.` };
  }

  if (command === 'python' || command === 'python3') {
    const filename = args[0] || 'main.py';
    const pyFile = files.find(f => f.name.toLowerCase() === filename.toLowerCase());
    
    if (!pyFile) {
      return { output: `python: can't open file '${filename}': [Errno 2] No such file or directory`, isError: true };
    }

    // Run custom benchmark simulation based on python file
    return {
      output: `[Python 3.11.4 Virtual Interpreter]
Running '${pyFile.name}'...
=============================================
  PYTHON RUNTIME & ALGORITHM BENCHMARK
=============================================

[1] Fibonacci Memoization:
    Fib(10) = 55           (calc in 0.0120 ms)
    Fib(20) = 6765         (calc in 0.0142 ms)
    Fib(30) = 832040       (calc in 0.0178 ms)
    Fib(40) = 102334155    (calc in 0.0210 ms)

[2] QuickSort of 12 items:
    Input:  [64, 34, 25, 12, 22, 11, 90, 48, 77, 3, 85, 19]
    Sorted: [3, 11, 12, 19, 22, 25, 34, 48, 64, 77, 85, 90]

✅ Process exited with code 0 (0.042 seconds elapsed)`
    };
  }

  if (command === 'node') {
    const filename = args[0] || 'app.js';
    const jsFile = files.find(f => f.name.toLowerCase() === filename.toLowerCase());
    if (!jsFile) {
      return { output: `node: cannot find module '${filename}'`, isError: true };
    }
    return {
      output: `[Node.js v20.11.0]
> Loading ${jsFile.name}
⚡ [DevStudio] IDE Sandbox initialized successfully!
🚀 Backlog and canvas handlers ready.`
    };
  }

  if (command === 'echo') {
    return { output: args.join(' ') };
  }

  return {
    output: `bash: ${command}: command not found. Type 'help' to see available commands.`,
    isError: true
  };
}
