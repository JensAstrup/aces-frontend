import {withSentryConfig} from '@sentry/nextjs'
import {readFileSync} from 'fs'


const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))

/** @type {import('next').NextConfig} */
const nextConfig = {}

const isSentryEnabled = () => {
  const env = process.env.VERCEL_ENV
  const gitRef = process.env.VERCEL_GIT_COMMIT_REF

  return env === 'production' || (env === 'preview' && gitRef === 'develop')
}

const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,  // Suppresses Sentry logging during build when not in CI environment
  widenClientFileUpload: true,  // Upload a larger set of source maps for prettier stack traces (increases build time)
  hideSourceMaps: true,  // Hides source maps from generated client bundles
  disableLogger: true,  // Automatically tree-shake Sentry logger statements to reduce bundle size
  automaticVercelMonitors: true,  // Enables automatic instrumentation of Vercel Cron Monitors
  release: packageJson.version  // Sets the release version to the version specified in package.json
}

const config = isSentryEnabled()
  ? withSentryConfig(nextConfig, sentryOptions)
  : nextConfig

export default () => ({
  ...config,
  env: {
    APP_VERSION: packageJson.version
  }
})
