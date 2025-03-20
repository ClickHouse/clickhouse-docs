---
slug: /sql-reference/table-functions/hdfsCluster
sidebar_position: 81
sidebar_label: hdfsCluster
title: 'hdfsCluster'
description: '指定されたクラスターの多くのノードからHDFSのファイルを並列で処理することを可能にします。'
---


# hdfsCluster テーブル関数

指定されたクラスターの多くのノードからHDFSのファイルを並列で処理することを可能にします。イニシエーターは、クラスタ内のすべてのノードに接続を作成し、HDFSファイルパス内のアスタリスクを公開し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクを問い合わせ、それを処理します。すべてのタスクが完了するまでこのプロセスは繰り返されます。

**構文**

``` sql
hdfsCluster(cluster_name, URI, format, structure)
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。
- `URI` — ファイルまたは一連のファイルへのURI。読み取り専用モードでは、以下のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}` （ここで `N`, `M` は数字、`abc`, `def` は文字列）。詳細については、[パス内のワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path)を参照してください。
- `format` — ファイルの[フォーマット](/sql-reference/formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定されたファイルからデータを読み取るための指定された構造のテーブル。

**例**

1. ClickHouseクラスター `cluster_simple` があり、HDFSに以下のURIのファイルがあると仮定します:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2. これらのファイルの行数をクエリします:

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. これらの2つのディレクトリのすべてのファイルの行数をクエリします:

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭ゼロのある数値範囲が含まれている場合は、各桁に対して波かっこ構文を使用するか、`?` を使用してください。
:::

**関連項目**

- [HDFSエンジン](../../engines/table-engines/integrations/hdfs.md)
- [HDFSテーブル関数](../../sql-reference/table-functions/hdfs.md)
