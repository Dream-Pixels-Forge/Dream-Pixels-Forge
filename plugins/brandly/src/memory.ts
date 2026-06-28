import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MEMORY_DIR = join(process.cwd(), ".brandly");
const MEMORY_FILE = join(MEMORY_DIR, "user_preferences.json");

export interface UserPreferences {
  preferredStyle?: string;
  preferredModel?: string;
  preferredDuration?: number;
  likedHooks: string[];
  dislikedHooks: string[];
  avgBudgetUsage: number;
  projectCount: number;
  lastUpdated: string;
}

const DEFAULT_PREFS: UserPreferences = {
  likedHooks: [],
  dislikedHooks: [],
  avgBudgetUsage: 0,
  projectCount: 0,
  lastUpdated: new Date().toISOString(),
};

/**
 * Persists user preferences across projects.
 * Tracks liked/disliked hooks, preferred style/model, and budget patterns.
 */
export class Memory {
  private prefs: UserPreferences | null = null;

  async load(): Promise<UserPreferences> {
    if (this.prefs) return this.prefs;

    try {
      const raw = await readFile(MEMORY_FILE, "utf-8");
      this.prefs = JSON.parse(raw);
    } catch {
      this.prefs = { ...DEFAULT_PREFS };
    }
    return this.prefs!;
  }

  async save(): Promise<void> {
    if (!this.prefs) return;
    this.prefs.lastUpdated = new Date().toISOString();
    await mkdir(MEMORY_DIR, { recursive: true });
    await writeFile(MEMORY_FILE, JSON.stringify(this.prefs, null, 2));
  }

  async recordProjectCompletion(projectId: string, creditsUsed: number, style: string, model?: string): Promise<void> {
    const prefs = await this.load();
    prefs.projectCount += 1;
    prefs.avgBudgetUsage = (prefs.avgBudgetUsage * (prefs.projectCount - 1) + creditsUsed) / prefs.projectCount;
    prefs.preferredStyle = style;
    if (model) prefs.preferredModel = model;
    await this.save();
  }

  async likeHook(hook: string): Promise<void> {
    const prefs = await this.load();
    if (!prefs.likedHooks.includes(hook)) {
      prefs.likedHooks.push(hook);
    }
    // Remove from disliked if present
    prefs.dislikedHooks = prefs.dislikedHooks.filter(h => h !== hook);
    await this.save();
  }

  async dislikeHook(hook: string): Promise<void> {
    const prefs = await this.load();
    if (!prefs.dislikedHooks.includes(hook)) {
      prefs.dislikedHooks.push(hook);
    }
    // Remove from liked if present
    prefs.likedHooks = prefs.likedHooks.filter(h => h !== hook);
    await this.save();
  }

  async getPreferences(): Promise<UserPreferences> {
    return this.load();
  }

  async reset(): Promise<void> {
    this.prefs = { ...DEFAULT_PREFS };
    await this.save();
  }
}
