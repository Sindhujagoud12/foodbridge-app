import React, { useState } from 'react';
import { analyzeFoodImage, matchDonations } from './services/geminiService';
import { Donation, AnalysisResult, MatchResult, RecipientNeed } from './types';
import { UploadIcon, CheckCircleIcon, SparklesIcon, TruckIcon, BrainIcon, GiftIcon } from './components/Icon';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donor' | 'recipient' | 'brain'>('donor');
  
  // State for Donations
  const [donations, setDonations] = useState<Donation[]>([
    { id: 1, item: "Sourdough Bread", quantity: "5 loaves", category: "Bakery", expiry: "2 days", status: "Available" },
    { id: 2, item: "Canned Beans", quantity: "10 cans", category: "Canned", expiry: "1 year", status: "Available" }
  ]);

  // State for Donor Portal Analysis
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [formState, setFormState] = useState({
    item: '',
    quantity: '',
    category: 'Produce',
    expiry: ''
  });

  // State for Recipient Logic
  const [recipientType, setRecipientType] = useState<string>('Shelter');

  // State for AI Logic
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // --- HANDLERS ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null); // Reset previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const performAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    const result = await analyzeFoodImage(selectedImage);
    setIsAnalyzing(false);
    
    if (result && !result.error) {
      setAnalysisResult(result);
      // Pre-fill form
      const item = result.food_items[0];
      if (item) {
        setFormState({
          item: item.item,
          quantity: item.quantity,
          category: item.category,
          expiry: item.expiry_estimate
        });
      }
    } else {
      alert(`Error: ${result.error || 'Failed to analyze'}`);
    }
  };

  const submitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const newDonation: Donation = {
      id: donations.length + 1,
      item: formState.item,
      quantity: formState.quantity,
      category: formState.category,
      expiry: formState.expiry,
      status: "Available",
      imageUrl: selectedImage || undefined
    };
    setDonations([...donations, newDonation]);
    
    // Reset Donor State
    setSelectedImage(null);
    setAnalysisResult(null);
    setFormState({ item: '', quantity: '', category: 'Produce', expiry: '' });
    alert("Donation added to the network!");
  };

  const claimDonation = (id: number) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'Claimed' } : d));
    alert("Donation claimed! Dispatching courier...");
  };

  const runLogisticsOptimization = async () => {
    setIsMatching(true);
    // Mock Needs
    const needs: RecipientNeed[] = [
      { recipient: "Downtown Shelter", need: "Prepared Meals", urgency: "High" },
      { recipient: "Westside Food Bank", need: "Canned Goods", urgency: "Medium" },
      { recipient: "Kids Kitchen", need: "Fresh Produce", urgency: "High" }
    ];

    const result = await matchDonations(donations.filter(d => d.status === 'Available'), needs);
    setMatchResult(result);
    setIsMatching(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm z-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
             <span className="text-2xl">🍎</span>
          </div>
          <h1 className="text-xl font-bold text-green-800 tracking-tight">FoodBridge</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('donor')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'donor' ? 'bg-green-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <UploadIcon />
            <span className="font-medium">Donor Portal</span>
          </button>
          
          <button 
             onClick={() => setActiveTab('recipient')}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'recipient' ? 'bg-green-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <GiftIcon />
            <span className="font-medium">Recipient Feed</span>
          </button>

          <button 
             onClick={() => setActiveTab('brain')}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'brain' ? 'bg-green-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BrainIcon />
            <span className="font-medium">AI Logistics</span>
          </button>
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-800 mb-1">Impact Tracker</h3>
            <p className="text-2xl font-bold text-green-600">{donations.length}</p>
            <p className="text-xs text-green-700">Donations in System</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        
        {/* TAB 1: DONOR */}
        {activeTab === 'donor' && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800">Post a Donation</h2>
              <p className="text-slate-500 mt-2">Upload a photo. Gemini AI will handle the details.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Col: Upload */}
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-white hover:border-green-500 transition-colors cursor-pointer relative min-h-[300px]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="max-h-64 rounded-lg shadow-sm" />
                  ) : (
                    <>
                      <div className="bg-green-50 text-green-600 p-4 rounded-full mb-4">
                        <UploadIcon />
                      </div>
                      <p className="text-slate-600 font-medium">Click to upload food image</p>
                      <p className="text-slate-400 text-sm mt-1">JPG, PNG supported</p>
                    </>
                  )}
                </div>

                {selectedImage && (
                  <button 
                    onClick={performAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                  >
                    {isAnalyzing ? (
                      <><span>Analyzing...</span></>
                    ) : (
                      <><SparklesIcon /><span>Analyze with Gemini Vision</span></>
                    )}
                  </button>
                )}
              </div>

              {/* Right Col: Form */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                    <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                    <span>Donation Details</span>
                </h3>
                
                <form onSubmit={submitDonation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                    <input 
                      type="text" 
                      value={formState.item}
                      onChange={e => setFormState({...formState, item: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      placeholder="e.g., Box of Apples"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                        <input 
                        type="text" 
                        value={formState.quantity}
                        onChange={e => setFormState({...formState, quantity: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="e.g., 5 kg"
                        required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Expiry</label>
                        <input 
                        type="text" 
                        value={formState.expiry}
                        onChange={e => setFormState({...formState, expiry: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="e.g., 2 days"
                        required
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      value={formState.category}
                      onChange={e => setFormState({...formState, category: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option>Produce</option>
                        <option>Canned</option>
                        <option>Prepared Meal</option>
                        <option>Bakery</option>
                        <option>Other</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all">
                        Confirm Donation
                    </button>
                  </div>
                </form>

                {analysisResult && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs font-mono text-slate-500 overflow-auto max-h-40">
                        <p className="font-bold mb-1">Raw AI Output:</p>
                        <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
                    </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECIPIENT */}
        {activeTab === 'recipient' && (
             <div className="max-w-4xl mx-auto animate-fadeIn">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Available Rescue</h2>
                        <p className="text-slate-500 mt-2">Real-time feed for shelters and food banks.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                        <span className="text-sm text-slate-500 mr-2">Viewing as:</span>
                        <select 
                            value={recipientType} 
                            onChange={(e) => setRecipientType(e.target.value)}
                            className="font-semibold text-slate-700 bg-transparent outline-none"
                        >
                            <option value="Shelter">Homeless Shelter</option>
                            <option value="Food Bank">Food Bank</option>
                            <option value="Kitchen">Community Kitchen</option>
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {donations.filter(d => d.status === 'Available').length === 0 && (
                        <div className="col-span-2 text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-400">No available donations at the moment.</p>
                        </div>
                    )}
                    {donations.map((d) => (
                        <div key={d.id} className={`bg-white rounded-xl p-6 shadow-sm border ${d.status === 'Claimed' ? 'border-green-200 bg-green-50 opacity-70' : 'border-slate-100 hover:shadow-md'} transition-all`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-lg">
                                        {d.category === 'Bakery' ? '🥖' : d.category === 'Produce' ? '🥦' : '📦'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{d.item}</h4>
                                        <p className="text-sm text-slate-500">{d.quantity}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${d.status === 'Available' ? 'bg-blue-100 text-blue-700' : 'bg-green-200 text-green-800'}`}>
                                    {d.status}
                                </span>
                            </div>
                            
                            {d.imageUrl && (
                                <div className="mb-4 h-32 overflow-hidden rounded-lg bg-slate-100">
                                    <img src={d.imageUrl} alt={d.item} className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                <div className="text-xs text-slate-500">
                                    <span className="font-semibold">Expires:</span> {d.expiry}
                                </div>
                                {d.status === 'Available' ? (
                                    <button 
                                        onClick={() => claimDonation(d.id)}
                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm rounded-lg transition-colors flex items-center space-x-1"
                                    >
                                        <TruckIcon /> <span>Claim</span>
                                    </button>
                                ) : (
                                    <span className="flex items-center space-x-1 text-green-700 font-bold text-sm">
                                        <CheckCircleIcon /> <span>Claimed</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* TAB 3: BRAIN */}
        {activeTab === 'brain' && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
                 <header className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">AI Logistics Brain</h2>
                    <p className="text-slate-500 mt-2">Gemini calculates optimal matches between live inventory and recipient needs.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 text-center">
                        <div className="inline-block p-4 bg-purple-50 rounded-full mb-4">
                            <BrainIcon />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">Run Chain-of-Thought Optimization</h3>
                        <p className="text-slate-500 mb-6 max-w-lg mx-auto">
                            The AI will analyze categories, expiration dates, and recipient urgency to propose the most efficient distribution.
                        </p>
                        <button 
                            onClick={runLogisticsOptimization}
                            disabled={isMatching}
                            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold shadow-lg shadow-purple-200 transition-all disabled:opacity-70"
                        >
                            {isMatching ? 'Calculating...' : 'Start Optimization'}
                        </button>
                    </div>
                    
                    <div className="p-8 bg-slate-50 min-h-[300px]">
                        {matchResult ? (
                             <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
                                    <h4 className="font-bold text-purple-800 mb-2">Executive Summary</h4>
                                    <p className="text-slate-700 leading-relaxed">{matchResult.summary}</p>
                                </div>

                                <div className="space-y-4">
                                    {matchResult.matches.map((m, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-mono text-xs font-bold text-slate-400">ID: {m.donation_id}</span>
                                                    <span className="text-slate-300">➜</span>
                                                    <span className="font-bold text-slate-800">{m.recipient_id}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 italic">"{m.reasoning}"</p>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-lg">
                                                <span className="text-xs text-green-700 font-bold uppercase">Match Score</span>
                                                <span className="text-lg font-bold text-green-700">{m.score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 italic">
                                Results will appear here...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default App;
