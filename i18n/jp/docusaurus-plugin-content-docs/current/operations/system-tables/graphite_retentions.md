---
description: "システムテーブルは、`GraphiteMergeTree`タイプのエンジンを使用するテーブルで使われるパラメータ `graphite_rollup` に関する情報を含んでいます。"
slug: /operations/system-tables/graphite_retentions
title: "system.graphite_retentions"
keywords: ["system table", "graphite_retentions"]
---

`[*GraphiteMergeTree*](../../engines/table-engines/mergetree-family/graphitemergetree.md)` エンジンを使用するテーブルで使われるパラメータ [graphite_rollup](../../operations/server-configuration-parameters/settings.md#graphite) に関する情報が含まれています。

カラム:

- `config_name` (String) - `graphite_rollup` パラメータ名。
- `regexp` (String) - メトリック名のパターン。
- `function` (String) - 集約関数の名前。
- `age` (UInt64) - データの最小年齢（秒単位）。
- `precision` (UInt64) - データの年齢を定義する精度（秒単位）。
- `priority` (UInt16) - パターンの優先度。
- `is_default` (UInt8) - パターンがデフォルトかどうか。
- `Tables.database` (Array(String)) - `config_name` パラメータを使用するデータベーステーブルの名前の配列。
- `Tables.table` (Array(String)) - `config_name` パラメータを使用するテーブル名の配列。
