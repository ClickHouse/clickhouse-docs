---
title: 'ClickHouse はデータレイクをサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/datalake
description: 'ClickHouse は Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive などのデータレイクをサポートします'
doc_type: 'reference'
keywords: ['data lake', 'lakehouse']
---

# ClickHouse はデータレイクをサポートしていますか？

ClickHouse は、Iceberg、Delta Lake、Apache Hudi、Apache Paimon、Hive をはじめとするデータレイクをサポートしています。

**読み取り**および**書き込み**に対応しており、パーティションプルーニング、統計情報に基づくプルーニング、スキーマの進化、位置指定削除、等値削除、タイムトラベル、インスペクションといった機能と完全な互換性があります。

ClickHouse におけるデータレイクは、個々のテーブルだけでなく、**Unity**、**AWS Glue**、**Rest**、**Polaris**、**Hive Metastore** カタログとも連携して利用できます。

分散処理、高効率なネイティブ Parquet リーダー、データファイルのキャッシュにより、データレイクに対するクエリのパフォーマンスは最高水準です。