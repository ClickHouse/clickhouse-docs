#! ./bin/bash
echo "Copying placeholder files over generated content"
PLACEHOLDER=docs/_placeholders 
DOCS=docs

cp $PLACEHOLDER/changelog/_index.md                 $DOCS/whats-new/changelog/index.md
echo "Copying completed"
echo "----END----"
