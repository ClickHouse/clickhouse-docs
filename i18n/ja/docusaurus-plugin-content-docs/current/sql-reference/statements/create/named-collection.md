---
slug: /sql-reference/statements/create/named-collection
sidebar_label: 名前付きコレクション
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

# 名前付きコレクションの作成

新しい名前付きコレクションを作成します。

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

- [名前付きコレクションの作成](/sql-reference/statements/alter/named-collection)
- [名前付きコレクションの削除](/sql-reference/statements/drop#drop-function)


**参考**

- [名前付きコレクションガイド](/operations/named-collections.md)
