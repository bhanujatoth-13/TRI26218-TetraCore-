import { FileItem } from '../types/ide';

export function bundleProjectForPreview(files: FileItem[]): string {
  const indexHtml = files.find(f => f.name.toLowerCase() === 'index.html');

  // Script to intercept console logs and report to parent IDE window
  const consoleInterceptor = `
    <script>
      (function() {
        const _log = console.log;
        const _info = console.info;
        const _warn = console.warn;
        const _error = console.error;

        function serializeArg(arg) {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg); } catch (e) { return String(arg); }
          }
          return String(arg);
        }

        function send(type, args) {
          const content = Array.from(args).map(serializeArg).join(' ');
          window.parent.postMessage({
            type: 'IDE_CONSOLE_LOG',
            logType: type,
            content: content,
            timestamp: new Date().toLocaleTimeString()
          }, '*');
        }

        console.log = function(...args) {
          _log.apply(console, args);
          send('log', args);
        };
        console.info = function(...args) {
          _info.apply(console, args);
          send('info', args);
        };
        console.warn = function(...args) {
          _warn.apply(console, args);
          send('warn', args);
        };
        console.error = function(...args) {
          _error.apply(console, args);
          send('error', args);
        };

        window.onerror = function(message, source, lineno, colno) {
          send('error', [\`Runtime Error: \${message} (Line \${lineno}:\${colno})\`]);
          return false;
        };
      })();
    </script>
  `;

  if (indexHtml) {
    let content = indexHtml.content;

    // Inject interceptor right after <head> or at top
    if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>${consoleInterceptor}`);
    } else {
      content = consoleInterceptor + content;
    }

    // Inline CSS files referenced in links
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    cssFiles.forEach(cssFile => {
      const linkRegex = new RegExp(`<link[^>]+href=["'](\\./)?${cssFile.name}["'][^>]*>`, 'gi');
      if (linkRegex.test(content)) {
        content = content.replace(linkRegex, `<style>/* Inlined ${cssFile.name} */\n${cssFile.content}</style>`);
      } else {
        // If not explicitly linked, append style before </head> or <body>
        const styleTag = `<style>\n${cssFile.content}\n</style>`;
        if (content.includes('</head>')) {
          content = content.replace('</head>', `${styleTag}</head>`);
        } else {
          content += styleTag;
        }
      }
    });

    // Inline JS files referenced in script tags
    const jsFiles = files.filter(f => f.name.endsWith('.js') && !f.name.endsWith('.min.js'));
    jsFiles.forEach(jsFile => {
      const scriptRegex = new RegExp(`<script[^>]+src=["'](\\./)?${jsFile.name}["'][^>]*>\\s*</script>`, 'gi');
      if (scriptRegex.test(content)) {
        content = content.replace(scriptRegex, `<script>/* Inlined ${jsFile.name} */\n${jsFile.content}\n</script>`);
      } else {
        const scriptTag = `<script>\n${jsFile.content}\n</script>`;
        if (content.includes('</body>')) {
          content = content.replace('</body>', `${scriptTag}</body>`);
        } else {
          content += scriptTag;
        }
      }
    });

    return content;
  }

  // Fallback for markdown or python projects:
  const pyFile = files.find(f => f.name.endsWith('.py'));
  if (pyFile) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  ${consoleInterceptor}
</head>
<body class="bg-slate-950 text-slate-200 p-6 font-mono text-sm">
  <div class="max-w-2xl mx-auto space-y-4">
    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
      <div class="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
        <i class="fa-brands fa-python"></i> Python File: ${pyFile.name}
      </div>
      <p class="text-xs text-slate-400">
        You are previewing a Python script. Switch to the <b>Terminal</b> or <b>Console</b> tab below to execute this script in real time, or check the terminal output!
      </p>
    </div>
    <div class="rounded-xl bg-black border border-slate-800 p-4 overflow-x-auto text-xs text-slate-300">
      <pre>${escapeHtml(pyFile.content)}</pre>
    </div>
  </div>
</body>
</html>`;
  }

  const mdFile = files.find(f => f.name.endsWith('.md'));
  if (mdFile) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  ${consoleInterceptor}
</head>
<body class="bg-slate-950 text-slate-200 p-8 font-sans max-w-3xl mx-auto">
  <div class="prose prose-invert">
    <pre class="bg-slate-900 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap">${escapeHtml(mdFile.content)}</pre>
  </div>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  ${consoleInterceptor}
</head>
<body class="bg-slate-950 text-slate-300 p-12 text-center font-sans">
  <h2 class="text-xl font-bold text-white mb-2">No previewable index.html found</h2>
  <p class="text-sm text-slate-400">Create an index.html file or choose one of the starter templates to start live previewing.</p>
</body>
</html>`;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
