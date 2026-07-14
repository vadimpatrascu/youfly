/**
 * Duffel seat map helpers.
 * A seat map (GET /air/seat_maps?offer_id=...) is returned per segment. Each
 * `seat` element carries `available_services` PER PASSENGER — a seat is bookable
 * for a passenger only if a service exists for their passenger_id. The service
 * `id` (ase_...) is what gets added to the order's `services` array.
 */

export interface SimpleSeatService { serviceId: string; amount: string; currency: string }
export interface SimpleElement {
  type: string
  designator?: string
  disclosures?: string[]
  /** passengerId -> bookable service (present only for available seats) */
  services?: Record<string, SimpleSeatService>
}
export interface SimpleRow { label: string | null; sections: SimpleElement[][] }
export interface SimpleSegmentMap {
  segmentId: string
  sliceId: string
  origin: string
  destination: string
  cabinClass: string
  aisles: number
  rows: SimpleRow[]
}

/** Map raw Duffel seat maps into a compact, render-ready shape. */
export function mapSeatMaps(maps: any[], offer: any): SimpleSegmentMap[] {
  const segInfo: Record<string, { origin: string; destination: string; sliceId: string }> = {}
  for (const slice of offer?.slices || []) {
    for (const seg of slice.segments || []) {
      segInfo[seg.id] = {
        origin: seg.origin?.iata_code || '',
        destination: seg.destination?.iata_code || '',
        sliceId: slice.id,
      }
    }
  }

  return (maps || []).map((m: any): SimpleSegmentMap => {
    const cabin = (m.cabins || [])[0] || {}
    const rows: SimpleRow[] = (cabin.rows || []).map((row: any): SimpleRow => {
      const sections: SimpleElement[][] = (row.sections || []).map((sec: any) =>
        (sec.elements || []).map((el: any): SimpleElement => {
          const out: SimpleElement = { type: el.type }
          if (el.designator) out.designator = el.designator
          if (el.disclosures?.length) out.disclosures = el.disclosures
          if (el.type === 'seat') {
            const services: Record<string, SimpleSeatService> = {}
            for (const svc of el.available_services || []) {
              if (svc?.id && svc.passenger_id) {
                services[svc.passenger_id] = {
                  serviceId: svc.id,
                  amount: svc.total_amount || '0',
                  currency: svc.total_currency || offer?.total_currency || 'EUR',
                }
              }
            }
            out.services = services
          }
          return out
        })
      )
      const firstSeat = sections.flat().find((e) => e.designator)
      const label = firstSeat ? (firstSeat.designator!.match(/^\d+/)?.[0] || null) : null
      return { label, sections }
    })

    const info = segInfo[m.segment_id] || { origin: '', destination: '' }
    return {
      segmentId: m.segment_id,
      sliceId: m.slice_id,
      origin: info.origin,
      destination: info.destination,
      cabinClass: cabin.cabin_class || '',
      aisles: cabin.aisles || 1,
      rows,
    }
  })
}

/**
 * Server-side price validation: look up each selected service id in the raw
 * seat maps and sum the real prices. Throws `unknown_service` if any id is not
 * a genuine available service (tamper protection — never trust client amounts).
 */
export function sumSelectedServices(
  maps: any[],
  serviceIds: string[]
): { amount: number; currency: string | null; count: number } {
  if (!serviceIds?.length) return { amount: 0, currency: null, count: 0 }
  const byId: Record<string, any> = {}
  for (const m of maps || [])
    for (const cabin of m.cabins || [])
      for (const row of cabin.rows || [])
        for (const sec of row.sections || [])
          for (const el of sec.elements || [])
            for (const svc of el.available_services || [])
              if (svc?.id) byId[svc.id] = svc

  let amount = 0
  let currency: string | null = null
  for (const id of serviceIds) {
    const svc = byId[id]
    if (!svc) {
      const err: any = new Error('unknown_service')
      err.code = 'unknown_service'
      err.serviceId = id
      throw err
    }
    amount += parseFloat(svc.total_amount) || 0
    currency = svc.total_currency || currency
  }
  return { amount: Math.round(amount * 100) / 100, currency, count: serviceIds.length }
}
