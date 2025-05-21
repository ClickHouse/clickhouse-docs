---
sidebar_label: '統合'
slug: /manage/integrations
title: '統合'
description: 'ClickHouse の統合'
---

ClickHouse の統合の完全なリストについては、[こちらのページ](/integrations)をご覧ください。

## ClickHouse Cloud のプロプライエタリ統合 {#proprietary-integrations-for-clickhouse-cloud}

ClickHouse に利用可能な数十の統合に加えて、ClickHouse Cloud にのみ利用可能なプロプライエタリ統合もあります：

### ClickPipes {#clickpipes}

[ClickPipes](/integrations/clickpipes) は、シンプルなウェブベースの UI を使用して ClickHouse Cloud にデータを取り込むためのマネージド統合プラットフォームです。現在、Apache Kafka、S3、GCS、Amazon Kinesis をサポートしており、さらに多くの統合が近日中に登場予定です。

### ClickHouse Cloud 用 Looker Studio {#looker-studio-for-clickhouse-cloud}

[Looker Studio](https://lookerstudio.google.com/) は、Google によって提供される人気のビジネスインテリジェンスツールです。Looker Studio は現在 ClickHouse コネクタを提供していませんが、代わりに MySQL ワイヤプロトコルを使用して ClickHouse に接続します。

Looker Studio は [MySQL インターフェース](/interfaces/mysql) を有効にすることで ClickHouse Cloud に接続できます。Looker Studio を ClickHouse Cloud に接続する詳細については、[こちらのページ](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)をご覧ください。

### MySQL インターフェース {#mysql-interface}

現在、一部のアプリケーションは ClickHouse ワイヤプロトコルをサポートしていません。これらのアプリケーションで ClickHouse Cloud を使用するには、Cloud Console 経由で MySQL ワイヤプロトコルを有効にすることができます。Cloud Console を通じて MySQL ワイヤプロトコルを有効にする方法の詳細については、[こちらのページ](/interfaces/mysql#enabling-the-mysql-interface-on-clickhouse-cloud)をご覧ください。

## 非サポート統合 {#unsupported-integrations}

次の統合の機能は、現在 ClickHouse Cloud で利用できない実験的機能です。アプリケーションでこれらの機能をサポートする必要がある場合は、support@clickhouse.com にお問い合わせください。

- [MaterializedPostgreSQL](/engines/table-engines/integrations/materialized-postgresql)
