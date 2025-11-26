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


# Amazon Glue を ClickHouse および Spark と統合する

<ClickHouseSupportedBadge/>

[Amazon Glue](https://aws.amazon.com/glue/) は、Amazon Web Services (AWS) が提供するフルマネージドでサーバーレスなデータ統合サービスです。分析、機械学習、アプリケーション開発向けのデータの検出・準備・変換プロセスを簡素化します。



## インストール {#installation}

Glue のコードを ClickHouse と連携するには、次のいずれかの方法で Glue から公式 Spark connector を使用できます。
- AWS Marketplace から ClickHouse Glue connector をインストールする（推奨）。
- Spark connector の JAR を手動で Glue ジョブに追加する。

<Tabs>
<TabItem value="AWS Marketplace" label="AWS Marketplace" default>

1. <h3 id="subscribe-to-the-connector">コネクタをサブスクライブする</h3>
ご利用のアカウントでコネクタにアクセスできるようにするには、AWS Marketplace から ClickHouse AWS Glue Connector をサブスクライブします。

2. <h3 id="grant-required-permissions">必要な権限を付与する</h3>
Glue ジョブの IAM ロールに、最小権限に関する[ガイド](https://docs.aws.amazon.com/glue/latest/dg/getting-started-min-privs-job.html#getting-started-min-privs-connectors)で説明されている必要な権限が付与されていることを確認します。

3. <h3 id="activate-the-connector">コネクタを有効化し、接続を作成する</h3>
[このリンク](https://console.aws.amazon.com/gluestudio/home#/connector/add-connection?connectorName="ClickHouse%20AWS%20Glue%20Connector"&connectorType="Spark"&connectorUrl=https://709825985650.dkr.ecr.us-east-1.amazonaws.com/clickhouse/clickhouse-glue:1.0.0&connectorClassName="com.clickhouse.spark.ClickHouseCatalog")をクリックすると、コネクタを有効化して接続を直接作成できます。このリンクは、主要なフィールドがあらかじめ入力された状態で Glue の接続作成ページを開きます。接続に名前を付けて「作成」を押します（この段階では ClickHouse の接続情報を入力する必要はありません）。

4. <h3 id="use-in-glue-job">Glue ジョブで使用する</h3>
Glue ジョブで `Job details` タブを選択し、`Advanced properties` パネルを展開します。`Connections` セクションで、先ほど作成した接続を選択します。コネクタは、必要な JAR をジョブのランタイムに自動的に追加します。

<Image img={notebook_connections_config} size='md' alt='Glue Notebook 接続設定' force='true' />

:::note
Glue connector で使用される JAR は、`Spark 3.3`、`Scala 2`、`Python 3` 用にビルドされています。Glue ジョブを設定する際は、これらのバージョンを選択してください。
:::

</TabItem>
<TabItem value="Manual Installation" label="手動インストール">
必要な JAR を手動で追加するには、次の手順に従ってください。
1. 次の JAR を S3 バケットにアップロードします: `clickhouse-jdbc-0.6.X-all.jar` および `clickhouse-spark-runtime-3.X_2.X-0.8.X.jar`。
2. Glue ジョブがこのバケットにアクセスできることを確認します。
3. `Job details` タブで下にスクロールし、`Advanced properties` ドロップダウンを展開して、`Dependent JARs path` に JAR のパスを入力します。

<Image img={dependent_jars_path_option} size='md' alt='Glue Notebook の JAR パス設定オプション' force='true' />

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
      // ClickHouse Cloud 用
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

    // ClickHouse に書き込む
    df.writeTo("clickhouse.default.cell_towers").append()


    // ClickHouse から読み取る
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


# データフレームを作成
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

詳細については、[Sparkドキュメント](/integrations/apache-spark)をご参照ください。
```
