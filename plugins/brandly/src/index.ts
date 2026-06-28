import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import type { Plugin } from "@opencode-ai/plugin";
import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { CostTracker } from "./cost-tracker";
import { Memory } from "./memory";

const PROJECTS_DIR = join(process.cwd(), ".brandly");

function getProjectDir(id: string) {
  return join(PROJECTS_DIR, id);
}

function getProjectPath(id: string) {
  return join(getProjectDir(id), "project.json");
}

async function readProject(id: string): Promise<any> {
  const raw = await readFile(getProjectPath(id), "utf-8");
  return JSON.parse(raw);
}

async function writeProject(id: string, state: any): Promise<void> {
  state.updatedAt = new Date().toISOString();
  await writeFile(getProjectPath(id), JSON.stringify(state, null, 2));
}

const BrandlyPlugin: Plugin = async ({ client, project, directory, $ }) => {
  await mkdir(PROJECTS_DIR, { recursive: true });

  const tools = {
    brandly_start: tool({
      description:
        "Start a new Brandly video project. Provide a product idea (and optionally an image) to kick off the agent pipeline. Creates a new project directory and returns the project ID.",
      args: z.object({
        idea: z.string().describe("Product idea, concept, or brief"),
        productName: z.string().describe("Name of the product"),
        imagePath: z
          .string()
          .optional()
          .describe("Optional path to a product image"),
        targetPlatforms: z
          .array(z.enum(["tiktok", "instagram", "youtube", "all"]))
          .default(["tiktok", "instagram"])
          .describe("Target social platforms"),
        budgetCredits: z
          .number()
          .positive()
          .default(500)
          .describe("Max credits to spend on this project"),
      }),
      execute: async (args, ctx) => {
        const id = randomUUID();
        const projectDir = getProjectDir(id);
        await mkdir(projectDir, { recursive: true });

        const state = {
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          inputType: args.imagePath ? "idea_with_image" : "idea",
          idea: args.idea,
          imagePath: args.imagePath,
          productName: args.productName,
          targetPlatforms: args.targetPlatforms,
          budgetCredits: args.budgetCredits,
          creditsSpent: 0,
          currentPhase: "init",
          shots: [],
          previewMode: true,
          previewPaths: {},
          previewApproved: false,
          reEditHistory: [],
          userPreferences: { likedHooks: [], dislikedHooks: [] },
          audioTrack: { source: "none" },
          costLog: [],
        };

        await writeProject(id, state);

        // Record to memory
        const memory = new Memory();
        await memory.recordProjectCompletion(id, 0, args.style || "cinematic");

        return {
          projectID: id,
          status: "created",
          message: `Project "${args.productName}" created. Use brandly_run_project to start the agent pipeline.`,
        };
      },
    }),

    brandly_status: tool({
      description:
        "Show the current status of a Brandly project — which phase it's in, budget spent, virality score, and artifacts produced.",
      args: z.object({
        projectID: z.string().describe("The project UUID"),
      }),
      execute: async (args, ctx) => {
        try {
          const state = await readProject(args.projectID);
          return {
            projectName: state.productName,
            phase: state.currentPhase,
            creditsSpent: state.creditsSpent,
            budgetCredits: state.budgetCredits,
            budgetRemaining: state.budgetCredits - state.creditsSpent,
            viralityScore: state.viralityScore,
            shots: state.shots.length,
            finalCut: state.finalCutPath || "not yet rendered",
            publishPaths: state.publishPaths || {},
            costLog: state.costLog.slice(-5),
          };
        } catch {
          return { error: "Project not found. Check the project ID." };
        }
      },
    }),

    brandly_approve: tool({
      description:
        "Approve the current phase output and advance the pipeline to the next phase. Must be called after each agent completes to proceed.",
      args: z.object({
        projectID: z.string().describe("The project UUID"),
        phase: z
          .enum([
            "init",
            "trends",
            "concept",
            "script",
            "asset",
            "validate",
            "audio",
            "preview",
            "publish",
            "done",
          ])
          .describe("The phase being approved"),
      }),
      execute: async (args, ctx) => {
        try {
          const state = await readProject(args.projectID);

          const phaseOrder = [
            "init",
            "trends",
            "concept",
            "preview",
            "script",
            "asset",
            "validate",
            "audio",
            "publish",
            "done",
          ];
          const currentIdx = phaseOrder.indexOf(state.currentPhase);
          const approvedIdx = phaseOrder.indexOf(args.phase);

          if (approvedIdx !== currentIdx) {
            return {
              error: `Cannot approve phase "${args.phase}" — current phase is "${state.currentPhase}".`,
            };
          }

          if (currentIdx < phaseOrder.length - 1) {
            state.currentPhase = phaseOrder[currentIdx + 1];
          } else {
            state.currentPhase = "done";
          }

          await writeProject(args.projectID, state);

          return {
            status: "approved",
            nextPhase: state.currentPhase,
            message: `Phase "${args.phase}" approved. Pipeline advancing to "${state.currentPhase}".`,
          };
        } catch {
          return { error: "Project not found. Check the project ID." };
        }
      },
    }),

    brandly_run_project: tool({
      description:
        "Run the next phase of the Brandly pipeline. Reads the current phase and dispatches the appropriate agent subagent. Call after brandly_approve to advance the pipeline.",
      args: z.object({
        projectID: z.string().describe("The project UUID"),
      }),
      execute: async (args, ctx) => {
        try {
          const state = await readProject(args.projectID);
          const agentDir = join(directory, "plugins", "brandly", "agents");

          const phaseAgentMap: Record<string, string> = {
            init: "trends_agent.md",
            trends: "concept_agent.md",
            concept: "script_agent.md",
            script: "asset_agent.md",
            asset: "publish_agent.md",
            re_edit: "script_agent.md",
          };

          const agentFile = phaseAgentMap[state.currentPhase];
          if (!agentFile) {
            return {
              error: `No agent for phase "${state.currentPhase}". Use brandly_approve first.`,
            };
          }

          const agentPath = join(agentDir, agentFile);
          const agentPrompt = await readFile(agentPath, "utf-8");

          // Build context for the agent
          const agentContext = `
## Project: ${state.productName}
## Idea: ${state.idea}
## Platforms: ${state.targetPlatforms.join(", ")}
## Budget: ${state.budgetCredits} credits (${state.creditsSpent} spent)
## Current Phase: ${state.currentPhase}
## Style: ${state.style || "auto-detect from trends"}

${state.imagePath ? `## Product Image: ${state.imagePath}` : ""}

## Previous Artifacts
${state.viralityReport ? `- Virality report: ${state.viralityReport}` : "- No virality report yet"}
${state.shots.length > 0 ? `- Shots defined: ${state.shots.length}` : "- No shots yet"}
${state.finalCutPath ? `- Final cut: ${state.finalCutPath}` : "- No final cut yet"}

## Instructions
${agentPrompt}
`;

          // Return structured dispatch instructions for the AI assistant
          // The AI will use its task tool to dispatch the subagent with MCP access
          const dispatchInstructions = {
            phase: state.currentPhase,
            agent: agentFile,
            dispatch: {
              description: `Brandly ${state.currentPhase} agent for "${state.productName}"`,
              prompt: agentContext,
              subagentType: "general",
            },
            message: `Phase "${state.currentPhase}" ready. Dispatch the ${agentFile} subagent using the task tool with the prompt above. The subagent has access to Higgsfield and Magnific MCP tools.`,
          };

          await writeProject(args.projectID, state);

          return JSON.stringify(dispatchInstructions, null, 2);
        } catch (error) {
          return { error: `Pipeline failed: ${error}` };
        }
      },
    }),

    brandly_estimate: tool({
      description:
        "Estimate credit cost before starting a Brandly project. Shows a breakdown by phase so you can decide on budget.",
      args: z.object({
        idea: z.string().describe("Product idea"),
        productName: z.string().describe("Product name"),
        style: z
          .enum(["cinematic", "ugc", "montage", "multi_shot", "continuous", "unboxing", "lifestyle"])
          .optional()
          .describe("Video style"),
        shotCount: z.number().min(3).max(10).default(5).describe("Number of shots"),
      }),
      execute: async (args, ctx) => {
        const styleCosts: Record<string, number> = {
          cinematic: 35,
          ugc: 25,
          montage: 20,
          multi_shot: 30,
          continuous: 40,
          unboxing: 25,
          lifestyle: 30,
        };
        const costPerShot = styleCosts[args.style || "cinematic"] || 30;
        const shotCount = args.shotCount;

        const estimate = {
          concept: 0,
          script: 0,
          asset: shotCount * costPerShot,
          audio: 30,
          publish: 0,
          total: shotCount * costPerShot + 30,
        };

        return {
          productName: args.productName,
          style: args.style || "cinematic",
          shotCount,
          costPerShot,
          estimate,
          recommendation:
            estimate.total > 300
              ? "Consider reducing shot count or using UGC style to save credits"
              : "Budget looks reasonable for this scope",
        };
      },
    }),

    brandly_re_edit: tool({
      description:
        "Re-edit a specific shot in the project. Provide the shot ID and a new prompt/description. The pipeline will regenerate that shot.",
      args: z.object({
        projectID: z.string().describe("The project UUID"),
        shotId: z.number().describe("The shot ID to re-edit"),
        newPrompt: z.string().describe("New prompt for the shot"),
        reason: z.string().describe("Why you're re-editing this shot"),
      }),
      execute: async (args, ctx) => {
        try {
          const state = await readProject(args.projectID);
          const shot = state.shots.find((s: any) => s.id === args.shotId);

          if (!shot) {
            return { error: `Shot ${args.shotId} not found. Available: ${state.shots.map((s: any) => s.id).join(", ")}` };
          }

          // Record the re-edit
          state.reEditTarget = args.shotId;
          state.reEditHistory.push({
            shotId: args.shotId,
            timestamp: new Date().toISOString(),
            reason: args.reason,
            creditsSpent: 0,
          });

          // Update the shot prompt
          shot.prompt = args.newPrompt;
          shot.renderPath = undefined; // Clear previous render
          shot.qualityScore = undefined;

          state.currentPhase = "re_edit";
          await writeProject(args.projectID, state);

          return {
            shotId: args.shotId,
            oldPrompt: shot.prompt,
            newPrompt: args.newPrompt,
            reason: args.reason,
            message: `Shot ${args.shotId} queued for re-edit. Call brandly_run_project to regenerate.`,
          };
        } catch {
          return { error: "Project not found." };
        }
      },
    }),

    brandly_validate: tool({
      description:
        "Run virality validation on the final video. Calls Higgsfield virality predictor to score the video and suggest improvements.",
      args: z.object({
        projectID: z.string().describe("The project UUID"),
        videoPath: z.string().describe("Path to the rendered video"),
      }),
      execute: async (args, ctx) => {
        const state = await readProject(args.projectID);
        if (!state) return { error: "Project not found" };

        const videoUrl = args.videoPath;
        const platforms = state.targetPlatforms || ["tiktok", "instagram"];

        // Return structured MCP call instructions for the AI assistant
        // The AI will call higgsfield_virality_predictor via MCP
        const mcpCall = {
          tool: "higgsfield_virality_predictor",
          params: {
            videoUrl: videoUrl,
            platforms: platforms,
          },
          onResult: {
            storeAs: "validation",
            scoreThreshold: 7,
            projectID: args.projectID,
          },
        };

        return JSON.stringify({
          instruction: "Call the Higgsfield virality predictor MCP tool with these params",
          mcpCall,
          message: `Validate video at ${videoUrl}. Call higgsfield_virality_predictor with videoUrl and platforms. Store the result and update the project.`,
        }, null, 2);
      },
    }),

    brandly_memory: tool({
      description:
        "View or update your Brandly preferences. Like/dislike hooks, set preferred style, or reset memory.",
      args: z.object({
        action: z.enum(["view", "like_hook", "dislike_hook", "reset"]).describe("Action to perform"),
        hook: z.string().optional().describe("Hook text to like or dislike"),
      }),
      execute: async (args, ctx) => {
        const memory = new Memory();

        switch (args.action) {
          case "view": {
            const prefs = await memory.getPreferences();
            return {
              preferredStyle: prefs.preferredStyle,
              preferredModel: prefs.preferredModel,
              likedHooks: prefs.likedHooks,
              dislikedHooks: prefs.dislikedHooks,
              projectCount: prefs.projectCount,
              avgBudgetUsage: Math.round(prefs.avgBudgetUsage),
            };
          }
          case "like_hook": {
            if (!args.hook) return { error: "Hook text required" };
            await memory.likeHook(args.hook);
            return { message: `Liked hook: "${args.hook}"` };
          }
          case "dislike_hook": {
            if (!args.hook) return { error: "Hook text required" };
            await memory.dislikeHook(args.hook);
            return { message: `Disliked hook: "${args.hook}"` };
          }
          case "reset": {
            await memory.reset();
            return { message: "Memory reset to defaults." };
          }
        }
      },
    }),
  };

  return {
    tool: tools,
    config: (cfg) => {
      // Future: inject brandly-specific config
    },
  };
};

export default BrandlyPlugin;
