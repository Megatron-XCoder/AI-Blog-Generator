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
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title || "blog-post"}.txt`;
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
          title: title || "Generated Blog Post",
          text: content,
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  // Format content with proper HTML structure and mobile-friendly code blocks
  const formatContent = (text: string) => {
    const lines = text.split("\n");
    const result: string[] = [];
    let currentList: string[] | null = null;
    let currentListType: "ul" | "ol" | "task" | null = null;
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
    let inCodeBlock = false;
    let codeType = "";
    let codeContent: string[] = [];
    let inBlockquote = false;
    let blockquoteContent: Array<{ content: string; level: number }> = [];

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();

      // Empty line handling
      if (!line && !inCodeBlock) {
        if (currentList) {
          if (currentListType === "ul") {
            result.push(
              `<ul class="list-disc space-y-1 sm:space-y-2 mb-4 sm:mb-6 pl-4 sm:pl-6 marker:text-gray-500 dark:text-gray-300">${currentList.join(
                ""
              )}</ul>`
            );
          } else if (currentListType === "ol") {
            result.push(
              `<ol class="list-decimal space-y-1 sm:space-y-2 mb-4 sm:mb-6 pl-4 sm:pl-6 dark:text-gray-300">${currentList.join(
                ""
              )}</ol>`
            );
          } else if (currentListType === "task") {
            result.push(`<ul class="space-y-2 mb-6">${currentList.join("")}</ul>`);
          }
          currentList = null;
          currentListType = null;
        }
        continue;
      }

      // Headings
      if (!inCodeBlock && line.startsWith("#### ")) {
        result.push(
          `<h4 class="text-base sm:text-lg font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">${line.slice(
            5
          )}</h4>`
        );
        continue;
      }
      if (!inCodeBlock && line.startsWith("### ")) {
        result.push(
          `<h3 class="text-lg sm:text-xl font-semibold mt-5 sm:mt-6 mb-3 sm:mb-4">${line.slice(
            4
          )}</h3>`
        );
        continue;
      }
      if (!inCodeBlock && line.startsWith("## ")) {
        result.push(
          `<h2 class="text-xl sm:text-2xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4">${line.slice(
            3
          )}</h2>`
        );
        continue;
      }
      if (!inCodeBlock && line.startsWith("# ")) {
        result.push(
          `<h1 class="text-2xl sm:text-3xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4 relative z-10">${line.slice(
            2
          )}</h1>`
        );
        continue;
      }

      // Blockquotes (nesting-aware)
      if (!inCodeBlock && /^> /.test(line)) {
        const content = line.replace(/^> +/, "");
        const nestLevel = (raw.match(/^>+/)?.[0].length || 1) - 1;
        if (!inBlockquote) {
          inBlockquote = true;
          blockquoteContent = [];
        }
        const formattedContent = content
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/~~(.*?)~~/g, "<del>$1</del>")
          .replace(/`(.*?)`/g, '<span class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</span>');
        blockquoteContent.push({ content: formattedContent, level: nestLevel });
        continue;
      }

      // Tables
      if (!inCodeBlock && line.startsWith("|")) {
        if (!inTable) {
          inTable = true;
          tableHeaders = line
            .split("|")
            .filter((c) => c.trim() !== "")
            .map((c) => c.trim());
        } else if (/\|\s*-+\s*\|/.test(line)) {
          // separator row; ignore
        } else {
          const cells = line
            .split("|")
            .filter((c) => c.trim() !== "")
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        continue;
      }

      // Task lists
      if (!inCodeBlock && /^- \[[ x]\] /.test(line)) {
        const checked = /\[x\]/i.test(line);
        const liContent = line.replace(/^- \[[ x]\] /i, "");
        if (currentListType !== "task" || !currentList) {
          if (currentList) {
            result.push(`<ul class="space-y-2 mb-4">${currentList.join("")}</ul>`);
          }
          currentList = [];
          currentListType = "task";
        }
        currentList.push(
          `<li class="flex items-center gap-2"><input type="checkbox" ${
            checked ? "checked" : ""
          } disabled />${liContent}</li>`
        );
        continue;
      }

      // Bulleted lists
      if (!inCodeBlock && /^[\s]*[-*]\s/.test(line)) {
        const indentLevel = ((line.match(/^(\s*)/)?.[1]?.length || 0) / 2) | 0;
        const liContent = line
          .replace(/^[\s]*[-*]\s/, "")
          .trim()
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/`(.*?)`/g, '<span class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</span>');

        if (currentListType !== "ul" || !currentList) {
          if (currentList && currentListType === "ol") {
            result.push(`<ol class="list-decimal space-y-2 mb-6 pl-6">${currentList.join("")}</ol>`);
          }
          currentList = [];
          currentListType = "ul";
        }
        const ml = indentLevel > 0 ? ` ml-${indentLevel * 6}` : "";
        currentList.push(`<li class="text-gray-700${ml}">${liContent}</li>`);
        continue;
      }

      // Numbered lists
      if (!inCodeBlock && /^[\s]*\d+\.\s/.test(line)) {
        const indentLevel = ((line.match(/^(\s*)/)?.[1]?.length || 0) / 2) | 0;
        const liContent = line.replace(/^[\s]*\d+\.\s/, "").trim();

        if (currentListType !== "ol" || !currentList) {
          if (currentList && currentListType === "ul") {
            result.push(`<ul class="list-disc space-y-2 mb-6 pl-6">${currentList.join("")}</ul>`);
          }
          currentList = [];
          currentListType = "ol";
        }
        const ml = indentLevel > 0 ? ` ml-${indentLevel * 4}` : "";
        currentList.push(`<li class="${ml}">${liContent}</li>`);
        continue;
      }

      // Code blocks (mobile-friendly: local horizontal scroll only)
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeType = line.slice(3).trim();
          codeContent = [];
        } else {
          inCodeBlock = false;
          const codeHtml = codeContent
            .join("\n")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          result.push(`
