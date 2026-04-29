---
sidebar_label: 'Amazon Glue'
sidebar_position: 1
slug: /integrations/glue
description: 'Integrate ClickHouse and Amazon Glue'
keywords: ['clickhouse', 'amazon', 'aws', 'glue', 'migrating', 'data', 'spark']
title: 'Integrating Amazon Glue with ClickHouse and Spark'
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
import marketplace_usage_instructions from '@site/static/images/integrations/data-ingestion/aws-glue/marketplace-usage-instructions.png';
import glue_studio_visual_editor from '@site/static/images/integrations/data-ingestion/aws-glue/glue-studio-visual-editor.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Integrating Amazon Glue with ClickHouse and Spark

<ClickHouseSupportedBadge/>

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
After subscribing, select the Glue version that matches your job requirements. In the **Additional details** section, under **Usage instructions**, click the link to **Open Glue Studio - Add ClickHouse connector**. This opens the Glue connection creation page with key fields pre-filled. Give the connection a name and press create (no need to provide the ClickHouse connection details at this stage).

<Image img={marketplace_usage_instructions} size='md' alt='AWS Marketplace usage instructions for ClickHouse Glue connector' />

4. <h3 id="use-in-glue-job">Use in Glue Job</h3>
In your Glue job, select the `Job details` tab, and expend the `Advanced properties` window. Under the `Connections` section, select the connection you just created. The connector automatically injects the required JARs into the job runtime.

<Image img={notebook_connections_config} size='md' alt='Glue Notebook connections config' force='true' />

:::note
Make sure to select the connector version that matches your Glue job configuration:
- **Glue 4**: Spark 3.3, Scala 2, Python 3
- **Glue 5**: Spark 3.5, Scala 2, Python 3
:::

</TabItem>
<TabItem value="Manual Installation" label="Manual Installation">
To add the required jars manually, please follow the following:
1. Upload the latest Spark connector JAR (`clickhouse-spark-runtime-3.X_2.X-0.10.X.jar`) to an S3 bucket.
2. Make sure the Glue job has access to this bucket.
3. Under the `Job details` tab, scroll down and expend the `Advanced properties` drop down, and fill the jars path in `Dependent JARs path`:

<Image img={dependent_jars_path_option} size='md' alt='Glue Notebook JAR path options' force='true' />

</TabItem>
</Tabs>

## Using AWS Secrets Manager for credentials {#secrets-manager}

Rather than hardcoding your ClickHouse user and password in the job, store them in [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/) and reference the secret from your Glue connection or job script. At runtime, Glue fetches the secret and merges its key-value pairs into the connector's connection options.

### Create the secret {#create-secret}

In AWS Secrets Manager, create a secret of type **Other type of secret** with key-value pairs whose keys match the connector's option names:

| Key | Value |
|---|---|
| `user` | your ClickHouse username |
| `password` | your ClickHouse password |

Any key you put in the secret is forwarded to the connector, so you can also store `host`, `database`, or any other option there if you'd like to keep them out of code.

### Reference the secret {#reference-secret}

There are two ways to wire the secret into a job.

**Option 1: attach it to the Glue connection.** When creating or editing the ClickHouse connection in Glue Studio, set the **AWS secret** field to the secret's name. Any job that uses this connection resolves the secret automatically — no code changes needed.

**Option 2: pass `secretId` in connection options.** Add `secretId` to the options map and drop the keys the secret provides:

<Tabs>
<TabItem value="Python" label="Python" default>

```python
clickhouse_options = {
    "className": "clickhouse",
    "secretId": "clickhouse/glue/credentials",
    "host": "<your-clickhouse-host>",
    "http_port": "<your-clickhouse-port>",
    "protocol": "https",
    "database": "default",
    "table": "example_table",
    "ssl": "true"
}
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
val clickHouseOptions = JsonOptions(Map(
  "className" -> "clickhouse",
  "secretId" -> "clickhouse/glue/credentials",
  "host" -> "<your-clickhouse-host>",
  "http_port" -> "<your-clickhouse-port>",
  "protocol" -> "https",
  "database" -> "default",
  "table" -> "example_table",
  "ssl" -> "true"
))
```

