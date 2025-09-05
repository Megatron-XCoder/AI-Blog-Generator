import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Share2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogDisplayProps {
  content: string;
  title?: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const BlogDisplay = ({ content, title, onRegenerate, isRegenerating }: BlogDisplayProps) => {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard!",
        description: "Blog content has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying the text manually.",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title || 'blog-post'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download started!",
      description: "Your blog post is being downloaded as a text file.",
    });
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Generated Blog Post',
          text: content,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  // Format content with proper HTML structure
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const result = [];
    let currentList = null;
    let currentListType = null;
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];
    let inCodeBlock = false;
    let codeType = '';
    let codeContent = [];
    let inBlockquote = false;
    let blockquoteContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines but close any open lists
      if (!line) {
        if (currentList) {
          if (currentListType === 'ul') {
            result.push(`<ul>${currentList.join('')}</ul>`);
          } else if (currentListType === 'ol') {
            result.push(`<ol>${currentList.join('')}</ol>`);
          }
          currentList = null;
          currentListType = null;
        }
        continue;
      }
      
      // Handle different heading levels
      if (line.startsWith('#### ')) {
        result.push(`<h4 class="text-lg font-semibold mt-6 mb-3">${line.slice(5)}</h4>`);
      } else if (line.startsWith('### ')) {
        result.push(`<h3 class="text-xl font-semibold mt-6 mb-4">${line.slice(4)}</h3>`);
      } else if (line.startsWith('## ')) {
        result.push(`<h2 class="text-2xl font-bold mt-8 mb-4">${line.slice(3)}</h2>`);
      } else if (line.startsWith('# ')) {
        result.push(`<h1 class="text-3xl font-bold mt-8 -mb-2 relative z-10">${line.slice(2)}</h1>`);
      } else if (line.startsWith('> ')) {
        // Handle blockquotes with nesting
        const content = line.slice(2);
        const nestLevel = (line.match(/^>+/)[0].length - 1);
        
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteContent = [];
        }
        
        const formattedContent = content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/~~(.*?)~~/g, '<del>$1</del>')
          .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
        
        blockquoteContent.push({ content: formattedContent, level: nestLevel });
      } else if (line.startsWith('|')) {
        // Handle tables
        if (!inTable) {
          inTable = true;
          const headerCells = line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
          tableHeaders = headerCells;
        } else if (line.includes('|-')) {
          // Skip table separator line
        } else {
          const cells = line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
          tableRows.push(cells);
        }
      } else if (line.match(/^- \[[ x]\]/)) {
        // Handle task lists
        const checked = line.includes('[x]');
        const content = line.replace(/^- \[[ x]\] /, '');
        if (currentListType !== 'task' || !currentList) {
          if (currentList) {
            result.push(`<ul class="space-y-2 mb-4">${currentList.join('')}</ul>`);
          }
          currentList = [];
          currentListType = 'task';
        }
        currentList.push(`<li class="flex items-center gap-2"><input type="checkbox" ${checked ? 'checked' : ''} disabled />${content}</li>`);
      } 
      // Handle bullet points with proper nesting
      else if (line.match(/^[\s]*[-*]\s/)) {
        const indentLevel = (line.match(/^(\s*)/)?.[1]?.length || 0) / 2;
        const content = line.replace(/^[\s]*[-*]\s/, '').trim()
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
        
        if (currentListType !== 'ul' || !currentList) {
          // Close any existing numbered list
          if (currentList && currentListType === 'ol') {
            result.push(`<ol class="list-decimal space-y-2 mb-6 pl-6">${currentList.join('')}</ol>`);
          }
          currentList = [];
          currentListType = 'ul';
        }
        
        currentList.push(`<li class="${indentLevel > 0 ? `ml-${indentLevel * 6}` : ''} text-gray-700">${content}</li>`);
      }
      // Handle numbered lists with proper nesting
      else if (line.match(/^[\s]*\d+\.\s/)) {
        const indentLevel = (line.match(/^(\s*)/)?.[1]?.length || 0) / 2;
        const content = line.replace(/^[\s]*\d+\.\s/, '').trim();
        
        if (currentListType !== 'ol' || !currentList) {
          // Close any existing bullet list
          if (currentList && currentListType === 'ul') {
            result.push(`<ul>${currentList.join('')}</ul>`);
          }
          currentList = [];
          currentListType = 'ol';
        }
        
        currentList.push(`<li class="${indentLevel > 0 ? `ml-${indentLevel * 4}` : ''}">${content}</li>`);
      }
      // Handle code blocks
      else if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeType = line.slice(3).trim();
          codeContent = [];
        } else {
          inCodeBlock = false;
          result.push(
            `<pre class="bg-muted p-4 rounded-lg overflow-x-auto mb-4"><code class="language-${codeType} text-sm">${
              codeContent.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            }</code></pre>`
          );
        }
      }
      // Handle horizontal rules
      else if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/) || line.match(/^_{3,}$/)) {
        result.push('<hr class="my-8 border-t border-gray-200" />');
      }
      // Handle regular paragraphs
      else if (!inCodeBlock) {
        // Close any open lists before adding paragraph
        if (currentList) {
          if (currentListType === 'ul') {
            result.push(`<ul class="list-disc space-y-2 mb-6 pl-6 marker:text-gray-500 dark:text-gray-300">${currentList.join('')}</ul>`);
          } else if (currentListType === 'ol') {
            result.push(`<ol class="list-decimal space-y-2 mb-6 pl-6 dark:text-gray-300">${currentList.join('')}</ol>`);
          }
          currentList = null;
          currentListType = null;
        }
        
        // Format bold, italic, strikethrough, links, images and inline code
        let formattedLine = line
          .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-lg shadow-md max-w-full h-auto" />')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 transition-colors">$1</a>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/~~(.*?)~~/g, '<del>$1</del>')
          .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
        
        result.push(`<p class="mb-4 leading-relaxed">${formattedLine}</p>`);
      }
      // Add line to code block if we're in one
      else {
        codeContent.push(line);
      }
    }
    
    // Close any remaining elements
    if (currentList) {
      if (currentListType === 'ul') {
        result.push(`<ul class="list-disc space-y-2 mb-6 pl-6 marker:text-gray-500">${currentList.join('')}</ul>`);
      } else if (currentListType === 'ol') {
        result.push(`<ol class="list-decimal space-y-2 mb-6 pl-6">${currentList.join('')}</ol>`);
      } else if (currentListType === 'task') {
        result.push(`<ul class="space-y-2 mb-6">${currentList.join('')}</ul>`);
      }
    }

    if (inTable) {
      const tableHtml = `
        <div class="overflow-x-auto mb-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                ${tableHeaders.map(header => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${tableRows.map(row => `
                <tr>
                  ${row.map(cell => `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      result.push(tableHtml);
    }

    if (inBlockquote) {
      // Process nested blockquotes
      let currentLevel = 0;
      let currentContent = [];
      let finalBlockquote = '';
      
      const processLevel = (content, level) => {
        if (level === 0) {
          return `<blockquote class="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic">${content}</blockquote>`;
        }
        return `<blockquote class="border-l-4 border-gray-300 pl-4 py-2 italic">${content}</blockquote>`;
      };
      
      for (const { content, level } of blockquoteContent) {
        if (level === currentLevel) {
          currentContent.push(content);
        } else if (level > currentLevel) {
          finalBlockquote = processLevel(currentContent.join('<br/>'), currentLevel);
          currentContent = [finalBlockquote, content];
          currentLevel = level;
        } else {
          currentContent = [content];
          currentLevel = level;
        }
      }
      
      result.push(processLevel(currentContent.join('<br/>'), currentLevel));
    }
    
    return result.join('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="p-6 shadow-medium">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Generated Blog Post</h2>
            <p className="text-muted-foreground">
              {content.split(' ').length} words • {Math.ceil(content.split(' ').length / 200)} min read
            </p>
          </div>
          
          <div className="flex gap-2">
            {onRegenerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Regenerate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={shareContent}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadAsText}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        <div 
          className="blog-content prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-code:text-blue-600 prose-pre:bg-gray-800 prose-pre:text-gray-100"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </Card>
    </div>
  );
};

export default BlogDisplay;