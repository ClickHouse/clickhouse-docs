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


# Azure Synapse と ClickHouse の統合

<ClickHouseSupportedBadge/>

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) は、ビッグデータ、データサイエンス、データウェアハウス機能を統合した分析サービスであり、高速かつ大規模なデータ分析を可能にします。
Synapse 内では、Spark プールがオンデマンドかつスケーラブルな [Apache Spark](https://spark.apache.org) クラスターを提供し、ユーザーは複雑なデータ変換、機械学習、および外部システムとの連携を実行できます。

この記事では、Azure Synapse 内で Apache Spark を使用する際に、[ClickHouse Spark connector](/integrations/apache-spark/spark-native-connector) を連携させる方法を説明します。

<TOCInline toc={toc}></TOCInline>



## コネクタの依存関係を追加する {#add-connector-dependencies}

Azure Synapseは3つのレベルの[パッケージメンテナンス](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)をサポートしています:

1. デフォルトパッケージ
2. Sparkプールレベル
3. セッションレベル

<br />

[Apache Sparkプールのライブラリ管理ガイド](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)に従い、以下の必須依存関係をSparkアプリケーションに追加してください。

- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [公式Maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` - [公式Maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

ニーズに適したバージョンを確認するには、[Sparkコネクタ互換性マトリックス](/integrations/apache-spark/spark-native-connector#compatibility-matrix)のドキュメントをご参照ください。


## ClickHouseをカタログとして追加する {#add-clickhouse-as-catalog}

セッションにSpark設定を追加する方法は複数あります:

- セッションと共に読み込むカスタム設定ファイル
- Azure Synapse UIを介した設定の追加
- Synapseノートブック内での設定の追加

この[Apache Spark設定の管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)に従い、[コネクタに必要なSpark設定](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)を追加してください。

例えば、ノートブック内で以下の設定を使用してSparkセッションを構成できます:

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

以下のように最初のセルに配置されていることを確認してください:

<Image
  img={sparkConfigViaNotebook}
  size='xl'
  alt='ノートブック経由でのSpark設定'
  border
/>

追加の設定については、[ClickHouse Spark設定ページ](/integrations/apache-spark/spark-native-connector#configurations)を参照してください。

:::info
ClickHouse Cloudを使用する場合は、[必要なSpark設定](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)を必ず設定してください。
:::


## セットアップの検証 {#setup-verification}

依存関係と設定が正しく設定されたことを確認するには、セッションのSpark UIにアクセスし、`Environment`タブを開いてください。
そこで、ClickHouse関連の設定を探してください：

<Image
  img={sparkUICHSettings}
  size='xl'
  alt='Spark UIを使用したClickHouse設定の検証'
  border
/>


## 追加リソース {#additional-resources}

- [ClickHouse Spark コネクタドキュメント](/integrations/apache-spark)
- [Azure Synapse Spark プールの概要](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Apache Spark ワークロードのパフォーマンス最適化](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Synapse での Apache Spark プール用ライブラリの管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Synapse での Apache Spark 設定の管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
