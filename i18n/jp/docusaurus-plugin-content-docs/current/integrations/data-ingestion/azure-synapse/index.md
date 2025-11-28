---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'ClickHouse と連携した Azure Synapse の概要'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'data']
title: 'Azure Synapse と ClickHouse の連携'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Azure Synapse と ClickHouse の連携

<ClickHouseSupportedBadge/>

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) は、ビッグデータ、データサイエンス、データウェアハウスを統合した分析サービスであり、高速かつ大規模なデータ分析を可能にします。
Synapse 内では、Spark プールがオンデマンドかつスケーラブルな [Apache Spark](https://spark.apache.org) クラスターを提供し、複雑なデータ変換や機械学習、外部システムとの連携を実行できます。

この記事では、Azure Synapse 内で Apache Spark を利用する際に、[ClickHouse Spark connector](/integrations/apache-spark/spark-native-connector) と連携させる方法を説明します。

<TOCInline toc={toc}></TOCInline>



## コネクタの依存関係を追加する {#add-connector-dependencies}
Azure Synapse では、次の 3 つのレベルでの[パッケージ管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)がサポートされています：
1. 既定のパッケージ
2. Spark プール レベル
3. セッション レベル

<br/>

「[Manage libraries for Apache Spark pools](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)」ガイドに従い、次の必須となる依存関係を Spark アプリケーションに追加します。
- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [公式 Maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` - [公式 Maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

どのバージョンが要件に適合するかを確認するには、[Spark Connector Compatibility Matrix](/integrations/apache-spark/spark-native-connector#compatibility-matrix) ドキュメントを参照してください。



## ClickHouse をカタログとして追加する

セッションに Spark の設定を追加する方法はいくつかあります。

* セッションで読み込むカスタム設定ファイルを使用する
* Azure Synapse の UI から設定を追加する
* Synapse ノートブック内で設定を追加する

[Manage Apache Spark configuration](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
に従い、この[コネクタに必要な Spark 設定](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)を追加します。

たとえば、ノートブック内で次の設定を使って Spark セッションを構成できます。

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

以下のように必ず最初のセルに設定してください:

<Image img={sparkConfigViaNotebook} size="xl" alt="ノートブック経由で Spark の設定を行う" border />

追加の設定については、[ClickHouse Spark 設定ページ](/integrations/apache-spark/spark-native-connector#configurations)を参照してください。

:::info
ClickHouse Cloud を利用する場合は、必ず [必須の Spark 設定](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)を行ってください。\
:::


## セットアップの検証 {#setup-verification}

依存関係および設定が正しく構成されていることを確認するには、該当セッションの Spark UI を開き、`Environment` タブを表示します。
そこで、ClickHouse に関連する設定を探します。

<Image img={sparkUICHSettings} size="xl" alt="Spark UI を使用した ClickHouse 設定の検証" border/>



## 参考資料 {#additional-resources}

- [ClickHouse Spark Connector のドキュメント](/integrations/apache-spark)
- [Azure Synapse Spark プールの概要](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Apache Spark ワークロードのパフォーマンスの最適化](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Synapse の Apache Spark プールのライブラリを管理する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Synapse の Apache Spark 構成を管理する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
