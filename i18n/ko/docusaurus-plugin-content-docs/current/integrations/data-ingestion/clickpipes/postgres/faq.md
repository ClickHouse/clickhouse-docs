---
sidebar_label: 'FAQ'
description: 'ClickPipes for Postgres에 대한 FAQ입니다.'
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
title: 'ClickPipes for Postgres FAQ'
keywords: ['postgres faq', 'clickpipes', 'toast columns', 'replication slot', 'publications']
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';


# Postgres용 ClickPipes FAQ \{#clickpipes-for-postgres-faq\}

### 트랜잭션 롤백도 ClickHouse로 복제됩니까? \{#are-transaction-rollbacks-replicated\}

아니요. CDC는 커밋된 트랜잭션만 복제합니다. 롤백된 트랜잭션은 ClickHouse로 복제되지 않습니다.

### ClickHouse에서 데이터를 Postgres 원본보다 더 오래 보관할 수 있습니까? \{#retain-data-longer-in-clickhouse\}

예. 원본 Postgres와 대상 ClickHouse의 데이터 보존은 서로 독립적입니다. 예를 들어, Postgres에는 최근 3개월치 데이터만 보관하면서 ClickHouse에는 전체 이력을 보관할 수 있습니다. Postgres에서 오래된 행을 삭제하면 ClickHouse로 복제되는 DELETE 이벤트가 생성되므로, 과거 데이터를 보존하려면 [publication](/integrations/clickpipes/postgres/faq#ignore-delete-truncate)에서 DELETE를 제외하거나 쿼리 계층에서 이를 처리해야 합니다.

### Postgres에서 ClickHouse로 데이터가 전송되는 동안 데이터를 어떻게 보강할 수 있습니까? \{#data-enrichment\}

CDC 대상 테이블을 기반으로 [materialized view(구체화된 뷰)](/materialized-view)를 사용하십시오. ClickHouse의 materialized view는 INSERT 트리거처럼 동작하므로, Postgres에서 복제된 각 행을 최종 대상 테이블에 기록하기 전에 변환하거나 조회 테이블과 조인하거나 추가 컬럼을 통해 보강할 수 있습니다.

### 여러 Postgres 인스턴스에서 하나 또는 여러 개의 ClickHouse 서비스로 복제할 수 있습니까? \{#multi-region-multi-source\}

예. 서로 다른 Postgres 인스턴스(서로 다른 AWS 리전 간도 포함)에서 하나 또는 여러 개의 ClickHouse 서비스로 연결되는 개별 ClickPipes를 생성할 수 있습니다. 예를 들어, 지연 시간이 짧은 분석을 위해 지역 Postgres 인스턴스에서 로컬 ClickHouse 클러스터로 데이터를 전송하는 동시에, 통합 리포팅을 위해 다른 리전에 있는 중앙 집중식 ClickHouse 클러스터로도 데이터를 전송할 수 있습니다. 리전 간 구성을 사용하는 경우 AWS 리전 간 데이터 전송 비용과 추가 네트워크 지연 시간이 발생한다는 점을 유의해야 합니다.

### 유휴 상태가 Postgres CDC ClickPipe에 어떤 영향을 미칩니까? \{#how-does-idling-affect-my-postgres-cdc-clickpipe\}

ClickHouse Cloud 서비스가 유휴 상태인 경우에도 Postgres CDC ClickPipe는 데이터를 계속 동기화하며, 서비스는 다음 동기화 주기에 맞춰 수신 데이터를 처리하기 위해 자동으로 다시 활성화됩니다. 동기화가 완료되고 유휴 상태로 전환되는 시점이 되면, 서비스는 다시 유휴 상태로 돌아갑니다.

예를 들어 동기화 주기가 30분이고 서비스 유휴 시간이 10분으로 설정되어 있는 경우, 서비스는 30분마다 깨어나 10분 동안 활성 상태로 동작한 후 다시 유휴 상태로 돌아갑니다.

### ClickPipes for Postgres에서 TOAST 컬럼은 어떻게 처리됩니까? \{#how-are-toast-columns-handled-in-clickpipes-for-postgres\}

자세한 내용은 [TOAST 컬럼 처리](./toast) 페이지를 참조하십시오.

### ClickPipes for Postgres에서 생성된 컬럼은 어떻게 처리됩니까? \{#how-are-generated-columns-handled-in-clickpipes-for-postgres\}

자세한 내용은 [Postgres Generated Columns: 주의사항과 모범 사례](./generated_columns) 페이지를 참고하십시오.

### Postgres CDC에 포함되려면 테이블에 기본 키가 필요합니까? \{#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc\}

ClickPipes for Postgres를 사용하여 테이블을 복제하려면 기본 키(primary key) 또는 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)가 정의되어 있어야 합니다.

