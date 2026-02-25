---
sidebar_label: 'Amazon Glue'
sidebar_position: 1
slug: /integrations/glue
description: 'ClickHouse와 Amazon Glue 통합'
keywords: ['clickhouse', 'amazon', 'aws', 'glue', 'migrating', 'data', 'spark']
title: 'Amazon Glue를 ClickHouse 및 Spark와 통합하기'
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


# Amazon Glue를 ClickHouse 및 Spark와 통합하기 \{#integrating-amazon-glue-with-clickhouse-and-spark\}

<ClickHouseSupportedBadge/>

[Amazon Glue](https://aws.amazon.com/glue/)는 Amazon Web Services(AWS)에서 제공하는 완전 관리형 서버리스 데이터 통합 서비스입니다. 분석, 머신 러닝, 애플리케이션 개발을 위해 데이터를 탐색, 준비 및 변환하는 작업을 단순화합니다.

## 설치 \{#installation\}

Glue 코드를 ClickHouse와 통합하기 위해, 다음 방법 중 하나를 사용하여 Glue에서 공식 Spark 커넥터를 사용할 수 있습니다.

- AWS Marketplace에서 ClickHouse Glue 커넥터를 설치합니다(권장).
- Spark Connector의 JAR을 수동으로 Glue 잡에 추가합니다.

<Tabs>
<TabItem value="AWS Marketplace" label="AWS Marketplace" default>

1. <h3 id="subscribe-to-the-connector">커넥터 구독</h3>
계정에서 커넥터를 사용하려면 AWS Marketplace에서 ClickHouse AWS Glue Connector를 구독합니다.

2. <h3 id="grant-required-permissions">필수 권한 부여</h3>
최소 권한 [가이드](https://docs.aws.amazon.com/glue/latest/dg/getting-started-min-privs-job.html#getting-started-min-privs-connectors)에 설명된 대로, Glue 잡의 IAM 역할에 필요한 권한이 있는지 확인합니다.

3. <h3 id="activate-the-connector">커넥터 활성화 및 커넥션 생성</h3>
[이 링크](https://console.aws.amazon.com/gluestudio/home#/connector/add-connection?connectorName="ClickHouse%20AWS%20Glue%20Connector"&connectorType="Spark"&connectorUrl=https://709825985650.dkr.ecr.us-east-1.amazonaws.com/clickhouse/clickhouse-glue:1.0.0&connectorClassName="com.clickhouse.spark.ClickHouseCatalog")를 클릭하여 커넥터를 활성화하고 바로 커넥션을 생성할 수 있습니다. 이 링크는 주요 필드가 미리 채워진 Glue 커넥션 생성 페이지를 엽니다. 커넥션 이름을 지정한 뒤 생성 버튼을 누릅니다(이 단계에서는 ClickHouse 커넥션 세부 정보를 제공할 필요가 없습니다).

4. <h3 id="use-in-glue-job">Glue 잡에서 사용</h3>
Glue 잡에서 `Job details` 탭을 선택한 다음 `Advanced properties` 창을 펼칩니다. `Connections` 섹션에서 방금 생성한 커넥션을 선택합니다. 커넥터는 필요한 JAR을 잡 런타임에 자동으로 주입합니다.

<Image img={notebook_connections_config} size='md' alt='Glue Notebook 커넥션 구성' force='true' />

:::note
Glue 커넥터에서 사용하는 JAR은 `Spark 3.3`, `Scala 2`, `Python 3`용으로 빌드되어 있습니다. Glue 잡을 구성할 때 이 버전들을 선택해야 합니다.
:::

</TabItem>
<TabItem value="Manual Installation" label="수동 설치">
필요한 JAR을 수동으로 추가하려면 다음 절차를 따르십시오.
1. 다음 JAR을 S3 버킷에 업로드합니다: `clickhouse-jdbc-0.6.X-all.jar` 및 `clickhouse-spark-runtime-3.X_2.X-0.8.X.jar`.
2. Glue 잡이 이 버킷에 접근할 수 있는지 확인합니다.
3. `Job details` 탭에서 아래로 스크롤하여 `Advanced properties` 드롭다운을 펼치고, `Dependent JARs path`에 JAR 경로를 입력합니다:

<Image img={dependent_jars_path_option} size='md' alt='Glue Notebook JAR 경로 옵션' force='true' />

</TabItem>
</Tabs>

## 예제 \{#example\}

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

자세한 내용은 [Spark 문서](/integrations/apache-spark)를 참조하십시오.