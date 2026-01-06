import React, { useState, useRef } from 'react';
import { ApiKeyDialog } from './components/ApiKeyDialog';
import { MockupCanvas, MockupCanvasHandle } from './components/MockupCanvas';
import { Button } from './components/Button';
import { generateProductImage, editMockupImage } from './services/geminiService';
import { ImageSize, MockupState } from './types';
import { 
  Upload, 
  Wand2, 
  Sparkles, 
  Download, 
  Shirt, 
  Coffee, 
  Image as ImageIcon,
  Palette
} from 'lucide-react';

// Default assets
const DEFAULT_SHIRT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHN0cm9rZT0iI2UzZTNlMyIgc3Ryb2tlLXdpZHRoPSIxIj48cGF0aCBkPSJNMTIgMmMtMS4xIDAtMiAuOS0yIDJzLjkgMiAyIDIgMi0uOSAyLTItLjktMi0yLTJ6bTggN2wtMi0zSDZMNCA5djExaDE2Vjl6Ii8+PHBhdGggZD0iTTE2LjUgM2MtMS43NCAwLTMuNDEuODEtNC41IDIuMDktMS4wOS0xLjI4LTIuNzYtMi4wOS00LjUtMi4wOUM0LjQ4IDMgMiA1LjQ4IDIgOC41di41aDIuNXYtLjVjMC0xLjM4IDEuMTItMi41IDIuNS0yLjVzMi41IDEuMTIgMi41IDIuNXYuNWgzLjV2LS41YzAtMS4zOCAxLjEyLTIuNSAyLjUtMi41UzE4IDcuMTIgMTggOC41di41aDIuNXYtLjVDMjAuNSA1LjQ4IDE4LjAyIDMgMTYuNSAzeiIgZmlsbD0iI2Y4ZjhmOCIvPjwvc3ZnPg=="; 
// Using a better base64 placeholder for a shirt since the SVG above is tiny. Let's use a nice reliable placeholder or color.
// Actually, let's use a solid color SVG for robustness.
const WHITE_SHIRT_SVG = `data:image/svg+xml;utf8,<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M378.5 64c-17.5 19-42.5 28-66.5 28c-24 0-49-9-66.5-28C228 44.8 200.8 32 173 32c-60.5 0-101.3 43.8-108.8 100.3l-14 105.5C46.5 265.8 68 292 97 292h23V480H392V292h23c29 0 50.5-26.2 46.8-54.2l-14-105.5C440.3 75.8 399.5 32 339 32c-27.8 0-55 12.8-72.5 32z" fill="%23f8f9fa" stroke="%23dee2e6" stroke-width="8"/></svg>`;
const WHITE_MUG_SVG = `data:image/svg+xml;utf8,<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M400 192h-32v-32c0-53-43-96-96-96H112C59 64 16 107 16 160v160c0 53 43 96 96 96h160c53 0 96-43 96-96h32c35.3 0 64-28.7 64-64s-28.7-64-64-64zm-32 128c0 17.7-14.3 32-32 32H112c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h160c17.7 0 32 14.3 32 32v160zm32-32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32h-32V288z" fill="%23f8f9fa" stroke="%23dee2e6" stroke-width="8"/></svg>`;

enum Tab {
  MOCKUP = 'mockup',
  GENERATE = 'generate',
  EDIT = 'edit'
}

