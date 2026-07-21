import type { MetadataRoute } from "next";
import { buildRobotsConfig } from "@/modules/seo/robots";

/**
 * Thin App Router adapter — single robots SoT (C-011-5).
 * Do not keep a conflicting `public/robots.txt`.
 */
export default function robots(): MetadataRoute.Robots {
  return buildRobotsConfig();
}
