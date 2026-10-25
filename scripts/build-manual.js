// Builds the self-contained package for Cloudflare Pages dashboard (direct
// upload) deployment: runs vite build, injects deploy/_worker.js into dist/
// (Pages advanced mode -- direct upload cannot deploy the functions/
// directory), then packs the dist contents into a root-level zip.
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const vite = require('vite')

const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const workerSource = path.join(root, 'deploy', '_worker.js')

// --- minimal zip writer (deflate), no external dependencies ---

const CRC_TABLE = (() => {
    const table = new Int32Array(256)
    for (let i = 0; i < 256; i++) {
        let c = i
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
        table[i] = c
    }
    return table
})()

function crc32(buf) {
    let crc = -1
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF]
    }
    return (crc ^ -1) >>> 0
}

function dosDateTime(d) {
    return {
        time: ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF,
        date: (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF,
    }
}

function collectFiles(dir, base = dir, acc = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            collectFiles(full, base, acc)
        } else {
            acc.push({ full, rel: path.relative(base, full).split(path.sep).join('/') })
        }
    }
    return acc
}

function buildZip(files, zipPath) {
    const { time, date } = dosDateTime(new Date())
    const localChunks = []
    const centralChunks = []
    let offset = 0

    for (const file of files) {
        const data = fs.readFileSync(file.full)
        const deflated = zlib.deflateRawSync(data, { level: 9 })
        const nameBuf = Buffer.from(file.rel, 'utf8')
        const crc = crc32(data)

        const local = Buffer.alloc(30)
        local.writeUInt32LE(0x04034b50, 0)
        local.writeUInt16LE(20, 4)                       // version needed
        local.writeUInt16LE(0, 6)                        // flags
        local.writeUInt16LE(8, 8)                        // method: deflate
        local.writeUInt16LE(time, 10)
        local.writeUInt16LE(date, 12)
        local.writeUInt32LE(crc, 14)
        local.writeUInt32LE(deflated.length, 18)
        local.writeUInt32LE(data.length, 22)
        local.writeUInt16LE(nameBuf.length, 26)
        local.writeUInt16LE(0, 28)                       // extra length
        localChunks.push(local, nameBuf, deflated)

        const central = Buffer.alloc(46)
        central.writeUInt32LE(0x02014b50, 0)
        central.writeUInt16LE(20, 4)                     // version made by
        central.writeUInt16LE(20, 6)                     // version needed
        central.writeUInt16LE(0, 8)
        central.writeUInt16LE(8, 10)
        central.writeUInt16LE(time, 12)
        central.writeUInt16LE(date, 14)
        central.writeUInt32LE(crc, 16)
        central.writeUInt32LE(deflated.length, 20)
        central.writeUInt32LE(data.length, 24)
        central.writeUInt16LE(nameBuf.length, 28)
        central.writeUInt16LE(0, 30)                     // extra length
        central.writeUInt16LE(0, 32)                     // comment length
        central.writeUInt16LE(0, 34)                     // disk number
        central.writeUInt16LE(0, 36)                     // internal attrs
        central.writeUInt32LE(0o644 << 16, 38)           // external attrs (unix mode)
        central.writeUInt32LE(offset, 42)                // local header offset
        centralChunks.push(central, nameBuf)

        offset += 30 + nameBuf.length + deflated.length
    }

    const centralDir = Buffer.concat(centralChunks)
    const end = Buffer.alloc(22)
    end.writeUInt32LE(0x06054b50, 0)
    end.writeUInt16LE(0, 4)
    end.writeUInt16LE(0, 6)
    end.writeUInt16LE(files.length, 8)
    end.writeUInt16LE(files.length, 10)
    end.writeUInt32LE(centralDir.length, 12)
    end.writeUInt32LE(offset, 16)
    end.writeUInt16LE(0, 20)                             // comment length

    fs.writeFileSync(zipPath, Buffer.concat([...localChunks, centralDir, end]))
}

async function main() {
    console.log('==> vite build')
    await vite.build({ root, configFile: path.join(root, 'vite.config.ts') })

    fs.copyFileSync(workerSource, path.join(distDir, '_worker.js'))
    console.log('==> injected dist/_worker.js (Pages advanced mode)')

    const files = collectFiles(distDir)
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const zipName = `dnsflare-pages-${stamp}.zip`
    buildZip(files, path.join(root, zipName))

    console.log(`==> ${zipName} (${files.length} files)`)
    files.forEach(f => console.log(`    ${f.rel}`))
    console.log('上传: Cloudflare Dashboard -> Workers & Pages -> 项目 -> Create deployment, 拖入 zip')
    console.log('注意: dist 目前含 _worker.js, 不要执行 `wrangler pages deploy dist` (与 functions/ 冲突);')
    console.log('      常规 wrangler 部署前先 `yarn build` 重新生成干净的 dist')
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
