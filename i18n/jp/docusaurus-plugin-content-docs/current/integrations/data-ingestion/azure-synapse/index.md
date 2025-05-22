---
'sidebar_label': 'Azure Synapse'
'slug': '/integrations/azure-synapse'
'description': 'Introduction to Azure Synapse with ClickHouse'
'keywords':
- 'clickhouse'
- 'azure synapse'
- 'azure'
- 'synapse'
- 'microsoft'
- 'azure spark'
- 'data'
'title': 'Integrating Azure Synapse with ClickHouse'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';


# Azure Synapse と ClickHouse の統合

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) は、ビッグデータ、データサイエンス、データウェアハウジングを組み合わせ、迅速で大規模なデータ分析を可能にする統合分析サービスです。
Synapse 内では、Spark プールがオンデマンドでスケーラブルな [Apache Spark](https://spark.apache.org) クラスターを提供し、ユーザーが複雑なデータ変換、機械学習、および外部システムとの統合を実行できます。

この記事では、Azure Synapse 内で Apache Spark を使用する際に [ClickHouse Spark コネクタ](/integrations/apache-spark/spark-native-connector) を統合する方法を示します。


<TOCInline toc={toc}></TOCInline>

## コネクタの依存関係を追加する {#add-connector-dependencies}
Azure Synapse では、[パッケージ管理の3つのレベル](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)をサポートしています：
1. デフォルトパッケージ
2. Spark プールレベル
3. セッションレベル

<br/>

[Apache Spark プールのライブラリ管理ガイド](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)に従い、Spark アプリケーションに以下の必要な依存関係を追加してください。
   - `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [公式 maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
   - `clickhouse-jdbc-{java_client_version}-all.jar` - [公式 maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

どのバージョンがニーズに合っているかを理解するために、[Spark コネクタの互換性マトリクス](/integrations/apache-spark/spark-native-connector#compatibility-matrix) のドキュメントをご覧ください。

## ClickHouse をカタログとして追加する {#add-clickhouse-as-catalog}

Spark の設定をセッションに追加するには、様々な方法があります：
* セッションと共にロードするカスタム設定ファイル
* Azure Synapse UI を介して設定を追加
* Synapse ノートブック内で設定を追加

[Apache Spark 設定管理ガイド](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)に従い、[コネクタに必要な Spark 設定](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)を追加してください。

例えば、以下の設定でノートブック内の Spark セッションを構成できます：

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

最初のセルにこの設定を配置してください：

<Image img={sparkConfigViaNotebook} size="xl" alt="ノートブック経由での Spark 設定" border/>

追加の設定については、[ClickHouse Spark 設定ページ](/integrations/apache-spark/spark-native-connector#configurations)をご覧ください。

:::info
ClickHouse Cloud を使用する場合は、[必要な Spark 設定](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)を設定してください。  
:::

## セットアップの検証 {#setup-verification}

依存関係と設定が正しく設定されているかを検証するために、セッションの Spark UI を訪れ、「環境」タブに移動してください。
そこで、ClickHouse に関連する設定を探してください：

<Image img={sparkUICHSettings} size="xl" alt="Spark UI を使用して ClickHouse 設定を検証" border/>


## 追加リソース {#additional-resources}

- [ClickHouse Spark コネクタのドキュメント](/integrations/apache-spark)
- [Azure Synapse Spark プールの概要](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Apache Spark ワークロードのパフォーマンスを最適化する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Synapse での Apache Spark プールのライブラリ管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Synapse での Apache Spark 設定の管理](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
