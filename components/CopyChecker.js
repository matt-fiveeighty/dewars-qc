'use client';

import { useState, useRef } from 'react';

export default function CopyChecker({ project }) {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState('digital');
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({
    tone: null,
    audience: null,
    length: null,
    cta: null
  });
  const docInputRef = useRef(null);

  // Copy archetypes by category
  const copyArchetypes = {
    digital: {
      name: 'Digital',
      templates: [
        { 
          id: 'd1', 
          name: 'E-Blast', 
          desc: 'Email marketing campaigns',
          prompts: ['Subject line', 'Preview text', 'Hero headline', 'Body copy', 'CTA button']
        },
        { 
          id: 'd2', 
          name: 'Banner Ad', 
          desc: 'Display advertising',
          prompts: ['Headline (25 chars)', 'Subhead (40 chars)', 'CTA (15 chars)']
        },
        { 
          id: 'd3', 
          name: 'Under 140 Char', 
          desc: 'Social media / Twitter',
          prompts: ['Hook', 'Message', 'Hashtags']
        },
        { 
          id: 'd4', 
          name: 'Social Post', 
          desc: 'Instagram / Facebook',
          prompts: ['Caption', 'Hashtags', 'CTA']
        },
        { 
          id: 'd5', 
          name: 'Landing Page', 
          desc: 'Web page copy',
          prompts: ['Hero headline', 'Subhead', 'Value props', 'CTA']
        },
        { 
          id: 'd6', 
          name: 'Push Notification', 
          desc: 'App notifications',
          prompts: ['Title (50 chars)', 'Message (100 chars)']
        },
      ]
    },
    editorial: {
      name: 'Editorial',
      templates: [
        { 
          id: 'e1', 
          name: 'Press Release', 
          desc: 'Media announcements',
          prompts: ['Headline', 'Subhead', 'Lead paragraph', 'Body', 'Boilerplate']
        },
        { 
          id: 'e2', 
          name: 'Blog Post', 
          desc: 'Long-form content',
          prompts: ['Title', 'Intro hook', 'Section headers', 'Body paragraphs', 'Conclusion']
        },
        { 
          id: 'e3', 
          name: 'Product Description', 
          desc: 'E-commerce / retail',
          prompts: ['Name', 'Tagline', 'Tasting notes', 'Specs', 'Why buy']
        },
        { 
          id: 'e4', 
          name: 'Recipe Card', 
          desc: 'Cocktail recipes',
          prompts: ['Drink name', 'Intro', 'Ingredients', 'Instructions', 'Garnish tip']
        },
        { 
          id: 'e5', 
          name: 'Brand Story', 
          desc: 'Heritage / history',
          prompts: ['Opening hook', 'History', 'Craftsmanship', 'Legacy', 'Today']
        },
        { 
          id: 'e6', 
          name: 'Newsletter', 
          desc: 'Subscriber content',
          prompts: ['Greeting', 'Feature story', 'Quick hits', 'CTA', 'Sign off']
        },
      ]
    },
    deck: {
      name: 'Deck / Brand Work',
      templates: [
        { 
          id: 'b1', 
          name: 'Pitch Deck', 
          desc: 'Sales presentations',
          prompts: ['Title slide', 'Problem', 'Solution', 'Why Dewars', 'Next steps']
        },
        { 
          id: 'b2', 
          name: 'Brand Guidelines', 
          desc: 'Style guide copy',
          prompts: ['Section intro', 'Do/Don\'t', 'Examples', 'Rationale']
        },
        { 
          id: 'b3', 
          name: 'Retail POS', 
          desc: 'Point of sale materials',
          prompts: ['Header', 'Key message', 'Price call-out', 'Legal']
        },
        { 
          id: 'b4', 
          name: 'Trade Sell Sheet', 
          desc: 'B2B materials',
          prompts: ['Headline', 'Key selling points', 'Specs', 'Order info']
        },
        { 
          id: 'b5', 
          name: 'Event Invite', 
          desc: 'Experiential marketing',
          prompts: ['Event name', 'Hook', 'Details', 'RSVP CTA']
        },
        { 
          id: 'b6', 
          name: 'OOH / Billboard', 
          desc: 'Out of home advertising',
          prompts: ['Headline (7 words max)', 'Tagline']
        },
      ]
    }
  };

  // Mad-lib style options
  const madLibOptions = {
    tone: {
      label: 'Tone',
      options: ['Sophisticated', 'Playful', 'Bold', 'Warm', 'Premium', 'Casual']
    },
    audience: {
      label: 'Audience',
      options: ['Whisky Enthusiast', 'New to Whisky', 'Gift Buyer', 'Bartender/Trade', 'Millennial', 'Gen X+']
    },
    length: {
      label: 'Length',
      options: ['Punchy/Short', 'Medium', 'Long-form', 'Headline only']
    },
    cta: {
      label: 'CTA Focus',
      options: ['Shop Now', 'Learn More', 'Find Near Me', 'Try a Recipe', 'Join Club', 'No CTA']
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // TODO: Connect to your ChatGPT Copy Maven API
      console.log('Generating copy with:', {
        input: inputText,
        archetype: selectedArchetype,
        options: selectedOptions,
        docs: uploadedDocs
      });
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Placeholder response
      setGeneratedCopy(`[Generated ${selectedArchetype?.name || 'copy'} will appear here]\n\nTone: ${selectedOptions.tone || 'Default'}\nAudience: ${selectedOptions.audience || 'General'}\nLength: ${selectedOptions.length || 'Medium'}\n\nConnect your Dewar's Copy Maven API to generate real copy.`);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Copy generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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

  const selectArchetype = (template) => {
    setSelectedArchetype(template);
  };

  const toggleOption = (category, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [category]: prev[category] === value ? null : value
    }));
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
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Copywriter</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.8 }}>
          AI-powered copy generation with Dewar's brand voice
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left Side - Input & Output */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Selected Archetype Display */}
          {selectedArchetype && (
            <div style={{
              background: 'rgba(173, 56, 38, 0.1)',
              border: '1px solid #AD3826',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>{selectedArchetype.name}</div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{selectedArchetype.desc}</div>
              </div>
              <button
                onClick={() => setSelectedArchetype(null)}
                style={{
                  background: '#3a3a3a',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Change
              </button>
            </div>
          )}

          {/* Mad-lib Options */}
          <div style={{
            background: '#262626',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #3a3a3a'
          }}>
            <label style={{ fontSize: '12px', color: '#888', marginBottom: '12px', display: 'block' }}>
              Style your copy:
            </label>
            
            {Object.entries(madLibOptions).map(([key, { label, options }]) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {options.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleOption(key, option)}
                      style={{
                        background: selectedOptions[key] === option ? '#AD3826' : '#3a3a3a',
                        border: 'none',
                        color: 'white',
                        padding: '8px 14px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: selectedOptions[key] === option ? '600' : '400',
                        transition: 'all 0.2s'
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div style={{
            background: '#262626',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #3a3a3a'
          }}>
            <label style={{ fontSize: '12px', color: '#888', marginBottom: '8px', display: 'block' }}>
              Describe what you're writing:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="E.g., A holiday email campaign promoting our 12-year expression as a premium gift option..."
              style={{
                width: '100%',
                height: '120px',
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
              <span style={{ fontSize: '18px' }}>+</span> Add brief or reference doc
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

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
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
              'Generate Copy'
            )}
          </button>

          {/* Output Area */}
          <div style={{
            background: '#262626',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #3a3a3a',
            minHeight: '200px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>
                Generated Copy:
              </label>
              {generatedCopy && (
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCopy)}
                  style={{
                    background: '#3a3a3a',
                    border: 'none',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  📋 Copy
                </button>
              )}
            </div>
            {generatedCopy ? (
              <div style={{
                background: '#1a1a1a',
                borderRadius: '6px',
                padding: '16px',
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {generatedCopy}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '40px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✍️</div>
                <div style={{ fontSize: '14px' }}>Generated copy will appear here</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Archetype Selector */}
        <div style={{
          width: '320px',
          background: '#262626',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #3a3a3a',
          maxHeight: '800px',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#888' }}>
            Select archetype to get started
          </h3>
          
          {Object.entries(copyArchetypes).map(([key, category]) => (
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
              
              {/* Category Templates */}
              {expandedCategory === key && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  padding: '12px 4px'
                }}>
                  {category.templates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => selectArchetype(template)}
                      style={{
                        background: selectedArchetype?.id === template.id ? 'rgba(173, 56, 38, 0.3)' : '#1a1a1a',
                        border: selectedArchetype?.id === template.id ? '2px solid #AD3826' : '1px solid #3a3a3a',
                        borderRadius: '6px',
                        padding: '12px 8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (selectedArchetype?.id !== template.id) {
                          e.currentTarget.style.borderColor = '#AD3826';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedArchetype?.id !== template.id) {
                          e.currentTarget.style.borderColor = '#3a3a3a';
                        }
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>{template.name}</div>
                      <div style={{ fontSize: '9px', color: '#888', lineHeight: '1.3' }}>{template.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Prompts Preview */}
          {selectedArchetype && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #3a3a3a'
            }}>
              <div style={{ fontSize: '11px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sections to generate:
              </div>
              {selectedArchetype.prompts.map((prompt, idx) => (
                <div key={idx} style={{
                  fontSize: '12px',
                  padding: '6px 0',
                  borderBottom: idx < selectedArchetype.prompts.length - 1 ? '1px solid #3a3a3a' : 'none',
                  color: '#ccc'
                }}>
                  {idx + 1}. {prompt}
                </div>
              ))}
            </div>
          )}
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
