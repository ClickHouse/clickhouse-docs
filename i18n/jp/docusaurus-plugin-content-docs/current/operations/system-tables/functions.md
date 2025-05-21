---
description: '通常および集約関数に関する情報を含むシステムテーブル。'
keywords: ['system table', 'functions']
slug: /operations/system-tables/functions
title: 'system.functions'
---

通常および集約関数に関する情報を含みます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) – 関数の名前。
- `is_aggregate` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 関数が集約関数であるかどうか。
- `case_insensitive`, ([UInt8](../../sql-reference/data-types/int-uint.md)) - 関数名が大文字と小文字を区別せずに使用できるかどうか。
- `alias_to`, ([String](../../sql-reference/data-types/string.md)) - 関数名がエイリアスである場合の元の関数名。
- `create_query`, ([String](../../sql-reference/data-types/enum.md)) - 未使用。
- `origin`, ([Enum8](../../sql-reference/data-types/string.md)) - 未使用。
- `description`, ([String](../../sql-reference/data-types/string.md)) - 関数が何をするかの高レベルな説明。
- `syntax`, ([String](../../sql-reference/data-types/string.md)) - 関数のシグネチャ。
- `arguments`, ([String](../../sql-reference/data-types/string.md)) - 関数が受け取る引数。
- `returned_value`, ([String](../../sql-reference/data-types/string.md)) - 関数が返す値。
- `examples`, ([String](../../sql-reference/data-types/string.md)) - 関数の使用例。
- `introduced_in`, ([String](../../sql-reference/data-types/string.md)) - 関数が初めて導入された ClickHouse のバージョン。
- `categories`, ([String](../../sql-reference/data-types/string.md)) - 関数のカテゴリ。

**例**

```sql
 SELECT name, is_aggregate, is_deterministic, case_insensitive, alias_to FROM system.functions LIMIT 5;
```

```text
┌─name─────────────────────┬─is_aggregate─┬─is_deterministic─┬─case_insensitive─┬─alias_to─┐
│ BLAKE3                   │            0 │                1 │                0 │          │
│ sipHash128Reference      │            0 │                1 │                0 │          │
│ mapExtractKeyLike        │            0 │                1 │                0 │          │
│ sipHash128ReferenceKeyed │            0 │                1 │                0 │          │
│ mapPartialSort           │            0 │                1 │                0 │          │
└──────────────────────────┴──────────────┴──────────────────┴──────────────────┴──────────┘

5 行の結果。経過時間: 0.002 秒。
```