<div class="code-block not-prose my-4">
  <pre class="w-full max-w-full overflow-x-auto rounded-lg p-3 sm:p-4 bg-gray-900 text-gray-100 text-xs sm:text-sm leading-relaxed">
    <code class="language-${codeType} block whitespace-pre font-mono">${codeHtml}</code>
  </pre>
</div>`);
        }
        continue;
      } else if (inCodeBlock) {
        codeContent.push(raw); // keep original spacing
        continue;
      }

      // Horizontal rules
      if (/^-{3,}$/.test(line) || /^\*{3,}$/.test(line) || /^_{3,}$/.test(line)) {
        result.push('<hr class="my-8 border-t border-gray-200" />');
        continue;
      }

      // Close lists before paragraph
      if (currentList) {
        if (currentListType === "ul") {
          result.push(
            `<ul class="list-disc space-y-1 sm:space-y-2 mb-4 sm:mb-6 pl-4 sm:pl-6 marker:text-gray-500 dark:text-gray-300">${currentList.join(
              ""
            )}</ul>`
          );
        } else if (currentListType === "ol") {
          result.push(
            `<ol class="list-decimal space-y-1 sm:space-y-2 mb-4 sm:mb-6 pl-4 sm:pl-6 dark:text-gray-300">${currentList.join(
              ""
            )}</ol>`
          );
        } else if (currentListType === "task") {
          result.push(`<ul class="space-y-2 mb-6">${currentList.join("")}</ul>`);
        }
        currentList = null;
        currentListType = null;
      }

      // Regular paragraphs
      let formattedLine = line
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-lg shadow-md max-w-full h-auto my-4" />')
        .replace(
          /\[(.*?)\]\((.*?)\)/g,
          '<a href="$2" class="text-blue-600 hover:text-blue-800 transition-colors underline-offset-2">$1</a>'
        )
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/~~(.*?)~~/g, "<del>$1</del>")
        .replace(/`(.*?)`/g, '<span class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</span>');

      result.push(`<p class="mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">${formattedLine}</p>`);
    }

    // Close any remaining structures
    if (currentList) {
      if (currentListType === "ul") {
        result.push(`<ul class="list-disc space-y-2 mb-6 pl-6 marker:text-gray-500">${currentList.join("")}</ul>`);
      } else if (currentListType === "ol") {
        result.push(`<ol class="list-decimal space-y-2 mb-6 pl-6">${currentList.join("")}</ol>`);
      } else if (currentListType === "task") {
        result.push(`<ul class="space-y-2 mb-6">${currentList.join("")}</ul>`);
      }
    }

    if (inTable) {
      const tableHtml = `
<div class="overflow-x-auto mb-4">
  <div class="inline-block min-w-full align-middle">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          ${tableHeaders
            .map(
              (header) =>
                `<th class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${header}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        ${tableRows
          .map(
            (row) => `
          <tr>
            ${row
              .map(
                (cell) =>
                  `<td class="px-3 sm:px-6 py-2 sm:py-4 whitespace-normal sm:whitespace-nowrap text-xs sm:text-sm text-gray-600">${cell}</td>`
              )
              .join("")}
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>
</div>`;
      result.push(tableHtml);
    }

    if (inBlockquote) {
      const processLevel = (content: string) =>
        `<blockquote class="border-l-4 border-gray-300 pl-3 sm:pl-4 py-2 mb-3 sm:mb-4 italic text-sm sm:text-base">${content}</blockquote>`;

      // Simple flatten for nested quotes (keeps order)
      const finalBlock = blockquoteContent.map((b) => b.content).join("<br/>");
      result.push(processLevel(finalBlock));
    }

    return result.join("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-4 sm:px-6 md:space-y-6">
      <Card className="p-4 sm:p-6 shadow-medium overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Generated Blog Post</h2>
            <p className="text-muted-foreground">
              {content.split(" ").length} words • {Math.ceil(content.split(" ").length / 200)} min read
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
          className="blog-content prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-code:text-blue-600 prose-pre:bg-gray-800 prose-pre:text-gray-100 overflow-x-hidden"
          // ^ overflow-x-hidden here ensures the page itself never gets a horizontal scrollbar.
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </Card>
    </div>
  );
};

export default BlogDisplay;
