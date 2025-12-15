import { useState, useEffect } from 'react';
import { securityAPI } from '../services/api';
import { Shield, AlertTriangle, Lock, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';

const SecurityAnalysisTab = ({ securityData, loadingSecurity, setSecurityData, setLoadingSecurity }) => {
  const [bruteForceResult, setBruteForceResult] = useState(null);
  const [runningBruteForce, setRunningBruteForce] = useState(false);

  const runBruteForceSimulation = async (method) => {
    setRunningBruteForce(true);
    try {
      const response = await securityAPI.bruteForceSimulation({ method, attempts: 1000 });
      setBruteForceResult(response.data);
      toast.success(`Brute force simulation completed for ${method}`);
    } catch (error) {
      toast.error('Failed to run brute force simulation');
      console.error(error);
    } finally {
      setRunningBruteForce(false);
    }
  };

  if (loadingSecurity) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data security analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!securityData) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-center py-8">Data belum dimuat. Klik tab ini untuk memuat data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score */}
      {securityData.securityScore && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Score Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Score:</span>
                  <span className="text-white font-medium text-xl">{securityData.securityScore.password.overall}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <span className={`font-medium ${securityData.securityScore.password.rating === 'Excellent' ? 'text-green-400' : securityData.securityScore.password.rating === 'Good' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {securityData.securityScore.password.rating}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Brute Force Resistance:</span>
                    <span className="text-white">{securityData.securityScore.password.bruteForceResistance}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phishing Resistance:</span>
                    <span className="text-white">{securityData.securityScore.password.phishingResistance}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Credential Theft Resistance:</span>
                    <span className="text-white">{securityData.securityScore.password.credentialTheftResistance}/100</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Score:</span>
                  <span className="text-white font-medium text-xl">{securityData.securityScore.webauthn.overall}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <span className={`font-medium ${securityData.securityScore.webauthn.rating === 'Excellent' ? 'text-green-400' : securityData.securityScore.webauthn.rating === 'Good' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {securityData.securityScore.webauthn.rating}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Brute Force Resistance:</span>
                    <span className="text-white">{securityData.securityScore.webauthn.bruteForceResistance}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phishing Resistance:</span>
                    <span className="text-white">{securityData.securityScore.webauthn.phishingResistance}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Credential Theft Resistance:</span>
                    <span className="text-white">{securityData.securityScore.webauthn.credentialTheftResistance}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Kesimpulan:</p>
            <p className="text-sm text-gray-300">{securityData.securityScore.comparison.conclusion}</p>
            <p className="text-sm text-green-400 mt-2">
              WebAuthn memiliki {securityData.securityScore.comparison.difference} poin lebih tinggi ({securityData.securityScore.comparison.improvement}% improvement)
            </p>
          </div>
        </div>
      )}

      {/* Brute Force Simulation */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Brute Force Attack Simulation
        </h3>
        <p className="text-sm text-gray-400 mb-4">Simulasi serangan brute force untuk mengukur resistance terhadap serangan</p>
        <div className="flex gap-3 mb-6">
          <button onClick={() => runBruteForceSimulation('password')} disabled={runningBruteForce} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all disabled:opacity-50">
            {runningBruteForce ? 'Running...' : 'Test Password'}
          </button>
          <button onClick={() => runBruteForceSimulation('webauthn')} disabled={runningBruteForce} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-all disabled:opacity-50">
            {runningBruteForce ? 'Running...' : 'Test WebAuthn'}
          </button>
        </div>
        {bruteForceResult && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Method: {bruteForceResult.method}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${bruteForceResult.resistance === 'Very High' || bruteForceResult.resistance === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {bruteForceResult.resistance} Resistance
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{bruteForceResult.vulnerability}</p>
              {bruteForceResult.explanation && <p className="text-xs text-gray-500">{bruteForceResult.explanation}</p>}
              {bruteForceResult.estimatedTimeForFullBruteForce !== 'N/A' && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-xs text-gray-400">
                    Estimated time for full brute force:{' '}
                    <span className="text-white font-medium">
                      {bruteForceResult.estimatedTimeForFullBruteForce} {bruteForceResult.estimatedTimeForFullBruteForceUnit}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phishing Resistance */}
      {securityData.phishing && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Phishing Resistance Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-300">Vulnerability: {securityData.phishing.comparison.password.vulnerability}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Score: {securityData.phishing.comparison.password.score}/10</span>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Reasons:</p>
                  <ul className="space-y-1 text-xs text-gray-300">
                    {securityData.phishing.comparison.password.reasons.slice(0, 3).map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Vulnerability: {securityData.phishing.comparison.webauthn.vulnerability}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Score: {securityData.phishing.comparison.webauthn.score}/10</span>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Reasons:</p>
                  <ul className="space-y-1 text-xs text-gray-300">
                    {securityData.phishing.comparison.webauthn.reasons.slice(0, 3).map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Kesimpulan:</p>
            <p className="text-sm text-gray-300">{securityData.phishing.conclusion.advantage}</p>
            <p className="text-sm text-green-400 mt-2">Winner: {securityData.phishing.conclusion.winner === 'webauthn' ? 'WebAuthn' : 'Password'}</p>
          </div>
        </div>
      )}

      {/* Vulnerability Assessment */}
      {securityData.vulnerability && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4">Vulnerability Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Score:</span>
                  <span className="text-white font-medium">{securityData.vulnerability.password.overallScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Level:</span>
                  <span className={`font-medium ${securityData.vulnerability.password.riskLevel === 'High' ? 'text-red-400' : securityData.vulnerability.password.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {securityData.vulnerability.password.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Suspicious IPs:</span>
                  <span className="text-white font-medium">{securityData.vulnerability.password.suspiciousIPs}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Vulnerabilities:</p>
                <div className="space-y-2">
                  {securityData.vulnerability.password.vulnerabilities.slice(0, 3).map((vuln, idx) => (
                    <div key={idx} className="p-2 bg-gray-900 rounded text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium">{vuln.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${vuln.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{vuln.severity}</span>
                      </div>
                      <p className="text-gray-400">{vuln.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Score:</span>
                  <span className="text-white font-medium">{securityData.vulnerability.webauthn.overallScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Level:</span>
                  <span className={`font-medium ${securityData.vulnerability.webauthn.riskLevel === 'High' ? 'text-red-400' : securityData.vulnerability.webauthn.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {securityData.vulnerability.webauthn.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Suspicious IPs:</span>
                  <span className="text-white font-medium">{securityData.vulnerability.webauthn.suspiciousIPs}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Vulnerabilities:</p>
                <div className="space-y-2">
                  {securityData.vulnerability.webauthn.vulnerabilities.slice(0, 3).map((vuln, idx) => (
                    <div key={idx} className="p-2 bg-gray-900 rounded text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium">{vuln.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${vuln.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{vuln.severity}</span>
                      </div>
                      <p className="text-gray-400">{vuln.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Perbandingan:</p>
            <p className="text-sm text-gray-300">WebAuthn memiliki vulnerability score {securityData.vulnerability.comparison.difference} poin lebih rendah (lebih aman)</p>
          </div>
        </div>
      )}

      {/* Attack Surface Analysis */}
      {securityData.attackSurface && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4">Attack Surface Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Attack Vectors:</span>
                  <span className="text-white font-medium">{securityData.attackSurface.password.totalVectors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">High Risk Vectors:</span>
                  <span className="text-red-400 font-medium">{securityData.attackSurface.password.highRiskVectors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Low Difficulty Vectors:</span>
                  <span className="text-yellow-400 font-medium">{securityData.attackSurface.password.lowDifficultyVectors}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Attack Vectors:</span>
                  <span className="text-white font-medium">{securityData.attackSurface.webauthn.totalVectors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">High Risk Vectors:</span>
                  <span className="text-red-400 font-medium">{securityData.attackSurface.webauthn.highRiskVectors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Low Difficulty Vectors:</span>
                  <span className="text-yellow-400 font-medium">{securityData.attackSurface.webauthn.lowDifficultyVectors}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Kesimpulan:</p>
            <p className="text-sm text-gray-300">{securityData.attackSurface.comparison.conclusion}</p>
            <p className="text-sm text-green-400 mt-2">WebAuthn mengurangi attack surface sebesar {securityData.attackSurface.comparison.reduction}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAnalysisTab;
