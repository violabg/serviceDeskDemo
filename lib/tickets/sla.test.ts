import { describe, expect, it, vi } from "vitest"

import {
    computeSlaBreachAt,
    isSlaBreached,
    SLA_HOURS,
    TICKET_PRIORITIES,
} from "@/lib/tickets/sla"

describe("ticket SLA utilities", () => {
  it("defines SLA hour mappings for each priority", () => {
    expect(Object.keys(SLA_HOURS)).toEqual(TICKET_PRIORITIES)
    expect(SLA_HOURS.Critical).toBe(4)
    expect(SLA_HOURS.High).toBe(8)
    expect(SLA_HOURS.Medium).toBe(24)
    expect(SLA_HOURS.Low).toBe(72)
  })

  it("computes breach time from priority and creation time", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z")

    expect(computeSlaBreachAt("Critical", createdAt).toISOString()).toBe(
      "2026-01-01T04:00:00.000Z"
    )
    expect(computeSlaBreachAt("High", createdAt).toISOString()).toBe(
      "2026-01-01T08:00:00.000Z"
    )
    expect(computeSlaBreachAt("Medium", createdAt).toISOString()).toBe(
      "2026-01-02T00:00:00.000Z"
    )
    expect(computeSlaBreachAt("Low", createdAt).toISOString()).toBe(
      "2026-01-04T00:00:00.000Z"
    )
  })

  it("returns a Date instance", () => {
    expect(computeSlaBreachAt("High", new Date())).toBeInstanceOf(Date)
  })

  it("flags SLA breach based on current time", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-18T12:00:00.000Z"))

    expect(isSlaBreached(new Date("2026-07-18T11:59:59.999Z"))).toBe(true)
    expect(isSlaBreached(new Date("2026-07-18T12:00:00.001Z"))).toBe(false)
    expect(isSlaBreached(null)).toBe(false)

    vi.useRealTimers()
  })
})
