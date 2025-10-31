import React, { useState } from 'react';
import { Sparkles, Copy, CheckCircle, Wand2, Hash, Globe } from 'lucide-react';

export function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [platform, setPlatform] = useState('general');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'witty', label: 'Witty' },
    { value: 'formal', label: 'Formal' },
    { value: 'friendly', label: 'Friendly' }
  ];

  const platforms = [
    { value: 'general', label: 'General' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const sampleContent = generateSampleContent(prompt, tone, platform);
    const sampleHashtags = generateSampleHashtags(prompt, platform);

    setGeneratedContent(sampleContent);
    setGeneratedHashtags(sampleHashtags);
    setLoading(false);
  };

  const handleCopy = () => {
    const fullContent = `${generatedContent}\n\n${generatedHashtags.join(' ')}`;
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Copywriting Assistant</h1>
        <p className="text-gray-600 mt-1">Generate engaging content for your social media posts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to post about?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E.g., Announcing our new product launch, sharing team achievements, promoting a webinar..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {platforms.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Generate Content'}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Pro Tips:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Be specific about your message and target audience</li>
                  <li>• Choose the right tone for your brand voice</li>
                  <li>• Select platform-specific optimizations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Generated Content</h3>
            {generatedContent && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          {!generatedContent ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">No content generated yet</p>
              <p className="text-sm text-gray-500">Fill in the details and click generate</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {generatedContent}
                </p>
              </div>

              {generatedHashtags.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Suggested Hashtags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedHashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Regenerate content
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
          <div className="bg-white p-3 rounded-lg w-fit mb-3">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Smart Content Generation</h3>
          <p className="text-sm text-gray-600">
            AI-powered copywriting that adapts to your brand voice and platform requirements
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="bg-white p-3 rounded-lg w-fit mb-3">
            <Hash className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Hashtag Suggestions</h3>
          <p className="text-sm text-gray-600">
            Get relevant trending hashtags to maximize your content's reach and engagement
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
          <div className="bg-white p-3 rounded-lg w-fit mb-3">
            <Globe className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Multi-Platform Optimization</h3>
          <p className="text-sm text-gray-600">
            Content optimized for each platform's character limits and best practices
          </p>
        </div>
      </div>
    </div>
  );
}

function generateSampleContent(prompt: string, tone: string, platform: string): string {
  const templates: Record<string, string[]> = {
    professional: [
      `We're excited to share that ${prompt}. This milestone represents our commitment to excellence and innovation. Join us as we continue to push boundaries and deliver exceptional results.`,
      `Thrilled to announce ${prompt}. Our team has been working diligently to bring this vision to life, and we couldn't be more proud of the outcome.`,
    ],
    casual: [
      `Hey everyone! ${prompt} and we're super excited about it! 🎉 Can't wait to hear what you think. Let us know in the comments!`,
      `So... ${prompt} and honestly, we're pretty stoked about it! Drop a comment and let us know your thoughts! 💭`,
    ],
    witty: [
      `Plot twist: ${prompt}! We know, we know - try to contain your excitement. 😎 But seriously, this is pretty cool stuff.`,
      `*Drumroll please* 🥁 ${prompt}! Yes, it's finally happening. Your move, competitors.`,
    ],
    formal: [
      `We are pleased to inform you that ${prompt}. This development aligns with our strategic objectives and underscores our dedication to quality and innovation.`,
      `It is with great pleasure that we announce ${prompt}. This achievement reflects our unwavering commitment to excellence.`,
    ],
    friendly: [
      `Hi friends! 👋 We wanted to share some exciting news - ${prompt}! We're so grateful for your continued support and can't wait to hear your feedback!`,
      `Hey there! We've got some awesome news to share: ${prompt}! Your support means everything to us. Let's celebrate together! 🎊`,
    ]
  };

  const toneTemplates = templates[tone] || templates.professional;
  return toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
}

function generateSampleHashtags(prompt: string, platform: string): string[] {
  const commonHashtags = ['#SocialMedia', '#ContentMarketing', '#DigitalMarketing', '#Marketing'];
  const platformSpecific: Record<string, string[]> = {
    instagram: ['#InstaGood', '#PhotoOfTheDay', '#InstaDaily'],
    linkedin: ['#Leadership', '#Business', '#Professional'],
    twitter: ['#Tech', '#Innovation', '#Trending'],
    facebook: ['#Community', '#ShareTheLove', '#Engagement'],
    general: ['#SocialMediaMarketing', '#ContentCreation', '#BrandBuilding']
  };

  const platformTags = platformSpecific[platform] || platformSpecific.general;
  return [...commonHashtags.slice(0, 3), ...platformTags.slice(0, 2)];
}
