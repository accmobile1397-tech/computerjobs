/**
 * Home footer deploy label — bump when a phase is closed on main.
 * Override: NEXT_PUBLIC_DEPLOYED_PHASE=3
 */
export const DEPLOYED_PHASE = Number(process.env.NEXT_PUBLIC_DEPLOYED_PHASE ?? "5");
