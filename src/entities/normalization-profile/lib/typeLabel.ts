import { getSourceTypeLabel } from "@/entities/source/@x/normalization-profile";

// Подписи типов те же, что у источников: waf → WAF, firewall → Firewall
export const getProfileTypeLabel = getSourceTypeLabel;
