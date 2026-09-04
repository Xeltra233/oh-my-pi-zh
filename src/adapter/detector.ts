export interface OmpDetectionResult {
  /** True if oh-my-pi prompt structures were found */
  detected: boolean;
  /** True if prompt is already localized by oh-my-pi-zh */
  alreadyLocalized: boolean;
  /** Detected version or marker details */
  markers: string[];
}

export const ZH_MARKER = "<!-- oh-my-pi-zh:localized -->";

export function detectOhMyPi(prompt: string): OmpDetectionResult {
  if (!prompt || typeof prompt !== "string") {
    return { detected: false, alreadyLocalized: false, markers: [] };
  }

  const alreadyLocalized = prompt.includes(ZH_MARKER);
  const markers: string[] = [];

  if (prompt.includes("<oh-my-pi-state>")) markers.push("<oh-my-pi-state>");
  if (prompt.includes("<Role>") && (prompt.includes("Sisyphus") || prompt.includes("SF Bay Area") || prompt.includes("西西弗斯"))) markers.push("<Role>");
  if (prompt.includes("<Behavior_Instructions>")) markers.push("<Behavior_Instructions>");
  if (prompt.includes("<Delegation_Rules>")) markers.push("<Delegation_Rules>");
  if (prompt.includes("<Oracle_Usage>")) markers.push("<Oracle_Usage>");
  if (prompt.includes("<Constraints>")) markers.push("<Constraints>");
  if (prompt.includes("<Task_Management>")) markers.push("<Task_Management>");
  if (prompt.includes("<Agents_Roster>")) markers.push("<Agents_Roster>");
  if (prompt.includes("<Categories_Roster>")) markers.push("<Categories_Roster>");
  if (prompt.includes("<Tools_Catalog>")) markers.push("<Tools_Catalog>");
  if (prompt.includes("<Environment_Notes>")) markers.push("<Environment_Notes>");

  const detected = markers.length > 0;
  return { detected, alreadyLocalized, markers };
}
