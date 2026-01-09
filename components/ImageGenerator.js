'use client';

export default function ImageGenerator({ project }) {
  return (
    <div style={{
      background: '#262626',
      borderRadius: '12px',
      padding: '60px 40px',
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#3a3a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        fontSize: '36px'
      }}>
        🖼
      </div>
      <h2 style={{fontSize: '24px', marginBottom: '12px', fontWeight: '600'}}>
        Brand Image Generator
      </h2>
      <p style={{color: '#888', fontSize: '15px', maxWidth: '400px', lineHeight: '1.6'}}>
        AI-powered image generation trained on Dewar's brand guidelines. 
        Create on-brand visuals, backgrounds, and lifestyle imagery.
      </p>
      <div style={{
        marginTop: '30px',
        padding: '12px 24px',
        background: '#3a3a3a',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#888'
      }}>
        Coming Soon
      </div>
    </div>
  );
}
