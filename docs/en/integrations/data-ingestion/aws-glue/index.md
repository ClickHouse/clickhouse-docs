---
sidebar_label: Amazon Glue
sidebar_position: 1
slug: /en/integrations/glue
description: Integrate ClickHouse and Amazon Glue
keywords: [ clickhouse, amazon, aws, glue, migrating, data ]
---

# Integrating Amazon Glue with ClickHouse

[Amazon Glue](https://aws.amazon.com/glue/) is a fully managed, serverless data integration service provided by Amazon Web Services (AWS). It simplifies the process of discovering, preparing, and transforming data for analytics, machine learning, and application development.


Although there is no Glue ClickHouse connector available yet, the official JDBC connector can be leveraged to connect and integrate with ClickHouse:

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

For more details, please visit our [Spark & JDBC documentation](/en/integrations/apache-spark#read-data).


