---
sidebar_label: 'GCP Pub/Sub용 ClickPipes'
description: 'Google Cloud Pub/Sub 토픽을 ClickHouse Cloud에 원활하게 연결합니다.'
slug: /integrations/clickpipes/pubsub
title: 'Google Pub/Sub을 ClickHouse Cloud와 통합하기'
doc_type: 'guide'
keywords: ['clickpipes', 'pubsub', 'gcp pub/sub', 'google cloud pub/sub', 'streaming', 'gcp', '데이터 수집', '압축', 'gzip', 'zstd', 'lz4', 'snappy']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1_pubsub from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1_pubsub.png';
import cp_step2_pubsub from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_pubsub.png';
import cp_step3_pubsub from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_pubsub.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';

# Google Pub/Sub를 ClickHouse Cloud에 통합하기 \{#integrating-google-pubsub-with-clickhouse-cloud\}

:::note 공개 베타
GCP Pub/Sub용 ClickPipes는 공개 베타 상태입니다.
:::

Pub/Sub용 ClickPipes는 ClickPipes UI를 사용해 수동으로 배포 및 관리할 수 있으며, [OpenAPI](/integrations/clickpipes/programmatic-access/openapi)와 [Terraform](/integrations/clickpipes/programmatic-access/terraform)을 사용해 프로그래밍 방식으로도 배포 및 관리할 수 있습니다.

## 사전 요구 사항 \{#prerequisite\}

[ClickPipes 소개](../index.md)를 숙지하고, 수집하려는 토픽이 포함된 GCP 프로젝트에 대한 액세스 권한이 있으며, 적절한 Pub/Sub 권한이 있는 서비스 계정을 생성해 두어야 합니다. ClickPipes에 필요한 정확한 권한 집합은 [Pub/Sub IAM 권한 가이드](./02_auth.md)에서 확인하십시오.

## 첫 번째 ClickPipe 만들기 \{#creating-your-first-clickpipe\}

1. ClickHouse Cloud 서비스의 SQL 콘솔에 접속합니다.

<Image img={cp_service} alt="ClickPipes 서비스" size="lg" border />

2. 왼쪽 메뉴에서 `Data Sources` 버튼을 선택한 다음 &quot;Set up a ClickPipe&quot;를 클릭합니다.

<Image img={cp_step0} alt="가져오기 선택" size="lg" border />

3. data source로 **GCP Pub/Sub**를 선택합니다.

<Image img={cp_step1_pubsub} alt="data source로 GCP Pub/Sub 선택" size="lg" border />

4. ClickPipe 이름, **GCP Project ID**, 그리고 Pub/Sub 액세스 권한이 부여된 서비스 계정의 **service account JSON file**을 입력하여 양식을 작성합니다. Project ID는 6~30자여야 하며, 소문자, 숫자, 하이픈을 포함할 수 있고, 문자로 시작해야 하며, 하이픈으로 끝날 수 없습니다.

<Image img={cp_step2_pubsub} alt="연결 세부 정보 입력" size="lg" border />

