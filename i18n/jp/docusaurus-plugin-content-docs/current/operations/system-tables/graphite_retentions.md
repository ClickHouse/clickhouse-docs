---
description: 'グラファイトマージツリータイプのエンジンを持つテーブルに使用される `graphite_rollup` パラメータに関する情報を含むシステムテーブルです。'
keywords:
- 'system table'
- 'graphite_retentions'
slug: '/operations/system-tables/graphite_retentions'
title: 'system.graphite_retentions'
---



この情報は、[graphite_rollup](../../operations/server-configuration-parameters/settings.md#graphite) パラメーターに関するもので、[ *GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md) エンジンを使用するテーブルで使用されます。

カラム:

- `config_name` (String) - `graphite_rollup` パラメーター名。
- `regexp` (String) - メトリック名のためのパターン。
- `function` (String) - 集約関数の名前。
- `age` (UInt64) - データの最小年齢（秒）。
- `precision` (UInt64) - データの年齢を定義する精度（秒）。
- `priority` (UInt16) - パターンの優先順位。
- `is_default` (UInt8) - パターンがデフォルトであるかどうか。
- `Tables.database` (Array(String)) - `config_name` パラメーターを使用するデータベーステーブルの名前の配列。
- `Tables.table` (Array(String)) - `config_name` パラメーターを使用するテーブル名の配列。
