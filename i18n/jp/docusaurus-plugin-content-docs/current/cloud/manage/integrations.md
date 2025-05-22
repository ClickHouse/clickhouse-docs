---
'sidebar_label': 'Integrations'
'slug': '/manage/integrations'
'title': 'Integrations'
'description': 'Integrations for ClickHouse'
---



To see a full list of integrations for ClickHouse, please see [this page](/integrations).

## Proprietary Integrations for ClickHouse Cloud {#proprietary-integrations-for-clickhouse-cloud}

Besides the dozens of integrations available for ClickHouse, there are also some proprietary integrations only available for ClickHouse Cloud:

### ClickPipes {#clickpipes}

[ClickPipes](/integrations/clickpipes)は、シンプルなWebベースのUIを使用してClickHouse Cloudにデータを取り込む管理された統合プラットフォームです。現在、Apache Kafka、S3、GCS、Amazon Kinesisをサポートしており、さらに多くの統合が近日中に登場予定です。

### Looker Studio for ClickHouse Cloud {#looker-studio-for-clickhouse-cloud}

[Looker Studio](https://lookerstudio.google.com/)は、Googleが提供する人気のビジネスインテリジェンスツールです。Looker Studioは現在ClickHouseコネクタを提供しておらず、代わりにMySQLワイヤプロトコルに依存してClickHouseに接続します。

Looker Studioは、[MySQLインターフェース](/interfaces/mysql)を有効にすることでClickHouse Cloudに接続できます。Looker StudioをClickHouse Cloudに接続する方法の詳細については、[こちらのページ](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)をご覧ください。

### MySQL Interface {#mysql-interface}

現在、一部のアプリケーションはClickHouseワイヤプロトコルをサポートしていません。これらのアプリケーションでClickHouse Cloudを使用するには、Cloud Consoleを通じてMySQLワイヤプロトコルを有効にすることができます。MySQLワイヤプロトコルをCloud Consoleを通じて有効にする方法の詳細については、[こちらのページ](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)をご覧ください。

## Unsupported Integrations {#unsupported-integrations}

次の統合機能は、現時点でClickHouse Cloudでは利用できません。これらは実験的機能です。アプリケーションでこれらの機能をサポートする必要がある場合は、support@clickhouse.comまでお問い合わせください。

- [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql)
