---
title: 'ClickHouse はフェデレーテッドクエリをサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/federated
description: 'ClickHouse は幅広い種類のフェデレーテッドおよびハイブリッドクエリをサポートしています'
doc_type: 'reference'
keywords: ['federated', 'hybrid', 'postgres', 'mysql', 'sqlite', 'odbc', 'jdbc']
---

# ClickHouse はフェデレーテッドクエリをサポートしていますか？

ClickHouse は、分析用データベースの中でもフェデレーテッドクエリおよびハイブリッドクエリ実行に関して、最も包括的なサポートを提供します。

ClickHouse は外部データベースへのクエリ実行をサポートしています:

- PostgreSQL
- MySQL
- MongoDB
- Redis
- 任意の ODBC データソース
- 任意の JDBC データソース
- 任意の Arrow Flight データソース
- Kafka や RabbitMQ などのストリーミングデータソース
- Iceberg、Delta Lake、Apache Hudi、Apache Paimon などのデータレイク
- AWS S3、GCS、Minio、Cloudflare R2、Azure Blob Storage、Alicloud OSS、Tencent COS などの共有ストレージ上にある外部ファイル、ならびにローカルストレージ上にある外部ファイルで、幅広いデータフォーマットに対応

ClickHouse は、1 つのクエリ内で複数の異なるデータソースを結合できます。また、ローカルリソースと、クエリの一部をリモートマシンにオフロードする方式を組み合わせたハイブリッドクエリ実行オプションも提供します。

興味深いことに、ClickHouse はデータを移動することなく、外部データソースに対するクエリを高速化できます。たとえば、MySQL に対する集約クエリは、ClickHouse 上で実行したほうが高速に処理されます。これは、データ移動のオーバーヘッドを上回る高速なクエリエンジンを ClickHouse が備えているためです。