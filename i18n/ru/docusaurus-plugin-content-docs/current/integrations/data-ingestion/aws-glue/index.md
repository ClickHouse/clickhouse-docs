---
slug: '/integrations/glue'
sidebar_label: 'Amazon Glue'
sidebar_position: 1
description: 'Интеграция ClickHouse и Amazon Glue'
title: 'Интеграция Amazon Glue с ClickHouse'
keywords: ['clickhouse', 'amazon', 'aws', 'glue', 'миграция', 'данные']
doc_type: guide
---
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import notebook_connections_config from '@site/static/images/integrations/data-ingestion/aws-glue/notebook-connections-config.png';
import dependent_jars_path_option from '@site/static/images/integrations/data-ingestion/aws-glue/dependent_jars_path_option.png';


# Интеграция Amazon Glue с ClickHouse и Spark

[Amazon Glue](https://aws.amazon.com/glue/) — это полностью управляемый, безсерверный сервис интеграции данных, предоставляемый Amazon Web Services (AWS). Он упрощает процесс обнаружения, подготовки и преобразования данных для аналитики, машинного обучения и разработки приложений.

## Установка {#installation}

Чтобы интегрировать ваш код Glue с ClickHouse, вы можете использовать наш официальный Spark коннектор в Glue через один из следующих способов:
- Установить ClickHouse Glue коннектор из AWS Marketplace (рекомендуется).
- Вручную добавить JAR-файлы Spark Connector в вашу задачу Glue.

<Tabs>
<TabItem value="AWS Marketplace" label="AWS Marketplace" default>

1. <h3 id="subscribe-to-the-connector">Подписка на коннектор</h3>
Чтобы получить доступ к коннектору в вашем аккаунте, подпишитесь на ClickHouse AWS Glue Connector из AWS Marketplace.

2. <h3 id="grant-required-permissions">Предоставьте необходимые разрешения</h3>
Убедитесь, что IAM роль вашей задачи Glue имеет необходимые разрешения, как описано в [руководстве](https://docs.aws.amazon.com/glue/latest/dg/getting-started-min-privs-job.html#getting-started-min-privs-connectors) по минимальным привилегиям.

3. <h3 id="activate-the-connector">Активируйте коннектор и создайте подключение</h3>
Вы можете активировать коннектор и создать подключение, нажав [на эту ссылку](https://console.aws.amazon.com/gluestudio/home#/connector/add-connection?connectorName="ClickHouse%20AWS%20Glue%20Connector"&connectorType="Spark"&connectorUrl=https://709825985650.dkr.ecr.us-east-1.amazonaws.com/clickhouse/clickhouse-glue:1.0.0&connectorClassName="com.clickhouse.spark.ClickHouseCatalog"), которая открывает страницу создания соединения Glue с предзаполненными ключевыми полями. Дайте соединению имя и нажмите создать (не нужно предоставлять детали подключения ClickHouse на этом этапе).

4. <h3 id="use-in-glue-job">Использование в задаче Glue</h3>
В вашей задаче Glue выберите вкладку `Job details` и разверните окно `Advanced properties`. В разделе `Connections` выберите только что созданное соединение. Коннектор автоматически внедрит необходимые JAR-файлы в выполнение задачи.

<Image img={notebook_connections_config} size='md' alt='Настройки соединений Glue Notebook' force='true' />

:::note
JAR-файлы, используемые в коннекторе Glue, построены для `Spark 3.3`, `Scala 2` и `Python 3`. Убедитесь, что вы выбрали эти версии при настройке вашей задачи Glue.
:::

</TabItem>
<TabItem value="Manual Installation" label="Ручная установка">
Чтобы вручную добавить необходимые JAR-файлы, выполните следующее:
1. Загрузите следующие JAR-файлы в S3 корзину - `clickhouse-jdbc-0.6.X-all.jar` и `clickhouse-spark-runtime-3.X_2.X-0.8.X.jar`.
2. Убедитесь, что задача Glue имеет доступ к этой корзине.
3. На вкладке `Job details` прокрутите вниз и разверните выпадающее меню `Advanced properties`, и заполните путь к JAR-файлам в `Dependent JARs path`:

<Image img={dependent_jars_path_option} size='md' alt='Параметры пути JAR для Glue Notebook' force='true' />

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

Для получения дополнительной информации, пожалуйста, посетите нашу [документацию по Spark](/integrations/apache-spark).