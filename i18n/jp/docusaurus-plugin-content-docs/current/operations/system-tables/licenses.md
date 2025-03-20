---
description: "ClickHouseのソースのcontribディレクトリにあるサードパーティライブラリのライセンスを含むシステムテーブル。"
slug: /operations/system-tables/licenses
title: "system.licenses"
keywords: ["システムテーブル", "ライセンス"]
---

ClickHouseのソース内の[contrib](https://github.com/ClickHouse/ClickHouse/tree/master/contrib)ディレクトリにあるサードパーティライブラリのライセンスを含みます。

カラム:

- `library_name` ([String](../../sql-reference/data-types/string.md)) — ライセンスに関連付けられたライブラリの名前。
- `license_type` ([String](../../sql-reference/data-types/string.md)) — ライセンスの種類 — 例：Apache、MIT。
- `license_path` ([String](../../sql-reference/data-types/string.md)) — ライセンス文書のファイルへのパス。
- `license_text` ([String](../../sql-reference/data-types/string.md)) — ライセンスの本文。

**例**

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
