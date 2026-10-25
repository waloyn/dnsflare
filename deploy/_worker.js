// Cloudflare Pages advanced mode worker (_worker.js).
// Direct-upload deployments do not include the functions/ directory, so this
// self-contained worker provides the same /api proxy plus SPA asset serving.
// It takes over ALL requests: static assets are served through env.ASSETS.

export default {
    async fetch(request, env) {
        const url = new URL(request.url)

        if (url.pathname.startsWith('/api/')) {
            url.hostname = 'api.cloudflare.com'
            url.pathname = `/client/v4${url.pathname.replace(/^\/api/, '')}`
            url.protocol = 'https:'
            url.port = 443

            const response = await fetch(new Request(url, request))
            const headers = new Headers(response.headers)
            headers.set('Access-Control-Allow-Origin', '*')
            return new Response(response.body, { status: response.status, headers })
        }

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
                    'Access-Control-Max-Age': '86400',
                },
            })
        }

        const response = await env.ASSETS.fetch(request)
        // SPA fallback: unknown navigation routes serve index.html
        if (response.status === 404 && request.mode === 'navigate') {
            return env.ASSETS.fetch(new URL('/index.html', request.url))
        }
        return response
    },
}
