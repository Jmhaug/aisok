# Security

## Secrets

Production secrets live in the host's environment variables (TODO: Vercel / other),
local ones in `.env.local` (gitignored). Never put a secret in a `NEXT_PUBLIC_` /
`VITE_` variable: those are shipped to every visitor's browser.

| Variable | Exposure | Where to rotate |
| --- | --- | --- |
| TODO | TODO | TODO |

## If a key leaks

1. Revoke it at the provider first. Deleting the commit does not help; bots scrape GitHub within minutes.
2. Create a new key, update it in the host's environment variables, redeploy.
3. Check the provider's usage/billing page for spend you don't recognise.

## Staying patched

- Dependabot alerts and security updates are on; merge security PRs the same day.
- The `Security` workflow scans for leaked secrets on every PR, push and Monday.
- Watch your framework's security advisories; zero-days are exploited within hours.
