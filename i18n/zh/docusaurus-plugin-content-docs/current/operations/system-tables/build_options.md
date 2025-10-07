---
'description': '系统表包含有关 ClickHouse 服务器构建选项的信息。'
'slug': '/operations/system-tables/build_options'
'title': 'system.build_options'
'keywords':
- 'system table'
- 'build_options'
'doc_type': 'reference'
---

包含有关 ClickHouse 服务器构建选项的信息。

列：

- `name`（字符串） — 构建选项的名称，例如 `USE_ODBC`
- `value`（字符串） — 构建选项的值，例如 `1`

**示例**

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