</TabItem>
</Tabs>

The secret's `user` and `password` keys are merged into these options at runtime, so you never need to read them in your script.

## Examples {#example}
<Tabs>
<TabItem value="Visual Editor" label="Visual Editor" default>

You can use the ClickHouse connector as either a source or a target in the Glue Studio visual editor. Simply drag the ClickHouse Spark Connector component onto the canvas and connect it to your data pipeline.

<Image img={glue_studio_visual_editor} size='md' alt='Glue Studio visual editor with ClickHouse connector' />

</TabItem>
<TabItem value="Scala" label="Scala">

```java
import com.amazonaws.services.glue.GlueContext
import com.amazonaws.services.glue.util.{GlueArgParser, Job, JsonOptions}
import org.apache.spark.SparkContext
import scala.collection.JavaConverters._

object ClickHouseGlueExample {
  def main(sysArgs: Array[String]): Unit = {
    val args = GlueArgParser.getResolvedOptions(sysArgs, Seq("JOB_NAME").toArray)

    val sc = new SparkContext()
    val glueContext = new GlueContext(sc)
    Job.init(args("JOB_NAME"), glueContext, args.asJava)

    val clickHouseOptions = JsonOptions(Map(
      "className" -> "clickhouse",
      "host" -> "<your-clickhouse-host>",
      "http_port" -> "<your-clickhouse-port>",
      "protocol" -> "https",
      "user" -> "default",
      "password" -> "<your-password>",
      "database" -> "default",
      "table" -> "example_table",
      // for ClickHouse Cloud
      "ssl" -> "true"
    ))

    // Read from ClickHouse
    val source = glueContext.getSource(
      connectionType = "custom.spark",
      connectionOptions = clickHouseOptions,
      transformationContext = "clickhouseSource"
    )
    val dyf = source.getDynamicFrame()

    // Write to ClickHouse
    val writeOptions = JsonOptions(Map(
      "className" -> "clickhouse",
      "host" -> "<your-clickhouse-host>",
      "http_port" -> "<your-clickhouse-port>",
      "protocol" -> "https",
      "user" -> "default",
      "password" -> "<your-password>",
      "database" -> "default",
      "table" -> "target_table",
      "ssl" -> "true"
    ))

    glueContext.getSink(
      connectionType = "custom.spark",
      connectionOptions = writeOptions
    ).writeDynamicFrame(dyf)

    Job.commit()
  }
}
```

</TabItem>
<TabItem value="Python" label="Python">

```python
import sys
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job

args = getResolvedOptions(sys.argv, ['JOB_NAME'])

sc = SparkContext()
glueContext = GlueContext(sc)
logger = glueContext.get_logger()
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

clickhouse_options = {
    "className": "clickhouse",
    "host": "<your-clickhouse-host>",
    "http_port": "<your-clickhouse-port>",
    "protocol": "https",
    "user": "default",
    "password": "<your-password>",
    "database": "default",
    "table": "example_table",
    # for ClickHouse Cloud
    "ssl": "true"
}

# Read from ClickHouse
source = glueContext.create_dynamic_frame.from_options(
    connection_type="custom.spark",
    connection_options=clickhouse_options,
    transformation_ctx="clickhouse_source"
)
dyf = source

logger.info(f"Read {dyf.count()} rows from ClickHouse")

# Write to ClickHouse
write_options = {
    "className": "clickhouse",
    "host": "<your-clickhouse-host>",
    "http_port": "<your-clickhouse-port>",
    "protocol": "https",
    "user": "default",
    "password": "<your-password>",
    "database": "default",
    "table": "target_table",
    "ssl": "true"
}

glueContext.write_dynamic_frame.from_options(
    frame=dyf,
    connection_type="custom.spark",
    connection_options=write_options,
    transformation_ctx="clickhouse_sink"
)

job.commit()
```

</TabItem>
</Tabs>

For more details, please visit our [Spark documentation](/integrations/apache-spark).