* **Primary Key**: 가장 간단한 방법은 테이블에 Primary Key를 정의하는 것입니다. 이는 각 행을 고유하게 식별하는 역할을 하며, 업데이트 및 삭제를 추적하는 데 매우 중요합니다. 이 경우 REPLICA IDENTITY를 `DEFAULT`(기본 동작)로 설정할 수 있습니다.
* **Replica Identity**: 테이블에 Primary Key가 없는 경우 Replica Identity를 설정할 수 있습니다. Replica Identity를 `FULL`로 설정하면 전체 행이 변경 사항을 식별하는 데 사용됩니다. 또는 테이블에 고유 인덱스가 있는 경우 해당 인덱스를 사용하도록 설정한 뒤 REPLICA IDENTITY를 `USING INDEX index_name`으로 설정할 수도 있습니다.
  Replica Identity를 FULL로 설정하려면 다음 SQL 명령을 사용할 수 있습니다:

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL`은(는) 변경되지 않은 TOAST 컬럼까지 복제할 수 있도록 해줍니다. 이에 대한 자세한 내용은 [여기](./toast)를 참고하십시오.

`REPLICA IDENTITY FULL`을 사용하는 경우 성능에 영향을 미칠 수 있으며, 특히 기본 키가 없고 업데이트나 삭제가 빈번한 테이블에서는 WAL 증가 속도가 더 빨라질 수 있습니다. 각 변경 사항마다 더 많은 데이터를 로그에 기록해야 하기 때문입니다. 기본 키나 레플리카 식별자 설정에 대해 확신이 서지 않거나 도움이 필요한 경우 지원 팀에 문의하여 안내를 받으시기 바랍니다.

기본 키도 레플리카 식별자도 정의되어 있지 않으면 ClickPipes는 해당 테이블의 변경 내용을 복제할 수 없으며, 복제 과정에서 오류가 발생할 수 있다는 점을 유의해야 합니다. 따라서 ClickPipe를 설정하기 전에 테이블 스키마를 검토하여 이러한 요구 사항을 충족하는지 확인하는 것이 좋습니다.


### Postgres CDC에서 파티션 테이블을 지원합니까? \{#do-you-support-partitioned-tables-as-part-of-postgres-cdc\}

예, `PRIMARY KEY` 또는 `REPLICA IDENTITY`가 정의되어 있기만 하면 파티션 테이블은 별도 설정 없이 기본적으로 지원됩니다. `PRIMARY KEY`와 `REPLICA IDENTITY`는 부모 테이블과 각 파티션 모두에 존재해야 합니다. 이에 대해 더 자세한 내용은 [여기](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)에서 확인할 수 있습니다.

### 공인 IP가 없거나 프라이빗 네트워크에 있는 Postgres 데이터베이스에 연결할 수 있습니까? \{#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks\}

예. ClickPipes for Postgres는 프라이빗 네트워크에 있는 데이터베이스에 연결하는 두 가지 방법을 제공합니다:

1. **SSH 터널링**
   - 대부분의 사용 사례에 잘 작동합니다
   - 설정 방법은 [여기](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)를 참고하십시오
   - 모든 리전에서 사용할 수 있습니다

2. **AWS PrivateLink**
   - 다음 세 개의 AWS 리전에서 사용할 수 있습니다:
     - us-east-1
     - us-east-2
     - eu-central-1
   - 자세한 설정 방법은 [PrivateLink 문서](/knowledgebase/aws-privatelink-setup-for-clickpipes)를 참고하십시오
   - PrivateLink를 사용할 수 없는 리전에서는 SSH 터널링을 사용하십시오

### UPDATE와 DELETE는 어떻게 처리합니까? \{#how-do-you-handle-updates-and-deletes\}

ClickPipes for Postgres는 Postgres에서 발생하는 INSERT와 UPDATE를 ClickHouse에서 서로 다른 버전의 새로운 행( `_peerdb_` 버전 컬럼 사용)으로 캡처합니다. ReplacingMergeTree 테이블 엔진은 ORDER BY 컬럼으로 구성된 정렬 키를 기준으로 백그라운드에서 주기적으로 중복 제거를 수행하며, 최신 `_peerdb_` 버전을 가진 행만 유지합니다.

Postgres의 DELETE는 삭제되었음을 표시하는 새로운 행( `_peerdb_is_deleted` 컬럼 사용)으로 전파됩니다. 중복 제거 과정은 비동기적으로 수행되므로 일시적으로 중복된 행이 보일 수 있습니다. 이를 처리하려면 쿼리 계층에서 중복 제거를 수행해야 합니다.

또한 기본적으로 Postgres는 DELETE 작업 중 기본 키 또는 replica identity에 포함되지 않은 컬럼의 값은 전송하지 않습니다. DELETE 시 전체 행 데이터를 캡처하려면 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)를 FULL로 설정하면 됩니다.

자세한 내용은 다음을 참고하십시오.

* [ReplacingMergeTree 테이블 엔진 모범 사례](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres-to-ClickHouse CDC 동작 원리 블로그](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### PostgreSQL에서 기본 키 컬럼을 업데이트할 수 있습니까? \{#can-i-update-primary-key-columns-in-postgresql\}

:::warning
기본 키 업데이트는 기본적으로 ClickHouse에 올바르게 반영될 수 없습니다.

이 제한은 `ReplacingMergeTree` 중복 제거가 `ORDER BY` 컬럼(일반적으로 기본 키에 해당)에 기반해 동작하기 때문입니다. PostgreSQL에서 기본 키가 업데이트되면 기존 행이 수정된 것으로 처리되는 것이 아니라, ClickHouse에서는 다른 키를 가진 새로운 행으로 나타납니다. 이로 인해 ClickHouse 테이블에 이전 기본 키 값과 새로운 기본 키 값이 모두 존재하게 될 수 있습니다.
:::

PostgreSQL 데이터베이스 설계에서는 기본 키가 변경 불가능한 식별자로 사용되므로, 기본 키 컬럼을 업데이트하는 것은 일반적인 관행이 아님을 유의해야 합니다. 대부분의 애플리케이션은 설계 단계에서 기본 키 업데이트를 피하도록 되어 있어, 이 제한이 일반적인 사용 사례에서 문제로 드러나는 일은 드뭅니다.

기본 키 업데이트 처리를 가능하게 하는 실험적 설정이 있지만, 상당한 성능 저하를 유발할 수 있으며 신중한 검토 없이 프로덕션 환경에서 사용하는 것은 권장되지 않습니다.

PostgreSQL에서 기본 키 컬럼을 업데이트해야 하고 그러한 변경 사항이 ClickHouse에 올바르게 반영되어야 하는 사용 사례가 있는 경우, 구체적인 요구 사항과 가능한 해결책을 논의하기 위해 [db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com)으로 지원 팀에 문의하시기 바랍니다.

### 스키마 변경을 지원하나요? \{#do-you-support-schema-changes\}

자세한 내용은 [ClickPipes for Postgres: Schema Changes Propagation Support](./schema-changes) 페이지를 참조하십시오.

### ClickPipes for Postgres CDC 비용은 어떻게 되나요? \{#what-are-the-costs-for-clickpipes-for-postgres-cdc\}

자세한 가격 정보는 [요금 청구 개요 메인 페이지의 ClickPipes for Postgres CDC 가격 섹션](/cloud/reference/billing/clickpipes)을 참조하십시오.

### 내 replication slot 크기가 계속 커지거나 줄어들지 않습니다. 어떤 문제가 있을 수 있습니까? \{#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue\}

Postgres replication slot의 크기가 계속 증가하거나 줄어들지 않는다면, 일반적으로 **WAL(Write-Ahead Log) 레코드가 CDC 파이프라인이나 복제 프로세스에 의해 충분히 빠르게 소비(또는 「재생」)되지 않고 있다는 의미**입니다. 아래는 가장 흔한 원인과 이를 해결하는 방법입니다.

1. **데이터베이스 활동의 급격한 증가**
   - 대규모 배치 업데이트, 대량 insert, 큰 스키마 변경 등은 짧은 시간에 많은 WAL 데이터를 생성할 수 있습니다.
   - replication slot은 이러한 WAL 레코드가 소비될 때까지 유지하므로, 일시적으로 슬롯 크기가 크게 증가할 수 있습니다.

2. **장시간 실행 중인 트랜잭션**
   - 열려 있는 트랜잭션은 해당 트랜잭션이 시작된 이후 생성된 모든 WAL 세그먼트를 Postgres가 유지하도록 강제하며, 이로 인해 슬롯 크기가 크게 증가할 수 있습니다.
   - 트랜잭션이 무기한 열려 있는 상태로 남지 않도록 `statement_timeout`과 `idle_in_transaction_session_timeout`을 적절한 값으로 설정하십시오:
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
     이 쿼리를 사용하여 비정상적으로 오래 실행 중인 트랜잭션을 식별하십시오.

3. **유지 관리 또는 유틸리티 작업(예: `pg_repack`)**
   - `pg_repack`과 같은 도구는 전체 테이블을 다시 쓸 수 있으며, 짧은 시간에 대량의 WAL 데이터를 생성할 수 있습니다.
   - 이러한 작업은 트래픽이 적은 시간대에 스케줄링하거나, 실행 중에 WAL 사용량을 면밀히 모니터링하십시오.

4. **VACUUM 및 VACUUM ANALYZE**
   - 데이터베이스 상태를 위해 필수적이지만, 특히 대형 테이블을 스캔하는 경우 이 작업들이 추가 WAL 트래픽을 유발할 수 있습니다.
   - autovacuum 튜닝 파라미터를 사용하거나, 수동 VACUUM 작업을 비피크 시간대에 스케줄링하는 것을 고려하십시오.

5. **replication consumer가 슬롯을 적극적으로 읽지 않는 경우**
   - CDC 파이프라인(예: ClickPipes)이나 다른 replication consumer가 중지되거나, 일시 정지되거나, 크래시하는 경우 WAL 데이터가 슬롯에 계속 누적됩니다.
   - 파이프라인이 지속적으로 실행 중인지 확인하고, 연결 문제나 인증 오류가 있는지 로그를 확인하십시오.

이 주제에 대한 심층적인 설명은 다음 블로그 게시물을 참고하십시오: [Overcoming Pitfalls of Postgres Logical Decoding](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it).

### Postgres 데이터 타입은 ClickHouse에 어떻게 매핑되나요? \{#how-are-postgres-data-types-mapped-to-clickhouse\}

ClickPipes for Postgres는 Postgres 데이터 타입을 ClickHouse에서 가능한 한 기본(native) 타입에 가깝게 매핑하는 것을 목표로 합니다. 이 문서는 각 데이터 타입과 해당 매핑의 전체 목록을 제공합니다: [Data Type Matrix](https://docs.peerdb.io/datatypes/datatype-matrix).

### Postgres에서 ClickHouse로 데이터를 복제할 때 사용자 정의 데이터 타입 매핑을 정의할 수 있습니까? \{#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse\}

현재는 파이프 내에서 사용자 정의 데이터 타입 매핑을 정의하는 기능을 지원하지 않습니다. 다만 ClickPipes에서 사용하는 기본 데이터 타입 매핑은 ClickHouse의 네이티브 타입을 최대한 활용하도록 설계되어 있습니다. Postgres의 대부분 컬럼 타입은 ClickHouse의 네이티브 타입과 최대한 가깝게 복제됩니다. 예를 들어, Postgres의 정수형 배열 타입은 ClickHouse에서도 정수형 배열 타입으로 복제됩니다.

### Postgres에서 JSON 및 JSONB 컬럼은 어떻게 복제됩니까? \{#how-are-json-and-jsonb-columns-replicated-from-postgres\}

JSON 및 JSONB 컬럼은 ClickHouse에서 String 타입으로 복제됩니다. ClickHouse는 네이티브 [JSON 타입](/sql-reference/data-types/newjson)을 지원하므로, 필요한 경우 변환을 수행하기 위해 ClickPipes 테이블에 materialized view를 생성할 수 있습니다. 또는 String 컬럼에 대해 [JSON 함수](/sql-reference/functions/json-functions)를 직접 사용할 수도 있습니다. 현재 JSON 및 JSONB 컬럼을 ClickHouse의 JSON 타입으로 직접 복제하는 기능을 적극적으로 개발 중입니다. 이 기능은 향후 몇 개월 내에 제공될 예정입니다.

### 미러가 일시 중지되면 insert는 어떻게 처리됩니까? \{#what-happens-to-inserts-when-a-mirror-is-paused\}

미러를 일시 중지하면, 메시지는 소스 Postgres의 replication slot에 대기열로 쌓여 버퍼링되며 유실되지 않도록 보관됩니다. 다만, 미러를 일시 중지했다가 다시 재개하면 연결을 다시 설정해야 하므로, 소스 환경에 따라 시간이 다소 걸릴 수 있습니다.

이 과정 동안 sync(Postgres에서 데이터를 가져와 ClickHouse raw 테이블로 스트리밍)와 normalize(raw 테이블에서 target 테이블로 변환) 작업은 모두 중단됩니다. 그러나 이들은 안정적으로 재개하는 데 필요한 상태를 유지합니다.

- sync의 경우, 중간에 취소되면 Postgres의 `confirmed_flush_lsn`이 앞으로 진행되지 않으므로, 다음 sync는 중단되었던 것과 동일한 위치에서 다시 시작되어 데이터 일관성이 보장됩니다.
- normalize의 경우, ReplacingMergeTree의 insert 순서 특성이 중복 제거를 처리합니다.

정리하면, 일시 중지 동안 sync와 normalize 프로세스는 종료되지만, 데이터 손실이나 불일치 없이 안전하게 다시 재개할 수 있습니다.

### ClickPipe 생성을 자동화하거나 API 또는 CLI를 통해 수행할 수 있습니까? \{#can-clickpipe-creation-be-automated-or-done-via-api-or-cli\}

Postgres ClickPipe는 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 엔드포인트를 통해 생성하고 관리할 수도 있습니다. 이 기능은 현재 베타 단계이며, API 참고 문서는 [여기](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta)에서 확인할 수 있습니다. Postgres ClickPipes 생성을 위한 Terraform 지원도 적극적으로 개발 중입니다.

### 초기 로드를 어떻게 더 빠르게 진행할 수 있습니까? \{#how-do-i-speed-up-my-initial-load\}

이미 실행 중인 초기 로드는 더 빠르게 할 수 없습니다. 그러나 일부 설정을 조정하여 향후 초기 로드를 최적화할 수 있습니다. 기본적으로 설정은 4개의 병렬 스레드와 파티션당 스냅샷 행 수가 100,000으로 설정되어 있습니다. 이는 고급 설정이며 대부분의 사용 사례에 충분합니다.

Postgres 13 이하 버전에서는 CTID 범위 스캔이 매우 느리기 때문에 ClickPipes는 이를 사용하지 않습니다. 대신 전체 테이블을 단일 파티션으로 읽어 사실상 단일 스레드로 처리합니다(따라서 파티션당 행 수와 병렬 스레드 설정은 모두 무시됩니다). 이 경우 초기 로드를 더 빠르게 하려면 `snapshot number of tables in parallel` 값을 늘리거나, 대용량 테이블에 대해 인덱스가 생성된 사용자 지정 파티션 컬럼을 지정하면 됩니다.

### 복제를 설정할 때 publication 범위는 어떻게 지정해야 합니까? \{#how-should-i-scope-my-publications-when-setting-up-replication\}

ClickPipes가 publication을 관리하도록 설정할 수 있으며(추가 권한 필요), 직접 생성할 수도 있습니다. ClickPipes가 publication을 관리하는 경우, 파이프를 편집할 때 테이블 추가 및 제거를 자동으로 처리합니다. 직접 관리하는 경우, 복제해야 하는 테이블만 포함되도록 publication 범위를 신중하게 설정해야 합니다. 불필요한 테이블을 포함하면 Postgres WAL 디코딩 속도가 느려집니다.

어떤 테이블이든 publication에 포함하는 경우, 해당 테이블에 기본 키(primary key) 또는 `REPLICA IDENTITY FULL`이 반드시 설정되어 있어야 합니다. 기본 키가 없는 테이블이 있는 상태에서 전체 테이블에 대한 publication을 생성하면, 해당 테이블에서 DELETE 및 UPDATE 연산이 실패하게 됩니다.

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

기본 키가 없는 테이블을 처리하는 방법은 두 가지가 있습니다:

1. **기본 키가 없는 테이블을 ClickPipes에서 제외하기**:
   기본 키가 있는 테이블만 포함하여 publication을 생성합니다:
   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **기본 키가 없는 테이블을 ClickPipes에 포함하기**:
   기본 키가 없는 테이블을 포함하려면, 해당 테이블의 replica identity를 `FULL`로 변경해야 합니다. 이렇게 하면 UPDATE 및 DELETE 연산이 올바르게 동작합니다:
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
ClickPipes가 publication을 관리하도록 두지 않고 수동으로 publication을 생성하는 경우, publication을 `FOR ALL TABLES`로 생성하는 것은 권장하지 않습니다. 이렇게 하면 파이프에 포함되지 않은 다른 테이블의 변경 내용까지도 전송하게 되어 Postgres에서 ClickPipes로의 트래픽이 증가하고 전체 효율성이 저하됩니다.

수동으로 생성한 publication의 경우, 파이프에 테이블을 추가하기 전에 publication에 포함하려는 테이블을 모두 먼저 추가하십시오.
:::

:::warning
Postgres read replica/hot standby에서 레플리케이션을 수행하는 경우, 기본(primary) 인스턴스에서 직접 publication을 생성해야 하며, 이 publication은 standby로 자동 전파됩니다. standby에서는 publication을 생성할 수 없으므로, 이 경우 ClickPipe는 publication을 관리할 수 없습니다.
:::


### 권장 `max_slot_wal_keep_size` 설정 \{#recommended-max_slot_wal_keep_size-settings\}

- **최소:** WAL 데이터를 최소 **2일치** 보관하도록 [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE)를 설정합니다.
- **대규모 데이터베이스(트랜잭션 양이 많은 경우):** 하루 기준 최대 WAL 생성량의 **2~3배 이상**을 보관합니다.
- **스토리지 제약이 있는 환경:** 복제 안정성을 유지하는 범위 내에서 **디스크 고갈을 피할 수 있도록** 보수적으로 튜닝합니다.

#### 올바른 값을 계산하는 방법 \{#how-to-calculate-the-right-value\}

적절한 설정값을 결정하려면 WAL 생성 속도를 측정합니다:

##### PostgreSQL 10 이상 \{#for-postgresql-10\}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```


