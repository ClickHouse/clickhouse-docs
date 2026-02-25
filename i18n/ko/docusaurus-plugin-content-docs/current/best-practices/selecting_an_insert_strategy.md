---
slug: /best-practices/selecting-an-insert-strategy
sidebar_position: 10
sidebar_label: 'INSERT 전략 선택'
title: 'INSERT 전략 선택'
description: 'ClickHouse에서 INSERT 전략을 선택하는 방법을 설명하는 페이지'
keywords: ['INSERT', '비동기 INSERT', '압축', '배치 INSERT']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/ko/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/ko/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

효율적인 데이터 수집은 고성능 ClickHouse 배포의 기반을 이룹니다. 적절한 INSERT 전략을 선택하면 처리량, 비용 및 안정성에 큰 영향을 미칠 수 있습니다. 이 섹션에서는 워크로드에 적합한 결정을 내리는 데 도움이 되는 모범 사례, 절충점 및 구성 옵션을 설명합니다.

:::note
다음 내용은 클라이언트를 통해 ClickHouse로 데이터를 푸시한다는 가정을 전제로 합니다. 내장 테이블 함수인 [s3](/sql-reference/table-functions/s3) 및 [gcs](/sql-reference/table-functions/gcs) 등을 사용해 ClickHouse로 데이터를 가져오는 경우에는 [&quot;Optimizing for S3 Insert and Read Performance&quot;](/integrations/s3/performance) 가이드를 참고할 것을 권장합니다.
:::


## 기본적으로 동기식 insert \{#synchronous-inserts-by-default\}

기본적으로 ClickHouse에 대한 insert는 동기식으로 수행됩니다. 각 insert 쿼리는 메타데이터와 인덱스를 포함하는 스토리지 파트(storage part)를 디스크에 즉시 생성합니다.

