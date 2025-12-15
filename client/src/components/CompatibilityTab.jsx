import { Smartphone, Globe, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const CompatibilityTab = ({ compatibilityData, loadingCompatibility, setCompatibilityData, setLoadingCompatibility }) => {
  if (loadingCompatibility) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data compatibility analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!compatibilityData) {
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
      {/* Browser Compatibility */}
      {compatibilityData.browser && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Browser Compatibility Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Compatibility:</span>
                  <span className="text-green-400 font-medium">{compatibilityData.browser.password.compatibility}%</span>
                </div>
                <div className="mt-4 space-y-2">
                  {Object.entries(compatibilityData.browser.password.browsers).map(([browser, info]) => (
                    <div key={browser} className="flex items-center justify-between p-2 bg-gray-900 rounded">
                      <span className="text-gray-300 text-sm">{browser}</span>
                      <div className="flex items-center gap-2">
                        {info.support === 'Full' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                        <span className={`text-xs ${info.support === 'Full' ? 'text-green-400' : 'text-red-400'}`}>{info.support}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Compatibility:</span>
                  <span className="text-green-400 font-medium">{compatibilityData.browser.webauthn.compatibility}%</span>
                </div>
                <div className="mt-4 space-y-2">
                  {Object.entries(compatibilityData.browser.webauthn.browsers).map(([browser, info]) => (
                    <div key={browser} className="flex items-center justify-between p-2 bg-gray-900 rounded">
                      <span className="text-gray-300 text-sm">{browser}</span>
                      <div className="flex items-center gap-2">
                        {info.support === 'Full' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                        <span className={`text-xs ${info.support === 'Full' ? 'text-green-400' : 'text-red-400'}`}>{info.support}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Perbandingan:</p>
            <p className="text-sm text-gray-300">{compatibilityData.browser.comparison.conclusion}</p>
          </div>
        </div>
      )}

      {/* Device Support */}
      {compatibilityData.device && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Compatibility
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Compatibility:</span>
                  <span className="text-green-400 font-medium">{compatibilityData.device.password.compatibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Requirements:</span>
                  <span className="text-white font-medium">{compatibilityData.device.password.requirements}</span>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Device Usage:</p>
                  <div className="space-y-1">
                    {Object.entries(compatibilityData.device.password.devices || {}).map(([device, count]) => (
                      <div key={device} className="flex justify-between text-xs">
                        <span className="text-gray-300">{device}:</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Platform Support:</p>
                  <div className="space-y-1">
                    {Object.entries(compatibilityData.device.password.platforms || {}).map(([platform, info]) => (
                      <div key={platform} className="flex items-center justify-between text-xs p-1.5 bg-gray-900 rounded">
                        <span className="text-gray-300">{platform}</span>
                        <span className={`text-xs ${info.support === 'Full' ? 'text-green-400' : 'text-yellow-400'}`}>{info.support}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Compatibility:</span>
                  <span className="text-yellow-400 font-medium">{compatibilityData.device.webauthn.compatibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Requirements:</span>
                  <span className="text-white font-medium">{compatibilityData.device.webauthn.requirements}</span>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Device Usage:</p>
                  <div className="space-y-1">
                    {Object.entries(compatibilityData.device.webauthn.devices || {}).map(([device, count]) => (
                      <div key={device} className="flex justify-between text-xs">
                        <span className="text-gray-300">{device}:</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Platform Support:</p>
                  <div className="space-y-1">
                    {Object.entries(compatibilityData.device.webauthn.platforms || {}).map(([platform, info]) => (
                      <div key={platform} className="flex items-center justify-between text-xs p-1.5 bg-gray-900 rounded">
                        <span className="text-gray-300">{platform}</span>
                        <span className={`text-xs ${info.support === 'Full' ? 'text-green-400' : info.support === 'Partial' ? 'text-yellow-400' : 'text-red-400'}`}>{info.support}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Kesimpulan:</p>
            <p className="text-sm text-gray-300">{compatibilityData.device.comparison.conclusion}</p>
          </div>
        </div>
      )}

      {/* Accessibility */}
      {compatibilityData.accessibility && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Accessibility Analysis (WCAG Compliance)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Score:</span>
                  <span className="text-white font-medium text-xl">{compatibilityData.accessibility.password.overall}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WCAG Level:</span>
                  <span className={`font-medium ${compatibilityData.accessibility.password.wcagLevel === 'AAA' ? 'text-green-400' : compatibilityData.accessibility.password.wcagLevel === 'AA' ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {compatibilityData.accessibility.password.wcagLevel}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Keyboard Navigation:</span>
                    <span className="text-white">{compatibilityData.accessibility.password.keyboardNavigation.score}/10</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Screen Reader:</span>
                    <span className="text-white">{compatibilityData.accessibility.password.screenReader.score}/10</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Visual Impairment:</span>
                    <span className="text-white">{compatibilityData.accessibility.password.visualImpairment.score}/10</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Motor Impairment:</span>
                    <span className="text-white">{compatibilityData.accessibility.password.motorImpairment.score}/10</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Cognitive Impairment:</span>
                    <span className="text-white">{compatibilityData.accessibility.password.cognitiveImpairment.score}/10</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Score:</span>
                  <span className="text-white font-medium text-xl">{compatibilityData.accessibility.webauthn.overall}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WCAG Level:</span>
                  <span className={`font-medium ${compatibilityData.accessibility.webauthn.wcagLevel === 'AAA' ? 'text-green-400' : compatibilityData.accessibility.webauthn.wcagLevel === 'AA' ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {compatibilityData.accessibility.webauthn.wcagLevel}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Keyboard Navigation:</span>
                    <span className="text-white">{compatibilityData.accessibility.webauthn.keyboardNavigation.score}/10</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Screen Reader:</span>
                    <span className="text-white">{compatibilityData.accessibility.webauthn.screenReader.score}/10</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Visual Impairment:</span>
                    <span className="text-white">{compatibilityData.accessibility.webauthn.visualImpairment.score}/10</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Motor Impairment:</span>
                    <span className="text-white">{compatibilityData.accessibility.webauthn.motorImpairment.score}/10</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Cognitive Impairment:</span>
                    <span className="text-white">{compatibilityData.accessibility.webauthn.cognitiveImpairment.score}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Perbandingan:</p>
            <p className="text-sm text-gray-300">{compatibilityData.accessibility.comparison.conclusion}</p>
            <p className={`text-sm mt-2 ${compatibilityData.accessibility.comparison.difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
              WebAuthn memiliki accessibility score {compatibilityData.accessibility.comparison.difference > 0 ? '+' : ''}
              {compatibilityData.accessibility.comparison.difference} poin dibanding Password
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompatibilityTab;
