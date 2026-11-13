import type { WazuhEvent } from "../model/types";

// Какие поля события показываются в колонках Raw data (заметка к макету CERT-KG SIEM, Figma 534:4754)

const firstValue = (...values: Array<string | number | null | undefined>) => {
  const value = values.find((item) => item !== null && item !== undefined && item !== "");
  return value === undefined ? null : String(value);
};

export const getEventTimestamp = (event: WazuhEvent) =>
  event["@timestamp"] ?? event.timestamp ?? null;

export const getEventHostname = (event: WazuhEvent) =>
  firstValue(event.agent?.name, event.predecoder?.hostname, event.host?.hostname);

export const getEventSourceName = (event: WazuhEvent) =>
  firstValue(event.source_context?.source_name);

export const getEventSourceIp = (event: WazuhEvent) =>
  firstValue(event.data?.srcip, event.source?.ip);

export const getEventDestinationIp = (event: WazuhEvent) =>
  firstValue(event.data?.dstip, event.destination?.ip);

export const getEventUser = (event: WazuhEvent) =>
  firstValue(event.data?.dstuser, event.data?.srcuser);

export const getEventOrganization = (event: WazuhEvent) =>
  firstValue(event.source_context?.organization_id);

/** Индекс и ID в Elasticsearch — по ним открывается детальная карточка */
export const getEventRef = (event: WazuhEvent) => {
  const index = event._elastic_index ?? event.event_ref?.index;
  const id = event._elastic_id ?? event.event_ref?.id;
  return index && id ? { index, id } : null;
};
