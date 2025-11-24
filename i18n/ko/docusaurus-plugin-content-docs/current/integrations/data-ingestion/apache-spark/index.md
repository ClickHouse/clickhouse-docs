---
'sidebar_label': 'ClickHouse와 Apache Spark 통합'
'sidebar_position': 1
'slug': '/integrations/apache-spark'
'description': 'ClickHouse와 Apache Spark 소개'
'keywords':
- 'clickhouse'
- 'Apache Spark'
- 'migrating'
- 'data'
'title': 'ClickHouse와 Apache Spark 통합'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Apache Spark와 ClickHouse 통합하기

<ClickHouseSupportedBadge/>

[Apache Spark](https://spark.apache.org/)는 단일 노드 머신이나 클러스터에서 데이터 엔지니어링, 데이터 과학 및 기계 학습을 실행하기 위한 다국어 엔진입니다.

Apache Spark와 ClickHouse를 연결하는 두 가지 주요 방법이 있습니다:

1. [Spark Connector](./apache-spark/spark-native-connector) - Spark 커넥터는 `DataSourceV2`를 구현하며 자체 카탈로그 관리를 갖추고 있습니다. 현재로서는 ClickHouse와 Spark를 통합하는 권장 방법입니다.
2. [Spark JDBC](./apache-spark/spark-jdbc) - [JDBC 데이터 소스](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html)를 사용하여 Spark와 ClickHouse를 통합합니다.

<br/>
<br/>
두 솔루션 모두 성공적으로 테스트되었으며 Java, Scala, PySpark 및 Spark SQL을 포함한 다양한 API와 완벽하게 호환됩니다.
