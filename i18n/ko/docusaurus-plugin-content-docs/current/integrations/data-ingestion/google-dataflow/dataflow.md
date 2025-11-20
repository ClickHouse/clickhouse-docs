---
'sidebar_label': 'Dataflow와 ClickHouse 통합하기'
'slug': '/integrations/google-dataflow/dataflow'
'sidebar_position': 1
'description': '사용자는 Google Dataflow를 이용하여 ClickHouse에 데이터를 수집할 수 있습니다.'
'title': 'Google Dataflow와 ClickHouse 통합하기'
'doc_type': 'guide'
'keywords':
- 'Google Dataflow ClickHouse'
- 'Dataflow ClickHouse integration'
- 'Apache Beam ClickHouse'
- 'ClickHouseIO connector'
- 'Google Cloud ClickHouse integration'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Google Dataflow와 ClickHouse 통합하기

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow)는 완전 관리형 스트림 및 배치 데이터 처리 서비스입니다. Java 또는 Python으로 작성된 파이프라인을 지원하며, Apache Beam SDK를 기반으로 합니다.

Google Dataflow를 ClickHouse와 함께 사용하는 두 가지 주요 방법이 있으며, 이 두 가지 모두 [`ClickHouseIO Apache Beam 커넥터`](/integrations/apache-beam)를 활용합니다. 이들은 다음과 같습니다:
- [Java 실행기](#1-java-runner)
- [미리 정의된 템플릿](#2-predefined-templates)

## Java 실행기 {#1-java-runner}
[Java 실행기](./java-runner)는 사용자가 Apache Beam SDK `ClickHouseIO` 통합을 사용하여 커스텀 Dataflow 파이프라인을 구현할 수 있게 합니다. 이 접근 방식은 파이프라인 논리에 대한 완전한 유연성과 제어권을 제공하여 사용자가 특정 요구 사항에 맞게 ETL 프로세스를 조정할 수 있도록 합니다. 그러나 이 옵션은 Java 프로그래밍에 대한 지식과 Apache Beam 프레임워크에 대한 이해가 필요합니다.

### 주요 기능 {#key-features}
- 높은 수준의 사용자 지정 가능성.
- 복잡하거나 고급 사용 사례에 적합.
- Beam API에 대한 코딩 및 이해 필요.

## 미리 정의된 템플릿 {#2-predefined-templates}
ClickHouse는 특정 사용 사례에 맞게 설계된 [미리 정의된 템플릿](./templates)을 제공합니다. 예를 들어 데이터베이스에서 ClickHouse로 데이터를 가져오는 경우에 사용할 수 있습니다. 이러한 템플릿은 즉시 사용할 수 있으며 통합 프로세스를 간소화하여, 코드 작성 없이 해결책을 선호하는 사용자에게 훌륭한 선택이 됩니다.

### 주요 기능 {#key-features-1}
- Beam 코딩 필요 없음.
- 간단한 사용 사례에 대한 빠르고 쉬운 설정.
- 최소한의 프로그래밍 전문 지식을 가진 사용자에게도 적합합니다.

두 접근 방식 모두 Google Cloud 및 ClickHouse 생태계와 완벽하게 호환되며, 기술 전문성과 프로젝트 요구 사항에 따라 유연성을 제공합니다.
