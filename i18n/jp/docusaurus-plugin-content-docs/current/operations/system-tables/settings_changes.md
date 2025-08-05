---
description: 'System table containing information about setting changes in previous
  ClickHouse versions.'
keywords:
- 'system table'
- 'settings_changes'
slug: '/operations/system-tables/settings_changes'
title: 'system.settings_changes'
---




# system.settings_changes

以前の ClickHouse バージョンでの設定変更に関する情報が含まれています。

カラム:

- `type` ([Enum](../../sql-reference/data-types/enum.md)) - 設定のタイプ: `Core` (一般 / クエリ設定), `MergeTree`。
- `version` ([String](../../sql-reference/data-types/string.md)) — 設定が変更された ClickHouse のバージョン
- `changes` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — 設定変更の説明: (設定名, 前の値, 新しい値, 変更理由)

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
changes: [('input_format_parquet_preserve_order','1','0','Parquet リーダーが行の順序を再編成してより良い並列性を実現できるようにします。'),('parallelize_output_from_storages','0','1','ファイル/url/s3 などから読み込むクエリを実行する際に並列処理を許可します。これにより行の順序が再編成される場合があります。'),('use_with_fill_by_sorting_prefix','0','1','ORDER BY 句の WITH FILL カラムに先行するカラムがソートプレフィックスを形成します。ソートプレフィックスの値が異なる行は独立して埋められます。'),('output_format_parquet_compliant_nested_types','0','1','出力 Parquet ファイルスキーマ内の内部フィールド名を変更します。')]
```

**関連情報**

- [設定](/operations/system-tables/overview#system-tables-introduction)
- [system.settings](settings.md)
