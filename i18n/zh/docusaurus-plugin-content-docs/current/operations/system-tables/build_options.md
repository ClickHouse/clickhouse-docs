包含有关 ClickHouse 服务器构建选项的信息。

列：

- `name` (String) — 构建选项的名称，例如 `USE_ODBC`
- `value` (String) — 构建选项的值，例如 `1`

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
