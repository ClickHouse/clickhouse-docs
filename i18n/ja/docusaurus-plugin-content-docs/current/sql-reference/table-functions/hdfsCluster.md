---
slug: /sql-reference/table-functions/hdfsCluster
sidebar_position: 81
sidebar_label: hdfsCluster
---

# hdfsCluster テーブル関数

指定されたクラスタの多くのノードから HDFS のファイルを並列処理します。イニシエーターはクラスタ内のすべてのノードへの接続を作成し、HDFS ファイルパスにアスタリスクを開示して、各ファイルを動的にディスパッチします。ワーカーノードでは、次に処理するタスクについてイニシエーターに尋ね、そのタスクを処理します。すべてのタスクが終了するまでこのプロセスは繰り返されます。

**構文**

``` sql
hdfsCluster(cluster_name, URI, format, structure)
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスセットと接続パラメータを構築するために使用されるクラスタの名前。
- `URI` — ファイルまたは複数のファイルへの URI。読み取り専用モードで次のワイルドカードをサポートします: `*`, `**`, `?`, `{'abc','def'}` および `{N..M}` ここで `N`, `M` は数字、`abc`, `def` は文字列です。詳細については [パス内のワイルドカード](../../engines/table-engines/integrations/s3.md#wildcards-in-path) を参照してください。
- `format` — ファイルの [フォーマット](../../interfaces/formats.md#formats)。
- `structure` — テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。

**返される値**

指定された構造を持つ、指定されたファイル内のデータを読み取るためのテーブル。

**例**

1.  `cluster_simple` という名前の ClickHouse クラスタがあり、HDFS に次の URI を持ついくつかのファイルがあるとします:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  これらのファイル内の行数をクエリします:

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  これらの2つのディレクトリ内のすべてのファイルの行数をクエリします:

``` sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
ファイルリストに先頭ゼロを含む数字範囲がある場合は、各桁ごとに中括弧を使って構成するか、`?` を使用してください。
:::

**関連項目**

- [HDFS エンジン](../../engines/table-engines/integrations/hdfs.md)
- [HDFS テーブル関数](../../sql-reference/table-functions/hdfs.md)