##### PostgreSQL 9.6 및 그 이전 버전: \{#for-postgresql-96-and-below\}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 해당 쿼리를 하루 중 서로 다른 시점, 특히 트랜잭션이 많은 시간대에 실행합니다.
* 24시간 동안 생성되는 WAL 양을 계산합니다.
* 충분한 보존을 위해 해당 수치에 2 또는 3을 곱합니다.
* 계산된 값을 MB 또는 GB 단위로 `max_slot_wal_keep_size`에 설정합니다.


##### 예시 \{#example\}

데이터베이스가 하루에 100 GB의 WAL을 생성한다면 다음과 같이 설정합니다:

```sql
max_slot_wal_keep_size = 200GB
```


### 로그에서 ReceiveMessage EOF 오류가 발생합니다. 무엇을 의미하나요? \{#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean\}

`ReceiveMessage`는 Postgres 논리 디코딩 프로토콜에서 복제 스트림(replication stream)의 메시지를 읽는 함수입니다. EOF(End of File) 오류는 복제 스트림에서 읽기를 시도하는 동안 Postgres 서버와의 연결이 예기치 않게 종료되었음을 나타냅니다.

이는 복구 가능하며 전혀 치명적이지 않은 오류입니다. ClickPipes는 자동으로 재연결을 시도한 뒤 복제(replication) 프로세스를 이어서 수행합니다.

