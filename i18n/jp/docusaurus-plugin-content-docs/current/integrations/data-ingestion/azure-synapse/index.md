---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'ClickHouse と Azure Synapse の概要'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'データ']
title: 'Azure Synapse と ClickHouse の連携'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

<ClickHouseSupportedBadge />

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) は、ビッグデータ、データサイエンス、データウェアハウスを組み合わせることで、高速かつ大規模なデータ分析を可能にする統合分析サービスです。
Synapse では、Spark プールにより、オンデマンドでスケーラブルな [Apache Spark](https://spark.apache.org) クラスターを利用でき、複雑なデータ変換、機械学習、外部システムとの連携を実行できます。

この記事では、Azure Synapse で Apache Spark を使用する際に、[ClickHouse Spark connector](/integrations/apache-spark/spark-native-connector) を統合する方法を説明します。

<TOCInline toc={toc} />

## コネクタの依存関係を追加する \{#add-connector-dependencies\}

Azure Synapse では、[パッケージ管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)が次の 3 つのレベルでサポートされています。

1. 既定のパッケージ
2. Spark プール レベル
3. セッション レベル

<br />

[Apache Spark プールのライブラリを管理するガイド](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)に従って、次の必須依存関係を Spark アプリケーションに追加してください。

* `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [公式 Maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
* `clickhouse-jdbc-{java_client_version}-all.jar` - [公式 Maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

用途に適したバージョンを確認するには、[Spark Connector Compatibility Matrix](/integrations/apache-spark/spark-native-connector#compatibility-matrix) のドキュメントを参照してください。

## ClickHouse をカタログとして追加する \{#add-clickhouse-as-catalog\}

Spark 設定をセッションに追加する方法はいくつかあります。

* セッションの読み込み時に使用するカスタム設定ファイル
* Azure Synapse UI から設定を追加する
* Synapse notebook で設定を追加する

次の [Apache Spark 構成の管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
に従って、[コネクタに必要な Spark 設定](/integrations/apache-spark/spark-native-connector#register-the-catalog-required) を追加します。

たとえば、ノートブックで次の設定を使用して Spark セッションを構成できます。

```python
%%configure -f
{
    "conf": {
        "spark.sql.catalog.clickhouse": "com.clickhouse.spark.ClickHouseCatalog",
        "spark.sql.catalog.clickhouse.host": "<clickhouse host>",
        "spark.sql.catalog.clickhouse.protocol": "https",
        "spark.sql.catalog.clickhouse.http_port": "<port>",
        "spark.sql.catalog.clickhouse.user": "<username>",
        "spark.sql.catalog.clickhouse.password": "password",
        "spark.sql.catalog.clickhouse.database": "default"
    }
}
```

次のように、最初のセルに配置されていることを確認してください。

<Image img={sparkConfigViaNotebook} size="xl" alt="notebook を使用した Spark 設定" border />

追加の設定については、[ClickHouse Spark 設定ページ](/integrations/apache-spark/spark-native-connector#configurations)を参照してください。

:::info
ClickHouse Cloud を使用する場合は、必ず[必要な Spark 設定](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)を設定してください。
:::

## セットアップの確認 \{#setup-verification\}

依存関係と設定が正しく反映されていることを確認するには、セッションの Spark UI にアクセスし、`Environment` タブを開いてください。
そこで、ClickHouse 関連の設定を確認します。

<Image img={sparkUICHSettings} size="xl" alt="Spark UI を使用した ClickHouse 設定の確認" border />

## 参考資料 \{#additional-resources\}

* [ClickHouse Spark コネクタのドキュメント](/integrations/apache-spark)
* [Azure Synapse Spark プールの概要](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
* [Apache Spark ワークロードのパフォーマンスを最適化する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
* [Synapse で Apache Spark プールのライブラリを管理する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
* [Synapse で Apache Spark の構成を管理する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)