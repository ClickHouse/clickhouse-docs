---
description: '指定されたクラスタ内の複数のノードから、HDFS 上のファイルを並列に処理できるようにします。'
sidebar_label: 'hdfsCluster'
sidebar_position: 81
slug: /sql-reference/table-functions/hdfsCluster
title: 'hdfsCluster'
doc_type: 'reference'
---



# hdfsCluster テーブル関数

指定したクラスタ内の複数のノードで、HDFS 上のファイルを並列処理できるようにします。イニシエーター側では、クラスタ内のすべてのノードへの接続を確立し、HDFS ファイルパス中のアスタリスクを展開して、各ファイルを動的に割り当てます。ワーカーノード側では、処理すべき次のタスクをイニシエーターに問い合わせ、そのタスクを処理します。すべてのタスクが完了するまで、これを繰り返します。



## 構文 {#syntax}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```


## 引数 {#arguments}

| 引数       | 説明                                                                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cluster_name` | リモートサーバーおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスタ名。                                                                                                                                                                                |
| `URI`          | ファイルまたは複数のファイルへのURI。読み取り専用モードでは次のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}`。ここで `N`, `M` は数値、`abc`, `def` は文字列です。詳細については [パス内のワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path) を参照してください。 |
| `format`       | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                                                                                                                                |
| `structure`    | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'` です。                                                                                                                                                                                                    |


## 戻り値 {#returned_value}

指定されたファイルからデータを読み取るための、指定された構造を持つテーブル。


## 例 {#examples}

1.  `cluster_simple`という名前のClickHouseクラスタがあり、HDFS上に以下のURIを持つ複数のファイルがあるとします:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  これらのファイルの行数をクエリします:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  これら2つのディレクトリ内のすべてのファイルの行数をクエリします:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルリストに先頭ゼロ付きの数値範囲が含まれている場合は、各桁ごとに中括弧を使用した構文を使用するか、`?`を使用してください。
:::


## 関連項目 {#related}

- [HDFSエンジン](../../engines/table-engines/integrations/hdfs.md)
- [HDFSテーブル関数](../../sql-reference/table-functions/hdfs.md)
