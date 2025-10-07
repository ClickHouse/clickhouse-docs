---
'description': 'システム テーブルは、`GraphiteMergeTree` タイプ エンジンを使用するテーブルで使用されるパラメータ `graphite_rollup`
  に関する情報を含んでいます。'
'keywords':
- 'system table'
- 'graphite_retentions'
'slug': '/operations/system-tables/graphite_retentions'
'title': 'system.graphite_retentions'
'doc_type': 'reference'
---

Contains information about parameters [graphite_rollup](../../operations/server-configuration-parameters/settings.md#graphite) which are used in tables with [\*GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md) engines.

Columns:

- `config_name` (String) - `graphite_rollup` パラメータ名。
- `regexp` (String) - メトリック名のパターン。
- `function` (String) - 集計関数の名前。
- `age` (UInt64) - データの最小年齢（秒単位）。
- `precision` (UInt64) - データの年齢を秒単位でどれだけ正確に定義するか。
- `priority` (UInt16) - パターンの優先度。
- `is_default` (UInt8) - パターンがデフォルトであるかどうか。
- `Tables.database` (Array(String)) - `config_name` パラメータを使用するデータベーステーブルの名前の配列。
- `Tables.table` (Array(String)) - `config_name` パラメータを使用するテーブル名の配列。
