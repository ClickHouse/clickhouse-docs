---
description: 'Amazon S3、Azure、HDFS、またはローカルに保存された Apache Paimon テーブルに対して、読み取り専用のテーブルライクなインターフェースを提供します。'
sidebar_label: 'paimon'
sidebar_position: 90
slug: /sql-reference/table-functions/paimon
title: 'paimon'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# paimon テーブル関数 {#paimon-table-function}

<ExperimentalBadge />

Amazon S3、Azure、HDFS、またはローカルに保存されたApache [Paimon](https://paimon.apache.org/) テーブルへの読み取り専用のテーブルライクなインターフェースを提供します。


## 構文 {#syntax}

```sql
paimon(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonS3(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFS(path_to_table, [,format] [,compression_method])

paimonLocal(path_to_table, [,format] [,compression_method])
```


## 引数 {#arguments}

引数の説明は、テーブル関数 `s3`、`azureBlobStorage`、`HDFS`、`file` の各引数の説明と同じです。
`format` は Paimon テーブル内のデータファイルの形式を指定します。

### 戻り値 {#returned-value}

指定された Paimon テーブルのデータを読み取るための、指定された構造を持つテーブル。


## 名前付きコレクションの定義 {#defining-a-named-collection}

URLと認証情報を格納するための名前付きコレクションの設定例を以下に示します:

```xml
<clickhouse>
    <named_collections>
        <paimon_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </paimon_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM paimonS3(paimon_conf, filename = 'test_table')
DESCRIBE paimonS3(paimon_conf, filename = 'test_table')
```


## エイリアス {#aliases}

テーブル関数 `paimon` は `paimonS3` のエイリアスです。


## 仮想カラム {#virtual-columns}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルのサイズ(バイト単位)。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` です。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` です。
- `_etag` — ファイルのetag。型: `LowCardinality(String)`。etagが不明な場合、値は `NULL` です。


## サポートされるデータ型 {#data-types-supported}

| Paimonデータ型                     | ClickHouseデータ型    |
| --------------------------------- | -------------------- |
| BOOLEAN                           | Int8                 |
| TINYINT                           | Int8                 |
| SMALLINT                          | Int16                |
| INTEGER                           | Int32                |
| BIGINT                            | Int64                |
| FLOAT                             | Float32              |
| DOUBLE                            | Float64              |
| STRING,VARCHAR,BYTES,VARBINARY    | String               |
| DATE                              | Date                 |
| TIME(p),TIME                      | Time('UTC')          |
| TIMESTAMP(p) WITH LOCAL TIME ZONE | DateTime64           |
| TIMESTAMP(p)                      | DateTime64('UTC')    |
| CHAR                              | FixedString(1)       |
| BINARY(n)                         | FixedString(n)       |
| DECIMAL(P,S)                      | Decimal(P,S)         |
| ARRAY                             | Array                |
| MAP                               | Map                  |


## サポートされるパーティション {#partition-supported}

Paimonパーティションキーでサポートされているデータ型：

- `CHAR`
- `VARCHAR`
- `BOOLEAN`
- `DECIMAL`
- `TINYINT`
- `SMALLINT`
- `INTEGER`
- `DATE`
- `TIME`
- `TIMESTAMP`
- `TIMESTAMP WITH LOCAL TIME ZONE`
- `BIGINT`
- `FLOAT`
- `DOUBLE`


## 関連項目 {#see-also}

- [Paimonクラスターテーブル関数](/sql-reference/table-functions/paimonCluster.md)
