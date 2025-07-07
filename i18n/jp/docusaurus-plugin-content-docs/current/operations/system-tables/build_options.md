---
'description': 'ClickHouseサーバーのビルドオプションに関する情報を含むシステムテーブル'
'slug': '/operations/system-tables/build_options'
'title': 'system.build_options'
'keywords':
- 'system table'
- 'build_options'
---



ClickHouseサーバーのビルドオプションに関する情報を含みます。

カラム:

- `name` (String) — ビルドオプションの名前、例: `USE_ODBC`
- `value` (String) — ビルドオプションの値、例: `1`

**例**

```sql
SELECT * FROM system.build_options LIMIT 5
```

```text
┌─name─────────────┬─value─┐
│ USE_BROTLI       │ 1     │
│ USE_BZIP2        │ 1     │
│ USE_CAPNP        │ 1     │
│ USE_CASSANDRA    │ 1     │
│ USE_DATASKETCHES │ 1     │
└──────────────────┴───────┘
```
