import type { NextConfig } from "next"
import path from "path"
import { execSync } from "child_process"

function getCommitHash(short = true) {
  try {
    return execSync(`git rev-parse ${short ? "--short " : ""}HEAD`)
      .toString()
      .trim()
  } catch {
    return short ? "dev" : ""
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname)
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: getCommitHash(),
    NEXT_PUBLIC_COMMIT_SHA_FULL: getCommitHash(false)
  }
}

export default nextConfig
