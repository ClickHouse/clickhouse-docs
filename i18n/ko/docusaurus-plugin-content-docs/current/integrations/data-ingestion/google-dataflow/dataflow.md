---
sidebar_label: 'Dataflow를 ClickHouse와 통합하기'
slug: /integrations/google-dataflow/dataflow
sidebar_position: 1
description: 'Google Dataflow를 사용해 ClickHouse로 데이터를 수집할 수 있습니다'
title: 'Google Dataflow를 ClickHouse와 통합하기'
doc_type: 'guide'
keywords: ['Google Dataflow ClickHouse 통합', 'Dataflow ClickHouse 통합', 'Apache Beam ClickHouse', 'ClickHouseIO 커넥터', 'Google Cloud ClickHouse 통합']
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# ClickHouse와 Google Dataflow 통합 \{#integrating-google-dataflow-with-clickhouse\}

<ClickHouseSupportedBadge/>

[Google Dataflow](https://cloud.google.com/dataflow)는 완전 관리형 스트리밍 및 배치 데이터 처리 서비스입니다. Java 또는 Python으로 작성된 파이프라인을 지원하며 Apache Beam SDK 위에 구축되어 있습니다.

Google Dataflow를 ClickHouse와 함께 사용하는 주요 방법은 두 가지이며, 이들 모두 [`ClickHouseIO Apache Beam connector`](/integrations/apache-beam)를 활용합니다.
방법은 다음과 같습니다.

- [Java runner](#1-java-runner)
- [사전 정의된 템플릿(Predefined templates)](#2-predefined-templates)

## Java runner \{#1-java-runner\}

[Java runner](./java-runner)를 사용하면 Apache Beam SDK `ClickHouseIO` 통합을 통해 사용자 정의 Dataflow 파이프라인을 구현할 수 있습니다. 이 방식은 파이프라인 로직에 대한 완전한 유연성과 제어권을 제공하여 ETL 프로세스를 특정 요구 사항에 맞게 구성할 수 있도록 해 줍니다.
다만, 이 옵션을 사용하려면 Java 프로그래밍 지식과 Apache Beam 프레임워크에 대한 이해가 필요합니다.

### 주요 기능 \{#key-features\}

- 높은 수준의 사용자 정의가 가능합니다.
- 복잡하거나 고급 사용 사례에 적합합니다.
- 코딩 및 Beam API에 대한 이해가 필요합니다.

## 미리 정의된 템플릿 \{#2-predefined-templates\}

ClickHouse는 BigQuery에서 ClickHouse로 데이터를 가져오는 것과 같이 특정 사용 사례를 위해 설계된 [미리 정의된 템플릿](./templates)을 제공합니다. 이러한 템플릿은 바로 사용할 수 있으며 통합 과정을 단순화하므로, 코드 없이(no-code) 사용하는 솔루션을 선호하는 경우 특히 적합합니다.

### 주요 기능 \{#key-features-1\}

- Beam 코드를 작성할 필요가 없습니다.
- 단순한 사용 사례에는 빠르고 쉽게 설정할 수 있습니다.
- 프로그래밍 경험이 거의 없는 경우에도 적합합니다.

두 접근 방식 모두 Google Cloud 및 ClickHouse 생태계와 완전히 호환되며, 기술 역량과 프로젝트 요구 사항에 따라 유연하게 선택할 수 있습니다.