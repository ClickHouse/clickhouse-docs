---
'description': '指定クラスタ内の多くのノードからHDFSのファイルを並行して処理できるようにします。'
'sidebar_label': 'hdfsCluster'
'sidebar_position': 81
'slug': '/sql-reference/table-functions/hdfsCluster'
'title': 'hdfsCluster'
'doc_type': 'reference'
---


# hdfsCluster テーブル関数

指定されたクラスタ内の多くのノードから HDFS のファイルを並行して処理できるようにします。イニシエーターでは、クラスタ内のすべてのノードに接続を作成し、HDFS ファイルパスにアスタリスクを開示して、各ファイルを動的に配信します。ワーカーノードでは、次に処理するタスクについてイニシエーターに問い合わせ、そのタスクを処理します。このプロセスは、すべてのタスクが完了するまで繰り返されます。

## 構文 {#syntax}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```

## 引数 {#arguments}

| 引数            | 説明                                                                                                                                                                                                                                                                                     |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`  | リモートおよびローカルサーバーへのアドレスと接続パラメータを構築するために使用されるクラスタの名前。                                                                                                                                                                                         |
| `URI`           | ファイルまたは複数のファイルへの URI。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}`  (ここで `N`, `M` は数値、`abc`, `def` は文字列)。詳細については、[パスでのワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path)を参照してください。 |
| `format`        | ファイルの[形式](/sql-reference/formats)。                                                                                                                                                                                                                                               |
| `structure`     | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                     |

## 戻り値 {#returned_value}

指定されたファイル内のデータを読み取るための指定された構造を持つテーブル。

## 例 {#examples}

1.  `cluster_simple`という名前のClickHouseクラスタがあり、以下のURIを持ついくつかのファイルがHDFS上にあると仮定します:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  これらのファイル内の行数をクエリします:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  これらの2つのディレクトリ内のすべてのファイルの行数をクエリします:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭ゼロを含む数値範囲が含まれている場合は、各桁のためにブレース構文を使用するか、`?` を使用してください。
:::

## 関連項目 {#related}

- [HDFS エンジン](../../engines/table-engines/integrations/hdfs.md)
- [HDFS テーブル関数](../../sql-reference/table-functions/hdfs.md)
