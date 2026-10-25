import { APIResponse } from '@/api'


export function getErrorMessage(err: any): string {
    const cfMessage = err?.response?.data?.errors?.[0]?.message
    if (cfMessage) {
        return cfMessage
    }

    if (err?.response) {
        const body = typeof err.response.data === 'string'
            ? err.response.data.replace(/\s+/g, ' ').trim().slice(0, 120)
            : ''
        return `HTTP ${err.response.status}${body ? `: ${body}` : ''}`
    }

    return err?.message ?? 'Unknown error'
}

export function toFailureResponse<T>(err: any): APIResponse<T> {
    return {
        result: null,
        success: false,
        errors: [{ code: 0, message: getErrorMessage(err) }],
        messages: [],
    }
}

// Describes a decoded API body that is missing the expected result/errors
// envelope. A body that is not the envelope at all (e.g. the SPA's
// index.html, served because the /api proxy or Pages Functions are not in
// effect) is reported explicitly instead of crashing on `errors[0]`.
export function describeApiResponse(data: any, fallback: string): string {
    const message = data?.errors?.[0]?.message
    if (message) {
        return message
    }

    if (typeof data === 'string' && data.trimStart().startsWith('<')) {
        return `${fallback}: /api 代理返回了 HTML 页面而不是 Cloudflare API 响应 (请检查部署的代理 / Pages Functions 是否生效)`
    }

    return fallback
}
