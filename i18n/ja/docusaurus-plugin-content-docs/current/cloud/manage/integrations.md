---
sidebar_label: インテグレーション
slug: /manage/integrations
title: インテグレーション
---

ClickHouseのインテグレーションの全リストは、[こちらのページ](/integrations)をご覧ください。

## ClickHouse Cloud向けの独自インテグレーション {#proprietary-integrations-for-clickhouse-cloud}

ClickHouseに利用可能な多数のインテグレーションに加えて、ClickHouse Cloud専用の独自インテグレーションもあります。

### ClickPipes {#clickpipes}

[ClickPipes](/integrations/clickpipes)は、シンプルなウェブベースのUIを使用してClickHouse Cloudにデータを取り込むためのマネージドなインテグレーションプラットフォームです。現在、Apache Kafka、S3、GCS、Amazon Kinesisをサポートしており、さらに多くのインテグレーションが近日中に追加される予定です。

### Looker Studio for ClickHouse Cloud {#looker-studio-for-clickhouse-cloud}

[Looker Studio](https://lookerstudio.google.com/)は、Googleが提供する人気のビジネスインテリジェンスツールです。Looker Studioは現在ClickHouseコネクタを提供していませんが、MySQLワイヤプロトコルを使用してClickHouseに接続します。

Looker Studioは、[MySQLインターフェース](/interfaces/mysql)を有効にすることによってClickHouse Cloudに接続できます。Looker StudioをClickHouse Cloudに接続する方法の詳細については、[こちらのページ](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)をご覧ください。

### MySQLインターフェース {#mysql-interface}

現在、一部のアプリケーションはClickHouseワイヤプロトコルをサポートしていません。これらのアプリケーションでClickHouse Cloudを使用するには、Cloudコンソールを通じてMySQLワイヤプロトコルを有効にする必要があります。Cloudコンソールを使ってMySQLワイヤプロトコルを有効にする方法については、[こちらのページ](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)をご覧ください。

## サポートされていないインテグレーション {#unsupported-integrations}

以下のインテグレーションの機能は、実験的な機能のため現在ClickHouse Cloudでは利用できません。これらの機能をアプリケーションでサポートする必要がある場合は、support@clickhouse.comまでご連絡ください。

- [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql)
