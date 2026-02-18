---
sidebar_label: 'Estuary'
slug: /integrations/estuary
description: 'Estuary 통합으로 다양한 소스를 ClickHouse로 스트리밍합니다'
title: 'Estuary를 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://estuary.dev'
keywords: ['estuary', '데이터 수집', 'etl', '파이프라인', '데이터 통합', 'clickpipes']
---

import PartnerBadge from '@theme/badges/PartnerBadge';


# Estuary를 ClickHouse에 연결하기 \{#connect-estuary-with-clickhouse\}

<PartnerBadge/>

[Estuary](https://estuary.dev/)는 실시간 데이터와 배치 데이터를 쉽게 설정할 수 있는 ETL 파이프라인으로 유연하게 결합하는 적시(right-time) 데이터 플랫폼입니다. 엔터프라이즈급 보안과 배포 옵션을 통해 Estuary는 SaaS, 데이터베이스, 스트리밍 소스에서 ClickHouse를 포함한 다양한 대상(destination)으로 안정적인 데이터 흐름을 제공합니다.

Estuary는 Kafka ClickPipe를 통해 ClickHouse와 연결합니다. 이 통합을 사용하면 별도의 Kafka 인프라를 직접 운영할 필요가 없습니다.

## 설정 가이드 \{#setup-guide\}

**사전 준비 사항**

* [Estuary 계정](https://dashboard.estuary.dev/register)
* 원하는 소스에서 데이터를 가져오는 하나 이상의 Estuary [**capture**](https://docs.estuary.dev/concepts/captures/)
* ClickPipe 권한이 있는 ClickHouse Cloud 계정

<VerticalStepper headerLevel="h3">

### Estuary 구체화된 뷰(Materialization) 생성 \{#1-create-an-estuary-materialization\}

Estuary의 소스 컬렉션 데이터를 ClickHouse로 이동하려면 먼저 **materialization**(구체화된 뷰)을 생성해야 합니다.

1. Estuary 대시보드에서 [Destinations](https://dashboard.estuary.dev/materializations) 페이지로 이동합니다.

2. **+ New Materialization**을 클릭합니다.

3. **ClickHouse** 커넥터를 선택합니다.

4. Materialization, Endpoint, Source Collections 섹션의 세부 정보를 입력합니다.

   * **Materialization Details:** materialization에 대해 고유한 이름을 지정하고 데이터 플레인(Cloud 제공자와 리전)을 선택합니다.
   * **Endpoint Config:** 안전한 **Auth Token**을 입력합니다.
   * **Source Collections:** 기존 **capture**를 연결하거나 ClickHouse에 노출할 데이터 컬렉션을 선택합니다.

5. **Next**를 클릭한 다음 **Save and Publish**를 클릭합니다.

6. materialization 상세 정보 페이지에서 ClickHouse materialization의 전체 이름을 확인합니다. `your-tenant/your-unique-name/dekaf-clickhouse`와 같은 형식입니다.

Estuary는 선택한 컬렉션을 Kafka 메시지로 스트리밍하기 시작합니다. ClickHouse는 Estuary의 브로커 정보와 제공한 auth token을 사용하여 Kafka ClickPipe를 통해 이 데이터에 액세스할 수 있습니다.

### Kafka 연결 정보 입력 \{#2-enter-kafka-connection-details\}

ClickHouse에서 새로운 Kafka ClickPipe를 설정하고 연결 정보를 입력합니다.

1. ClickHouse Cloud 대시보드에서 **Data sources**를 선택합니다.

2. 새로운 **ClickPipe**를 생성합니다.

3. 데이터 소스로 **Apache Kafka**를 선택합니다.

4. Estuary의 브로커 및 레지스트리 정보를 사용하여 Kafka 연결 정보를 입력합니다.

   * ClickPipe 이름을 지정합니다.
   * 브로커에는 `dekaf.estuary-data.com:9092`를 사용합니다.
   * 인증 방식은 기본값인 `SASL/PLAIN` 옵션으로 둡니다.
   * 사용자에는 Estuary의 전체 materialization 이름(예: `your-tenant/your-unique-name/dekaf-clickhouse`)을 입력합니다.
   * 비밀번호에는 해당 materialization에 대해 제공한 auth token을 입력합니다.

5. 스키마 레지스트리 옵션을 활성화합니다.

   * 스키마 URL에는 `https://dekaf.estuary-data.com`을 사용합니다.
   * 스키마 키는 브로커 사용자(해당 materialization 이름)와 동일합니다.
   * 시크릿은 브로커 비밀번호(해당 auth token)와 동일합니다.

### 수신 데이터 구성 \{#3-configure-incoming-data\}

1. Kafka **topic** 중 하나(Estuary에서 온 데이터 컬렉션 중 하나)를 선택합니다.

2. **offset**을 선택합니다.

3. ClickHouse가 topic 메시지를 감지합니다. 테이블 정보를 구성하기 위해 **Parse information** 섹션으로 계속 진행할 수 있습니다.

4. 새 테이블을 생성할지, 일치하는 기존 테이블에 데이터를 적재할지 선택합니다.

5. 소스 필드를 테이블 컬럼에 매핑하고, 컬럼 이름, 타입, 널 허용 여부를 확인합니다.

6. 마지막 **Details and settings** 섹션에서 전용 데이터베이스 사용자에 대한 권한을 선택할 수 있습니다.

구성이 완료되면 ClickPipe를 생성합니다.

ClickHouse는 새 데이터 소스를 프로비저닝하고 Estuary에서 메시지 소비를 시작합니다. 필요한 만큼 많은 ClickPipe를 생성하여 원하는 모든 데이터 컬렉션에서 스트리밍할 수 있습니다.

</VerticalStepper>

## 추가 리소스 \{#additional-resources\}

Estuary와의 통합 설정에 대한 자세한 내용은 Estuary 문서를 참조하십시오:

* Estuary의 [ClickHouse 구체화(materialization) 문서](https://docs.estuary.dev/reference/Connectors/materialization-connectors/Dekaf/clickhouse/)를 참고하십시오.

* Estuary는 **Dekaf**를 사용하여 데이터를 Kafka 메시지로 제공합니다. Dekaf에 대한 자세한 내용은 [여기](https://docs.estuary.dev/guides/dekaf_reading_collections_from_kafka/)를 참고하십시오.

* Estuary를 사용하여 ClickHouse로 스트리밍할 수 있는 소스 목록은 [Estuary의 캡처(capture) 커넥터](https://docs.estuary.dev/reference/Connectors/capture-connectors/)에서 확인하십시오.