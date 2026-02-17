---
sidebar_label: 'Amazon Kinesis용 ClickPipes'
description: 'Amazon Kinesis 데이터 소스를 ClickHouse Cloud에 원활하게 연결할 수 있도록 합니다.'
slug: /integrations/clickpipes/kinesis
title: 'Amazon Kinesis와 ClickHouse Cloud 통합'
doc_type: '가이드'
keywords: ['clickpipes', 'kinesis', '스트리밍', 'aws', '데이터 수집']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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


# Amazon Kinesis를 ClickHouse Cloud와 연동하기 \{#integrating-amazon-kinesis-with-clickhouse-cloud\}

## 사전 준비 사항 \{#prerequisite\}

[ClickPipes 소개](../index.md)를 숙지하고 [IAM 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 또는 [IAM 역할(IAM Role)](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)을 설정해야 합니다. ClickHouse Cloud와 연동되는 역할을 설정하는 방법은 [Kinesis 역할 기반 액세스 가이드](./02_auth.md)를 참조하십시오.

## 첫 번째 ClickPipe 만들기 \{#creating-your-first-clickpipe\}

1. ClickHouse Cloud 서비스의 SQL Console에 접속합니다.

<Image img={cp_service} alt="ClickPipes 서비스" size="lg" border/>

2. 왼쪽 메뉴에서 `Data Sources` 버튼을 선택한 후 "Set up a ClickPipe"를 클릭합니다.

<Image img={cp_step0} alt="가져오기 선택" size="lg" border/>

3. 데이터 소스를 선택합니다.

<Image img={cp_step1} alt="데이터 소스 유형 선택" size="lg" border/>

4. ClickPipe의 이름, 설명(선택 사항), IAM 역할 또는 자격 증명 및 기타 연결 세부 정보를 입력하여 양식을 작성합니다.

<Image img={cp_step2_kinesis} alt="연결 세부 정보 입력" size="lg" border/>

5. Kinesis Stream과 시작 오프셋을 선택합니다. UI에 선택한 소스(Kafka 토픽 등)에서 가져온 샘플 문서가 표시됩니다. 또한 Kinesis 스트림에 대해 Enhanced Fan-out을 활성화하여 ClickPipe의 성능과 안정성을 향상할 수 있습니다(Enhanced Fan-out에 대한 자세한 내용은 [여기](https://aws.amazon.com/blogs/aws/kds-enhanced-fanout)를 참조하십시오).

<Image img={cp_step3_kinesis} alt="데이터 형식과 토픽 설정" size="lg" border/>

6. 다음 단계에서는 새 ClickHouse 테이블로 데이터를 수집할지, 기존 테이블을 재사용할지 선택할 수 있습니다. 화면의 안내에 따라 테이블 이름, 스키마 및 설정을 수정하십시오. 상단의 샘플 테이블에서 변경 사항을 실시간으로 미리 볼 수 있습니다.

<Image img={cp_step4a} alt="테이블, 스키마 및 설정 구성" size="lg" border/>

제공된 컨트롤을 사용해 고급 설정을 사용자 지정할 수도 있습니다.

<Image img={cp_step4a3} alt="고급 컨트롤 설정" size="lg" border/>

7. 또는 기존 ClickHouse 테이블에 데이터를 수집하도록 선택할 수도 있습니다. 이 경우 UI에서 선택한 대상 테이블의 ClickHouse 필드에 소스 필드를 매핑할 수 있는 기능을 제공합니다.

<Image img={cp_step4b} alt="기존 테이블 사용" size="lg" border/>

8. 마지막으로 내부 ClickPipes 사용자에 대한 권한을 구성할 수 있습니다.

**Permissions:** ClickPipes는 대상 테이블에 데이터를 쓰기 위한 전용 사용자를 생성합니다. 이 내부 사용자에 대해 사용자 지정 역할 또는 미리 정의된 역할 중 하나를 선택할 수 있습니다.

- `Full access`: 클러스터에 대한 전체 액세스 권한을 제공합니다. 대상 테이블과 함께 materialized view 또는 딕셔너리(Dictionary)를 사용하는 경우에 유용할 수 있습니다.
    - `Only destination table`: 대상 테이블에 대해서만 `INSERT` 권한을 부여합니다.

<Image img={cp_step5} alt="권한" border/>

9. "Complete Setup"을 클릭하면 시스템이 ClickPipe를 등록하고, 요약 테이블에서 해당 ClickPipe를 확인할 수 있습니다.

<Image img={cp_success} alt="성공 알림" size="sm" border/>

<Image img={cp_remove} alt="삭제 알림" size="lg" border/>

요약 테이블에서는 ClickHouse에서 소스 또는 대상 테이블의 샘플 데이터를 표시하는 컨트롤을 제공합니다.

<Image img={cp_destination} alt="대상 보기" size="lg" border/>

또한 ClickPipe를 삭제하고 수집 작업 요약을 표시하는 컨트롤도 제공합니다.

<Image img={cp_overview} alt="개요 보기" size="lg" border/>

10. **축하합니다!** 첫 번째 ClickPipe 구성이 성공적으로 완료되었습니다. 이 ClickPipe가 스트리밍 ClickPipe인 경우 원격 데이터 소스에서 실시간으로 데이터를 지속적으로 수집하면서 실행됩니다. 그렇지 않은 경우 배치 데이터를 한 번 수집한 후 작업이 완료됩니다.

## 지원되는 데이터 형식 \{#supported-data-formats\}

지원되는 형식은 다음과 같습니다.

- [JSON](/interfaces/formats/JSON)

## 지원되는 데이터 타입 \{#supported-data-types\}

### 표준 타입 지원 \{#standard-types-support\}

현재 ClickPipes에서 지원되는 ClickHouse 데이터 타입은 다음과 같습니다.

- 기본 숫자 타입 - \[U\]Int8/16/32/64, Float32/64, BFloat16
- 대형 정수 타입 - \[U\]Int128/256
- Decimal 타입
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (UTC 타임존만 지원)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- 모든 ClickHouse LowCardinality 타입
- 위의 타입(널 허용 포함)을 키와 값으로 사용하는 맵(map) 타입
- 위의 타입(널 허용 포함, 단일 레벨 깊이만)을 요소 타입으로 사용하는 Tuple 및 Array 타입
- SimpleAggregateFunction 타입 (대상이 AggregatingMergeTree 또는 SummingMergeTree인 경우)

### Variant 타입 지원 \{#variant-type-support\}

소스 데이터 스트림의 어떤 JSON 필드에 대해서도 `Variant(String, Int64, DateTime)`과 같은 Variant 타입을 수동으로 지정할 수 있습니다.  
ClickPipes가 사용할 올바른 Variant 하위 타입을 결정하는 방식 때문에 Variant 정의에는 정수 타입 또는 DateTime 타입 중 하나만 사용할 수 있습니다. 예를 들어, `Variant(Int64, UInt32)`는 지원되지 않습니다.

### JSON 타입 지원 \{#json-type-support\}

항상 JSON 객체인 JSON 필드는 JSON 대상 컬럼에 할당할 수 있습니다. 원하는 JSON 타입에 맞추어, 고정 또는 건너뛸 경로 설정을 포함하여 대상 컬럼을 수동으로 변경해야 합니다. 

## Kinesis 가상 컬럼 \{#kinesis-virtual-columns\}

다음 가상 컬럼은 Kinesis 스트림에서 지원됩니다. 새 대상 테이블을 생성할 때는 `Add Column` 버튼을 사용하여 가상 컬럼을 추가할 수 있습니다.

| Name             | Description                                                             | Recommended Data Type |
|------------------|-------------------------------------------------------------------------|-----------------------|
| _key             | Kinesis 파티션 키                                                       | String                |
| _timestamp       | Kinesis 도착 예상 타임스탬프(밀리초 단위 정밀도)                        | DateTime64(3)         |
| _stream          | Kinesis 스트림 이름                                                     | String                |
| _sequence_number | Kinesis 시퀀스 번호                                                     | String                |
| _raw_message     | 전체 Kinesis 메시지                                                     | String                |

`_raw_message` 필드는 전체 Kinesis JSON 레코드만 필요할 때(예: ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) 함수를 사용하여 다운스트림 구체화된 뷰(Materialized View)를 채우는 경우)에 사용할 수 있습니다. 이러한 파이프에서는 모든 「비가상」 컬럼을 삭제하는 것이 ClickPipes 성능 향상에 도움이 될 수 있습니다.

## 제한 사항 \{#limitations\}

- [DEFAULT](/sql-reference/statements/create/table#default)는 지원되지 않습니다.
- 개별 메시지는 가장 작은 XS 레플리카 크기로 실행할 때 기본값으로 8MB(압축 해제 기준), 더 큰 레플리카에서는 16MB(압축 해제 기준)로 제한됩니다. 이 한도를 초과하는 메시지는 오류와 함께 거부됩니다. 더 큰 메시지가 필요하면 지원팀에 문의하십시오.

## 성능 \{#performance\}

### 배치 처리 \{#batching\}

ClickPipes는 데이터를 배치 단위로 ClickHouse에 삽입합니다. 이는 데이터베이스에 지나치게 많은 파트가 생성되는 것을 방지하여 클러스터의 성능 저하를 막기 위한 것입니다.

배치는 다음 조건 중 하나를 만족하면 삽입됩니다.

- 배치 크기가 최대 크기에 도달했을 때 (행 100,000개 또는 레플리카 메모리 1GB당 32MB)
- 배치가 열려 있는 시간이 최대 허용 시간(5초)에 도달했을 때

### 지연 시간 \{#latency\}

지연 시간(스트림으로 전송된 Kinesis 메시지가 ClickHouse에서 사용 가능해질 때까지의 시간을 의미함)은 여러 요소(Kinesis 지연 시간, 네트워크 지연 시간, 메시지 크기 및 포맷 등)에 따라 달라집니다. 위 섹션에서 설명한 [배치](#batching) 또한 지연 시간에 영향을 줍니다. 기대할 수 있는 지연 시간을 파악하기 위해, 사용 중인 구체적인 사용 사례에 대해 테스트할 것을 항상 권장합니다.

특정한 저지연 요구 사항이 있는 경우, [문의해 주시기 바랍니다](https://clickhouse.com/company/contact?loc=clickpipes).

### Active Shards \{#active-shards\}

동시에 활성 상태인 세그먼트 수를 처리량 요구 사항에 맞게 제한할 것을 강력히 권장합니다. "On Demand" Kinesis 스트림의 경우 AWS가 처리량에 따라 자동으로 적절한 수의 세그먼트를 할당하지만,
"Provisioned" 스트림에서 세그먼트를 과도하게 프로비저닝하면 아래에 설명된 것처럼 지연(latency)이 발생할 수 있고, 해당 스트림에 대한 Kinesis 요금이 "세그먼트 단위(per shard)"로 청구되므로 비용도 증가하게 됩니다.

프로듀서 애플리케이션이 많은 수의 활성 세그먼트에 지속적으로 데이터를 기록하는 경우, 파이프가 해당 세그먼트를 효율적으로 처리할 수 있을 만큼 충분히 확장되어 있지 않다면 지연이 발생할 수 있습니다.
Kinesis 처리량 한도를 기준으로, ClickPipes는 세그먼트 데이터를 읽기 위해 레플리카당 특정 수의 "worker"를 할당합니다. 예를 들어, 가장 작은 크기에서는 하나의 ClickPipes 레플리카에 이러한 worker 스레드 4개가 할당됩니다.
프로듀서가 동시에 4개를 초과하는 세그먼트에 데이터를 기록하는 경우, worker 스레드가 사용 가능해질 때까지 "추가" 세그먼트의 데이터는 처리되지 않습니다. 특히 파이프가 "enhanced fanout"을 사용하는 경우,
각 worker 스레드는 5분 동안 단일 세그먼트에만 구독하며, 그 시간 동안 다른 세그먼트는 읽을 수 없습니다. 이로 인해 5분 단위의 지연 "스파이크"가 발생할 수 있습니다.

### Scaling \{#scaling\}

Kinesis용 ClickPipes는 수평 및 수직으로 확장 가능하도록 설계되었습니다. 기본적으로 하나의 consumer로 구성된 consumer group이 생성됩니다. 이는 ClickPipe를 생성하는 동안 또는 이후 언제든지 **Settings** -> **Advanced Settings** -> **Scaling**에서 구성할 수 있습니다.

ClickPipes는 가용 영역(Availability Zone)에 분산된 아키텍처를 통해 고가용성을 제공합니다.
이를 위해서는 최소 2개의 consumer로 확장해야 합니다.

실행 중인 consumer 수와 관계없이 설계 단계에서부터 장애 허용이 보장됩니다.
consumer 또는 그 기반 인프라에 장애가 발생하면,
ClickPipe가 해당 consumer를 자동으로 다시 시작하여 메시지 처리를 계속 수행합니다.

## 인증 \{#authentication\}

Amazon Kinesis 스트림에 접근하려면 [IAM 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 또는 [IAM 역할](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)을 사용할 수 있습니다. IAM 역할을 설정하는 방법에 대해서는 ClickHouse Cloud와 연동되는 역할 구성 방법을 설명한 [이 가이드](./02_auth.md)를 참고하십시오.