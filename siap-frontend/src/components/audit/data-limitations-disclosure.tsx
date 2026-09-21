interface DataLimitationsProps {
  note: string
  zeroVarianceRegions: string[]
  coincidenceNote: string
}

export function DataLimitationsDisclosure({
  note, zeroVarianceRegions, coincidenceNote
}: DataLimitationsProps) {
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">
      <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
        <span>ⓘ</span> Limites de cet audit (transparence méthodologique)
      </h3>
      <p className="text-sm text-blue-800 mb-2">{note}</p>
      {zeroVarianceRegions.length > 0 && (
        <p className="text-xs text-blue-700">
          Région(s) non testable(s) empiriquement sur ce split de données :{' '}
          {zeroVarianceRegions.join(', ')}
        </p>
      )}
      <p className="text-xs text-blue-700 mt-2">{coincidenceNote}</p>
    </div>
  )
}
