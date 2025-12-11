import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    turbopack: {
        resolveAlias: {
            'better-sqlite3': 'better-sqlite3'
        }
    }
}

export default nextConfig
