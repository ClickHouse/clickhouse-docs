---
description: "以前のClickHouseバージョンにおける設定変更に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/settings_changes
title: "system.settings_changes"
keywords: ["system table", "settings_changes"]
---

以前のClickHouseバージョンにおける設定変更に関する情報を含みます。

カラム:

- `type` ([Enum](../../sql-reference/data-types/enum.md)) - 設定タイプ: `Core` (一般的な / クエリ設定), `MergeTree`。
- `version` ([String](../../sql-reference/data-types/string.md)) — 設定が変更されたClickHouseバージョン
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
changes: [('input_format_parquet_preserve_order','1','0','パーケットリーダーが行を再配置して並列性を向上させることを許可する。'),('parallelize_output_from_storages','0','1','ファイル/URL/S3/etc. から読み取るクエリを実行する際に並列性を許可する。これにより行が再配置される可能性があります。'),('use_with_fill_by_sorting_prefix','0','1','ORDER BY句のWITH FILLカラムに先行するカラムはソートプレフィックスを形成します。ソートプレフィックスの異なる値を持つ行は独立して埋められます。'),('output_format_parquet_compliant_nested_types','0','1','出力パーケットファイルスキーマ内の内部フィールド名を変更します。')]
```

**関連情報**

- [Settings](/operations/system-tables/overview#system-tables-introduction)
- [system.settings](settings.md)
