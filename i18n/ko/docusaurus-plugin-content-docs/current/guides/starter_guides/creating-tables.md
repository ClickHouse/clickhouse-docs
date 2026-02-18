---
sidebar_position: 1
sidebar_label: '테이블 생성'
title: 'ClickHouse에서 테이블 생성'
slug: /guides/creating-tables
description: 'ClickHouse에서 테이블 생성에 대해 알아보기'
keywords: ['테이블 생성', 'CREATE TABLE', '테이블 생성', '데이터베이스 가이드', 'MergeTree 엔진']
doc_type: '가이드'
---

# ClickHouse에서 테이블 생성하기 \{#creating-tables-in-clickhouse\}

대부분의 데이터베이스와 마찬가지로 ClickHouse는 테이블을 논리적으로 **데이터베이스** 단위로 그룹화합니다. ClickHouse에서 새 데이터베이스를 생성하려면 `CREATE DATABASE` 명령을 사용하십시오.

```sql
CREATE DATABASE IF NOT EXISTS helloworld
```

마찬가지로 `CREATE TABLE`을 사용하여 새 테이블을 정의할 수 있습니다. 데이터베이스 이름을 지정하지 않으면 테이블은
`default` 데이터베이스에 생성됩니다.

다음은 `helloworld` 데이터베이스에 생성된 `my_first_table` 테이블입니다.

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

위 예제에서 `my_first_table`은 네 개의 컬럼을 가진 `MergeTree` 테이블입니다:

* `user_id`:  32비트 부호 없는 정수
* `message`: `String` 데이터 타입으로, 다른 데이터베이스 시스템의 `VARCHAR`, `BLOB`, `CLOB` 등의 타입을 대체합니다
* `timestamp`: 시점을 나타내는 `DateTime` 값
* `metric`: 32비트 부동소수점 숫자

:::note
테이블 엔진은 다음을 결정합니다.

* 데이터가 어떻게, 어디에 저장되는지
* 어떤 쿼리를 지원하는지
* 데이터가 복제되는지 여부

선택할 수 있는 엔진은 여러 종류가 있지만, 단일 노드 ClickHouse 서버에서 사용하는 간단한 테이블에는 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)가 주로 사용됩니다.
:::


## 기본 키에 대한 간단한 소개 \{#a-brief-intro-to-primary-keys\}

더 진행하기 전에 ClickHouse에서 기본 키가 어떻게 동작하는지 이해하는 것이 중요합니다(기본 키의 구현은
다소 예상 밖일 수 있습니다!).

- ClickHouse의 기본 키는 테이블의 각 행에 대해 **_고유하지 않습니다_**

ClickHouse 테이블의 기본 키는 데이터가 디스크에 기록될 때 어떻게 정렬되는지를 결정합니다. 8,192개의 행 또는 10MB의
데이터마다(이를 **인덱스 그래뉼리티(index granularity)**라고 합니다) 기본 키 인덱스 파일에 항목이 생성됩니다. 이 그래뉼리티 개념은
메모리에 쉽게 적재할 수 있는 **희소 인덱스**를 만들며, 그래뉼은 `SELECT` 쿼리가 처리하는 최소량의
컬럼 데이터를 포함하는 스트라이프를 나타냅니다.

기본 키는 `PRIMARY KEY` 매개변수를 사용하여 정의할 수 있습니다. `PRIMARY KEY`를 지정하지 않고 테이블을 정의하면
키는 `ORDER BY` 절에 지정된 튜플이 됩니다. `PRIMARY KEY`와 `ORDER BY`를 모두 지정하는 경우, 기본 키는 정렬 순서의 접두사가 되어야 합니다.

기본 키는 또한 정렬 키 역할을 하며, 이는 `(user_id, timestamp)` 튜플입니다. 따라서 각
컬럼 파일에 저장된 데이터는 먼저 `user_id`로 정렬되고, 그 다음 `timestamp`로 정렬됩니다.

:::tip
자세한 내용은 ClickHouse Academy의 [Modeling Data training module](https://learn.clickhouse.com/visitor_catalog_class/show/1328860/?utm_source=clickhouse&utm_medium=docs)을 참고하십시오.
:::