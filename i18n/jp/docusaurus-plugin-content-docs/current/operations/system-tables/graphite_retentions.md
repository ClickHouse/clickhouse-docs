---
description: 'システムテーブルで、`GraphiteMergeTree`タイプエンジンを使用するテーブルで使われる`graphite_rollup`パラメータに関する情報を含みます。'
keywords: ['system table', 'graphite_retentions']
slug: /operations/system-tables/graphite_retentions
title: 'system.graphite_retentions'
---

Contains information about parameters [graphite_rollup](../../operations/server-configuration-parameters/settings.md#graphite) which are used in tables with [\*GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md) engines.

Columns:

- `config_name` (String) - `graphite_rollup` パラメータ名。
- `regexp` (String) - メトリック名のパターン。
- `function` (String) - 集計関数の名前。
- `age` (UInt64) - データの最小年齢（秒）。
- `precision` (UInt64) - データの年齢を定義するための精度（秒）。
- `priority` (UInt16) - パターンの優先度。
- `is_default` (UInt8) - パターンがデフォルトかどうか。
- `Tables.database` (Array(String)) - `config_name` パラメータを使用するデータベーステーブルの名前の配列。
- `Tables.table` (Array(String)) - `config_name` パラメータを使用するテーブル名の配列。
