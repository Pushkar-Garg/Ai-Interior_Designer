import React, { useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  ChevronRight, 
  Download,
  Trash2,
  ArrowLeftRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { useAuthStore } from '../store/authStore';
import { INTERIOR_STYLES, generateInteriorDesign } from '../services/geminiService';
import { cn } from '../lib/utils';
import { Button, Input } from './UI';

export const DesignStudio = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [originalImage, setOriginalImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(INTERIOR_STYLES[0].id);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('New Interior Project');
  const token = useAuthStore(state => state.token);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result);
      setStep(2);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  });

  const handleGenerate = async () => {
    console.log('handleGenerate clicked');
    if (!originalImage) {
      console.error('No original image found');
      return;
    }
    setLoading(true);
    try {
      console.log('Calling generateInteriorDesign...');
      const result = await generateInteriorDesign(originalImage, prompt, selectedStyle);
      console.log('Generation successful, updating state');
      setGeneratedImage(result);
      setStep(3);
    } catch (err) {
      console.error('Error in handleGenerate:', err);
      alert('Failed to generate design: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: projectName,
          original_image: originalImage,
          generated_image: generatedImage,
          prompt,
          style: INTERIOR_STYLES.find(s => s.id === selectedStyle)?.name
        })
      });
      onBack();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-redesign.png`;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeftRight className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-2xl font-semibold">Design Studio</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                {...getRootProps()}
                className={cn(
                  "aspect-[16/9] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all",
                  isDragActive ? "border-black bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                  <Upload className="text-zinc-400 w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium">Upload a photo of your room</h3>
                <p className="text-zinc-500 mt-1">Drag and drop or click to browse</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-8 font-bold">JPG, PNG up to 10MB</p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-zinc-100 shadow-sm relative group">
                  <img src={originalImage} className="w-full h-full object-cover" alt="Original" />
                  <button 
                    onClick={() => setStep(1)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">Design Preferences</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Project Name</label>
                      <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Describe your vision</label>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all min-h-[120px]"
                        placeholder="e.g. Add more natural light, use oak wood textures, and minimalist furniture..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full h-12 rounded-xl" 
                      onClick={handleGenerate}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate Redesign
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Original</span>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-100">
                      <img src={originalImage} className="w-full h-full object-cover" alt="Original" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Redesigned</span>
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-100 shadow-xl ring-1 ring-black/5">
                      <img src={generatedImage} className="w-full h-full object-cover" alt="Generated" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 h-12" onClick={handleSave}>
                    Save to Dashboard
                  </Button>
                  <Button variant="secondary" className="h-12" onClick={downloadImage}>
                    <Download className="w-5 h-5" />
                    Download
                  </Button>
                  <Button variant="ghost" className="h-12" onClick={() => setStep(2)}>
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar - Styles */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm sticky top-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">Style Presets</h3>
            <div className="grid grid-cols-1 gap-2">
              {INTERIOR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-all text-left",
                    selectedStyle === style.id 
                      ? "bg-black text-white shadow-lg scale-[1.02]" 
                      : "hover:bg-zinc-50 text-zinc-600"
                  )}
                >
                  <span className="font-medium">{style.name}</span>
                  {selectedStyle === style.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
