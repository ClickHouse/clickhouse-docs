---
'description': 'Apache Hudi テーブルの hudi テーブル関数への拡張。指定されたクラスタ内の多くのノードを使用して、Amazon S3
  内の Apache Hudi テーブルからファイルを並行して処理できます。'
'sidebar_label': 'hudiCluster'
'sidebar_position': 86
'slug': '/sql-reference/table-functions/hudiCluster'
'title': 'hudiCluster テーブル関数'
'doc_type': 'reference'
---


# hudiCluster テーブル関数

これは [hudi](sql-reference/table-functions/hudi.md) テーブル関数の拡張です。

指定されたクラスター内の多くのノードで、Amazon S3 にある Apache [Hudi](https://hudi.apache.org/) テーブルからファイルを並行して処理することを可能にします。イニシエーターでは、クラスター内のすべてのノードへの接続を作成し、各ファイルを動的に配信します。ワーカーノードでは、イニシエーターに次の処理タスクを尋ね、それを処理します。これをすべてのタスクが終了するまで繰り返します。

## 構文 {#syntax}

```sql
hudiCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

| 引数                                        | 説明                                                                                                                                                                                                                                                                                                                                                                            |
|---------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`                              | リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスターの名前。                                                                                                                                                                                                                                                                      |
| `url`                                       | S3 内の既存の Hudi テーブルへのパスを持つバケットの URL。                                                                                                                                                                                                                                                                                                                        |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) アカウントユーザーのための長期的な認証情報。これを使用してリクエストを認証できます。これらのパラメータはオプションです。認証情報が指定されていない場合、ClickHouse の設定から取得されます。詳細については、[データストレージ用の S3 の使用](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)を参照してください。   |
| `format`                                    | ファイルの [形式](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                               |
| `structure`                                 | テーブルの構造。形式は `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                    |
| `compression`                               | このパラメータはオプションです。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子によって自動的に検出されます。                                                                                                                                                                                                              |

## 戻り値 {#returned_value}

指定された構造のテーブルが、S3 内の指定された Hudi テーブルからクラスターデータを読み取るために返されます。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ: `LowCardinality(String)`。
- `_size` — ファイルのサイズ（バイト単位）。タイプ: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。タイプ: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルの etag。タイプ: `LowCardinality(String)`。etag が不明な場合、値は `NULL` です。

## 関連 {#related}

- [Hudi エンジン](engines/table-engines/integrations/hudi.md)
- [Hudi テーブル関数](sql-reference/table-functions/hudi.md)
