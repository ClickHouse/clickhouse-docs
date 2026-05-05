---
sidebar_label: 'Streamkap을 ClickHouse에 연결하기'
sidebar_position: 11
keywords: ['clickhouse', 'Streamkap', 'CDC', '연결', '통합', 'etl', '데이터 통합', '데이터 변경 캡처(Change Data Capture)']
slug: /integrations/sttreamkap
description: 'Airbyte 데이터 파이프라인을 사용하여 스트리밍 데이터를 ClickHouse로 수집합니다'

title: 'Streamkap을 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
  - website: 'https://www.streamkap.com/'
---

import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Streamkap을 ClickHouse에 연결하기 \{#connect-streamkap-to-clickhouse\}

<PartnerBadge/>

<a href="https://www.streamkap.com/" target="_blank">Streamkap</a>은(는) 스트리밍 Change Data Capture(CDC)와 스트림 처리에 특화된 실시간 데이터 통합 플랫폼입니다. Apache Kafka, Apache Flink, Debezium을 기반으로 한 고성능 확장형 스택 위에 구축되었으며, SaaS 또는 BYOC(Bring your own Cloud) 배포 형태의 완전 관리형 서비스로 제공됩니다. 

Streamkap을 사용하면 PostgreSQL, MySQL, SQL Server, MongoDB 및 <a href="https://streamkap.com/connectors" target="_blank">기타</a> 소스 데이터베이스에서 발생하는 모든 insert, update, delete 작업을 밀리초 단위 지연으로 곧바로 ClickHouse로 스트리밍할 수 있습니다. 

이는 실시간 분석 대시보드, 운영 분석, 그리고 머신 러닝 모델에 실시간 데이터를 공급하는 데 이상적입니다.

## 주요 기능 \{#key-features\}

- **실시간 스트리밍 CDC:** Streamkap은 데이터베이스 로그에서 직접 변경 사항을 캡처하여 ClickHouse의 데이터가 소스를 실시간으로 반영한 레플리카가 되도록 합니다.  
간소화된 스트림 처리: ClickHouse에 적재되기 전에 데이터를 실시간으로 변환, 보강, 라우팅, 포맷팅하고 임베딩을 생성할 수 있습니다. Flink 기반이지만 복잡한 구성이나 운영 부담이 없습니다.

- **완전 관리형 및 확장 가능:** 프로덕션 환경에 바로 사용할 수 있는, 유지보수가 필요 없는 파이프라인을 제공하므로 Kafka, Flink, Debezium 또는 스키마 레지스트리 인프라를 직접 운영할 필요가 없습니다. 이 플랫폼은 높은 처리량을 위해 설계되었으며, 수십억 건의 이벤트를 처리할 수 있도록 선형적으로 확장됩니다.

- **자동 스키마 진화:** Streamkap은 소스 데이터베이스의 스키마 변경을 자동으로 감지하고 이를 ClickHouse로 전파합니다. 새로운 컬럼 추가나 컬럼 타입 변경도 수동 개입 없이 처리할 수 있습니다.

- **ClickHouse에 최적화:** 이 통합은 ClickHouse의 기능을 효율적으로 활용하도록 설계되었습니다. 기본적으로 ReplacingMergeTree 엔진을 사용하여 소스 시스템의 업데이트와 삭제를 원활하게 처리합니다.

- **신뢰성 있는 전송:** 이 플랫폼은 at-least-once 전송을 보장하여 소스와 ClickHouse 간 데이터 일관성을 보장합니다. 업서트(upsert) 작업의 경우 기본 키를 기준으로 중복 제거를 수행합니다.

## 시작하기 \{#started\}

이 가이드는 Streamkap 파이프라인을 설정하여 데이터를 ClickHouse에 적재하는 방법을 상위 수준에서 개괄합니다.

### 사전 준비 사항 \{#prerequisites\}

- <a href="https://app.streamkap.com/account/sign-up" target="_blank">Streamkap 계정</a>.
- ClickHouse 클러스터 연결 정보: 호스트명(Hostname), 포트(Port), 사용자 이름(Username), 비밀번호(Password).
- CDC(Change Data Capture)를 허용하도록 구성된 소스 데이터베이스(예: PostgreSQL, SQL Server). 자세한 설정 가이드는 Streamkap 문서에서 확인할 수 있습니다.

### 1단계: Streamkap에서 소스 설정 \{#configure-clickhouse-source\}

1. Streamkap 계정에 로그인합니다.
2. 사이드바에서 **Connectors**로 이동한 다음 **Sources** 탭을 선택합니다.
3. **+ Add**를 클릭하고 소스 데이터베이스 유형을 선택합니다(예: SQL Server RDS).
4. 엔드포인트, 포트, 데이터베이스 이름, 사용자 자격 증명을 포함한 연결 정보를 입력합니다.
5. 커넥터를 저장합니다.

### 2단계: ClickHouse 대상 구성 \{#configure-clickhouse-dest\}

1. **Connectors** 섹션에서 **Destinations** 탭을 선택합니다.
2. **+ Add**를 클릭한 다음 목록에서 **ClickHouse**를 선택합니다.
3. ClickHouse 서비스에 대한 연결 정보를 입력합니다:
   - **Hostname:** ClickHouse 인스턴스의 호스트 이름 (예: `abc123.us-west-2.aws.clickhouse.cloud`)
   - **Port:** 보안 HTTPS 포트, 일반적으로 `8443`
   - **Username and Password:** ClickHouse 사용자 계정에 대한 자격 증명
   - **Database:** ClickHouse에서 대상이 될 데이터베이스 이름
4. 대상을 저장합니다.

### 3단계: 파이프라인 생성 및 실행 \{#run-pipeline\}

1. 사이드바에서 **Pipelines**로 이동한 뒤 **+ Create**를 클릭합니다.
2. 방금 구성한 Source와 Destination을 선택합니다.
3. 스트리밍할 스키마와 테이블을 선택합니다.
4. 파이프라인 이름을 지정하고 **Save**를 클릭합니다.

생성이 완료되면 파이프라인이 활성화됩니다. Streamkap은 먼저 기존 데이터의 스냅샷을 생성한 다음, 이후 발생하는 새로운 변경 사항을 스트리밍합니다.

### 4단계: ClickHouse에서 데이터 확인 \{#verify-data-clickhoouse\}

ClickHouse 클러스터에 연결한 후 쿼리를 실행해 대상 테이블로 유입되는 데이터를 확인합니다.

```sql
SELECT * FROM your_table_name LIMIT 10;
```


## ClickHouse에서의 동작 방식 \{#how-it-works-with-clickhouse\}

Streamkap 통합은 ClickHouse 내 CDC 데이터를 효율적으로 관리하도록 설계되었습니다.

### Table Engine and Data Handling \{#table-engine-data-handling\}

기본적으로 Streamkap은 upsert 방식으로 데이터를 수집합니다. ClickHouse에 테이블을 생성할 때는 ReplacingMergeTree 엔진을 사용합니다. 이 엔진은 CDC 이벤트를 처리하는 데 적합합니다:

- 소스 테이블의 기본 키(primary key)가 ReplacingMergeTree 테이블 정의에서 ORDER BY 키로 사용됩니다.

- 소스의 **Updates**는 ClickHouse에 새로운 행으로 기록됩니다. 백그라운드 머지(merge) 작업 동안 ReplacingMergeTree는 이러한 행들을 병합하여 정렬 키를 기준으로 최신 버전만 유지합니다.

- **Deletes**는 ReplacingMergeTree의 ```is_deleted``` 파라미터를 설정하는 메타데이터 플래그로 처리됩니다. 소스에서 삭제된 행은 즉시 제거되지 않고 삭제된 것으로만 표시됩니다.
  - 필요에 따라 삭제된 레코드를 분석 목적을 위해 ClickHouse에 유지할 수 있습니다.

### 메타데이터 컬럼 \{#metadata-columns\}

Streamkap은 데이터 상태를 관리하기 위해 각 테이블에 여러 메타데이터 컬럼을 추가합니다:

| 컬럼 이름                 | 설명                                                                 |
|--------------------------|---------------------------------------------------------------------|
| `_STREAMKAP_SOURCE_TS_MS` | 이벤트가 소스 데이터베이스에서 발생한 시점의 타임스탬프(밀리초 단위).      |
| `_STREAMKAP_TS_MS`        | Streamkap이 해당 이벤트를 처리한 시점의 타임스탬프(밀리초 단위).          |
| `__DELETED`               | 행이 소스에서 삭제되었는지 여부를 나타내는 불리언 플래그(`true`/`false`).  |
| `_STREAMKAP_OFFSET`       | 정렬 및 디버깅에 유용한 Streamkap 내부 로그의 오프셋 값.                 |

### 최신 데이터 쿼리하기 \{#query-latest-data\}

ReplacingMergeTree는 백그라운드에서 업데이트와 삭제를 처리하기 때문에, 단순한 SELECT * 쿼리로는 머지가 완료되기 전까지 과거 버전의 데이터나 삭제된 행이 보일 수 있습니다. 데이터의 최신 상태를 가져오려면 삭제된 행을 필터링하고 각 행의 최신 버전만 선택해야 합니다.

이를 위해 FINAL 수정자를 사용할 수 있으며, 편리하지만 쿼리 성능에 영향을 줄 수 있습니다:

```sql
-- Using FINAL to get the correct current state
SELECT * FROM your_table_name FINAL WHERE __DELETED = 'false';
SELECT * FROM your_table_name FINAL LIMIT 10;
SELECT * FROM your_table_name FINAL WHERE <filter by keys in ORDER BY clause>;
SELECT count(*) FROM your_table_name FINAL;
```

대용량 테이블에서 성능을 더 높이기 위해, 특히 모든 컬럼을 읽을 필요가 없고 일회성 분석 쿼리를 실행하는 경우에는 각 기본 키별 최신 레코드를 수동으로 선택하기 위해 `argMax` 함수를 사용할 수 있습니다:

```sql
SELECT key,
       argMax(col1, version) AS col1,
       argMax(col2, version) AS col2
FROM t
WHERE <your predicates>
GROUP BY key;
```

프로덕션 환경의 사용 사례와 동시에 반복적으로 실행되는 최종 사용자 쿼리가 있는 경우, 데이터를 materialized view로 모델링하면 후속 액세스 패턴에 더 잘 맞출 수 있습니다.


## 추가 자료 \{#further-reading\}

- <a href="https://streamkap.com/" target="_blank">Streamkap 웹사이트</a>
- <a href="https://docs.streamkap.com/clickhouse" target="_blank">ClickHouse용 Streamkap 문서</a>
- <a href="https://streamkap.com/blog/streaming-with-change-data-capture-to-clickhouse" target="_blank">블로그: Change Data Capture를 사용하여 ClickHouse로 스트리밍</a>
- <a href="https://streamkap.com/blog/streaming-with-change-data-capture-to-clickhouse" target="_blank">ClickHouse 문서: ReplacingMergeTree</a>