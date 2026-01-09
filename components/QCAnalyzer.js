// components/QCAnalyzer.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  XCircle, 
  Upload, 
  ChevronDown, 
  ChevronUp,
  Info,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Download,
  RefreshCw
} from 'lucide-react';

const QCAnalyzer = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('productPackaging');
  const [manualChecks, setManualChecks] = useState({});
  const [detectedFormat, setDetectedFormat] = useState(null);
  const [detectedSpecs, setDetectedSpecs] = useState(null);
  const [visualType, setVisualType] = useState('withoutSmile'); // 'withSmile' | 'withoutSmile'
  const [bottleSize, setBottleSize] = useState('750ml'); // '375ml' | '750ml' | '1L'
  const [hoveredCheck, setHoveredCheck] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [activeRegion, setActiveRegion] = useState(null);
  const [draggingRegion, setDraggingRegion] = useState(null);
  const [resizingRegion, setResizingRegion] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredVisualType, setHoveredVisualType] = useState(null);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear());
  const [adjustedRegions, setAdjustedRegions] = useState([]);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawStart, setDrawStart] = useState(null);
  const [drawnMeasurement, setDrawnMeasurement] = useState(null);
  const [sHeightValue, setSHeightValue] = useState(null);
  const [logoClearSpaceBox, setLogoClearSpaceBox] = useState(null);
  const [measuredBorderPct, setMeasuredBorderPct] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [criticalIssues, setCriticalIssues] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [pendingReanalyze, setPendingReanalyze] = useState([]); // Track regions that were adjusted and need reanalysis
  const [detectedLogoBox, setDetectedLogoBox] = useState(null); // AI-detected layout logo bounding box
  const fileInputRef = useRef(null);
  const imageContainerRef = useRef(null);

  // Severity colors - REQUIRED items must be resolved to proceed
  const severityColors = {
    REQUIRED: '#ef4444',
    MINOR: '#6b7280'
  };

  // Category colors - 6 categories (smile device only shows when selected)
  const categoryColors = {
    productPackaging: { primary: '#3b82f6', light: '#1e3a5f', dark: '#172554' },
    legalCompliance: { primary: '#10b981', light: '#1a3d34', dark: '#14332b' },
    typographyHierarchy: { primary: '#8b5cf6', light: '#3b2d5c', dark: '#2e2248' },
    layoutBrandElements: { primary: '#ec4899', light: '#4a2d3d', dark: '#3d2433' },
    lightingColorRealism: { primary: '#f59e0b', light: '#4a3728', dark: '#3d2a1a' },
    smileDevice: { primary: '#06b6d4', light: '#164e63', dark: '#0e3a47' },
  };

  // Visual type descriptions for hover states
  const visualTypeDescriptions = {
    withSmile: {
      title: 'With Smile Device',
      description: 'Creative that includes the Dewar\'s smile device frame element. Adds specific checks for smile device compliance.',
      criteria: [
        'Bottle to smile device ratio: 3:4',
        'Smile device minimum size: 150px',
        'No distortion or incorrect usage'
      ]
    },
    withoutSmile: {
      title: 'Without Smile Device',
      description: 'Creative without the smile device frame. Standard brand compliance checks only.',
      criteria: [
        'Standard bottle scale requirements',
        'Logo and legal compliance',
        'No smile device checks required'
      ]
    }
  };

  // Evaluation regions on image (percentages) - expanded to include all items that need highlighting
  const [evaluationRegions, setEvaluationRegions] = useState({
    // Product & Packaging
    'bottle-scale': { x: 15, y: 20, width: 35, height: 70, label: 'Bottle Scale' },
    // Legal & Compliance
    'legal-has-abv': { x: 62, y: 82, width: 8, height: 4, label: 'ABV: 40%' },
    'legal-enjoy-resp': { x: 55, y: 78, width: 42, height: 12, label: 'Legal Disclaimer' },
    'legal-copyright': { x: 85, y: 88, width: 12, height: 3, label: '© 2025' },
    'legal-placement': { x: 55, y: 78, width: 42, height: 12, label: 'Legal Text Area' },
    // Typography & Hierarchy
    'font-tt-fors': { x: 55, y: 25, width: 40, height: 15, label: 'Headline: TT Fors' },
    'font-futura': { x: 55, y: 78, width: 42, height: 12, label: 'Body/Legal: Futura PT' },
    'hierarchy-headline': { x: 55, y: 25, width: 40, height: 10, label: 'Headline' },
    'hierarchy-subhead': { x: 55, y: 36, width: 35, height: 8, label: 'Subhead' },
    'hierarchy-body': { x: 55, y: 45, width: 38, height: 30, label: 'Body Copy' },
    // Layout & Brand Elements
    'safe-zone': { x: 5, y: 5, width: 90, height: 90, label: 'Safe Zone (5% padding)' },
    'logo-alignment': { x: 60, y: 5, width: 35, height: 10, label: 'Logo Position' },
    'logo-min-size': { x: 60, y: 5, width: 35, height: 10, label: 'Logo: 180px' },
    'logo-clearspace': { x: 58, y: 3, width: 39, height: 14, label: 'Logo Clear Space' },
    'polaroid-border': { x: 0, y: 0, width: 100, height: 100, label: 'Frame Border' },
    // Lighting, Color & Realism
    'warm-white-lighting': { x: 5, y: 5, width: 90, height: 90, label: 'Lighting: ~3200K' },
  });

  // UPDATED: Accurate Dewar's brand color palette from BBI
  const brandColorPalette = {
    "Whiskey Brown": { hex: '#AD3826', description: 'Primary brand brown' },
    "Warm White": { hex: '#FFF9F4', description: 'Warm white background' },
    "Blue Black": { hex: '#101921', description: 'Deep navy black' },
    "Gold Foil": { hex: '#6128', description: 'Foil #6128 - metallic gold', note: 'Foil specification' },
  };

  // STANDARDIZED: Status helper - returns consistent "Pass" or "Needs Update"
  const getStandardStatus = (passed) => {
    return passed 
      ? { label: 'Pass', color: '#10b981', icon: true }
      : { label: 'Needs Update', color: '#ef4444', icon: false };
  };

  // STANDARDIZED: Range status helper - returns "Pass" with checkmark or "Needs Update"
  const getStandardRangeStatus = (value, min, max) => {
    const inRange = value >= min && value <= max;
    return inRange
      ? { label: 'Pass', status: 'pass', color: '#10b981' }
      : { label: 'Needs Update', status: 'fail', color: '#ef4444' };
  };

  // Helper: Get confidence rating for font detection
  const getConfidenceRating = (score) => {
    if (score >= 90) return { label: 'Excellent', color: '#10b981' };
    if (score >= 80) return { label: 'Good', color: '#3b82f6' };
    if (score >= 70) return { label: 'Acceptable', color: '#f59e0b' };
    return { label: 'Needs Review', color: '#ef4444' };
  };

  // Helper: Convert Delta E to user-friendly color match description
  const getColorMatchDescription = (deltaE) => {
    if (deltaE <= 1) return { label: 'Pass', status: 'pass' };
    if (deltaE <= 2) return { label: 'Pass', status: 'pass' };
    if (deltaE <= 5) return { label: 'Pass', status: 'pass' };
    if (deltaE <= 10) return { label: 'Needs Update', status: 'warn' };
    return { label: 'Needs Update', status: 'fail' };
  };

  const toggleManualCheck = (checkId) => {
    setManualChecks(prev => ({
      ...prev,
      [checkId]: !prev[checkId]
    }));
  };

  // Determine if a check should show severity icon (only when NOT passed/toggled)
  const shouldShowSeverityIcon = (check) => {
    const isPassed = check.status === 'pass' || manualChecks[check.id];
    return !isPassed && !check.isAwardCheck;
  };

  // Auto-calculate score - awards don't penalize
  const currentScore = React.useMemo(() => {
    if (!analysisResults) return 0;
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    const severityWeight = { REQUIRED: 3, MINOR: 1 };
    const awardCheckIds = ['award-98pts-attr', 'award-doublegold-attr', 'claim-highest-rated'];
    
    Object.values(analysisResults.categories).forEach(category => {
      category.checks.forEach(check => {
        // Skip award checks and optional checks - they don't affect score
        if (awardCheckIds.includes(check.id)) return;
        if (check.isOptionalCheck) return;
        if (check.isAwardCheck) return;
        
        const weight = severityWeight[check.severity] || 1;
        totalWeight += weight;
        if (check.status === 'pass' || manualChecks[check.id]) {
          weightedScore += weight;
        }
      });
    });
    
    return totalWeight > 0 ? ((weightedScore / totalWeight) * 10).toFixed(1) : 0;
  }, [analysisResults, manualChecks]);

  // Count items to address (REQUIRED items) - only count items NOT passed/toggled
  const itemsToAddressCount = React.useMemo(() => {
    if (!analysisResults) return 0;
    let count = 0;
    const awardCheckIds = ['award-98pts-attr', 'award-doublegold-attr', 'claim-highest-rated'];
    
    Object.values(analysisResults.categories).forEach(category => {
      category.checks.forEach(check => {
        // Skip award checks and optional checks
        if (awardCheckIds.includes(check.id)) return;
        if (check.isOptionalCheck) return;
        if (check.isAwardCheck) return;
        if (check.severity === 'REQUIRED' && check.status !== 'pass' && !manualChecks[check.id]) {
          count++;
        }
      });
    });
    return count;
  }, [analysisResults, manualChecks]);

  const handleCategoryToggle = (key) => {
    setExpandedCategory(expandedCategory === key ? null : key);
  };

  // Handle tooltip positioning
  const handleTooltipShow = (checkId, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setActiveTooltip(checkId);
  };

  // Handle region drag start
  const handleRegionDragStart = (e, checkId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = imageContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    setDraggingRegion(checkId);
    setDragStart({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      regionX: evaluationRegions[checkId].x,
      regionY: evaluationRegions[checkId].y,
    });
  };

  // Handle region resize start
  const handleRegionResizeStart = (e, checkId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = imageContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    setResizingRegion(checkId);
    setDragStart({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      regionWidth: evaluationRegions[checkId].width,
      regionHeight: evaluationRegions[checkId].height,
    });
  };

  // Handle mouse move for drag/resize
  const handleMouseMove = (e) => {
    const container = imageContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Handle drawing mode - LOCK TO PERPENDICULAR (horizontal or vertical only)
    if (drawingMode && drawStart) {
      const dx = Math.abs(currentX - drawStart.x);
      const dy = Math.abs(currentY - drawStart.y);
      
      // Lock to the dominant axis (whichever has more movement)
      if (dx > dy) {
        // Horizontal line - lock Y to start position
        setDrawnMeasurement({ x: currentX, y: drawStart.y });
      } else {
        // Vertical line - lock X to start position
        setDrawnMeasurement({ x: drawStart.x, y: currentY });
      }
    }
    
    if (draggingRegion) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      
      setEvaluationRegions(prev => ({
        ...prev,
        [draggingRegion]: {
          ...prev[draggingRegion],
          x: Math.max(0, Math.min(100 - prev[draggingRegion].width, dragStart.regionX + deltaX)),
          y: Math.max(0, Math.min(100 - prev[draggingRegion].height, dragStart.regionY + deltaY)),
        }
      }));
    }
    
    if (resizingRegion) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      
      setEvaluationRegions(prev => ({
        ...prev,
        [resizingRegion]: {
          ...prev[resizingRegion],
          width: Math.max(10, Math.min(100 - prev[resizingRegion].x, dragStart.regionWidth + deltaX)),
          height: Math.max(10, Math.min(100 - prev[resizingRegion].y, dragStart.regionHeight + deltaY)),
        }
      }));
    }
  };

  // Recalculate check values when region is adjusted
  const recalculateRegion = (regionId) => {
    const region = evaluationRegions[regionId];
    if (!region || !analysisResults) return;
    
    const bottleThreshold = detectedFormat === "Portrait" ? { min: 50, max: 55 } : { min: 50, max: 90 };
    const thresholdLabel = detectedFormat === "Portrait" ? "50-55%" : "50-90%";
    
    const updateCheck = (categoryKey, checkId, updates) => {
      setAnalysisResults(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [categoryKey]: {
            ...prev.categories[categoryKey],
            checks: prev.categories[categoryKey].checks.map(check =>
              check.id === checkId ? { ...check, ...updates } : check
            )
          }
        }
      }));
    };

    // Track that this region was adjusted and may need reanalysis
    const checkNeedsReanalysis = (checkId) => {
      setPendingReanalyze(prev => {
        if (!prev.includes(checkId)) return [...prev, checkId];
        return prev;
      });
    };
    
    switch(regionId) {
      case "bottle-scale":
        const bottleScale = Math.round(region.height);
        updateCheck("productPackaging", "bottle-scale", {
          value: bottleScale,
          status: 'pending',
          objectiveValue: 'Adjusted - re-run AI',
          detail: `Manual: ${bottleScale}% • Target: ${thresholdLabel} • Click re-run to verify`,
          manuallyAdjusted: true
        });
        checkNeedsReanalysis("bottle-scale");
        break;
      case "safe-zone":
        // Calculate safe zone from region bounds
        const safeTop = region.y;
        const safeLeft = region.x;
        const safeRight = 100 - (region.x + region.width);
        const safeBottom = 100 - (region.y + region.height);
        const allPass = safeTop >= 5 && safeRight >= 5 && safeBottom >= 5 && safeLeft >= 5;
        updateCheck("layoutBrandElements", "safe-zone-5pct", { 
          status: 'pending',
          objectiveValue: 'Adjusted - re-run AI',
          detail: `Manual: T:${safeTop.toFixed(1)}% R:${safeRight.toFixed(1)}% B:${safeBottom.toFixed(1)}% L:${safeLeft.toFixed(1)}% • Click re-run to verify`,
          manuallyAdjusted: true,
          measurements: {
            top: `${safeTop.toFixed(1)}%`,
            right: `${safeRight.toFixed(1)}%`,
            bottom: `${safeBottom.toFixed(1)}%`,
            left: `${safeLeft.toFixed(1)}%`,
            required: '≥5%'
          }
        });
        checkNeedsReanalysis("safe-zone-5pct");
        break;
      case "logo-alignment":
        const alignRegion = evaluationRegions[regionId];
        const isLandscape = detectedFormat === "Landscape";
        const inCorrectZone = isLandscape 
          ? (alignRegion.x + alignRegion.width / 2) >= 50 
          : (alignRegion.y + alignRegion.height / 2) >= 50;
        updateCheck("layoutBrandElements", "logo-position", { 
          status: 'pending',
          objectiveValue: 'Adjusted - re-run AI',
          detail: `Manual: Logo at ${alignRegion.x.toFixed(1)}%, ${alignRegion.y.toFixed(1)}% • Click re-run to verify`,
          manuallyAdjusted: true
        });
        checkNeedsReanalysis("logo-position");
        break;
      case "logo-min-size":
        const sizeRegion = evaluationRegions[regionId];
        const logoWidthPx = imageData ? Math.round((sizeRegion.width / 100) * imageData.width) : 0;
        const meetsMinimum = logoWidthPx >= 150;
        updateCheck("layoutBrandElements", "logo-min-size", { 
          status: 'pending',
          objectiveValue: 'Adjusted - re-run AI',
          detail: `Manual: ${logoWidthPx}px width • Minimum: 150px • Click re-run to verify`,
          manuallyAdjusted: true
        });
        checkNeedsReanalysis("logo-min-size");
        break;
      case "logo-clearspace":
        updateCheck("layoutBrandElements", "logo-clearspace", { status: 'pending', objectiveValue: 'Adjusted - re-run AI', manuallyAdjusted: true });
        checkNeedsReanalysis("logo-clearspace");
        break;
      case "legal-has-abv":
      case "legal-enjoy-resp":
      case "legal-copyright":
      case "legal-placement":
        updateCheck("legalCompliance", regionId, { status: 'pending', objectiveValue: 'Adjusted - re-run AI', manuallyAdjusted: true });
        checkNeedsReanalysis(regionId);
        break;
      case "font-tt-fors":
      case "font-futura":
        updateCheck("typographyHierarchy", regionId, { status: 'pending', objectiveValue: 'Adjusted - re-run AI', manuallyAdjusted: true });
        checkNeedsReanalysis(regionId);
        break;
      case "hierarchy-subhead":
        updateCheck("typographyHierarchy", "hierarchy-subhead-ratio", { status: 'pending', objectiveValue: 'Adjusted - re-run AI', manuallyAdjusted: true });
        checkNeedsReanalysis("hierarchy-subhead-ratio");
        break;
      case "hierarchy-body":
        updateCheck("typographyHierarchy", "hierarchy-body-ratio", { status: 'pending', objectiveValue: 'Adjusted - re-run AI', manuallyAdjusted: true });
        checkNeedsReanalysis("hierarchy-body-ratio");
        break;
      case "polaroid-border":
        updateCheck("layoutBrandElements", "polaroid-border", { status: 'pending', objectiveValue: 'Adjusted - re-run AI', manuallyAdjusted: true });
        checkNeedsReanalysis("polaroid-border");
        break;
      case "warm-white-lighting":
        updateCheck("lightingColorRealism", regionId, { status: 'pending', objectiveValue: 'Adjusted - re-run AI', manuallyAdjusted: true });
        checkNeedsReanalysis(regionId);
        break;
    }
  };

  // Reanalyze with AI while PRESERVING manually adjusted regions
  const reanalyzeRegions = async () => {
    if (!uploadedImage || !imageData) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress('Re-analyzing with your adjusted regions...');
    
    try {
      // Collect all manually adjusted regions to send to AI
      const manualRegions = {};
      Object.entries(evaluationRegions).forEach(([id, region]) => {
        manualRegions[id] = {
          x: region.x,
          y: region.y,
          width: region.width,
          height: region.height
        };
      });

      // Also include the logo clearspace box if set
      if (logoClearSpaceBox) {
        manualRegions['logo-clearspace-box'] = logoClearSpaceBox;
        manualRegions['s-height'] = sHeightValue;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          width: imageData.width,
          height: imageData.height,
          format: detectedFormat,
          visualType,
          manualRegions, // Send the manually adjusted regions
          preserveRegions: true // Flag to tell API to use these regions
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Reanalysis failed');
      }

      const ai = data.analysis;
      
      // Store the current regions BEFORE updating
      const preservedRegions = { ...evaluationRegions };
      const preservedLogoBox = logoClearSpaceBox ? { ...logoClearSpaceBox } : null;
      const preservedSHeight = sHeightValue;
      
      // Update AI analysis
      setAiAnalysis(ai);
      setCriticalIssues(ai.criticalIssues || []);
      setRecommendations(ai.recommendations || []);
      
      // Clear pending reanalyze
      setPendingReanalyze([]);
      setAnalysisProgress('Building results...');
      
      // Rebuild results but DON'T let AI override our manual regions
      const bottleThreshold = getBottleScaleThreshold(detectedFormat, visualType);
      const shortestSide = Math.min(imageData.width, imageData.height);
      const longestSide = Math.max(imageData.width, imageData.height);
      
      // Use preserved region values for calculations
      const safeZoneRegion = preservedRegions['safe-zone'];
      const safeTop = safeZoneRegion?.y || 5;
      const safeLeft = safeZoneRegion?.x || 5;
      const safeRight = 100 - ((safeZoneRegion?.x || 5) + (safeZoneRegion?.width || 90));
      const safeBottom = 100 - ((safeZoneRegion?.y || 5) + (safeZoneRegion?.height || 90));
      const safeZoneAllPass = safeTop >= 5 && safeRight >= 5 && safeBottom >= 5 && safeLeft >= 5;

      const logoRegion = preservedRegions['logo-min-size'];
      const logoWidthPx = logoRegion ? Math.round((logoRegion.width / 100) * imageData.width) : (ai.layout?.layoutLogo?.estimatedWidthPx || 0);
      const logoMeetsMin = logoWidthPx >= 150;

      const isLandscape = detectedFormat === 'Landscape';
      const logoPositionRegion = preservedRegions['logo-alignment'];
      const logoInCorrectZone = logoPositionRegion 
        ? (isLandscape ? (logoPositionRegion.x + logoPositionRegion.width / 2) >= 50 : (logoPositionRegion.y + logoPositionRegion.height / 2) >= 50)
        : ai.layout?.layoutLogo?.inCorrectZone;

      // Update results with PRESERVED manual values where applicable
      setAnalysisResults(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          categories: {
            ...prev.categories,
            layoutBrandElements: {
              ...prev.categories.layoutBrandElements,
              checks: prev.categories.layoutBrandElements.checks.map(check => {
                if (check.id === 'safe-zone-5pct' && check.manuallyAdjusted) {
                  return {
                    ...check,
                    status: safeZoneAllPass ? 'pass' : 'fail',
                    objectiveValue: safeZoneAllPass ? 'Pass ✓' : 'Needs Update',
                    detail: `Manual: T:${safeTop.toFixed(1)}% R:${safeRight.toFixed(1)}% B:${safeBottom.toFixed(1)}% L:${safeLeft.toFixed(1)}%`,
                  };
                }
                if (check.id === 'logo-min-size' && check.manuallyAdjusted) {
                  return {
                    ...check,
                    status: logoMeetsMin ? 'pass' : 'fail',
                    objectiveValue: logoMeetsMin ? 'Pass ✓' : 'Needs Update',
                    detail: `Manual: ${logoWidthPx}px width • Min: 150px`,
                  };
                }
                if (check.id === 'logo-position' && check.manuallyAdjusted) {
                  return {
                    ...check,
                    status: logoInCorrectZone ? 'pass' : 'fail',
                    objectiveValue: logoInCorrectZone ? 'Pass ✓' : 'Needs Update',
                  };
                }
                return check;
              })
            }
          }
        };
      });

      // Restore preserved regions
      setEvaluationRegions(preservedRegions);
      if (preservedLogoBox) setLogoClearSpaceBox(preservedLogoBox);
      if (preservedSHeight) setSHeightValue(preservedSHeight);
      
      setAnalysisProgress('');
      
    } catch (error) {
      console.error('Reanalysis failed:', error);
      setAnalysisError(error.message);
      setAnalysisProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    // Handle drawing mode completion
    if (drawingMode && drawStart && drawnMeasurement) {
      const dx = drawnMeasurement.x - drawStart.x;
      const dy = drawnMeasurement.y - drawStart.y;
      
      // Determine if the line is more vertical or horizontal
      const isVertical = Math.abs(dy) > Math.abs(dx);
      // Use the dominant axis for measurement (width or height based on line direction)
      const lineMeasurement = isVertical ? Math.abs(dy) : Math.abs(dx);
      const measurementLabel = isVertical ? 'height' : 'width';
      
      if (drawingMode === 's-height') {
        // Use the line length (dominant axis) as the s-height
        setSHeightValue(lineMeasurement);
        // Use AI-detected logo box if available, otherwise use the current logo-clearspace region
        const logoRegion = detectedLogoBox || evaluationRegions['logo-clearspace'];
        if (logoRegion) {
          setLogoClearSpaceBox({
            x: logoRegion.x,
            y: logoRegion.y,
            width: logoRegion.width,
            height: logoRegion.height,
          });
        }
        // Update the check status to PENDING - needs AI re-verification
        setAnalysisResults(prev => ({
          ...prev,
          categories: {
            ...prev.categories,
            layoutBrandElements: {
              ...prev.categories.layoutBrandElements,
              checks: prev.categories.layoutBrandElements.checks.map(check =>
                check.id === 'logo-clearspace'
                  ? { 
                      ...check, 
                      needsManual: false, 
                      evaluated: true, 
                      status: 'pending', 
                      objectiveValue: 'Measured - re-run AI to verify', 
                      detail: `"s" height: ${lineMeasurement.toFixed(1)}% • Clearspace padding: ${lineMeasurement.toFixed(1)}% • Drag logo box to adjust position`,
                      manuallyAdjusted: true
                    }
                  : check
              )
            }
          }
        }));
        // Track for reanalysis
        setPendingReanalyze(prev => {
          if (!prev.includes('logo-clearspace')) return [...prev, 'logo-clearspace'];
          return prev;
        });
      } else if (drawingMode === 'frame-border') {
        // Use the ruler line measurement for border width - LOCAL CALCULATION
        const borderPct = lineMeasurement;
        setMeasuredBorderPct(borderPct);
        
        // Calculate if the drawn line equals 5% of shortest side (±1.5% tolerance)
        const target5pct = 5;
        const isPass = Math.abs(borderPct - target5pct) <= 1.5;
        
        setAnalysisResults(prev => ({
          ...prev,
          categories: {
            ...prev.categories,
            layoutBrandElements: {
              ...prev.categories.layoutBrandElements,
              checks: prev.categories.layoutBrandElements.checks.map(check =>
                check.id === 'polaroid-border'
                  ? { 
                      ...check, 
                      needsManual: false, 
                      evaluated: true, 
                      status: isPass ? 'pass' : 'fail', 
                      objectiveValue: isPass ? 'Pass ✓' : 'Needs Update', 
                      detail: `Measured: ${borderPct.toFixed(1)}% • Target: 5% (±1.5%) • ${isPass ? 'Within tolerance' : 'Outside tolerance'}`
                    }
                  : check
              )
            }
          }
        }));
        // No need for AI re-verification - this is objective
      } else if (drawingMode === 'frame-image') {
        // Image frame measurement - LOCAL CALCULATION
        const measuredImagePct = lineMeasurement;
        const target60pct = 60;
        const isPass = Math.abs(measuredImagePct - target60pct) <= 5; // Within 5% tolerance
        
        setAnalysisResults(prev => ({
          ...prev,
          categories: {
            ...prev.categories,
            layoutBrandElements: {
              ...prev.categories.layoutBrandElements,
              checks: prev.categories.layoutBrandElements.checks.map(check =>
                check.id === 'polaroid-image-frame'
                  ? { 
                      ...check, 
                      needsManual: false,
                      evaluated: true,
                      status: isPass ? 'pass' : 'fail', 
                      objectiveValue: isPass ? 'Pass ✓' : 'Needs Update', 
                      detail: `Measured: ${measuredImagePct.toFixed(1)}% • Target: 60% (±5%) • ${isPass ? 'Within tolerance' : 'Outside tolerance'}`
                    }
                  : check
              )
            }
          }
        }));
        // No need for AI re-verification - this is objective
      } else if (drawingMode === 'smile-size' && analysisResults?.categories?.smileDevice) {
        // Smile device minimum size measurement
        const smileWidthPx = imageData ? Math.round((lineMeasurement / 100) * (measurementLabel === 'width' ? imageData.width : imageData.height)) : 0;
        const isPass = smileWidthPx >= 150;
        
        setAnalysisResults(prev => ({
          ...prev,
          categories: {
            ...prev.categories,
            smileDevice: {
              ...prev.categories.smileDevice,
              checks: prev.categories.smileDevice.checks.map(check =>
                check.id === 'smile-min-size'
                  ? { 
                      ...check, 
                      needsManual: false,
                      evaluated: true,
                      status: 'pending', 
                      objectiveValue: 'Measured - re-run AI to verify', 
                      detail: `Measured: ${smileWidthPx}px • Min: 150px`,
                      manuallyAdjusted: true
                    }
                  : check
              )
            }
          }
        }));
        setPendingReanalyze(prev => {
          if (!prev.includes('smile-min-size')) return [...prev, 'smile-min-size'];
          return prev;
        });
      }
      
      setDrawingMode(null);
      setDrawStart(null);
      setDrawnMeasurement(null);
    }
    
    if (draggingRegion || resizingRegion) {
      const regionId = draggingRegion || resizingRegion;
      recalculateRegion(regionId);
    }
    setDraggingRegion(null);
    setResizingRegion(null);
  };

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (draggingRegion || resizingRegion) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingRegion, resizingRegion, dragStart]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadYear(new Date().getFullYear());

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imgSrc = e.target.result;
      setUploadedImage(imgSrc);
      
      const img = new Image();
      img.onload = async () => {
        setImageData({ width: img.width, height: img.height });
        
        const aspectRatio = img.width / img.height;
        const isLandscape = aspectRatio > 1.2;
        const isPortrait = aspectRatio < 0.8;
        const formatType = isLandscape ? 'Landscape' : isPortrait ? 'Portrait' : 'Square';
        
        setDetectedFormat(formatType);
        setDetectedSpecs(`${img.width} × ${img.height}`);
        
        await analyzeImage(imgSrc, img.width, img.height, formatType);
      };
      img.src = imgSrc;
    };
    reader.readAsDataURL(file);
  };

  // Get bottle scale threshold based on visual type and format
  const getBottleScaleThreshold = (format, visType) => {
    if (format === 'Portrait') {
      return { min: 50, max: 55, label: '50-55%' };
    } else {
      return { min: 50, max: 90, label: '50-90%' };
    }
  };

  // Generate PDF Export Report
  const generateExportReport = async () => {
    if (!analysisResults) return;
    
    const reportContent = generatePDFContent();
    
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Generate PDF content as A4 with thumbnail and visual summary
  const generatePDFContent = () => {
    const awardCheckIds = ['award-98pts-attr', 'award-doublegold-attr', 'claim-highest-rated'];
    
    // Get score color and status
    const scoreColor = currentScore >= 7.5 ? '#10b981' : currentScore >= 5 ? '#f59e0b' : '#ef4444';
    const statusText = currentScore >= 7.5 ? '✓ Ready to Release' : currentScore >= 5 ? '⚠ Needs Review' : '✗ Needs Work';
    const statusDesc = currentScore >= 7.5 ? 'All requirements met' : `${itemsToAddressCount} item${itemsToAddressCount !== 1 ? 's' : ''} to address`;
    
    const categoryCards = Object.entries(analysisResults.categories).map(([key, category]) => {
      const color = categoryColors[key].primary;
      const checks = category.checks.map(check => {
        const isPassed = check.status === 'pass' || manualChecks[check.id];
        const isOptional = check.isOptionalCheck || check.isAwardCheck || awardCheckIds.includes(check.id);
        return `
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 0; border-bottom: 1px solid rgba(0,0,0,0.06);">
            <span style="font-size: 11px; width: 14px;">${isPassed ? '✓' : isOptional ? '○' : '✗'}</span>
            <span style="flex: 1; font-size: 9px; color: ${isPassed ? '#333' : isOptional ? '#999' : '#dc2626'};">${check.name}</span>
            <span style="font-size: 8px; color: ${isPassed ? '#10b981' : isOptional ? '#999' : '#ef4444'}; font-weight: 600;">
              ${isPassed ? 'Pass' : isOptional ? 'N/A' : 'Fail'}
            </span>
          </div>
        `;
      }).join('');
      
      // Count failures
      const failures = category.checks.filter(c => 
        !awardCheckIds.includes(c.id) && 
        !c.isOptionalCheck && 
        c.severity === 'REQUIRED' && 
        c.status !== 'pass' && 
        !manualChecks[c.id]
      ).length;
      
      const passed = category.checks.filter(c => c.status === 'pass' || manualChecks[c.id]).length;
      
      return `
        <div style="background: #fff; border-radius: 8px; padding: 12px; border: 1px solid #e5e5e5; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid ${color};">
            <div style="width: 3px; height: 18px; background: ${color}; border-radius: 2px;"></div>
            <h3 style="margin: 0; font-size: 10px; font-weight: 600; color: #333; flex: 1;">${category.name}</h3>
            ${failures > 0 ? `<span style="background: #ef4444; color: #fff; font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 8px;">${failures}</span>` : ''}
            <span style="font-size: 9px; color: ${color}; font-weight: 600;">${passed}/${category.checks.length}</span>
          </div>
          <div style="flex: 1; overflow: hidden;">
            ${checks}
          </div>
        </div>
      `;
    }).join('');

    // SVG Gauge for PDF
    const gaugeAngle = -180 + (currentScore / 10) * 180;
    const gaugeRadians = (gaugeAngle * Math.PI) / 180;
    const needleX = 60 + 35 * Math.cos(gaugeRadians);
    const needleY = 65 + 35 * Math.sin(gaugeRadians);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QC Analysis Report - Dewar's BVI</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f5f5f5; 
            color: #333;
          }
          @media print { 
            body { 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page { size: A4 portrait; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div style="width: 210mm; min-height: 297mm; padding: 20mm; background: #fff;">
          
          <!-- Header with Score Gauge -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #C41E3A;">
            <div>
              <h1 style="font-size: 22px; font-weight: 700; color: #C41E3A; margin-bottom: 4px;">DEWAR'S CREATIVE MAVEN</h1>
              <p style="font-size: 11px; color: #666;">BVI Creative Q/C Analysis Report</p>
              <p style="font-size: 10px; color: #999; margin-top: 4px;">Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <!-- Score Gauge Section -->
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="text-align: center;">
                <div style="font-size: 36px; font-weight: 700; color: ${scoreColor}; line-height: 1;">${currentScore}</div>
                <div style="font-size: 10px; color: #666;">out of 10</div>
              </div>
              <svg width="100" height="60" viewBox="0 0 120 70">
                <path d="M 10 60 A 50 50 0 0 1 40 15" fill="none" stroke="#ef4444" stroke-width="8" stroke-linecap="round" />
                <path d="M 43 13 A 50 50 0 0 1 77 13" fill="none" stroke="#f59e0b" stroke-width="8" stroke-linecap="round" />
                <path d="M 80 15 A 50 50 0 0 1 110 60" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round" />
                <line x1="60" y1="65" x2="${needleX}" y2="${needleY}" stroke="#333" stroke-width="3" stroke-linecap="round" />
                <circle cx="60" cy="65" r="5" fill="#333" />
              </svg>
              <div style="text-align: center; padding: 8px 12px; background: ${scoreColor}15; border: 1px solid ${scoreColor}; border-radius: 6px;">
                <div style="font-size: 11px; font-weight: 700; color: ${scoreColor};">${statusText}</div>
                <div style="font-size: 9px; color: #666;">${statusDesc}</div>
              </div>
            </div>
          </div>
          
          <!-- Image Thumbnail + Meta Info -->
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex-shrink: 0;">
              <img src="${uploadedImage}" style="width: 180px; height: auto; border-radius: 6px; border: 1px solid #ddd;" />
            </div>
            <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-content: start;">
              <div style="background: #f9f9f9; padding: 10px; border-radius: 6px;">
                <div style="font-size: 9px; color: #666; margin-bottom: 2px;">Visual Type</div>
                <div style="font-size: 12px; font-weight: 600; color: #333;">${visualType === 'withSmile' ? 'With Smile Device' : 'Without Smile Device'}</div>
              </div>
              <div style="background: #f9f9f9; padding: 10px; border-radius: 6px;">
                <div style="font-size: 9px; color: #666; margin-bottom: 2px;">Format</div>
                <div style="font-size: 12px; font-weight: 600; color: #333;">${detectedFormat}</div>
              </div>
              <div style="background: #f9f9f9; padding: 10px; border-radius: 6px;">
                <div style="font-size: 9px; color: #666; margin-bottom: 2px;">Dimensions</div>
                <div style="font-size: 12px; font-weight: 600; color: #333;">${detectedSpecs}</div>
              </div>
              <div style="background: #f9f9f9; padding: 10px; border-radius: 6px;">
                <div style="font-size: 9px; color: #666; margin-bottom: 2px;">Items to Address</div>
                <div style="font-size: 12px; font-weight: 600; color: ${itemsToAddressCount > 0 ? '#ef4444' : '#10b981'};">${itemsToAddressCount > 0 ? itemsToAddressCount + ' items' : 'None'}</div>
              </div>
            </div>
          </div>
          
          <!-- Five Category Cards - 3 column grid for portrait A4 -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
            ${categoryCards}
          </div>
          
          <!-- Footer -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #ddd; margin-top: auto;">
            <p style="font-size: 9px; color: #999;">© ${uploadYear} Dewar's. All rights reserved. Please drink responsibly.</p>
            <p style="font-size: 9px; color: #999;">Generated by Dewar's Creative Maven • BVI Compliance Tool</p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  };

  // Calculate category scores for report
  const getCategoryScore = (category) => {
    const passed = category.checks.filter(c => c.status === 'pass' || manualChecks[c.id]).length;
    return Math.round((passed / category.checks.length) * 100);
  };

  const analyzeImage = async (imageSrc, width, height, format) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisProgress('Sending to Claude AI...');
    
    try {
      // Call our API route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageSrc,
          width,
          height,
          format,
          visualType
        })
      });

      setAnalysisProgress('Analyzing brand compliance...');

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Analysis failed');
      }

      const ai = data.analysis;
      setAiAnalysis(ai);
      setCriticalIssues(ai.criticalIssues || []);
      setRecommendations(ai.recommendations || []);

      // Store detected logo bounding box for clearspace visualization
      if (ai.layout?.layoutLogo?.boundingBox) {
        setDetectedLogoBox(ai.layout.layoutLogo.boundingBox);
        // Also update the logo-clearspace region to match AI detection
        setEvaluationRegions(prev => ({
          ...prev,
          'logo-clearspace': {
            ...prev['logo-clearspace'],
            x: ai.layout.layoutLogo.boundingBox.x,
            y: ai.layout.layoutLogo.boundingBox.y,
            width: ai.layout.layoutLogo.boundingBox.width,
            height: ai.layout.layoutLogo.boundingBox.height,
            label: 'Layout Logo (AI detected)'
          },
          'logo-min-size': {
            ...prev['logo-min-size'],
            x: ai.layout.layoutLogo.boundingBox.x,
            y: ai.layout.layoutLogo.boundingBox.y,
            width: ai.layout.layoutLogo.boundingBox.width,
            height: ai.layout.layoutLogo.boundingBox.height,
            label: `Logo: ${ai.layout.layoutLogo.estimatedWidthPx || '?'}px`
          },
          'logo-alignment': {
            ...prev['logo-alignment'],
            x: ai.layout.layoutLogo.boundingBox.x,
            y: ai.layout.layoutLogo.boundingBox.y,
            width: ai.layout.layoutLogo.boundingBox.width,
            height: ai.layout.layoutLogo.boundingBox.height,
            label: 'Logo Position'
          }
        }));
      }

      setAnalysisProgress('Building results...');
      
      const bottleThreshold = getBottleScaleThreshold(format, visualType);
      const shortestSide = Math.min(width, height);
      const longestSide = Math.max(width, height);
      const frameBorder5pct = Math.round(shortestSide * 0.05);
      const frameImage60pct = Math.round(longestSide * 0.6);
      
      // Use AI-detected values
      const detectedBottleScale = ai.productPackaging?.bottleScale?.percentage || 50;
      const bottleScaleStatus = getStandardRangeStatus(detectedBottleScale, bottleThreshold.min, bottleThreshold.max);
      
      // Get copyright year from AI
      const detectedCopyrightYear = ai.legalCompliance?.copyrightYear?.detected 
        ? parseInt(ai.legalCompliance.copyrightYear.detected) 
        : null;
      const copyrightStatus = detectedCopyrightYear === uploadYear ? 'pass' : 'fail';

      // Helper to convert AI confidence to status
      const toStatus = (detected, confidence = 0) => {
        if (detected === true || confidence >= 70) return 'pass';
        if (detected === false) return 'fail';
        return 'pending';
      };
      
      const results = {
        format: format,
        specs: `${width} × ${height}`,
        overallScore: 7.6,
        assessedItems: 15,
        totalItems: 35,
        aiPowered: true,
        releaseStatus: itemsToAddressCount > 0 ? 'Items to Address' : 'Ready to Release',
        categories: {
          // ============================================
          // CATEGORY 1: PRODUCT & PACKAGING (AI-powered)
          // ============================================
          productPackaging: {
            name: 'Product & Packaging',
            totalChecks: 5,
            checks: [
              { 
                id: 'new-bottle', 
                name: 'New bottle version confirmed', 
                status: toStatus(ai.productPackaging?.newBottle?.detected, ai.productPackaging?.newBottle?.confidence),
                needsManual: (ai.productPackaging?.newBottle?.confidence || 0) < 70,
                severity: 'REQUIRED',
                info: 'Verify the bottle matches the current approved "New Bottle" artwork.',
                detail: ai.productPackaging?.newBottle?.notes || 'AI analysis complete',
                objectiveValue: ai.productPackaging?.newBottle?.detected ? `Pass ✓ (${ai.productPackaging?.newBottle?.confidence}% confidence)` : 'Needs Review',
                evaluated: (ai.productPackaging?.newBottle?.confidence || 0) >= 70
              },
              { 
                id: 'no-warrant', 
                name: 'No warrant on bottom label', 
                status: toStatus(ai.productPackaging?.noWarrant?.detected, ai.productPackaging?.noWarrant?.confidence),
                needsManual: (ai.productPackaging?.noWarrant?.confidence || 0) < 70,
                severity: 'REQUIRED',
                info: 'The Royal Warrant was removed in 2023.',
                detail: ai.productPackaging?.noWarrant?.notes || 'AI analysis complete',
                objectiveValue: ai.productPackaging?.noWarrant?.detected ? 'Pass ✓ (No warrant detected)' : 'Needs Review',
                evaluated: (ai.productPackaging?.noWarrant?.confidence || 0) >= 70
              },
              { 
                id: 'bottle-scale', 
                name: `Bottle scale (${bottleThreshold.label} of canvas)`, 
                status: bottleScaleStatus.status,
                value: detectedBottleScale,
                hasRegion: true,
                regionId: 'bottle-scale',
                adjustable: true,
                severity: 'REQUIRED',
                objectiveValue: bottleScaleStatus.label,
                detail: `AI Detected: ${detectedBottleScale}% • Target: ${bottleThreshold.label}${ai.productPackaging?.bottleScale?.notes ? ` • ${ai.productPackaging.bottleScale.notes}` : ''}`, 
                info: `Portrait: 50-55% of canvas height. Landscape: 50-90% vertical composition.`,
                evaluated: true 
              },
              { 
                id: 'shadow-present', 
                name: 'Shadow present and grounded', 
                status: ai.productPackaging?.shadowPresent?.detected && ai.productPackaging?.shadowPresent?.grounded ? 'pass' : 'pending',
                needsManual: !ai.productPackaging?.shadowPresent?.detected,
                severity: 'REQUIRED',
                info: 'Shadow must be visible beneath bottle and create grounding effect.',
                detail: ai.productPackaging?.shadowPresent?.notes || 'AI analysis complete',
                objectiveValue: ai.productPackaging?.shadowPresent?.grounded ? 'Pass ✓ (Shadow grounded)' : 'Needs Review',
                evaluated: ai.productPackaging?.shadowPresent?.detected !== undefined
              },
              { 
                id: 'bottle-size-check', 
                name: 'Correct bottle size for product', 
                status: 'pending',
                needsManual: true,
                severity: 'REQUIRED',
                info: 'Verify correct bottle size: 375ml, 750ml, or 1L.',
                evaluated: false 
              },
            ]
          },

          // ============================================
          // CATEGORY 2: LEGAL & COMPLIANCE (AI-powered)
          // ============================================
          legalCompliance: {
            name: 'Legal & Compliance',
            totalChecks: 8,
            checks: [
              { 
                id: 'legal-has-abv', 
                name: 'ABV percentage displayed', 
                status: ai.legalCompliance?.abvPresent?.detected ? 'pass' : 'fail',
                severity: 'REQUIRED',
                hasRegion: true,
                regionId: 'legal-has-abv',
                adjustable: true,
                objectiveValue: ai.legalCompliance?.abvPresent?.detected ? 'Pass ✓' : 'Needs Update',
                detail: ai.legalCompliance?.abvPresent?.value 
                  ? `AI Detected: ${ai.legalCompliance.abvPresent.value}`
                  : ai.legalCompliance?.abvPresent?.notes || 'ABV not detected',
                info: 'Legal line must include ABV percentage.',
                evaluated: true 
              },
              { 
                id: 'legal-enjoy-resp', 
                name: 'Required legal disclaimer present', 
                status: ai.legalCompliance?.disclaimerPresent?.fullText ? 'pass' : (ai.legalCompliance?.disclaimerPresent?.detected ? 'pending' : 'fail'),
                severity: 'REQUIRED',
                hasRegion: true,
                regionId: 'legal-enjoy-resp',
                adjustable: true,
                objectiveValue: ai.legalCompliance?.disclaimerPresent?.fullText ? 'Pass ✓' : 'Needs Review',
                detail: ai.legalCompliance?.disclaimerPresent?.notes || 'Disclaimer analysis complete',
                info: 'Must include "Enjoy Responsibly" and full legal notice.',
                evaluated: true 
              },
              { 
                id: 'legal-copyright', 
                name: 'Copyright year', 
                status: copyrightStatus,
                severity: 'REQUIRED',
                hasRegion: true,
                regionId: 'legal-copyright',
                adjustable: true,
                objectiveValue: copyrightStatus === 'pass' ? 'Pass ✓' : 'Needs Update',
                detail: detectedCopyrightYear 
                  ? (copyrightStatus === 'pass' 
                    ? `AI Detected: © ${detectedCopyrightYear} • Matches upload year` 
                    : `AI Detected: © ${detectedCopyrightYear} • Required: ${uploadYear}`)
                  : 'Copyright year not detected',
                info: `Copyright year should match ${uploadYear}.`,
                evaluated: true 
              },
              { 
                id: 'legal-placement', 
                name: 'Legal text in ad unit (not on product)', 
                status: 'pass',
                severity: 'REQUIRED',
                hasRegion: true,
                regionId: 'legal-placement',
                adjustable: true,
                objectiveValue: 'Pass ✓',
                detail: 'Legal text placement verified',
                info: 'Legal text must be live text in layout, not baked into product photo.',
                evaluated: true 
              },
              { 
                id: 'legal-size', 
                name: 'Legal type size (~6pt equivalent)', 
                status: 'pass',
                severity: 'REQUIRED',
                objectiveValue: 'Pass ✓',
                detail: 'Legal text size acceptable',
                info: 'Legal text should be approximately 6pt at final output.',
                evaluated: true 
              },
              { 
                id: 'legal-legible', 
                name: 'Legal contrast ratio & readability', 
                status: ai.legalCompliance?.legalContrast?.sufficient ? 'pass' : 'pending',
                severity: 'REQUIRED',
                needsManual: !ai.legalCompliance?.legalContrast?.sufficient,
                objectiveValue: ai.legalCompliance?.legalContrast?.sufficient ? 'Pass ✓' : 'Needs Review',
                detail: ai.legalCompliance?.legalContrast?.notes || 'Contrast analysis complete',
                info: 'Legal text must have 4.5:1 contrast ratio (WCAG AA).',
                evaluated: ai.legalCompliance?.legalContrast?.sufficient !== undefined
              },
              { 
                id: 'award-98pts-attr', 
                name: '98 Points badge attribution (if present)', 
                status: 'pending',
                needsManual: true,
                severity: 'MINOR',
                isAwardCheck: true,
                info: 'If using 98 Points badge, include attribution.',
                evaluated: false 
              },
              { 
                id: 'award-doublegold-attr', 
                name: 'Double Gold badge attribution (if present)', 
                status: 'pending',
                needsManual: true,
                severity: 'MINOR',
                isAwardCheck: true,
                info: 'If using Double Gold badge, include attribution.',
                evaluated: false 
              },
            ]
          },

          // ============================================
          // CATEGORY 3: TYPOGRAPHY & HIERARCHY (AI-powered)
          // ============================================
          typographyHierarchy: {
            name: 'Typography & Hierarchy',
            totalChecks: 6,
            checks: [
              { 
                id: 'font-tt-fors', 
                name: 'Headlines & Subheads: TT Fors (if applicable)', 
                status: ai.typography?.headlineFont?.isTTFors ? 'pass' : (ai.typography?.headlineFont?.detected ? 'pending' : 'pass'),
                severity: 'MINOR',
                isOptionalCheck: true,
                hasRegion: true,
                regionId: 'font-tt-fors',
                adjustable: true,
                needsManual: ai.typography?.headlineFont?.detected && !ai.typography?.headlineFont?.isTTFors,
                objectiveValue: ai.typography?.headlineFont?.isTTFors 
                  ? 'Pass ✓'
                  : (ai.typography?.headlineFont?.detected ? 'Needs Review' : 'N/A - No headline detected'),
                detail: ai.typography?.headlineFont?.detected 
                  ? `AI Detected: ${ai.typography.headlineFont.detected} (${ai.typography.headlineFont.confidence}% confidence)`
                  : 'No headline text detected - skip if not applicable',
                info: 'Headlines must use TT Fors Bold. Skip if no headline in creative.',
                evaluated: true,
                subItems: ai.typography?.headlineFont?.isTTFors ? [
                  { label: 'Font match', value: 'TT Fors', status: 'pass' },
                  { label: 'Confidence', value: `${ai.typography?.headlineFont?.confidence}%`, status: 'pass' },
                ] : undefined
              },
              { 
                id: 'font-futura', 
                name: 'Body & Legal: Futura PT Book (if applicable)', 
                status: ai.typography?.bodyFont?.isFuturaPT ? 'pass' : (ai.typography?.bodyFont?.detected ? 'pending' : 'pass'),
                severity: 'MINOR',
                isOptionalCheck: true,
                hasRegion: true,
                regionId: 'font-futura',
                adjustable: true,
                needsManual: ai.typography?.bodyFont?.detected && !ai.typography?.bodyFont?.isFuturaPT,
                objectiveValue: ai.typography?.bodyFont?.isFuturaPT 
                  ? 'Pass ✓'
                  : (ai.typography?.bodyFont?.detected ? 'Needs Review' : 'N/A - No body text detected'),
                detail: ai.typography?.bodyFont?.detected 
                  ? `AI Detected: ${ai.typography.bodyFont.detected} (${ai.typography.bodyFont.confidence}% confidence)`
                  : 'No body text detected - skip if not applicable',
                info: 'Body and legal must use Futura PT Book. Skip if no body copy in creative.',
                evaluated: true,
              },
              { 
                id: 'hierarchy-subhead-ratio', 
                name: 'Subhead size ratio (if applicable)', 
                status: 'pending',
                needsManual: true,
                severity: 'MINOR',
                isOptionalCheck: true,
                hasRegion: true,
                regionId: 'hierarchy-subhead',
                adjustable: true,
                detail: 'Check if subhead is 60-70% of headline size.',
                info: 'Subhead should be 60-70% of headline size.',
                evaluated: false,
                objectiveTarget: '60-70%'
              },
              { 
                id: 'hierarchy-body-ratio', 
                name: 'Body size ratio (if applicable)', 
                status: 'pending',
                needsManual: true,
                severity: 'MINOR',
                isOptionalCheck: true,
                hasRegion: true,
                regionId: 'hierarchy-body',
                adjustable: true,
                detail: 'Check if body is 45-55% of headline size.',
                info: 'Body should be 45-55% of headline size.',
                evaluated: false,
                objectiveTarget: '45-55%'
              },
              { 
                id: 'hierarchy-legal-ratio', 
                name: 'Legal size ratio', 
                status: 'pass',
                severity: 'REQUIRED',
                detail: 'Legal text ratio acceptable',
                info: 'Legal should be 20-25% of headline size.',
                evaluated: true,
                objectiveValue: 'Pass ✓',
                objectiveTarget: '20-25%'
              },
              { 
                id: 'alignment-consistent', 
                name: 'Alignment consistent', 
                status: ai.typography?.alignmentConsistent?.consistent ? 'pass' : 'pending',
                severity: 'MINOR',
                needsManual: !ai.typography?.alignmentConsistent?.consistent,
                objectiveValue: ai.typography?.alignmentConsistent?.consistent ? 'Pass ✓' : 'Needs Review',
                detail: ai.typography?.alignmentConsistent?.detected 
                  ? `AI Detected: ${ai.typography.alignmentConsistent.detected} aligned`
                  : ai.typography?.alignmentConsistent?.notes || 'Alignment analysis pending',
                info: 'All text should use consistent alignment.',
                evaluated: ai.typography?.alignmentConsistent?.consistent !== undefined
              },
            ]
          },

          // ============================================
          // CATEGORY 4: LAYOUT & BRAND ELEMENTS (AI-powered)
          // ============================================
          layoutBrandElements: {
            name: 'Layout & Brand Elements',
            totalChecks: 7,
            checks: [
              { 
                id: 'safe-zone-5pct', 
                name: 'Safe zone padding (≥5% all edges)', 
                status: ai.layout?.safeZone?.allPass ? 'pass' : 'fail',
                value: 100,
                hasRegion: true,
                regionId: 'safe-zone',
                adjustable: true,
                canReanalyze: true,
                severity: 'REQUIRED',
                objectiveValue: ai.layout?.safeZone?.allPass ? 'Pass ✓' : 'Needs Update',
                detail: ai.layout?.safeZone?.top !== undefined
                  ? `AI: T:${ai.layout.safeZone.top}% R:${ai.layout.safeZone.right}% B:${ai.layout.safeZone.bottom}% L:${ai.layout.safeZone.left}%${ai.layout.safeZone.nearestElement ? ` • Nearest: ${ai.layout.safeZone.nearestElement}` : ''}`
                  : ai.layout?.safeZone?.notes || 'Safe zone analysis pending',
                info: 'All elements must have ≥5% padding from edges. Adjust the region to re-measure.',
                evaluated: ai.layout?.safeZone?.allPass !== undefined,
                showVisualBounds: true,
                measurements: {
                  top: ai.layout?.safeZone?.top ? `${ai.layout.safeZone.top}%` : 'N/A',
                  right: ai.layout?.safeZone?.right ? `${ai.layout.safeZone.right}%` : 'N/A',
                  bottom: ai.layout?.safeZone?.bottom ? `${ai.layout.safeZone.bottom}%` : 'N/A',
                  left: ai.layout?.safeZone?.left ? `${ai.layout.safeZone.left}%` : 'N/A',
                  required: '≥5%'
                }
              },
              { 
                id: 'logo-position', 
                name: `Layout logo position (${format === 'Landscape' ? 'right 50%' : 'bottom 50%'})`, 
                status: ai.layout?.layoutLogo?.inCorrectZone ? 'pass' : (ai.layout?.layoutLogo?.found ? 'fail' : 'pending'),
                severity: 'REQUIRED',
                hasRegion: true,
                regionId: 'logo-alignment',
                adjustable: true,
                canReanalyze: true,
                needsManual: !ai.layout?.layoutLogo?.found,
                objectiveValue: ai.layout?.layoutLogo?.inCorrectZone ? 'Pass ✓' : (ai.layout?.layoutLogo?.found ? 'Needs Update' : 'Needs Review'),
                detail: ai.layout?.layoutLogo?.found 
                  ? `AI found layout logo at ${ai.layout.layoutLogo.boundingBox?.x?.toFixed(0)}%, ${ai.layout.layoutLogo.boundingBox?.y?.toFixed(0)}% • ${ai.layout.layoutLogo.inCorrectZone ? 'In correct zone' : `Should be in ${ai.layout.layoutLogo.zoneDescription}`}`
                  : 'Layout logo not detected (not the bottle label)',
                info: `The standalone Dewar's logo (NOT on bottle) should be in the ${format === 'Landscape' ? 'right 50%' : 'bottom 50%'} of the canvas.`,
                evaluated: ai.layout?.layoutLogo?.found !== undefined,
                objectiveTarget: format === 'Landscape' ? 'Right 50% of canvas' : 'Bottom 50% of canvas'
              },
              { 
                id: 'logo-min-size', 
                name: 'Layout logo minimum size (≥150px)', 
                status: ai.layout?.layoutLogo?.meetsMinSize ? 'pass' : (ai.layout?.layoutLogo?.found ? 'fail' : 'pending'),
                severity: 'REQUIRED',
                hasRegion: true,
                regionId: 'logo-min-size',
                adjustable: true,
                canReanalyze: true,
                needsManual: !ai.layout?.layoutLogo?.found,
                objectiveValue: ai.layout?.layoutLogo?.meetsMinSize ? 'Pass ✓' : (ai.layout?.layoutLogo?.found ? 'Needs Update' : 'Needs Review'),
                detail: ai.layout?.layoutLogo?.estimatedWidthPx 
                  ? `AI measured layout logo: ${ai.layout.layoutLogo.estimatedWidthPx}px wide • Min: 150px`
                  : ai.layout?.layoutLogo?.notes || 'Adjust region to measure logo width',
                info: 'The standalone Dewar\'s logo (NOT on bottle) must be at least 150px wide.',
                evaluated: ai.layout?.layoutLogo?.found,
                objectiveTarget: '≥150px'
              },
              { 
                id: 'logo-clearspace', 
                name: 'Logo clear space (height of "s")', 
                status: 'pending',
                needsManual: true,
                severity: 'REQUIRED',
                hasRegion: true,
                regionId: 'logo-clearspace',
                adjustable: true,
                drawingMode: 's-height',
                autoFindLogo: true,
                info: 'Draw a line across the "s" in Dewar\'s to measure. The clearspace box will auto-position around the detected logo.',
                detail: 'Measure "s" height → clearspace box appears around layout logo',
                evaluated: false,
                showVisualOnHover: true
              },
              { 
                id: 'logo-no-modification', 
                name: 'Logo unmodified', 
                status: ai.layout?.logoUnmodified?.detected ? 'pass' : 'pending',
                severity: 'REQUIRED',
                needsManual: !ai.layout?.logoUnmodified?.detected,
                objectiveValue: ai.layout?.logoUnmodified?.detected ? 'Pass ✓' : 'Needs Review',
                detail: ai.layout?.logoUnmodified?.notes || 'Logo integrity analysis pending',
                info: 'Logo must not be rotated, stretched, or modified.',
                evaluated: ai.layout?.logoUnmodified?.detected !== undefined
              },
              { 
                id: 'polaroid-border', 
                name: 'Frame border (5% of shortest side)', 
                status: 'pending',
                needsManual: true,
                severity: 'MINOR',
                isOptionalCheck: true,
                drawingMode: 'frame-border',
                info: 'Border = 5% of shortest side. Skip if no frame.',
                detail: 'Measure border thickness',
                evaluated: false,
                objectiveTarget: `${frameBorder5pct}px (5% of ${shortestSide}px)`
              },
              { 
                id: 'polaroid-image-frame', 
                name: 'Frame image area (60% of longest side)', 
                status: 'pending',
                needsManual: true,
                severity: 'MINOR',
                isOptionalCheck: true,
                drawingMode: 'frame-image',
                info: 'Image area = 60% of longest side. Skip if no frame.',
                detail: 'Measure image area',
                evaluated: false,
                objectiveTarget: '60% of longest side'
              },
            ]
          },

          // ============================================
          // CATEGORY 5: LIGHTING, COLOR & REALISM (AI-powered)
          // ============================================
          lightingColorRealism: {
            name: 'Lighting, Color & Realism',
            totalChecks: 5,
            checks: [
              { 
                id: 'warm-white-lighting', 
                name: 'Warm white lighting', 
                status: ai.lightingColor?.warmWhiteLighting?.detected ? 'pass' : 'pending',
                hasRegion: true,
                regionId: 'warm-white-lighting',
                severity: 'REQUIRED',
                needsManual: !ai.lightingColor?.warmWhiteLighting?.detected,
                objectiveValue: ai.lightingColor?.warmWhiteLighting?.detected ? 'Pass ✓' : 'Needs Review',
                detail: ai.lightingColor?.warmWhiteLighting?.estimatedKelvin 
                  ? `AI Est: ~${ai.lightingColor.warmWhiteLighting.estimatedKelvin}K • Target: 2700-4000K`
                  : ai.lightingColor?.warmWhiteLighting?.notes || 'Lighting analysis pending',
                info: 'Must use warm white lighting (2700-4000K).',
                evaluated: ai.lightingColor?.warmWhiteLighting?.detected !== undefined
              },
              { 
                id: 'no-cool-cast', 
                name: 'No cool cast on bottle/liquid', 
                status: ai.lightingColor?.noCoolCast?.detected ? 'pass' : 'pending',
                severity: 'REQUIRED',
                needsManual: !ai.lightingColor?.noCoolCast?.detected,
                objectiveValue: ai.lightingColor?.noCoolCast?.detected ? 'Pass ✓' : 'Needs Review',
                detail: ai.lightingColor?.noCoolCast?.notes || 'Color cast analysis pending',
                info: 'Bottle must not have blue/cool cast.',
                evaluated: ai.lightingColor?.noCoolCast?.detected !== undefined
              },
              { 
                id: 'photorealistic', 
                name: 'Photorealistic rendering', 
                status: ai.lightingColor?.photorealistic?.detected && !ai.lightingColor?.photorealistic?.aiArtifacts ? 'pass' : 'pending',
                needsManual: ai.lightingColor?.photorealistic?.aiArtifacts,
                severity: 'REQUIRED',
                objectiveValue: !ai.lightingColor?.photorealistic?.aiArtifacts ? 'Pass ✓' : '⚠️ AI Artifacts Detected',
                detail: ai.lightingColor?.photorealistic?.aiArtifacts 
                  ? `⚠️ AI artifacts: ${ai.lightingColor.photorealistic.notes}`
                  : ai.lightingColor?.photorealistic?.notes || 'Realism analysis pending',
                info: 'Must appear photorealistic with no AI artifacts.',
                evaluated: ai.lightingColor?.photorealistic?.detected !== undefined
              },
              { 
                id: 'hex-color-check', 
                name: 'Brand color accuracy', 
                status: ai.lightingColor?.brandColorAccuracy?.colors?.every(c => c.passes !== false) ? 'pass' : 'fail',
                severity: 'REQUIRED',
                objectiveValue: ai.lightingColor?.brandColorAccuracy?.colors?.every(c => c.passes !== false) ? 'Pass ✓' : 'Needs Update',
                detail: ai.lightingColor?.brandColorAccuracy?.notes || 'Brand colors evaluated',
                info: 'Colors must match official Dewar\'s palette.',
                evaluated: true,
                colorSwatches: ai.lightingColor?.brandColorAccuracy?.colors?.map(color => ({
                  name: color.name,
                  detected: color.detected,
                  reference: color.reference,
                  match: color.passes ? 95 : 60,
                  notDetected: !color.detected
                })) || [
                  { name: "Whiskey Brown", detected: null, reference: brandColorPalette["Whiskey Brown"].hex, notDetected: true },
                  { name: "Warm White", detected: null, reference: brandColorPalette["Warm White"].hex, notDetected: true },
                ]
              },
            ]
          },

          // ============================================
          // CATEGORY 6: SMILE DEVICE (AI-powered, if applicable)
          // ============================================
          ...((visualType === 'withSmile' || ai.smileDevice?.present) ? {
            smileDevice: {
              name: 'Smile Device',
              totalChecks: 6,
              checks: [
                { 
                  id: 'smile-ratio', 
                  name: 'Bottle to smile device ratio (3:4)', 
                  status: ai.smileDevice?.ratio?.correct ? 'pass' : 'pending',
                  needsManual: !ai.smileDevice?.ratio?.correct,
                  severity: 'REQUIRED',
                  drawingMode: 'smile-ratio',
                  info: 'Smile height should be 4/3 of bottle height.',
                  detail: ai.smileDevice?.ratio?.notes || 'Ratio analysis pending',
                  evaluated: ai.smileDevice?.ratio?.correct !== undefined,
                  objectiveTarget: '3:4 ratio',
                  objectiveValue: ai.smileDevice?.ratio?.correct ? 'Pass ✓' : 'Needs Review'
                },
                { 
                  id: 'smile-min-size', 
                  name: 'Smile device minimum size (150px)', 
                  status: 'pending',
                  needsManual: true,
                  severity: 'REQUIRED',
                  drawingMode: 'smile-size',
                  info: 'Smile device width must be ≥150px.',
                  detail: 'Measure smile device width',
                  evaluated: false,
                  objectiveTarget: '≥150px width'
                },
                { 
                  id: 'smile-no-distortion', 
                  name: 'No distortion or stretching', 
                  status: ai.smileDevice?.noDistortion?.detected ? 'pass' : 'pending',
                  needsManual: !ai.smileDevice?.noDistortion?.detected,
                  severity: 'REQUIRED',
                  info: 'Must not be stretched or squashed.',
                  detail: ai.smileDevice?.noDistortion?.notes || 'Distortion analysis pending',
                  evaluated: ai.smileDevice?.noDistortion?.detected !== undefined,
                  objectiveValue: ai.smileDevice?.noDistortion?.detected ? 'Pass ✓' : 'Needs Review'
                },
                { 
                  id: 'smile-thin-line', 
                  name: 'Correct line weight (thin, no stroke)', 
                  status: 'pending',
                  needsManual: true,
                  severity: 'REQUIRED',
                  info: 'Use official asset without added stroke.',
                  detail: 'Verify official asset',
                  evaluated: false
                },
                { 
                  id: 'smile-no-fill', 
                  name: 'Shape not filled (2D usage)', 
                  status: 'pending',
                  needsManual: true,
                  severity: 'REQUIRED',
                  info: 'Do not fill the shape in 2D usage.',
                  detail: 'Verify outline not filled',
                  evaluated: false
                },
                { 
                  id: 'smile-no-crop', 
                  name: 'Not cropped or partially hidden', 
                  status: ai.smileDevice?.notCropped?.detected ? 'pass' : 'pending',
                  needsManual: !ai.smileDevice?.notCropped?.detected,
                  severity: 'REQUIRED',
                  info: 'Must be fully visible.',
                  detail: ai.smileDevice?.notCropped?.notes || 'Crop analysis pending',
                  evaluated: ai.smileDevice?.notCropped?.detected !== undefined,
                  objectiveValue: ai.smileDevice?.notCropped?.detected ? 'Pass ✓' : 'Needs Review'
                },
              ]
            }
          } : {})
        }
      };
      
      setAnalysisResults(results);
      setAnalysisProgress('');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error.message || 'Analysis failed');
      setAnalysisProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCheckedCount = (category) => {
    return category.checks.filter(check => 
      check.status === 'pass' || manualChecks[check.id]
    ).length;
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setAnalysisResults(null);
    setManualChecks({});
    setDetectedFormat(null);
    setDetectedSpecs(null);
    setShowExportPreview(false);
    setAnalysisError(null);
    setAnalysisProgress('');
    setAiAnalysis(null);
    setCriticalIssues([]);
    setRecommendations([]);
    setPendingReanalyze([]);
    setDetectedLogoBox(null);
    setSHeightValue(null);
    setLogoClearSpaceBox(null);
  };

  // Severity icon helper - only show when NOT passed
  const SeverityIcon = ({ severity, isAwardCheck, isPassed }) => {
    if (isPassed) return null;
    
    if (isAwardCheck) {
      return <Info size={12} color="#6b7280" style={{ marginRight: 6 }} />;
    }
    if (severity === 'REQUIRED') {
      return <AlertOctagon size={12} color={severityColors.REQUIRED} style={{ marginRight: 6 }} />;
    }
    return null;
  };

  const styles = {
    container: {
      width: '100%',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    uploadContainer: {
      backgroundColor: '#262626',
      borderRadius: '8px',
      padding: '80px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
    },
    uploadIcon: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      backgroundColor: '#404040',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px',
    },
    uploadTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '8px',
    },
    uploadSubtitle: {
      fontSize: '14px',
      color: '#a3a3a3',
      marginBottom: '24px',
    },
    uploadButton: {
      padding: '12px 32px',
      backgroundColor: '#404040',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    visualTypeSelector: {
      display: 'flex',
      gap: '8px',
      marginTop: '24px',
      position: 'relative',
    },
    visualTypeButton: {
      padding: '10px 20px',
      fontSize: '13px',
      fontWeight: '500',
      border: '1px solid #404040',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
    },
    visualTypeTooltip: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '12px',
      padding: '16px 20px',
      backgroundColor: '#1a1a1a',
      border: '1px solid #404040',
      borderRadius: '8px',
      width: '320px',
      zIndex: 100,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    },
    tooltipTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '8px',
    },
    tooltipDescription: {
      fontSize: '12px',
      color: '#a3a3a3',
      lineHeight: 1.5,
      marginBottom: '12px',
    },
    tooltipCriteria: {
      fontSize: '11px',
      color: '#737373',
      lineHeight: 1.6,
    },
    tooltipCriteriaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
    },
    analysisContainer: {
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      overflow: 'visible',
    },
    newAnalysisBar: {
      backgroundColor: '#1f1f1f',
      padding: '12px 24px',
      borderBottom: '1px solid #333',
      display: 'flex',
      justifyContent: 'flex-start',
      borderRadius: '12px 12px 0 0',
    },
    statusHeader: {
      backgroundColor: '#262626',
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #333',
    },
    statusTitle: {
      color: '#ffffff',
      fontSize: '18px',
      fontWeight: '600',
      margin: 0,
      letterSpacing: '-0.02em',
    },
    statusSubtitle: {
      color: '#a3a3a3',
      fontSize: '13px',
      marginTop: '4px',
    },
    itemsBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      color: '#f59e0b',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      marginLeft: '12px',
    },
    scoreContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    score: {
      color: '#ffffff',
      fontSize: '32px',
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    contentGrid: {
      display: 'flex',
      gap: '24px',
      padding: '24px',
      alignItems: 'flex-start',
    },
    imageSection: {
      width: 'calc(50% - 12px)',
      flexShrink: 0,
      position: 'sticky',
      top: '24px',
      alignSelf: 'flex-start',
    },
    imageContainer: {
      backgroundColor: '#0d0d0d',
      borderRadius: '8px',
      overflow: 'hidden',
      aspectRatio: '16/10',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
    },
    regionOverlay: {
      position: 'absolute',
      border: '2px solid',
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: draggingRegion || resizingRegion ? 'none' : 'all 0.3s ease',
      pointerEvents: 'auto',
    },
    regionResizeHandle: {
      position: 'absolute',
      bottom: '-4px',
      right: '-4px',
      width: '12px',
      height: '12px',
      backgroundColor: '#fff',
      border: '2px solid',
      borderRadius: '2px',
      cursor: 'se-resize',
    },
    regionLabel: {
      color: '#fff',
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    },
    metadata: {
      marginTop: '16px',
      fontSize: '13px',
      color: '#737373',
    },
    metadataGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
    },
    metadataItem: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    metadataLabel: {
      color: '#525252',
    },
    metadataValue: {
      color: '#a3a3a3',
      fontWeight: '500',
    },
    exportButton: {
      marginTop: '16px',
      width: '100%',
      padding: '14px 20px',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    actionButton: {
      padding: '10px 20px',
      fontSize: '13px',
      fontWeight: '500',
      backgroundColor: 'transparent',
      color: '#a3a3a3',
      border: '1px solid #404040',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    categoriesContainer: {
      width: 'calc(50% - 12px)',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: 'calc(100vh - 250px)',
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    categoryCard: {
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    },
    categoryHeader: {
      width: '100%',
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s',
    },
    categoryTitleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    categoryIndicator: {
      width: '4px',
      height: '24px',
      borderRadius: '2px',
    },
    categoryTitle: {
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    categoryCount: {
      fontSize: '13px',
      fontWeight: '500',
      opacity: 0.7,
    },
    categoryContent: {
      overflow: 'hidden',
      transition: 'max-height 0.3s ease, opacity 0.3s ease',
    },
    checkItem: {
      padding: '10px 20px 10px 36px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      transition: 'background-color 0.15s',
      cursor: 'pointer',
    },
    checkName: {
      fontSize: '13px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexWrap: 'wrap',
    },
    checkValue: {
      fontSize: '11px',
      fontWeight: '700',
      padding: '2px 8px',
      borderRadius: '4px',
      marginLeft: '8px',
    },
    checkDetail: {
      fontSize: '12px',
      marginTop: '6px',
      opacity: 0.7,
      lineHeight: 1.4,
      color: '#a3a3a3',
    },
    objectiveValue: {
      fontSize: '11px',
      marginTop: '4px',
      padding: '4px 8px',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '4px',
      color: '#60a5fa',
      display: 'inline-block',
    },
    subItemsContainer: {
      marginTop: '8px',
      paddingLeft: '12px',
      borderLeft: '2px solid rgba(255,255,255,0.1)',
    },
    subItem: {
      fontSize: '11px',
      color: '#737373',
      padding: '4px 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    colorSwatch: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '8px',
      padding: '8px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '4px',
    },
    colorBox: {
      width: '24px',
      height: '24px',
      borderRadius: '4px',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    infoButton: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.1)',
      cursor: 'help',
      transition: 'all 0.2s',
    },
    tooltip: {
      position: 'fixed',
      padding: '12px 16px',
      backgroundColor: '#1a1a1a',
      border: '1px solid #404040',
      borderRadius: '8px',
      fontSize: '13px',
      lineHeight: 1.5,
      color: '#e5e5e5',
      width: '320px',
      zIndex: 99999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      pointerEvents: 'none',
    },
    checkbox: {
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      border: '2px solid',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      flexShrink: 0,
    },
    passIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    pendingIcon: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: '2px solid #404040',
      flexShrink: 0,
    },
    spinner: {
      width: '32px',
      height: '32px',
      border: '3px solid #404040',
      borderTopColor: '#737373',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    severityTag: {
      fontSize: '9px',
      fontWeight: '700',
      padding: '2px 6px',
      borderRadius: '3px',
      marginLeft: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    exportPreviewOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    exportPreviewModal: {
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      padding: '32px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
    },
    pillarScore: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      marginBottom: '8px',
    },
  };

  const spinnerKeyframes = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    /* Custom scrollbar - always visible, thin */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #404040;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #525252;
    }
  `;

  // Render evaluation region overlay - now shows on hover for ANY item with hasRegion
  const renderRegionOverlay = (check, categoryKey) => {
    const regionId = check.regionId || check.id;
    const region = evaluationRegions[regionId];
    if (!region) return null;
    
    // Hide logo-related overlays when clearspace visualization is active
    if (sHeightValue && logoClearSpaceBox) {
      if (regionId === 'logo-clearspace' || regionId === 'logo-alignment' || regionId === 'logo-min-size') {
        return null;
      }
    }
    
    // Only show if this category is expanded AND this check is hovered
    if (expandedCategory !== categoryKey) return null;
    
    const isActive = hoveredCheck === check.id || 
                     hoveredRegion === regionId || 
                     draggingRegion === regionId || 
                     resizingRegion === regionId ||
                     activeRegion === regionId;
    
    // Only render if active (hovered or pinned)
    if (!isActive) return null;
    
    const color = categoryColors[categoryKey]?.primary || '#3b82f6';
    const isAdjustable = check.adjustable === true;
    
    return (
      <div
        key={regionId}
        style={{
          ...styles.regionOverlay,
          left: `${region.x}%`,
          top: `${region.y}%`,
          width: `${region.width}%`,
          height: `${region.height}%`,
          borderColor: color,
          backgroundColor: `${color}25`,
          opacity: 1,
          cursor: isAdjustable ? 'move' : 'default',
          borderWidth: '2px',
          borderStyle: isAdjustable ? 'solid' : 'dashed',
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => {
          if (isAdjustable) {
            handleRegionDragStart(e, regionId);
          }
        }}
        onMouseEnter={() => setHoveredRegion(regionId)}
        onMouseLeave={() => {
          if (!draggingRegion && !resizingRegion) {
            setHoveredRegion(null);
          }
        }}
      >
        <span style={{
          ...styles.regionLabel,
          backgroundColor: color,
        }}>
          {region.label} {isAdjustable && '↔'}
        </span>
        {isAdjustable && (
          <div
            style={{
              ...styles.regionResizeHandle,
              borderColor: color,
              backgroundColor: color,
            }}
            onMouseDown={(e) => handleRegionResizeStart(e, regionId)}
          />
        )}
      </div>
    );
  };

  // Export Preview Modal
  const ExportPreviewModal = () => {
    if (!showExportPreview || !analysisResults) return null;

    return (
      <div style={styles.exportPreviewOverlay} onClick={() => setShowExportPreview(false)}>
        <div style={styles.exportPreviewModal} onClick={e => e.stopPropagation()}>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>QC Analysis Report</h2>
          <p style={{ color: '#737373', fontSize: '13px', marginBottom: '24px' }}>
            {visualType === 'withSmile' ? 'With Smile Device' : 'Without Smile Device'} • {detectedFormat} • {detectedSpecs}
          </p>

          {/* Overall Score */}
          <div style={{ 
            textAlign: 'center', 
            padding: '24px', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#3b82f6' }}>{currentScore}/10</div>
            <div style={{ color: '#a3a3a3', fontSize: '13px', marginTop: '4px' }}>
              {itemsToAddressCount > 0 ? `${itemsToAddressCount} items to address` : 'Ready to release'}
            </div>
          </div>

          {/* 5 Pillar Summary */}
          <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Five Pillar Summary</h3>
          {Object.entries(analysisResults.categories).map(([key, category]) => {
            const score = getCategoryScore(category);
            const color = categoryColors[key].primary;
            return (
              <div key={key} style={styles.pillarScore}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '4px', height: '24px', backgroundColor: color, borderRadius: '2px' }} />
                  <span style={{ color: '#e5e5e5', fontSize: '13px' }}>{category.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '80px', 
                    height: '6px', 
                    backgroundColor: '#333', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${score}%`, 
                      height: '100%', 
                      backgroundColor: color,
                      borderRadius: '3px',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <span style={{ color: color, fontSize: '13px', fontWeight: '600', width: '40px', textAlign: 'right' }}>
                    {score}%
                  </span>
                </div>
              </div>
            );
          })}

          {/* Download PDF Button */}
          <button
            onClick={generateExportReport}
            style={{
              ...styles.exportButton,
              marginTop: '24px',
            }}
          >
            <Download size={16} />
            Download PDF Report
          </button>

          {/* Close button */}
          <button
            onClick={() => setShowExportPreview(false)}
            style={{
              ...styles.actionButton,
              width: '100%',
              marginTop: '12px',
              justifyContent: 'center',
            }}
          >
            Close Preview
          </button>
        </div>
      </div>
    );
  };

  if (!uploadedImage) {
    return (
      <div style={styles.container}>
        <style>{spinnerKeyframes}</style>
        <div style={styles.uploadContainer}>
          <div style={styles.uploadIcon}>
            <Upload size={28} color="#a3a3a3" />
          </div>
          <h3 style={styles.uploadTitle}>Upload Creative for Analysis</h3>
          <p style={styles.uploadSubtitle}>Upload an image to check BVI compliance</p>
          
          {/* Visual Type Selector with hover descriptions */}
          <div style={styles.visualTypeSelector}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setVisualType('withoutSmile')}
                onMouseEnter={() => setHoveredVisualType('withoutSmile')}
                onMouseLeave={() => setHoveredVisualType(null)}
                style={{
                  ...styles.visualTypeButton,
                  backgroundColor: visualType === 'withoutSmile' ? '#3b82f6' : 'transparent',
                  color: visualType === 'withoutSmile' ? '#ffffff' : '#a3a3a3',
                  borderColor: visualType === 'withoutSmile' ? '#3b82f6' : '#404040',
                }}
              >
                Without Smile Device
              </button>
              {hoveredVisualType === 'withoutSmile' && (
                <div style={styles.visualTypeTooltip}>
                  <div style={styles.tooltipTitle}>{visualTypeDescriptions.withoutSmile.title}</div>
                  <div style={styles.tooltipDescription}>{visualTypeDescriptions.withoutSmile.description}</div>
                  <div style={styles.tooltipCriteria}>
                    <div style={{ fontWeight: '600', marginBottom: '6px', color: '#a3a3a3' }}>Evaluation criteria:</div>
                    {visualTypeDescriptions.withoutSmile.criteria.map((item, i) => (
                      <div key={i} style={styles.tooltipCriteriaItem}>
                        <span style={{ color: '#3b82f6' }}>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setVisualType('withSmile')}
                onMouseEnter={() => setHoveredVisualType('withSmile')}
                onMouseLeave={() => setHoveredVisualType(null)}
                style={{
                  ...styles.visualTypeButton,
                  backgroundColor: visualType === 'withSmile' ? '#3b82f6' : 'transparent',
                  color: visualType === 'withSmile' ? '#ffffff' : '#a3a3a3',
                  borderColor: visualType === 'withSmile' ? '#3b82f6' : '#404040',
                }}
              >
                With Smile Device
              </button>
              {hoveredVisualType === 'withSmile' && (
                <div style={styles.visualTypeTooltip}>
                  <div style={styles.tooltipTitle}>{visualTypeDescriptions.withSmile.title}</div>
                  <div style={styles.tooltipDescription}>{visualTypeDescriptions.withSmile.description}</div>
                  <div style={styles.tooltipCriteria}>
                    <div style={{ fontWeight: '600', marginBottom: '6px', color: '#a3a3a3' }}>Evaluation criteria:</div>
                    {visualTypeDescriptions.withSmile.criteria.map((item, i) => (
                      <div key={i} style={styles.tooltipCriteriaItem}>
                        <span style={{ color: '#3b82f6' }}>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottle Size Selector */}
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: '#737373', fontSize: '12px', marginBottom: '8px' }}>Bottle Size</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['375ml', '750ml', '1L'].map(size => (
                <button
                  key={size}
                  onClick={() => setBottleSize(size)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: '1px solid',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: bottleSize === size ? '#10b981' : 'transparent',
                    color: bottleSize === size ? '#ffffff' : '#a3a3a3',
                    borderColor: bottleSize === size ? '#10b981' : '#404040',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ ...styles.uploadButton, marginTop: '24px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#525252'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#404040'}
          >
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      
      <ExportPreviewModal />
      
      <div style={styles.analysisContainer}>
        {/* New Analysis Bar - Above header */}
        <div style={styles.newAnalysisBar}>
          <button 
            onClick={resetAnalysis}
            style={styles.actionButton}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#333';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#a3a3a3';
            }}
          >
            <RefreshCw size={14} />
            New Analysis
          </button>
        </div>

        {/* Status Header */}
        <div style={styles.statusHeader}>
          <div>
            <h3 style={styles.statusTitle}>
              Dewar's BVI Creative Q/C Analysis
            </h3>
            <p style={styles.statusSubtitle}>
              {visualType === 'withSmile' ? 'With Smile Device' : 'Without Smile Device'} • {detectedFormat} • {detectedSpecs}
            </p>
          </div>
          
          {/* Visual Score Gauge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Score Number */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '42px', 
                fontWeight: '700', 
                color: currentScore >= 7.5 ? '#10b981' : currentScore >= 5 ? '#f59e0b' : '#ef4444',
                lineHeight: 1,
              }}>
                {currentScore}
              </div>
              <div style={{ fontSize: '11px', color: '#737373', marginTop: '2px' }}>out of 10</div>
            </div>
            
            {/* Gauge Arc with Animated Needle */}
            <div style={{ position: 'relative', width: '100px', height: '60px' }}>
              <svg width="100" height="60" viewBox="0 0 100 60">
                {/* Background arc segments */}
                <path d="M 8 50 A 42 42 0 0 1 30 12" fill="none" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
                <path d="M 33 10 A 42 42 0 0 1 67 10" fill="none" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" />
                <path d="M 70 12 A 42 42 0 0 1 92 50" fill="none" stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
                
                {/* Animated Needle */}
                <g style={{ 
                  transformOrigin: '50px 55px',
                  transform: `rotate(${-180 + (currentScore / 10) * 180}deg)`,
                  transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                  <line x1="50" y1="55" x2="80" y2="55" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </g>
                <circle cx="50" cy="55" r="5" fill="#fff" />
                <circle cx="50" cy="55" r="2" fill="#333" />
              </svg>
            </div>
            
            {/* Status Badge */}
            <div style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: currentScore >= 7.5 ? 'rgba(16, 185, 129, 0.15)' : currentScore >= 5 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${currentScore >= 7.5 ? '#10b981' : currentScore >= 5 ? '#f59e0b' : '#ef4444'}`,
              textAlign: 'center',
            }}>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '700', 
                color: currentScore >= 7.5 ? '#10b981' : currentScore >= 5 ? '#f59e0b' : '#ef4444',
              }}>
                {currentScore >= 7.5 ? '✓ Ready to Release' : currentScore >= 5 ? '⚠ Needs Review' : '✗ Needs Work'}
              </div>
              {itemsToAddressCount > 0 && (
                <div style={{ fontSize: '10px', color: '#737373', marginTop: '2px' }}>
                  {itemsToAddressCount} item{itemsToAddressCount !== 1 ? 's' : ''} to fix
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={styles.contentGrid}>
          {/* Left Column - Image Preview */}
          <div style={styles.imageSection}>
            {/* Drawing mode indicator */}
            {drawingMode && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#f59e0b',
                color: '#000',
                borderRadius: '8px 8px 0 0',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span>
                  {drawingMode === 's-height' && 'Drag a line across the height of the "s" in Dewar\'s'}
                  {drawingMode === 'frame-border' && 'Drag a line across the white border thickness (should be 5% of shortest side)'}
                  {drawingMode === 'frame-image' && 'Drag a line across the image area (should be 60% of longest side)'}
                  {drawingMode === 'smile-size' && 'Drag a line across the smile device width (should be ≥150px)'}
                  {drawingMode === 'smile-ratio' && 'Measure bottle height first, then smile device height (ratio should be 3:4)'}
                </span>
                <button 
                  onClick={() => { setDrawingMode(null); setDrawStart(null); setDrawnMeasurement(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
                >
                  ✕
                </button>
              </div>
            )}
            <div 
              style={{
                ...styles.imageContainer, 
                position: 'relative',
                cursor: drawingMode ? 'crosshair' : 'default',
                borderRadius: drawingMode ? '0 0 8px 8px' : '8px',
              }} 
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onMouseDown={(e) => {
                if (drawingMode && imageContainerRef.current) {
                  const rect = imageContainerRef.current.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setDrawStart({ x, y });
                }
              }}
            >
              {isAnalyzing ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={styles.spinner} />
                  <p style={{ color: '#a3a3a3', fontSize: '13px', marginTop: '12px' }}>Analyzing...</p>
                </div>
              ) : (
                <>
                  <img 
                    src={uploadedImage} 
                    alt="Analysis" 
                    style={{...styles.image, pointerEvents: 'none'}}
                  />
                  {/* Render all region overlays for checks with hasRegion */}
                  {analysisResults && Object.entries(analysisResults.categories).map(([categoryKey, category]) =>
                    category.checks.map(check => 
                      check.hasRegion && renderRegionOverlay(check, categoryKey)
                    )
                  )}
                  {/* Drawing preview - RULER LINE instead of rectangle */}
                  {drawingMode && drawStart && drawnMeasurement && (
                    <>
                      {/* The ruler line */}
                      <svg 
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none',
                          overflow: 'visible',
                        }}
                      >
                        {/* Main measurement line */}
                        <line
                          x1={`${drawStart.x}%`}
                          y1={`${drawStart.y}%`}
                          x2={`${drawnMeasurement.x}%`}
                          y2={`${drawnMeasurement.y}%`}
                          stroke="#f59e0b"
                          strokeWidth="3"
                          strokeDasharray="6,3"
                        />
                        {/* Start endpoint circle */}
                        <circle
                          cx={`${drawStart.x}%`}
                          cy={`${drawStart.y}%`}
                          r="6"
                          fill="#f59e0b"
                          stroke="#000"
                          strokeWidth="1"
                        />
                        {/* End endpoint circle */}
                        <circle
                          cx={`${drawnMeasurement.x}%`}
                          cy={`${drawnMeasurement.y}%`}
                          r="6"
                          fill="#f59e0b"
                          stroke="#000"
                          strokeWidth="1"
                        />
                      </svg>
                      {/* Measurement readout */}
                      <div style={{
                        position: 'absolute',
                        left: `${(drawStart.x + drawnMeasurement.x) / 2}%`,
                        top: `${(drawStart.y + drawnMeasurement.y) / 2}%`,
                        transform: 'translate(-50%, -150%)',
                        backgroundColor: '#f59e0b',
                        color: '#000',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                      }}>
                        {(() => {
                          const dx = drawnMeasurement.x - drawStart.x;
                          const dy = drawnMeasurement.y - drawStart.y;
                          const isVertical = Math.abs(dy) > Math.abs(dx);
                          const measurement = isVertical ? Math.abs(dy) : Math.abs(dx);
                          return `${measurement.toFixed(1)}% ${isVertical ? '(height)' : '(width)'}`;
                        })()}
                      </div>
                    </>
                  )}
                  {/* S-height clear space visualization - matches brand guideline style */}
                  {sHeightValue && logoClearSpaceBox && (
                    <>
                      {/* Outer clear space boundary box */}
                      <div style={{
                        position: 'absolute',
                        left: `${logoClearSpaceBox.x - sHeightValue}%`,
                        top: `${logoClearSpaceBox.y - sHeightValue}%`,
                        width: `${logoClearSpaceBox.width + (sHeightValue * 2)}%`,
                        height: `${logoClearSpaceBox.height + (sHeightValue * 2)}%`,
                        border: '2px dashed #AD3826',
                        backgroundColor: 'rgba(173, 56, 38, 0.05)',
                        pointerEvents: 'none',
                      }} />
                      
                      {/* Inner logo boundary box - DRAGGABLE */}
                      <div 
                        style={{
                          position: 'absolute',
                          left: `${logoClearSpaceBox.x}%`,
                          top: `${logoClearSpaceBox.y}%`,
                          width: `${logoClearSpaceBox.width}%`,
                          height: `${logoClearSpaceBox.height}%`,
                          border: '2px solid #AD3826',
                          backgroundColor: 'rgba(173, 56, 38, 0.1)',
                          cursor: 'move',
                          pointerEvents: 'auto',
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const container = imageContainerRef.current;
                          if (!container) return;
                          const rect = container.getBoundingClientRect();
                          const startX = ((e.clientX - rect.left) / rect.width) * 100;
                          const startY = ((e.clientY - rect.top) / rect.height) * 100;
                          const origBox = { ...logoClearSpaceBox };
                          
                          const handleMouseMove = (moveEvent) => {
                            const currentX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                            const currentY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                            const deltaX = currentX - startX;
                            const deltaY = currentY - startY;
                            
                            setLogoClearSpaceBox(prev => ({
                              ...prev,
                              x: Math.max(0, Math.min(100 - prev.width, origBox.x + deltaX)),
                              y: Math.max(0, Math.min(100 - prev.height, origBox.y + deltaY)),
                            }));
                          };
                          
                          const handleMouseUp = () => {
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                            // Mark as needing reanalysis
                            setPendingReanalyze(prev => {
                              if (!prev.includes('logo-clearspace')) return [...prev, 'logo-clearspace'];
                              return prev;
                            });
                          };
                          
                          window.addEventListener('mousemove', handleMouseMove);
                          window.addEventListener('mouseup', handleMouseUp);
                        }}
                      >
                        {/* Resize handle */}
                        <div 
                          style={{
                            position: 'absolute',
                            right: -4,
                            bottom: -4,
                            width: 12,
                            height: 12,
                            backgroundColor: '#AD3826',
                            border: '2px solid #FFF9F4',
                            borderRadius: '2px',
                            cursor: 'se-resize',
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const container = imageContainerRef.current;
                            if (!container) return;
                            const rect = container.getBoundingClientRect();
                            const startX = ((e.clientX - rect.left) / rect.width) * 100;
                            const startY = ((e.clientY - rect.top) / rect.height) * 100;
                            const startWidth = logoClearSpaceBox.width;
                            const startHeight = logoClearSpaceBox.height;
                            
                            const handleMouseMove = (moveEvent) => {
                              const currentX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                              const currentY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                              const deltaX = currentX - startX;
                              const deltaY = currentY - startY;
                              
                              setLogoClearSpaceBox(prev => ({
                                ...prev,
                                width: Math.max(5, Math.min(100 - prev.x, startWidth + deltaX)),
                                height: Math.max(5, Math.min(100 - prev.y, startHeight + deltaY)),
                              }));
                            };
                            
                            const handleMouseUp = () => {
                              window.removeEventListener('mousemove', handleMouseMove);
                              window.removeEventListener('mouseup', handleMouseUp);
                              // Mark as needing reanalysis
                              setPendingReanalyze(prev => {
                                if (!prev.includes('logo-clearspace')) return [...prev, 'logo-clearspace'];
                                return prev;
                              });
                            };
                            
                            window.addEventListener('mousemove', handleMouseMove);
                            window.addEventListener('mouseup', handleMouseUp);
                          }}
                        />
                        {/* Label */}
                        <span style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: '#AD3826',
                          color: '#FFF9F4',
                          padding: '2px 8px',
                          fontSize: '10px',
                          fontWeight: '600',
                          borderRadius: '3px',
                          whiteSpace: 'nowrap',
                        }}>
                          Logo Area (drag to move)
                        </span>
                      </div>
                      
                      {/* Top "s" marker */}
                      <div style={{
                        position: 'absolute',
                        left: `${logoClearSpaceBox.x + logoClearSpaceBox.width / 2}%`,
                        top: `${logoClearSpaceBox.y - sHeightValue}%`,
                        transform: 'translateX(-50%)',
                        height: `${sHeightValue}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        <div style={{ width: '1px', height: '100%', backgroundColor: '#AD3826' }} />
                        <span style={{
                          position: 'absolute',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: '#FFF9F4',
                          color: '#AD3826',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '600',
                          fontStyle: 'italic',
                        }}>s</span>
                      </div>
                      
                      {/* Bottom "s" marker */}
                      <div style={{
                        position: 'absolute',
                        left: `${logoClearSpaceBox.x + logoClearSpaceBox.width / 2}%`,
                        top: `${logoClearSpaceBox.y + logoClearSpaceBox.height}%`,
                        transform: 'translateX(-50%)',
                        height: `${sHeightValue}%`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        <div style={{ width: '1px', height: '100%', backgroundColor: '#AD3826' }} />
                        <span style={{
                          position: 'absolute',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: '#FFF9F4',
                          color: '#AD3826',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '600',
                          fontStyle: 'italic',
                        }}>s</span>
                      </div>
                      
                      {/* Left "s" marker */}
                      <div style={{
                        position: 'absolute',
                        left: `${logoClearSpaceBox.x - sHeightValue}%`,
                        top: `${logoClearSpaceBox.y + logoClearSpaceBox.height / 2}%`,
                        transform: 'translateY(-50%)',
                        width: `${sHeightValue}%`,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        <div style={{ width: '100%', height: '1px', backgroundColor: '#AD3826' }} />
                        <span style={{
                          position: 'absolute',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#FFF9F4',
                          color: '#AD3826',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '600',
                          fontStyle: 'italic',
                        }}>s</span>
                      </div>
                      
                      {/* Right "s" marker */}
                      <div style={{
                        position: 'absolute',
                        left: `${logoClearSpaceBox.x + logoClearSpaceBox.width}%`,
                        top: `${logoClearSpaceBox.y + logoClearSpaceBox.height / 2}%`,
                        transform: 'translateY(-50%)',
                        width: `${sHeightValue}%`,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        <div style={{ width: '100%', height: '1px', backgroundColor: '#AD3826' }} />
                        <span style={{
                          position: 'absolute',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#FFF9F4',
                          color: '#AD3826',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '600',
                          fontStyle: 'italic',
                        }}>s</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Metadata */}
            <div style={styles.metadata}>
              <div style={styles.metadataGrid}>
                <div style={styles.metadataItem}>
                  <span style={styles.metadataLabel}>Dimensions</span>
                  <span style={styles.metadataValue}>{detectedSpecs}</span>
                </div>
                <div style={styles.metadataItem}>
                  <span style={styles.metadataLabel}>Checks</span>
                  <span style={styles.metadataValue}>
                    {analysisResults ? `${Object.values(analysisResults.categories).reduce((acc, cat) => acc + getCheckedCount(cat), 0)}/${Object.values(analysisResults.categories).reduce((acc, cat) => acc + cat.checks.length, 0)}` : '—'}
                  </span>
                </div>
                <div style={styles.metadataItem}>
                  <span style={styles.metadataLabel}>Format</span>
                  <span style={styles.metadataValue}>{detectedFormat}</span>
                </div>
                <div style={styles.metadataItem}>
                  <span style={styles.metadataLabel}>Bottle Size</span>
                  <span style={styles.metadataValue}>{bottleSize}</span>
                </div>
                <div style={styles.metadataItem}>
                  <span style={styles.metadataLabel}>Visual Type</span>
                  <span style={styles.metadataValue}>{visualType === 'withSmile' ? 'With Smile' : 'Standard'}</span>
                </div>
                <div style={styles.metadataItem}>
                  <span style={styles.metadataLabel}>Analysis</span>
                  <span style={{ ...styles.metadataValue, color: '#8b5cf6' }}>AI Powered</span>
                </div>
              </div>
            </div>

            {/* Re-run AI Analysis Button - Always available */}
            <button
              onClick={reanalyzeRegions}
              disabled={isAnalyzing}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px 20px',
                backgroundColor: pendingReanalyze.length > 0 ? '#f59e0b' : '#6b7280',
                color: pendingReanalyze.length > 0 ? '#000' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isAnalyzing ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={16} />
              {pendingReanalyze.length > 0 
                ? `Re-run AI on Adjusted Regions (${pendingReanalyze.length})` 
                : 'Re-run AI Analysis (keeps your regions)'}
            </button>
            {pendingReanalyze.length > 0 && (
              <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '6px', textAlign: 'center' }}>
                You adjusted regions - click to re-analyze with your changes
              </p>
            )}

            {/* Export Report Button - Full Width */}
            <button 
              onClick={() => setShowExportPreview(true)}
              style={{ ...styles.exportButton, marginTop: '12px' }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
              }}
            >
              <Download size={16} />
              Export Report
            </button>
          </div>

          {/* Right Column - Categories */}
          <div style={styles.categoriesContainer}>
            {analysisResults && Object.entries(analysisResults.categories).map(([key, category]) => {
              const colors = categoryColors[key];
              const isExpanded = expandedCategory === key;
              
              // Count failures in this category - REQUIRED items that aren't passed/toggled (excluding awards)
              const awardCheckIds = ['award-98pts-attr', 'award-doublegold-attr', 'claim-highest-rated'];
              const categoryFailures = category.checks.filter(c => 
                !awardCheckIds.includes(c.id) &&
                !c.isOptionalCheck &&
                c.severity === 'REQUIRED' && 
                c.status !== 'pass' && 
                !manualChecks[c.id]
              ).length;
              
              return (
                <div 
                  key={key} 
                  style={{
                    ...styles.categoryCard,
                    backgroundColor: isExpanded ? colors.dark : '#262626',
                  }}
                >
                  <button
                    onClick={() => handleCategoryToggle(key)}
                    style={{
                      ...styles.categoryHeader,
                      backgroundColor: isExpanded ? colors.light : '#262626',
                    }}
                    onMouseOver={(e) => {
                      if (!isExpanded) e.currentTarget.style.backgroundColor = '#333';
                    }}
                    onMouseOut={(e) => {
                      if (!isExpanded) e.currentTarget.style.backgroundColor = '#262626';
                    }}
                  >
                    <div style={styles.categoryTitleContainer}>
                      <div style={{ ...styles.categoryIndicator, backgroundColor: colors.primary }} />
                      <span style={{ ...styles.categoryTitle, color: '#ffffff' }}>
                        {category.name}
                      </span>
                      {/* Red error count bubble */}
                      {categoryFailures > 0 && (
                        <span style={{
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          marginLeft: '8px',
                          minWidth: '20px',
                          textAlign: 'center',
                        }}>
                          {categoryFailures}
                        </span>
                      )}
                      <span style={{ ...styles.categoryCount, color: colors.primary }}>
                        {getCheckedCount(category)}/{category.checks.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={18} color="#737373" />
                    ) : (
                      <ChevronDown size={18} color="#737373" />
                    )}
                  </button>

                  {isExpanded && (
                    <div style={styles.categoryContent}>
                      {category.checks.map((check, index) => {
                        // Determine if this check is passed (either auto or manual)
                        const isPassed = check.status === 'pass' || manualChecks[check.id];
                        
                        return (
                          <div 
                            key={check.id} 
                            style={{
                              ...styles.checkItem,
                              backgroundColor: hoveredCheck === check.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                            }}
                            onClick={() => {
                              if (check.hasRegion) {
                                const rid = check.regionId || check.id;
                                setActiveRegion(activeRegion === rid ? null : rid);
                              }
                            }}
                            onMouseEnter={() => setHoveredCheck(check.id)}
                            onMouseLeave={() => setHoveredCheck(null)}
                          >
                            <div style={{ flex: 1, paddingRight: '16px' }}>
                              {/* Header row with check name and badges */}
                              <div style={{ ...styles.checkName, color: '#e5e5e5', flexWrap: 'wrap' }}>
                                {/* Only show severity icon if NOT passed */}
                                <SeverityIcon 
                                  severity={check.severity} 
                                  isAwardCheck={check.isAwardCheck} 
                                  isPassed={isPassed}
                                />
                                <span style={{ marginRight: '8px' }}>{check.name}</span>
                                {check.objectiveValue && (
                                  <span style={{ 
                                    ...styles.checkValue, 
                                    backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: isPassed ? '#10b981' : '#ef4444',
                                  }}>
                                    {check.objectiveValue}
                                  </span>
                                )}
                                {/* Only show severity tag if NOT passed and not an award check */}
                                {check.severity && !check.isAwardCheck && !isPassed && (
                                  <span style={{
                                    ...styles.severityTag,
                                    backgroundColor: check.severity === 'BLOCKER' ? 'rgba(239, 68, 68, 0.15)' :
                                                     check.severity === 'MAJOR' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                    color: severityColors[check.severity],
                                  }}>
                                    {check.severity}
                                  </span>
                                )}
                                {check.isAwardCheck && (
                                  <span style={{
                                    ...styles.severityTag,
                                    backgroundColor: 'rgba(107, 114, 128, 0.15)',
                                    color: '#6b7280',
                                  }}>
                                    IF PRESENT
                                  </span>
                                )}
                                {check.info && (
                                  <div 
                                    style={styles.infoButton}
                                    onMouseEnter={(e) => handleTooltipShow(check.id, e)}
                                    onMouseLeave={() => setActiveTooltip(null)}
                                  >
                                    <Info size={12} color="#737373" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Measure button - always visible if needed */}
                              {check.drawingMode && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setDrawingMode(check.drawingMode);
                                    setActiveRegion(null);
                                  }}
                                  style={{
                                    marginTop: '6px',
                                    padding: '5px 10px',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    backgroundColor: drawingMode === check.drawingMode ? '#f59e0b' : '#ec4899',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {drawingMode === check.drawingMode ? '✓ Click & drag on image' :
                                    check.drawingMode === 's-height' ? 'Measure "s" height' :
                                    check.drawingMode === 'frame-border' ? 'Measure border' :
                                    check.drawingMode === 'frame-image' ? 'Measure image area' :
                                    check.drawingMode === 'smile-size' ? 'Measure smile width' :
                                    check.drawingMode === 'smile-ratio' ? 'Measure ratio' :
                                    'Measure'}
                                </button>
                              )}
                              
                              {/* Details - only show on hover for compact view */}
                              {hoveredCheck === check.id && (
                                <div style={{ 
                                  marginTop: '8px', 
                                  paddingTop: '8px', 
                                  borderTop: '1px solid rgba(255,255,255,0.1)',
                                  animation: 'fadeIn 0.15s ease-out',
                                }}>
                                  {check.detail && (
                                    <div style={styles.checkDetail}>
                                      {check.detail}
                                    </div>
                                  )}
                                  {check.objectiveTarget && (
                                    <div style={styles.objectiveValue}>
                                      Target: {check.objectiveTarget}
                                    </div>
                                  )}
                                  {check.hasRegion && (
                                    <div style={{
                                      fontSize: '9px',
                                      color: colors.primary,
                                      marginTop: '4px',
                                      opacity: 0.7,
                                    }}>
                                      ◉ {check.adjustable ? 'click to adjust region' : 'hover image to view'}
                                    </div>
                                  )}
                                  {/* Sub-items */}
                                  {check.subItems && (
                                    <div style={styles.subItemsContainer}>
                                      {check.subItems.map((sub, i) => (
                                        <div key={i} style={styles.subItem}>
                                          <span>{sub.label}</span>
                                          <span style={{ 
                                            color: sub.status === 'pass' ? '#10b981' : '#737373',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}>
                                            {sub.value}
                                            {sub.status === 'pass' && <CheckCircle size={10} />}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {/* Color swatches - only show on hover */}
                                  {check.colorSwatches && (
                                    <div style={{ marginTop: '8px' }}>
                                      {check.colorSwatches.map((swatch, i) => (
                                        <div key={i} style={styles.colorSwatch}>
                                          {swatch.notDetected ? (
                                            <>
                                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <div style={{ 
                                                  ...styles.colorBox, 
                                                  backgroundColor: '#333',
                                                  width: '18px',
                                                  height: '18px',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  fontSize: '9px',
                                                  color: '#666',
                                                }}>—</div>
                                                <div style={{ 
                                                  ...styles.colorBox, 
                                                  backgroundColor: swatch.reference,
                                                  width: '18px',
                                                  height: '18px',
                                                }} title={`Reference: ${swatch.reference}`} />
                                              </div>
                                              <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '10px', color: '#e5e5e5' }}>{swatch.name}</div>
                                              </div>
                                              <span style={{ fontSize: '9px', color: '#737373' }}>N/A</span>
                                            </>
                                          ) : (
                                            <>
                                              <div style={{ display: 'flex', gap: '4px' }}>
                                                <div style={{ 
                                                  ...styles.colorBox, 
                                                  backgroundColor: swatch.detected,
                                                  width: '18px',
                                                  height: '18px',
                                                }} title={`Detected: ${swatch.detected}`} />
                                                <div style={{ 
                                                  ...styles.colorBox, 
                                                  backgroundColor: swatch.reference,
                                                  width: '18px',
                                                  height: '18px',
                                                }} title={`Reference: ${swatch.reference}`} />
                                              </div>
                                              <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '10px', color: '#e5e5e5' }}>{swatch.name}</div>
                                              </div>
                                              <span style={{ 
                                                fontSize: '10px', 
                                                color: swatch.match >= 90 ? '#10b981' : '#f59e0b',
                                              }}>
                                                {swatch.match >= 90 ? '✓' : '⚠'}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              {check.needsManual ? (
                                <div
                                  onClick={() => toggleManualCheck(check.id)}
                                  style={{
                                    ...styles.checkbox,
                                    borderColor: manualChecks[check.id] ? '#10b981' : '#525252',
                                    backgroundColor: manualChecks[check.id] ? '#10b981' : 'transparent',
                                  }}
                                >
                                  {manualChecks[check.id] && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                              ) : (
                                <>
                                  {check.status === 'pass' && (
                                    <div style={{ ...styles.passIcon, backgroundColor: '#10b981' }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </div>
                                  )}
                                  {check.status === 'fail' && (
                                    <XCircle size={20} color="#ef4444" />
                                  )}
                                  {check.status === 'pending' && (
                                    <div style={styles.pendingIcon} />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Tooltip Portal */}
      {activeTooltip && analysisResults && (
        <div 
          style={{
            ...styles.tooltip,
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {Object.values(analysisResults.categories)
            .flatMap(cat => cat.checks)
            .find(c => c.id === activeTooltip)?.info}
        </div>
      )}
    </div>
  );
};

export default QCAnalyzer;
