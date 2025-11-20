---
'sidebar_label': 'FAQ'
'description': 'Postgres에 대한 ClickPipes에 대한 자주 묻는 질문.'
'slug': '/integrations/clickpipes/postgres/faq'
'sidebar_position': 2
'title': 'ClickPipes for Postgres FAQ'
'keywords':
- 'postgres faq'
- 'clickpipes'
- 'toast columns'
- 'replication slot'
- 'publications'
'doc_type': 'reference'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';


# ClickPipes for Postgres 자주 묻는 질문(FAQ)

### 아이들링이 내 Postgres CDC ClickPipe에 어떤 영향을 미칩니까? {#how-does-idling-affect-my-postgres-cdc-clickpipe}

ClickHouse Cloud 서비스가 아이들링 상태일 경우, Postgres CDC ClickPipe는 계속해서 데이터를 동기화하며, 다음 동기화 간격에 서비스가 활성화되어 들어오는 데이터를 처리합니다. 동기화가 완료되고 아이들링 기간에 도달하면 서비스는 다시 아이들 상태로 돌아갑니다.

예를 들어, 동기화 간격이 30분으로 설정되어 있고 서비스 아이들링 시간이 10분으로 설정되어 있다면, 서비스는 매 30분마다 깨어나 10분 동안 활성 상태가 되고, 그 후에는 다시 아이들 상태로 돌아갑니다.

### ClickPipes for Postgres에서 TOAST 컬럼은 어떻게 처리됩니까? {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

자세한 내용은 [TOAST 열 처리](./toast) 페이지를 참조하십시오.

### ClickPipes for Postgres에서 생성된 열은 어떻게 처리됩니까? {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

자세한 내용은 [Postgres 생성된 열: 문제점 및 모범 사례](./generated_columns) 페이지를 참조하십시오.

### 테이블이 Postgres CDC의 일부가 되려면 기본 키가 필요합니까? {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

Postgres를 위한 ClickPipes를 사용하여 테이블을 복제하려면 기본 키 또는 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)가 정의되어 있어야 합니다.

- **기본 키**: 가장 간단한 방법은 테이블에 기본 키를 정의하는 것입니다. 이것은 각 행에 대한 고유 식별자를 제공하며 업데이트 및 삭제 추적에 필수적입니다. 이 경우 REPLICA IDENTITY를 `DEFAULT` (기본 동작)으로 설정할 수 있습니다.
- **복제본 식별자**: 테이블에 기본 키가 없는 경우, 복제본 식별자를 설정할 수 있습니다. 복제본 식별자는 `FULL`로 설정할 수 있으며, 이는 전체 행이 변경 식별에 사용됨을 의미합니다. 또는 테이블에 고유 인덱스가 있는 경우 이를 사용하도록 설정할 수 있으며, 그런 다음 REPLICA IDENTITY를 `USING INDEX index_name`으로 설정할 수 있습니다. 
복제본 식별자를 FULL로 설정하려면 다음 SQL 명령을 사용할 수 있습니다:
```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```
REPLICA IDENTITY FULL은 변경되지 않은 TOAST 열의 복제를 활성화합니다. 이에 대한 자세한 내용은 [여기](./toast)를 참조하십시오.

`REPLICA IDENTITY FULL`을 사용하는 것은 성능에 영향을 줄 수 있으며, 특히 기본 키가 없는 테이블에서 업데이트나 삭제가 빈번히 발생하는 경우, 각 변경 사항에 대해 더 많은 로그 데이터가 필요하므로 WAL의 빠른 성장으로 이어질 수 있습니다. 기본 키 또는 복제본 식별자를 설정하는 방법에 대해 질문이 있거나 도움이 필요하신 경우, 지원 팀에 문의하여 안내를 받는 것이 좋습니다.

기본 키 또는 복제본 식별자가 정의되지 않은 경우 ClickPipes는 해당 테이블의 변경 사항을 복제할 수 없으며, 복제 과정 중 오류가 발생할 수 있습니다. 따라서 ClickPipe를 설정하기 전에 테이블 스키마를 검토하고 이 요구 사항을 충족하는지 확인하는 것이 좋습니다.

