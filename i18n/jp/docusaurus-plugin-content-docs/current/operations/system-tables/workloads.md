---
description: 'ローカルサーバー上に存在するワークロードに関する情報を含むシステムテーブル。'
keywords: ['system table', 'workloads']
slug: /operations/system-tables/workloads
title: 'system.workloads'
---


# system.workloads

ローカルサーバー上に存在する [ワークロード](/operations/workload-scheduling.md#workload_entity_storage) に関する情報を含みます。このテーブルは、各ワークロードの行を含んでいます。

例:

```sql
SELECT *
FROM system.workloads
FORMAT Vertical
```

```text
行 1:
──────
name:         production
parent:       all
create_query: CREATE WORKLOAD production IN `all` SETTINGS weight = 9

行 2:
──────
name:         development
parent:       all
create_query: CREATE WORKLOAD development IN `all`

行 3:
──────
name:         all
parent:
create_query: CREATE WORKLOAD `all`
```

カラム:

- `name` (`String`) - ワークロード名。
- `parent` (`String`) - 親ワークロード名。
- `create_query` (`String`) - ワークロードの定義。
