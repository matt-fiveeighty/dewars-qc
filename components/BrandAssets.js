'use client';

export default function BrandAssets() {
  const assets = [
    { name: 'Dewar\'s Logo (Primary)', type: 'SVG', category: 'Logos' },
    { name: 'Dewar\'s Logo (White)', type: 'SVG', category: 'Logos' },
    { name: 'Bottle Render - 750ml', type: 'PNG', category: 'Product' },
    { name: 'Bottle Render - 1L', type: 'PNG', category: 'Product' },
    { name: 'Smile Device', type: 'SVG', category: 'Brand Elements' },
    { name: 'Brand Color Palette', type: 'ASE', category: 'Colors' },
    { name: 'TT Fors Font Family', type: 'OTF', category: 'Typography' },
    { name: 'Futura PT Book', type: 'OTF', category: 'Typography' },
  ];

  return (
    <div style={{
      background: '#262626',
      borderRadius: '12px',
      padding: '30px',
      minHeight: '400px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0}}>
          Brand Assets
        </h2>
        <div style={{
          padding: '8px 16px',
          background: '#3a3a3a',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#888'
        }}>
          8 assets available
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {assets.map((asset, index) => (
          <div 
            key={index}
            style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #3a3a3a',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#AD3826';
              e.currentTarget.style.background = '#222';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#3a3a3a';
              e.currentTarget.style.background = '#1a1a1a';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: '#3a3a3a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              fontSize: '20px'
            }}>
              {asset.category === 'Logos' ? '🏷' : 
               asset.category === 'Product' ? '🍾' :
               asset.category === 'Brand Elements' ? '✨' :
               asset.category === 'Colors' ? '🎨' : '🔤'}
            </div>
            <div style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}>
              {asset.name}
            </div>
            <div style={{fontSize: '12px', color: '#666'}}>
              {asset.type} • {asset.category}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#1a1a1a',
        borderRadius: '8px',
        border: '1px dashed #3a3a3a',
        textAlign: 'center'
      }}>
        <p style={{color: '#666', fontSize: '14px', margin: 0}}>
          Asset downloads require authentication. Contact brand team for access.
        </p>
      </div>
    </div>
  );
}
