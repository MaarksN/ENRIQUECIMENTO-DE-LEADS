import React, { useState } from 'react';
import { Icons } from './constants';
import { 
  generateMarketingImage, 
  generateVideoAsset, 
  generateSpeech, 
  deepReasoning,
  transcribeAudio,
  analyzeVisualContent
} from './geminiService';

const AILab: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'image' | 'video' | 'audio' | 'brain'>('image');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tool Specific States
  const [imgSize, setImgSize] = useState<"1K" | "2K" | "4K">("1K");
  const [imgRatio, setImgRatio] = useState("1:1");
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [file, setFile] = useState<File | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      if (activeTool === 'image') {
        const res = await generateMarketingImage(prompt, imgSize, imgRatio);
        setResult(res);
      } else if (activeTool === 'video') {
        const res = await generateVideoAsset(prompt, videoRatio);
        setResult(res);
      } else if (activeTool === 'brain') {
        // Deep Reasoning
        const res = await deepReasoning(prompt);
        setResult(res);
      } else if (activeTool === 'audio') {
        if (file) {
            // Transcription
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const res = await transcribeAudio(base64, file.type);
                setResult(res);
                setLoading(false);
            };
        } else {
            // TTS
            const res = await generateSpeech(prompt);
            setResult(res);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro na geração');
    } finally {
        if (activeTool !== 'audio' || !file) {
            setLoading(false);
        }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Laboratório AI 🧪
          </h2>
          <p className="text-slate-500">Crie ativos de marketing, vídeos e faça pesquisas profundas.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <button 
            onClick={() => { setActiveTool('image'); setResult(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTool === 'image' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
        >
            <Icons.Image /> Criar Imagem (Nano Banana)
        </button>
        <button 
            onClick={() => { setActiveTool('video'); setResult(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTool === 'video' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
        >
            <Icons.Video /> Criar Vídeo (Veo)
        </button>
        <button 
            onClick={() => { setActiveTool('audio'); setResult(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTool === 'audio' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
        >
            <Icons.Mic /> Áudio & Fala
        </button>
        <button 
            onClick={() => { setActiveTool('brain'); setResult(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTool === 'brain' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
        >
            <Icons.Brain /> Deep Thinking
        </button>
      </div>

      {/* Controls Area */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        
        {/* Configurations */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTool === 'image' && (
                <>
                    <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Tamanho</label>
                        <select value={imgSize} onChange={(e) => setImgSize(e.target.value as any)} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600">
                            <option value="1K">1K (Padrão)</option>
                            <option value="2K">2K (HD)</option>
                            <option value="4K">4K (Ultra)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Aspect Ratio</label>
                        <select value={imgRatio} onChange={(e) => setImgRatio(e.target.value)} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600">
                            <option value="1:1">1:1 (Quadrado)</option>
                            <option value="16:9">16:9 (Paisagem)</option>
                            <option value="9:16">9:16 (Story)</option>
                            <option value="4:3">4:3</option>
                            <option value="3:4">3:4</option>
                        </select>
                    </div>
                </>
            )}

            {activeTool === 'video' && (
                <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Formato</label>
                    <select value={videoRatio} onChange={(e) => setVideoRatio(e.target.value as any)} className="w-full p-2 rounded-lg border dark:bg-slate-900 dark:border-slate-600">
                        <option value="16:9">16:9 (Youtube)</option>
                        <option value="9:16">9:16 (Reels/TikTok)</option>
                    </select>
                </div>
            )}

            {activeTool === 'audio' && (
                <div className="col-span-3">
                    <label className="block text-sm font-semibold mb-2 dark:text-slate-300">Modo</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="radio" name="audioMode" checked={!file} onChange={() => setFile(null)} />
                            Texto para Fala (TTS)
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" name="audioMode" checked={!!file} onChange={() => {}} />
                            Transcrição (Upload Arquivo)
                        </label>
                    </div>
                    {/* Fake Trigger for Radio above to make file input logic simpler visually */}
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="mt-4 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                </div>
            )}
        </div>

        {/* Input */}
        <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 dark:text-slate-300">
                {activeTool === 'brain' ? 'O que você quer pesquisar ou raciocinar?' : 'Prompt Criativo'}
            </label>
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTool === 'brain' ? "Ex: Analise as tendências de mercado de carros elétricos..." : "Ex: Um carro esportivo futurista neon..."}
                rows={4}
                className="w-full p-4 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            ></textarea>
        </div>

        <button 
            onClick={handleGenerate}
            disabled={loading || (!prompt && !file)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
            {loading ? <Icons.Refresh /> : <Icons.Sparkles />}
            {loading ? 'Gerando (isso pode levar alguns segundos)...' : 'Executar IA Generativa'}
        </button>

        {/* Error */}
        {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                ⚠️ {error}
            </div>
        )}

        {/* Results */}
        {result && (
            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Resultado Gerado:</h3>
                
                {activeTool === 'image' && (
                    <div className="relative group">
                        <img src={result} alt="Generated" className="w-full rounded-lg shadow-lg max-h-[500px] object-contain bg-black" />
                        <a href={result} download="generated-image.png" className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded-lg font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">Download</a>
                    </div>
                )}

                {activeTool === 'video' && (
                    <video controls src={result} className="w-full rounded-lg shadow-lg max-h-[500px] bg-black" />
                )}

                {activeTool === 'audio' && !file && (
                    <audio controls src={result} className="w-full" />
                )}

                {(activeTool === 'brain' || (activeTool === 'audio' && file)) && (
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                        {result}
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default AILab;