export default function App() {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MOCKUP);
  
  // Canvas State
  const canvasRef = useRef<MockupCanvasHandle>(null);
  const [mockupState, setMockupState] = useState<MockupState>({
    bgImage: WHITE_SHIRT_SVG,
    logoImage: null,
    logoX: 0,
    logoY: 0,
    logoScale: 0.5
  });

  // Generation State
  const [genPrompt, setGenPrompt] = useState("");
  const [genSize, setGenSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [isGenerating, setIsGenerating] = useState(false);

  // Editing State
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setMockupState(prev => ({
            ...prev,
            logoImage: ev.target!.result as string,
            logoX: 0,
            logoY: 0,
            logoScale: 0.5 // Reset scale on new upload
          }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerateBase = async () => {
    if (!genPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateProductImage(genPrompt, genSize);
      setMockupState(prev => ({
        ...prev,
        bgImage: imageUrl
      }));
      setActiveTab(Tab.MOCKUP); // Switch back to view result
    } catch (error: any) {
      alert(`Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditComposite = async () => {
    if (!editPrompt.trim() || !canvasRef.current) return;
    setIsEditing(true);
    try {
      const currentCanvasData = canvasRef.current.getCanvasData();
      const editedUrl = await editMockupImage(currentCanvasData, editPrompt);
      
      // Update the background to be the result of the edit
      // And clear the logo since it's now "baked in" to the new background
      setMockupState({
        bgImage: editedUrl,
        logoImage: null,
        logoX: 0,
        logoY: 0,
        logoScale: 0.5
      });
      setActiveTab(Tab.MOCKUP);
    } catch (error: any) {
      alert(`Editing failed: ${error.message}`);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.getCanvasData();
      const link = document.createElement('a');
      link.download = 'merch-design.png';
      link.href = url;
      link.click();
    }
  };

  if (!apiKeyReady) {
    return <ApiKeyDialog onKeySelected={() => setApiKeyReady(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">MerchAI Studio</span>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={handleDownload} title="Download current view">
               <Download size={20} />
               <span className="hidden sm:inline">Export</span>
             </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border p-1">
             <MockupCanvas 
                ref={canvasRef}
                state={mockupState} 
                onStateChange={(updates) => setMockupState(prev => ({...prev, ...updates}))}
             />
          </div>
          
          <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-800 flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-full shrink-0">
               <Sparkles size={16} className="text-indigo-600" />
            </div>
            <div>
              <strong>Pro Tip:</strong> Drag to move your logo. Use the sliders on the right to resize. 
              Once satisfied, use the "AI Magic Edit" tab to blend it perfectly with lighting and shadows.
            </div>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Tabs */}
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setActiveTab(Tab.MOCKUP)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === Tab.MOCKUP ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <Palette size={16} /> Studio
            </button>
            <button 
              onClick={() => setActiveTab(Tab.GENERATE)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === Tab.GENERATE ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <ImageIcon size={16} /> Generate
            </button>
            <button 
              onClick={() => setActiveTab(Tab.EDIT)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === Tab.EDIT ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <Wand2 size={16} /> Magic Edit
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6 flex-1">
            
            {/* STUDIO TAB */}
            {activeTab === Tab.MOCKUP && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Product Selection */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">1. Choose Base Product</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setMockupState(s => ({...s, bgImage: WHITE_SHIRT_SVG}))}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <Shirt size={20} className="text-gray-600" />
                      </div>
                      <span className="font-medium text-sm">T-Shirt</span>
                    </button>
                    <button 
                      onClick={() => setMockupState(s => ({...s, bgImage: WHITE_MUG_SVG}))}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <Coffee size={20} className="text-gray-600" />
                      </div>
                      <span className="font-medium text-sm">Ceramic Mug</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Or use the "Generate" tab to create a custom scene.
                  </p>
                </div>

                <hr className="border-gray-100" />

                {/* Logo Upload */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">2. Upload Your Design</h3>
                  <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-gray-50 transition-all group">
                      <div className="p-3 bg-indigo-50 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={24} className="text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Click to upload logo</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG recommended</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </div>
                  </label>
                </div>

                {/* Controls */}
                {mockupState.logoImage && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-sm font-medium text-gray-700">Logo Scale</label>
                       <span className="text-xs text-gray-500">{Math.round(mockupState.logoScale * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="2" 
                      step="0.05" 
                      value={mockupState.logoScale}
                      onChange={(e) => setMockupState(s => ({...s, logoScale: parseFloat(e.target.value)}))}
                      className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* GENERATE TAB */}
            {activeTab === Tab.GENERATE && (
              <div className="space-y-6 animate-fade-in">
                <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-2">Create Custom Scenes</h3>
                   <p className="text-gray-500 text-sm">Describe a product or environment to use as your base mockup.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
                  <textarea 
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[120px]"
                    placeholder="E.g., A matte black coffee mug sitting on a wooden desk with a laptop in the background, cinematic lighting, 4k..."
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Image Quality</label>
                   <div className="grid grid-cols-3 gap-2">
                      {[ImageSize.SIZE_1K, ImageSize.SIZE_2K, ImageSize.SIZE_4K].map((size) => (
                        <button
                          key={size}
                          onClick={() => setGenSize(size)}
                          className={`py-2 px-3 text-sm rounded-lg border ${genSize === size ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {size}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="pt-4">
                   <Button 
                      onClick={handleGenerateBase} 
                      disabled={!genPrompt || isGenerating}
                      isLoading={isGenerating}
                      className="w-full justify-center"
                   >
                     <Sparkles size={18} /> Generate Background
                   </Button>
                   <p className="text-xs text-center text-gray-400 mt-3">Powered by Gemini 3 Pro</p>
                </div>
              </div>
            )}

            {/* EDIT TAB */}
            {activeTab === Tab.EDIT && (
              <div className="space-y-6 animate-fade-in">
                 <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-2">Magic Edit</h3>
                   <p className="text-gray-500 text-sm">
                     Apply effects to the entire composition. This "bakes" your logo into the scene.
                   </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  ⚠️ This will merge your logo and background into a single image.
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instruction</label>
                  <textarea 
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[120px]"
                    placeholder="E.g., Make it look like a vintage photo, add warm sunset lighting, make the mug look wet..."
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                   <Button 
                      onClick={handleEditComposite} 
                      disabled={!editPrompt || isEditing}
                      isLoading={isEditing}
                      className="w-full justify-center"
                   >
                     <Wand2 size={18} /> Apply Magic Edit
                   </Button>
                   <p className="text-xs text-center text-gray-400 mt-3">Powered by Gemini 2.5 Flash (Nano Banana)</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
