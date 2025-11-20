---
sidebar_label: 'Apache Spark と ClickHouse の統合'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'ClickHouse と連携した Apache Spark の概要'
keywords: ['clickhouse', 'Apache Spark', 'migrating', 'data']
title: 'Apache Spark と ClickHouse の統合'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Apache Spark と ClickHouse の統合

<ClickHouseSupportedBadge/>

[Apache Spark](https://spark.apache.org/) は、シングルノードマシンまたはクラスター上でデータエンジニアリング、データサイエンス、機械学習を実行するためのマルチ言語エンジンです。

Apache Spark と ClickHouse を接続する主な方法は 2 つあります:

1. [Spark Connector](./apache-spark/spark-native-connector) - Spark コネクタは `DataSourceV2` を実装し、独自のカタログ管理を備えています。現時点では、これが ClickHouse と Spark を統合する推奨の方法です。
2. [Spark JDBC](./apache-spark/spark-jdbc) - [JDBC データソース](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html) を使用して Spark と ClickHouse を統合します。

<br/>

<br/>

どちらのソリューションも検証済みであり、Java、Scala、PySpark、Spark SQL を含むさまざまな API と完全な互換性があります。