export async function generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('Device fingerprint', 2, 2)
    }

    const canvasFingerprint = canvas.toDataURL()

    const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        canvas: canvasFingerprint,
        webgl: getWebGLFingerprint(),
    }

    const fingerprintString = JSON.stringify(fingerprint)
    return await hashString(fingerprintString)
}

function getWebGLFingerprint(): string {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null

    if (!gl) return 'no-webgl'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return 'no-debug-info'

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

    return `${vendor}~${renderer}`
}

async function hashString(str: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function getBrowserUA(): string {
    return navigator.userAgent
}

export async function getClientIP(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        return data.ip
    } catch (error) {
        console.error('Failed to get IP:', error)
        return 'unknown'
    }
}

// 添加别名导出，支持从 "./deviceutils" 导入小写名称
export {
    generateDeviceFingerprint as generatedEviceFingerprint,
    getClientIP as getClientip,
    getBrowserUA as getBrowserua
}
