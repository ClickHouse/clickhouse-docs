---
'sidebar_label': 'Amazon Glue'
'sidebar_position': 1
'slug': '/integrations/glue'
'description': 'ClickHouse と Amazon Glue を 統合する'
'keywords':
- 'clickhouse'
- 'amazon'
- 'aws'
- 'glue'
- 'migrating'
- 'data'
'title': 'Amazon Glue と ClickHouse の 統合'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Amazon Glue と ClickHouse の統合

[Amazon Glue](https://aws.amazon.com/glue/) は、Amazon Web Services (AWS) が提供する完全に管理されたサーバーレスのデータ統合サービスです。これにより、分析、機械学習、およびアプリケーション開発のためのデータの発見、準備、および変換プロセスが簡素化されます。

現時点では Glue ClickHouse コネクタは利用できませんが、公式の JDBC コネクタを活用して ClickHouse に接続し、統合することができます。

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


// Glue ジョブの初期化
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

    // JDBC 接続詳細
    val jdbcUrl = "jdbc:ch://{host}:{port}/{schema}"
    val jdbcProperties = new java.util.Properties()
    jdbcProperties.put("user", "default")
    jdbcProperties.put("password", "*******")
    jdbcProperties.put("driver", "com.clickhouse.jdbc.ClickHouseDriver")

    // ClickHouse からテーブルをロードする
    val df: DataFrame = spark.read.jdbc(jdbcUrl, "my_table", jdbcProperties)

    // Spark df を表示するか、お好きなように使用する
    df.show()

    // ジョブをコミットする
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

# クラウド利用時は、ssl オプションを追加してください
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

詳細については、[Spark & JDBC ドキュメント](/integrations/apache-spark/spark-jdbc#read-data)をご覧ください。
