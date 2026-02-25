---
title: 'system.fail_points'
slug: '/en/operations/system-tables/fail_points'
description: '利用可能なすべてのフェイルポイントと、その種別および現在の状態の一覧を提供します。'
keywords: ['system table', 'fail_points', 'failpoint', 'テスト', 'デバッグ']
doc_type: 'reference'
---

# system.fail_points \{#fail_points\}

サーバーに登録されている利用可能なすべてのフェイルポイントを列挙し、それぞれの種類と現在の有効状態を示します。

フェイルポイントは、実行時に `SYSTEM ENABLE FAILPOINT` および `SYSTEM DISABLE FAILPOINT` 文を使用して有効化および無効化できます。

## カラム \{#columns\}

- `name` ([String](/docs/en/sql-reference/data-types/string.md)) — フェイルポイントの名前。
- `type` ([Enum8](/docs/en/sql-reference/data-types/enum.md)) — フェイルポイントの種別。取り得る値は次のとおりです：
  - `'once'` — 1 回だけトリガーされ、その後自動的に無効化される。
  - `'regular'` — フェイルポイントに到達するたびにトリガーされる。
  - `'pauseable_once'` — 明示的に再開されるまで、1 回だけ実行をブロックする。
  - `'pauseable'` — 明示的に再開されるまで、フェイルポイントに到達するたびに実行をブロックする。
- `enabled` ([UInt8](/docs/en/sql-reference/data-types/int-uint.md)) — 現在フェイルポイントが有効かどうか。`1` の場合は有効、`0` の場合は無効。

## 例 \{#example\}

```sql
SYSTEM ENABLE FAILPOINT replicated_merge_tree_insert_retry_pause;
SELECT * FROM system.fail_points WHERE enabled = 1
```

```text
┌─name──────────────────────────────────────┬─type────────────┬─enabled─┐
│ replicated_merge_tree_insert_retry_pause  │ pauseable_once  │       1 │
└───────────────────────────────────────────┴─────────────────┴─────────┘
```
