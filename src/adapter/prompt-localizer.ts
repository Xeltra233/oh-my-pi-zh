import type { OhMyPiZhConfig } from "../config/types.js";
import { getDictionary } from "../locales/index.js";
import { detectOhMyPi, ZH_MARKER } from "./detector.js";
import { logger } from "../shared/logger.js";

/**
 * Replace a section identified by opening and closing XML tags.
 */
function replaceSection(
  prompt: string,
  openTag: string,
  closeTag: string,
  newContent: string
): string {
  const startIdx = prompt.indexOf(openTag);
  if (startIdx === -1) return prompt;

  const endIdx = prompt.indexOf(closeTag, startIdx);
  if (endIdx === -1) return prompt;

  const afterClose = endIdx + closeTag.length;
  return prompt.substring(0, startIdx) + newContent + prompt.substring(afterClose);
}

/**
 * Localize active agents list in <oh-my-pi-state>
 */
function localizeStateBlock(
  stateBlock: string,
  dict: ReturnType<typeof getDictionary>
): string {
  let result = stateBlock;
  result = result.replace("## Active Agents", "## 活跃智能体 (Active Agents)");
  result = result.replace("## Loaded Skills", "## 已挂载技能 (Loaded Skills)");

  // Translate agent descriptions: - <name>: <model> [<variant>] thinking:<x> — <desc>
  result = result.replace(
    /^- ([a-zA-Z0-9_-]+): (.*?) — (.*)$/gm,
    (match, name, modelInfo, originalDesc) => {
      const zhDesc = dict.agents[name];
      if (zhDesc) {
        return `- ${name}: ${modelInfo} — ${zhDesc}`;
      }
      return match;
    }
  );

  return result;
}

/**
 * Localize <Agents_Roster> block
 */
function localizeAgentsRoster(
  rosterBlock: string,
  dict: ReturnType<typeof getDictionary>
): string {
  let result = rosterBlock;
  result = result.replace(/## Specialist Agents/g, "## 专长智能体花名册 (Specialist Agents)");

  // Replace descriptions in format: - **name**: description
  result = result.replace(
    /^- \*\*([a-zA-Z0-9_-]+)\*\*: (.*)$/gm,
    (match, name, originalDesc) => {
      const zhDesc = dict.agents[name];
      if (zhDesc) {
        return `- **${name}**: ${zhDesc}`;
      }
      return match;
    }
  );

  return result;
}

/**
 * Localize <Categories_Roster> block
 */
function localizeCategoriesRoster(
  catBlock: string,
  dict: ReturnType<typeof getDictionary>
): string {
  let result = catBlock;
  result = result.replace(/## Available Categories/g, "## 可用任务分类 (Available Categories)");

  // Format: - **category**: description
  result = result.replace(
    /^- \*\*([a-zA-Z0-9_-]+)\*\*: (.*)$/gm,
    (match, name, originalDesc) => {
      const zhDesc = dict.categories[name];
      if (zhDesc) {
        return `- **${name}**: ${zhDesc}`;
      }
      return match;
    }
  );

  return result;
}

/**
 * Core prompt localizer.
 * Safely parses, localizes, and returns the modified prompt.
 */
export function localizePrompt(
  inputPrompt: string,
  config: OhMyPiZhConfig
): string {
  if (!config.enabled || config.locale !== "zh-CN") {
    return inputPrompt;
  }

  const detection = detectOhMyPi(inputPrompt);
  if (!detection.detected || detection.alreadyLocalized) {
    return inputPrompt;
  }

  try {
    const dict = getDictionary(config.locale, config.customDictionary);
    let prompt = inputPrompt;

    // 1. Role section
    if (config.features.translateOrchestrator && prompt.includes("<Role>")) {
      let agentName = "oh-my-pi";
      const nameMatch = prompt.match(/Agent: ([a-zA-Z0-9_-]+)/) ||
                         prompt.match(/You are "([a-zA-Z0-9_-]+)"/);
      if (nameMatch && nameMatch[1]) {
        agentName = nameMatch[1];
      }
      prompt = replaceSection(prompt, "<Role>", "</Role>", dict.sections.role(agentName));
    }

    // 2. Behavior Instructions
    if (config.features.translateOrchestrator && prompt.includes("<Behavior_Instructions>")) {
      prompt = replaceSection(
        prompt,
        "<Behavior_Instructions>",
        "</Behavior_Instructions>",
        dict.sections.behavior
      );
    }

    // 3. Delegation Rules
    if (config.features.translateOrchestrator && prompt.includes("<Delegation_Rules>")) {
      prompt = replaceSection(
        prompt,
        "<Delegation_Rules>",
        "</Delegation_Rules>",
        dict.sections.delegation
      );
    }

    // 4. Oracle Usage
    if (config.features.translateOrchestrator && prompt.includes("<Oracle_Usage>")) {
      prompt = replaceSection(
        prompt,
        "<Oracle_Usage>",
        "</Oracle_Usage>",
        dict.sections.oracle
      );
    }

    // 5. Constraints
    if (config.features.translateOrchestrator && prompt.includes("<Constraints>")) {
      prompt = replaceSection(
        prompt,
        "<Constraints>",
        "</Constraints>",
        dict.sections.constraints
      );
    }

    // 6. Task Management
    if (config.features.translateOrchestrator && prompt.includes("<Task_Management>")) {
      prompt = replaceSection(
        prompt,
        "<Task_Management>",
        "</Task_Management>",
        dict.sections.taskManagement
      );
    }

    // 7. Environment Notes
    if (config.features.translateOrchestrator && prompt.includes("<Environment_Notes>")) {
      prompt = replaceSection(
        prompt,
        "<Environment_Notes>",
        "</Environment_Notes>",
        dict.sections.environment
      );
    }

    // 8. Tools Catalog
    if (config.features.translateTools && prompt.includes("<Tools_Catalog>")) {
      prompt = replaceSection(
        prompt,
        "<Tools_Catalog>",
        "</Tools_Catalog>",
        dict.sections.toolsCatalog
      );
    }

    // 9. State Block
    if (config.features.translateAgents && prompt.includes("<oh-my-pi-state>")) {
      const stateMatch = prompt.match(/<oh-my-pi-state>[\s\S]*?<\/oh-my-pi-state>/);
      if (stateMatch) {
        const localizedState = localizeStateBlock(stateMatch[0], dict);
        prompt = prompt.replace(stateMatch[0], localizedState);
      }
    }

    // 10. Agents Roster
    if (config.features.translateAgents && prompt.includes("<Agents_Roster>")) {
      const rosterMatch = prompt.match(/<Agents_Roster>[\s\S]*?<\/Agents_Roster>/);
      if (rosterMatch) {
        const localizedRoster = localizeAgentsRoster(rosterMatch[0], dict);
        prompt = prompt.replace(rosterMatch[0], localizedRoster);
      }
    }

    // 11. Categories Roster
    if (config.features.translateCategories && prompt.includes("<Categories_Roster>")) {
      const catMatch = prompt.match(/<Categories_Roster>[\s\S]*?<\/Categories_Roster>/);
      if (catMatch) {
        const localizedCat = localizeCategoriesRoster(catMatch[0], dict);
        prompt = prompt.replace(catMatch[0], localizedCat);
      }
    }

    // Prepend idempotency marker to indicate successful localization
    prompt = `${ZH_MARKER}\n${prompt}`;
    return prompt;
  } catch (err) {
    logger.error(`Error localizing prompt: ${String(err)}`);
    // Graceful fallback to original prompt
    return inputPrompt;
  }
}
