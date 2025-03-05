---
slug: /sql-reference/table-functions/hdfsCluster
sidebar_position: 81
sidebar_label: hdfsCluster
title: "hdfsCluster"
description: "指定されたクラスター内の多数のノードからHDFSのファイルを並行して処理することを可能にします。"
---


# hdfsCluster テーブル関数

指定されたクラスター内の多数のノードからHDFSのファイルを並行して処理することを可能にします。イニシエーターはクラスター内のすべてのノードへの接続を作成し、HDFSファイルパス内のアスタリスクを暴露し、各ファイルを動的に配送します。ワーカーノードはイニシエーターに次の処理タスクを問い合わせ、それを処理します。これがすべてのタスクが完了するまで繰り返されます。

**構文**

``` sql
hdfsCluster(cluster_name, URI, format, structure)
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスおよび接続パラメータのセットを構築するために使用されるクラスターの名前。
- `URI` — 1つまたは複数のファイルへのURI。読み取り専用モードで以下のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` 及び `{N..M}` ここで `N`, `M` — 数字、`abc`, `def` — 文字列。詳細については [Wildcards In Path](../../engines/table-engines/integrations/s3.md#wildcards-in-path) を参照してください。
- `format` — ファイルの [フォーマット](../../interfaces/formats.md#formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定されたファイル内のデータを読み取るための指定された構造のテーブル。

**例**

1.  `cluster_simple` という名前のClickHouseクラスターがあり、HDFS上に以下のURIを持ついくつかのファイルがあると仮定します:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  これらのファイルにおける行数をクエリします:

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  これらの2つのディレクトリ内のすべてのファイルにおける行数をクエリします:

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭ゼロを含む数字範囲がある場合、各数字のために中括弧を使用するか、`?` を使用してください。
:::

**関連項目**

- [HDFS エンジン](../../engines/table-engines/integrations/hdfs.md)
- [HDFS テーブル関数](../../sql-reference/table-functions/hdfs.md)
