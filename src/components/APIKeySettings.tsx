import { useState, useEffect } from "react";
import { Key, Save, CheckCircle, Eye, EyeOff, Shield } from "lucide-react";
import { encryptData, decryptData } from "../lib/security";

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
        setKeys({
            openai: decryptData(localStorage.getItem("openai_key") || ""),
            groq: decryptData(localStorage.getItem("groq_key") || ""),
            anthropic: decryptData(localStorage.getItem("anthropic_key") || ""),
            gemini: decryptData(localStorage.getItem("google_key") || "")
        });
        setUseCustomKeys(localStorage.getItem("use_custom_keys") === "true");
    }, []);

    function handleChange(provider: string, value: string) {
        setKeys(prev => ({ ...prev, [provider]: value }));
    }

    function toggleShow(provider: string) {
        setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
    }

    function saveKeys() {
        localStorage.setItem("openai_key", encryptData(keys.openai));
        localStorage.setItem("groq_key", encryptData(keys.groq));
        localStorage.setItem("anthropic_key", encryptData(keys.anthropic));
        localStorage.setItem("google_key", encryptData(keys.gemini));
        localStorage.setItem("use_custom_keys", useCustomKeys.toString());

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="bg-surface border border-border rounded-xl p-8 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
                    <Key size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-text-main">API Keys</h2>
                    <p className="text-xs text-text-muted">Toggle between default and custom API keys</p>
                </div>
            </div>

            {/* Success Alert */}
            {saved && (
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in">
                    <CheckCircle size={18} />
                    <span className="font-medium">Settings saved successfully!</span>
                </div>
            )}

            {/* Toggle Switch Container */}
            <div className="bg-surface-highlight border border-border rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-text-main mb-1">API Key Mode</h3>
                        <p className="text-xs text-text-muted">
                            {useCustomKeys
                                ? "Using your custom API keys (higher limits)"
                                : "Using default free keys (limited)"
                            }
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold transition-colors ${!useCustomKeys ? 'text-primary' : 'text-text-muted'}`}>
                            Default
                        </span>
                        <button
                            onClick={() => setUseCustomKeys(!useCustomKeys)}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${useCustomKeys ? 'bg-primary' : 'bg-surface border border-border'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${useCustomKeys ? 'translate-x-8' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className={`text-sm font-semibold transition-colors ${useCustomKeys ? 'text-primary' : 'text-text-muted'}`}>
                            Custom
                        </span>
                    </div>
                </div>
            </div>

            {/* Warning Alert */}
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl flex items-start gap-3">
                <Shield size={18} className="mt-0.5 flex-shrink-0" />
                <div className="text-xs leading-relaxed">
                    <strong className="font-semibold block mb-1">⚡ Free vs Custom Keys</strong>
                    <p className="text-amber-400/80">
                        <strong>Default (Free)</strong>: Shared Groq key with rate limits - good for testing<br />
                        <strong>Custom</strong>: Your own API keys - higher limits, better performance, longer outputs
                    </p>
                </div>
            </div>

            {/* API Key Inputs */}
            {useCustomKeys && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Your Custom API Keys</h3>
                    {Object.entries(keys).map(([provider, key]) => (
                        <div key={provider} className="bg-surface-highlight border border-border rounded-lg p-4">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
                                {provider.charAt(0).toUpperCase() + provider.slice(1)}
                            </label>
                            <div className="relative flex items-center bg-surface border border-border rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                                <input
                                    type={showKeys[provider] ? "text" : "password"}
                                    value={key}
                                    onChange={(e) => handleChange(provider, e.target.value)}
                                    className="w-full bg-transparent text-text-main px-3 py-2.5 text-sm placeholder-text-muted focus:ring-0 focus:outline-none border-none"
                                    placeholder={`Enter your ${provider} API key`}
                                />
                                <button
                                    onClick={() => toggleShow(provider)}
                                    className="px-3 text-text-muted hover:text-text-main transition-colors"
                                >
                                    {showKeys[provider] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Security Note */}
            <div className="bg-surface-highlight border border-border rounded-xl p-4 flex gap-3 items-start">
                <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-500 mt-0.5">
                    <Shield size={16} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-text-main mb-1">Security Note</h4>
                    <p className="text-xs text-text-muted leading-relaxed">
                        Your API keys are stored locally in your browser's storage. They are never sent to our servers, only directly to the AI providers.
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-border">
                <button
                    onClick={saveKeys}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Save size={18} /> Save Settings
                </button>
            </div>
        </div>
    );
}