이 오류는 여러 가지 이유로 발생할 수 있습니다:

- **낮은 wal_sender_timeout:** `wal_sender_timeout` 값을 최소 5분 이상으로 설정해야 합니다. 이 설정은 서버가 연결을 종료하기 전에 클라이언트의 응답을 얼마나 오래 기다리는지를 제어합니다. 타임아웃이 너무 낮으면 연결이 조기에 끊어질 수 있습니다.
- **네트워크 문제:** 일시적인 네트워크 장애로 인해 연결이 끊길 수 있습니다.
- **Postgres 서버 재시작:** Postgres 서버가 재시작되거나 비정상 종료되는 경우 연결이 끊어집니다.

### replication 슬롯이 무효화되었습니다. 어떻게 해야 하나요? \{#my-replication-slot-is-invalidated-what-should-i-do\}

ClickPipe를 복구하는 유일한 방법은 Settings 페이지에서 resync를 실행하는 것입니다.

replication 슬롯이 무효화되는 가장 일반적인 원인은 PostgreSQL 데이터베이스에서 `max_slot_wal_keep_size` 설정값이 너무 낮게 (예: 몇 기가바이트 수준으로) 지정된 경우입니다. 이 값을 증가시키는 것이 좋습니다. `max_slot_wal_keep_size` 튜닝 방법은 [이 섹션을 참조하십시오](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings). 이상적으로는 replication 슬롯 무효화를 방지하기 위해 최소 200GB 이상으로 설정하는 것이 좋습니다.

