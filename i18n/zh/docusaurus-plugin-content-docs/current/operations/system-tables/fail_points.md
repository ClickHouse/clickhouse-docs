---
title: 'system.fail_points'
slug: '/en/operations/system-tables/fail_points'
description: '包含所有可用 failpoint 及其类型和当前状态的列表。'
keywords: ['system table', 'fail_points', 'failpoint', 'testing', 'debug']
doc_type: 'reference'
---

# system.fail_points \{#fail_points\}

列出服务器中已注册的所有可用 failpoint，以及它们的类型及当前是否已启用。

可以在运行时使用 `SYSTEM ENABLE FAILPOINT` 和 `SYSTEM DISABLE FAILPOINT` 语句来启用或禁用 failpoint。

## 列 \{#columns\}

- `name` ([String](../../sql-reference/data-types/string.md)) — failpoint 的名称。
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — failpoint 的类型。可能的取值：
  - `'once'` — 触发一次后自动禁用。
  - `'regular'` — 每次命中该 failpoint 时都会触发。
  - `'pauseable_once'` — 阻塞执行一次，直到显式恢复。
  - `'pauseable'` — 每次命中该 failpoint 时都会阻塞执行，直到显式恢复。
- `enabled` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 当前 failpoint 是否已启用。`1` 表示启用，`0` 表示禁用。

## 示例 \{#example\}

```sql
SYSTEM ENABLE FAILPOINT replicated_merge_tree_insert_retry_pause;
SELECT * FROM system.fail_points WHERE enabled = 1
```

```text
┌─name──────────────────────────────────────┬─type────────────┬─enabled─┐
│ replicated_merge_tree_insert_retry_pause  │ pauseable_once  │       1 │
└───────────────────────────────────────────┴─────────────────┴─────────┘
```
