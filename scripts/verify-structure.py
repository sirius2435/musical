"""Check course-specific file boundaries and local asset references, without claiming behavioral compliance."""
from pathlib import Path
import json,re,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
base=root/'backend/src/main/scala/services'
for service in ['user','catalog','favorites']:
 for message in (base/service/'api').glob('*.scala'):
  text=message.read_text()
  assert f'final case class {message.stem}' in text,message
  assert re.search(r'def plan\(connection: Connection\): IO\[',text),message
for table in base.glob('*/tables/*/*Table.scala'):
 assert table.with_name(table.stem+'Initializer.scala').exists(),table
for source in base.rglob('*.scala'):
 text=source.read_text()
 assert not re.search(r'\b(?:var|try|catch|finally)\b',text),source
seed=json.loads((root/'backend/seed.json').read_text())
for table,entries in seed.items():
 assert len({e['id'] for e in entries})==len(entries),table
 assert len({e['slug'] for e in entries})==len(entries),table
 for entry in entries:
  assert entry['source'].startswith('https://'),entry['id']
  assert not entry['image'].startswith('/art/'),entry['id']
  if entry['image'].startswith(('/art/','/images/')):
   asset=root/'frontend/public'/entry['image'].lstrip('/')
   assert asset.is_file(),asset
   if asset.suffix=='.svg': ET.parse(asset)
   else:
    data=asset.read_bytes()
    assert data[:4]==b'RIFF' and data[8:12]==b'WEBP',asset
    assert entry['image'] in (root/'IMAGE_ATTRIBUTIONS.md').read_text(),asset
refs=set()
for source in (root/'frontend/src').rglob('*.ts*'):
 refs.update(re.findall(r'/images/[A-Za-z0-9_./-]+\.(?:webp|png)',source.read_text()))
attributions=(root/'IMAGE_ATTRIBUTIONS.md').read_text()
for ref in refs:
 asset=root/'frontend/public'/ref.lstrip('/')
 assert asset.is_file(),asset
 data=asset.read_bytes()
 if asset.suffix=='.webp':
  assert data[:4]==b'RIFF' and data[8:12]==b'WEBP',asset
 else:
  assert data[:8]==b'\x89PNG\r\n\x1a\n',asset
 assert ref in attributions,asset
for asset in (root/'frontend/public/art').glob('*.svg'):ET.parse(asset)
assert (root/'.agents/skills/scala-react-course/SKILL.md').is_file()
assert len(re.findall(r'^\d+\.',(root/'.agents/skills/scala-react-course/references/rules.txt').read_text(),re.M))==60
print('PASS: course message/table structure, Scala syntax exclusions, seed IDs/slugs/sources, local WebP/PNG/SVG assets, component image references, attribution coverage and shared Skill link')
print('Scope: structural checks only; not full course compliance or content accuracy certification')
