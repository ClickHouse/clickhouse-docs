---
description: '`CREATE NAMED COLLECTION` 语句文档'
sidebar_label: 'NAMED COLLECTION'
slug: /sql-reference/statements/create/named-collection
title: 'CREATE NAMED COLLECTION'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

# CREATE NAMED COLLECTION \{#create-named-collection\}

创建新的命名集合。

**语法**

```sql
CREATE NAMED COLLECTION [IF NOT EXISTS] name [ON CLUSTER cluster] AS
key_name1 = 'some value' [[NOT] OVERRIDABLE],
key_name2 = 'some value' [[NOT] OVERRIDABLE],
key_name3 = 'some value' [[NOT] OVERRIDABLE],
...
```

**示例**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2' OVERRIDABLE;
```

**相关语句**

* [CREATE NAMED COLLECTION](/sql-reference/statements/alter/named-collection)
* [DROP NAMED COLLECTION](/sql-reference/statements/drop#drop-function)

**另请参阅**

* [命名集合指南](/operations/named-collections.md)
