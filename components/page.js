'use client';

import { useState } from 'react';
import QCAnalyzer from '../components/QCAnalyzer';
import ImageGenerator from '../components/ImageGenerator';
import CopyChecker from '../components/CopyChecker';
import BrandAssets from '../components/BrandAssets';
import ChatBot from '../components/ChatBot';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('qc-upload');
  const [showNewProject, setShowNewProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [showChat, setShowChat] = useState(false);

  const handleNewProject = () => {
    if (!projectName.trim()) return;
    const newProject = {
      id: Date.now(),
      name: projectName,
      created: new Date().toLocaleDateString(),
      assets: []
    };
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setShowNewProject(false);
    setProjectName('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      color: 'white',
      fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: '#2a2a2a',
        padding: '20px 40px',
        borderBottom: '1px solid #3a3a3a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{margin: 0, fontSize: '24px', color: '#AD3826', fontWeight: '700', letterSpacing: '0.5px'}}>
            DEWAR'S CREATIVE MAVEN
          </h1>
          <p style={{margin: '5px 0 0 0', opacity: 0.7, fontSize: '14px'}}>
            your one-stop creative workhorse
          </p>
        </div>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
          {currentProject && (
            <div style={{
              background: '#3a3a3a',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              Project: <strong>{currentProject.name}</strong>
            </div>
          )}
          <button
            onClick={() => setShowNewProject(true)}
            style={{
              background: '#AD3826',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#8a2d1f'}
            onMouseOut={(e) => e.target.style.background = '#AD3826'}
          >
            <span style={{fontSize: '18px'}}>+</span> New Project
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{display: 'flex', height: 'calc(100vh - 88px)'}}>
        {/* Left Panel - Main Content */}
        <div style={{flex: 1, padding: '30px', overflow: 'auto'}}>
          {activeSection === 'qc-upload' && <QCAnalyzer project={currentProject} />}
          {activeSection === 'image-gen' && <ImageGenerator project={currentProject} />}
          {activeSection === 'copy-check' && <CopyChecker project={currentProject} />}
          {activeSection === 'brand-assets' && <BrandAssets />}
        </div>

        {/* Right Panel - Navigation */}
        <div style={{
          width: '280px',
          background: '#2a2a2a',
          padding: '30px 20px',
          borderLeft: '1px solid #3a3a3a',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{marginBottom: '20px', fontSize: '12px', opacity: 0.5, letterSpacing: '1px'}}>TOOLS</h3>
          
          <NavButton 
            active={activeSection === 'qc-upload'}
            onClick={() => setActiveSection('qc-upload')}
            label="Q/C Analyzer"
            icon="✓"
          />
          <NavButton 
            active={activeSection === 'image-gen'}
            onClick={() => setActiveSection('image-gen')}
            label="Brand Image Gen"
            icon="🖼"
          />
          <NavButton 
            active={activeSection === 'copy-check'}
            onClick={() => setActiveSection('copy-check')}
            label="Copy Checklist"
            icon="📝"
          />
          <NavButton 
            active={activeSection === 'brand-assets'}
            onClick={() => setActiveSection('brand-assets')}
            label="Brand Assets"
            icon="📁"
          />

          {/* Recent Projects */}
          {projects.length > 0 && (
            <div style={{marginTop: '40px'}}>
              <h3 style={{marginBottom: '15px', fontSize: '12px', opacity: 0.5, letterSpacing: '1px'}}>RECENT PROJECTS</h3>
              {projects.slice(-5).reverse().map(project => (
                <div
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  style={{
                    background: currentProject?.id === project.id ? 'rgba(173, 56, 38, 0.2)' : 'transparent',
                    border: currentProject?.id === project.id ? '1px solid #AD3826' : '1px solid transparent',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{fontSize: '14px', fontWeight: '600'}}>{project.name}</div>
                  <div style={{fontSize: '11px', opacity: 0.5, marginTop: '4px'}}>{project.created}</div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #3a3a3a'}}>
            <div style={{fontSize: '11px', opacity: 0.4, textAlign: 'center'}}>
              Dewar's Creative Maven v2.0
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#2a2a2a',
            padding: '30px',
            borderRadius: '12px',
            width: '400px',
            border: '1px solid #3a3a3a'
          }}>
            <h2 style={{margin: '0 0 20px 0', fontSize: '20px'}}>New Project</h2>
            <input
              type="text"
              placeholder="Project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNewProject()}
              style={{
                width: '100%',
                padding: '14px',
                background: '#1a1a1a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                marginBottom: '20px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button
                onClick={() => { setShowNewProject(false); setProjectName(''); }}
                style={{
                  background: 'transparent',
                  border: '1px solid #3a3a3a',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleNewProject}
                style={{
                  background: '#AD3826',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Bot */}
      <ChatBot show={showChat} onToggle={() => setShowChat(!showChat)} />

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: showChat ? '#3a3a3a' : '#AD3826',
          color: 'white',
          border: 'none',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          zIndex: 999,
          transition: 'all 0.2s'
        }}
      >
        {showChat ? '×' : '💬'}
      </button>
    </div>
  );
}

// Navigation Button Component
function NavButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: active ? '#AD3826' : '#3a3a3a',
        color: 'white',
        border: 'none',
        padding: '16px 20px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        textAlign: 'left',
        marginBottom: '12px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
      onMouseOver={(e) => {
        if (!active) e.target.style.background = '#4a4a4a';
      }}
      onMouseOut={(e) => {
        if (!active) e.target.style.background = '#3a3a3a';
      }}
    >
      <span style={{fontSize: '18px'}}>{icon}</span>
      {label}
    </button>
  );
}
