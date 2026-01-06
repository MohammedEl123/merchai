import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Key } from 'lucide-react';

interface ApiKeyDialogProps {
  onKeySelected: () => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && aistudio.hasSelectedApiKey) {
        const selected = await aistudio.hasSelectedApiKey();
        if (selected) {
          setHasKey(true);
          onKeySelected();
        }
      }
    } catch (e) {
      console.error("Error checking API key", e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await aistudio.openSelectKey();
      // Assume success after dialog interaction, but robustly we would check again.
      // The prompt says: "Assume the key selection was successful after triggering openSelectKey() and proceed to the app."
      setHasKey(true);
      onKeySelected();
    } else {
      alert("AI Studio environment not detected. Please ensure you are running in the correct environment.");
    }
  };

  if (hasKey) return null;

  if (checking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90">
        <div className="text-white animate-pulse">Checking Environment...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <Key size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Key Required</h2>
          <p className="text-gray-500 mt-2">
            To use the advanced Gemini 3 Pro features for image generation and editing, you must select a valid API key.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left text-sm text-blue-800">
           <strong>Note:</strong> Select a paid key from a Google Cloud Project to access Veo and Gemini 3 Pro models. 
           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline ml-1 font-semibold">
             Billing Documentation
           </a>
        </div>

        <Button onClick={handleSelectKey} className="w-full justify-center py-3 text-lg">
          Select API Key
        </Button>
      </div>
    </div>
  );
};