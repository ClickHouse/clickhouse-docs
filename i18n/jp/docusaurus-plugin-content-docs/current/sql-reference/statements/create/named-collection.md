---
'description': 'Documentation for CREATE NAMED COLLECTION'
'sidebar_label': 'NAMED COLLECTION'
'slug': '/sql-reference/statements/create/named-collection'
'title': 'CREATE NAMED COLLECTION'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />


# 名付けられたコレクションの作成

新しい名付けられたコレクションを作成します。

**構文**

```sql
CREATE NAMED COLLECTION [IF NOT EXISTS] name [ON CLUSTER cluster] AS
key_name1 = 'some value' [[NOT] OVERRIDABLE],
key_name2 = 'some value' [[NOT] OVERRIDABLE],
key_name3 = 'some value' [[NOT] OVERRIDABLE],
...
```

**例**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2' OVERRIDABLE;
```

**関連するステートメント**

- [名付けられたコレクションの作成](/sql-reference/statements/alter/named-collection)
- [名付けられたコレクションの削除](/sql-reference/statements/drop#drop-function)

**その他の情報**

- [名付けられたコレクションのガイド](/operations/named-collections.md)
