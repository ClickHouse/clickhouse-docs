---
sidebar_label: 'Dataflow Java Runner'
slug: /integrations/google-dataflow/java-runner
sidebar_position: 2
description: 'Google Dataflow Java Runner를 사용해 ClickHouse로 데이터를 수집할 수 있습니다'
title: 'Dataflow Java Runner'
doc_type: 'guide'
keywords: ['Dataflow Java Runner', 'Google Dataflow ClickHouse', 'Apache Beam Java ClickHouse', 'ClickHouseIO 커넥터']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Dataflow Java runner \{#dataflow-java-runner\}

<ClickHouseSupportedBadge/>

Dataflow Java Runner를 사용하면 사용자 정의 Apache Beam 파이프라인을 Google Cloud의 Dataflow 서비스에서 실행할 수 있습니다. 이 방식은 최고 수준의 유연성을 제공하며, 고급 ETL 워크플로에 적합합니다.

## 작동 방식 \{#how-it-works\}

1. **파이프라인 구현**
   Java Runner를 사용하려면 공식 Apache Beam 커넥터인 `ClickHouseIO`를 사용하여 Beam 파이프라인을 구현해야 합니다. 코드 예제와 `ClickHouseIO` 사용 방법은 [ClickHouse Apache Beam](/integrations/apache-beam)을 참조하십시오.

2. **배포**
   파이프라인을 구현하고 구성한 후에는 Google Cloud의 배포 도구를 사용하여 Dataflow에 배포할 수 있습니다. 보다 자세한 배포 방법은 [Google Cloud Dataflow documentation - 「Java Pipeline」](https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java)에 나와 있습니다.

**참고**: 이 방식은 Beam 프레임워크에 대한 이해와 코드를 작성할 수 있는 전문성을 전제로 합니다. 노코드(no-code) 솔루션을 선호하는 경우 [ClickHouse의 사전 정의된 템플릿](./templates) 사용을 고려하십시오.