---
sidebar_label: Amazon Glue
sidebar_position: 1
slug: /integrations/glue
description: ClickHouseとAmazon Glueの統合
keywords: [ clickhouse, amazon, aws, glue, migrating, data ]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ClickHouseとAmazon Glueの統合

[Amazon Glue](https://aws.amazon.com/glue/) は、Amazon Web Services (AWS) によって提供される完全マネージドのサーバーレスデータ統合サービスです。分析、機械学習、アプリケーション開発のためにデータを発見、準備、および変換するプロセスを簡素化します。

現時点ではGlue ClickHouseコネクタは提供されていませんが、公式のJDBCコネクタを利用してClickHouseに接続し、統合することができます。

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


// Glueジョブを初期化
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

    // JDBC接続の詳細
    val jdbcUrl = "jdbc:ch://{host}:{port}/{schema}"
    val jdbcProperties = new java.util.Properties()
    jdbcProperties.put("user", "default")
    jdbcProperties.put("password", "*******")
    jdbcProperties.put("driver", "com.clickhouse.jdbc.ClickHouseDriver")

    // ClickHouseからテーブルをロード
    val df: DataFrame = spark.read.jdbc(jdbcUrl, "my_table", jdbcProperties)

    // Sparkのデータフレームを表示するか、任意の使用に利用する
    df.show()

    // ジョブをコミット
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
# クラウド使用時は、SSLオプションを追加してください
df = (spark.read.format("jdbc")
    .option("driver", 'com.clickhouse.jdbc.ClickHouseDriver')
    .option("url", jdbc_url)
    .option("user", 'default')
    .option("password", '*******')
    .option("query", query)
    .load())

logger.info("行数:")
logger.info(str(df.count()))
logger.info("データサンプル:")
logger.info(str(df.take(10)))


job.commit()
```

</TabItem>
</Tabs>

詳細については、[Spark & JDBCのドキュメント](/integrations/apache-spark#read-data)をご覧ください。
