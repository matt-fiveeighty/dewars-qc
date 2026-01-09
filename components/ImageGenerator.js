'use client';

import { useState, useRef } from 'react';

export default function ImageGenerator({ project }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState('product');
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  // Reference image library - categorized
  const imageLibrary = {
    product: {
      name: 'Product Forward',
      images: [
        { id: 'p1', name: 'Bottle Hero Shot', thumb: '🍾', desc: 'Clean bottle on gradient' },
        { id: 'p2', name: 'Bottle with Pour', thumb: '🥃', desc: 'Dynamic pour shot' },
        { id: 'p3', name: 'Bottle Group', thumb: '🍾🍾', desc: 'Multiple variants' },
        { id: 'p4', name: 'Bottle Detail', thumb: '🔍', desc: 'Label close-up' },
        { id: 'p5', name: 'Gift Box', thumb: '🎁', desc: 'Premium packaging' },
        { id: 'p6', name: 'Miniatures', thumb: '📦', desc: 'Travel size lineup' },
      ]
    },
    lifestyle: {
      name: 'Lifestyle',
      images: [
        { id: 'l1', name: 'Bar Scene', thumb: '🍸', desc: 'Upscale bar setting' },
        { id: 'l2', name: 'Home Setting', thumb: '🏠', desc: 'Cozy home bar' },
        { id: 'l3', name: 'Outdoor Gathering', thumb: '🌳', desc: 'Garden party' },
        { id: 'l4', name: 'Celebration', thumb: '🎉', desc: 'Toast moment' },
        { id: 'l5', name: 'Quiet Moment', thumb: '📖', desc: 'Contemplative scene' },
        { id: 'l6', name: 'Friends Together', thumb: '👥', desc: 'Social gathering' },
      ]
    },
    cocktail: {
      name: 'Cocktail',
      images: [
        { id: 'c1', name: 'Highball', thumb: '🧊', desc: 'Classic highball serve' },
        { id: 'c2', name: 'Old Fashioned', thumb: '🥃', desc: 'Rocks glass serve' },
        { id: 'c3', name: 'Sour', thumb: '🍋', desc: 'Whisky sour style' },
        { id: 'c4', name: 'Hot Toddy', thumb: '☕', desc: 'Warm serve' },
        { id: 'c5', name: 'Cocktail Making', thumb: '🍹', desc: 'Action pour' },
        { id: 'c6', name: 'Garnish Detail', thumb: '🍊', desc: 'Garnish close-up' },
      ]
    },
    background: {
      name: 'Backgrounds',
      images: [
        { id: 'b1', name: 'Warm Gradient', thumb: '🟤', desc: 'Brand brown tones' },
        { id: 'b2', name: 'Dark Moody', thumb: '⬛', desc: 'Deep shadows' },
        { id: 'b3', name: 'Light Airy', thumb: '⬜', desc: 'Bright, clean' },
        { id: 'b4', name: 'Texture Wood', thumb: '🪵', desc: 'Oak barrel texture' },
        { id: 'b5', name: 'Texture Leather', thumb: '🟫', desc: 'Rich leather' },
        { id: 'b6', name: 'Abstract', thumb: '🎨', desc: 'Artistic swirls' },
      ]
    },
    seasonal: {
      name: 'Seasonal',
      images: [
        { id: 's1', name: 'Holiday', thumb: '🎄', desc: 'Festive setting' },
        { id: 's2', name: 'Summer', thumb: '☀️', desc: 'Bright, refreshing' },
        { id: 's3', name: 'Fall', thumb: '🍂', desc: 'Autumn warmth' },
        { id: 's4', name: 'Winter', thumb: '❄️', desc: 'Cozy fireside' },
        { id: 's5', name: 'Spring', thumb: '🌸', desc: 'Fresh blooms' },
        { id: 's6', name: "Father's Day", thumb: '👔', desc: 'Gift occasion' },
      ]
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Step 1: Optimize prompt via GPT API (placeholder)
      const optimizedPrompt = await optimizePrompt(prompt, referenceImage, uploadedDocs);
      
      // Step 2: Generate image via Banana Pro API (placeholder)
      const imageUrl = await generateImage(optimizedPrompt);
      
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Image generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Placeholder - will connect to your GPT API
  const optimizePrompt = async (rawPrompt, refImage, docs) => {
    // TODO: Connect to your ChatGPT prompt optimizer API
    console.log('Optimizing prompt:', rawPrompt);
    console.log('Reference image:', refImage);
    console.log('Uploaded docs:', docs);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return `Dewar's whisky brand photography, ${rawPrompt}, warm lighting 2700-4000K, photorealistic, premium quality`;
  };

  // Placeholder - will connect to Banana Pro API
  const generateImage = async (optimizedPrompt) => {
    // TODO: Connect to Nano Banana Pro API
    console.log('Generating with prompt:', optimizedPrompt);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return placeholder
    return null;
  };

  const handleDocUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file: file
    }));
    setUploadedDocs([...uploadedDocs, ...newDocs]);
  };

  const removeDoc = (id) => {
    setUploadedDocs(uploadedDocs.filter(doc => doc.id !== id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#AD3826';
    e.currentTarget.style.background = 'rgba(173, 56, 38, 0.1)';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#3a3a3a';
    e.currentTarget.style.background = 'transparent';
  };

  const handleDrop = (e, imageData) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#3a3a3a';
    e.currentTarget.style.background = 'transparent';
    
    // If dropping from library
    if (imageData) {
      setReferenceImage(imageData);
    }
  };

  const selectReference = (image) => {
    setReferenceImage(image);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{
        background: '#AD3826',
        padding: '16px 24px',
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Brand Image Gen</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
          AI-powered image generation trained on Dewar's brand guidelines
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left Side - Prompt Builder */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Prompt Input */}
          <div style={{
            background: '#262626',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #3a3a3a'
          }}>
            <label style={{ fontSize: '12px', color: '#888', marginBottom: '8px', display: 'block' }}>
              Describe what you want:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A premium bottle shot with warm amber lighting, oak barrel in background, subtle smoke..."
              style={{
                width: '100%',
                height: '150px',
                background: '#1a1a1a',
                border: '1px solid #3a3a3a',
                borderRadius: '6px',
                padding: '12px',
                color: 'white',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            
            {/* Uploaded Docs */}
            {uploadedDocs.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {uploadedDocs.map(doc => (
                  <div key={doc.id} style={{
                    background: '#3a3a3a',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📄 {doc.name}
                    <button
                      onClick={() => removeDoc(doc.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        padding: '0 2px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Document Button */}
            <button
              onClick={() => docInputRef.current?.click()}
              style={{
                marginTop: '12px',
                background: 'transparent',
                border: '1px dashed #3a3a3a',
                color: '#888',
                padding: '10px',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>+</span> Add document for context
            </button>
            <input
              ref={docInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleDocUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Reference Image Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
            style={{
              background: '#262626',
              borderRadius: '8px',
              padding: '20px',
              border: '2px dashed #3a3a3a',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
          >
            <label style={{ fontSize: '12px', color: '#888', marginBottom: '12px', display: 'block' }}>
              Reference Image (drag from library →)
            </label>
            {referenceImage ? (
              <div style={{
                background: '#1a1a1a',
                padding: '16px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '32px' }}>{referenceImage.thumb}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{referenceImage.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{referenceImage.desc}</div>
                </div>
                <button
                  onClick={() => setReferenceImage(null)}
                  style={{
                    marginLeft: 'auto',
                    background: '#3a3a3a',
                    border: 'none',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ color: '#666', fontSize: '14px', padding: '20px' }}>
                Drag an image from the library to use as reference
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            style={{
              background: isGenerating ? '#666' : '#AD3826',
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {isGenerating ? (
              <>
                <span style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </button>

          {/* Generated Result */}
          {generatedImage && (
            <div style={{
              background: '#262626',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #3a3a3a'
            }}>
              <label style={{ fontSize: '12px', color: '#888', marginBottom: '12px', display: 'block' }}>
                Generated Result:
              </label>
              <img src={generatedImage} alt="Generated" style={{ width: '100%', borderRadius: '6px' }} />
            </div>
          )}

          {/* Placeholder for generated result */}
          {!generatedImage && (
            <div style={{
              background: '#262626',
              borderRadius: '8px',
              padding: '40px',
              border: '1px solid #3a3a3a',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
              <div style={{ fontSize: '14px' }}>Generated image will appear here</div>
            </div>
          )}
        </div>

        {/* Right Side - Image Library */}
        <div style={{
          width: '320px',
          background: '#262626',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #3a3a3a',
          maxHeight: '700px',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#888' }}>
            Reference Library
          </h3>
          
          {Object.entries(imageLibrary).map(([key, category]) => (
            <div key={key} style={{ marginBottom: '8px' }}>
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
                style={{
                  width: '100%',
                  background: expandedCategory === key ? '#3a3a3a' : 'transparent',
                  border: '1px solid #3a3a3a',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {category.name}
                <span style={{
                  transform: expandedCategory === key ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s'
                }}>
                  ▼
                </span>
              </button>
              
              {/* Category Images */}
              {expandedCategory === key && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  padding: '12px 4px'
                }}>
                  {category.images.map(image => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('image', JSON.stringify(image));
                      }}
                      onClick={() => selectReference(image)}
                      style={{
                        background: referenceImage?.id === image.id ? 'rgba(173, 56, 38, 0.3)' : '#1a1a1a',
                        border: referenceImage?.id === image.id ? '2px solid #AD3826' : '1px solid #3a3a3a',
                        borderRadius: '6px',
                        padding: '12px 8px',
                        textAlign: 'center',
                        cursor: 'grab',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (referenceImage?.id !== image.id) {
                          e.currentTarget.style.borderColor = '#AD3826';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (referenceImage?.id !== image.id) {
                          e.currentTarget.style.borderColor = '#3a3a3a';
                        }
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{image.thumb}</div>
                      <div style={{ fontSize: '10px', color: '#888', lineHeight: '1.3' }}>{image.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
