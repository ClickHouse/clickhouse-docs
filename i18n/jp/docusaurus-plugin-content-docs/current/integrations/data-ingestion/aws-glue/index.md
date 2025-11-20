---
sidebar_label: 'Amazon Glue'
sidebar_position: 1
slug: /integrations/glue
description: 'ClickHouse と Amazon Glue の統合'
keywords: ['clickhouse', 'amazon', 'aws', 'glue', 'migrating', 'data', 'spark']
title: 'Amazon Glue と ClickHouse および Spark の統合'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import notebook_connections_config from '@site/static/images/integrations/data-ingestion/aws-glue/notebook-connections-config.png';
import dependent_jars_path_option from '@site/static/images/integrations/data-ingestion/aws-glue/dependent_jars_path_option.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Amazon Glue を ClickHouse と Spark と統合する

<ClickHouseSupportedBadge/>

[Amazon Glue](https://aws.amazon.com/glue/) は、Amazon Web Services (AWS) が提供するフルマネージドかつサーバーレスのデータ統合サービスです。分析、機械学習、およびアプリケーション開発向けのデータの検出・準備・変換プロセスを簡素化します。



## インストール {#installation}

GlueコードをClickHouseと統合するには、以下のいずれかの方法で公式Sparkコネクタを使用できます:

- AWS MarketplaceからClickHouse Glueコネクタをインストールする(推奨)
- Spark ConnectorのJARファイルをGlueジョブに手動で追加する

<Tabs>
<TabItem value="AWS Marketplace" label="AWS Marketplace" default>

1. <h3 id='subscribe-to-the-connector'>コネクタのサブスクライブ</h3>
   アカウントでコネクタにアクセスするには、AWS MarketplaceからClickHouse AWS Glue
   Connectorをサブスクライブします。

2. <h3 id='grant-required-permissions'>必要な権限の付与</h3>
   最小権限
   [ガイド](https://docs.aws.amazon.com/glue/latest/dg/getting-started-min-privs-job.html#getting-started-min-privs-connectors)に記載されているように、GlueジョブのIAMロールに必要な権限があることを確認してください。

3. <h3 id='activate-the-connector'>
     コネクタのアクティベーションと接続の作成
   </h3>
   [このリンク](https://console.aws.amazon.com/gluestudio/home#/connector/add-connection?connectorName="ClickHouse%20AWS%20Glue%20Connector"&connectorType="Spark"&connectorUrl=https://709825985650.dkr.ecr.us-east-1.amazonaws.com/clickhouse/clickhouse-glue:1.0.0&connectorClassName="com.clickhouse.spark.ClickHouseCatalog")をクリックすることで、コネクタをアクティベートし、接続を直接作成できます。これにより、主要なフィールドが事前入力されたGlue接続作成ページが開きます。
   接続に名前を付けて、作成ボタンを押してください(この段階でClickHouseの接続詳細を提供する必要はありません)。

4. <h3 id='use-in-glue-job'>Glueジョブでの使用</h3>
   Glueジョブで、`Job details`タブを選択し、`Advanced
   properties`ウィンドウを展開します。`Connections`セクションで、先ほど作成した接続を選択します。コネクタは必要なJARファイルをジョブランタイムに自動的に注入します。

<Image
  img={notebook_connections_config}
  size='md'
  alt='Glue Notebookの接続設定'
  force='true'
/>

:::note
Glueコネクタで使用されるJARファイルは、`Spark 3.3`、`Scala 2`、`Python 3`用にビルドされています。Glueジョブを設定する際は、これらのバージョンを選択してください。
:::

</TabItem>
<TabItem value="Manual Installation" label="手動インストール">
必要なJARファイルを手動で追加するには、以下の手順に従ってください:
1. 以下のJARファイルをS3バケットにアップロードします - `clickhouse-jdbc-0.6.X-all.jar`と`clickhouse-spark-runtime-3.X_2.X-0.8.X.jar`
2. Glueジョブがこのバケットにアクセスできることを確認します。
3. `Job details`タブで下にスクロールし、`Advanced properties`ドロップダウンを展開して、`Dependent JARs path`にJARファイルのパスを入力します:

<Image
  img={dependent_jars_path_option}
  size='md'
  alt='Glue NotebookのJARパスオプション'
  force='true'
/>

</TabItem>
</Tabs>


## 例 {#example}

<Tabs>
<TabItem value="Scala" label="Scala" default>

```java
import com.amazonaws.services.glue.GlueContext
import com.amazonaws.services.glue.util.GlueArgParser
import com.amazonaws.services.glue.util.Job
import com.clickhouseScala.Native.NativeSparkRead.spark
import org.apache.spark.sql.SparkSession

import scala.collection.JavaConverters._
import org.apache.spark.sql.types._
import org.apache.spark.sql.functions._

object ClickHouseGlueExample {
  def main(sysArgs: Array[String]) {
    val args = GlueArgParser.getResolvedOptions(sysArgs, Seq("JOB_NAME").toArray)

    val sparkSession: SparkSession = SparkSession.builder
      .config("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
      .config("spark.sql.catalog.clickhouse.host", "<your-clickhouse-host>")
      .config("spark.sql.catalog.clickhouse.protocol", "https")
      .config("spark.sql.catalog.clickhouse.http_port", "<your-clickhouse-port>")
      .config("spark.sql.catalog.clickhouse.user", "default")
      .config("spark.sql.catalog.clickhouse.password", "<your-password>")
      .config("spark.sql.catalog.clickhouse.database", "default")
      // ClickHouse Cloud用
      .config("spark.sql.catalog.clickhouse.option.ssl", "true")
      .config("spark.sql.catalog.clickhouse.option.ssl_mode", "NONE")
      .getOrCreate

    val glueContext = new GlueContext(sparkSession.sparkContext)
    Job.init(args("JOB_NAME"), glueContext, args.asJava)
    import sparkSession.implicits._

    val url = "s3://{path_to_cell_tower_data}/cell_towers.csv.gz"

    val schema = StructType(Seq(
      StructField("radio", StringType, nullable = false),
      StructField("mcc", IntegerType, nullable = false),
      StructField("net", IntegerType, nullable = false),
      StructField("area", IntegerType, nullable = false),
      StructField("cell", LongType, nullable = false),
      StructField("unit", IntegerType, nullable = false),
      StructField("lon", DoubleType, nullable = false),
      StructField("lat", DoubleType, nullable = false),
      StructField("range", IntegerType, nullable = false),
      StructField("samples", IntegerType, nullable = false),
      StructField("changeable", IntegerType, nullable = false),
      StructField("created", TimestampType, nullable = false),
      StructField("updated", TimestampType, nullable = false),
      StructField("averageSignal", IntegerType, nullable = false)
    ))

    val df = sparkSession.read
      .option("header", "true")
      .schema(schema)
      .csv(url)

    // ClickHouseへの書き込み
    df.writeTo("clickhouse.default.cell_towers").append()


    // ClickHouseからの読み込み
    val dfRead = spark.sql("select * from clickhouse.default.cell_towers")
    Job.commit()
  }
}
```

</TabItem>
<TabItem value="Python" label="Python">

```python
import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql import Row


```


## @params: [JOB_NAME]
args = getResolvedOptions(sys.argv, ['JOB_NAME'])

sc = SparkContext()
glueContext = GlueContext(sc)
logger = glueContext.get_logger()
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)



spark.conf.set("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
spark.conf.set("spark.sql.catalog.clickhouse.host", "<your-clickhouse-host>")
spark.conf.set("spark.sql.catalog.clickhouse.protocol", "https")
spark.conf.set("spark.sql.catalog.clickhouse.http_port", "<your-clickhouse-port>")
spark.conf.set("spark.sql.catalog.clickhouse.user", "default")
spark.conf.set("spark.sql.catalog.clickhouse.password", "<your-password>")
spark.conf.set("spark.sql.catalog.clickhouse.database", "default")
spark.conf.set("spark.clickhouse.write.format", "json")
spark.conf.set("spark.clickhouse.read.format", "arrow")

# ClickHouse Cloud の場合

spark.conf.set("spark.sql.catalog.clickhouse.option.ssl", "true")
spark.conf.set("spark.sql.catalog.clickhouse.option.ssl_mode", "NONE")


# DataFrame の作成
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)



# DataFrame を ClickHouse に書き込む
df.writeTo("clickhouse.default.example_table").append()



# ClickHouse から DataFrame を読み込む

df&#95;read = spark.sql(&quot;select * from clickhouse.default.example&#95;table&quot;)
logger.info(str(df.take(10)))

job.commit()

```

</TabItem>
</Tabs>

詳細については、[Sparkドキュメント](/integrations/apache-spark)をご覧ください。
```
