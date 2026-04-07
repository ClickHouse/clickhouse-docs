---
sidebar_label: '기술 참조'
slug: /integrations/fivetran/reference
sidebar_position: 3
description: 'Fivetran ClickHouse 대상에 대한 유형 대응 관계, 테이블 엔진 세부 정보, 메타데이터 컬럼 및 디버깅 쿼리를 설명합니다.'
title: '기술 참조'
doc_type: 'guide'
keywords: ['fivetran', 'ClickHouse 대상', '기술 참조']
---

# 기술 참조 \{#technical-reference\}

## 설정 세부 사항 \{#setup-details\}

### 사용자 및 역할 관리 \{#user-and-role-management\}

`default` 사용자는 사용하지 않는 것이 좋습니다. 대신 이 Fivetran
대상 전용 사용자를 생성하십시오. `default` 사용자로 실행하는 다음 명령어는 필요한 특권이 있는 새 `fivetran_user`를
생성합니다.

```sql
CREATE USER fivetran_user IDENTIFIED BY '<password>'; -- use a secure password generator

GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

추가로, `fivetran_user`의 특정 데이터베이스에 대한 접근 권한을 철회할 수 있습니다.
예를 들어, 다음 문을 실행하면 `default` 데이터베이스에 대한 접근이 제한됩니다.

```sql
REVOKE ALL ON default.* FROM fivetran_user;
```

이러한 SQL 문은 ClickHouse SQL 콘솔에서 실행할 수 있습니다.

### 고급 구성 \{#advanced-configuration\}

ClickHouse Cloud 대상은 고급 사용 사례를 위한 선택적 JSON 설정 파일을 지원합니다. 이 파일을 사용하면 배치 크기, 병렬 처리, 연결 풀, 요청 타임아웃을 제어하는 기본 설정을 재정의하여 대상 동작을 세밀하게 조정할 수 있습니다.

:::note
이 구성은 완전히 선택 사항입니다. 파일을 업로드하지 않으면 대상은 대부분의 사용 사례에 적합한 기본값을 사용합니다.
:::

파일은 유효한 JSON이어야 하며 아래에 설명된 schema를 준수해야 합니다.

초기 설정 후 구성을 수정해야 하는 경우 Fivetran 대시보드에서 대상 구성을 편집하고 업데이트된 파일을 업로드할 수 있습니다.

설정 파일에는 다음과 같은 최상위 섹션이 있습니다:

```json
{
  "destination_configurations": { ... }
}
```

여기에서 ClickHouse 대상 커넥터 자체의 내부 동작을 제어하는 다음 구성 항목을 지정할 수 있습니다.
이 구성은 커넥터가 데이터를 ClickHouse로 보내기 전에 처리하는 방식에 영향을 줍니다.

| 설정                       | 유형      | 기본값      | 허용 범위           | 설명                                                                                  |
| ------------------------ | ------- | -------- | --------------- | ----------------------------------------------------------------------------------- |
| `write_batch_size`       | integer | `100000` | 5,000 – 100,000 | insert, update, replace 작업에서 배치당 행 수입니다.                                            |
| `select_batch_size`      | integer | `1500`   | 200 – 1,500     | 업데이트 중에 사용되는 SELECT 쿼리의 배치당 행 수입니다.                                                 |
| `mutation_batch_size`    | integer | `1500`   | 200 – 1,500     | 히스토리 모드에서 ALTER TABLE UPDATE mutation의 배치당 행 수입니다. SQL 문이 너무 커지는 문제가 발생하면 이 값을 낮추십시오. |
| `hard_delete_batch_size` | integer | `1500`   | 200 – 1,500     | 일반 동기화와 히스토리 모드에서 하드 삭제 작업의 배치당 행 수입니다. SQL 문이 너무 커지는 문제가 발생하면 이 값을 낮추십시오.            |

모든 필드는 선택 사항입니다. 필드를 지정하지 않으면 기본값이 사용됩니다.
값이 허용 범위를 벗어나면 대상이 동기화 중 오류를 보고합니다.
알 수 없는 필드는 조용히 무시되며(경고가 기록됨) 오류를 발생시키지 않으므로, 새 설정이 추가되더라도 이후 버전과의 호환성을 유지할 수 있습니다.

예시:

```json
{
  "destination_configurations": {
    "write_batch_size": 50000,
    "select_batch_size": 200
  }
}
```

## 타입 변환 대응 \{#type-mapping\}

Fivetran ClickHouse 대상은 [Fivetran data types](https://fivetran.com/docs/destinations#datatypes)을 다음과 같이 ClickHouse 타입에 대응합니다:

| Fivetran 타입   | ClickHouse 타입                                                        |
| ------------- | -------------------------------------------------------------------- |
| BOOLEAN       | [Bool](/sql-reference/data-types/boolean)                            |
| SHORT         | [Int16](/sql-reference/data-types/int-uint)                          |
| INT           | [Int32](/sql-reference/data-types/int-uint)                          |
| LONG          | [Int64](/sql-reference/data-types/int-uint)                          |
| BIGDECIMAL    | [Decimal(P, S)](/sql-reference/data-types/decimal)                   |
| FLOAT         | [Float32](/sql-reference/data-types/float)                           |
| DOUBLE        | [Float64](/sql-reference/data-types/float)                           |
| LOCALDATE     | [Date32](/sql-reference/data-types/date32)                           |
| LOCALDATETIME | [DateTime64(0, &#39;UTC&#39;)](/sql-reference/data-types/datetime64) |
| INSTANT       | [DateTime64(9, &#39;UTC&#39;)](/sql-reference/data-types/datetime64) |
| STRING        | [String](/sql-reference/data-types/string)                           |
| LOCALTIME     | [String](/sql-reference/data-types/string) * **                      |
| BINARY        | [String](/sql-reference/data-types/string) *                         |
| XML           | [String](/sql-reference/data-types/string) *                         |
| JSON          | [String](/sql-reference/data-types/string) *                         |

:::note

* BINARY, XML, LOCALTIME, JSON은 ClickHouse의 `String` 타입이 임의의 바이트 집합을 표현할 수 있으므로 [String](/sql-reference/data-types/string)으로 저장됩니다. 대상은 원래 데이터 타입을 나타내기 위해 컬럼 주석을 추가합니다. ClickHouse [JSON](/sql-reference/data-types/newjson) 데이터 타입은 폐기된 것으로 표시되었고 프로덕션 용도로 권장된 적이 없으므로 사용되지 않습니다.
  ** 주의: LOCALTIME 타입 지원을 추적하는 이슈는 다음을 참조하십시오: [clickhouse-fivetran-destination #15](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues/15).
  :::

### 날짜 및 시간 값 범위 \{#date-and-time-value-ranges\}

Fivetran 소스는 [0001-01-01, 9999-12-31](https://fivetran.com/docs/destinations#dateandtimevaluerange) 범위의 날짜 및 시간 값을 전송할 수 있습니다.
ClickHouse Cloud의 날짜 타입은 지원 범위가 더 좁으므로, 지원 범위를 벗어나는 값은 별도 알림 없이 가장 가까운 경계값으로 잘립니다.

| Fivetran type | ClickHouse Cloud type        | Min value           | Max value           |
| ------------- | ---------------------------- | ------------------- | ------------------- |
| LOCALDATE     | Date32                       | 1900-01-01          | 2299-12-31          |
| LOCALDATETIME | DateTime64(0, &#39;UTC&#39;) | 1900-01-01 00:00:00 | 2262-04-11 23:47:16 |
| INSTANT       | DateTime64(9, &#39;UTC&#39;) | 1900-01-01 00:00:00 | 2262-04-11 23:47:16 |

* INSTANT의 상한값이 2262-04-11 23:47:16인 이유는 DateTime64(9)가 epoch 이후의 나노초를 int64로 저장하고, 2^63 - 1 나노초가 이 날짜에 해당하기 때문입니다.
  ClickHouse 자체는 정밀도 &lt;= 9인 DateTime64를 2299-12-31 23:59:59까지 지원합니다.
* LOCALDATETIME의 상한값도 Go ClickHouse 드라이버의 [알려진 버그](https://github.com/ClickHouse/clickhouse-go/issues/1311)로 인해 2262-04-11 23:47:16으로 제한됩니다. 이 버그에서는 스케일링 전에 모든 DateTime64 정밀도에 대해 `time.Time.UnixNano()`를 호출하므로, 정밀도 0에서도 2262년 이후 날짜에 대해 int64 오버플로가 발생합니다.

## 대상 테이블 \{#table-structure\}

ClickHouse Cloud 대상은
[SharedMergeTree](/cloud/reference/shared-merge-tree) 계열의
[Replacing](/engines/table-engines/mergetree-family/replacingmergetree) 엔진 유형
(구체적으로 `SharedReplacingMergeTree`)을 사용하며, `_fivetran_synced` 컬럼으로 버전이 관리됩니다.

기본 키(정렬 키)와 Fivetran 메타데이터 컬럼을 제외한 모든 컬럼은
[Nullable(T)](/sql-reference/data-types/nullable)로 생성되며,
여기서 `T`는 [데이터 타입 대응](#type-mapping)을 기반으로 하는
ClickHouse Cloud 타입입니다.

테이블 구조는 커넥터에 설정된 Fivetran
[동기화 모드](https://fivetran.com/docs/using-fivetran/features#deletedrowhandling)에 따라 달라집니다:
**소프트 삭제**(기본값) 또는 **히스토리 모드**(SCD Type 2)입니다.

### 소프트 삭제 모드 \{#soft-delete-mode\}

소프트 삭제 모드에서는 모든 대상 테이블에 다음 메타데이터 컬럼이 포함됩니다.

| 컬럼                  | Type                   | 설명                                                                           |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| `_fivetran_synced`  | `DateTime64(9, 'UTC')` | Fivetran이 레코드를 동기화한 시점의 타임스탬프입니다. `SharedReplacingMergeTree`의 버전 컬럼으로 사용됩니다. |
| `_fivetran_deleted` | `Bool`                 | 소프트 삭제 마커입니다. 원본 레코드가 삭제되면 `true`로 설정됩니다.                                    |
| `_fivetran_id`      | `String`               | 자동 생성된 고유 식별자입니다. 원본 테이블에 기본 키가 없을 때만 포함됩니다.                          |

#### 소스 테이블의 단일 기본 키 \{#single-pk\}

예를 들어, 소스 테이블 `users`에는 기본 키 컬럼 `id` (`INT`)와 일반 컬럼 `name` (`STRING`)이 있습니다.
대상 테이블은 다음과 같이 정의됩니다.

```sql
CREATE TABLE `users`
(
    `id`                Int32,
    `name`              Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY id
SETTINGS index_granularity = 8192
```

이 경우 `id` 컬럼이 테이블의 정렬 키로 선택됩니다.

#### 원본 테이블에 여러 개의 기본 키(primary key)가 있는 경우 \{#multiple-pks\}

원본 테이블에 여러 개의 기본 키가 있으면 Fivetran 원본 테이블 정의에 나타나는 순서대로 사용됩니다.

예를 들어, 원본 테이블 `items`에 기본 키 컬럼 `id` (`INT`)와 `name` (`STRING`)이 있고, 추가로 일반 컬럼 `description` (`STRING`)이 있는 경우 대상 테이블은 다음과 같이 정의됩니다:

```sql
CREATE TABLE `items`
(
    `id`                Int32,
    `name`              String,
    `description`       Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, name)
SETTINGS index_granularity = 8192
```

이 경우 테이블의 정렬 키로 `id` 및 `name` 컬럼이 선택됩니다.

#### 소스 테이블에 기본 키(primary key)가 없는 경우 \{#no-pks\}

소스 테이블에 기본 키(primary key)가 없으면 Fivetran이 `_fivetran_id` 컬럼을 고유 식별자로 추가합니다.
소스에 `event` (`STRING`) 및 `timestamp` (`LOCALDATETIME`) 컬럼만 있는 `events` 테이블을 예로 살펴보겠습니다.
이 경우 대상 테이블은 다음과 같습니다.

```sql
CREATE TABLE events
(
    `event`             Nullable(String),
    `timestamp`         Nullable(DateTime),
    `_fivetran_id`      String,
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY _fivetran_id
SETTINGS index_granularity = 8192
```

`_fivetran_id`는 고유하며 다른 기본 키(primary key) 옵션이 없으므로 테이블 정렬 키(sorting key)로 사용됩니다.

### 히스토리 모드 (SCD Type 2) \{#history-mode\}

[히스토리 모드](https://fivetran.com/docs/using-fivetran/features#historymode)가 활성화되면,
대상 테이블은 이전 값을 덮어쓰는 대신 각 레코드의 모든 버전을 보존합니다.
이 방식은 [Slowly Changing Dimension Type 2](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row)(SCD Type 2)를 구현하여,
모든 변겨에 대한 전체 감사 추적 기록을 유지합니다.

히스토리 모드에서는 모든 대상 테이블에 다음 메타데이터 컬럼이 포함됩니다:

| Column             | Type                             | Description                                                                 |
| ------------------ | -------------------------------- | --------------------------------------------------------------------------- |
| `_fivetran_synced` | `DateTime64(9, 'UTC')`           | 레코드가 Fivetran에 의해 동기화된 타임스탬프입니다. `SharedReplacingMergeTree`의 버전 컬럼으로 사용됩니다. |
| `_fivetran_start`  | `DateTime64(9, 'UTC')`           | 이 버전의 레코드가 활성화된 시점의 타임스탬프입니다. 테이블의 정렬 키(sorting key)에 포함됩니다.                |
| `_fivetran_end`    | `Nullable(DateTime64(9, 'UTC'))` | 이 버전이 대체된 시점의 타임스탬프입니다. 현재 활성 레코드의 경우 `2262-04-11 23:47:16`으로 설정됩니다.        |
| `_fivetran_active` | `Nullable(Bool)`                 | 현재 활성 상태인 레코드 버전인지 여부입니다.                                                   |
| `_fivetran_id`     | `String`                         | 자동 생성된 고유 식별자입니다. 소스 테이블에 기본 키(primary key)가 없는 경우에만 존재합니다.                 |

`_fivetran_start` 컬럼은 항상 복합 정렬 키의 마지막 요소로 `ORDER BY` 절에 포함됩니다.
따라서 시작 시간이 서로 다른 동일 레코드의 여러 버전이 테이블에 함께 존재할 수 있습니다.

레코드가 업데이트되면 다음과 같이 처리됩니다:

* 이전 버전의 `_fivetran_end`는 새 버전의 `_fivetran_start`에서 1나노초를 뺀 값으로 설정되고, `_fivetran_active`는 `false`로 설정됩니다.
* 새 버전은 `_fivetran_active`가 `true`로, `_fivetran_end`가 `2262-04-11 23:47:16.000000000`(최대 `DateTime64(9)` 값)으로 설정된 상태로 삽입됩니다.

#### 소스 테이블의 단일 기본 키 \{#history-single-pk\}

예를 들어, 소스 테이블 `users`에는 기본 키 컬럼 `id`(`INT`)와 일반 컬럼인 `name`(`STRING`), `status`(`STRING`)가 있습니다.
히스토리 모드에서의 대상 테이블은 다음과 같이 정의됩니다:

```sql
CREATE TABLE `users`
(
    `id`               Int32,
    `name`             Nullable(String),
    `status`           Nullable(String),
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, _fivetran_start)
SETTINGS index_granularity = 8192
```

이 경우 `id`와 `_fivetran_start`가 복합 정렬 키(sorting key)를 구성합니다.

몇 차례 동기화가 수행되고 나면 테이블에는 다음과 같은 데이터가 포함될 수 있습니다.

| id | name    | status | &#95;fivetran&#95;start       | &#95;fivetran&#95;end         | &#95;fivetran&#95;active |
| -- | ------- | ------ | ----------------------------- | ----------------------------- | ------------------------ |
| 1  | name 1  | TODO   | 2025-11-10 20:57:00.000000000 | 2025-11-11 20:56:59.999000000 | false                    |
| 1  | name 11 | TODO   | 2025-11-11 20:57:00.000000000 | 2262-04-11 23:47:16.000000000 | true                     |
| 2  | name 2  | TODO   | 2025-11-10 20:57:00.000000000 | 2262-04-11 23:47:16.000000000 | true                     |

레코드 `id=1`에는 두 가지 버전이 있습니다. 즉, 원래 버전(`name 1`, 비활성)과 업데이트된 버전(`name 11`, 활성)입니다.
레코드 `id=2`에는 현재 활성 상태인 버전이 하나만 있습니다.

#### 소스 테이블에 여러 개의 기본 키가 있는 경우 \{#history-multiple-pks\}

소스 테이블에 여러 개의 기본 키가 있으면, 마지막 요소인 `_fivetran_start`와 함께 모든 기본 키가 `ORDER BY`에 포함됩니다.

예를 들어, 소스 테이블 `items`에 기본 키 컬럼 `id` (`INT`)와 `name` (`STRING`)이 있고, 추가 일반 컬럼 `description` (`STRING`)도 있다고 가정합니다. 히스토리 모드의 대상 테이블은 다음과 같이 정의됩니다.

```sql
CREATE TABLE `items`
(
    `id`               Int32,
    `name`             String,
    `description`      Nullable(String),
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, name, _fivetran_start)
SETTINGS index_granularity = 8192
```

이 경우 `id`, `name`, `_fivetran_start`가 복합 정렬 키(sorting key)를 이룹니다.

#### 소스 테이블에 기본 키(primary key)가 없는 경우 \{#history-no-pks\}

소스 테이블에 기본 키(primary key)가 없으면 Fivetran이 `_fivetran_id` 컬럼을 고유 식별자로 추가하고,
`_fivetran_start`를 정렬 키(sorting key)에 추가합니다.
소스에 `event` (`STRING`) 및 `timestamp` (`LOCALDATETIME`) 컬럼만 있는 `events` 테이블을 예로 들어보겠습니다.
히스토리 모드에서의 대상 테이블(destination table)은 다음과 같습니다:

```sql
CREATE TABLE events
(
    `event`            Nullable(String),
    `timestamp`        Nullable(DateTime),
    `_fivetran_id`     String,
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (_fivetran_id, _fivetran_start)
SETTINGS index_granularity = 8192
```

`_fivetran_id`와 `_fivetran_start`가 복합 정렬 키를 이루므로.

### 중복 없이 데이터의 최신 버전 선택하기 \{#selecting-latest-version\}

`SharedReplacingMergeTree`는 백그라운드에서 데이터를 중복 제거하지만,
[알 수 없는 시점에 수행되는 병합 중에만](/engines/table-engines/mergetree-family/replacingmergetree)
적용됩니다.
그러나 `FINAL` 키워드를 사용하면 필요할 때 중복 없는 최신 버전의 데이터를 선택할 수 있습니다:

```sql
SELECT *
FROM example FINAL
LIMIT 1000 
```

쿼리 최적화 팁은 문제 해결 가이드의 [읽기 쿼리 최적화](/integrations/fivetran/troubleshooting#optimizing-reading-queries)&quot; 섹션에서 확인하십시오.

## 네트워크 장애 시 재시도 \{#retries-on-network-failures\}

ClickHouse Cloud 대상은 일시적인 네트워크 오류가 발생하면 지수 백오프 알고리즘을 사용해 재시도합니다.
대상에 데이터가 삽입되더라도 안전합니다. 발생할 수 있는 중복은
`SharedReplacingMergeTree` 테이블 엔진에서 처리되기 때문입니다.