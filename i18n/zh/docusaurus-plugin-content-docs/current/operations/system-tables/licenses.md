---
description: '包含位于 ClickHouse 源代码 contrib 目录下的第三方库的许可证的系统表。'
slug: /operations/system-tables/licenses
title: 'system.licenses'
keywords: ['系统表', '许可证']
---

包含位于 [contrib](https://github.com/ClickHouse/ClickHouse/tree/master/contrib) 目录下的第三方库的许可证。

列：

- `library_name` ([String](../../sql-reference/data-types/string.md)) — 与其连接的许可证的库名称。
- `license_type` ([String](../../sql-reference/data-types/string.md)) — 许可证类型 — 例如 Apache, MIT。
- `license_path` ([String](../../sql-reference/data-types/string.md)) — 指向许可证文本文件的路径。
- `license_text` ([String](../../sql-reference/data-types/string.md)) — 许可证文本。

**示例**

``` sql
SELECT library_name, license_type, license_path FROM system.licenses LIMIT 15
```

``` text
┌─library_name───────┬─license_type─┬─license_path────────────────────────┐
│ aws-c-common       │ Apache       │ /contrib/aws-c-common/LICENSE       │
│ base64             │ BSD 2-clause │ /contrib/aklomp-base64/LICENSE      │
│ brotli             │ MIT          │ /contrib/brotli/LICENSE             │
│ [...]              │ [...]        │ [...]                               │
└────────────────────┴──────────────┴─────────────────────────────────────┘

```