:::note 클라이언트 측에서 데이터를 배치할 수 있다면 동기식 insert를 사용하십시오
그렇지 않다면 아래의 [비동기식 insert](#asynchronous-inserts)를 참조하십시오.
:::

아래에서 ClickHouse MergeTree insert 동작 방식을 간단히 살펴봅니다:

<Image img={insert_process} size="lg" alt="Insert 처리 과정" background="black"/>

#### 클라이언트 측 단계 \{#client-side-steps\}

최적의 성능을 위해서는 데이터를 ①[ 배치 처리](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)해야 하며, 배치 크기가 **첫 번째로 결정해야 할 사항**입니다.

ClickHouse는 삽입된 데이터를 디스크에 저장하는데, 이때 테이블의 기본 키 컬럼(primary key column)으로[ 정렬된 상태](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)로 저장합니다. **두 번째로 결정해야 할 사항**은 서버로 전송하기 전에 데이터를 ② 미리 정렬(pre-sort)할지 여부입니다. 배치가 기본 키 컬럼으로 미리 정렬된 상태로 도착하면, ClickHouse는 ⑩ 정렬 단계를 [건너뛰어](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595) 수집 속도를 높일 수 있습니다.

수집할 데이터에 미리 정의된 형식이 없는 경우, **핵심적인 결정 사항**은 형식을 선택하는 것입니다. ClickHouse는 [70개가 넘는 형식](/interfaces/formats)으로 데이터 삽입을 지원합니다. 그러나 ClickHouse 명령줄 클라이언트나 프로그래밍 언어용 클라이언트를 사용할 때는 이 선택이 흔히 자동으로 처리됩니다. 필요하다면 이 자동 선택을 명시적으로 재정의할 수도 있습니다.

다음 **주요 결정 사항**은 데이터를 ClickHouse 서버로 전송하기 전에 ④ 압축할지 여부입니다. 압축은 전송 크기를 줄이고 네트워크 효율성을 개선하여, 특히 대규모 데이터 세트에서 더 빠른 데이터 전송과 더 낮은 대역폭 사용량을 가능하게 합니다.

데이터는 ClickHouse 네트워크 인터페이스인 [네이티브](/interfaces/tcp) 또는[ HTTP](/interfaces/http) 인터페이스 중 하나로 ⑤ 전송됩니다(이는 글의 후반부에서 [비교](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)합니다).

#### 서버 측 단계 \{#server-side-steps\}

⑥ 데이터를 수신한 후, 압축이 사용된 경우 ClickHouse가 이를 ⑦ 압축 해제하고, 이어서 원래 전송된 형식에서 ⑧ 파싱합니다.

해당 형식으로 변환된 데이터 값과 대상 테이블의 [DDL](/sql-reference/statements/create/table) 문을 사용하여 ClickHouse는 MergeTree 형식의 메모리 내 [block](/development/architecture#block)을 ⑨ 구성하고, ⑩ 기본 키 컬럼 기준으로 행이 미리 정렬되어 있지 않다면 이를 기준으로 행을 [정렬](/parts#what-are-table-parts-in-clickhouse)하며, ⑪ [희소 기본 인덱스](/guides/best-practices/sparse-primary-indexes)를 생성하고, ⑫ [컬럼 단위 압축](/parts#what-are-table-parts-in-clickhouse)을 적용한 뒤, 데이터를 새로운 ⑭ [데이터 파트](/parts)로 디스크에 ⑬ 기록합니다.

### 동기식 삽입 시 배치 처리 \{#batch-inserts-if-synchronous\}

<BulkInserts/>

### 멱등 재시도를 보장합니다 \{#ensure-idempotent-retries\}

동기식 insert는 **멱등적**이기도 합니다. MergeTree 엔진을 사용할 때 ClickHouse는 기본적으로 insert를 중복 제거합니다. 이는 다음과 같은 모호한 실패 상황으로부터 보호합니다.

* insert는 성공했지만 네트워크 중단으로 인해 클라이언트가 확인 응답을 받지 못한 경우
* insert가 서버 측에서 실패하고 타임아웃된 경우

두 경우 모두, 배치의 내용과 순서가 동일하게 유지되는 한 **insert를 재시도**해도 안전합니다. 이러한 이유로 클라이언트는 데이터를 수정하거나 재정렬하지 않고 일관되게 재시도하는 것이 중요합니다.

### 올바른 INSERT 대상 선택 \{#choose-the-right-insert-target\}

샤딩된 클러스터에서는 다음 두 가지 옵션이 있습니다:

* **MergeTree** 또는 **ReplicatedMergeTree** 테이블에 직접 INSERT를 수행합니다. 클라이언트가 세그먼트(shard) 간에 부하 분산을 수행할 수 있을 때 가장 효율적인 옵션입니다. `internal_replication = true`인 경우 ClickHouse가 복제를 투명하게 처리합니다.
* [분산 테이블](/engines/table-engines/special/distributed)에 INSERT를 수행합니다. 이렇게 하면 클라이언트는 임의의 노드로 데이터를 전송하고, ClickHouse가 이를 올바른 세그먼트로 포워딩합니다. 이 방식이 더 단순하지만, 추가 포워딩 단계로 인해 성능이 약간 저하됩니다. 이 경우에도 `internal_replication = true` 사용을 권장합니다.

**ClickHouse Cloud에서는 모든 노드가 동일한 단일 세그먼트에 대해 읽기 및 쓰기를 수행합니다. INSERT는 자동으로 노드 간에 균등하게 분산됩니다. 공개된 엔드포인트로 INSERT를 전송하기만 하면 됩니다.**

### 올바른 포맷 선택 \{#choose-the-right-format\}

적절한 입력 포맷을 선택하는 것은 ClickHouse에서 효율적인 데이터 수집에 매우 중요합니다. 70개가 넘는 포맷을 지원하므로, 가장 성능이 좋은 옵션을 선택하면 INSERT 속도, CPU 및 메모리 사용량, 전반적인 시스템 효율에 큰 영향을 줄 수 있습니다. 

유연성은 데이터 엔지니어링 및 파일 기반 가져오기에는 유용하지만, **애플리케이션에서는 성능 위주의 포맷을 우선해야 합니다**:

* **Native format**(권장): 가장 효율적입니다. 열 지향 포맷으로, 서버 측에서 필요한 파싱이 최소화됩니다. Go 및 Python 클라이언트에서 기본값으로 사용됩니다.
* **RowBinary**: 효율적인 행 기반 포맷으로, 클라이언트 측에서 열 지향 변환을 수행하기 어렵다면 이상적입니다. Java 클라이언트에서 사용됩니다.
* **JSONEachRow**: 사용하기는 쉽지만 파싱 비용이 많이 듭니다. 저용량 사용 사례나 빠른 통합에 적합합니다.

### 압축 사용 \{#use-compression\}

압축은 네트워크 오버헤드를 줄이고 INSERT 속도를 높이며, ClickHouse에서 스토리지 비용을 낮추는 데 중요한 역할을 합니다. 효과적으로 사용하면 데이터 형식이나 스키마를 변경하지 않고도 수집(ingestion) 성능을 향상할 수 있습니다.

INSERT 시 전송하는 데이터를 압축하면 네트워크를 통해 전송되는 페이로드 크기가 줄어들어 대역폭 사용량이 감소하고 전송 속도가 빨라집니다.

INSERT 작업에서는 이미 ClickHouse의 내부 열 지향(columnar) 스토리지 모델과 일치하는 Native 포맷과 함께 사용할 때 압축 효과가 특히 좋습니다. 이 구성에서는 서버가 데이터를 효율적으로 압축 해제한 후 최소한의 변환만으로 곧바로 저장할 수 있습니다.

#### 속도를 위해서는 LZ4, 압축률을 위해서는 ZSTD 사용 \{#use-lz4-for-speed-zstd-for-compression-ratio\}

ClickHouse는 데이터 전송 시 여러 압축 코덱을 지원합니다. 일반적으로 많이 사용하는 옵션은 다음과 같습니다.

* **LZ4**: 빠르고 가볍습니다. CPU 오버헤드를 최소화하면서 데이터 크기를 상당히 줄여 주어, 높은 처리량의 INSERT 작업에 적합하며 대부분의 ClickHouse 클라이언트에서 기본값으로 사용됩니다.
* **ZSTD**: 더 높은 압축률을 제공하지만 CPU 사용량이 더 많습니다. 리전 간 전송이나 클라우드 제공자 간 트래픽처럼 네트워크 전송 비용이 큰 상황에서 유용하지만, 클라이언트 측 연산량과 서버 측 압축 해제(디컴프레션) 시간은 약간 증가합니다.

권장 사항: 대역폭이 제한적이거나 데이터 송신 비용이 발생하는 경우가 아니라면 LZ4를 사용하고, 그런 제약이 있는 경우에는 ZSTD 사용을 고려하십시오.

:::note
[FastFormats benchmark](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) 테스트에서, LZ4로 압축한 Native INSERT는 데이터 크기를 50% 이상 줄여 5.6 GiB 데이터셋의 수집 시간을 150초에서 131초로 단축했습니다. ZSTD로 전환하면 동일한 데이터셋을 1.69 GiB까지 압축할 수 있었지만, 서버 측 처리 시간이 약간 증가했습니다.
:::

#### 압축은 리소스 사용량을 줄입니다 \{#compression-reduces-resource-usage\}

압축은 네트워크 트래픽을 줄일 뿐만 아니라 서버의 CPU 및 메모리 효율도 향상합니다. 데이터가 압축되어 있으면 ClickHouse는 더 적은 바이트를 수신하고, 큰 입력을 파싱하는 데 드는 시간이 줄어듭니다. 이 이점은 관측성 시나리오처럼 여러 동시 클라이언트로부터 수집할 때 특히 중요합니다.

압축이 CPU와 메모리에 미치는 영향은 LZ4에서는 작고, ZSTD에서는 중간 수준입니다. 부하가 걸린 상황에서도 데이터 양이 줄어들기 때문에 서버 측 효율이 향상됩니다.

**압축을 배치 처리와 효율적인 입력 포맷(예: Native)과 결합하면 수집 성능을 최대로 끌어올릴 수 있습니다.**

native 인터페이스(예: [clickhouse-client](/interfaces/cli))를 사용할 때는 LZ4 압축이 기본으로 활성화됩니다. 필요하다면 설정을 통해 ZSTD로 전환할 수 있습니다.

[HTTP 인터페이스](/interfaces/http)를 사용할 때는 `Content-Encoding` 헤더를 사용하여 압축을 적용하십시오(예: `Content-Encoding: lz4`). 전송하기 전에 전체 페이로드를 압축해야 합니다.

### 비용이 낮다면 사전 정렬 \{#pre-sort-if-low-cost\}

삽입 전에 기본 키 기준으로 데이터를 미리 정렬하면, 특히 대용량 배치의 경우 ClickHouse에서 수집 효율을 높일 수 있습니다. 

데이터가 사전 정렬된 상태로 도착하면, ClickHouse는 파트 생성 중 내부 정렬 단계를 건너뛰거나 단순화할 수 있어 CPU 사용량을 줄이고 INSERT 처리를 가속화할 수 있습니다. 사전 정렬은 유사한 값이 함께 묶이도록 하여 압축 효율도 개선합니다. 이로 인해 LZ4 또는 ZSTD와 같은 코덱이 더 나은 압축 비율을 달성할 수 있습니다. 이는 대용량 배치 INSERT 및 압축과 결합될 때 특히 유리하며, 처리 오버헤드와 전송되는 데이터 양을 모두 줄여 줍니다.

**다만, 사전 정렬은 필수가 아니라 선택적 최적화입니다.** ClickHouse는 병렬 처리를 사용해 데이터를 매우 효율적으로 정렬하므로, 많은 경우 서버 측 정렬이 클라이언트 측 사전 정렬보다 더 빠르거나 더 편리합니다. 

**데이터가 이미 거의 정렬된 상태이거나 클라이언트 측 리소스(CPU, 메모리)가 충분하고 여유가 있을 때만 사전 정렬을 권장합니다.** 데이터가 순서 없이 또는 다수의 에이전트에서 도착하는 관측성과 같은 지연 시간 민감 또는 고처리량 사용 사례에서는, 사전 정렬을 생략하고 ClickHouse의 내장 성능에 의존하는 편이 더 나은 경우가 많습니다.

## 비동기 INSERT \{#asynchronous-inserts\}

<AsyncInserts />

## 인터페이스를 선택합니다—HTTP 또는 네이티브 \{#choose-an-interface\}

### Native \{#choose-an-interface-native\}

ClickHouse는 데이터 수집을 위해 **native 인터페이스**와 **HTTP 인터페이스**라는 두 가지 주요 인터페이스를 제공합니다. 두 인터페이스는 성능과 유연성 사이의 균형에서 서로 다른 장단점을 가집니다. [clickhouse-client](/interfaces/cli)와 Go, C++ 같은 일부 언어 클라이언트에서 사용하는 native 인터페이스는 성능에 특화되어 있습니다. 항상 ClickHouse의 매우 효율적인 Native 형식으로 데이터를 전송하며, LZ4 또는 ZSTD를 사용한 블록 단위 압축을 지원하고, 파싱 및 형식 변환 같은 작업을 클라이언트로 위임하여 서버 측 처리를 최소화합니다. 

또한 MATERIALIZED 및 DEFAULT 컬럼 값을 클라이언트 측에서 계산할 수 있게 하여, 서버가 이 단계들을 완전히 생략할 수 있도록 합니다. 이러한 특성 덕분에 native 인터페이스는 효율성이 중요한 대량 데이터 수집 시나리오에 특히 적합합니다.

### HTTP \{#choose-an-interface-http\}

대부분의 전통적인 데이터베이스와 달리 ClickHouse는 HTTP 인터페이스도 지원합니다. **반면 HTTP 인터페이스는 호환성과 유연성을 우선합니다.** JSON, CSV, Parquet 등을 포함한 [지원되는 모든 포맷](/integrations/data-formats)으로 데이터를 전송할 수 있으며, Python, Java, JavaScript, Rust를 비롯한 대부분의 ClickHouse 클라이언트에서 널리 지원됩니다. 

이 인터페이스는 트래픽을 로드 밸런서를 사용해 쉽게 분산·전환할 수 있기 때문에 ClickHouse의 네이티브 프로토콜보다 선호되는 경우가 많습니다. 네이티브 프로토콜은 오버헤드가 조금 더 적어 삽입 성능에서 약간의 차이가 발생할 수 있습니다.

그러나 네이티브 프로토콜 수준의 깊은 통합을 제공하지 못하며, 구체화된 값 계산이나 Native 포맷으로의 자동 변환과 같은 클라이언트 측 최적화를 수행할 수 없습니다. HTTP 삽입 역시 표준 HTTP 헤더(예: `Content-Encoding: lz4`)를 사용해 압축할 수 있지만, 압축은 개별 데이터 블록이 아니라 전체 페이로드에 적용됩니다. 이 인터페이스는 프로토콜의 단순성, 로드 밸런싱, 폭넓은 포맷 호환성이 순수 성능보다 더 중요한 환경에서 선호되는 경우가 많습니다.

이러한 인터페이스에 대한 더 자세한 설명은 [여기](/interfaces/overview)를 참고하십시오.