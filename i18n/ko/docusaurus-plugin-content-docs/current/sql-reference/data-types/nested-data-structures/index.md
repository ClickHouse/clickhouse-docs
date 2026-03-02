---
description: 'ClickHouse의 중첩 데이터 구조 개요'
sidebar_label: 'Nested(Name1 Type1, Name2 Type2, ...)'
sidebar_position: 57
slug: /sql-reference/data-types/nested-data-structures/nested
title: 'Nested'
doc_type: 'guide'
---

# 중첩 \{#nested\}

## Nested(name1 Type1, Name2 Type2, ...) \{#nestedname1-type1-name2-type2-\}

중첩 데이터 구조는 셀 안에 있는 테이블과 비슷합니다. 중첩 데이터 구조의 매개변수인 컬럼 이름과 타입은 [CREATE TABLE](../../../sql-reference/statements/create/table.md) 쿼리와 동일한 방식으로 지정합니다. 각 테이블 행은 중첩 데이터 구조에서 임의 개수의 행과 대응될 수 있습니다.

예시:

```sql
CREATE TABLE test.visits
(
    CounterID UInt32,
    StartDate Date,
    Sign Int8,
    IsNew UInt8,
    VisitID UInt64,
    UserID UInt64,
    ...
    Goals Nested
    (
        ID UInt32,
        Serial UInt32,
        EventTime DateTime,
        Price Int64,
        OrderID String,
        CurrencyID UInt32
    ),
    ...
) ENGINE = CollapsingMergeTree(StartDate, intHash32(UserID), (CounterID, StartDate, intHash32(UserID), VisitID), 8192, Sign)
```

이 예시에서는 전환(목표 달성)에 대한 데이터를 포함하는 `Goals` 중첩 데이터 구조를 선언합니다. `visits` 테이블의 각 행은 0개 또는 임의의 개수의 전환에 대응할 수 있습니다.

[flatten&#95;nested](/operations/settings/settings#flatten_nested)가 기본값과 달리 `0`으로 설정된 경우, 임의의 중첩 수준이 지원됩니다.

대부분의 경우 중첩 데이터 구조를 사용할 때는 컬럼 이름을 점(.)으로 구분하여 지정합니다. 이러한 컬럼들은 동일한 타입으로 이루어진 배열을 구성합니다. 단일 중첩 데이터 구조에 속한 모든 컬럼 배열은 길이가 동일합니다.

예시:

```sql
SELECT
    Goals.ID,
    Goals.EventTime
FROM test.visits
WHERE CounterID = 101500 AND length(Goals.ID) < 5
LIMIT 10
```

```text
┌─Goals.ID───────────────────────┬─Goals.EventTime───────────────────────────────────────────────────────────────────────────┐
│ [1073752,591325,591325]        │ ['2014-03-17 16:38:10','2014-03-17 16:38:48','2014-03-17 16:42:27']                       │
│ [1073752]                      │ ['2014-03-17 00:28:25']                                                                   │
│ [1073752]                      │ ['2014-03-17 10:46:20']                                                                   │
│ [1073752,591325,591325,591325] │ ['2014-03-17 13:59:20','2014-03-17 22:17:55','2014-03-17 22:18:07','2014-03-17 22:18:51'] │
│ []                             │ []                                                                                        │
│ [1073752,591325,591325]        │ ['2014-03-17 11:37:06','2014-03-17 14:07:47','2014-03-17 14:36:21']                       │
│ []                             │ []                                                                                        │
│ []                             │ []                                                                                        │
│ [591325,1073752]               │ ['2014-03-17 00:46:05','2014-03-17 00:46:05']                                             │
│ [1073752,591325,591325,591325] │ ['2014-03-17 13:28:33','2014-03-17 13:30:26','2014-03-17 18:51:21','2014-03-17 18:51:45'] │
└────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────┘
```

Nested 데이터 구조는 길이가 동일한 여러 컬럼 배열로 구성된 집합으로 생각하는 것이 가장 이해하기 쉽습니다.

개별 컬럼 대신 전체 Nested 데이터 구조의 이름을 SELECT 쿼리에서 지정할 수 있는 유일한 곳은 ARRAY JOIN 절입니다. 자세한 내용은 「ARRAY JOIN 절」을 참조하십시오. 예:

```sql
SELECT
    Goal.ID,
    Goal.EventTime
FROM test.visits
ARRAY JOIN Goals AS Goal
WHERE CounterID = 101500 AND length(Goals.ID) < 5
LIMIT 10
```

```text
┌─Goal.ID─┬──────Goal.EventTime─┐
│ 1073752 │ 2014-03-17 16:38:10 │
│  591325 │ 2014-03-17 16:38:48 │
│  591325 │ 2014-03-17 16:42:27 │
│ 1073752 │ 2014-03-17 00:28:25 │
│ 1073752 │ 2014-03-17 10:46:20 │
│ 1073752 │ 2014-03-17 13:59:20 │
│  591325 │ 2014-03-17 22:17:55 │
│  591325 │ 2014-03-17 22:18:07 │
│  591325 │ 2014-03-17 22:18:51 │
│ 1073752 │ 2014-03-17 11:37:06 │
└─────────┴─────────────────────┘
```

중첩된 데이터 구조 전체에 대해 SELECT를 수행할 수 없습니다. 그 일부인 개별 컬럼만 명시적으로 나열할 수 있습니다.

INSERT 쿼리의 경우, 중첩된 데이터 구조를 구성하는 모든 컬럼 배열을 각각 별도로 전달해야 합니다(각각을 개별 컬럼 배열처럼 전달합니다). 삽입 시 시스템은 이들의 길이가 동일한지 확인합니다.

DESCRIBE 쿼리의 경우에도, 중첩된 데이터 구조에 포함된 컬럼들은 동일한 방식으로 각각 개별적으로 나열됩니다.

중첩된 데이터 구조에 포함된 요소에 대한 ALTER 쿼리에는 제한이 있습니다.