드문 경우이지만, `max_slot_wal_keep_size`가 설정되어 있지 않은 상황에서도 이 문제가 발생한 사례가 있습니다. 이는 PostgreSQL의 복잡하고 희귀한 버그 때문일 수 있으나, 정확한 원인은 아직 명확하지 않습니다.

### ClickPipe가 데이터를 수집하는 동안 ClickHouse에서 out of memory(OOM) 오류가 발생합니다. 도와줄 수 있나요? \{#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help\}

ClickHouse에서 OOM이 발생하는 일반적인 이유 중 하나는 서비스 규모가 부족한 경우입니다. 이는 현재 서비스 구성이 수집 부하를 효과적으로 처리하기에 충분한 리소스(예: 메모리 또는 CPU)를 보유하지 못하고 있음을 의미합니다. ClickPipe 데이터 수집 요구 사항을 충족할 수 있도록 서비스를 확장할 것을 강력히 권장합니다.

또 다른 흔한 원인은 하위에 존재하는 materialized view(Materialized View)에 최적화되지 않은 조인이 포함된 경우입니다.

- 조인에 대한 일반적인 최적화 기법 중 하나는 오른쪽 테이블의 크기가 매우 큰 `LEFT JOIN`이 있는 경우입니다. 이때 쿼리를 `RIGHT JOIN`을 사용하도록 다시 작성하고, 더 큰 테이블을 왼쪽에 두는 방식으로 변경하십시오. 이렇게 하면 쿼리 플래너가 메모리를 더 효율적으로 사용할 수 있습니다.

