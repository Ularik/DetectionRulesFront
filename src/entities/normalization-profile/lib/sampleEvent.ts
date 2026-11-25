import type { FieldMapping } from "../model/types";

// Правдоподобные значения для примера raw-события (по полям SOC Engine)
const SAMPLE_VALUES: Record<string, unknown> = {
  source_ip: "192.168.1.10",
  destination_ip: "10.0.0.20",
  source_port: 51514,
  destination_port: 443,
  protocol: "tcp",
  http_method: "GET",
  request_uri: "/login.php?id=1",
  url: "/login.php",
  http_status: 403,
  user_agent: "Mozilla/5.0",
  referrer: "https://example.com/",
  signature: "SQL Injection attempt",
  signature_id: "942100",
  attack_name: "SQL Injection",
  payloads: "' OR 1=1 --",
  action: "block",
  outcome: "success",
  severity: "high",
  source_user: "admin",
  source_host: "client-01",
  destination_host: "web-01",
  observer_host: "sensor-01",
  device_name: "fw-01",
  vendor_name: "Vendor",
  product_name: "Product",
};

/** Пример raw-события для теста: по первому имени поля источника для каждого поля профиля */
export function buildSampleRawEvent(mapping: FieldMapping): Record<string, unknown> {
  const event: Record<string, unknown> = {};
  for (const [field, aliases] of Object.entries(mapping)) {
    const key = aliases.find((alias) => !(alias in event));
    if (!key) continue;
    event[key] = field === "timestamp" ? new Date().toISOString() : (SAMPLE_VALUES[field] ?? "value");
  }
  return event;
}
