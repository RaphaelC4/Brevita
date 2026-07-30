import { spawn } from "child_process"

const server = spawn("npx.cmd", ["next", "start", "-p", "3465"], {
  cwd: process.cwd(),
  stdio: "pipe",
  shell: true,
})

let serverOut = ""
server.stdout.on("data", (d) => { serverOut += d.toString() })
server.stderr.on("data", (d) => { serverOut += d.toString() })

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function waitForServer(url, tries = 20) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return true
    } catch {}
    await sleep(1000)
  }
  throw new Error("Server didnt start. Output: " + serverOut.slice(0, 500))
}

const url = "http://localhost:3465"
console.log("Waiting for server on", url)

try {
  await waitForServer(url)
  console.log("Server ready!")

  const puppeteer = await import("puppeteer-core")
  const browser = await puppeteer.default.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox"],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  const shots = [
    ["public/screenshot.png", "/"],
    ["public/screenshot-dashboard.png", "/dashboard"],
    ["public/screenshot-create.png", "/policies/new"],
    ["public/screenshot-about.png", "/about"],
  ]

  for (const [path, route] of shots) {
    try {
      await page.goto(url + route, { waitUntil: "networkidle0", timeout: 10000 })
      await sleep(1500)
      await page.screenshot({ path, fullPage: true })
      console.log("OK", path)
    } catch (e) {
      console.log("FAIL", route, e.message)
    }
  }

  await browser.close()
  console.log("Done! Screenshots in public/")
} catch (e) {
  console.error(e.message)
} finally {
  server.kill()
  process.exit(0)
}
