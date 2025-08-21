---
sidebar_label: 'Amazon Glue'
sidebar_position: 1
slug: /integrations/glue
description: 'Integrate ClickHouse and Amazon Glue'
keywords: ['clickhouse', 'amazon', 'aws', 'glue', 'migrating', 'data', 'spark']
title: 'Integrating Amazon Glue with ClickHouse and Spark'
doc_type: overview
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import notebook_connections_config from '@site/static/images/integrations/data-ingestion/aws-glue/notebook-connections-config.png';
import dependent_jars_path_option from '@site/static/images/integrations/data-ingestion/aws-glue/dependent_jars_path_option.png';

# Integrating Amazon Glue with ClickHouse and Spark

[Amazon Glue](https://aws.amazon.com/glue/) is a fully managed, serverless data integration service provided by Amazon Web Services (AWS). It simplifies the process of discovering, preparing, and transforming data for analytics, machine learning, and application development.

## Installation {#installation}

To integrate your Glue code with ClickHouse, you can use our official Spark connector in Glue via one of the following:
- Installing the ClickHouse Glue connector from the AWS Marketplace (recommended).
- Manually adding the Spark Connector's jars to your Glue job.

<Tabs>
<TabItem value="AWS Marketplace" label="AWS Marketplace" default>

1. <h3 id="subscribe-to-the-connector">Subscribe to the Connector</h3>
To access the connector in your account, subscribe to the ClickHouse AWS Glue Connector from AWS Marketplace.

2. <h3 id="grant-required-permissions">Grant Required Permissions</h3>
Ensure your Glue job’s IAM role has the necessary permissions, as described in the minimum privileges [guide](https://docs.aws.amazon.com/glue/latest/dg/getting-started-min-privs-job.html#getting-started-min-privs-connectors).

3. <h3 id="activate-the-connector">Activate the Connector & Create a Connection</h3>
You can activate the connector and create a connection directly by clicking [this link](https://console.aws.amazon.com/gluestudio/home#/connector/add-connection?connectorName="ClickHouse%20AWS%20Glue%20Connector"&connectorType="Spark"&connectorUrl=https://709825985650.dkr.ecr.us-east-1.amazonaws.com/clickhouse/clickhouse-glue:0.1&connectorClassName="com.clickhouse.spark.ClickHouseCatalog"), which opens the Glue connection creation page with key fields pre-filled. Give the connection a name, and press create (no need to provide the ClickHouse connection details at this stage).

4. <h3 id="use-in-glue-job">Use in Glue Job</h3>
In your Glue job, select the `Job details` tab, and expend the `Advanced properties` window. Under the `Connections` section, select the connection you just created. The connector automatically injects the required JARs into the job runtime.

<Image img={notebook_connections_config} size='md' alt='Glue Notebook connections config' force='true' />

:::note
The JARs used in the Glue connector are built for `Spark 3.3`, `Scala 2`, and `Python 3`. Make sure to select these versions when configuring your Glue job.
:::

</TabItem>
<TabItem value="Manual Installation" label="Manual Installation">
To add the required jars manually, please follow the following:
1. Upload the following jars to an S3 bucket - `clickhouse-jdbc-0.6.X-all.jar` and `clickhouse-spark-runtime-3.X_2.X-0.8.X.jar`.
2. Make sure the Glue job has access to this bucket.
3. Under the `Job details` tab, scroll down and expend the `Advanced properties` drop down, and fill the jars path in `Dependent JARs path`:

<Image img={dependent_jars_path_option} size='md' alt='Glue Notebook JAR path options' force='true' />

</TabItem>
</Tabs>

## Examples {#example}
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

For more details, please visit our [Spark documentation](/integrations/apache-spark).
