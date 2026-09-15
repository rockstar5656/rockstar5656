"""Stage the authored static lab for Sites without external dependencies."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
output = root / 'out'
output.mkdir(exist_ok=True)
for filename in ('index.html', 'style.css', 'app.js', 'core.mjs'):
    shutil.copyfile(root / 'lab' / filename, output / filename)
print('Staged four static lab assets in out/.')
