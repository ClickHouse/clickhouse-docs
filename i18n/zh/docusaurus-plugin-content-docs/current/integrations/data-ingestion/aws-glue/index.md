import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 将 Amazon Glue 与 ClickHouse 集成

[Amazon Glue](https://aws.amazon.com/glue/) 是由亚马逊网络服务（AWS）提供的完全托管的无服务器数据集成服务。它简化了发现、准备和转换数据以进行分析、机器学习和应用开发的过程。

虽然尚未提供 Glue ClickHouse 连接器，但可以利用官方 JDBC 连接器来连接和集成 ClickHouse：

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


// Initialize Glue job
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

    // JDBC connection details
    val jdbcUrl = "jdbc:ch://{host}:{port}/{schema}"
    val jdbcProperties = new java.util.Properties()
    jdbcProperties.put("user", "default")
    jdbcProperties.put("password", "*******")
    jdbcProperties.put("driver", "com.clickhouse.jdbc.ClickHouseDriver")

    // Load the table from ClickHouse
    val df: DataFrame = spark.read.jdbc(jdbcUrl, "my_table", jdbcProperties)

    // Show the Spark df, or use it for whatever you like
    df.show()

    // Commit the job
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

# For cloud usage, please add ssl options
df = (spark.read.format("jdbc")
    .option("driver", 'com.clickhouse.jdbc.ClickHouseDriver')
    .option("url", jdbc_url)
    .option("user", 'default')
    .option("password", '*******')
    .option("query", query)
    .load())

logger.info("num of rows:")
logger.info(str(df.count()))
logger.info("Data sample:")
logger.info(str(df.take(10)))


job.commit()
```

</TabItem>
</Tabs>

有关更多详细信息，请访问我们的 [Spark & JDBC 文档](/integrations/apache-spark/spark-jdbc#read-data)。
