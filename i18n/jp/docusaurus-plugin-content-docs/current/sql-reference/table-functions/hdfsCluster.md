---
description: '指定したクラスター内の複数ノードから HDFS 上のファイルを並列処理できるようにします。'
sidebar_label: 'hdfsCluster'
sidebar_position: 81
slug: /sql-reference/table-functions/hdfsCluster
title: 'hdfsCluster'
doc_type: 'reference'
---



# hdfsCluster テーブル関数 {#hdfscluster-table-function}

指定したクラスター内の複数ノードから、HDFS 上のファイルを並列に処理できます。イニシエーターでは、クラスター内のすべてのノードへの接続を確立し、HDFS のファイルパスに含まれるアスタリスクを展開して、各ファイルを動的に振り分けます。ワーカーノードでは、処理すべき次のタスクをイニシエーターに問い合わせ、そのタスクを処理します。これは、すべてのタスクが完了するまで繰り返されます。



## 構文 {#syntax}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```


## 引数 {#arguments}

| 引数           | 説明                                                                                                                                                                                                                                                                                               |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name` | リモートおよびローカルサーバーへのアドレスと接続パラメータの集合を構成するために使用されるクラスター名。                                                                                                                                                                                            |
| `URI`          | 1 つまたは複数のファイルを指す URI。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}`。ここで `N`, `M` は数値、`abc`, `def` は文字列です。詳細は [Wildcards In Path](../../engines/table-engines/integrations/s3.md#wildcards-in-path) を参照してください。 |
| `format`       | ファイルの[フォーマット](/sql-reference/formats)。                                                                                                                                                                                                                                                |
| `structure`    | テーブルの構造。形式: `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                             |



## 返される値 {#returned_value}

指定した構造を持ち、指定したファイル内のデータを読み取るためのテーブル。



## 例 {#examples}

1. `cluster_simple` という名前の ClickHouse クラスターと、HDFS 上に次の URI を持つ複数のファイルがあるとします:

* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;3&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;3&#39;

2. これらのファイル内の行数をクエリで取得します:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. これら 2 つのディレクトリ内にあるすべてのファイルの行数をクエリします。

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイル一覧に先頭ゼロ付きの数値範囲が含まれている場合は、各桁を個別に波かっこで囲む構文を用いるか、`?` を使用してください。
:::


## 関連項目 {#related}

- [HDFS エンジン](../../engines/table-engines/integrations/hdfs.md)
- [HDFS テーブル関数](../../sql-reference/table-functions/hdfs.md)
