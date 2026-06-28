---
name: brandly
description: Generate viral-ready product marketing videos from a single idea or image. Orchestrates trend research, concept development, AI video generation, quality scoring, and multi-platform publishing — all with strict cost control.
---

# Brandly — AI Product Video Generator

## What This Plugin Does
Brandly turns a product idea + optional image into a complete, platform-ready marketing video. It orchestrates specialized AI agents through a pipeline: trend research → concept → script → asset generation → quality validation → publishing.

## When To Use
Trigger on: "make a product video", "create a marketing video for [product]", "generate a TikTok ad", "make a viral product clip", "Brandly this product", "turn my product into a video"

## How It Works

### Step 1: Start a Project
```
brandly_start(
  idea="Organic matcha latte powder that froths instantly",
  productName="MatchaQuick",
  targetPlatforms=["tiktok", "instagram"],
  budgetCredits=300
)
```
Returns a project ID. Save it.

### Step 2: Run the Pipeline
```
brandly_run_project(projectID="<uuid>")
```
Returns JSON with dispatch instructions. Use the `task` tool to dispatch the subagent:
```
task(
  description="Brandly concept agent",
  prompt=<dispatch.prompt from the JSON response>,
  subagent_type="general"
)
```
The subagent has access to Higgsfield and Magnific MCP tools for asset generation.

### Step 3: Approve & Advance
After the subagent completes, approve the phase:
```
brandly_approve(projectID="<uuid>", phase="trends")
```
Then call brandly_run_project again for the next phase.

### Step 4: Check Status
```
brandly_status(projectID="<uuid>")
```
Shows current phase, budget spent, virality score, and artifacts.

### Step 5: Validate
After the final video is rendered:
```
brandly_validate(projectID="<uuid>", videoPath="<path to video>")
```
Returns MCP call instructions. Call `higgsfield_virality_predictor` via MCP with the provided params.

### Step 6: Publish
After validation passes (score >= 7):
```
brandly_run_project(projectID="<uuid>")  // dispatches publish_agent
```

## Pipeline Phases
1. **trends** — Researches current viral formats for the product
2. **concept** — Generates 3 video concepts, recommends the best
3. **script** — Breaks the concept into shots with AI prompts
4. **asset** — Plans and generates video/image assets
5. **validate** — Scores final video for virality
6. **publish** — Generates platform-specific captions and hashtags

## Cost Control
- Every project has a credit budget (default 500)
- The pipeline checks budget before each expensive operation
- If budget runs out, the pipeline pauses and reports what's been spent
- Check with brandly_status to see remaining budget

## Tips
- Start with a clear product idea — the more specific, the better the concepts
- Include a product image for better visual consistency
- Use preview mode (default) to generate low-res previews before full renders
- After validation, you can re-edit individual shots if the score is low
- The plugin remembers your preferences across projects

## Re-editing Shots
If validation score is low, re-edit specific shots:
```
brandly_re_edit(projectID="<uuid>", shotId="shot-1", newPrompt="more dramatic lighting, faster cuts")
```
Then re-run the asset phase to regenerate.

## Cost Estimation
Before starting, estimate costs:
```
brandly_estimate(idea="...", productName="...", style="cinematic", shotCount=5)
```

## Memory
View or update your preferences:
```
brandly_memory(action="view")
brandly_memory(action="like_hook", hook="product reveal zoom")
brandly_memory(action="dislike_hook", hook="slow pan")
```
