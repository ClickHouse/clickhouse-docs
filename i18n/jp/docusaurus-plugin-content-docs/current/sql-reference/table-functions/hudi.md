---
'description': 'アマゾン S3 の Apache Hudi テーブルに対して、読み取り専用のテーブルのようなインターフェースを提供します。'
'sidebar_label': 'hudi'
'sidebar_position': 85
'slug': '/sql-reference/table-functions/hudi'
'title': 'hudi'
'doc_type': 'reference'
---


# hudi テーブル関数

Amazon S3 における Apache [Hudi](https://hudi.apache.org/) テーブルへの読み取り専用テーブルのようなインターフェースを提供します。

## 構文 {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

| 引数                                         | 説明                                                                                                                                                                                                                                                                                                                                                                           |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                        | S3 内の既存の Hudi テーブルへのパスを持つバケットの URL。                                                                                                                                                                                                                                                                                                                             |
| `aws_access_key_id`, `aws_secret_access_key` | [AWS](https://aws.amazon.com/) アカウントユーザーのための長期的な認証情報。これらを使用してリクエストを認証できます。これらのパラメータは任意です。認証情報が指定されていない場合、ClickHouse 設定から使用されます。詳細については、[Using S3 for Data Storage](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) を参照してください。 |
| `format`                                     | ファイルの [format](/interfaces/formats)。                                                                                                                                                                                                                                                                                                                                        |
| `structure`                                  | テーブルの構造。フォーマットは `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                         |
| `compression`                                | パラメータは任意です。サポートされている値: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`。デフォルトでは、圧縮はファイル拡張子によって自動検出されます。                                                                                                                                                                                                                   |

## 戻り値 {#returned_value}

指定された S3 内の Hudi テーブルからデータを読み取るための指定された構造を持つテーブル。

## 仮想カラム {#virtual-columns}

- `_path` — ファイルのパス。タイプ: `LowCardinality(String)`。
- `_file` — ファイルの名前。タイプ: `LowCardinality(String)`。
- `_size` — バイト単位のファイルのサイズ。タイプ: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終変更時間。タイプ: `Nullable(DateTime)`。時間が不明な場合、値は `NULL` です。
- `_etag` — ファイルの etag。タイプ: `LowCardinality(String)`。etag が不明な場合、値は `NULL` です。

## 関連 {#related}

- [Hudi エンジン](/engines/table-engines/integrations/hudi.md)
- [Hudi クラスタテーブル関数](/sql-reference/table-functions/hudiCluster.md)
