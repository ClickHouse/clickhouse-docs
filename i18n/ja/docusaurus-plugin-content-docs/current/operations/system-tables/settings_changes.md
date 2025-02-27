---
description: "以前の ClickHouse バージョンにおける設定変更に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/settings_changes
title: "settings_changes"
keywords: ["システムテーブル", "settings_changes"]
---

以前の ClickHouse バージョンにおける設定変更に関する情報を含みます。

カラム:

- `type` ([Enum](../../sql-reference/data-types/enum.md)) - 設定の種類: `Core` (一般 / クエリ設定), `MergeTree`.
- `version` ([String](../../sql-reference/data-types/string.md)) — 設定が変更された ClickHouse バージョン
- `changes` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — 設定変更の説明: (設定名, 前の値, 新しい値, 変更理由)

**例**

``` sql
SELECT *
FROM system.settings_changes
WHERE version = '23.5'
FORMAT Vertical
```

``` text
Row 1:
──────
type:    Core
version: 23.5
changes: [('input_format_parquet_preserve_order','1','0','Parquet リーダーに行を再配置してパラレル処理を向上させることを許可。'),('parallelize_output_from_storages','0','1','ファイル/url/s3/etc. から読み取るクエリを実行する際にパラレル処理を許可。これにより行が再配置される可能性があります。'),('use_with_fill_by_sorting_prefix','0','1','ORDER BY 句内の WITH FILL カラムに先行するカラムがソートプレフィックスを形成します。ソートプレフィックス内で異なる値を持つ行は独立して埋められます。'),('output_format_parquet_compliant_nested_types','0','1','出力 Parquet ファイルスキーマ内の内部フィールド名を変更。')]
```

**関連情報**

- [設定](../../operations/settings/overview#session-settings-intro)
- [system.settings](settings.md)
