import JSZip from 'jszip';
import { FileItem } from '../types/ide';

export async function exportProjectAsZip(files: FileItem[], projectName: string = 'ide-project'): Promise<void> {
  const zip = new JSZip();

  files.forEach(file => {
    if (!file.isFolder) {
      // Clean path, remove leading slash
      const cleanPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      zip.file(cleanPath, file.content);
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
