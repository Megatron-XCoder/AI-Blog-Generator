import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, ExternalLink, Eye, EyeOff } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  isLoading?: boolean;
}

const ApiKeyInput = ({ onApiKeySubmit, isLoading }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-6 shadow-medium">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg gradient-primary">
              <Key className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Gemini API Key Required</h2>
              <p className="text-muted-foreground text-sm">Enter your Gemini API key to start generating blog posts</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apikey">Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="apikey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key..."
                  className="pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!apiKey.trim() || isLoading}
              className="w-full gradient-primary shadow-soft hover:shadow-medium transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Verifying...
                </>
              ) : (
                "Continue with API Key"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-accent/30 rounded-lg">
            <h3 className="font-medium mb-2">How to get your Gemini API Key:</h3>
            <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
              <li>Visit Google AI Studio</li>
              <li>Sign in with your Google account</li>
              <li>Create a new API key</li>
              <li>Copy and paste it above</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get API Key
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Your API key is stored locally and never sent to our servers. It's only used to make direct requests to Google's Gemini API.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ApiKeyInput;