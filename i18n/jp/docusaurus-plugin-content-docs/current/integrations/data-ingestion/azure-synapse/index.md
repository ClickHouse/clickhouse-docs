---
'sidebar_label': 'Azure Synapse'
'slug': '/integrations/azure-synapse'
'description': 'ClickHouseとのAzure Synapseの紹介'
'keywords':
- 'clickhouse'
- 'azure synapse'
- 'azure'
- 'synapse'
- 'microsoft'
- 'azure spark'
- 'data'
'title': 'Azure SynapseとClickHouseの統合'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';


# Azure Synapse と ClickHouse の統合

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) は、ビッグデータ、データサイエンス、データウェアハウジングを統合した分析サービスであり、高速で大規模なデータ分析を可能にします。Synapse 内では、Spark プールがオンデマンドでスケーラブルな [Apache Spark](https://spark.apache.org) クラスターを提供し、ユーザーは複雑なデータ変換、機械学習、外部システムとの統合を実行できます。

この記事では、Azure Synapse 内で Apache Spark を使用する際に [ClickHouse Spark コネクタ](/integrations/apache-spark/spark-native-connector) を統合する方法を示します。

<TOCInline toc={toc}></TOCInline>

## コネクタの依存関係の追加 {#add-connector-dependencies}
Azure Synapse は、三つのレベルの [パッケージ管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries) をサポートしています。
1. デフォルトパッケージ
2. Spark プールレベル
3. セッションレベル

<br/>

[Apache Spark プールのライブラリ管理ガイド](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages) を参照し、次の必須依存関係を Spark アプリケーションに追加してください。
- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [公式 maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` - [公式 maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

あなたのニーズに適したバージョンを理解するために、[Spark コネクタ互換性マトリックス](/integrations/apache-spark/spark-native-connector#compatibility-matrix) のドキュメントを訪れてください。

## ClickHouse をカタログとして追加する {#add-clickhouse-as-catalog}

Spark 構成をセッションに追加する方法はさまざまあります：
* セッションと共に読み込むカスタム設定ファイル
* Azure Synapse UI を通じて構成を追加
* Synapse ノートブック内で構成を追加

この [Apache Spark 構成を管理する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration) を参照し、[コネクタに必要な Spark 構成](/integrations/apache-spark/spark-native-connector#register-the-catalog-required) を追加してください。

例えば、次の設定を使ってノートブック内であなたの Spark セッションを構成できます：

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

これが最初のセルであることを確認してください：

<Image img={sparkConfigViaNotebook} size="xl" alt="ノートブック経由での Spark 構成の設定" border/>

追加の設定については、[ClickHouse Spark 構成ページ](/integrations/apache-spark/spark-native-connector#configurations) を訪れてください。

:::info
ClickHouse Cloud を使用している場合は、[必要な Spark 設定](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings) を設定することを確認してください。  
:::

## セットアップの確認 {#setup-verification}

依存関係と構成が正しく設定されたかを確認するために、セッションの Spark UI を訪れ、`Environment` タブに移動してください。そこに、ClickHouse に関連する設定を探してください：

<Image img={sparkUICHSettings} size="xl" alt="Spark UI を使用して ClickHouse の設定を確認する" border/>

## 追加リソース {#additional-resources}

- [ClickHouse Spark コネクタドキュメント](/integrations/apache-spark)
- [Azure Synapse Spark プールの概要](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Apache Spark ワークロードのパフォーマンスを最適化する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Synapse における Apache Spark プールのライブラリ管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Synapse における Apache Spark 構成の管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
