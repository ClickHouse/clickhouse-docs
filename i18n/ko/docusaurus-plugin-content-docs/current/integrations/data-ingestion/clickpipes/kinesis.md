---
'sidebar_label': 'Amazon Kinesis를 위한 ClickPipes'
'description': '당신의 Amazon Kinesis 데이터 소스를 ClickHouse Cloud에 원활하게 연결하십시오.'
'slug': '/integrations/clickpipes/kinesis'
'title': 'Amazon Kinesis와 ClickHouse Cloud 통합하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'clickpipes'
'keywords':
- 'clickpipes'
- 'kinesis'
- 'streaming'
- 'aws'
- 'data ingestion'
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_kinesis.png';
import cp_step3_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_kinesis.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';


# Amazon Kinesis와 ClickHouse Cloud 통합
## 사전 요구 사항 {#prerequisite}
[ClickPipes 소개](./index.md)를 숙지하고 [IAM 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 또는 [IAM 역할](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)을 설정했습니다. ClickHouse Cloud와 작동하는 역할을 설정하는 방법에 대한 정보는 [Kinesis 역할 기반 액세스 가이드](./secure-kinesis.md)를 참조하십시오.

## 첫 번째 ClickPipe 생성 {#creating-your-first-clickpipe}

1. ClickHouse Cloud 서비스의 SQL 콘솔에 접근합니다.

<Image img={cp_service} alt="ClickPipes 서비스" size="lg" border/>

2. 왼쪽 메뉴에서 `Data Sources` 버튼을 선택하고 "ClickPipe 설정"을 클릭합니다.

<Image img={cp_step0} alt="가져오기 선택" size="lg" border/>

3. 데이터 소스를 선택합니다.

<Image img={cp_step1} alt="데이터 소스 유형 선택" size="lg" border/>

4. ClickPipe에 이름, 설명(선택 사항), IAM 역할 또는 자격 증명, 기타 연결 세부 정보를 제공하여 양식을 작성합니다.

<Image img={cp_step2_kinesis} alt="연결 세부 사항 입력" size="lg" border/>

5. Kinesis 스트림 및 시작 오프셋을 선택합니다. UI는 선택한 소스(예: Kafka 주제)의 샘플 문서를 표시합니다. ClickPipe의 성능과 안정성을 향상시키기 위해 Kinesis 스트림에 대해 Enhanced Fan-out을 활성화할 수도 있습니다(Enhanced Fan-out에 대한 자세한 정보는 [여기](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)에서 확인할 수 있습니다).

<Image img={cp_step3_kinesis} alt="데이터 형식 및 주제 설정" size="lg" border/>

6. 다음 단계에서 새 ClickHouse 테이블에 데이터를 수집할 것인지 기존 테이블을 재사용할 것인지 선택할 수 있습니다. 화면의 지침에 따라 테이블 이름, 스키마 및 설정을 수정할 수 있습니다. 상단의 샘플 테이블에서 변경 내용을 실시간으로 미리 볼 수 있습니다.

<Image img={cp_step4a} alt="테이블, 스키마 및 설정 설정" size="lg" border/>

  제공된 컨트롤을 사용하여 고급 설정을 사용자 정의할 수도 있습니다.

<Image img={cp_step4a3} alt="고급 설정 열기" size="lg" border/>

7. 또는 기존 ClickHouse 테이블에 데이터를 수집하기로 결정할 수 있습니다. 이 경우 UI는 원본에서 선택한 대상 테이블의 ClickHouse 필드와 필드를 매핑할 수 있도록 허용합니다.

<Image img={cp_step4b} alt="기존 테이블 사용" size="lg" border/>

8. 마지막으로 내부 ClickPipes 사용자에 대한 권한을 구성할 수 있습니다.

  **권한:** ClickPipes는 대상 테이블에 데이터를 기록하기 위해 전용 사용자를 생성합니다. 이 내부 사용자에 대한 역할로 사용자 정의 역할 또는 미리 정의된 역할 중 하나를 선택할 수 있습니다:
    - `전체 액세스`: 클러스터에 대한 전체 액세스 권한이 있습니다. 이는 물리화된 뷰 또는 대상 테이블과 함께 딕셔너리를 사용할 때 유용할 수 있습니다.
    - `대상 테이블만`: 대상 테이블에 대한 `INSERT` 권한만 있습니다.

<Image img={cp_step5} alt="권한" border/>

9. "설정 완료"를 클릭하면 시스템이 ClickPipe를 등록하며, 요약 테이블에 나열된 것을 볼 수 있습니다.

<Image img={cp_success} alt="성공 알림" size="sm" border/>

<Image img={cp_remove} alt="제거 알림" size="lg" border/>

  요약 테이블은 ClickHouse의 소스 또는 대상 테이블에서 샘플 데이터를 표시하기 위한 컨트롤을 제공합니다.

<Image img={cp_destination} alt="대상 보기" size="lg" border/>

  또한 ClickPipe를 제거하고 데이터 수집 작업의 요약을 표시하기 위한 컨트롤도 제공합니다.

<Image img={cp_overview} alt="개요 보기" size="lg" border/>

10. **축하합니다!** 첫 번째 ClickPipe를 성공적으로 설정했습니다. 이것이 스트리밍 ClickPipe이면, 원격 데이터 소스에서 실시간으로 데이터를 수집하면서 지속적으로 실행될 것입니다. 그렇지 않은 경우 일괄 처리를 수행하고 작업을 완료합니다.

## 지원되는 데이터 형식 {#supported-data-formats}

지원되는 형식은 다음과 같습니다:
- [JSON](/interfaces/formats/JSON)

## 지원되는 데이터 유형 {#supported-data-types}

### 표준 유형 지원 {#standard-types-support}
현재 ClickPipes에서 지원되는 ClickHouse 데이터 유형은 다음과 같습니다:

- 기본 숫자 유형 - \[U\]Int8/16/32/64, Float32/64, 및 BFloat16
- 대형 정수 유형 - \[U\]Int128/256
- 소수형
- 부울형
- 문자열
- 고정 문자열
- 날짜, Date32
- 날짜 및 시간, DateTime64 (UTC 시간대만 해당)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 모든 ClickHouse LowCardinality 유형
- 위에 명시된 유형(Nullable 포함)의 키와 값을 사용한 맵
- 위의 유형(Nullable 포함)을 사용하는 요소의 튜플 및 배열(단일 수준 깊이만 해당)
- SimpleAggregateFunction 유형 (AggregatingMergeTree 또는 SummingMergeTree 대상에 대해)

### Variant 유형 지원 {#variant-type-support}
소스 데이터 스트림의 모든 JSON 필드에 대해 Variant 유형(예: `Variant(String, Int64, DateTime)`)을 수동으로 지정할 수 있습니다. ClickPipes가 올바른 Variant 하위 유형을 결정하는 방식 때문에 Variant 정의에는 하나의 정수 또는 날짜/시간 유형만 사용할 수 있습니다. 예를 들어, `Variant(Int64, UInt32)`는 지원되지 않습니다.

### JSON 유형 지원 {#json-type-support}
항상 JSON 객체인 JSON 필드는 JSON 대상 컬럼에 할당될 수 있습니다. 고정 또는 건너 뛴 경로를 포함하여 원하는 JSON 유형으로 대상 컬럼을 수동으로 변경해야 합니다.

## Kinesis 가상 컬럼 {#kinesis-virtual-columns}

Kinesis 스트림에 대해 지원되는 가상 컬럼은 다음과 같습니다. 새 대상 테이블을 생성할 때 `Add Column` 버튼을 사용하여 가상 컬럼을 추가할 수 있습니다.

| 이름              | 설명                                                         | 권장 데이터 유형     |
|------------------|--------------------------------------------------------------|-----------------------|
| _key             | Kinesis 파티션 키                                          | 문자열                |
| _timestamp       | Kinesis 대략적 도착 타임스탬프(밀리초 정밀도)                | DateTime64(3)         |
| _stream          | Kinesis 스트림 이름                                          | 문자열                |
| _sequence_number | Kinesis 시퀀스 번호                                        | 문자열                |
| _raw_message     | 전체 Kinesis 메시지                                         | 문자열                |

_raw_message 필드는 ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 함수를 사용하여 다운스트림 물리화된 뷰를 채우는 등 전체 Kinesis JSON 레코드가 필요한 경우에 사용할 수 있습니다. 이러한 파이프의 경우 불필요한 "비가상" 컬럼을 삭제하면 ClickPipes의 성능이 향상될 수 있습니다.

## 제한 사항 {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default)는 지원되지 않습니다.

## 성능 {#performance}

### 배치 {#batching}
ClickPipes는 ClickHouse에 데이터를 배치 방식으로 삽입합니다. 이는 데이터베이스 내에서 너무 많은 파트가 생성되면 클러스터 내 성능 문제가 발생할 수 있기 때문입니다.

다음 조건 중 하나가 충족되면 배치가 삽입됩니다:
- 배치 크기가 최대 크기(100,000행 또는 1GB의 복제본 메모리당 32MB)에 도달했습니다.
- 배치가 최대 시간 동안(5초) 열린 상태입니다.

### 지연 시간 {#latency}

지연 시간(Kinesis 메시지가 스트림에 전송되고 ClickHouse에서 메시지가 사용 가능해지는 시간 간격으로 정의됨)은 여러 요인(즉, Kinesis 지연 시간, 네트워크 지연 시간, 메시지 크기/형식)에 따라 달라집니다. 위 섹션에서 설명한 [배치](#batching)는 지연 시간에도 영향을 미칩니다. 특정 사용 사례를 테스트하여 예상할 수 있는 지연 시간을 이해하는 것이 항상 권장됩니다.

특정 낮은 지연 시간 요구 사항이 있는 경우, [문의하십시오](https://clickhouse.com/company/contact?loc=clickpipes).

### 확장성 {#scaling}

Kinesis를 위한 ClickPipes는 수평 및 수직으로 확장하도록 설계되었습니다. 기본적으로 하나의 소비자로 구성된 소비자 그룹을 만듭니다. 이는 ClickPipe 생성 중 또는 **설정** -> **고급 설정** -> **확장성** 아래의 다른 시점에서 구성할 수 있습니다.

ClickPipes는 가용성 영역 분산 아키텍처를 통해 높은 가용성을 제공합니다. 이를 위해서는 최소 두 개의 소비자로 확장해야 합니다.

실행 중인 소비자 수에 관계없이 내결함성이 본래 설계에 포함되어 있습니다. 소비자 또는 해당 기반 인프라가 실패하면 ClickPipe는 자동으로 소비자를 다시 시작하고 메시지 처리를 계속합니다.

## 인증 {#authentication}

Amazon Kinesis 스트림에 접근하려면 [IAM 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 또는 [IAM 역할](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)을 사용할 수 있습니다. IAM 역할 설정 방법에 대한 자세한 내용은 ClickHouse Cloud에서 작동하는 역할을 설정하는 방법에 대한 정보를 보려면 [이 가이드를 참조하십시오](./secure-kinesis.md).
