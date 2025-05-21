---
description: '指定されたクラスターの複数のノードからHDFSのファイルを並行処理することを可能にします。'
sidebar_label: 'hdfsCluster'
sidebar_position: 81
slug: /sql-reference/table-functions/hdfsCluster
title: 'hdfsCluster'
---


# hdfsCluster テーブル関数

指定されたクラスターの複数のノードからHDFSのファイルを並行処理することを可能にします。イニシエーターでは、クラスター内のすべてのノードへの接続を作成し、HDFSファイルパスのアスタリスクを開示し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクを尋ねて、それを処理します。このプロセスはすべてのタスクが完了するまで繰り返されます。

**構文**

```sql
hdfsCluster(cluster_name, URI, format, structure)
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。
- `URI` — ファイルまたは複数のファイルへのURI。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}`（ここで `N`, `M` は数字、`abc`, `def` は文字列です）。詳細については [Wildcards In Path](../../engines/table-engines/integrations/s3.md#wildcards-in-path) を参照してください。
- `format` — ファイルの [format](/sql-reference/formats)。
- `structure` — テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定されたファイル内のデータを読み取るための指定された構造のテーブル。

**例**

1.  ClickHouseクラスター `cluster_simple` があり、HDFS上に次のURIのファイルがあると仮定します：

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  これらのファイルの行数をクエリします：

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  これらの二つのディレクトリ内のすべてのファイルの行数をクエリします：

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭ゼロを含む数値の範囲がある場合は、各桁ごとにブレースを使った構成を使用するか、`?` を使用してください。
:::

**関連情報**

- [HDFSエンジン](../../engines/table-engines/integrations/hdfs.md)
- [HDFSテーブル関数](../../sql-reference/table-functions/hdfs.md)
