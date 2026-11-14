import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Automatic build version generator plugin
function buildVersionPlugin() {
  return {
    name: 'build-version-generator',
    buildStart() {
      try {
        const pkgPath = path.resolve(__dirname, 'package.json')
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
        const version = pkg.version || '2.0.0'
        const timestamp = new Date().toISOString()
        
        const versionData = {
          version,
          buildTimestamp: timestamp,
          releaseChannel: 'production',
          releaseNotes: [
            "Save Login: Automatic persistent sessions and credential remembering for students and staff",
            "Smart Redirect: Instant routing to Student or Admin Dashboard upon return",
            "Native Browser Password Manager / Keychain credential save support",
            "One-tap saved credential chip and clear-login convenience options"
          ]
        }
        
        const publicDir = path.resolve(__dirname, 'public')
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true })
        }
        
        fs.writeFileSync(
          path.resolve(publicDir, 'version.json'),
          JSON.stringify(versionData, null, 2)
        )

        // Also update sw.js CACHE_VERSION if needed
        const swPath = path.resolve(publicDir, 'sw.js')
        if (fs.existsSync(swPath)) {
          let swContent = fs.readFileSync(swPath, 'utf-8')
          swContent = swContent.replace(
            /const CACHE_VERSION = "mypintou-v[^"]+";/,
            `const CACHE_VERSION = "mypintou-v${version}";`
          )
          fs.writeFileSync(swPath, swContent)
        }
        
        console.log(`[Version Plugin] Synchronized version ${version} (Build: ${timestamp})`);
      } catch (err) {
        console.warn('[Version Plugin] Warning generating build version:', err);
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    buildVersionPlugin()
  ],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts', 'lucide-react']
  },
  server: {
    port: 5173
  }
})
