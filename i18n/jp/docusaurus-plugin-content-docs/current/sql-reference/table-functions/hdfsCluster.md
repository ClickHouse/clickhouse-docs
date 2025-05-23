---
'description': '指定されたクラスタ内の多くのノードから並列にHDFSファイルを処理することを可能にします。'
'sidebar_label': 'HDFSクラスタ'
'sidebar_position': 81
'slug': '/sql-reference/table-functions/hdfsCluster'
'title': 'hdfsCluster'
---




# hdfsCluster テーブル関数

指定されたクラスター内の多くのノードから HDFS のファイルを並行して処理することを可能にします。イニシエーターでクラスター内のすべてのノードに接続を作成し、HDFS ファイルパス内のアスタリスクを開示し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクについて尋ね、そのタスクを処理します。すべてのタスクが終了するまで、このプロセスが繰り返されます。

## 構文 {#syntax}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```

## 引数 {#arguments}

| 引数            | 説明                                                                                                                                                                                                                                                                                     |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`  | リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。                                                                                                                                                                       |
| `URI`           | ファイルまたは多数のファイルへの URI。以下のワイルドカードを読み取り専用モードでサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}` （ここで `N`, `M` は数字、`abc`, `def` は文字列）。詳細については [Wildcards In Path](../../engines/table-engines/integrations/s3.md#wildcards-in-path) を参照してください。 |
| `format`        | ファイルの [format](/sql-reference/formats)。                                                                                                                                                                                                                                          |
| `structure`     | テーブルの構造。フォーマット `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                            |

## 戻り値 {#returned_value}

指定されたファイルからデータを読み取るための指定された構造のテーブル。

## 例 {#examples}

1.  `cluster_simple` という名前の ClickHouse クラスターがあり、HDFS に次の URI を持ついくつかのファイルがあるとします：

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

3.  これらの 2 つのディレクトリ内のすべてのファイルの行数をクエリします：

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルのリストに先頭ゼロを含む数値範囲がある場合は、各桁を個別にブレースで囲む構文を使用するか、`?` を使用してください。
:::

## 関連 {#related}

- [HDFS エンジン](../../engines/table-engines/integrations/hdfs.md)
- [HDFS テーブル関数](../../sql-reference/table-functions/hdfs.md)
