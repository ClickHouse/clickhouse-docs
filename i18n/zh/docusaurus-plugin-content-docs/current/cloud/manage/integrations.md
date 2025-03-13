---
sidebar_label: '集成'
slug: /manage/integrations
title: '集成'
---

要查看 ClickHouse 的完整集成列表，请参阅 [此页面](/integrations)。

## ClickHouse Cloud 的专有集成 {#proprietary-integrations-for-clickhouse-cloud}

除了可用于 ClickHouse 的众多集成外，还有一些仅在 ClickHouse Cloud 中可用的专有集成：

### ClickPipes {#clickpipes}

[ClickPipes](/integrations/clickpipes) 是一个托管的集成平台，通过简单的基于 web 的 UI 将数据导入 ClickHouse Cloud。它目前支持 Apache Kafka、S3、GCS 和 Amazon Kinesis，更多集成即将推出。

### ClickHouse Cloud 的 Looker Studio {#looker-studio-for-clickhouse-cloud}

[Looker Studio](https://lookerstudio.google.com/) 是 Google 提供的一款流行商业智能工具。Looker Studio 目前不提供 ClickHouse 连接器，而是依赖 MySQL 线协议连接 ClickHouse。

通过启用 [MySQL 接口](/interfaces/mysql)，可以将 Looker Studio 连接到 ClickHouse Cloud。有关将 Looker Studio 连接到 ClickHouse Cloud 的详细信息，请参见 [此页面](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)。

### MySQL 接口 {#mysql-interface}

某些应用程序目前不支持 ClickHouse 线协议。要与这些应用程序一起使用 ClickHouse Cloud，您可以通过 Cloud Console 启用 MySQL 线协议。有关如何通过 Cloud Console 启用 MySQL 线协议的详细信息，请参见 [此页面](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)。

## 不支持的集成 {#unsupported-integrations}

以下集成功能目前不支持 ClickHouse Cloud，因为它们是实验性功能。如果您需要在您的应用程序中支持这些功能，请联系 support@clickhouse.com。

- [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql)
