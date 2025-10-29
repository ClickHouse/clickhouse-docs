---
'description': 'Apache Icebergから指定されたクラスター内の多くのノードからファイルを並行して処理することを可能にするiceberg テーブル関数への拡張。'
'sidebar_label': 'icebergCluster'
'sidebar_position': 91
'slug': '/sql-reference/table-functions/icebergCluster'
'title': 'icebergCluster'
'doc_type': 'reference'
---


# icebergCluster テーブル関数

これは [iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数への拡張です。

指定されたクラスター内の多数のノードから、Apache [Iceberg](https://iceberg.apache.org/) のファイルを並列に処理することを可能にします。イニシエーターはクラスター内のすべてのノードへの接続を作成し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクを尋ねて処理し、すべてのタスクが完了するまでこれを繰り返します。

## 構文 {#syntax}

```sql
icebergS3Cluster(cluster_name, url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3Cluster(cluster_name, named_collection[, option=value [,..]])

icebergAzureCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzureCluster(cluster_name, named_collection[, option=value [,..]])

icebergHDFSCluster(cluster_name, path_to_table, [,format] [,compression_method])
icebergHDFSCluster(cluster_name, named_collection[, option=value [,..]])
```

## 引数 {#arguments}

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。
- 他のすべての引数の説明は、同等の [iceberg](/sql-reference/table-functions/iceberg.md) テーブル関数の引数の説明と一致します。

**返される値**

指定されたIcebergテーブルからクラスターのデータを読み取るための指定された構造のテーブル。

**例**

```sql
SELECT * FROM icebergS3Cluster('cluster_simple', 'http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイルの名前。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。
- `_etag` — ファイルのetag。型: `LowCardinality(String)`。etagが不明な場合、値は `NULL` です。

**関連情報**

- [Icebergエンジン](/engines/table-engines/integrations/iceberg.md)
- [Icebergテーブル関数](sql-reference/table-functions/iceberg.md)
