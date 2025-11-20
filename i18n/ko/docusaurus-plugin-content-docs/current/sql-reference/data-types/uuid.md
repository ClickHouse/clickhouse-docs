---
'description': 'ClickHouse에서 UUID 데이터 타입에 대한 문서'
'sidebar_label': 'UUID'
'sidebar_position': 24
'slug': '/sql-reference/data-types/uuid'
'title': 'UUID'
'doc_type': 'reference'
---


# UUID

전역 고유 식별자(Universally Unique Identifier, UUID)는 레코드를 식별하는 데 사용되는 16바이트 값입니다. UUID에 대한 자세한 정보는 [Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier)를 참조하십시오.

다양한 UUID 변형이 존재하지만(자세한 내용은 [여기](https://datatracker.ietf.org/doc/html/draft-ietf-uuidrev-rfc4122bis) 참고), ClickHouse는 삽입된 UUID가 특정 변형에 부합하는지 확인하지 않습니다.
UUID는 SQL 수준에서 [8-4-4-4-12 표현](https://en.wikipedia.org/wiki/Universally_unique_identifier#Textual_representation)의 16개의 랜덤 바이트로 내부적으로 처리됩니다.

예시 UUID 값:

```text
61f0c404-5cb3-11e7-907b-a6006ad3dba0
```

기본 UUID는 모든 비트가 0인 값입니다. 이는 예를 들어 새로운 레코드가 삽입되지만 UUID 열의 값이 지정되지 않을 때 사용됩니다:

```text
00000000-0000-0000-0000-000000000000
```

역사적 이유로 인해 UUID는 두 번째 절반을 기준으로 정렬됩니다.
따라서 UUID는 테이블의 기본 키, 정렬 키 또는 파티션 키에 직접 사용되지 않아야 합니다.

예시:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY uuid;
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

우회 방법으로, UUID는 직관적인 정렬 순서를 가지는 유형으로 변환할 수 있습니다.

UInt128로 변환하는 예시:

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;
INSERT INTO tab SELECT generateUUIDv4() FROM numbers(50);
SELECT * FROM tab ORDER BY toUInt128(uuid);
```

결과:

```sql
┌─uuid─────────────────────────────────┐
│ 018b81cd-aca1-4e9c-9e56-a84a074dc1a8 │
│ 02380033-c96a-438e-913f-a2c67e341def │
│ 057cf435-7044-456a-893b-9183a4475cea │
│ 0a3c1d4c-f57d-44cc-8567-60cb0c46f76e │
│ 0c15bf1c-8633-4414-a084-7017eead9e41 │
│                [...]                 │
│ f808cf05-ea57-4e81-8add-29a195bde63d │
│ f859fb5d-764b-4a33-81e6-9e4239dae083 │
│ fb1b7e37-ab7b-421a-910b-80e60e2bf9eb │
│ fc3174ff-517b-49b5-bfe2-9b369a5c506d │
│ fece9bf6-3832-449a-b058-cd1d70a02c8b │
└──────────────────────────────────────┘
```

## UUID 생성하기 {#generating-uuids}

ClickHouse는 무작위 UUID 버전 4 값을 생성하기 위해 [generateUUIDv4](../../sql-reference/functions/uuid-functions.md) 함수를 제공합니다.

## 사용 예시 {#usage-example}

**예시 1**

이 예시는 UUID 열이 있는 테이블을 생성하고 테이블에 값을 삽입하는 과정을 보여줍니다.

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

이 예시는 레코드가 삽입될 때 UUID 열 값이 지정되지 않은 경우, 즉 기본 UUID 값이 삽입되는 경우를 보여줍니다:

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

## 제한 사항 {#restrictions}

UUID 데이터 유형은 [String](../../sql-reference/data-types/string.md) 데이터 유형이 지원하는 함수만 지원합니다(예: [min](/sql-reference/aggregate-functions/reference/min), [max](/sql-reference/aggregate-functions/reference/max), 및 [count](/sql-reference/aggregate-functions/reference/count)).

UUID 데이터 유형은 [abs](/sql-reference/functions/arithmetic-functions#abs)와 같은 산술 연산 또는 [sum](/sql-reference/aggregate-functions/reference/sum) 및 [avg](/sql-reference/aggregate-functions/reference/avg)와 같은 집계 함수에 의해 지원되지 않습니다.
