---
description: 'Документация по оператору CREATE NAMED COLLECTION'
sidebar_label: 'NAMED COLLECTION'
slug: /sql-reference/statements/create/named-collection
title: 'CREATE NAMED COLLECTION'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

# CREATE NAMED COLLECTION \{#create-named-collection\}

Создает новую именованную коллекцию.

**Синтаксис**

```sql
CREATE NAMED COLLECTION [IF NOT EXISTS] name [ON CLUSTER cluster] AS
key_name1 = 'some value' [[NOT] OVERRIDABLE],
key_name2 = 'some value' [[NOT] OVERRIDABLE],
key_name3 = 'some value' [[NOT] OVERRIDABLE],
...
```

**Пример**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2' OVERRIDABLE;
```

**Связанные операторы**

* [CREATE NAMED COLLECTION](/sql-reference/statements/alter/named-collection)
* [DROP NAMED COLLECTION](/sql-reference/statements/drop#drop-function)

**См. также**

* [Руководство по именованным коллекциям](/operations/named-collections.md)