- 조인에 대한 또 다른 최적화 방법은 `subqueries` 또는 `CTEs`를 통해 테이블을 명시적으로 필터링한 다음, 이러한 subqueries 간에 `JOIN`을 수행하는 것입니다. 이렇게 하면 플래너에 행을 효율적으로 필터링하고 `JOIN`을 수행하는 방법에 대한 힌트를 제공할 수 있습니다.

### 초기 로드 중에 `invalid snapshot identifier` 오류가 발생합니다. 어떻게 해야 하나요? \{#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do\}

`invalid snapshot identifier` 오류는 ClickPipes와 Postgres 데이터베이스 사이의 연결이 끊어졌을 때 발생합니다. 게이트웨이 타임아웃, 데이터베이스 재시작 또는 기타 일시적인 문제로 인해 발생할 수 있습니다.

초기 로드(Initial Load)가 진행 중일 때는 Postgres 데이터베이스에서 업그레이드나 재시작과 같이 중단을 유발하는 작업을 수행하지 않아야 하며, 데이터베이스에 대한 네트워크 연결이 안정적인지 확인해야 합니다.

이 문제를 해결하려면 ClickPipes UI에서 재동기화(resync)를 실행하십시오. 이렇게 하면 초기 로드 프로세스가 처음부터 다시 시작됩니다.

### Postgres에서 publication을 삭제하면 어떻게 되나요? \{#what-happens-if-i-drop-a-publication-in-postgres\}

Postgres에서 publication을 삭제하면 ClickPipe가 소스에서 변경 사항을 가져오는 데 해당 publication이 필요하므로 ClickPipe 연결이 끊어집니다. 이 경우 일반적으로 publication이 더 이상 존재하지 않는다는 내용의 오류 알림을 받게 됩니다.

publication을 삭제한 후 ClickPipe를 복구하려면 다음 단계를 수행하십시오:

1. Postgres에서 동일한 이름과 필요한 테이블을 포함한 새 publication을 생성합니다.
2. ClickPipe의 Settings 탭에서 &#39;Resync tables&#39; 버튼을 클릭합니다.

재생성된 publication은 이름이 같더라도 Postgres에서 Object Identifier(OID)가 달라지므로, 이 재동기화 작업이 필요합니다. 재동기화 과정은 대상 테이블을 갱신하고 연결을 복원합니다.

원하는 경우 완전히 새로운 pipe를 생성해도 됩니다.

