import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PromptInput from "@/components/PromptInput";
import BlogDisplay from "@/components/BlogDisplay";
import ApiKeyInput from "@/components/ApiKeyInput";
import { generateBlogPost } from "@/lib/gemini";
import { Card } from "@/components/ui/card";
import { Sparkles, PenTool, Zap } from "lucide-react";
import heroImage from "@/assets/hero-blog-ai.jpg";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [generatedBlog, setGeneratedBlog] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const { toast } = useToast();

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    toast({
      title: "API Key saved!",
      description: "You can now start generating blog posts.",
    });
  };

  const handleGenerate = async (prompt: string) => {
    if (!apiKey) {
      toast({
        title: "API Key required",
        description: "Please enter your Gemini API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentPrompt(prompt);

    try {
      const blogContent = await generateBlogPost(prompt, apiKey);
      setGeneratedBlog(blogContent);
      
      toast({
        title: "Blog generated successfully!",
        description: "Your 1000-word blog post is ready.",
      });
    } catch (error) {
      console.error('Error generating blog:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (currentPrompt) {
      handleGenerate(currentPrompt);
    }
  };

  // Check for saved API key on component mount
  useState(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Blog Generation</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Transform Ideas into
              <span className="block bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Engaging Blog Posts
              </span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Generate professional, well-structured 1000-word blog posts in seconds using advanced AI technology.
              Simply describe your topic and watch your ideas come to life.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg gradient-primary flex items-center justify-center">
                <PenTool className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Professional Quality</h3>
              <p className="text-muted-foreground text-sm">
                Generate well-structured, engaging content that reads naturally and professionally.
              </p>
            </Card>
            
            <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground text-sm">
                Get your complete blog post in seconds, not hours. Perfect for busy content creators.
              </p>
            </Card>
            
            <Card className="p-6 text-center shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground text-sm">
                Leverages Google's advanced Gemini AI to create contextual and relevant content.
              </p>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {!apiKey ? (
              <ApiKeyInput 
                onApiKeySubmit={handleApiKeySubmit}
                isLoading={isLoading}
              />
            ) : (
              <>
                <PromptInput 
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />
                
                {generatedBlog && (
                  <BlogDisplay 
                    content={generatedBlog}
                    onRegenerate={handleRegenerate}
                    isRegenerating={isLoading}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;