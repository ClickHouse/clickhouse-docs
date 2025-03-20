---
slug: /sql-reference/statements/alter/named-collection
sidebar_label: 'ИМЕННАЯ КОЛЛЕКЦИЯ'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />


# ALTER ИМЕННАЯ КОЛЛЕКЦИЯ

Этот запрос предназначен для изменения уже существующих именованных коллекций.

**Синтаксис**

```sql
ALTER NAMED COLLECTION [IF EXISTS] name [ON CLUSTER cluster]
[ SET
key_name1 = 'some value' [[NOT] OVERRIDABLE],
key_name2 = 'some value' [[NOT] OVERRIDABLE],
key_name3 = 'some value' [[NOT] OVERRIDABLE],
... ] |
[ DELETE key_name4, key_name5, ... ]
```

**Пример**

```sql
CREATE NAMED COLLECTION foobar AS a = '1' NOT OVERRIDABLE, b = '2';

ALTER NAMED COLLECTION foobar SET a = '2' OVERRIDABLE, c = '3';

ALTER NAMED COLLECTION foobar DELETE b;
```
