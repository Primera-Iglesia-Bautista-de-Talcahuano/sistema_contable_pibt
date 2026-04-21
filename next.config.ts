import type { NextConfig } from "next"
import path from "path"
import { execSync } from "child_process"

function getCommitHash() {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim()
  } catch {
    return "dev"
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname)
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: getCommitHash()
  }
}

export default nextConfig
