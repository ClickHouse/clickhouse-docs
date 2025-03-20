---
sidebar_label: インテグレーション
slug: /manage/integrations
title: インテグレーション
---

ClickHouseのインテグレーションの完全なリストを確認するには、[このページ](/integrations)をご覧ください。

## ClickHouse Cloudの独自インテグレーション {#proprietary-integrations-for-clickhouse-cloud}

ClickHouseに利用可能な多数のインテグレーションに加えて、ClickHouse Cloudにのみ利用可能な独自のインテグレーションもいくつかあります。

### ClickPipes {#clickpipes}

[ClickPipes](/integrations/clickpipes)は、シンプルなウェブベースのUIを使用してデータをClickHouse Cloudに取り込むためのマネージドインテグレーションプラットフォームです。現在、Apache Kafka、S3、GCS、およびAmazon Kinesisをサポートしており、今後さらに多くのインテグレーションが登場する予定です。

### ClickHouse Cloud用のLooker Studio {#looker-studio-for-clickhouse-cloud}

[Looker Studio](https://lookerstudio.google.com/)は、Googleが提供する人気のビジネスインテリジェンステoolです。Looker Studioは現在、ClickHouseコネクタを提供していませんが、MySQLワイヤープロトコルを使用してClickHouseに接続します。

Looker Studioは、[MySQLインターフェース](/interfaces/mysql)を有効にすることでClickHouse Cloudに接続できます。Looker StudioをClickHouse Cloudに接続する方法の詳細については、[このページ](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)をご覧ください。

### MySQLインターフェース {#mysql-interface}

現在、いくつかのアプリケーションはClickHouseワイヤープロトコルをサポートしていません。これらのアプリケーションでClickHouse Cloudを使用するには、Cloud Consoleを通じてMySQLワイヤープロトコルを有効にすることができます。Cloud Consoleを介してMySQLワイヤープロトコルを有効にする方法の詳細については、[このページ](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)をご覧ください。

## サポートされていないインテグレーション {#unsupported-integrations}

以下のインテグレーションの機能は、現在ClickHouse Cloudで利用できない experimental features です。これらの機能をアプリケーションでサポートする必要がある場合は、support@clickhouse.comまでご連絡ください。

- [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql)
