import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Wand2, Sparkles } from "lucide-react";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput = ({ onGenerate, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const examplePrompts = [
    "Write about the future of artificial intelligence and its impact on society",
    "Explore the benefits of sustainable living and eco-friendly practices",
    "Discuss the importance of mental health in the digital age",
    "The rise of remote work and its effects on productivity and work-life balance"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="p-6 shadow-medium">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg gradient-primary">
              <Wand2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold">What would you like to write about?</h2>
          </div>
          
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your blog topic... (e.g., 'The benefits of meditation for busy professionals')"
            className="min-h-[120px] text-lg resize-none focus:ring-2 focus:ring-primary/20 border-2"
            disabled={isLoading}
          />
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Press Ctrl+Enter to generate • {prompt.length} characters
            </p>
            
            <Button 
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              size="lg"
              className="gradient-primary shadow-soft hover:shadow-medium transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Blog
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Example Prompts
          </h3>
          <div className="space-y-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                disabled={isLoading}
                className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 text-sm w-full"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">Tips for Better Results</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="p-3 rounded-lg bg-accent/30">
              <p className="font-medium mb-1">Be specific</p>
              <p>Include details about your target audience, tone, and key points you want to cover.</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/30">
              <p className="font-medium mb-1">Provide context</p>
              <p>Mention any background information or current trends related to your topic.</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/30">
              <p className="font-medium mb-1">Set the tone</p>
              <p>Specify if you want it formal, casual, technical, or conversational.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;