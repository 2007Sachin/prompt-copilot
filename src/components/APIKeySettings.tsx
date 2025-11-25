import { useState, useEffect } from "react";
import { Key, Save, CheckCircle, Eye, EyeOff, Shield } from "lucide-react";

export default function APIKeySettings() {
    const [keys, setKeys] = useState<Record<string, string>>({
        openai: "",
        groq: "",
        anthropic: "",
        gemini: ""
    });
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [useCustomKeys, setUseCustomKeys] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load custom keys from localStorage
        setKeys({
            openai: localStorage.getItem("openai_key") || "",
            groq: localStorage.getItem("groq_key") || "",
            anthropic: localStorage.getItem("anthropic_key") || "",
            gemini: localStorage.getItem("google_key") || ""
        });

        // Load custom key preference (single global toggle)
        setUseCustomKeys(localStorage.getItem("use_custom_keys") === "true");
    }, []);

    function handleChange(provider: string, value: string) {
        setKeys(prev => ({ ...prev, [provider]: value }));
    }

    function toggleShow(provider: string) {
        setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
    }

    function saveKeys() {
        // Save custom keys
        localStorage.setItem("openai_key", keys.openai);
        localStorage.setItem("groq_key", keys.groq);
        localStorage.setItem("anthropic_key", keys.anthropic);
        localStorage.setItem("google_key", keys.gemini);

        // Save custom key preference (single global setting)
        localStorage.setItem("use_custom_keys", useCustomKeys.toString());

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-8 shadow-[0_0_20px_rgba(0,0,0,0.3)] space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#BB86FC]/20 p-2 rounded-xl text-[#BB86FC] shadow-sm">
                    <Key size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[#E0E0E0]">API Keys</h2>
                    <p className="text-xs text-[#A0A0A0]">Toggle between default and custom API keys</p>
                </div>
            </div>

            {saved && (
                <div className="mb-4 bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in shadow-sm">
                    <CheckCircle size={18} />
                    <span className="font-medium">Settings saved successfully!</span>
                </div>
            )}

            {/* SINGLE GLOBAL TOGGLE */}
            <div className="bg-[#252525] border-2 border-[#BB86FC]/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-[#E0E0E0] mb-1">API Key Mode</h3>
                        <p className="text-xs text-[#A0A0A0]">
                            {useCustomKeys
                                ? "Using your custom API keys (higher limits)"
                                : "Using default free keys (limited)"
                            }
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${!useCustomKeys ? 'text-[#03DAC6]' : 'text-[#666]'}`}>
                            Default
                        </span>
                        <button
                            onClick={() => setUseCustomKeys(!useCustomKeys)}
                            className={`relative w-16 h-8 rounded-full transition-colors shadow-lg ${useCustomKeys ? 'bg-[#BB86FC]' : 'bg-[#333]'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform shadow-md ${useCustomKeys ? 'translate-x-8' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <span className={`text-sm font-semibold ${useCustomKeys ? 'text-[#BB86FC]' : 'text-[#666]'}`}>
                            Custom
                        </span>
                    </div>
                </div>
            </div>

            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm">
                <Shield size={18} className="mt-0.5 flex-shrink-0" />
                <div className="text-xs leading-relaxed">
                    <strong className="font-semibold block mb-1">⚡ Free vs Custom Keys</strong>
                    <p className="text-amber-300/80">
                        <strong>Default (Free)</strong>: Shared Groq key with rate limits - good for testing<br />
                        <strong>Custom</strong>: Your own API keys - higher limits, better performance, longer outputs
                    </p>
                </div>
            </div>

            {/* Show inputs only when custom mode is enabled */}
            {useCustomKeys && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider">Your Custom API Keys</h3>
                    {Object.entries(keys).map(([provider, key]) => (
                        <div key={provider} className="bg-[#252525] border border-[#2A2A2A] rounded-xl p-4">
                            <label className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider mb-2 block">
                                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                            </label>
                            <div className="relative">
                                <input
                                    type={showKeys[provider] ? "text" : "password"}
                                    value={key}
                                    onChange={(e) => handleChange(provider, e.target.value)}
                                    className="w-full bg-[#1E1E1E] text-[#E0E0E0] border border-[#2A2A2A] rounded-lg pl-3 pr-10 py-2.5 text-sm focus:ring-1 focus:ring-[#BB86FC] focus:border-[#BB86FC] transition-all placeholder-[#666]"
                                    placeholder={`Enter your ${provider} API key`}
                                />
                                <button
                                    onClick={() => toggleShow(provider)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#E0E0E0] transition-colors"
                                >
                                    {showKeys[provider] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-[#252525] border border-[#2A2A2A] rounded-xl p-4 flex gap-3 items-start mt-4">
                <div className="bg-[#BB86FC]/10 p-1.5 rounded-lg text-[#BB86FC] mt-0.5">
                    <Shield size={16} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-[#E0E0E0] mb-1">Security Note</h4>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed">
                        Your API keys are stored locally in your browser's storage. They are never sent to our servers, only directly to the AI providers.
                    </p>
                </div>
            </div>

            <div className="pt-6 mt-auto border-t border-[#2A2A2A]">
                <button
                    onClick={saveKeys}
                    className="w-full bg-[#BB86FC] text-black rounded-lg py-3 font-semibold transition-all shadow-lg hover:bg-[#a66af5] flex items-center justify-center gap-2"
                >
                    <Save size={18} /> Save Settings
                </button>
            </div>
        </div>
    );
}
