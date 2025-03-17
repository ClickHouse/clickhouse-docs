---
sidebar_label: '亚马逊 Glue'
sidebar_position: 1
slug: /integrations/glue
description: '集成 ClickHouse 和 亚马逊 Glue'
keywords: [ 'clickhouse', 'amazon', 'aws', 'glue', 'migrating', 'data' ]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 集成亚马逊 Glue 与 ClickHouse

[亚马逊 Glue](https://aws.amazon.com/glue/) 是由亚马逊网络服务（AWS）提供的完全托管的无服务器数据集成服务。它简化了数据发现、准备和转换的过程，以便用于分析、机器学习和应用程序开发。

虽然目前还没有 Glue ClickHouse 连接器可用，但可以利用官方 JDBC 连接器与 ClickHouse 进行连接和集成：

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


// 初始化 Glue 作业
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

    // JDBC 连接详细信息
    val jdbcUrl = "jdbc:ch://{host}:{port}/{schema}"
    val jdbcProperties = new java.util.Properties()
    jdbcProperties.put("user", "default")
    jdbcProperties.put("password", "*******")
    jdbcProperties.put("driver", "com.clickhouse.jdbc.ClickHouseDriver")

    // 从 ClickHouse 加载表
    val df: DataFrame = spark.read.jdbc(jdbcUrl, "my_table", jdbcProperties)

    // 显示 Spark df，或将其用于您喜欢的任何用途
    df.show()

    // 提交作业
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

# 对于云使用，请添加 ssl 选项
df = (spark.read.format("jdbc")
    .option("driver", 'com.clickhouse.jdbc.ClickHouseDriver')
    .option("url", jdbc_url)
    .option("user", 'default')
    .option("password", '*******')
    .option("query", query)
    .load())

logger.info("行数：")
logger.info(str(df.count()))
logger.info("数据样本：")
logger.info(str(df.take(10)))


job.commit()
```

</TabItem>
</Tabs>

有关更多详情，请访问我们的 [Spark & JDBC 文档](/integrations/apache-spark/spark-jdbc#read-data)。
