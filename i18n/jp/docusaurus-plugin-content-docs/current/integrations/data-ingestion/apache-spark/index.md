---
sidebar_label: 'Apache Spark と ClickHouse の統合'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'ClickHouse と Apache Spark の連携概要'
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

# Apache Spark と ClickHouse の統合 \{#integrating-apache-spark-with-clickhouse\}

<ClickHouseSupportedBadge/>

[Apache Spark](https://spark.apache.org/) は、単一ノード環境またはクラスター上でデータエンジニアリング、データサイエンス、機械学習を実行するためのマルチ言語エンジンです。

Apache Spark と ClickHouse を接続する主な方法は 2 つあります。

1. [Spark Connector](./apache-spark/spark-native-connector) - Spark connector は `DataSourceV2` を実装し、独自の catalog 管理を行います。現時点では、ClickHouse と Spark を統合するための推奨手段です。
2. [Spark JDBC](./apache-spark/spark-jdbc) - [JDBC データソース](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html) を使用して Spark と ClickHouse を統合します。

<br/>

いずれの方式も検証済みであり、Java、Scala、PySpark、Spark SQL を含むさまざまな API と完全に互換性があります。

### Spark ランタイム環境 \{#spark-runtime-environment\}

#### 標準 Spark ランタイム\{#standard-spark-runtime\}

Spark Connector は、Amazon EMR や Kubernetes ベースの Spark デプロイメントなど、アップストリームの Apache Spark ランタイムに忠実な環境であれば、そのまま動作します。

#### マネージド Spark プラットフォーム \{#managed-spark-platforms\}

[AWS Glue](./../aws-glue/index.md) や [Databricks](./databricks.md) などのプラットフォームは、追加の抽象化や環境固有の動作を導入します。
コアとなる連携方法は同じですが、専用の設定やセットアップ手順が必要となる場合があります。詳細は、それぞれのドキュメントページを参照してください。