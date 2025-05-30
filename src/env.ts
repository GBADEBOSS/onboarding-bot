import "dotenv/config";

import { format } from "./utils/format";

type Env = "CODE"|"PROJECT_NAME"|"PRODUCT_NAME"|"ADMIN"|"CHANNEL_ID"|"CONTACT_SUPPORT"|"DATABASE_URL"|"CHANNEL_INVITE_LINK"|"TELEGRAM_ACCESS_TOKEN"|"TRADE_ACCOUNT_LINK";

export const getEnv = <T extends object | number | string | null = string>(
  name: Env,
  refine?: <K extends unknown>(value: K) => T
) => {
  const value = process.env["APP_" + name] || process.env[name] ;
  if (value)
    try {
      const parsed = JSON.parse(value) as T;
      return refine ? (refine(parsed) as T) : parsed;
    } catch {
      return (refine ? refine(value) : value) as T;
    }
  throw new Error(format("% not found in env file", name));
};
