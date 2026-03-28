export function parseDurationMins(iso: string): number {
  if (!iso) return 0
  const h = iso.match(/(\d+)H/)?.[1] || '0'
  const m = iso.match(/(\d+)M/)?.[1] || '0'
  return parseInt(h) * 60 + parseInt(m)
}

export function mapOffer(offer: any) {
  if (!offer || typeof offer !== 'object') {
    return { id: '', total_amount: '0', total_currency: 'EUR', tax_amount: '0', base_amount: '0', expires_at: '', cabin_class: '', passengers: [], slices: [] }
  }
  return {
    id: offer.id || '',
    total_amount: offer.total_amount || '0',
    total_currency: offer.total_currency || 'EUR',
    tax_amount: offer.tax_amount || '0',
    base_amount: offer.base_amount || offer.total_amount,
    expires_at: offer.expires_at,
    cabin_class: offer.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class || offer.cabin_class || '',
    passengers: offer.passengers || [],
    slices: (offer.slices || []).map((slice: any) => {
      const segs = slice.segments || []
      return {
        id: slice.id,
        origin: {
          iata_code: slice.origin?.iata_code,
          name: slice.origin?.name,
          city_name: slice.origin?.city?.name || slice.origin?.city_name || slice.origin?.name,
        },
        destination: {
          iata_code: slice.destination?.iata_code,
          name: slice.destination?.name,
          city_name: slice.destination?.city?.name || slice.destination?.city_name || slice.destination?.name,
        },
        departing_at: slice.departing_at || segs[0]?.departing_at,
        arriving_at: slice.arriving_at || segs[segs.length - 1]?.arriving_at,
        duration: slice.duration,
        duration_minutes: parseDurationMins(slice.duration || ''),
        stops: Math.max(0, segs.length - 1),
        segments: segs.map((seg: any) => ({
          id: seg.id,
          departing_at: seg.departing_at,
          arriving_at: seg.arriving_at,
          origin: { iata_code: seg.origin?.iata_code, name: seg.origin?.name, city_name: seg.origin?.city?.name || seg.origin?.city_name },
          destination: { iata_code: seg.destination?.iata_code, name: seg.destination?.name, city_name: seg.destination?.city?.name || seg.destination?.city_name },
          carrier_name: seg.marketing_carrier?.name || seg.operating_carrier?.name || '',
          carrier_iata: seg.marketing_carrier?.iata_code || seg.operating_carrier?.iata_code || '',
          flight_number: `${seg.marketing_carrier?.iata_code || ''}${seg.marketing_carrier_flight_number || ''}`,
          duration: parseDurationMins(seg.duration || ''),
          aircraft: seg.aircraft ? { name: seg.aircraft.name, iata_code: seg.aircraft.iata_code } : null,
        })),
      }
    }),
  }
}
