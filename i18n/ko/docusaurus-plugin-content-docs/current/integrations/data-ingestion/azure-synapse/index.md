---
sidebar_label: 'Azure Synapse'
slug: /integrations/azure-synapse
description: 'ClickHouse와 함께 사용하는 Azure Synapse 소개'
keywords: ['clickhouse', 'azure synapse', 'azure', 'synapse', 'microsoft', 'azure spark', 'data']
title: 'Azure Synapse를 ClickHouse와 통합하기'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Azure Synapse를 ClickHouse와 통합하기 \{#integrating-azure-synapse-with-clickhouse\}

<ClickHouseSupportedBadge/>

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics)는 빅 데이터, 데이터 과학, 데이터 웨어하우스를 결합하여 빠르고 대규모 데이터 분석을 가능하게 하는 통합 분석 서비스입니다.
Synapse 내의 Spark 풀은 온디맨드 방식으로 확장 가능한 [Apache Spark](https://spark.apache.org) 클러스터를 제공하여 복잡한 데이터 변환, 머신 러닝, 외부 시스템과의 통합을 실행할 수 있게 합니다.

이 문서에서는 Azure Synapse에서 Apache Spark를 사용할 때 [ClickHouse Spark connector](/integrations/apache-spark/spark-native-connector)를 통합하는 방법을 보여줍니다.

<TOCInline toc={toc}></TOCInline>

## 커넥터의 종속성 추가 \{#add-connector-dependencies\}

Azure Synapse는 [패키지 유지 관리](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)를 다음 세 가지 수준으로 지원합니다.

1. 기본 패키지
2. Spark 풀 수준
3. 세션 수준

<br/>

[Manage libraries for Apache Spark pools 가이드](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)를 참고하여 Spark 애플리케이션에 다음 필수 종속성을 추가하십시오.

- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [공식 Maven 저장소](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` - [공식 Maven 저장소](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

환경에 적합한 버전을 확인하려면 [Spark Connector Compatibility Matrix](/integrations/apache-spark/spark-native-connector#compatibility-matrix) 문서를 참조하십시오.

## ClickHouse를 카탈로그로 추가 \{#add-clickhouse-as-catalog\}

세션에 Spark 구성(Spark config)을 추가하는 방법은 여러 가지가 있습니다:

* 세션에서 불러올 사용자 지정 구성 파일 사용
* Azure Synapse UI를 통해 구성 추가
* Synapse 노트북에서 구성 추가

[Manage Apache Spark configuration](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)를
참고한 뒤, [커넥터에 필요한 Spark 구성](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)을 추가합니다.

예를 들어, 노트북에서 다음 설정으로 Spark 세션을 구성할 수 있습니다:

```python
%%configure -f
{
    "conf": {
        "spark.sql.catalog.clickhouse": "com.clickhouse.spark.ClickHouseCatalog",
        "spark.sql.catalog.clickhouse.host": "<clickhouse host>",
        "spark.sql.catalog.clickhouse.protocol": "https",
        "spark.sql.catalog.clickhouse.http_port": "<port>",
        "spark.sql.catalog.clickhouse.user": "<username>",
        "spark.sql.catalog.clickhouse.password": "password",
        "spark.sql.catalog.clickhouse.database": "default"
    }
}
```

다음과 같이 첫 번째 셀에 위치하도록 하십시오:

<Image img={sparkConfigViaNotebook} size="xl" alt="노트북에서 Spark 설정 구성" border />

추가 설정은 [ClickHouse Spark 설정 페이지](/integrations/apache-spark/spark-native-connector#configurations)를 참조하십시오.

:::info
ClickHouse Cloud를 사용하는 경우 [필수 Spark 설정](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)을 반드시 설정하십시오.
:::


## 설정 검증 \{#setup-verification\}

의존성과 설정이 정상적으로 구성되었는지 확인하려면 세션의 Spark UI로 이동한 후 `Environment` 탭을 엽니다.
그 탭에서 ClickHouse 관련 설정을 찾습니다:

<Image img={sparkUICHSettings} size="xl" alt="Spark UI를 사용하여 ClickHouse 설정을 확인하기" border/>

## 추가 자료 \{#additional-resources\}

- [ClickHouse Spark 커넥터 문서](/integrations/apache-spark)
- [Azure Synapse Spark 풀 개요](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Apache Spark 워크로드 성능 최적화](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Synapse에서 Apache Spark 풀 라이브러리 관리](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Synapse에서 Apache Spark 구성 관리](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)