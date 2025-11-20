---
title: 'ClickHouse はデータレイクをサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse は Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive などのデータレイクをサポートしています'
doc_type: 'reference'
keywords: ['data lake', 'lakehouse']
---

# ClickHouse はデータレイクをサポートしていますか？

ClickHouse は、Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive などのデータレイクをサポートしています。

**読み取り**と**書き込み**をサポートし、パーティションプルーニング、統計情報に基づくプルーニング、スキーマの進化、ポジショナルデリート、イコーリティデリート、タイムトラベル、イントロスペクションといった機能との完全な互換性を提供します。

ClickHouse におけるデータレイクは、**Unity**、**AWS Glue**、**Rest**、**Polaris**、**Hive Metastore** の各カタログおよび個々のテーブルに対してサポートされています。

分散処理、高効率なネイティブ Parquet リーダー、およびデータファイルキャッシュにより、データレイク上でのクエリ性能は最高水準です。