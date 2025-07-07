---
sidebar_label: 'Integrations'
slug: /manage/integrations
title: 'Integrations'
description: 'Integrations for ClickHouse'
---

To see a full list of integrations for ClickHouse, please see [this page](/integrations).

## Proprietary Integrations for ClickHouse Cloud {#proprietary-integrations-for-clickhouse-cloud}

Besides the dozens of integrations available for ClickHouse, there are also some proprietary integrations only available for ClickHouse Cloud:

### ClickPipes {#clickpipes}

[ClickPipes](/integrations/clickpipes) is a managed integration platform to ingest data into ClickHouse Cloud using a simple, web-based UI. It currently supports Apache Kafka, S3, GCS and Amazon Kinesis, with more integrations coming soon.


### Looker Studio for ClickHouse Cloud {#looker-studio-for-clickhouse-cloud}

[Looker Studio](https://lookerstudio.google.com/) is a popular business intelligence tool provided by Google. Looker Studio does not currently provide a ClickHouse connector but instead relies on the MySQL wire protocol to connect to ClickHouse.

Looker Studio can be connected to ClickHouse Cloud by enabling the [MySQL interface](/interfaces/mysql). Please see [this page](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) for details on connecting Looker Studio to ClickHouse Cloud.

### MySQL Interface {#mysql-interface}

Some applications currently do not support the ClickHouse wire protocol. To use ClickHouse Cloud with these applications, you can enable the MySQL wire protocol through the Cloud Console. Please see [this page](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) for details on how to enable the MySQL wire protocol through the Cloud Console.

## Unsupported Integrations {#unsupported-integrations}

The following features for integrations are not currently available for ClickHouse Cloud as they are experimental features. If you need to support these features in your application, please contact support@clickhouse.com.

- [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql)
