import { spawn } from "child_process"
import puppeteer from "puppeteer-core"
import { resolve } from "path"

const server = spawn("npx.cmd", ["next", "start", "-p", "3463"], {
  cwd: resolve("."),
  stdio: ["ignore", "pipe", "pipe"],
  shell: true,
})

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const res = await fetch(url)
        if (res.ok) return resolve(true)
      } catch {}
      if (Date.now() - start > timeoutMs) {
        return reject(new Error("Server start timeout"))
      }
      setTimeout(check, 500)
    }
    check()
  })
}

console.log("Starting server...")
const url = "http://localhost:3463"

try {
  await waitForServer(url)
  console.log("Server is ready")

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  const shots = [
    { path: "public/screenshot.png", url: url },
    { path: "public/screenshot-dashboard.png", url: url + "/dashboard" },
    { path: "public/screenshot-create.png", url: url + "/policies/new" },
    { path: "public/screenshot-about.png", url: url + "/about" },
  ]

  for (const shot of shots) {
    try {
      await page.goto(shot.url, { waitUntil: "networkidle0", timeout: 15000 })
      await page.waitForTimeout(1500)
      await page.screenshot({ path: shot.path, fullPage: true })
      console.log("Captured:", shot.path)
    } catch (err) {
      console.error("Failed:", shot.url, err.message)
    }
  }

  await browser.close()
} catch (err) {
  console.error("Error:", err.message)
} finally {
  server.kill()
  process.exit(0)
}
