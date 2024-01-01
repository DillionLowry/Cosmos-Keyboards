import { execFile } from 'child_process'
import { mkdtemp, rm, writeFile } from 'fs/promises'
import { readFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { Mesh } from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { PromisePool } from './promisePool'

const targetDir = fileURLToPath(new URL('../../target', import.meta.url))

const UNIFORM = ['dsa', 'xda', 'choc']

const header = `
include <${join(targetDir, 'KeyV2', 'includes.scad')}>
$support_type = "disable";
$stem_type = "disable";
$stem_support_type = "disable";
$shape_facets = 1;

module overrides() {
  // $key_shape_type = "square";
  $dish_type = "disable";
  $height_slices = 1; // min($height_slices, 2);
  union() {
    translate([0, 0, -3.5]) linear_extrude(height = 3.5) projection(cut = true) hull() children();
    hull() children();
  }
}
`

const blobs = {}

const US = [1, 1.25, 1.5, 2]
const ROWS = [0, 1, 2, 3, 4, 5]

async function genKey(config: { profile: string; u: number; row?: number }, folder: string) {
  const loader = new STLLoader()
  const exporter = new STLExporter()
  const row = config.profile == 'dsa' ? 3 : config.row

  const name = UNIFORM.includes(config.profile)
    ? config.profile + '-' + config.u
    : config.profile + '-' + config.row + '-' + config.u
  const scadName = join(folder, name + '.scad')
  const stlName = join(folder, name + '.stl')
  await writeFile(scadName, header + `u(${config.u}) ${config.profile}_row(${row}) overrides() key();`)
  await promisify(execFile)(process.env.OPENSCAD || join(targetDir, 'openscad'), [scadName, '-o', stlName])
  const contents = await readFile(stlName, 'utf8')
  const stl = loader.parse(contents)
  const binary = exporter.parse(new Mesh(stl), { binary: true })
  // @ts-ignore
  const bstring = Buffer.from(binary.buffer).toString('base64')

  blobs[name] = bstring
  // await promisify(exec)(`cp ${gltfName} ${glbName}`)
}

async function genKeys() {
  const folder = await mkdtemp(join(tmpdir(), 'keycaps'))

  const pool = new PromisePool()
  const profiles = [
    ...US.map(u => ({ profile: 'dsa', u })),
    ...US.map(u => ({ profile: 'xda', u })),
    ...US.map(u => ({ profile: 'choc', u })),
    ...US.flatMap(u => ROWS.map(r => ({ profile: 'mt3', u, row: r }))),
    ...US.flatMap(u => ROWS.map(r => ({ profile: 'oem', u, row: r }))),
    ...US.flatMap(u => ROWS.map(r => ({ profile: 'sa', u, row: r }))),
    ...US.flatMap(u => ROWS.map(r => ({ profile: 'cherry', u, row: r }))),
  ]

  profiles.forEach(p => {
    const name = `${p.u}u${'row' in p ? ` r${p.row}` : ''} ${p.profile}`
    pool.add(name, () => genKey(p, folder))
  })

  await pool.run()

  const filename = join(targetDir, `keys-simple.json`)
  await writeFile(filename, JSON.stringify(blobs))
  await rm(folder, { recursive: true })
}

genKeys()
