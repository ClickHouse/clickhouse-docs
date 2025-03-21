---
description: '包含在本地服务器上运行的工作负载的信息的系统表。'
slug: /operations/system-tables/workloads
title: 'system.workloads'
keywords: ['系统表', '工作负载']
---

包含在本地服务器上运行的 [工作负载](/operations/workload-scheduling.md#workload_entity_storage) 的信息。该表为每个工作负载包含一行。

示例：

``` sql
SELECT *
FROM system.workloads
FORMAT Vertical
```

``` text
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

列：

- `name`（`String`） - 工作负载名称。
- `parent`（`String`） - 父工作负载名称。
- `create_query`（`String`） - 工作负载的定义。
