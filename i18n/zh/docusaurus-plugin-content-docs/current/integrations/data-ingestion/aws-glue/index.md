---
sidebar_label: 'Amazon Glue'
sidebar_position: 1
slug: /integrations/glue
description: '集成 Amazon Glue 与 ClickHouse'
keywords: ['clickhouse', 'amazon', 'aws', 'glue', 'migrating', 'data', 'spark']
title: 'Amazon Glue 与 ClickHouse 和 Spark 的集成'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import notebook_connections_config from '@site/static/images/integrations/data-ingestion/aws-glue/notebook-connections-config.png';
import dependent_jars_path_option from '@site/static/images/integrations/data-ingestion/aws-glue/dependent_jars_path_option.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

<ClickHouseSupportedBadge />

[Amazon Glue](https://aws.amazon.com/glue/) 是 Amazon Web Services (AWS) 提供的一项全托管的无服务器数据集成服务。它简化了数据发现、准备和转换流程，可用于分析、机器学习和应用开发。

## 安装 \{#installation\}

要将您的 Glue 代码与 ClickHouse 集成，您可以通过以下任一方式在 Glue 中使用我们的官方 Spark 连接器：

* 从 AWS Marketplace 安装 ClickHouse Glue 连接器 (推荐) 。
* 将 Spark 连接器的 jar 包手动添加到您的 Glue 作业中。

<Tabs>
  <TabItem value="AWS Marketplace" label="AWS Marketplace" default>
    1. <h3 id="subscribe-to-the-connector">订阅连接器</h3>
       要在您的账户中使用该连接器，请先在 AWS Marketplace 订阅 ClickHouse AWS Glue Connector。

    2. <h3 id="grant-required-permissions">授予所需权限</h3>
       确保您的 Glue 作业所使用的 IAM 角色具有所需权限，详见最低权限[指南](https://docs.aws.amazon.com/glue/latest/dg/getting-started-min-privs-job.html#getting-started-min-privs-connectors)。

    3. <h3 id="activate-the-connector">激活连接器并创建连接</h3>
       您可以点击[此链接](https://console.aws.amazon.com/gluestudio/home#/connector/add-connection?connectorName="ClickHouse%20AWS%20Glue%20Connector"\&connectorType="Spark"\&connectorUrl=https://709825985650.dkr.ecr.us-east-1.amazonaws.com/clickhouse/clickhouse-glue:1.0.0\&connectorClassName="com.clickhouse.spark.ClickHouseCatalog")直接激活该连接器并创建连接。该链接会打开 Glue 的连接创建页面，并预先填好关键字段。为该连接命名后，点击 create (此阶段无需提供 ClickHouse 连接详细信息) 。

    4. <h3 id="use-in-glue-job">在 Glue 作业中使用</h3>
       在您的 Glue 作业中，选择 `Job details` 选项卡，然后展开 `Advanced properties` 窗格。在 `Connections` 部分中，选择您刚刚创建的连接。该连接器会自动将所需的 JAR 注入作业运行时。

    <Image img={notebook_connections_config} size="md" alt="Glue Notebook 连接配置" force="true" />

    :::note
    Glue 连接器中使用的 JAR 是为 `Spark 3.3`、`Scala 2` 和 `Python 3` 构建的。配置 Glue 作业时，请确保选择这些版本。
    :::
  </TabItem>

  <TabItem value="Manual Installation" label="手动安装">
    要手动添加所需的 jar 包，请按以下步骤操作：

    1. 将以下 jar 包上传到一个 S3 存储桶：`clickhouse-jdbc-0.6.X-all.jar` 和 `clickhouse-spark-runtime-3.X_2.X-0.8.X.jar`。
    2. 确保 Glue 作业可以访问该存储桶。
    3. 在 `Job details` 选项卡下，向下滚动并展开 `Advanced properties` 下拉菜单，然后在 `Dependent JARs path` 中填写 jar 路径：

    <Image img={dependent_jars_path_option} size="md" alt="Glue Notebook JAR 路径选项" force="true" />
  </TabItem>
</Tabs>

## 示例 \{#example\}

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

如需了解更多信息，请参阅我们的[Spark 文档](/integrations/apache-spark)。