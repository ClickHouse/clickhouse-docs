---
sidebar_label: 'Apache Spark와 ClickHouse 통합'
sidebar_position: 1
slug: /integrations/apache-spark
description: 'Apache Spark와 ClickHouse 통합 소개'
keywords: ['clickhouse', 'Apache Spark', '마이그레이션', '데이터']
title: 'Apache Spark와 ClickHouse 통합'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Apache Spark와 ClickHouse 통합 \{#integrating-apache-spark-with-clickhouse\}

<ClickHouseSupportedBadge/>

[Apache Spark](https://spark.apache.org/)는 단일 노드 또는 클러스터 환경에서 데이터 엔지니어링, 데이터
사이언스, 머신 러닝 작업을 실행하기 위한 멀티 언어 엔진입니다.

Apache Spark와 ClickHouse를 연결하는 주요 방법은 두 가지입니다:

1. [Spark Connector](./apache-spark/spark-native-connector) - Spark 커넥터는 `DataSourceV2`를 구현하며 자체 Catalog
   관리를 제공합니다. 현재로서는 ClickHouse와 Spark를 통합하는 데 권장되는 방식입니다.
2. [Spark JDBC](./apache-spark/spark-jdbc) - [JDBC 데이터 소스](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html)를 사용하여
   Spark와 ClickHouse를 통합합니다.

<br/>

이 두 가지 방식은 모두 성공적으로 테스트되었으며 Java, Scala, PySpark, Spark SQL을 포함한 다양한 API와 완전히 호환됩니다.

### Spark 실행 환경 \{#spark-runtime-environment\}

#### 표준 Spark 런타임 \{#standard-spark-runtime\}

Spark Connector는 Amazon EMR, Kubernetes 기반 Spark 배포 등 Apache Spark 업스트림 런타임을 밀접하게 따르는 환경에서는 별도의 추가 설정 없이 바로 동작합니다.

#### 관리형 Spark 플랫폼 \{#managed-spark-platforms\}

[AWS Glue](./../aws-glue/index.md) 및 [Databricks](./databricks.md)와 같은 플랫폼은 추가적인 추상화 계층과 환경별 동작을 도입합니다.
핵심 통합은 동일하게 유지되지만, 별도의 구성 및 설정 단계가 필요할 수 있습니다. 자세한 내용은 각 플랫폼의 문서 페이지를 참조하십시오.