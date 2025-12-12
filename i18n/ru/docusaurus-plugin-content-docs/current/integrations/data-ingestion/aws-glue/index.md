---
sidebar_label: 'Amazon Glue'
sidebar_position: 1
slug: /integrations/glue
description: 'Интеграция ClickHouse и Amazon Glue'
keywords: ['clickhouse', 'amazon', 'aws', 'glue', 'migrating', 'data', 'spark']
title: 'Интеграция Amazon Glue с ClickHouse и Spark'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import notebook_connections_config from '@site/static/images/integrations/data-ingestion/aws-glue/notebook-connections-config.png';
import dependent_jars_path_option from '@site/static/images/integrations/data-ingestion/aws-glue/dependent_jars_path_option.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Интеграция Amazon Glue с ClickHouse и Spark {#integrating-amazon-glue-with-clickhouse-and-spark}

<ClickHouseSupportedBadge/>

[Amazon Glue](https://aws.amazon.com/glue/) — это полностью управляемый бессерверный сервис для интеграции данных от Amazon Web Services (AWS). Он упрощает процесс обнаружения, подготовки и преобразования данных для аналитики, машинного обучения и разработки приложений.

## Установка {#installation}

Чтобы интегрировать ваш код Glue с ClickHouse, вы можете использовать наш официальный коннектор Spark в Glue одним из следующих способов:

- Установить коннектор ClickHouse Glue из AWS Marketplace (рекомендуется).
- Вручную добавить JAR‑файлы Spark Connector в ваше задание Glue.

<Tabs>
<TabItem value="AWS Marketplace" label="AWS Marketplace" default>

1. <h3 id="subscribe-to-the-connector">Подпишитесь на коннектор</h3>
Чтобы получить доступ к коннектору в вашей учётной записи, оформите подписку на ClickHouse AWS Glue Connector в AWS Marketplace.

2. <h3 id="grant-required-permissions">Предоставьте необходимые разрешения</h3>
Убедитесь, что роль IAM вашего задания Glue имеет необходимые разрешения, как описано в руководстве по минимальным привилегиям [здесь](https://docs.aws.amazon.com/glue/latest/dg/getting-started-min-privs-job.html#getting-started-min-privs-connectors).

3. <h3 id="activate-the-connector">Активируйте коннектор и создайте подключение</h3>
Вы можете активировать коннектор и создать подключение напрямую, нажав [эту ссылку](https://console.aws.amazon.com/gluestudio/home#/connector/add-connection?connectorName="ClickHouse%20AWS%20Glue%20Connector"&connectorType="Spark"&connectorUrl=https://709825985650.dkr.ecr.us-east-1.amazonaws.com/clickhouse/clickhouse-glue:1.0.0&connectorClassName="com.clickhouse.spark.ClickHouseCatalog"), которая откроет страницу создания подключения Glue с заранее заполненными ключевыми полями. Задайте подключению имя и нажмите кнопку `Create` (на этом этапе нет необходимости указывать параметры подключения к ClickHouse).

4. <h3 id="use-in-glue-job">Использование в задании Glue</h3>
В вашем задании Glue выберите вкладку `Job details` и разверните окно `Advanced properties`. В разделе `Connections` выберите только что созданное подключение. Коннектор автоматически добавит необходимые JAR‑файлы в среду выполнения задания.

<Image img={notebook_connections_config} size='md' alt='Конфигурация подключений Glue Notebook' force='true' />

:::note
JAR‑файлы, используемые в коннекторе Glue, собраны для `Spark 3.3`, `Scala 2` и `Python 3`. Убедитесь, что вы выбираете эти версии при настройке вашего задания Glue.
:::

</TabItem>
<TabItem value="Manual Installation" label="Ручная установка">
Чтобы добавить необходимые JAR‑файлы вручную, выполните следующее:
1. Загрузите следующие JAR‑файлы в бакет S3: `clickhouse-jdbc-0.6.X-all.jar` и `clickhouse-spark-runtime-3.X_2.X-0.8.X.jar`.
2. Убедитесь, что задание Glue имеет доступ к этому бакету.
3. На вкладке `Job details` пролистайте вниз, разверните выпадающий список `Advanced properties` и укажите путь к JAR‑файлам в поле `Dependent JARs path`:

<Image img={dependent_jars_path_option} size='md' alt='Параметры пути к JAR в Glue Notebook' force='true' />

</TabItem>
</Tabs>

## Примеры {#example}

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
      // for ClickHouse cloud
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

    // Write to ClickHouse
    df.writeTo("clickhouse.default.cell_towers").append()


    // Read from ClickHouse
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
# for ClickHouse cloud
spark.conf.set("spark.sql.catalog.clickhouse.option.ssl", "true")
spark.conf.set("spark.sql.catalog.clickhouse.option.ssl_mode", "NONE")

# Create DataFrame
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)

# Write DataFrame to ClickHouse
df.writeTo("clickhouse.default.example_table").append()

# Read DataFrame from ClickHouse
df_read = spark.sql("select * from clickhouse.default.example_table")
logger.info(str(df.take(10)))

job.commit()
```
  </TabItem>
</Tabs>

Подробности см. в нашей [документации по Spark](/integrations/apache-spark).