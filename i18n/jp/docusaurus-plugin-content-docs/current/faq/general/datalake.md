---
title: 'ClickHouse はデータレイクをサポートしますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse は Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive などのデータレイクをサポートしています'
doc_type: 'reference'
keywords: ['データレイク', 'レイクハウス']
---

# ClickHouse はデータレイクをサポートしていますか？ \\{#does-clickhouse-support-data-lakes\\}

ClickHouse は Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive を含むデータレイクをサポートしています。

**読み取り**および **書き込み** をサポートしており、パーティションプルーニング、統計情報に基づくプルーニング、スキーマ進化、位置指定削除、等価削除、タイムトラベル、イントロスペクションとの完全な互換性を備えています。

ClickHouse におけるデータレイクは、**Unity**、**AWS Glue**、**REST**、**Polaris**、**Hive Metastore** カタログおよび個々のテーブルで利用できます。

分散処理、高効率なネイティブ Parquet リーダー、データファイルのキャッシュにより、データレイクに対するクエリパフォーマンスは非常に高水準です。