또한 파티션된 테이블을 사용하는 경우, publication을 생성할 때 적절한 설정을 사용했는지 반드시 확인하십시오:

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```


### `Unexpected Datatype` 오류나 `Cannot parse type XX ...` 오류가 발생하면 어떻게 하나요? \{#what-if-i-am-seeing-unexpected-datatype-errors\}

이 오류는 일반적으로 소스 Postgres 데이터베이스에 수집 과정에서 매핑할 수 없는 데이터 타입이 있을 때 발생합니다.
보다 구체적인 문제에 대해서는 아래에 나열된 가능한 원인을 참고하십시오.

### 복제/슬롯 생성 중에 `invalid memory alloc request size <XXX>`와 같은 오류가 발생합니다 \{#postgres-invalid-memalloc-bug\}

Postgres 패치 버전 17.5/16.9/15.13/14.18/13.21에서 도입된 버그로 인해, 특정 워크로드에서 메모리 사용량이 기하급수적으로 증가하면서 1GB를 초과하는 메모리 할당 요청이 발생할 수 있으며, Postgres는 이를 잘못된 요청으로 간주합니다. 이 버그는 [이미 수정되었으며](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a), 다음 Postgres 패치 시리즈(17.6...)에 포함될 예정입니다. 해당 패치 버전이 언제 업그레이드용으로 제공되는지 Postgres 제공자에게 확인하십시오. 업그레이드를 즉시 수행할 수 없는 경우, 오류가 발생하는 시점에 파이프를 다시 동기화(resync)해야 합니다.

### 원본 Postgres 데이터베이스에서 데이터가 삭제되더라도 ClickHouse에는 완전한 이력 기록을 유지해야 합니다. ClickPipes에서 Postgres의 DELETE 및 TRUNCATE 작업을 완전히 무시하도록 설정할 수 있습니까? \{#ignore-delete-truncate\}

네, 가능합니다. Postgres ClickPipe를 생성하기 전에 DELETE 작업이 포함되지 않은 publication을 먼저 생성하십시오. 예를 들면 다음과 같습니다.

```sql
CREATE PUBLICATION <pub_name> FOR TABLES IN SCHEMA <schema_name> WITH (publish = 'insert,update');
```

이후 Postgres ClickPipe를 [설정](https://clickhouse.com/docs/integrations/clickpipes/postgres#configuring-the-replication-settings)할 때 해당 publication 이름이 선택되었는지 확인하십시오.

TRUNCATE 작업은 ClickPipes에서 무시되며 ClickHouse로 복제되지 않습니다.


### 테이블 이름에 점이 있어서 복제할 수 없는 이유는 무엇입니까? \{#replicate-table-dot\}

PeerDB에는 현재 소스 테이블 식별자(스키마 이름 또는 테이블 이름)에 점(`.`)이 포함된 경우 복제를 지원하지 않는 제한 사항이 있습니다. PeerDB는 점(`.`)을 기준으로 분리하기 때문에, 이 경우 어떤 부분이 스키마이고 어떤 부분이 테이블인지 식별할 수 없습니다.
이 제한을 우회하기 위해 스키마와 테이블을 별도로 입력할 수 있도록 지원하는 작업이 진행 중입니다.

### Initial load completed but there is no/missing data on ClickHouse. What could be the issue? \{#initial-load-issue\}

초기 로드가 오류 없이 완료되었는데도 대상 ClickHouse 테이블에 데이터가 없거나 일부가 누락된 경우, 소스 Postgres 테이블에 RLS(Row Level Security, 행 수준 보안) 정책이 활성화되어 있을 수 있습니다.
다음 사항도 함께 확인하십시오.

- 사용자에게 소스 테이블을 조회할 수 있는 충분한 권한이 있는지 확인합니다.
- ClickHouse 쪽에 행 정책이 설정되어 있어 행이 필터링되고 있지 않은지 확인합니다.

### ClickPipe에서 장애 조치(failover)를 지원하는 replication slot을 생성할 수 있습니까? \{#failover-slot\}

예. Postgres용 ClickPipe에서 복제 모드를 CDC 또는 Snapshot + CDC로 설정한 경우, ClickPipe를 생성할 때 `Advanced Settings` 섹션에서 아래 스위치를 전환하면 장애 조치(failover)가 활성화된 replication slot을 ClickPipes가 생성하도록 설정할 수 있습니다. 이 기능을 사용하려면 Postgres 버전이 17 이상이어야 합니다.

<Image img={failover_slot} border size="md"/>

소스가 이에 맞게 구성되어 있으면, Postgres 읽기 레플리카로 장애 조치가 발생한 이후에도 슬롯이 유지되어 데이터 복제가 계속해서 이루어집니다. 자세한 내용은 [여기](https://www.postgresql.org/docs/current/logical-replication-failover.html)를 참조하십시오.

### `Internal error encountered during logical decoding of aborted sub-transaction`와 같은 오류가 발생합니다 \{#transient-logical-decoding-errors\}

이 오류는 중단된 서브 트랜잭션의 논리 디코딩(logical decoding)에 일시적인 문제가 있음을 의미하며, Aurora Postgres의 커스텀 구현에 특화된 현상입니다. 오류가 `ReorderBufferPreserveLastSpilledSnapshot` 루틴에서 발생하는 것으로 보아, 논리 디코딩이 디스크로 spill된 스냅샷을 읽지 못하고 있음을 시사합니다. [`logical_decoding_work_mem`](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-LOGICAL-DECODING-WORK-MEM)을 더 큰 값으로 늘려 보는 것이 도움이 될 수 있습니다.

### CDC 복제 중에 `error converting new tuple to map` 또는 `error parsing logical message`와 같은 오류가 발생합니다 \{#logical-message-processing-errors\}

Postgres는 변경 사항에 대한 정보를 고정된 프로토콜을 사용하는 메시지 형식으로 전송합니다. 이러한 오류는 전송 중 손상되었거나 유효하지 않은 메시지가 전송되는 등 ClickPipe가 파싱할 수 없는 메시지를 수신할 때 발생합니다. 구체적인 원인은 상황마다 다를 수 있지만, Neon Postgres 소스에서 여러 차례 관찰되었습니다. Neon에서 동일한 문제가 발생하는 경우에는 Neon 측에 지원 티켓을 등록해 주시기 바랍니다. 그 외의 경우에는 ClickHouse 지원팀에 문의하여 안내를 받으십시오.

### 처음에 복제 대상에서 제외한 컬럼을 나중에 포함할 수 있습니까? \{#include-excluded-columns\}

현재는 지원되지 않습니다. 우회 방법으로는 포함하려는 컬럼이 있는 테이블을 [다시 동기화(resync)](./table_resync.md)하는 방법이 있습니다.

### ClickPipe가 Snapshot 단계로 진입했는데 데이터가 들어오지 않습니다. 어떤 문제가 있을 수 있습니까? \{#snapshot-no-data-flow\}

여러 가지 원인이 있을 수 있으나, 주로 스냅샷을 수행하기 위한 몇 가지 선행 조건을 충족하는 데 평소보다 시간이 더 오래 걸릴 때 발생합니다. 자세한 내용은 병렬 스냅샷(parallel snapshotting)에 대한 문서를 [여기](./parallel_initial_load.md)에서 참조하십시오.

#### 병렬 스냅샷 생성에 파티션을 확보하는 데 시간이 오래 걸립니다 \{#parallel-snapshotting-taking-time\}

병렬 스냅샷 생성에는 테이블에 대한 논리적 파티션을 확보하기 위한 몇 가지 초기 단계가 있습니다. 테이블이 작은 경우에는 몇 초 안에 완료되지만, 매우 큰(테라바이트 수준의) 테이블에서는 더 오래 걸릴 수 있습니다. **Source** 탭에서 Postgres 소스에서 실행 중인 쿼리를 모니터링하여, 스냅샷 생성을 위한 파티션 확보와 관련해 오래 실행되는 쿼리가 있는지 확인할 수 있습니다. 파티션이 확보되면 데이터가 유입되기 시작합니다.

#### 복제 슬롯 생성이 트랜잭션 잠금 상태입니다 \{#replication-slot-creation-transaction-locked\}

**Source** 탭의 Activity 섹션에서 `CREATE_REPLICATION_SLOT` 쿼리가 `Lock` 상태에 머물러 있는 것을 확인할 수 있습니다. 이는 Postgres가 복제 슬롯을 생성하는 데 사용하는 객체에 다른 트랜잭션이 잠금을 보유하고 있기 때문에 발생할 수 있습니다.
차단(블로킹) 쿼리를 확인하려면 Postgres 소스에서 아래 쿼리를 실행하십시오:

```sql
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query,
  blocking.state AS blocking_state
