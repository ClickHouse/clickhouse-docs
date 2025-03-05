---
description: "ローカルサーバーに存在するワークロードに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/workloads
title: "system.workloads"
keywords: ["システムテーブル", "ワークロード"]
---

ローカルサーバーに存在する [ワークロード](/operations/workload-scheduling.md#workload_entity_storage) に関する情報を含みます。このテーブルには、各ワークロードに対して1行が含まれます。

例:

``` sql
SELECT *
FROM system.workloads
FORMAT Vertical
```

``` text
Row 1:
──────
name:         production
parent:       all
create_query: CREATE WORKLOAD production IN `all` SETTINGS weight = 9

Row 2:
──────
name:         development
parent:       all
create_query: CREATE WORKLOAD development IN `all`

Row 3:
──────
name:         all
parent:
create_query: CREATE WORKLOAD `all`
```

カラム:

- `name` (`String`) - ワークロード名。
- `parent` (`String`) - 親ワークロード名。
- `create_query` (`String`) - ワークロードの定義。
