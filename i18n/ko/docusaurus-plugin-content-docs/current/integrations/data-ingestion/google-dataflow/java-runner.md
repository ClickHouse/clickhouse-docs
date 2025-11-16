---
'sidebar_label': 'Java 실행기'
'slug': '/integrations/google-dataflow/java-runner'
'sidebar_position': 2
'description': '사용자는 Google Dataflow Java Runner를 사용하여 ClickHouse에 데이터를 수집할 수 있습니다.'
'title': '데이터 플로우 Java 실행기'
'doc_type': 'guide'
'keywords':
- 'Dataflow Java Runner'
- 'Google Dataflow ClickHouse'
- 'Apache Beam Java ClickHouse'
- 'ClickHouseIO connector'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java runner

<ClickHouseSupportedBadge/>

Dataflow Java Runner를 사용하면 Google Cloud의 Dataflow 서비스에서 사용자 정의 Apache Beam 파이프라인을 실행할 수 있습니다. 이 접근 방식은 최대한의 유연성을 제공하며 고급 ETL 워크플로우에 적합합니다.

## How it works {#how-it-works}

1. **Pipeline Implementation**
   Java Runner를 사용하려면 `ClickHouseIO`를 사용하여 Beam 파이프라인을 구현해야 합니다. `ClickHouseIO` 사용법에 대한 코드 예제와 지침은 [ClickHouse Apache Beam](/integrations/apache-beam) 를 방문하십시오.

2. **Deployment**
   파이프라인이 구현되고 구성되면 Google Cloud의 배포 도구를 사용하여 Dataflow에 배포할 수 있습니다. 포괄적인 배포 지침은 [Google Cloud Dataflow documentation - Java Pipeline](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java)에서 제공됩니다.

**Note**: 이 접근 방식은 Beam 프레임워크에 대한 이해와 코딩 전문 지식을 전제로 합니다. 코드 없는 솔루션을 선호하는 경우 [ClickHouse의 미리 정의된 템플릿](./templates) 사용을 고려하십시오.