FROM pg_locks blocked_lock
JOIN pg_stat_activity blocked
  ON blocked_lock.pid = blocked.pid
JOIN pg_locks blocking_lock
  ON blocking_lock.locktype = blocked_lock.locktype
  AND blocking_lock.database IS NOT DISTINCT FROM blocked_lock.database
  AND blocking_lock.relation IS NOT DISTINCT FROM blocked_lock.relation
  AND blocking_lock.page IS NOT DISTINCT FROM blocked_lock.page
  AND blocking_lock.tuple IS NOT DISTINCT FROM blocked_lock.tuple
  AND blocking_lock.virtualxid IS NOT DISTINCT FROM blocked_lock.virtualxid
  AND blocking_lock.transactionid IS NOT DISTINCT FROM blocked_lock.transactionid
  AND blocking_lock.classid IS NOT DISTINCT FROM blocked_lock.classid
  AND blocking_lock.objid IS NOT DISTINCT FROM blocked_lock.objid
  AND blocking_lock.objsubid IS NOT DISTINCT FROM blocked_lock.objsubid
  AND blocking_lock.pid != blocked_lock.pid
JOIN pg_stat_activity blocking
  ON blocking_lock.pid = blocking.pid
WHERE NOT blocked_lock.granted;
```

차단 중인 쿼리를 확인한 후, 해당 쿼리의 중요도를 판단하여 완료되기를 기다릴지, 중요하지 않다면 취소할지를 결정합니다. 차단 쿼리가 해소되면 복제 슬롯(replication slot) 생성이 정상적으로 진행되어 스냅샷이 시작되고 데이터가 유입되기 시작합니다.
