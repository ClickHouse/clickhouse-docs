---
title: 'ClickHouse は連合クエリをサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/federated
description: 'ClickHouse は幅広い種類の連合クエリおよびハイブリッドクエリをサポートしています'
doc_type: 'reference'
keywords: ['federated', 'hybrid', 'postgres', 'mysql', 'sqlite', 'odbc', 'jdbc']
---

# ClickHouse はフェデレーテッドクエリをサポートしていますか？ {#does-clickhouse-support-federated-queries}

ClickHouse は、分析用データベースの中でもフェデレーテッドクエリおよびハイブリッドクエリ実行について、最も包括的なサポートを提供します。

ClickHouse は外部データベースに対するクエリをサポートしています：

* PostgreSQL
* MySQL
* MongoDB
* Redis
* 任意の ODBC データソース
* 任意の JDBC データソース
* 任意の Arrow Flight データソース
* Kafka や RabbitMQ などのストリーミングデータソース
* Iceberg、Delta Lake、Apache Hudi、Apache Paimon などの Data Lake
* AWS S3、GCS、Minio、Cloudflare R2、Azure Blob Storage、Alicloud OSS、Tencent COS などの共有ストレージ上にある外部ファイル、ならびにローカルストレージ上の外部ファイル（幅広いデータフォーマットに対応）

ClickHouse は、1 つのクエリ内で複数の異なるデータソースを結合できます。また、ローカルリソースを活用しつつ、クエリの一部をリモートマシンにオフロードするハイブリッドクエリ実行オプションも提供します。

興味深いことに、ClickHouse はデータを移動することなく外部データソース上のクエリを高速化できます。たとえば、MySQL 上の集計クエリは ClickHouse 上で実行するとより高速に処理されます。これは、データ移動のオーバーヘッドが、より高速なクエリエンジンによって相殺されるためです。