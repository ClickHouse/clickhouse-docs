---
'sidebar_label': 'Azure Synapse'
'slug': '/integrations/azure-synapse'
'description': 'Azure Synapse와 ClickHouse 통합 소개'
'keywords':
- 'clickhouse'
- 'azure synapse'
- 'azure'
- 'synapse'
- 'microsoft'
- 'azure spark'
- 'data'
'title': 'Integrating Azure Synapse with ClickHouse'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import Image from '@theme/IdealImage';
import sparkConfigViaNotebook from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_notebook_conf.png';
import sparkUICHSettings from '@site/static/images/integrations/data-ingestion/azure-synapse/spark_ui_ch_settings.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Azure Synapse와 ClickHouse 통합하기

<ClickHouseSupportedBadge/>

[Azure Synapse](https://azure.microsoft.com/en-us/products/synapse-analytics)는 빠르고 대규모 데이터 분석을 가능하게 하는 빅 데이터, 데이터 과학 및 웨어하우징을 결합한 통합 분석 서비스입니다. 
Synapse 내에서 Spark 풀은 사용자들이 복잡한 데이터 변환, 기계 학습 및 외부 시스템과의 통합을 수행할 수 있도록 온디맨드로 확장 가능한 [Apache Spark](https://spark.apache.org) 클러스터를 제공합니다.

이 문서에서는 Apache Spark를 Azure Synapse 내에서 사용할 때 [ClickHouse Spark 커넥터](/integrations/apache-spark/spark-native-connector)를 통합하는 방법을 보여줍니다.

<TOCInline toc={toc}></TOCInline>

## 커넥터의 의존성 추가하기 {#add-connector-dependencies}
Azure Synapse는 세 가지 수준의 [패키지 관리](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-portal-add-libraries)를 지원합니다:
1. 기본 패키지
2. Spark 풀 수준
3. 세션 수준

<br/>

[Apache Spark 풀의 라이브러리 관리 가이드](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)를 따라 다음 필수 의존성을 Spark 애플리케이션에 추가합니다.
- `clickhouse-spark-runtime-{spark_version}_{scala_version}-{connector_version}.jar` - [공식 maven](https://mvnrepository.com/artifact/com.clickhouse.spark)
- `clickhouse-jdbc-{java_client_version}-all.jar` - [공식 maven](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)

필요한 버전을 이해하기 위해 [Spark 커넥터 호환성 매트릭스](/integrations/apache-spark/spark-native-connector#compatibility-matrix) 문서를 방문해주세요.

## ClickHouse를 카탈로그로 추가하기 {#add-clickhouse-as-catalog}

세션에 Spark 구성을 추가하는 다양한 방법이 있습니다:
* 세션과 함께 로드할 사용자 지정 구성 파일
* Azure Synapse UI를 통해 구성 추가
* Synapse 노트북에서 구성 추가

[Apache Spark 구성 관리](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)를 따라 [커넥터에 필요한 Spark 구성](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)을 추가합니다.

예를 들어, 다음 설정을 사용하여 노트북에서 Spark 세션을 구성할 수 있습니다:

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

첫 번째 셀에 다음과 같이 배치해야 합니다:

<Image img={sparkConfigViaNotebook} size="xl" alt="노트북을 통한 Spark 구성 설정" border/>

추가 설정을 위해 [ClickHouse Spark 구성 페이지](/integrations/apache-spark/spark-native-connector#configurations)를 방문해주세요.

:::info
ClickHouse Cloud와 작업할 때는 [필수 Spark 설정](/integrations/apache-spark/spark-native-connector#clickhouse-cloud-settings)을 설정해야 합니다.  
:::

## 설정 확인하기 {#setup-verification}

의존성과 구성이 성공적으로 설정되었는지 확인하려면 세션의 Spark UI를 방문하여 `환경` 탭으로 이동합니다.
거기에서 ClickHouse 관련 설정을 확인하십시오:

<Image img={sparkUICHSettings} size="xl" alt="Spark UI를 사용하여 ClickHouse 설정 확인" border/>

## 추가 리소스 {#additional-resources}

- [ClickHouse Spark 커넥터 문서](/integrations/apache-spark)
- [Azure Synapse Spark 풀 개요](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-overview)
- [Apache Spark 워크로드 성능 최적화](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-performance)
- [Synapse에서 Apache Spark 풀의 라이브러리 관리](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-manage-pool-packages)
- [Synapse에서 Apache Spark 구성 관리](https://learn.microsoft.com/en-us/azure/synapse-analytics/spark/apache-spark-azure-create-spark-configuration)
