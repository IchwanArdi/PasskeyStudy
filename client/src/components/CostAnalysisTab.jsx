import { DollarSign, TrendingUp, TrendingDown, Calculator, BarChart3 } from 'lucide-react';

const CostAnalysisTab = ({ costData, loadingCost, setCostData, setLoadingCost }) => {
  if (loadingCost) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data cost analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!costData) {
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
      {/* Implementation Cost */}
      {costData.implementation && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Implementation Cost
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Backend:</span>
                  <span className="text-white font-medium">{costData.implementation.password.development.backend} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frontend:</span>
                  <span className="text-white font-medium">{costData.implementation.password.development.frontend} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Testing:</span>
                  <span className="text-white font-medium">{costData.implementation.password.development.testing} hours</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white font-medium text-lg">{costData.implementation.password.development.total} hours</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-gray-400">Complexity: {costData.implementation.password.complexity}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Backend:</span>
                  <span className="text-white font-medium">{costData.implementation.webauthn.development.backend} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frontend:</span>
                  <span className="text-white font-medium">{costData.implementation.webauthn.development.frontend} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Testing:</span>
                  <span className="text-white font-medium">{costData.implementation.webauthn.development.testing} hours</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white font-medium text-lg">{costData.implementation.webauthn.development.total} hours</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-gray-400">Complexity: {costData.implementation.webauthn.complexity}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Perbandingan:</p>
            <p className="text-sm text-gray-300">{costData.implementation.comparison.conclusion}</p>
          </div>
        </div>
      )}

      {/* Operational Cost */}
      {costData.operational && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Operational Cost
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Support Tickets:</span>
                  <span className="text-white font-medium">{costData.operational.password.supportTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Resolution Time:</span>
                  <span className="text-white font-medium">{costData.operational.password.avgResolutionTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Support Time:</span>
                  <span className="text-white font-medium">{costData.operational.password.totalSupportTime} min</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Estimated Cost:</span>
                  <span className="text-white font-medium text-lg">${costData.operational.password.estimatedCost}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Support Tickets:</span>
                  <span className="text-white font-medium">{costData.operational.webauthn.supportTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Resolution Time:</span>
                  <span className="text-white font-medium">{costData.operational.webauthn.avgResolutionTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Support Time:</span>
                  <span className="text-white font-medium">{costData.operational.webauthn.totalSupportTime} min</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Estimated Cost:</span>
                  <span className="text-white font-medium text-lg">${costData.operational.webauthn.estimatedCost}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Perbandingan:</p>
            <p className="text-sm text-gray-300">{costData.operational.comparison.conclusion}</p>
            <p className="text-sm text-green-400 mt-2">
              Cost savings: ${costData.operational.comparison.costSavings} ({costData.operational.comparison.supportReduction}% reduction in support tickets)
            </p>
          </div>
        </div>
      )}

      {/* ROI Analysis */}
      {costData.roi && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ROI (Return on Investment) Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-300">Costs</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Password Implementation:</span>
                  <span className="text-white font-medium">${costData.roi.costs.password.implementation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Password Operational:</span>
                  <span className="text-white font-medium">${costData.roi.costs.password.operational}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Password Total:</span>
                  <span className="text-white font-medium">${costData.roi.costs.password.total}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-300">Benefits</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Support Savings:</span>
                  <span className="text-green-400 font-medium">${costData.roi.benefits.supportSavings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Security Savings:</span>
                  <span className="text-green-400 font-medium">${costData.roi.benefits.securitySavings}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Total Benefits:</span>
                  <span className="text-green-400 font-medium text-lg">${costData.roi.benefits.total}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Investment</span>
                <span className="text-lg font-semibold text-white">${costData.roi.roi.investment}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Return</span>
                <span className="text-lg font-semibold text-green-400">${costData.roi.roi.return}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">ROI</span>
                <span className={`text-lg font-semibold ${costData.roi.roi.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {costData.roi.roi.roi > 0 ? '+' : ''}
                  {costData.roi.roi.roi}%
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">Payback Period</span>
                <span className="text-lg font-semibold text-white">
                  {costData.roi.roi.paybackPeriod} {costData.roi.roi.paybackPeriodUnit}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-300">{costData.roi.roi.interpretation}</p>
          </div>
        </div>
      )}

      {/* Cost Comparison */}
      {costData.comparison && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Total Cost Comparison (3 Years)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-red-400">Password</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Implementation:</span>
                  <span className="text-white font-medium">${costData.comparison.password.implementation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual:</span>
                  <span className="text-white font-medium">${costData.comparison.password.annual}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">3-Year Total:</span>
                  <span className="text-white font-medium text-lg">${costData.comparison.password.threeYear}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Implementation:</span>
                  <span className="text-white font-medium">${costData.comparison.webauthn.implementation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual:</span>
                  <span className="text-white font-medium">${costData.comparison.webauthn.annual}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">3-Year Total:</span>
                  <span className="text-white font-medium text-lg">${costData.comparison.webauthn.threeYear}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Kesimpulan:</p>
            <p className="text-sm text-gray-300">{costData.comparison.comparison.conclusion}</p>
            {costData.comparison.comparison.breakEvenPoint && (
              <p className="text-sm text-green-400 mt-2">
                Break-even point: {costData.comparison.comparison.breakEvenPoint} {costData.comparison.comparison.breakEvenUnit}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CostAnalysisTab;
