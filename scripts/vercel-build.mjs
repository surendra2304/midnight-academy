import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

console.log("=== Building TanStack Start for Vercel ===");

// 1. Run standard Vite build (generates dist/client and dist/server)
execSync("npx vite build", { stdio: "inherit" });

// 2. Prepare .vercel/output structure
const vercelOutputDir = path.resolve(".vercel/output");
const staticDir = path.join(vercelOutputDir, "static");
const funcDir = path.join(vercelOutputDir, "functions", "__server.func");

if (fs.existsSync(vercelOutputDir)) {
  fs.rmSync(vercelOutputDir, { recursive: true, force: true });
}

fs.mkdirSync(staticDir, { recursive: true });
fs.mkdirSync(funcDir, { recursive: true });

// 3. Copy client assets to .vercel/output/static
const distClientDir = path.resolve("dist/client");
if (fs.existsSync(distClientDir)) {
  fs.cpSync(distClientDir, staticDir, { recursive: true });
}

// 4. Copy dist/server to inside the serverless function
const funcDistServerDir = path.join(funcDir, "dist", "server");
fs.mkdirSync(path.dirname(funcDistServerDir), { recursive: true });
fs.cpSync(path.resolve("dist/server"), funcDistServerDir, { recursive: true });

// 5. Copy package.json with dependencies & bundle node_modules needed for SSR
const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
fs.writeFileSync(
  path.join(funcDir, "package.json"),
  JSON.stringify(
    {
      name: "midnight-academy-server",
      type: "module",
      dependencies: pkg.dependencies,
    },
    null,
    2,
  ),
  "utf-8",
);

// Copy node_modules into the function directory so all SSR dependencies are bundled
console.log("Bundling node_modules for serverless function...");
const funcNodeModules = path.join(funcDir, "node_modules");
fs.cpSync(path.resolve("node_modules"), funcNodeModules, {
  recursive: true,
  dereference: true,
  filter: (src) => {
    // Avoid copying large unnecessary dev/build caches
    if (src.includes(".bin") || src.includes(".cache") || src.includes(".vite")) {
      return false;
    }
    return true;
  },
});

// 6. Create the standalone serverless Web Fetch -> Node handler bridge
const serverlessHandlerCode = `import { pathToFileURL } from "node:url";
import path from "node:path";
import { Readable } from "node:stream";

let serverHandler;

export default async function handler(req, res) {
  try {
    if (!serverHandler) {
      const serverPath = path.resolve(import.meta.dirname, "dist/server/server.js");
      const mod = await import(pathToFileURL(serverPath).toString());
      serverHandler = mod.default;
    }

    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const fullUrl = \`\${proto}://\${host}\${req.url}\`;

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val === undefined) continue;
      if (Array.isArray(val)) {
        for (const v of val) headers.append(key, v);
      } else {
        headers.set(key, val);
      }
    }

    const isGetOrHead = req.method === "GET" || req.method === "HEAD";
    const body = isGetOrHead
      ? undefined
      : Readable.toWeb(req);

    const init = {
      method: req.method,
      headers,
      body,
      duplex: isGetOrHead ? undefined : "half"
    };

    const webReq = new Request(fullUrl, init);
    const webRes = await serverHandler.fetch(webReq);

    res.statusCode = webRes.status;
    res.statusMessage = webRes.statusText;

    // Forward headers
    webRes.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        const getSetCookie = webRes.headers.getSetCookie?.();
        if (getSetCookie) {
          res.setHeader("set-cookie", getSetCookie);
        } else {
          res.appendHeader("set-cookie", value);
        }
      } else {
        res.setHeader(key, value);
      }
    });

    if (webRes.body) {
      const reader = webRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error("Vercel SSR Handler Error:", err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(\`Internal Server Error: \${err?.message || err}\`);
  }
}
`;

fs.writeFileSync(path.join(funcDir, "index.mjs"), serverlessHandlerCode, "utf-8");

// 7. Create function .vc-config.json
const funcConfig = {
  runtime: "nodejs22.x",
  handler: "index.mjs",
  launcherType: "Nodejs",
  maxDuration: 60,
  supportsResponseStreaming: true,
};

fs.writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  JSON.stringify(funcConfig, null, 2),
  "utf-8",
);

// 8. Create root .vercel/output/config.json
const vercelConfig = {
  version: 3,
  routes: [
    {
      handle: "filesystem",
    },
    {
      src: "/(.*)",
      dest: "/__server",
    },
  ],
};

fs.writeFileSync(
  path.join(vercelOutputDir, "config.json"),
  JSON.stringify(vercelConfig, null, 2),
  "utf-8",
);

console.log("=== Vercel Build Output Successfully Generated ===");
