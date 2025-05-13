#!/bin/bash

# This script is used for automatically generating any .json table of contents files
# used for various things on the docs site, such as:
  # - landing pages
  # - indexing of the knowledgebase

# check if virtual environment exists
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
pip install -r scripts/table-of-contents-generator/requirements.txt

# Add runs of the script below for any table of contents files that need to be generated
# You can run toc_gen.py --help for descriptions of the parameters

# TO DO: add a batch mode option to the script so that it takes in a file with the arguments
#        instead of having to repeat the script each time

python3 scripts/table-of-contents-generator/toc_gen.py --dir="knowledgebase" --single-toc --out="static" --ignore images
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/operations/system-tables" --md="docs/operations/system-tables/index.md"
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/operations/settings" --md="docs/operations/settings/index.md"
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/engines/database-engines" --md="docs/engines/database-engines/index.md"
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/engines/table-engines/mergetree-family" --md="docs/engines/table-engines/mergetree-family/index.md"
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/engines/table-engines/integrations" --md="docs/engines/table-engines/integrations/index.md"
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/engines/table-engines/special" --md="docs/engines/table-engines/special/index.md"
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/sql-reference/aggregate-functions/reference" --md="docs/sql-reference/aggregate-functions/reference/index.md"
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/sql-reference/table-functions" --md="docs/sql-reference/table-functions/index.md"
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/chdb/guides" --md="docs/chdb/guides/index.md" --ignore images
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/cloud/manage/jan2025_faq" --md="docs/cloud/manage/jan2025_faq/index.md" --ignore images
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/cloud/changelogs" --md="docs/cloud/reference/release-notes-index.md"
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/development" --md="docs/development/index.md" --ignore images
python3 scripts/table-of-contents-generator/toc_gen.py --single-toc --dir="docs/getting-started/example-datasets" --md="docs/getting-started/index.md" --ignore images
deactivate
rm -r venv
