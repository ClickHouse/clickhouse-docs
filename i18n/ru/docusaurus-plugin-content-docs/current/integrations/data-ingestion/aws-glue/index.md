---
sidebar_label: 'Amazon Glue'
sidebar_position: 1
slug: /integrations/glue
description: 'Интеграция ClickHouse и Amazon Glue'
keywords: ['clickhouse', 'amazon', 'aws', 'glue', 'миграция', 'данные']
title: 'Интеграция Amazon Glue с ClickHouse'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Интеграция Amazon Glue с ClickHouse

[Amazon Glue](https://aws.amazon.com/glue/) — это полностью управляемый безсерверный сервис интеграции данных, предоставляемый Amazon Web Services (AWS). Он упрощает процесс обнаружения, подготовки и преобразования данных для аналитики, машинного обучения и разработки приложений.

Хотя в настоящее время отсутствует коннектор Glue для ClickHouse, можно использовать официальный JDBC-коннектор для подключения и интеграции с ClickHouse:

<Tabs>
<TabItem value="Java" label="Java" default>

```java
import com.amazonaws.services.glue.util.Job
import com.amazonaws.services.glue.util.GlueArgParser
import com.amazonaws.services.glue.GlueContext
import org.apache.spark.SparkContext
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.DataFrame
import scala.collection.JavaConverters._
import com.amazonaws.services.glue.log.GlueLogger


// Инициализация задачи Glue
object GlueJob {
  def main(sysArgs: Array[String]) {
    val sc: SparkContext = new SparkContext()
    val glueContext: GlueContext = new GlueContext(sc)
    val spark: SparkSession = glueContext.getSparkSession
    val logger = new GlueLogger
    import spark.implicits._
    // @params: [JOB_NAME]
    val args = GlueArgParser.getResolvedOptions(sysArgs, Seq("JOB_NAME").toArray)
    Job.init(args("JOB_NAME"), glueContext, args.asJava)

    // Подробности подключения JDBC
    val jdbcUrl = "jdbc:ch://{host}:{port}/{schema}"
    val jdbcProperties = new java.util.Properties()
    jdbcProperties.put("user", "default")
    jdbcProperties.put("password", "*******")
    jdbcProperties.put("driver", "com.clickhouse.jdbc.ClickHouseDriver")

    // Загрузка таблицы из ClickHouse
    val df: DataFrame = spark.read.jdbc(jdbcUrl, "my_table", jdbcProperties)

    // Показать Spark df или использовать его по своему усмотрению
    df.show()

    // Завершить задачу
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

## @params: [JOB_NAME]
args = getResolvedOptions(sys.argv, ['JOB_NAME'])

sc = SparkContext()
glueContext = GlueContext(sc)
logger = glueContext.get_logger()
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)
jdbc_url = "jdbc:ch://{host}:{port}/{schema}"
query = "select * from my_table"

# Для использования в облаке, пожалуйста, добавьте ssl параметры
df = (spark.read.format("jdbc")
    .option("driver", 'com.clickhouse.jdbc.ClickHouseDriver')
    .option("url", jdbc_url)
    .option("user", 'default')
    .option("password", '*******')
    .option("query", query)
    .load())

logger.info("количество строк:")
logger.info(str(df.count()))
logger.info("Пример данных:")
logger.info(str(df.take(10)))


job.commit()
```

</TabItem>
</Tabs>

Для получения дополнительных сведений, пожалуйста, посетите нашу [документацию по Spark & JDBC](/integrations/apache-spark/spark-jdbc#read-data).
