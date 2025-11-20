---
title: 'ClickHouse はフェデレーテッドクエリをサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/federated
description: 'ClickHouse は、フェデレーテッドおよびハイブリッドクエリを幅広くサポートしています'
doc_type: 'reference'
keywords: ['federated', 'hybrid', 'postgres', 'mysql', 'sqlite', 'odbc', 'jdbc']
---

# ClickHouse はフェデレーテッドクエリをサポートしていますか？

ClickHouse は、分析用データベースの中でもフェデレーテッドクエリおよびハイブリッドクエリ実行に関して最も包括的なサポートを提供しています。

ClickHouse は外部データベースへのクエリをサポートしています:

- PostgreSQL
- MySQL
- MongoDB
- Redis
- 任意の ODBC データソース
- 任意の JDBC データソース
- 任意の Arrow Flight データソース
- Kafka や RabbitMQ などのストリーミングデータソース
- Iceberg、Delta Lake、Apache Hudi、Apache Paimon などのデータレイク
- 共有ストレージ上の外部ファイル (AWS S3、GCS、Minio、Cloudflare R2、Azure Blob Storage、Alicloud OSS、Tencent COS など)、および幅広いデータ形式をサポートするローカルストレージ

ClickHouse は 1 回のクエリで複数の異なるデータソースを結合できます。さらに、ローカルリソースを利用しつつ、クエリの一部処理をリモートマシンにオフロードするハイブリッドクエリ実行オプションも提供します。

興味深い点として、ClickHouse はデータを移動することなく外部データソースに対するクエリを高速化できます。たとえば、MySQL に対する集約クエリは、ClickHouse 上で実行するとより高速に処理されます。これは、データ移動のオーバーヘッドが、より高速なクエリエンジンによって相殺されるためです。