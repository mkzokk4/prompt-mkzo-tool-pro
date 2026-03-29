import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Settings2, 
  Wand2, 
  KeyRound, 
  X, 
  Check, 
  Copy, 
  AlertCircle,
  Circle,
  CheckCircle2,
  Code,
  Mic,
  Volume2,
  VolumeX,
  Cpu
} from 'lucide-react';

// --- Matrix Rain Component ---
const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;
    
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    
    const drops = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100;
    }
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Neon Green
      ctx.fillStyle = '#00ff00';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        if (drops[i] > 0) {
           ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        }
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 33);
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full z-0 opacity-80 pointer-events-none" 
    />
  );
};

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('VIDEO');
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || '');
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [usedModel, setUsedModel] = useState(null); 

  // Settings State
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [artStyle, setArtStyle] = useState('Photorealistic');
  const [lighting, setLighting] = useState('Cinematic Lighting');
  const [cameraMovement, setCameraMovement] = useState('Slow Pan');
  const [includeVoice, setIncludeVoice] = useState(true);

  // Modals State
  const [showApiModal, setShowApiModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLightingModal, setShowLightingModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Options with Emojis
  const aspectRatios = [
    { id: '1:1', icon: '🔲' }, { id: '16:9', icon: '🖥️' }, { id: '9:16', icon: '📱' },
    { id: '4:3', icon: '📺' }, { id: '3:4', icon: '🖼️' }, { id: '21:9', icon: '🎬' }
  ];
  const artStyles = [
    { id: 'Photorealistic', icon: '📸' }, { id: 'Anime', icon: '🌸' }, { id: 'Cinematic', icon: '🍿' },
    { id: '3D Render', icon: '🧊' }, { id: 'Watercolor', icon: '🎨' }, { id: 'Cyberpunk', icon: '🌃' },
    { id: 'Digital Art', icon: '💻' }, { id: 'Oil Painting', icon: '🖌️' }
  ];
  const lightingOptions = [
    { id: 'Cinematic Lighting', icon: '🎥' }, { id: 'Natural Light', icon: '☀️' }, 
    { id: 'Studio Lighting', icon: '💡' }, { id: 'Neon Lights', icon: '🟣' }, 
    { id: 'Golden Hour', icon: '🌅' }, { id: 'Volumetric Lighting', icon: '🌫️' }
  ];
  const cameraOptions = [
    { id: 'Slow Pan', icon: '🐢' }, { id: 'Zoom In', icon: '🔍' }, { id: 'Zoom Out', icon: '🔭' }, 
    { id: 'Tracking Shot', icon: '🏃' }, { id: 'Drone Shot', icon: '🚁' }, 
    { id: 'Handheld', icon: '🫨' }, { id: 'Orbit', icon: '🔄' }, { id: 'Time-lapse', icon: '⏱️' }
  ];

  const getIcon = (arr, id) => arr.find(item => item.id === id)?.icon || '';

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('groq_api_key', apiKey);
    setShowApiModal(false);
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('groq_api_key');
    setApiKey('');
    setShowApiModal(false);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generatePrompts = async () => {
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }
    if (!idea.trim()) {
      setError('ကျေးဇူးပြု၍ သင့်စိတ်ကူးကို ရေးသားပါ။');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsGenerating(true);
    setError('');
    setOutput(null);
    setUsedModel(null);

    const systemPrompt = `You are a professional AI Prompt Engineer for cinematic creation. 
The user will provide a scene idea in Burmese. Generate precise English prompts for AI Image and AI Video generators${includeVoice ? ', plus a Burmese voiceover script' : ''}.
IMPORTANT RULES:
1. Maintain strict character consistency between the Image and Video prompts. Describe character appearance in detail in both.
2. Output MUST be in raw JSON format exactly matching this structure:
{
  "image_prompt": "Highly detailed English prompt for Midjourney/Stable Diffusion. Include settings: Aspect Ratio [${aspectRatio}], Art Style [${artStyle}], Lighting [${lighting}].",
  "video_prompt": "Highly detailed English prompt for Runway/Sora. Focus on motion: Camera Movement [${cameraMovement}], Aspect Ratio [${aspectRatio}], Art Style [${artStyle}], Lighting [${lighting}]. Character details must match image_prompt exactly."${includeVoice ? `,
  "voiceover_script": "The Burmese dialogue or voiceover text for the scene (in Myanmar language).",
  "voice_prompt": "English instruction for AI Voice generator describing the emotional tone, age, and style."` : ''}
}`;

    const userPrompt = `Idea (Burmese): ${idea}`;

    // Auto Fallback Models
    const fallbackModels = [
      'llama-3.3-70b-versatile', // Primary latest model
      'llama-3.1-8b-instant',    // Fastest fallback
      'gemma2-9b-it'             // Backup fallback
    ];

    let success = false;

    for (const currentModel of fallbackModels) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`Failed with status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        setOutput(JSON.parse(content));
        setUsedModel(currentModel);
        success = true;
        break; // Success! Exit loop
      } catch (err) {
        console.warn(`Model ${currentModel} failed:`, err.message);
      }
    }

    if (!success) {
      setError('Error: မော်ဒယ်များအားလုံး ချိတ်ဆက်၍မရပါ။ API Key သို့မဟုတ် Internet ကို စစ်ဆေးပါ။');
      setTimeout(() => setError(''), 5000);
    }
    setIsGenerating(false);
  };

  // --- Loading Screen with Boxed Layout ---
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center font-mono overflow-hidden">
        {/* Matrix Background */}
        <MatrixRain />
        
        {/* Boxed Loading Content */}
        <div className="relative z-10 flex flex-col items-center p-8 bg-[#101216]/95 border border-[#00ff00]/50 shadow-[0_0_20px_rgba(0,255,0,0.15)] rounded-lg w-[85%] max-w-sm">
          <div className="text-lg md:text-xl font-bold mb-4 tracking-widest flex items-center gap-3 w-full justify-center">
            <span className="text-[#00ff00] font-light">&lt; &gt;</span> 
            <span className="text-[#00ff00]">INITIALIZING...</span>
          </div>
          
          {/* Progress Bar (Green Line) */}
          <div className="w-full h-1 bg-gray-900 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-[#00ff00] animate-[loading_4s_ease-in-out_forwards]"></div>
          </div>
          
          {/* Credits exactly like Video (without underline) */}
          <div className="flex flex-col items-center w-full">
            <p className="text-[10px] md:text-xs text-[#00ff00] tracking-[0.2em] text-center uppercase mb-1">
              PROMPT TOOLS CREATE BY
            </p>
            <p className="font-bold text-white text-sm md:text-base tracking-widest">
              Min Khaing Zaw Oo
            </p>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}} />
      </div>
    );
  }

  // --- Main App ---
  return (
    <div className="min-h-screen bg-[#101216] text-gray-300 font-sans pb-24 selection:bg-[#00ff00]/30 selection:text-[#00ff00]">
      
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-[#101216] sticky top-0 z-40">
        <button onClick={() => setShowExitModal(true)} className="p-2 hover:bg-[#161920] rounded-full transition-colors">
          <X size={20} className="text-gray-400" />
        </button>
        <div className="text-sm font-bold text-gray-200 tracking-wider">PROMPT TOOL PRO</div>
        <button onClick={() => setShowApiModal(true)} className="p-2 hover:bg-[#161920] rounded-full transition-colors relative">
          <KeyRound size={20} className="text-[#00ff00]" />
          {!apiKey && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
        </button>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6 relative z-10">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm animate-pulse">
            <AlertCircle size={16} className="flex-shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-[#161920] p-1 rounded-xl border border-[#2a2e39]">
          <button 
            onClick={() => setActiveTab('IMAGE')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'IMAGE' ? 'bg-[#00ff00]/10 text-[#00ff00] border border-[#00ff00]/50' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
          >
            <ImageIcon size={16} /> IMAGE
          </button>
          <button 
            onClick={() => setActiveTab('VIDEO')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'VIDEO' ? 'bg-[#00ff00]/10 text-[#00ff00] border border-[#00ff00]/50' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
          >
            <Video size={16} /> VIDEO
          </button>
        </div>

        {/* Idea Input */}
        <div className="bg-[#161920] border border-[#2a2e39] rounded-xl p-4">
          <label className="block text-gray-300 text-sm font-bold mb-3 flex items-center gap-1.5">
            <span>✨</span> သင်၏ စိတ်ကူးကို မြန်မာလို ရေးပါ <span className="text-red-500">*</span>
          </label>
          <textarea 
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="ဥပမာ - မိုးရွာနေသော ညဖက် ရန်ကုန်မြို့ လမ်းမပေါ်တွင် ထီးဆောင်းပြီး လမ်းလျှောက်နေသော ကောင်မလေး။"
            className="w-full h-28 bg-[#0d1014] border border-[#2a2e39] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-[#00ff00] focus:ring-1 focus:ring-[#00ff00] resize-none"
          />
        </div>

        {/* Pro Settings */}
        <div className="bg-[#161920] border border-[#2a2e39] rounded-xl p-4">
          <h2 className="text-[#00ff00] text-sm font-bold mb-5 flex items-center gap-2">
            <Settings2 size={16} /> Pro ဆက်တင်များ
          </h2>

          <div className="space-y-5">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-gray-400 text-xs mb-2">အချိုးအစား (Aspect Ratio)</label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map(ratio => (
                  <button 
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5 ${aspectRatio === ratio.id ? 'bg-[#00ff00]/10 border-[#00ff00] text-[#00ff00]' : 'bg-[#0d1014] border-[#2a2e39] text-gray-400 hover:border-[#4a4e59]'}`}
                  >
                    <span>{ratio.icon}</span> {ratio.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Art Style */}
            <div>
              <label className="block text-gray-400 text-xs mb-2">အနုပညာ စတိုင် (Art Style)</label>
              <div className="flex flex-wrap gap-2">
                {artStyles.map(style => (
                  <button 
                    key={style.id}
                    onClick={() => setArtStyle(style.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${artStyle === style.id ? 'bg-[#00ff00]/10 border-[#00ff00] text-[#00ff00]' : 'bg-[#0d1014] border-[#2a2e39] text-gray-400 hover:border-[#4a4e59]'}`}
                  >
                    <span>{style.icon}</span> {style.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div>
              <label className="block text-gray-400 text-xs mb-2">အလင်းရောင် (Lighting)</label>
              <div 
                onClick={() => setShowLightingModal(true)}
                className="w-full bg-[#0d1014] border border-[#2a2e39] hover:border-[#00ff00] rounded-lg p-3 text-sm text-[#00ff00] flex justify-between items-center cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{getIcon(lightingOptions, lighting)}</span>
                  <span>{lighting}</span>
                </div>
              </div>
            </div>

            {/* Camera Movement (For Video) */}
            {activeTab === 'VIDEO' && (
              <div className="animate-fade-in">
                <label className="block text-gray-400 text-xs mb-2">ကင်မရာ ရွေ့လျားမှု (Camera Movement)</label>
                <div 
                  onClick={() => setShowCameraModal(true)}
                  className="w-full bg-[#0d1014] border border-[#2a2e39] hover:border-[#00ff00] rounded-lg p-3 text-sm text-[#00ff00] flex justify-between items-center cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{getIcon(cameraOptions, cameraMovement)}</span>
                    <span>{cameraMovement}</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Voice Toggle Switch */}
            <div className="pt-2 border-t border-[#2a2e39] animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', overflow: 'hidden' }} className="bg-[#0d1014] border border-[#2a2e39] rounded-lg p-3 mt-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 0%', overflow: 'hidden' }}>
                  <div style={{ flexShrink: 0 }}>{includeVoice ? <Volume2 size={16} className="text-[#00ff00]" /> : <VolumeX size={16} className="text-gray-500" />}</div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="text-gray-300 text-xs font-medium">မြန်မာလို စကားပြော ထည့်မည်</p>
                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="text-gray-500 text-[10px] mt-0.5">Video အတွက် Voiceover Script ပါဝင်ရန်</p>
                  </div>
                </div>
                <button
                  onClick={() => setIncludeVoice(!includeVoice)}
                  style={{ flexShrink: 0, width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', display: 'flex', alignItems: 'center', transition: 'background-color 0.3s', backgroundColor: includeVoice ? '#00ff00' : '#374151' }}
                >
                  <div style={{ width: '16px', height: '16px', borderRadius: '9999px', backgroundColor: 'white', position: 'absolute', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'transform 0.3s ease-in-out', transform: includeVoice ? 'translateX(24px)' : 'translateX(4px)' }} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Generate Button */}
        <button 
          onClick={generatePrompts}
          disabled={isGenerating}
          className="w-full bg-[#161920] border border-[#2a2e39] hover:border-[#00ff00] text-gray-300 hover:text-[#00ff00] font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,255,0,0.05)] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[#00ff00]/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-[#00ff00] border-t-transparent rounded-full animate-spin z-10"></div>
          ) : (
            <Wand2 size={18} className="z-10" />
          )}
          <span className="z-10">{isGenerating ? 'ဖန်တီးနေပါသည်...' : 'အစီစဉ် Prompt ဖန်တီးမည်'}</span>
        </button>

        {/* Result Box */}
        <div className="bg-[#161920] border border-[#2a2e39] rounded-xl p-4 min-h-[200px]">
          <div className="flex justify-between items-center mb-4 border-b border-[#2a2e39] pb-3">
            <h2 className="text-gray-200 text-sm font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#00ff00] rounded-full shadow-[0_0_5px_#00ff00] animate-pulse"></span> ရလဒ် (Result)
            </h2>
            {usedModel && !isGenerating && (
              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 border border-[#2a2e39] px-2 py-0.5 rounded-full bg-[#0d1014] animate-fade-in">
                <Cpu size={10} className="text-[#00ff00]" />
                via {usedModel}
              </span>
            )}
          </div>
          
          {!output && !isGenerating ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-600 space-y-3">
              <div className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center bg-[#0d1014]">
                <Code size={20} className="text-gray-500" />
              </div>
              <p className="text-xs">Prompt အလွယ်တကူဖန်တီးနိုင်သည်...</p>
            </div>
          ) : output ? (
            <div className="space-y-4 animate-fade-in text-sm">
              
              {/* Image Result */}
              <div className="bg-[#0d1014] border border-[#2a2e39] rounded-lg p-3 relative group">
                <p className="text-[#00ff00] text-xs font-bold mb-2 uppercase flex items-center gap-2">
                  <ImageIcon size={14}/> Image Prompt
                </p>
                <p className="text-gray-300 pr-8">{output.image_prompt}</p>
                <button onClick={() => handleCopy(output.image_prompt, 'image')} className="absolute top-3 right-3 text-gray-500 hover:text-[#00ff00] transition-colors">
                  {copiedIndex === 'image' ? <CheckCircle2 size={16} className="text-[#00ff00]" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Video Result */}
              <div className="bg-[#0d1014] border border-[#2a2e39] rounded-lg p-3 relative group">
                <p className="text-[#00ff00] text-xs font-bold mb-2 uppercase flex items-center gap-2">
                  <Video size={14}/> Video Prompt
                </p>
                <p className="text-gray-300 pr-8">{output.video_prompt}</p>
                <button onClick={() => handleCopy(output.video_prompt, 'video')} className="absolute top-3 right-3 text-gray-500 hover:text-[#00ff00] transition-colors">
                  {copiedIndex === 'video' ? <CheckCircle2 size={16} className="text-[#00ff00]" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Voiceover Result */}
              {output.voiceover_script && (
                <div className="bg-[#0d1014] border border-[#2a2e39] rounded-lg p-3 relative group border-l-2 border-l-[#00ff00]">
                  <p className="text-[#00ff00] text-xs font-bold mb-2 uppercase flex items-center gap-2">
                    <Mic size={14}/> Burmese Voiceover
                  </p>
                  <p className="text-gray-200 pr-8 bg-[#161920] p-2 rounded border border-[#2a2e39]">
                    "{output.voiceover_script}"
                  </p>
                  <p className="text-gray-500 text-xs mt-3 italic pb-1">
                    <span className="text-gray-400 not-italic font-bold">Voice style:</span> {output.voice_prompt}
                  </p>
                  <button onClick={() => handleCopy(`${output.voiceover_script}\n\nVoice Info: ${output.voice_prompt}`, 'voice')} className="absolute top-3 right-3 text-gray-500 hover:text-[#00ff00] transition-colors">
                    {copiedIndex === 'voice' ? <CheckCircle2 size={16} className="text-[#00ff00]" /> : <Copy size={16} />}
                  </button>
                </div>
              )}

            </div>
          ) : null}
        </div>

      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-[#101216] border-t border-[#2a2e39] p-3 text-center z-30 flex flex-col items-center justify-center gap-1 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        <div className="text-[#00ff00] text-xs font-bold font-mono tracking-widest">&lt; &gt;</div>
        <p className="text-gray-500 text-[10px] tracking-widest uppercase">PROMPT TOOLS CREATE BY</p>
        <p className="text-[#00ff00] text-xs font-bold tracking-widest">Min Khaing Zaw Oo</p>
      </footer>

      {/* API Key Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#2a2e39] rounded-xl w-full max-w-sm p-5 shadow-[0_0_30px_rgba(0,255,0,0.1)] relative animate-slide-up">
            <button onClick={() => setShowApiModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-[#00ff00] font-bold flex items-center gap-2 mb-4">
              <KeyRound size={18} /> API Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Groq API Key ထည့်ပါ (gsk...)</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="................................."
                  className="w-full bg-[#0d1014] border border-[#00ff00] text-[#00ff00] rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00ff00] tracking-widest"
                />
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                * ဤ Key ကို သင် Browser တွင်သာ (Local Storage) လုံခြုံစွာ သိမ်းဆည်းထားမည်ဖြစ်သည်။ <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[#00ff00] underline">Get Groq Key</a>
              </p>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleSaveKey}
                  className="flex-1 bg-[#00ff00]/10 border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/20 font-bold py-2 rounded-lg text-sm transition-colors flex justify-center items-center gap-1"
                >
                  <Check size={16} /> SAVE KEY
                </button>
                <button 
                  onClick={handleRemoveKey}
                  className="flex-1 bg-transparent border border-red-900 text-red-500 hover:bg-red-950 font-bold py-2 rounded-lg text-sm transition-colors"
                >
                  REMOVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161920] border border-[#2a2e39] rounded-xl w-full max-w-sm p-6 text-center shadow-2xl animate-fade-in">
            <h3 className="text-white font-bold text-lg mb-2">App မှ ထွက်ရန်</h3>
            <p className="text-gray-400 text-sm mb-6">တကယ်ထွက်မှာ သေချာပြီလား ခင်ဗျာ?</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowExitModal(false)}
                className="px-6 py-2 text-[#00ff00] font-bold text-sm hover:bg-[#00ff00]/10 rounded-lg transition-colors border border-transparent hover:border-[#00ff00]"
              >
                မထွက်ပါ
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 text-white font-bold text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-lg"
              >
                ထွက်မည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lighting Modal */}
      {showLightingModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[#161920] border-t sm:border border-[#2a2e39] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[70vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="sticky top-0 bg-[#161920] p-4 border-b border-[#2a2e39] flex justify-between items-center z-10">
              <h3 className="text-gray-200 font-bold text-sm">အလင်းရောင် (Lighting)</h3>
              <button onClick={() => setShowLightingModal(false)} className="hover:text-white transition-colors"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-2">
              {lightingOptions.map(option => (
                <div 
                  key={option.id}
                  onClick={() => { setLighting(option.id); setShowLightingModal(false); }}
                  className="flex items-center justify-between p-3 hover:bg-[#0d1014] rounded-lg cursor-pointer text-sm text-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.id}</span>
                  </div>
                  {lighting === option.id ? <CheckCircle2 size={18} className="text-[#00ff00]" /> : <Circle size={18} className="text-gray-700" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[#161920] border-t sm:border border-[#2a2e39] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[70vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="sticky top-0 bg-[#161920] p-4 border-b border-[#2a2e39] flex justify-between items-center z-10">
              <h3 className="text-gray-200 font-bold text-sm">ကင်မရာ ရွေ့လျားမှု (Camera Movement)</h3>
              <button onClick={() => setShowCameraModal(false)} className="hover:text-white transition-colors"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="p-2">
              {cameraOptions.map(option => (
                <div 
                  key={option.id}
                  onClick={() => { setCameraMovement(option.id); setShowCameraModal(false); }}
                  className="flex items-center justify-between p-3 hover:bg-[#0d1014] rounded-lg cursor-pointer text-sm text-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.id}</span>
                  </div>
                  {cameraMovement === option.id ? <CheckCircle2 size={18} className="text-[#00ff00]" /> : <Circle size={18} className="text-gray-700" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
}