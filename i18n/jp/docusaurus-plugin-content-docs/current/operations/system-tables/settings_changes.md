---
description: '以前の ClickHouse バージョンでの設定変更に関する情報を含むシステムテーブル。'
keywords: ['system table', 'settings_changes']
slug: /operations/system-tables/settings_changes
title: 'system.settings_changes'
---


# system.settings_changes

以前の ClickHouse バージョンでの設定変更に関する情報を含みます。

カラム:

- `type` ([Enum](../../sql-reference/data-types/enum.md)) - 設定の種類: `Core` (一般的な / クエリ設定)、`MergeTree`。
- `version` ([String](../../sql-reference/data-types/string.md)) — 設定が変更された ClickHouse のバージョン
- `changes` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — 設定変更の説明: (設定名, 前の値, 新しい値, 変更の理由)

**例**

```sql
SELECT *
FROM system.settings_changes
WHERE version = '23.5'
FORMAT Vertical
```

```text
Row 1:
──────
type:    Core
version: 23.5
changes: [('input_format_parquet_preserve_order','1','0','Parquet リーダーに行の並べ替えを許可してより良い並列性を得る。'),('parallelize_output_from_storages','0','1','ファイル/url/s3/etc. から読み込むクエリを実行する際に並列性を許可する。これにより行が再編成される可能性があります。'),('use_with_fill_by_sorting_prefix','0','1','ORDER BY 句の WITH FILL カラムの前にあるカラムがソートプレフィックスを形成します。ソートプレフィックスに異なる値を持つ行は独立して埋められます。'),('output_format_parquet_compliant_nested_types','0','1','出力 Parquet ファイルスキーマの内部フィールド名を変更します。')]
```

**関連情報**

- [Settings](/operations/system-tables/overview#system-tables-introduction)
- [system.settings](settings.md)
