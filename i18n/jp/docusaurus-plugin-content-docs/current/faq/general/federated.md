---
title: 'ClickHouse でフェデレーテッドクエリは利用できますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/federated
description: 'ClickHouse では、フェデレーテッドクエリおよびハイブリッドクエリに幅広く対応しています'
doc_type: 'reference'
keywords: ['federated', 'hybrid', 'postgres', 'mysql', 'sqlite', 'odbc', 'jdbc']
---

# ClickHouse はフェデレーテッドクエリをサポートしていますか？

ClickHouse は、分析データベースの中でもフェデレーテッドクエリおよびハイブリッドなクエリ実行を最も包括的にサポートしています。

外部データベースに対するクエリをサポートしています:

- PostgreSQL
- MySQL
- MongoDB
- Redis
- 任意の ODBC データソース
- 任意の JDBC データソース
- 任意の Arrow Flight データソース
- Kafka や RabbitMQ などのストリーミングデータソース
- Iceberg、Delta Lake、Apache Hudi、Apache Paimon などのデータレイク
- AWS S3、GCS、Minio、Cloudflare R2、Azure Blob Storage、Alicloud OSS、Tencent COS などの共有ストレージ上にある外部ファイルやローカルストレージ上の外部ファイルなど、幅広いデータ形式のファイル

ClickHouse は、単一のクエリの中で複数の異なるデータソースを結合できます。また、ローカルリソースと、クエリの一部をリモートマシンにオフロードする仕組みを組み合わせたハイブリッドなクエリ実行オプションも提供します。

興味深いことに、ClickHouse はデータを移動させることなく、外部データソース上のクエリを高速化できます。例えば、MySQL に対する集約クエリは ClickHouse 上で実行した方が高速に処理されます。これは、データ移動のオーバーヘッドよりも、より高速なクエリエンジンの効果が上回るためです。