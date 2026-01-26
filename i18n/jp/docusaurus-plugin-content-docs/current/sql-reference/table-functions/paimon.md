---
description: 'Amazon S3、Azure、HDFS、またはローカルに保存された Apache Paimon テーブルに対して、読み取り専用のテーブルライクなインターフェイスを提供します。'
sidebar_label: 'paimon'
sidebar_position: 90
slug: /sql-reference/table-functions/paimon
title: 'paimon'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# paimon テーブル関数 \{#paimon-table-function\}

<ExperimentalBadge />

Amazon S3、Azure、HDFS、またはローカルに保存された Apache [Paimon](https://paimon.apache.org/) テーブルに対して、読み取り専用のテーブルライクなインターフェースを提供します。

## 構文 \{#syntax\}

```sql
paimon(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonS3(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFS(path_to_table, [,format] [,compression_method])

paimonLocal(path_to_table, [,format] [,compression_method])
```

## 引数 \{#arguments\}

引数の説明は、それぞれのテーブル関数 `s3`、`azureBlobStorage`、`HDFS`、`file` における引数の説明と同一です。
`format` は、Paimon テーブル内のデータファイルのフォーマットを表します。

### 返り値 \{#returned-value\}

指定された Paimon テーブルからデータを読み取るための、指定された構造を持つテーブルが返されます。

## 名前付きコレクションの定義 \{#defining-a-named-collection\}

次の例は、URL と認証情報を保存するための名前付きコレクションの設定方法を示しています。

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

## エイリアス \{#aliases\}

テーブル関数 `paimon` は、現在 `paimonS3` のエイリアスになっています。

## 仮想列 \{#virtual-columns\}

- `_path` — ファイルへのパス。型: `LowCardinality(String)`。
- `_file` — ファイル名。型: `LowCardinality(String)`。
- `_size` — ファイルサイズ（バイト単位）。型: `Nullable(UInt64)`。ファイルサイズが不明な場合、値は `NULL` となります。
- `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`。時刻が不明な場合、値は `NULL` となります。
- `_etag` — ファイルの etag。型: `LowCardinality(String)`。etag が不明な場合、値は `NULL` となります。

## サポートされるデータ型 \{#data-types-supported\}

| Paimon データ型 | ClickHouse データ型 
|-------|--------|
|BOOLEAN     |Int8      |
|TINYINT     |Int8      |
|SMALLINT     |Int16      |
|INTEGER     |Int32      |
|BIGINT     |Int64      |
|FLOAT     |Float32      |
|DOUBLE     |Float64      |
|STRING,VARCHAR,BYTES,VARBINARY     |String      |
|DATE     |Date      |
|TIME(p),TIME     |Time('UTC')      |
|TIMESTAMP(p) WITH LOCAL TIME ZONE     |DateTime64      |
|TIMESTAMP(p)     |DateTime64('UTC')      |
|CHAR     |FixedString(1)      |
|BINARY(n)     |FixedString(n)      |
|DECIMAL(P,S)     |Decimal(P,S)      |
|ARRAY     |Array      |
|MAP     |Map    |

## サポートされるパーティション \{#partition-supported\}
Paimon のパーティションキーでサポートされるデータ型：
* `CHAR`
* `VARCHAR`
* `BOOLEAN`
* `DECIMAL`
* `TINYINT`
* `SMALLINT`
* `INTEGER`
* `DATE`
* `TIME`
* `TIMESTAMP`
* `TIMESTAMP WITH LOCAL TIME ZONE`
* `BIGINT`
* `FLOAT`
* `DOUBLE`

## 関連項目 \{#see-also\}

* [Paimon クラスターテーブル関数](/sql-reference/table-functions/paimonCluster.md)