5. 데이터를 수집할 **Pub/Sub 토픽**을 선택합니다. 자격 증명이 검증되면 드롭다운 목록이 GCP 프로젝트의 토픽으로 자동으로 채워지며, 알파벳순으로 정렬되어 표시됩니다.

   * **데이터 포맷.** 토픽을 선택하면 ClickPipes가 Pub/Sub 스키마 레지스트리를 조회합니다. 토픽에 네이티브 Avro 또는 Protobuf 스키마가 연결되어 있으면 데이터 포맷과 스키마가 자동으로 감지되며, 선택기는 해당 토픽의 최신 스키마로 고정됩니다. 네이티브 스키마가 없는 토픽는 기본적으로 JSONEachRow를 사용합니다.
   * **시작 오프셋.** 소비를 시작할 위치를 선택합니다. 사용할 수 있는 옵션은 **Latest**(새 메시지만), **Earliest**(가장 오래된 보존 메시지), **Seek to Timestamp**(UTC datetime 선택기 포함)입니다.
   * **필터 표현식(선택 사항).** 메시지 속성에 적용되는 Pub/Sub [subscription filter](https://cloud.google.com/pubsub/docs/subscription-message-filter)입니다. 예: `attributes.type = "telemetry"`. 필터는 payload가 아니라 메시지 속성에만 적용되며, pipe를 만든 후에는 변경할 수 없습니다(필터를 변경하려면 pipe를 다시 생성해야 합니다).
   * UI에는 선택한 토픽의 sample 메시지가 표시되며, **Flatten object** 토글을 사용해 중첩된 JSON이 대상 측에서 어떻게 평탄화되는지 미리 확인할 수 있습니다.

<Image img={cp_step3_pubsub} alt="Pub/Sub 토픽, 포맷 및 시작 오프셋 설정" size="lg" border />

6. 다음 단계에서는 데이터를 새 ClickHouse table로 수집할지, 기존 table을 재사용할지 선택할 수 있습니다. 화면의 안내에 따라 table 이름, 스키마, 설정을 수정하십시오. 상단의 sample table에서 변경 사항을 실시간으로 미리 볼 수 있습니다.

<Image img={cp_step4a} alt="table, 스키마 및 설정" size="lg" border />

제공된 컨트롤을 사용하여 고급 설정도 사용자 지정할 수 있습니다.

<Image img={cp_step4a3} alt="고급 컨트롤 설정" size="lg" border />

7. 또는 기존 ClickHouse table로 데이터를 수집하도록 선택할 수도 있습니다. 이 경우 UI에서 source의 필드를 선택한 대상 table의 ClickHouse 필드에 매핑할 수 있습니다.

<Image img={cp_step4b} alt="기존 table 사용" size="lg" border />

8. 마지막으로 내부 ClickPipes 사용자의 권한을 구성할 수 있습니다.

**권한:** ClickPipes는 대상 table에 데이터를 쓰기 위한 전용 사용자를 생성합니다. 사용자 지정 role 또는 미리 정의된 role 중 하나를 사용하여 이 내부 사용자의 role을 선택할 수 있습니다.

* `Full access`: cluster에 대한 전체 액세스 권한입니다. 대상 table과 함께 materialized view 또는 딕셔너리를 사용하는 경우 유용할 수 있습니다.
  * `Only destination table`: 대상 table에만 `INSERT` 권한을 부여합니다.

<Image img={cp_step5} alt="권한" border />

9. &quot;Complete Setup&quot;을 클릭하면 시스템이 ClickPipe를 등록하고, 요약 table에 표시되는 것을 확인할 수 있습니다.

<Image img={cp_success} alt="성공 알림" size="sm" border />

<Image img={cp_remove} alt="제거 알림" size="lg" border />

요약 table에서는 source 또는 ClickHouse의 대상 table에서 sample 데이터를 표시하는 컨트롤을 제공합니다.

<Image img={cp_destination} alt="대상 보기" size="lg" border />

또한 ClickPipe를 제거하고 수집 작업의 요약을 표시하는 컨트롤도 제공합니다.

<Image img={cp_overview} alt="개요 보기" size="lg" border />

10. **축하합니다!** 첫 번째 Pub/Sub ClickPipe 설정을 성공적으로 완료했습니다. 이제 이 ClickPipe는 계속 실행되며, Pub/Sub 토픽의 데이터를 ClickHouse Cloud 서비스로 실시간 수집합니다.

## 관리형 subscription \{#managed-subscriptions\}

Pub/Sub 메시지는 토픽에서 직접 소비되지 않고 subscription을 통해 소비됩니다. ClickPipes는 각 파이프에 대해 전용 subscription을 생성하고 관리하므로, 실제로는 토픽만 선택하면 됩니다.

* 관리형 subscription의 이름은 `clickpipes-{pipeID}`이며, 파이프가 시작될 때 해당 토픽에 생성됩니다.
* 60초 ack deadline, 7일 메시지 보관, 메시지 순서 지정 활성화로 구성됩니다.
* subscription 생성은 멱등적이므로, 파이프를 재시작하거나 레플리카가 다시 스케줄링될 때 구성된 토픽을 가리키는 기존 subscription이 있으면 이를 재사용합니다.
* 토픽 검색 및 메시지 샘플링 중에 ClickPipes는 수명이 짧은 임시 subscription(`clickpipes-discovery-{uuid}`)도 생성하며, 샘플링이 완료되면 즉시 삭제합니다.
* 파이프가 삭제되면 ClickPipes는 정리 과정의 일부로 관리형 subscription도 삭제합니다.

따라서 제공한 서비스 계정에는 subscription을 소비하는 권한뿐 아니라, 프로젝트에서 subscription을 생성하고 삭제할 권한도 있어야 합니다. 전체 목록은 [Pub/Sub IAM permissions guide](./02_auth.md)를 참조하십시오.

## 지원되는 데이터 포맷 \{#supported-data-formats\}

지원되는 포맷은 다음과 같습니다:

* [JSON](/interfaces/formats/JSON)
* [Avro](/interfaces/formats/Avro) — Pub/Sub 네이티브 스키마(BINARY 인코딩) 사용
* [Protobuf](/interfaces/formats/Protobuf) — Pub/Sub 네이티브 스키마(BINARY 인코딩) 사용

Avro와 Protobuf의 경우, 스키마(schema)는 해당 토픽의 Pub/Sub 스키마 레지스트리에서 확인됩니다. 파이프는 항상 토픽 스키마의 최신 리비전을 사용하며, UI의 스키마 선택기는 설계상 읽기 전용입니다.

## 압축 \{#compression\}

Pub/Sub용 ClickPipes는 압축된 메시지를 자동으로 감지해 압축을 해제합니다. Pub/Sub 클라이언트는 원시 바이트를 전달하며, 별도의 설정 없이 ClickPipes가 압축 해제를 처리합니다.

지원되는 압축 코덱은 다음과 같습니다.

* **gzip**
* **zstd**
* **lz4**
* **snappy** (프레임 포맷)

압축은 각 메시지의 매직 바이트를 통해 자동으로 감지됩니다. 알려진 압축 시그니처가 발견되지 않으면 해당 메시지는 비압축 상태로 처리됩니다. 감지된 압축 유형은 스키마 추론 과정에서도 표시되므로, UI의 샘플 데이터 미리보기에서 압축 해제된 페이로드가 올바르게 표시됩니다.

:::note
자동 감지는 JSON과 같은 텍스트 기반 포맷에서 안전합니다. 출력 가능한 ASCII 문자는 압축 매직 바이트와 절대 충돌하지 않기 때문입니다. 압축 해제된 페이로드는 최대 64MB로 제한됩니다.
:::

## 지원되는 데이터 타입 \{#supported-data-types\}

### 표준 타입 지원 \{#standard-types-support\}

현재 ClickPipes에서는 다음 ClickHouse 데이터 타입을 지원합니다:

* 기본 숫자 타입 - [U]Int8/16/32/64, Float32/64 및 BFloat16
* 대형 정수 타입 - [U]Int128/256
* Decimal 타입
* Boolean
* String
* FixedString
* Date, Date32
* DateTime, DateTime64 (UTC 시간대만)
* Enum8/Enum16
* UUID
* IPv4
* IPv6
* 모든 ClickHouse LowCardinality 타입
* 키와 값에 위 타입 중 어느 것이든 사용할 수 있는 맵(널 허용 포함)
* 요소에 위 타입 중 어느 것이든 사용할 수 있는 Tuple 및 배열(널 허용 포함, 중첩 1단계만)
* SimpleAggregateFunction 타입(AggregatingMergeTree 또는 SummingMergeTree 대상용)

### Variant 유형 지원 \{#variant-type-support\}

소스 데이터 스트림의 모든 JSON 필드에 대해 Variant 유형(예: `Variant(String, Int64, DateTime)`)을 수동으로 지정할 수
있습니다. ClickPipes가 사용할 올바른 Variant 하위 유형을 결정하는 방식상, Variant 정의에는 정수 또는 DateTime
유형을 하나만 사용할 수 있습니다. 예를 들어 `Variant(Int64, UInt32)`는 지원되지 않습니다.

### JSON 타입 지원 \{#json-type-support\}

항상 JSON 객체인 JSON 필드는 JSON 대상 컬럼에 할당할 수 있습니다. 고정 경로와 건너뛸 경로를 포함해, 대상 컬럼을 원하는 JSON 타입으로 수동 변경해야 합니다.

## Pub/Sub 가상 컬럼 \{#pubsub-virtual-columns\}

다음 가상 컬럼은 Pub/Sub 토픽에서 지원됩니다. 새 대상 테이블을 만들 때 `Add Column` 버튼을 사용해 가상 컬럼을 추가할 수 있습니다.

| Name                  | Description                            | Recommended Data Type |
| --------------------- | -------------------------------------- | --------------------- |
| &#95;message&#95;id   | 브로커가 할당한 Pub/Sub 메시지 ID                | String                |
| &#95;publish&#95;time | Pub/Sub 게시 타임스탬프(밀리초 정밀도, UTC)         | DateTime64(3)         |
| &#95;ordering&#95;key | Pub/Sub 순서 지정 키(메시지에 키가 설정되지 않은 경우 빈 문자열) | String                |
| &#95;attributes       | 사용자 정의 Pub/Sub 메시지 속성                  | Map(String, String)   |
| &#95;raw&#95;message  | 전체 Pub/Sub 메시지 페이로드(기본적으로 비활성화됨)       | String                |

`_raw_message` 필드는 전체 Pub/Sub 메시지 페이로드만 필요한 경우에 사용할 수 있습니다(예: ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 함수를 사용해 다운스트림 materialized view를 채우는 경우). 이러한 파이프의 경우 모든 &quot;가상&quot;이 아닌 컬럼을 삭제하면 ClickPipes 성능이 향상될 수 있습니다.

## 제한 사항 \{#limitations\}

* [DEFAULT](/sql-reference/statements/create/table#default)는 지원되지 않습니다.
* 개별 메시지는 가장 작은 (XS) 레플리카 크기로 실행할 때 기본적으로 8MB(비압축 기준)까지, 더 큰 레플리카에서는 16MB(비압축 기준)까지 지원됩니다. 이 제한을 초과하는 메시지는 오류와 함께 거부됩니다. 더 큰 메시지 크기가 필요하면 지원팀에 문의하십시오.
* Pub/Sub subscription 필터는 변경할 수 없습니다 — 필터 표현식을 변경하려면 파이프를 다시 생성해야 합니다.
* 필터는 메시지 페이로드가 아니라 메시지 속성에만 적용됩니다.

## 성능 \{#performance\}

### 배칭 \{#batching\}

ClickPipes는 데이터를 배치 단위로 ClickHouse에 삽입합니다. 이는 데이터베이스에 너무 많은 파트가 생성되는 것을 방지하기 위한 것으로, 그렇지 않으면 클러스터 성능 문제로 이어질 수 있습니다.

다음 기준 중 하나를 충족하면 배치가 삽입됩니다.

* 배치 크기가 최대 크기에 도달한 경우(100,000행 또는 레플리카 메모리 1GB당 32MB)
* 배치가 최대 허용 시간(5초) 동안 열려 있었던 경우

### 지연 시간 \{#latency\}

지연 시간(Pub/Sub 메시지가 게시된 시점부터 해당 메시지를 ClickHouse에서 사용할 수 있게 될 때까지의 시간으로 정의됨)은 여러 요인(게시자 지연 시간, 네트워크 지연 시간, 메시지 크기/포맷)에 따라 달라집니다. 또한 위 섹션에서 설명한 [배칭](#batching)도 지연 시간에 영향을 줍니다. 예상되는 지연 시간을 파악하려면, 해당 사용 사례에서 직접 테스트해 볼 것을 항상 권장합니다.

낮은 지연 시간에 대한 구체적인 요구 사항이 있다면 [문의해 주십시오](https://clickhouse.com/company/contact?loc=clickpipes).

### 순서 지정 키 \{#ordering-keys\}

Pub/Sub는 동일한 [순서 지정 키](https://cloud.google.com/pubsub/docs/ordering)를 공유하는 메시지가 게시된 순서대로 단일 구독자에게 전달되도록 보장합니다. ClickPipes는 관리형 subscription에서 기본적으로 순서 지정을 활성화합니다. 즉, 메시지에 순서 지정 키가 있으면 구독자가 해당 메시지를 순서대로 수신하고, 순서 지정 키가 없으면 동작은 그대로 유지됩니다.

프로듀서가 모든 메시지를 적은 수의 순서 지정 키(또는 단일 키)로 게시하면, Pub/Sub는 해당 메시지를 소수의 구독자에게 집중시킵니다. 이로 인해 수평 처리량이 제한될 수 있습니다. 순서 보장이 필요하지 않다면 순서 지정 키를 생략하고, 필요하다면 카디널리티가 높은 순서 지정 키를 사용하는 것이 좋습니다.

### 스케일링 \{#scaling\}

Pub/Sub용 ClickPipes는 수평 및 수직으로 모두 확장할 수 있도록 설계되었습니다. 각 파이프는 단일 관리형 Pub/Sub subscription을 사용하며, 이는 구성할 수 없습니다. 기본적으로는 하나의 컨슈머가 해당 subscription에서 메시지를 가져옵니다. 컨슈머 수는 ClickPipe 생성 시 늘릴 수 있으며, 이후에도 **설정** -&gt; **고급 설정** -&gt; **스케일링**에서 언제든지 늘릴 수 있습니다. ClickPipes는 subscription의 메시지를 실행 중인 컨슈머들에 자동으로 분산하므로, 별도의 조정은 필요하지 않습니다.

ClickPipes는 가용성 영역에 분산된 아키텍처를 통해 고가용성을 제공하며, 이를 위해서는 최소 2개의 컨슈머로 스케일링해야 합니다.

실행 중인 컨슈머 수와 관계없이 장애 허용은 기본적으로 제공됩니다. 컨슈머 또는 해당 기반 인프라에 장애가 발생하면 ClickPipes가 컨슈머를 자동으로 다시 시작하고 메시지 처리를 계속합니다.

### 전달 의미 체계 \{#delivery-semantics\}

Pub/Sub용 ClickPipes는 **최소 한 번** 전달을 제공합니다. Pub/Sub 메시지는 해당 행이 ClickHouse에 삽입된 후에만(또는 비정상 레코드의 경우 오류 테이블에 기록된 후에만) 승인(ack)됩니다. 무한 재전달을 방지하기 위해, 오류 테이블로 라우팅된 잘못된 레코드를 포함한 모든 메시지는 처리되면 승인됩니다. 레플리카가 삽입 후 Pub/Sub에 승인이 도달하기 전에 중단되면, ack 기한이 지난 뒤 메시지가 다시 전달되고 다시 삽입되므로 다운스트림 소비자는 중복을 허용할 수 있어야 합니다. 정확히 한 번 처리 의미 체계가 필요하다면 `_message_id` 가상 컬럼을 사용해 다운스트림에서 중복 제거를 수행하십시오(Pub/Sub 메시지 ID는 각 토픽 내에서 고유합니다).

## 인증 \{#authentication\}

Pub/Sub용 ClickPipes는 서비스 계정 JSON 키를 사용해 GCP에 인증합니다. 파이프를 생성할 때 키 파일을 업로드하면 ClickPipes가 이를 저장 중에 암호화하여 보관하고, 런타임에는 메시지를 수신하고 관리형 subscription의 수명 주기를 관리하는 데 사용합니다.

필요한 IAM 권한의 정확한 목록과 권장되는 사용자 지정 역할 정의는 [Pub/Sub IAM permissions guide](./02_auth.md)를 참조하십시오.