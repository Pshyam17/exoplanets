'use client';

// app/the-science/page.tsx

export default function TheSciencePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">The Science Behind Exoplanet Discovery</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Overview</h2>
        <p className="mb-4 text-gray-200">
          We built an end-to-end exoplanet discovery and vetting pipeline that ingests Kepler/TESS catalog tables, 
          normalizes transit signals using stellar parameters, runs a machine-learned classifier to flag promising 
          planet candidates, cross-validates detections against confirmed-planet catalogs and false-positive 
          probability (FPP) tables, and exposes everything through an interactive web portal for exploration, 
          inspection, and manual vetting.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">How It Works</h2>
        
        <div className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-300">1. Catalog Ingestion & Cross-matching</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-200">
              <li>Import multiple public tables (stellar parameters, KOI/TCE/TOI lists, confirmed planet tables, KOI FPPs)</li>
              <li>Cross-match by star identifiers (Kepler ID / TOI / coordinates) to build unified per-target records</li>
              <li>Combine light-curve summary metrics with stellar context for comprehensive analysis</li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-300">2. Preprocessing & Feature Engineering</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-200">
              <li>Normalize transit depth and durations by stellar radius/mass/temperature for physical comparability</li>
              <li>Construct features from KOI/TCE metadata (period, duration, SNR, MES, transit depth)</li>
              <li>Include stellar parameters (radius, log g, Teff) and vetting columns (disposition flags, FPP)</li>
              <li>Handle missing data with domain-aware imputation and robust scaling</li>
              <li>Address class imbalance through class weighting and resampling techniques</li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-300">3. Machine Learning Model</h3>
            <div className="mb-4">
              <p className="font-medium text-gray-200">Architecture:</p>
              <code className="bg-gray-700 text-green-300 px-3 py-2 rounded text-sm block mt-2">
                Input → Dense(64, relu) → Dropout(0.3) → Dense(32, relu) → Dropout(0.3) → Dense(16, relu) → Dense(1, sigmoid)
              </code>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-gray-200">
              <li>Feedforward neural network for binary classification (planet / non-planet)</li>
              <li>Adam optimizer with binary cross-entropy loss</li>
              <li>Validation monitoring with accuracy, precision, and recall metrics</li>
            </ul>
            <div className="mt-4 p-4 bg-green-900 border border-green-700 rounded">
              <p className="font-semibold text-green-300">Performance Metrics:</p>
              <ul className="text-sm space-y-1 text-gray-200 mt-2">
                <li><strong>Overall Accuracy:</strong> 0.83</li>
                <li><strong>Class 1 (Planet):</strong> Precision 0.84, Recall 0.97, F1 0.90</li>
                <li><strong>Class 0 (Non-planet):</strong> Precision 0.71, Recall 0.30, F1 0.42</li>
                <li><strong>Support:</strong> 518 planets, 140 non-planets</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-300">4. Post-processing and Vetting</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-200">
              <li>Combine classifier scores with KOI FPP thresholds</li>
              <li>Cross-check against confirmed exoplanet tables to reduce false positives</li>
              <li>Produce ranked candidate lists for human inspection</li>
              <li>Provide phase-folded light-curve visualizations and disposition histories</li>
            </ul>
          </div>

          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-300">5. Frontend & User Experience</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-200">
              <li>Interactive UI for star selection and candidate visualization</li>
              <li>Live classifier execution with real-time results</li>
              <li>Cross-match and FPP data display</li>
              <li>Guided vetting checklist workflow</li>
              <li>"Hyperdrive" visualization for immersive target exploration</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Datasets Used</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-900 border border-blue-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-3 text-blue-300">Kepler Data</h3>
            <ul className="text-sm space-y-2 text-gray-200">
              <li>• Kepler Stellar Parameters</li>
              <li>• KOI (Kepler Object of Interest) catalogs</li>
              <li>• TCE (Threshold Crossing Event) data</li>
              <li>• Q1-Q17 DR25 KOI FPP tables</li>
            </ul>
          </div>
          <div className="bg-green-900 border border-green-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-3 text-green-300">TESS Data</h3>
            <ul className="text-sm space-y-2 text-gray-200">
              <li>• TOI (TESS Object of Interest) catalogs</li>
              <li>• Stellar host parameters</li>
              <li>• Confirmed planet cross-references</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Technical Implementation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">Backend Technologies</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>• <strong>Python:</strong> pandas, numpy, scikit-learn</li>
              <li>• <strong>ML Framework:</strong> TensorFlow/Keras</li>
              <li>• <strong>Astronomy:</strong> AstroPy for coordinate matching</li>
              <li>• <strong>API:</strong> FastAPI/Flask REST endpoints</li>
              <li>• <strong>Visualization:</strong> matplotlib/Plotly</li>
            </ul>
          </div>
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">Frontend & Deployment</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>• <strong>Framework:</strong> React/Next.js</li>
              <li>• <strong>Containerization:</strong> Docker</li>
              <li>• <strong>Cloud:</strong> Vercel deployment</li>
              <li>• <strong>Hardware:</strong> GPU-enabled training, CPU inference</li>
              <li>• <strong>CI/CD:</strong> Automated reproducible builds</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Key Innovations</h2>
        <div className="space-y-4">
          <div className="bg-yellow-900 border border-yellow-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-3 text-yellow-300">Physics-Aware Machine Learning</h3>
            <p className="text-sm text-gray-200">
              Normalize transit observables by stellar parameters so the model learns physically meaningful 
              relationships (transit depth ∝ (Rp/Rs)²) rather than treating data purely statistically.
            </p>
          </div>
          <div className="bg-purple-900 border border-purple-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-3 text-purple-300">Hybrid Vetting Approach</h3>
            <p className="text-sm text-gray-200">
              Combine ML confidence scores with astrophysical flags (FPP, confirmed hosts) to reduce 
              spurious claims and ensure scientifically defensible outputs.
            </p>
          </div>
          <div className="bg-pink-900 border border-pink-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-3 text-pink-300">Public Engagement</h3>
            <p className="text-sm text-gray-200">
              Merge serious vetting tools with pedagogical, immersive visuals (hyperdrive) to broaden 
              engagement beyond the research community.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Impact & Benefits</h2>
        <ul className="list-disc pl-6 space-y-3 text-gray-200">
          <li><strong>Accelerated Candidate Triage:</strong> Reduces hours of manual cross-matching by pre-ranking promising candidates</li>
          <li><strong>Improved Reproducibility:</strong> Standardizes normalization and vetting steps for consistent, auditable results</li>
          <li><strong>Educational Outreach:</strong> Makes catalog science accessible to students and citizen scientists</li>
          <li><strong>Scientific Value:</strong> Surfaces robust, previously overlooked candidates for follow-up observations</li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Considerations & Limitations</h2>
        <div className="space-y-4">
          <div className="bg-red-900 border border-red-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-3 text-red-300">Current Limitations</h3>
            <ul className="text-sm space-y-2 text-gray-200">
              <li>• Model favors high recall for planets but has low specificity for non-planets</li>
              <li>• Many astrophysical false positives still present</li>
              <li>• Limited to transit-based detection methods</li>
            </ul>
          </div>
          <div className="bg-blue-900 border border-blue-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-3 text-blue-300">Next Steps</h3>
            <ul className="text-sm space-y-2 text-gray-200">
              <li>• Threshold calibration and ensemble methods (tree + NN)</li>
              <li>• Explicit light-curve CNNs on phase-folded data</li>
              <li>• Transfer learning with TESS light curves</li>
              <li>• Tighter integration with follow-up scheduling pipelines</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-400 mt-8">
        <p>
          This pipeline represents a comprehensive approach to exoplanet discovery, combining 
          machine learning with astrophysical expertise to accelerate the search for worlds beyond our solar system.
        </p>
      </div>
      </div>
    </div>
  );
}
