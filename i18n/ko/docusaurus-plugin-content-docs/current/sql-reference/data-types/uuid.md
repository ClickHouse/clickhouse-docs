---
description: 'ClickHouse에서 UUID 데이터 타입 문서'
sidebar_label: 'UUID'
sidebar_position: 24
slug: /sql-reference/data-types/uuid
title: 'UUID'
doc_type: 'reference'
---

# UUID \{#uuid\}

범용 고유 식별자(UUID, Universally Unique Identifier)는 레코드를 식별하는 데 사용되는 16바이트 값입니다. UUID에 대한 자세한 정보는 [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier)를 참조하십시오.

UUIDv4 및 UUIDv7과 같이 여러 UUID 변형이 존재하지만(참고: [여기](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis)), ClickHouse는 삽입된 UUID가 특정 변형을 준수하는지 검증하지 않습니다.
UUID는 내부적으로 16개의 임의 바이트 시퀀스로 취급되며, SQL 수준에서는 [8-4-4-4-12 표현](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation)으로 표시됩니다.

UUID 값 예시:

```text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

기본 UUID는 모두 0으로 구성된 값입니다. 예를 들어 새 레코드를 삽입할 때 UUID 컬럼 값이 지정되지 않으면 사용됩니다.

```text
00000000-0000-0000-0000-000000000000
```

:::warning
역사적인 이유로 UUID는 뒤쪽 절반을 기준으로 정렬됩니다.

이는 UUIDv4 값에는 문제가 없지만, 기본 키 인덱스 정의에 사용되는 UUIDv7 컬럼(정렬 키나 파티션 키에서 사용하는 것은 괜찮습니다)의 경우 성능을 저하시킬 수 있습니다.
좀 더 구체적으로 말하면, UUIDv7 값은 앞쪽 절반에 타임스탬프, 뒤쪽 절반에 카운터가 포함되어 있습니다.
따라서 희소 기본 키 인덱스(예: 각 인덱스 그래뉼(granule)의 첫 번째 값)에서 UUIDv7은 카운터 필드를 기준으로 정렬됩니다.
만약 UUID가 앞쪽 절반(타임스탬프)을 기준으로 정렬된다면, 쿼리 시작 시 기본 키 인덱스 분석 단계에서 하나의 파트를 제외한 모든 파트의 모든 마크를 제거(prune)할 것으로 예상됩니다.
그러나 뒤쪽 절반(카운터)을 기준으로 정렬되면, 모든 파트에 대해 최소 한 개의 마크가 반환될 것으로 예상되며, 이로 인해 불필요한 디스크 액세스가 발생합니다.
:::

예시:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = MergeTree PRIMARY KEY (uuid);

INSERT INTO tab SELECT generateUUIDv7() FROM numbers(50);
SELECT * FROM tab;
```

결과:

```text
┌─uuid─────────────────────────────────┐
│ 36a0b67c-b74a-4640-803b-e44bb4547e3c │
│ 3a00aeb8-2605-4eec-8215-08c0ecb51112 │
│ 3fda7c49-282e-421a-85ab-c5684ef1d350 │
│ 16ab55a7-45f6-44a8-873c-7a0b44346b3e │
│ e3776711-6359-4f22-878d-bf290d052c85 │
│                [...]                 │
│ 9eceda2f-6946-40e3-b725-16f2709ca41a │
│ 03644f74-47ba-4020-b865-be5fd4c8c7ff │
│ ce3bc93d-ab19-4c74-b8cc-737cb9212099 │
│ b7ad6c91-23d6-4b5e-b8e4-a52297490b56 │
│ 06892f64-cc2d-45f3-bf86-f5c5af5768a9 │
└──────────────────────────────────────┘
```

우회 방법으로, UUID를 뒤쪽 절반에서 추출한 타임스탬프로 변환할 수 있습니다:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = MergeTree PRIMARY KEY (UUIDv7ToDateTime(uuid));
-- Or alternatively:                      [...] PRIMARY KEY (toStartOfHour(UUIDv7ToDateTime(uuid)));

INSERT INTO tab SELECT generateUUIDv7() FROM numbers(50);
SELECT * FROM tab;
```

ORDER BY (UUIDv7ToDateTime(uuid), uuid)


## UUID 생성 \{#generating-uuids\}

ClickHouse는 무작위 UUID 버전 4 값을 생성하는 함수 [generateUUIDv4](../../sql-reference/functions/uuid-functions.md)를 제공합니다.

## 사용 예시 \{#usage-example\}

**예시 1**

다음 예시는 UUID 컬럼을 포함한 테이블을 생성하고 해당 테이블에 값을 삽입하는 과정을 보여줍니다.

```sql
CREATE TABLE t_uuid (x UUID, y String) ENGINE=TinyLog

INSERT INTO t_uuid SELECT generateUUIDv4(), 'Example 1'

SELECT * FROM t_uuid
```

결과:

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
└──────────────────────────────────────┴───────────┘
```

**예시 2**

이 예시에서는 레코드를 삽입할 때 UUID 컬럼 값이 지정되지 않으므로, 즉 기본 UUID 값이 삽입됩니다.

```sql
INSERT INTO t_uuid (y) VALUES ('Example 2')

SELECT * FROM t_uuid
```

```text
┌────────────────────────────────────x─┬─y─────────┐
│ 417ddc5d-e556-4d27-95dd-a34d84e46a50 │ Example 1 │
│ 00000000-0000-0000-0000-000000000000 │ Example 2 │
└──────────────────────────────────────┴───────────┘
```


## 제한 사항 \{#restrictions\}

UUID 데이터 타입은 [String](../../sql-reference/data-types/string.md) 데이터 타입에서 지원하는 함수만 지원합니다(예: [min](/sql-reference/aggregate-functions/reference/min), [max](/sql-reference/aggregate-functions/reference/max), [count](/sql-reference/aggregate-functions/reference/count)).

UUID 데이터 타입은 산술 연산(예: [abs](/sql-reference/functions/arithmetic-functions#abs))이나 [sum](/sql-reference/aggregate-functions/reference/sum), [avg](/sql-reference/aggregate-functions/reference/avg)와 같은 집계 함수에 사용할 수 없습니다.