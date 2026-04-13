---
sidebar_label: '문제 해결 및 모범 사례'
slug: /integrations/fivetran/troubleshooting
sidebar_position: 4
description: 'Fivetran ClickHouse 대상에서 발생하는 일반적인 오류, 디버깅 팁, 모범 사례를 설명합니다.'
title: '문제 해결 및 모범 사례'
doc_type: 'guide'
keywords: ['Fivetran', 'ClickHouse destination', '문제 해결', '모범 사례', '디버깅']
---

# 문제 해결 및 모범 사례 \{#troubleshooting-best-practices\}

## 자주 발생하는 오류 \{#common-errors\}

### 권한 관련 Grants 테스트가 실패하거나 작업이 실패하는 경우 \{#grants-test-failed\}

**오류 메시지:**

```sh
Test grants failed, cause: user is missing the required grants on *.*: ALTER, CREATE DATABASE, CREATE TABLE, INSERT, SELECT
```

**원인:** Fivetran 사용자에게 필요한 권한이 없습니다. 이 커넥터를 사용하려면 `*.*`(모든 데이터베이스 및 테이블)에 대해 `ALTER`, `CREATE DATABASE`, `CREATE TABLE`, `INSERT`, `SELECT` 권한이 부여되어 있어야 합니다.

:::note
권한 확인 시 `system.grants`를 조회하며, 사용자에게 직접 부여된 권한만 확인합니다. ClickHouse 역할을 통해 할당된 권한은 감지되지 않습니다. 자세한 내용은 [역할 기반 권한 부여](/integrations/fivetran/troubleshooting#role-based-grants) 섹션을 참조하십시오.
:::

**해결 방법:**

필요한 권한을 Fivetran 사용자에게 직접 부여하십시오:

```sql
GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

### 모든 뮤테이션이 완료될 때까지 기다리는 동안 오류 발생 \{#mutations-not-completed\}

**오류 메시지:**

```sh
error while waiting for all mutations to be completed: ... initial cause: ...
```

**원인:** `ALTER TABLE ... UPDATE` 또는 `ALTER TABLE ... DELETE` 뮤테이션이 제출되었지만, 커넥터가 모든 레플리카에서 해당 작업이 완료될 때까지 기다리는 중 시간 초과가 발생했습니다. 오류의 &quot;initial cause&quot; 부분에는 원래 ClickHouse 오류(대개 코드 341, &quot;Unfinished&quot;)가 포함되는 경우가 많습니다.

다음과 같은 경우 이런 문제가 발생할 수 있습니다:

* ClickHouse Cloud 클러스터에 부하가 많이 걸려 있습니다.
* 뮤테이션 실행 중 하나 이상의 노드가 다운되었습니다.

**해결 방법:**

1. **뮤테이션 진행 상태 확인**: 완료되지 않은 뮤테이션이 있는지 확인하려면 다음 쿼리를 실행하십시오:
   ```sql
   SELECT database, table, mutation_id, command, create_time, is_done
   FROM system.mutations
   WHERE NOT is_done
   ORDER BY create_time DESC;
   ```
2. **클러스터 상태 확인**: 모든 노드가 정상 상태인지 확인하십시오.
3. **기다린 후 再試行**: 클러스터가 정상 상태로 복구되면 뮤테이션은 결국 완료됩니다. Fivetran이 동기화를 자동으로 再試行합니다.

### 컬럼 불일치 오류 \{#column-mismatch-error\}

**오류 메시지:**

소스의 schema 변경으로 인해 컬럼 불일치가 발생하면 다양한 오류가 나타날 수 있습니다. 예시:

```sh
columns count in ClickHouse table (8) does not match the input file (6). Expected columns: id, name, ..., got: id, name, ...
```

또는:

```sh
column user_email was not found in the table definition. Table columns: ...; input file columns: ...
```

**원인:** ClickHouse 대상 테이블의 컬럼이 동기화 중인 데이터의 컬럼과 일치하지 않습니다. 이는 다음과 같은 경우에 발생할 수 있습니다.

* ClickHouse 테이블에 컬럼을 수동으로 추가하거나 제거한 경우
* 소스의 schema 변경 사항이 제대로 반영되지 않은 경우

**해결 방법:**

1. **Fivetran이 관리하는 테이블은 수동으로 수정하지 마십시오.** [모범 사례](/integrations/fivetran/troubleshooting#dont-modify-tables)를 참조하십시오.
2. **컬럼을 원래대로 변경**: 컬럼이 어떤 유형이어야 하는지 알고 있다면, [type transformation mapping](/integrations/fivetran/reference#type-mapping)을 참고하여 해당 컬럼을 예상된 유형으로 다시 변경하십시오.
3. **테이블 재동기화**: Fivetran 대시보드에서 영향을 받는 테이블에 대해 전체 기간 재동기화를 실행하십시오.
4. **삭제 후 다시 생성**: 최후의 수단으로 대상 테이블을 삭제하고, 다음 동기화 시 Fivetran이 다시 생성하도록 하십시오.

### AST가 너무 큽니다 (코드 168) \{#ast-too-big\}

**오류 메시지:**

```sh
code: 168, message: AST is too big. Maximum: 50000
```

또는

```sh
code: 62, message: Max query size exceeded
```

**원인:** 대규모 UPDATE 또는 DELETE 배치로 인해 매우 복잡한 추상 구문 트리를 가진 SQL 문이 생성됩니다. Wide 테이블이거나 히스토리 모드가 활성화된 경우에 흔히 발생합니다.

**해결 방법:**

[고급 설정](/integrations/fivetran/reference#advanced-configuration) 파일에서 `mutation_batch_size`와 `hard_delete_batch_size` 값을 낮추십시오. 두 값 모두 기본값은 `1500`이며, `200`~`1500` 범위의 값을 사용할 수 있습니다.

***

### 메모리 제한 초과 / OOM (코드 241) \{#memory-limit-exceeded\}

**오류 메시지:**

```sh
code: 241, message: (total) memory limit exceeded: would use 14.01 GiB
```

**원인:** INSERT 작업에 사용 가능한 메모리보다 더 많은 메모리가 필요합니다. 일반적으로 대규모 초기 동기화 중, Wide 형식의 테이블을 사용할 때, 또는 여러 batch 작업이 동시에 실행될 때 발생합니다.

**해결 방법:**

1. **`write_batch_size` 줄이기**: 큰 테이블의 경우 50,000으로 낮춰 보십시오.
2. **데이터베이스 부하 줄이기**: ClickHouse Cloud 서비스의 부하를 확인하여 과부하 상태인지 점검하십시오.
3. **ClickHouse Cloud 서비스 확장**: 더 많은 메모리를 확보할 수 있도록 ClickHouse Cloud 서비스를 확장하십시오.

***

### 예기치 않은 EOF / 연결 오류 \{#unexpected-eof\}

**오류 메시지:**

```sh
ClickHouse connection error: unexpected EOF
```

또는 Fivetran 로그에 스택 트레이스 없이 `FAILURE_WITH_TASK`가 표시될 수 있습니다.

**원인:**

* Fivetran 트래픽을 허용하도록 IP 액세스 목록이 구성되지 않았습니다.
* Fivetran과 ClickHouse Cloud 사이에 일시적인 네트워크 문제가 있습니다.
* 손상되었거나 유효하지 않은 소스 데이터로 인해 대상 커넥터가 충돌합니다.

**해결 방법:**

1. **IP 액세스 목록 확인**: ClickHouse Cloud에서 **설정 &gt; 보안**으로 이동한 다음 [Fivetran IP 주소](https://fivetran.com/docs/using-fivetran/ips)를 추가하거나 모든 위치의 액세스를 허용하십시오.
2. **재시도**: 최근 커넥터 버전은 EOF 오류 발생 시 자동으로 재시도합니다. 간헐적인 오류(하루 1~2회)는 일시적인 문제일 가능성이 높습니다.
3. **문제가 지속되는 경우**: 오류가 발생한 시간대를 포함하여 ClickHouse 지원팀에 지원 티켓을 제출하십시오. 또한 Fivetran 지원팀에 소스 데이터 품질 조사를 요청하십시오.

***

### UInt64 타입을 매핑할 수 없음 \{#uint64-type-error\}

**오류 메시지:**

```sh
cause: can't map type UInt64 to Fivetran types
```

**원인:** 커넥터는 `LONG`을 `Int64`로 매핑하며, `UInt64`로는 매핑하지 않습니다. 이 오류는 Fivetran이 관리하는 테이블에서 컬럼 타입을 수동으로 변경할 때 발생합니다.

**해결 방법:**

1. Fivetran이 관리하는 테이블에서는 **컬럼 타입을 수동으로 변경하지 마십시오**.
2. **복구하려면**: 컬럼을 예상된 타입(예: `Int64`)으로 되돌리거나, 테이블을 삭제한 후 다시 동기화하십시오.
3. **사용자 지정 타입의 경우**: Fivetran이 관리하는 테이블을 기반으로 [materialized view](/sql-reference/statements/create/view#materialized-view)를 생성하십시오.

***

### 테이블에 기본 키가 없음 \{#no-primary-keys\}

**오류 메시지:**

```sh
Failed to alter table ... cause: no primary keys for table
```

**원인:** 모든 ClickHouse 테이블에는 `ORDER BY`가 필요합니다. 소스에 기본 키(primary key)가 없으면 Fivetran이 `_fivetran_id`를 자동으로 추가합니다. 이 오류는 소스에서 PK를 정의했지만 데이터에 해당 키가 포함되어 있지 않은 예외적인 경우에 발생합니다.

**해결 방법:**

1. **Fivetran 지원팀에 문의하여** 소스 파이프라인을 조사하십시오.
2. **소스 schema를 확인하세요**: 데이터에 기본 키 컬럼이 포함되어 있는지 확인하십시오.

***

### 역할 기반 권한 부여가 실패하는 경우 \{#role-based-grants\}

**오류 메시지:**

```sh
user is missing the required grants on *.*: ALTER, CREATE DATABASE, CREATE TABLE, INSERT, SELECT
```

**원인:** 커넥터는 다음 구문으로 권한을 확인합니다:

```sql
SELECT access_type, database, table, column FROM system.grants WHERE user_name = 'my_user'
```

이는 직접 부여된 권한만 반환합니다. ClickHouse 역할을 통해 부여된 권한은 `user_name = NULL` 및 `role_name = 'my_role'`로 표시되므로, 이 검사에서는 확인되지 않습니다.

**해결 방법:**

Fivetran 사용자에게 **권한을 직접 부여하세요**:

```sql
GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

***

## 모범 사례 \{#best-practices\}

### Fivetran용 전용 ClickHouse 서비스 \{#dedicated-service\}

수집 부하가 높은 경우, Fivetran의 쓰기 워크로드를 위한 전용 서비스를 만들기 위해 ClickHouse Cloud의 [컴퓨트-컴퓨트 분리](/cloud/reference/warehouses)를 사용하는 것을 고려하십시오. 이렇게 하면 수집 작업을 분석 쿼리와 분리하여 리소스 경합을 방지할 수 있습니다.

예를 들어, 다음과 같은 아키텍처를 사용할 수 있습니다:

* **서비스 A (writer)**: Fivetran 대상 + 기타 수집 도구(ClickPipes, Kafka 커넥터)
* **서비스 B (reader)**: BI 도구, 대시보드, 애드혹 쿼리

### 읽기 쿼리 최적화 \{#optimizing-reading-queries\}

ClickHouse는 Fivetran 대상 테이블에 `SharedReplacingMergeTree`를 사용합니다. 이는 ClickHouse Cloud에서의 [`ReplacingMergeTree` 테이블 엔진](/guides/replacing-merge-tree) 버전입니다. 동일한 기본 키(primary key)를 가진 중복 행이 존재하는 것은 정상이며, 중복 제거는 백그라운드 병합 중 비동기적으로 수행됩니다. 읽는 시점에는 일부 행의 중복 제거가 아직 완료되지 않았을 수 있으므로, 중복 행이 반환되지 않도록 주의해야 합니다.

중복 행을 피하는 가장 간단한 방법은 `FINAL` 키워드를 사용하는 것입니다. 이 키워드는 읽는 시점에 아직 중복 제거되지 않은 행을 강제로 병합합니다:

```sql
SELECT * FROM schema.table FINAL WHERE ...
```

이 `FINAL` 작업을 최적화하는 방법이 있습니다. 예를 들어 `WHERE` 조건을 사용해 키 컬럼을 기준으로 필터링할 수 있습니다. 자세한 내용은 ReplacingMergeTree 가이드의 [FINAL performance](/guides/replacing-merge-tree#final-performance) 섹션을 참조하십시오.

이러한 최적화로도 충분하지 않다면, 중복은 올바르게 처리하면서 `FINAL`은 사용하지 않는 추가 옵션이 있습니다:

* 항상 증가하는 숫자 컬럼을 쿼리하려는 경우 [`max(the_column)`을 사용할 수 있습니다](/guides/developer/deduplication#avoiding-final).
* 특정 키에 대해 일부 컬럼의 최신 값을 가져와야 하는 경우 [`argMax(the_column, _fivetran_id)`](https://clickhouse.com/blog/10-best-practice-tips#perfecting_replacingmergetree)를 사용할 수 있습니다.

### 기본 키(primary key) 및 ORDER BY 최적화 \{#primary-key-optimization\}

Fivetran은 소스 테이블의 기본 키(primary key)를 ClickHouse의 `ORDER BY` 절로 복제합니다. 소스에 PK가 없으면 `_fivetran_id`(UUID)가 정렬 키(sorting key)가 되며, ClickHouse는 `ORDER BY` 컬럼을 기반으로 [희소 기본 인덱스](/guides/best-practices/sparse-primary-indexes)를 생성하므로 쿼리 성능이 저하될 수 있습니다.

**이 경우, 다른 최적화만으로 충분하지 않다면 다음을 권장합니다.**

1. **Fivetran 테이블을 원시 스테이징 테이블로 취급하세요.** 분석 용도로 직접 쿼리하지 마십시오.
2. **여전히 쿼리 성능이 충분하지 않다면**, [갱신 가능 구체화 뷰(Refreshable Materialized View)](/materialized-view/refreshable-materialized-view)를 사용하여 쿼리 패턴에 맞게 `ORDER BY`를 최적화한 테이블 복사본을 만드십시오. 증분형 materialized view와 달리, 갱신 가능 구체화 뷰는 일정에 따라 전체 쿼리를 다시 실행하므로 Fivetran이 동기화 중 수행하는 `UPDATE` 및 `DELETE` 작업을 올바르게 처리할 수 있습니다:

   ```sql
   CREATE MATERIALIZED VIEW schema.table_optimized
   REFRESH EVERY 1 HOUR
   ENGINE = ReplacingMergeTree()
   ORDER BY (user_id, event_date)
   AS SELECT * FROM schema.table_raw FINAL;
   ```

   :::note
   Fivetran이 관리하는 테이블에는 증분형(비갱신형) materialized view를 사용하지 마십시오. Fivetran은 데이터를 동기화된 상태로 유지하기 위해 `UPDATE` 및 `DELETE` 작업을 수행하므로, 증분형 materialized view에는 이러한 변경 사항이 반영되지 않아 오래되었거나 잘못된 데이터가 포함됩니다.
   :::

### Fivetran이 관리하는 테이블을 수동으로 수정하지 마십시오 \{#dont-modify-tables\}

Fivetran이 관리하는 테이블에는 수동으로 DDL 변경(예: `ALTER TABLE ... MODIFY COLUMN`)을 적용하지 마십시오. 커넥터는 자신이 생성한 schema를 전제로 동작합니다. 수동 변경은 [type mapping 오류](#uint64-type-error)와 schema 불일치로 인한 실패를 일으킬 수 있습니다.

사용자 지정 변환에는 materialized view를 사용하십시오.

## 디버깅 작업 \{#debugging\}

문제가 발생했을 때는 다음을 확인하십시오.

* 서버 측 문제는 ClickHouse `system.query_log`에서 확인하십시오.
* 클라이언트 측 문제는 Fivetran에 도움을 요청하십시오.

커넥터 버그의 경우 [GitHub 이슈를 등록](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues)하거나 [ClickHouse Support](/about-us/support)에 문의하십시오.

### Fivetran 동기화 디버깅 \{#debugging-fivetran-syncs\}

다음 쿼리를 사용하여 ClickHouse 측의 동기화 실패 원인을 진단합니다.

#### Fivetran 관련 최근 ClickHouse 오류 확인 \{#check-errors\}

```sql
SELECT event_time, query, exception_code, exception
FROM system.query_log
WHERE client_name LIKE 'fivetran-destination%'
  AND exception_code > 0
ORDER BY event_time DESC
LIMIT 50;
```

#### 최근 Fivetran 사용자 활동 확인 \{#check-activity\}

```sql
SELECT event_time, query_kind, query, exception_code, exception
FROM system.query_log
WHERE user = '{fivetran_user}'
ORDER BY event_time DESC
LIMIT 100;
```
