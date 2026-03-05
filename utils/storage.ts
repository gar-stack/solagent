import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");

// Initialize .data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function saveJSON(filename: string, data: any): void {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function loadJSON<T>(filename: string, defaultData: T): T {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return defaultData;
    }
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw) as T;
    } catch (e) {
        console.error(`[Storage] Failed to load ${filename}, using default.`);
        return defaultData;
    }
}
