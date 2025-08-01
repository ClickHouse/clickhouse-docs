---
description: 'System table containing licenses of third-party libraries that are
  located in the contrib directory of ClickHouse sources.'
keywords:
- 'system table'
- 'licenses'
slug: '/operations/system-tables/licenses'
title: 'system.licenses'
---




# system.licenses

ClickHouseソースの[contrib](https://github.com/ClickHouse/ClickHouse/tree/master/contrib)ディレクトリにあるサードパーティライブラリのライセンスを含みます。

カラム:

- `library_name` ([String](../../sql-reference/data-types/string.md)) — ライセンスが関連付けられているライブラリの名前。
- `license_type` ([String](../../sql-reference/data-types/string.md)) — ライセンスの種類 — 例: Apache, MIT。
- `license_path` ([String](../../sql-reference/data-types/string.md)) — ライセンステキストが含まれるファイルへのパス。
- `license_text` ([String](../../sql-reference/data-types/string.md)) — ライセンステキスト。

**例**

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
