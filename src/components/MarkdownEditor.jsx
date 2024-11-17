import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Bold, 
  Italic, 
  List, 
  Heading, 
  Link as LinkIcon, 
  Code,
  Quote,
  FileDown,
  FileUp,
  Table2,
  CheckSquare,
  Moon,
  Sun,
  FileCode,
FileText
} from 'lucide-react';

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState('# Welcome to the Enhanced Markdown Editor\n\nStart typing to see the preview!\n\n## Features:\n- [x] Tables\n- [x] Task Lists\n- [x] Dark Mode\n- [x] Multiple Export Formats\n\n### Example Table:\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |');
  const [preview, setPreview] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);


  const convertToHtml = useCallback((text) => {
    // Headers
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Task Lists
    text = text.replace(/- \[(x| )\] (.*$)/gm, (match, checked, content) => 
      `<div class="flex items-center gap-2">
        <input type="checkbox" ${checked === 'x' ? 'checked' : ''} disabled>
        <span>${content}</span>
      </div>`
    );
    
    // Tables
    text = text.replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map(cell => cell.trim());
      return `<tr>${cells.map(cell => {
        if (cell.match(/^[-:]+$/)) {
          return ''; // Skip separator row
        }
        return `<td class="border px-4 py-2">${cell}</td>`;
      }).join('')}</tr>`;
    });
    text = text.replace(/<tr>.*?<\/tr>/g, (match) => {
      if (match.includes('border')) {
        return `<table class="border-collapse my-4">${match}</table>`;
      }
      return match;
    });
    
    // Lists
    text = text.replace(/^\- (.+)/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    // Code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => 
      `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded"><code class="language-${lang || 'text'}">${code}</code></pre>`
    );
    
    // Inline code
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>');
    
    // Blockquotes
    text = text.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2">$1</blockquote>');
    
    // Links
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>');
    
    // Horizontal Rule
    text = text.replace(/^---$/gm, '<hr class="my-4 border-t border-gray-300 dark:border-gray-600">');
    
    // Paragraphs
    text = text.replace(/\n\n/g, '</p><p>');
    
    return `<div class="prose dark:prose-invert""><p>${text}</p></div>`;
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setMarkdown(newText);
    setPreview(convertToHtml(newText));
  };

  const insertMarkdown = (tag) => {
    const textarea = document.querySelector('textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    let insertion = '';

    switch (tag) {
      case 'bold':
        insertion = `**${text.slice(start, end) || 'bold text'}**`;
        break;
      case 'italic':
        insertion = `*${text.slice(start, end) || 'italic text'}*`;
        break;
      case 'heading':
        insertion = `\n# ${text.slice(start, end) || 'Heading'}\n`;
        break;
      case 'list':
        insertion = `\n- ${text.slice(start, end) || 'List item'}\n`;
        break;
      case 'link':
        insertion = `[${text.slice(start, end) || 'link text'}](url)`;
        break;
      case 'code':
        insertion = `\`${text.slice(start, end) || 'code'}\``;
        break;
      case 'blockquote':
        insertion = `\n> ${text.slice(start, end) || 'quote'}\n`;
        break;
      case 'table':
        insertion = '\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n';
        break;
      case 'task':
        insertion = '\n- [ ] New task\n';
        break;
      default:
        break;
    }

    const newText = text.slice(0, start) + insertion + text.slice(end);
    setMarkdown(newText);
    setPreview(convertToHtml(newText));
  };

  const exportDocument = (format) => {
    switch (format) {
      case 'markdown':
        const mdBlob = new Blob([markdown], { type: 'text/markdown' });
        downloadFile(mdBlob, 'document.md');
        break;
      case 'html':
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'}">
            ${preview}
          </body>
          </html>
        `;
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        downloadFile(htmlBlob, 'document.html');
        break;
      case 'pdf':
        window.print();
        break;
    }
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMarkdown = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setMarkdown(text);
        setPreview(convertToHtml(text));
      };
      reader.readAsText(file);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="mb-4 p-2 dark:bg-gray-800">
        <div className="flex gap-2 flex-wrap items-center">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => insertMarkdown('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => insertMarkdown('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => insertMarkdown('heading')}
          >
            <Heading className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => insertMarkdown('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => insertMarkdown('link')}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => insertMarkdown('code')}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => insertMarkdown('blockquote')}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => insertMarkdown('table')}
          >
            <Table2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => insertMarkdown('task')}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => exportDocument('markdown')}
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => exportDocument('html')}
          >
            <FileCode className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => exportDocument('pdf')}
          >
<FileText />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            component="label"
          >
            <FileUp className="h-4 w-4" />
            <input
              type="file"
              className="hidden"
              accept=".md,.markdown"
              onChange={importMarkdown}
            />
          </Button>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />
          
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
            <Moon className="h-4 w-4" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 dark:bg-gray-800">
          <textarea
            className="w-full h-96 p-2 font-mono text-sm resize-none focus:outline-none bg-transparent dark:text-white"
            value={markdown}
            onChange={handleTextChange}
            placeholder="Type your markdown here..."
          />
        </Card>

        <Card className="p-4 dark:bg-gray-800">
          <div 
            className="w-full h-96 overflow-auto dark:text-white"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </Card>
      </div>
    </div>
  );
};

export default MarkdownEditor;