---
'description': 'System table containing licenses of third-party libraries that are
  located in the contrib directory of ClickHouse sources.'
'keywords':
- 'system table'
- 'licenses'
'slug': '/operations/system-tables/licenses'
'title': '系统.许可证'
---




# system.licenses

包含位于 ClickHouse 源代码的 [contrib](https://github.com/ClickHouse/ClickHouse/tree/master/contrib) 目录中的第三方库的许可证。

列：

- `library_name` ([String](../../sql-reference/data-types/string.md)) — 与许可证相关的库名称。
- `license_type` ([String](../../sql-reference/data-types/string.md)) — 许可证类型 — 例如 Apache、MIT。
- `license_path` ([String](../../sql-reference/data-types/string.md)) — 许可证文本文件的路径。
- `license_text` ([String](../../sql-reference/data-types/string.md)) — 许可证文本。

**示例**

```sql
SELECT library_name, license_type, license_path FROM system.licenses LIMIT 15
```

```text
┌─library_name───────┬─license_type─┬─license_path────────────────────────┐
│ aws-c-common       │ Apache       │ /contrib/aws-c-common/LICENSE       │
│ base64             │ BSD 2-clause │ /contrib/aklomp-base64/LICENSE      │
│ brotli             │ MIT          │ /contrib/brotli/LICENSE             │
│ [...]              │ [...]        │ [...]                               │
└────────────────────┴──────────────┴─────────────────────────────────────┘

```
