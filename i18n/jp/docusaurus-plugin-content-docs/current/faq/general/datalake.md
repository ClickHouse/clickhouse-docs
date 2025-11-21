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

**読み取り**および**書き込み**に対応し、パーティションプルーニング、統計情報に基づくプルーニング、スキーマの進化、位置指定削除、等価条件による削除、タイムトラベル、インスペクションとの完全な互換性を備えています。

ClickHouse のデータレイク機能は、個々のテーブルに加え、**Unity**、**AWS Glue**、**REST**、**Polaris**、**Hive Metastore** などのカタログとも連携して動作します。

分散処理、高効率なネイティブ Parquet リーダー、データファイルキャッシュにより、データレイクに対するクエリのパフォーマンスは非常に高水準です。