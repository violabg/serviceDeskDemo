import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	cacheComponents: true,
	cacheLife: {
		days: {
			stale: 60 * 60 * 24 * 7,
			revalidate: 60 * 60 * 24 * 7,
			expire: 60 * 60 * 24 * 30,
		},
	},
}

export default nextConfig