### 분할된 테이블을 Postgres CDC의 일부로 지원합니까? {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

네, 분할된 테이블은 기본 키 또는 복제본 식별자가 정의되어 있는 한 즉시 지원됩니다. 기본 키와 복제본 식별자는 상위 테이블 및 그 파티션 모두에 존재해야 합니다. 이에 대한 자세한 내용은 [여기](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)를 참조하십시오.

### 공용 IP가 없거나 프라이빗 네트워크에 있는 Postgres 데이터베이스에 연결할 수 있습니까? {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

네! ClickPipes for Postgres는 프라이빗 네트워크에서 데이터베이스에 연결할 수 있는 두 가지 방법을 제공합니다:

1. **SSH 터널링**
   - 대부분의 사용 사례에서 잘 작동합니다.
   - 설정 지침은 [여기](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)를 참조하십시오.
   - 모든 지역에서 작동합니다.

2. **AWS PrivateLink**
   - 세 개의 AWS 리전에서 사용 가능합니다:
     - us-east-1
     - us-east-2
     - eu-central-1
   - 자세한 설정 지침은 [PrivateLink 문서](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 참조하십시오.
   - PrivateLink가 지원되지 않는 리전에서는 SSH 터널링을 사용하십시오.

### UPDATE 및 DELETE는 어떻게 처리합니까? {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres는 Postgres에서 INSERT와 UPDATE를 ClickHouse에 서로 다른 버전의 새로운 행으로 캡처합니다( `_peerdb_` 버전 컬럼 사용). ReplacingMergeTree 테이블 엔진은 정기적으로 백그라운드에서 중복 제거를 수행하며, 이는 정렬 키(ORDER BY 컬럼)를 기준으로 최신 `_peerdb_` 버전의 행만 유지합니다.

Postgres의 DELETE는 삭제된 것으로 표시된 새로운 행으로 전파됩니다( `_peerdb_is_deleted` 컬럼 사용). 중복 제거 과정은 비동기적이므로, 일시적으로 중복된 행이 보일 수 있습니다. 이를 해결하기 위해 쿼리 계층에서 중복 제거를 처리해야 합니다.

또한 기본적으로 Postgres는 DELETE 작업 중에 기본 키 또는 복제본 식별자의 일부가 아닌 열의 값은 전송하지 않습니다. DELETE 작업 중에 전체 행 데이터를 캡처하려면 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)를 FULL로 설정할 수 있습니다.

자세한 내용은 다음을 참조하십시오:

