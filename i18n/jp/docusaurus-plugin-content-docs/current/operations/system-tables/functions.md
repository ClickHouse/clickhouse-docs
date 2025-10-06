---
'description': 'システムテーブルは、通常および集約関数に関する情報を含んでいます。'
'keywords':
- 'system table'
- 'functions'
'slug': '/operations/system-tables/functions'
'title': 'system.functions'
'doc_type': 'reference'
---

含まれている情報は、通常の関数と集約関数に関するものです。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) – 関数の名前。
- `is_aggregate` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 関数が集約関数であるかどうか。
- `case_insensitive`, ([UInt8](../../sql-reference/data-types/int-uint.md)) - 関数名が大文字小文字を区別せずに使用できるかどうか。
- `alias_to`, ([String](../../sql-reference/data-types/string.md)) - 関数名がエイリアスである場合の元の関数名。
- `create_query`, ([String](../../sql-reference/data-types/enum.md)) - 使用されていない。
- `origin`, ([Enum8](../../sql-reference/data-types/string.md)) - 使用されていない。
- `description`, ([String](../../sql-reference/data-types/string.md)) - 関数が何をするのかの高レベルの説明。
- `syntax`, ([String](../../sql-reference/data-types/string.md)) - 関数のシグネチャ。
- `arguments`, ([String](../../sql-reference/data-types/string.md)) - 関数が取る引数。
- `returned_value`, ([String](../../sql-reference/data-types/string.md)) - 関数が返すもの。
- `examples`, ([String](../../sql-reference/data-types/string.md)) - 関数の使用例。
- `introduced_in`, ([String](../../sql-reference/data-types/string.md)) - 関数が初めて導入された ClickHouse バージョン。
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

5 rows in set. Elapsed: 0.002 sec.
```
