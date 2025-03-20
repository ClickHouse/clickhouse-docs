#! ./bin/bash
echo "Copying API placeholder files over generated content"
PLACEHOLDER=docs/en/_placeholders 
DOCS=docs/en
cp $PLACEHOLDER/api/_invitations-api-reference.md   $DOCS/cloud/manage/api/invitations-api-reference.md
cp $PLACEHOLDER/api/_keys-api-reference.md          $DOCS/cloud/manage/api/keys-api-reference.md
cp $PLACEHOLDER/api/_members-api-reference.md       $DOCS/cloud/manage/api/members-api-reference.md
cp $PLACEHOLDER/api/_organizations-api-reference.md $DOCS/cloud/manage/api/organizations-api-reference.md
cp $PLACEHOLDER/api/_services-api-reference.md      $DOCS/cloud/manage/api/services-api-reference.md

cp $PLACEHOLDER/changelog/_index.md                 $DOCS/whats-new/changelog/index.md
echo "Copying completed"
echo "----END----"