* [ReplacingMergeTree 테이블 엔진 모범 사례](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres-에서 ClickHouse로 CDC 내부 블로그](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### PostgreSQL에서 기본 키 컬럼을 업데이트할 수 있습니까? {#can-i-update-primary-key-columns-in-postgresql}

:::warning
PostgreSQL에서 기본 키 업데이트는 기본적으로 ClickHouse에서 제대로 재생할 수 없습니다.

이 제한은 `ReplacingMergeTree`의 중복 제거가 `ORDER BY` 컬럼을 기준으로 작동하기 때문에 발생합니다(일반적으로 이는 기본 키에 해당합니다). PostgreSQL에서 기본 키가 업데이트될 때 ClickHouse에서는 이를 기존 행에 대한 업데이트가 아니라 다른 키를 가진 새로운 행으로 나타내게 됩니다. 이로 인해 ClickHouse 테이블에 기존 및 새로운 기본 키 값이 모두 존재하게 될 수 있습니다.
:::

기본 키 열을 업데이트하는 것은 PostgreSQL 데이터베이스 설계에서 일반적인 관행이 아닙니다. 기본 키는 불변 식별자로 설계되기 때문입니다. 대부분의 애플리케이션은 설계상 기본 키 업데이트를 피하므로 이 제한은 일반적인 사용 사례에서는 드물게 발생합니다.

기본 키 업데이트 처리를 활성화할 수 있는 실험적 설정이 있지만, 이는 상당한 성능 영향을 미치며 신중한 검토 없이 프로덕션 사용에 권장되지 않습니다.

PostgreSQL에서 기본 키 열을 업데이트하고 이러한 변경 사항이 ClickHouse에 제대로 반영되도록 해야 하는 경우, 특정 요구 사항 및 가능한 솔루션에 대해 지원 팀([db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com))에 연락해 주시기 바랍니다.

### 스키마 변경을 지원합니까? {#do-you-support-schema-changes}

자세한 내용은 [ClickPipes for Postgres: 스키마 변경 전파 지원](./schema-changes) 페이지를 참조하십시오.

### Postgres CDC의 ClickPipes 비용은 얼마입니까? {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

상세한 가격 정보는 [우리의 메인 청구 개요 페이지에서 ClickPipes for Postgres CDC 가격 섹션]( /cloud/reference/billing/clickpipes)을 참조하십시오.

### 내 복제 슬롯 크기가 증가하거나 감소하지 않습니다; 문제는 무엇입니까? {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

Postgres 복제 슬롯의 크기가 계속 증가하거나 감소하지 않는 것을 발견했다면, 이는 일반적으로 **WAL(Write-Ahead Log) 레코드가 CDC 파이프라인이나 복제 프로세스에 의해 충분히 빨리 소비되지 않고 있다**는 것을 의미합니다. 아래는 가장 일반적인 원인과 해결 방법입니다.

1. **데이터베이스 활동의 갑작스러운 급증**
   - 대규모 일괄 업데이트, 대량 삽입 또는 중요한 스키마 변경 사항이 신속하게 많은 WAL 데이터를 생성할 수 있습니다.
   - 복제 슬롯은 이러한 WAL 레코드를 소비될 때까지 보유하고 있으므로, 일시적인 크기 급증을 초래할 수 있습니다.

2. **오랜 실행 거래**
   - 열린 거래는 Postgres가 거래 시작 이후 생성된 모든 WAL 세그먼트를 유지하도록 강제합니다. 이로 인해 슬롯 크기가 급격히 증가할 수 있습니다.
   - 거래가 무한정 열려 있지 않도록 `statement_timeout` 및 `idle_in_transaction_session_timeout`을 합리적인 값으로 설정해야 합니다:
```sql
SELECT
    pid,
    state,
    age(now(), xact_start) AS transaction_duration,
    query AS current_query
FROM
    pg_stat_activity
WHERE
    xact_start IS NOT NULL
ORDER BY
    age(now(), xact_start) DESC;
```
     비정상적으로 긴 실행 거래를 식별하려면 이 쿼리를 사용하십시오.

3. **유지 관리 또는 유틸리티 작업 (예: `pg_repack`)**
   - `pg_repack`과 같은 도구는 전체 테이블을 다시 작성하여 짧은 시간에 많은 WAL 데이터를 생성할 수 있습니다.
   - 이러한 작업은 트래픽이 덜한 시간대에 예약하거나 실행 중에 WAL 사용량을 밀접하게 모니터링해야 합니다.

4. **VACUUM 및 VACUUM ANALYZE**
   - 데이터베이스 건강을 위해 필요한 작업이지만, 이러한 작업이 대규모 테이블을 스캔할 경우 추가 WAL 트래픽을 생성할 수 있습니다.
   - 자동 진공 조정 매개변수 사용을 고려하거나 비업무 시간에 수동 VACUUM 작업을 예약하면 좋습니다.

5. **복제 소비자가 슬롯을 활성적으로 읽지 않음**
   - CDC 파이프라인(예: ClickPipes) 또는 다른 복제 소비자가 중지, 일시 정지 또는 충돌하는 경우, WAL 데이터가 슬롯에 누적됩니다.
   - 파이프라인이 지속적으로 실행되고 있는지 확인하고 로그에서 연결 또는 인증 오류를 확인해야 합니다.

이 주제에 대한 훌륭한 심층 분석을 위해 블로그 포스트를 확인해 보십시오: [Postgres 논리 디코딩의 함정 극복하기](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it).

### Postgres 데이터 유형은 ClickHouse에 어떻게 매핑됩니까? {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgres는 ClickHouse 측에서 Postgres 데이터 유형을 최대한 원주율적으로 매핑하는 것을 목표로 합니다. 이 문서는 각 데이터 유형 및 해당 매핑에 대한 포괄적인 목록을 제공합니다: [데이터 유형 매트릭스](https://docs.peerdb.io/datatypes/datatype-matrix).

### Postgres에서 ClickHouse로 데이터를 복제하는 동안 내 데이터 유형 매핑을 정의할 수 있습니까? {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

현재 파이프의 일부로 사용자 정의 데이터 유형 매핑 정의는 지원되지 않습니다. 그러나 ClickPipes에서 사용하는 기본 데이터 유형 매핑은 매우 원주율적입니다. Postgres의 대부분의 컬럼 유형은 ClickHouse의 원주율적인 동등 물체로 최대한 근접하게 복제됩니다. 예를 들어, Postgres의 정수 배열 유형은 ClickHouse의 정수 배열 유형으로 복제됩니다.

### Postgres에서 JSON 및 JSONB 열은 어떻게 복제됩니까? {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON 및 JSONB 열은 ClickHouse에서 문자열(String) 유형으로 복제됩니다. ClickHouse는 기본 [JSON 유형](/sql-reference/data-types/newjson)을 지원하므로, 필요 시 ClickPipes 테이블 위에 물리화된 뷰를 생성하여 변환을 수행할 수 있습니다. 또는 문자열 컬럼에 대해 바로 [JSON 함수](/sql-reference/functions/json-functions)를 사용할 수 있습니다. 현재 JSON 및 JSONB 열을 ClickHouse의 JSON 유형으로 직접 복제하는 기능을 개발하고 있습니다. 이 기능은 몇 달 내에 제공될 것으로 예상됩니다.

### 미러가 일시 정지되면 삽입은 어떻게 됩니까? {#what-happens-to-inserts-when-a-mirror-is-paused}

미러를 일시 정지하면 메시지가 소스 Postgres의 복제 슬롯에 대기열로 쌓여 버퍼링되고 손실되지 않도록 보장됩니다. 그러나 미러를 일시 정지했다가 다시 시작하면 연결이 재설정되므로 소스에 따라 시간이 소요될 수 있습니다.

이 과정에서 동기화(데이터를 Postgres에서 가져와 ClickHouse 원시 테이블로 스트리밍) 및 정규화(원시 테이블에서 대상 테이블로 변환) 작업이 중단됩니다. 그러나 영속적으로 재개하는 데 필요한 상태는 유지됩니다.

- 동기화의 경우 중간에 취소되면 Postgres의 confirmed_flush_lsn이 진행되지 않으므로 다음 동기화는 중단된 것과 같은 위치에서 시작되어 데이터 일관성을 보장합니다.
- 정규화의 경우 ReplacingMergeTree 삽입 순서가 중복 제거를 처리합니다.

요약하면 동기화 및 정규화 프로세스는 일시 정지 중에 중단되지만, 데이터 손실이나 불일치 없이 안전하게 재개할 수 있습니다.

### ClickPipe 생성을 자동화하거나 API 또는 CLI를 통해 수행할 수 있습니까? {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipe는 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 엔드포인트를 통해 생성하고 관리할 수도 있습니다. 이 기능은 베타 단계이며 API 참조는 [여기](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta)에서 찾을 수 있습니다. 또한 Postgres ClickPipes 생성을 위한 Terraform 지원을 적극적으로 작업하고 있습니다.

### 초기 로드를 어떻게 빠르게 할 수 있습니까? {#how-do-i-speed-up-my-initial-load}

이미 실행 중인 초기 로드는 빠르게 할 수 없습니다. 하지만 일부 설정을 조정하여 향후 초기 로드를 최적화할 수 있습니다. 기본적으로 설정은 4개의 병렬 스레드와 파티션당 행의 스냅샷 숫자가 100,000으로 설정되어 있습니다. 이들은 일반적으로 대부분의 사용 사례에 충분한 고급 설정입니다.

Postgres 버전이 13 이하인 경우 CTID 범위 스캔이 더 느리므로 이러한 설정이 더 중요해집니다. 이러한 경우, 성능 개선을 위해 다음 프로세스를 고려해 볼 수 있습니다:

1. **기존 파이프 삭제**: 새로운 설정을 적용하기 위해 필요합니다.
2. **ClickHouse에서 대상 테이블 삭제**: 이전 파이프에 의해 생성된 테이블이 제거되었는지 확인합니다.
3. **최적화된 설정으로 새로운 파이프 생성**: 일반적으로 파티션당 행의 스냅샷 수를 100만에서 1000만으로 늘리는 것을 고려하십시오. 이는 특정 요구 사항 및 Postgres 인스턴스가 처리할 수 있는 부하에 따라 다릅니다.

이러한 조정은 초기 로드 성능을 크게 향상시킬 수 있으며, 특히 오래된 Postgres 버전에서 그렇습니다. Postgres 14 이상을 사용 중이라면 이러한 설정은 CTID 범위 스캔에 대한 지원이 개선되었으므로 영향이 적습니다.

### 복제를 설정할 때 내 출판물의 범위를 어떻게 정해야 합니까? {#how-should-i-scope-my-publications-when-setting-up-replication}

ClickPipes가 출판물을 관리하게 할 수 있습니다(추가 권한 필요) 또는 직접 생성할 수 있습니다. ClickPipes가 관리하는 출판물의 경우 테이블 추가 및 제거를 자동으로 처리합니다. 자가 관리하는 경우, 복제해야 하는 테이블만 포함하도록 출판물의 범위를 신중하게 설정해야 합니다. 필요하지 않은 테이블을 포함하면 Postgres WAL 디코딩 속도가 느려질 수 있습니다.

출판물에 테이블을 포함하려면 반드시 기본 키 또는 `REPLICA IDENTITY FULL`이 있어야 합니다. 기본 키가 없는 테이블이 있는 경우 모든 테이블에 대해 출판물을 생성하면 해당 테이블에서 DELETE 및 UPDATE 작업이 실패합니다.

데이터베이스에서 기본 키가 없는 테이블을 식별하려면 다음 쿼리를 사용할 수 있습니다:
```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE
    (table_catalog, table_schema, table_name) NOT IN (
        SELECT table_catalog, table_schema, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'PRIMARY KEY') AND
    table_schema NOT IN ('information_schema', 'pg_catalog', 'pgq', 'londiste');
```

기본 키가 없는 테이블을 다룰 때 두 가지 선택 사항이 있습니다:

1. **ClickPipes에서 기본 키가 없는 테이블 제외**:
   기본 키가 있는 테이블만 포함하여 출판물을 생성하십시오:
```sql
CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
```

2. **ClickPipes에서 기본 키가 없는 테이블 포함**:
   기본 키가 없는 테이블을 포함하려는 경우, 그들의 복제본 식별자를 `FULL`로 변경해야 합니다. 이것은 UPDATE 및 DELETE 작업이 올바르게 작동하도록 합니다:
```sql
ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
```

:::tip
ClickPipes가 관리하는 대신 수동으로 출판물을 생성하는 경우, 우리는 `FOR ALL TABLES` 출판물을 생성하는 것을 권장하지 않습니다. 이는 ClickPipes로의 Postgres 트래픽이 증가하고(파이프에 없는 다른 테이블의 변경사항 전송) 전반적인 효율성을 감소시킵니다.

수동으로 생성된 출판물의 경우, 파이프에 추가하기 전에 출판물에 원하는 모든 테이블을 추가하십시오.
:::

:::warning
Postgres 읽기 복제본/핫 스탠바이에서 복제하는 경우, 기본 인스턴스에서 출판물을 생성해야 하며, 이 출판물은 자동으로 대기 상태로 전파됩니다. 이 경우 ClickPipe는 출판물을 관리할 수 없습니다. 대기 시스템에서는 출판물을 생성할 수 없습니다.
:::

### 권장 `max_slot_wal_keep_size` 설정 {#recommended-max_slot_wal_keep_size-settings}

- **최소한:** [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE)를 설정하여 적어도 **이틀치** WAL 데이터를 유지합니다.
- **대규모 데이터베이스(높은 거래량):** 최소한 **일일 최고 WAL 생성량의 2-3배**를 유지합니다.
- **저장 공간이 제한된 환경:** 복제의 안정성을 보장하면서 **디스크 고갈을 피하도록** 보수적으로 조정합니다.

#### 적절한 값 계산 방법 {#how-to-calculate-the-right-value}

적절한 설정을 결정하려면 WAL 생성 속도를 측정합니다:

##### PostgreSQL 10 이상 {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

##### PostgreSQL 9.6 및 이하 {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 하루 중 다른 시간에 위 쿼리를 실행하십시오. 특히 거래가 많이 발생하는 시간대에.
* 24시간 동안 생성된 WAL의 양을 계산합니다.
* 그 숫자에 2 또는 3을 곱하여 충분한 보유량을 제공합니다.
* 결과 값을 MB 또는 GB 단위의 `max_slot_wal_keep_size`로 설정합니다.

##### 예시 {#example}

데이터베이스가 하루에 100GB의 WAL을 생성하는 경우, 아래와 같이 설정하십시오:

```sql
max_slot_wal_keep_size = 200GB
```

### 로그에서 ReceiveMessage EOF 오류가 발생하고 있습니다. 이는 무슨 뜻인가요? {#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean}

`ReceiveMessage`는 Postgres 논리 디코딩 프로토콜에서 복제 스트림에서 메시지를 읽는 함수입니다. EOF(End of File) 오류는 복제 스트림에서 읽으려고 할 때 Postgres 서버와의 연결이 예기치 않게 닫혔음을 나타냅니다.

이는 복구 가능한, 전혀 치명적이지 않은 오류입니다. ClickPipes는 자동으로 재연결을 시도하고 복제 프로세스를 재개합니다.

이 문제는 몇 가지 이유로 발생할 수 있습니다:
- **낮은 wal_sender_timeout:** `wal_sender_timeout`을 5분 이상으로 설정하십시오. 이 설정은 서버가 클라이언트로부터 응답을 기다리는 시간으로, 시간이 너무 짧으면 조기에 연결이 끊길 수 있습니다.
- **네트워크 문제:** 일시적인 네트워크 중단으로 연결이 끊어질 수 있습니다.
- **Postgres 서버 재시작:** Postgres 서버가 재시작되거나 충돌하는 경우 연결이 끊어지게 됩니다.

### 내 복제 슬롯이 무효화되었습니다. 나는 무엇을 해야 합니까? {#my-replication-slot-is-invalidated-what-should-i-do}

ClickPipe를 복구하는 유일한 방법은 설정 페이지에서 재동기화를 트리거하는 것입니다.

복제 슬롯 무효화의 가장 일반적인 원인은 PostgreSQL 데이터베이스에서 낮은 `max_slot_wal_keep_size` 설정(예: 몇 기가바이트) 때문입니다. 이 값을 증가하는 것을 권장합니다. [여기 섹션]( /integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings) 을 참조하여 `max_slot_wal_keep_size`를 조정하십시오. 이상적으로는 복제 슬롯 무효화를 방지하기 위해 최소한 200GB로 설정해야 합니다.

드물게 `max_slot_wal_keep_size`가 구성되지 않았음에도 이 문제가 발생할 수 있습니다. 이는 PostgreSQL의 복잡하고 드문 버그로 인한 것일 수 있으며, 원인은 여전히 불확실합니다.

### ClickHouse에서 데이터를 수집하는 동안 메모리 부족(OOM)이 발생합니다. 도와주실 수 있습니까? {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse에서 OOM이 발생하는 한 가지 일반적인 원인은 서비스의 규모가 부족하기 때문입니다. 이는 현재 서비스 구성에 데이터 수집 부하를 처리할 수 있는 충분한 리소스(예: 메모리 또는 CPU)가 없다는 것을 의미합니다. ClickPipe 데이터 수집의 요구를 충족하기 위해 서비스의 규모를 늘리는 것을 강력히 권장합니다.

또한 최적화되지 않은 조인이 포함된 하위 물리화된 뷰가 발견된 경우가 있습니다:

- 조인에 대한 일반적인 최적화 기법은 오른쪽 테이블이 매우 큰 경우 `LEFT JOIN`을 사용하는 것입니다. 이 경우 쿼리를 `RIGHT JOIN`으로 다시 작성하여 큰 테이블을 왼쪽으로 이동하십시오. 이렇게 하면 쿼리 플래너가 메모리를 더 효율적으로 사용할 수 있습니다.

- 조인에 대한 또 다른 최적화는 `서브쿼리` 또는 `CTE`를 통해 테이블을 명시적으로 필터링한 다음 이러한 서브쿼리 간에 조인을 수행하는 것입니다. 이것은 플래너에게 행을 효율적으로 필터링하고 조인을 수행하는 방법에 대한 힌트를 제공합니다.

### 초기 로드 중에 `invalid snapshot identifier` 오류가 발생했습니다. 무엇을 해야 합니까? {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier` 오류는 ClickPipes와 Postgres 데이터베이스 간의 연결 중단이 발생할 경우 발생합니다. 이 문제는 게이트웨이 시간 초과, 데이터베이스 재시작 또는 기타 일시적인 문제로 인해 발생할 수 있습니다.

초기 로드 진행 중에는 데이터베이스에서 업그레이드 또는 재시작과 같은 방해 작업을 수행하지 않는 것이 좋으며, 데이터베이스에 대한 네트워크 연결이 안정적인지 확인하십시오.

이 문제를 해결하기 위해 ClickPipes UI에서 재동기화를 트리거할 수 있습니다. 이렇게 하면 초기 로드 프로세스가 처음부터 시작됩니다.

### Postgres에서 출판물을 삭제하면 어떻게 됩니까? {#what-happens-if-i-drop-a-publication-in-postgres}

Postgres에서 출판물을 삭제하면 ClickPipe 연결이 끊깁니다. 출판물은 ClickPipe가 소스에서 변경 사항을 가져오기 위해 필요하기 때문입니다. 이 경우 일반적으로 출판물이 더 이상 존재하지 않는다는 오류 경고를 받게 됩니다.

출판물을 삭제한 후 ClickPipe를 복구하려면:

1. Postgres에서 동일한 이름과 필요한 테이블을 가진 새로운 출판물을 생성합니다.
2. ClickPipe의 설정 탭에서 '테이블 다시 동기화' 버튼을 클릭합니다.

이 재동기화는 다시 생성된 출판물이 Postgres에서 다른 객체 식별자(OID)를 가지기 때문에 필요합니다. 재동기화 프로세스는 대상 테이블을 새로 고치고 연결을 복원합니다.

원하는 경우 완전히 새로운 파이프를 생성할 수도 있습니다.

분할 테이블로 작업 중인 경우 적절한 설정으로 출판물을 생성해야 합니다:

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```

### `Unexpected Datatype` 오류 또는 `Cannot parse type XX ...` 오류가 발생하면 어떻게 됩니까? {#what-if-i-am-seeing-unexpected-datatype-errors}

이 오류는 일반적으로 소스 Postgres 데이터베이스에 데이터 수집 중 매핑할 수 없는 데이터 유형이 있을 때 발생합니다.
보다 구체적인 문제는 아래 가능성을 참조하십시오.

### 복제/슬롯 생성 중에 `invalid memory alloc request size <XXX>`와 같은 오류가 발생했습니다. {#postgres-invalid-memalloc-bug}

Postgres 패치 버전 17.5/16.9/15.13/14.18/13.21에서 특정 작업 부하로 인해 메모리 사용이 급격히 증가하여 Postgres가 유효하지 않은 것으로 간주하는 >1GB의 메모리 할당 요청을 초래하는 버그가 도입되었습니다. 이 버그는 [수정되었습니다](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a) 및 다음 Postgres 패치 시리즈(17.6...)에서 제공될 것입니다. 이 패치 버전이 언제 업그레이드를 받을 수 있는지 Postgres 제공업체에 확인하십시오. 업그레이드가 즉시 가능하지 않다면 오류가 발생할 때 파이프를 재동기화해야 합니다.

### ClickHouse에서 데이터가 삭제되더라도 ClickHouse에 완전한 역사 기록을 유지해야 합니다. Postgres에서 DELETE 및 TRUNCATE 작업을 ClickPipes에서 완전히 무시할 수 있습니까? {#ignore-delete-truncate}

네! Postgres ClickPipe를 생성하기 전에 DELETE 작업이 없는 출판물을 생성하십시오. 예를 들면:
```sql
CREATE PUBLICATION <pub_name> FOR TABLES IN SCHEMA <schema_name> WITH (publish = 'insert,update');
```
그런 다음 Postgres ClickPipe를 [설정하는](https://clickhouse.com/docs/integrations/clickpipes/postgres#configuring-the-replication-settings) 과정에서 이 출판물 이름을 선택하십시오.

TRUNCATE 작업은 ClickPipes에서 무시되며 ClickHouse로 복제되지 않습니다.

### 마침표가 있는 테이블을 복제할 수 없는 이유는 무엇입니까? {#replicate-table-dot}
PeerDB에는 현재 소스 테이블 식별자 - 즉, 스키마 이름 또는 테이블 이름에서 점을 사용하는 것이 복제에서 지원되지 않습니다. 이는 PeerDB가 그렇기 때문에 어떤 것이 스키마이고 어떤 것이 테이블인지 식별할 수 없기 때문입니다.
이 한계를 극복하기 위해 스키마와 테이블을 별도로 입력할 수 있도록 지원하는 노력이 진행 중입니다.

### 초기 로드가 완료되었지만 ClickHouse에 데이터가 없음/누락된 경우 문제는 무엇입니까? {#initial-load-issue}
초기 로드가 오류 없이 완료되었으나 대상 ClickHouse 테이블에 데이터가 누락된 경우, 소스 Postgres 테이블에서 RLS(Row Level Security) 정책이 활성화되어 있을 수 있습니다.
확인해볼 사항:
- 사용자가 소스 테이블을 읽을 수 있는 충분한 권한이 있는지.
- ClickHouse 측에서 행을 필터링할 수도 있는 행 정책이 있는지.

### ClickPipe에서 장애 조치를 활성화된 복제 슬롯을 생성할 수 있습니까? {#failover-slot}
네, CDC 또는 Snapshot + CDC 복제 모드로 Postgres ClickPipe가 ClickPipes에 의해 장애 조치가 활성화된 복제 슬롯을 생성할 수 있습니다. ClickPipe를 생성할 때 `고급 설정` 섹션에서 아래 스위치를 전환하십시오. 이 기능을 사용하려면 Postgres 버전이 17 이상이어야 합니다.

<Image img={failover_slot} border size="md"/>

소스가 해당 설정되어 있다면 슬롯은 Postgres 읽기 복제본으로의 장애 조치 후에도 유지되어 지속적인 데이터 복제를 보장합니다. 자세한 내용은 [여기](https://www.postgresql.org/docs/current/logical-replication-failover.html)를 참조하십시오.

### `Aborted sub-transaction의 논리적 디코딩 중 내부 오류 발생`과 같은 오류가 발생하고 있습니다. {#transient-logical-decoding-errors}

이 오류는 중단된 하위 거래의 논리적 디코딩과 관련된 일시적인 문제를 나타내며, 맞춤형 구현된 Aurora Postgres에 구체적입니다. 오류가 `ReorderBufferPreserveLastSpilledSnapshot` 루틴에서 발생하기 때문에, 이는 논리적 디코딩이 디스크에 스필된 스냅샷을 읽을 수 없음 을 시사합니다. [`logical_decoding_work_mem`](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-LOGICAL-DECODING-WORK-MEM)를 더 높은 값으로 늘려보는 것이 좋습니다.

### CDC 복제 중에 `new tuple to map 변환 오류` 또는 `논리적 메시지 구문 분석 오류`와 같은 오류가 발생합니다. {#logical-message-processing-errors}

Postgres는 변경 사항에 대한 정보를 고정 프로토콜로 메시지 형태로 전송합니다. ClickPipe가 파싱할 수 없는 메시지를 수신할 때 이러한 오류가 발생합니다. 이는 전송 중에 손상되었거나 잘못된 메시지가 전송되었기 때문일 수 있습니다. 정확한 문제는 다양한 경우가 있으나, Neon Postgres 소스에서 발생하는 여러 사례를 보았습니다. Neon에서 이 문제가 발생하는 경우, 그들과 지원 티켓을 raise 하시기 바랍니다. 다른 경우에는 지원 팀에 문의하여 안내를 받으십시오.
