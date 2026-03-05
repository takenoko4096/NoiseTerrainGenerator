import bun from "bun";
import { minecraft } from "./Minecraft";

console.log("build start");

const output = await bun.build({
    entrypoints: [
        "./src/index.ts"
    ],
    outdir: "scripts",
    target: "node",
    format: "esm",
    external: [
        "@minecraft/server",
        "@minecraft/server-ui",
        "@minecraft/server-graphics",
        "@minecraft/server-gametest",
        "@minecraft/server-net",
        "@minecraft/server-admin",
        "@minecraft/server-editor",
        "@minecraft/debug-utilities",
        "@minecraft/diagnostics",
        "@minecraft/common"
    ],
    minify: true
});

const manifest = new minecraft.ManifestJson(import.meta, "manifest.json");
manifest.create({
    header: {
        name: "terrain",
        description: "des",
        uuid: minecraft.uuidv4(),
        min_engine_version: [1, 26, 1]
    },
    modules: [
        {
            type: minecraft.ManifestModuleType.Script,
            entry: "scripts/index.js"
        }
    ],
    dependencies: [
        {
            module_name: minecraft.ScriptModule.MinecraftServer,
            version: "2.5.0"
        }
    ]
});

manifest.incrementPatchVersion();

minecraft.deployToDevelopmentDirectories({
    behavior: '.',
    importMeta: import.meta
});

console.log("build finished: " + (output.success ? "successful" : "failure"));
