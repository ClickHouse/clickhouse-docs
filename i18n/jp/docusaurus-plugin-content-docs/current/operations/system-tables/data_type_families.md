---
'description': 'システム テーブルは、サポートされているデータ型に関する情報を含んでいます'
'keywords':
- 'system table'
- 'data_type_families'
'slug': '/operations/system-tables/data_type_families'
'title': 'system.data_type_families'
'doc_type': 'reference'
---

含まれている情報はサポートされている [データタイプ](../../sql-reference/data-types/index.md) についてです。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — データタイプ名。
- `case_insensitive` ([UInt8](../../sql-reference/data-types/int-uint.md)) — データタイプ名をクエリで大文字小文字を区別せずに使用できるかどうかを示すプロパティ。例えば、`Date` と `date` はどちらも有効です。
- `alias_to` ([String](../../sql-reference/data-types/string.md)) — `name` がエイリアスであるデータタイプ名。

**例**

```sql
SELECT * FROM system.data_type_families WHERE alias_to = 'String'
```

```text
┌─name───────┬─case_insensitive─┬─alias_to─┐
│ LONGBLOB   │                1 │ String   │
│ LONGTEXT   │                1 │ String   │
│ TINYTEXT   │                1 │ String   │
│ TEXT       │                1 │ String   │
│ VARCHAR    │                1 │ String   │
│ MEDIUMBLOB │                1 │ String   │
│ BLOB       │                1 │ String   │
│ TINYBLOB   │                1 │ String   │
│ CHAR       │                1 │ String   │
│ MEDIUMTEXT │                1 │ String   │
└────────────┴──────────────────┴──────────┘
```

**関連情報**

- [構文](../../sql-reference/syntax.md) — サポートされている構文に関する情報。
