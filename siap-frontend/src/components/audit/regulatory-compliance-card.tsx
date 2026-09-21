interface RegulatoryComplianceCardProps {
  genderCompliant: boolean
  genderVariablePresent: boolean
  note: string
}

export function RegulatoryComplianceCard({
  genderCompliant, genderVariablePresent, note
}: RegulatoryComplianceCardProps) {
  return (
    <div className="border rounded-xl p-6 bg-white">
      <h3 className="font-semibold text-gray-900 mb-4">Conformité Réglementaire</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <span className={genderCompliant ? 'text-green-600' : 'text-red-600'}>
            {genderCompliant ? '✅' : '❌'}
          </span>
          <div>
            <p className="text-sm font-medium">Directive Gender 2012/EU</p>
            <p className="text-xs text-gray-500">
              {genderVariablePresent
                ? 'Variable de genre présente — vérification requise'
                : 'Aucune variable de genre — conformité de facto'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-600">✅</span>
          <div>
            <p className="text-sm font-medium">RGPD</p>
            <p className="text-xs text-gray-500">Aucune donnée sensible collectée</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-blue-600">📋</span>
          <div>
            <p className="text-sm font-medium">IA Act (UE)</p>
            <p className="text-xs text-gray-500">Traçabilité et explicabilité assurées par cet audit</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4 italic">{note}</p>
    </div>
  )
}
