---
description: 'MOVE アクセスエンティティステートメントのドキュメント'
sidebar_label: 'MOVE'
sidebar_position: 54
slug: /sql-reference/statements/move
title: 'MOVE アクセスエンティティステートメント'
doc_type: 'reference'
---

# MOVE access entity ステートメント \\{#move-access-entity-statement\\}

このステートメントを使用すると、ある access storage から別の access storage へ access entity を移動できます。

構文:

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

現在、ClickHouse には5種類のアクセスストレージが存在します：

* `local_directory`
* `memory`
* `replicated`
* `users_xml` (ro)
* `ldap` (ro)

例：

```sql
MOVE USER test TO local_directory
```

```sql
MOVE ROLE test TO memory
```
