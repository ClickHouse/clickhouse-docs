---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'ClickHouse と Azure Synapse の統合について'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'data']
title: 'ClickHouse と Azure Synapse の統合'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';


# ClickHouse と Azure Synapse の統合

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics) は、ビッグデータ、データサイエンス、およびデータウェアハウジングを統合した分析サービスで、迅速で大規模なデータ分析を可能にします。
Synapse 内では、Spark プールがオンデマンドでスケーラブルな [Apache Spark](https://spark.apache.org) クラスタを提供し、ユーザーが複雑なデータ変換、機械学習、および外部システムとの統合を実行できるようにします。

この記事では、Azure Synapse 内で Apache Spark を使用する際に、[ClickHouse Spark コネクタ](/integrations/apache-spark/spark-native-connector) を統合する方法を紹介します。


<TOCInline toc={toc}></TOCInline>

## コネクタの依存関係を追加する {#add-connector-dependencies}
Azure Synapse は、[パッケージ管理の3つのレベル](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)をサポートしています：
1. デフォルトパッケージ
2. Spark プールレベル
3. セッションレベル

<br/>

次の [Apache Spark プールのライブラリ管理ガイド](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages) に従って、Spark アプリケーションに以下の必須依存関係を追加してください：
   - `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [公式 maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
   - `clickhouse-jdbc-{java_client_version}-all.jar` - [公式 maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

私たちの [Spark コネクタ互換性マトリックス](/integrations/apache-spark/spark-native-connector#compatibility-matrix) ドキュメントを訪れて、どのバージョンがあなたのニーズに合うかを理解してください。

## ClickHouse をカタログとして追加する {#add-clickhouse-as-catalog}

Spark 設定をセッションに追加する方法はさまざまあります：
* セッションでロードするカスタム構成ファイル
* Azure Synapse UI 経由で構成を追加
* Synapse ノートブックに構成を追加

この [Apache Spark 構成を管理する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration) 
に従って、[コネクタに必要な Spark 構成](/integrations/apache-spark/spark-native-connector#register-the-catalog-required) を追加してください。

例えば、ノートブックで次の設定を使用して Spark セッションを構成できます：

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

最初のセルで次のように配置してください：

<Image img={sparkConfigViaNotebook} size="xl" alt="ノートブック経由での Spark 構成の設定" border/>

追加の設定については、[ClickHouse Spark 構成ページ](/integrations/apache-spark/spark-native-connector#configurations)を訪れてください。

:::info
ClickHouse Cloud を使用する場合は、[必要な Spark 設定](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)を確実に設定してください。  
:::

## セットアップの検証 {#setup-verification}

依存関係と構成が正しく設定されたことを確認するには、セッションの Spark UI にアクセスし、`環境` タブに移動してください。
そこで、ClickHouse 関連の設定を探します：

<Image img={sparkUICHSettings} size="xl" alt="Spark UI を使用して ClickHouse 設定を検証する" border/>


## 追加リソース {#additional-resources}

- [ClickHouse Spark コネクタドキュメント](/integrations/apache-spark)
- [Azure Synapse Spark プールの概要](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Apache Spark ワークロードのパフォーマンスを最適化する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Synapse の Apache Spark プールのライブラリを管理する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Synapse での Apache Spark 構成を管理する](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
