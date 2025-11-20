---
'sidebar_position': 1
'sidebar_label': '테이블 생성하기'
'title': 'ClickHouse에서 테이블 생성하기'
'slug': '/guides/creating-tables'
'description': 'ClickHouse에서 테이블 생성하기에 대해 배우기'
'keywords':
- 'creating tables'
- 'CREATE TABLE'
- 'table creation'
- 'database guide'
- 'MergeTree engine'
'doc_type': 'guide'
---


# ClickHouse에서 테이블 생성하기

 대부분의 데이터베이스와 마찬가지로, ClickHouse는 테이블을 **데이터베이스**로 논리적으로 그룹화합니다. ClickHouse에서 새 데이터베이스를 생성하려면 `CREATE DATABASE` 명령을 사용합니다:

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

유사하게, `CREATE TABLE`을 사용하여 새 테이블을 정의합니다. 데이터베이스 이름을 지정하지 않으면 테이블은 `default` 데이터베이스에 생성됩니다.

다음은 `helloworld` 데이터베이스에 생성되는 `my_first_table`이라는 테이블입니다:

```sql
CREATE TABLE helloworld.my_first_table
(
    user_id UInt32,
    message String,
    timestamp DateTime,
    metric Float32
)
ENGINE = MergeTree()
PRIMARY KEY (user_id, timestamp)
```

위의 예에서 `my_first_table`은 네 개의 컬럼을 가진 `MergeTree` 테이블입니다:

- `user_id`:  32비트 unsigned 정수
- `message`: `String` 데이터 타입, 다른 데이터베이스 시스템에서의 `VARCHAR`, `BLOB`, `CLOB` 등의 타입을 대체합니다
- `timestamp`: 시간이 지나는 특정 순간을 나타내는 `DateTime` 값
- `metric`: 32비트 부동 소수점 숫자

:::note
테이블 엔진은 다음을 결정합니다:
- 데이터가 저장되는 방식과 위치
- 지원되는 쿼리 종류
- 데이터가 복제되는지 여부

선택할 수 있는 많은 엔진이 있지만, 단일 노드 ClickHouse 서버에서 단순한 테이블의 경우 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)가 일반적인 선택입니다.
:::

## 기본 키에 대한 간략한 소개 {#a-brief-intro-to-primary-keys}

더 나아가기 전에 ClickHouse에서 기본 키가 어떻게 작동하는지 이해하는 것이 중요합니다 (기본 키의 구현이 예상치 못한 것일 수 있습니다!):

- ClickHouse의 기본 키는 테이블의 각 행에 대해 **_고유하지 않습니다_**

ClickHouse 테이블의 기본 키는 데이터가 디스크에 기록될 때 정렬되는 방식을 결정합니다. 8,192개 행 또는 10MB의 데이터(이를 **인덱스 세분성**이라고 함)마다 기본 키 인덱스 파일에 항목이 생성됩니다. 이 세분성 개념은 메모리에 쉽게 적재될 수 있는 **스파스 인덱스**를 생성하며, granule은 `SELECT` 쿼리에서 처리되는 가장 작은 컬럼 데이터의 스트립을 나타냅니다.

기본 키는 `PRIMARY KEY` 매개변수를 사용하여 정의할 수 있습니다. `PRIMARY KEY`가 지정되지 않은 테이블을 정의하면, 키는 `ORDER BY` 절에 지정된 튜플이 됩니다. `PRIMARY KEY`와 `ORDER BY`를 모두 지정하면, 기본 키는 정렬 순서의 접두여야 합니다.

기본 키는 정렬 키이기도 하며, 이는 `(user_id, timestamp)` 튜플입니다. 따라서 각 컬럼 파일에 저장된 데이터는 `user_id`로 먼저 정렬되고, 그 다음 `timestamp`로 정렬됩니다.

:::tip
더 자세한 내용은 ClickHouse Academy의 [모델링 데이터 교육 모듈](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)을 확인하세요.
:::
