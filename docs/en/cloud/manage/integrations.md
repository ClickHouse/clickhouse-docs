---
sidebar_label: Integrations
slug: /en/manage/integrations
title: Integrations
---

To see a full list of integrations for ClickHouse, please see [this page](/en/integrations).

## Proprietary Integrations for ClickHouse Cloud

Besides the dozens of integrations available for ClickHouse, there are also some proprietary integrations only available for ClickHouse Cloud:

### ClickPipes

[ClickPipes](/en/integrations/clickpipes) is a managed integration platform to ingest data into ClickHouse Cloud using a simple, web-based UI. It currently supports Apache Kafka and Confluent Cloud, with more integrations coming soon.

ClickPipes is currently in private preview. You can join the waitlist by filling out [this form](https://clickhouse.com/cloud/clickpipes#joinwaitlist).

### Looker Studio for ClickHouse Cloud

[Looker Studio](https://lookerstudio.google.com/) is a popular business intelligence tool provided by Google. Looker Studio does not currently provide a ClickHouse connector but instead relies on the MySQL wire protocol to connect to ClickHouse.

Looker Studio can be connected to ClickHouse Cloud by enabling the [MySQL interface](/en/interfaces/mysql). Please see [this page](/en/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) for details on connecting Looker Studio to ClickHouse Cloud.

### MySQL Interface

Some applications currently do not support the ClickHouse wire protocol. To use ClickHouse Cloud with these applications, you can enable the MySQL wire protocol through the Cloud Console. Please see [this page](/en/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud) for details on how to enable the MySQL wire protocol through the Cloud Console.

## Unsupported Integrations

The following features for integrations are not currently available for ClickHouse Cloud as they are experimental features. If you need to support these features in your application, please contact support@clickhouse.com.

- [MaterializedPostgreSQL](/en/engines/database-engines/materialized-mysql)
- [MaterializedMySQL](/en/engines/table-engines/integrations/materialized-postgresql)
