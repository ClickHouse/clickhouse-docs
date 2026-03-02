---
slug: /guides/developer/deduplication
sidebar_label: '중복 제거 전략'
sidebar_position: 3
description: '업서트, 업데이트, 삭제를 자주 수행해야 하는 경우 중복 제거를 사용합니다.'
title: '중복 제거 전략'
keywords: ['중복 제거 전략', '데이터 중복 제거', '업서트', '업데이트 및 삭제', '개발자 가이드']
doc_type: 'guide'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';


# 중복 제거 전략 \{#deduplication-strategies\}

**Deduplication(중복 제거)**은 ***데이터 세트에서 중복된 행을 제거하는 과정***을 의미합니다. OLTP 데이터베이스에서는 각 행이 고유한 기본 키(primary key)를 가지므로 이 작업을 비교적 쉽게 수행할 수 있지만, 삽입 속도가 느려지는 비용이 발생합니다. 삽입되는 각 행은 먼저 검색되어야 하고, 이미 존재하는 경우 교체되어야 합니다.

ClickHouse는 데이터 삽입 속도에 최적화되어 있습니다. 저장 파일은 불변(immutable)이며, ClickHouse는 행을 삽입하기 전에 기존 기본 키를 확인하지 않습니다. 따라서 중복 제거에는 더 많은 작업이 필요합니다. 또한 중복 제거가 즉시 수행되는 것이 아니라 **최종적으로(eventual)** 이루어지며, 이로 인해 다음과 같은 부수 효과가 있습니다.

- 어느 시점에서든 테이블에는 여전히 중복(동일한 정렬 키를 가진 행)이 존재할 수 있습니다.
- 중복된 행의 실제 제거는 파트를 병합하는 과정에서 발생합니다.
- 쿼리는 중복이 존재할 가능성을 허용하도록 작성되어야 합니다.

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication}  alt="Deduplication 로고" size="sm"/>|ClickHouse는 중복 제거를 비롯한 다양한 주제에 대해 무료 교육을 제공합니다. [Deleting and Updating Data 교육 모듈](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)은 시작하기에 좋은 자료입니다.|

</div>

## 중복 제거 옵션 \{#options-for-deduplication\}

중복 제거는 ClickHouse에서 다음과 같은 테이블 엔진을 사용하여 구현됩니다:

1. `ReplacingMergeTree` 테이블 엔진: 이 테이블 엔진을 사용하면 동일한 정렬 키를 가진 중복 행이 머지 과정에서 제거됩니다. `ReplacingMergeTree`는 업서트(upsert) 동작(쿼리에서 마지막으로 삽입된 행을 반환하고자 할 때)을 에뮬레이션하기에 적합한 옵션입니다.

2. 행 접기(Collapsing rows): `CollapsingMergeTree` 및 `VersionedCollapsingMergeTree` 테이블 엔진은 기존 행을 「취소」하고 새 행을 삽입하는 방식의 로직을 사용합니다. `ReplacingMergeTree`보다 구현은 더 복잡하지만, 데이터가 이미 머지되었는지 여부를 신경 쓰지 않고도 쿼리와 집계를 더 단순하게 작성할 수 있습니다. 이 두 테이블 엔진은 데이터를 자주 업데이트해야 할 때 유용합니다.

아래에서 이 두 가지 기법을 모두 살펴봅니다. 더 자세한 내용은 무료 온디맨드 [Deleting and Updating Data 교육 모듈](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)을 참고하십시오.

## Upsert에 ReplacingMergeTree 사용하기 \{#using-replacingmergetree-for-upserts\}

테이블에 Hacker News 댓글이 저장되어 있고, 각 댓글이 조회된 횟수를 나타내는 views 컬럼이 있는 간단한 예제를 살펴보겠습니다. 기사가 게시될 때마다 새 행을 하나 삽입하고, 이후 조회 수가 증가하면 하루에 한 번 총 조회 수를 담은 새 행을 upsert한다고 가정합니다:

```sql
CREATE TABLE hackernews_rmt (
    id UInt32,
    author String,
    comment String,
    views UInt64
)
ENGINE = ReplacingMergeTree
PRIMARY KEY (author, id)
```

두 개의 행을 삽입해 보겠습니다:

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 0),
   (2, 'ch_fan', 'This is post #2', 0)
```

`views` 컬럼을 업데이트하려면 기본 키가 동일한 새 행을 삽입하십시오 (`views` 컬럼의 변경된 값에 유의하십시오):

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

이제 테이블에 4개의 행이 있습니다.

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

위 출력에서 별도의 박스로 표시된 것은 내부적으로 존재하는 두 개의 파트를 보여 줍니다. 이 데이터는 아직 병합되지 않았기 때문에 중복된 행이 아직 제거되지 않았습니다. `SELECT` 쿼리에서 `FINAL` 키워드를 사용하여 쿼리 결과를 논리적으로 병합해 보겠습니다:

```sql
SELECT *
FROM hackernews_rmt
FINAL
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
```

결과에는 2개의 행만 있으며, 마지막으로 삽입된 행이 반환됩니다.

:::note
`FINAL`은 데이터 양이 적을 때는 잘 동작합니다. 하지만 대량의 데이터를 다루는 경우에는
`FINAL`을 사용하는 것이 최선의 선택은 아닐 수 있습니다. 컬럼의 최신 값을 찾기 위한
더 나은 방법에 대해 살펴보겠습니다.
:::


### FINAL 사용 피하기 \{#avoiding-final\}

두 개의 고유 행 각각에 대해 `views` 컬럼을 다시 업데이트합니다.

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

실제 머지 작업이 아직 수행되지 않았기 때문에(이전에 `FINAL`을 사용했을 때는 쿼리 시점에만 머지가 수행되었습니다) 현재 테이블에는 6개의 행이 있습니다.

```sql
SELECT *
FROM hackernews_rmt
```

```response
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   200 │
│  1 │ ricardo │ This is post #1 │   100 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │     0 │
│  1 │ ricardo │ This is post #1 │     0 │
└────┴─────────┴─────────────────┴───────┘
┌─id─┬─author──┬─comment─────────┬─views─┐
│  2 │ ch_fan  │ This is post #2 │   250 │
│  1 │ ricardo │ This is post #1 │   150 │
└────┴─────────┴─────────────────┴───────┘
```

`FINAL`을 사용하는 대신 비즈니스 로직을 사용해 보겠습니다. `views` 컬럼은 항상 증가한다는 것을 알고 있으므로, 원하는 컬럼들로 그룹화한 후 `max` 함수를 사용하여 가장 큰 값을 가진 행을 선택할 수 있습니다.

```sql
SELECT
    id,
    author,
    comment,
    max(views)
FROM hackernews_rmt
GROUP BY (id, author, comment)
```

```response
┌─id─┬─author──┬─comment─────────┬─max(views)─┐
│  2 │ ch_fan  │ This is post #2 │        250 │
│  1 │ ricardo │ This is post #1 │        150 │
└────┴─────────┴─────────────────┴────────────┘
```

위 쿼리에서와 같이 그룹화하는 방식은 쿼리 성능 측면에서 `FINAL` 키워드를 사용하는 것보다 실제로 더 효율적일 수 있습니다.

[Deleting and Updating Data 교육 모듈](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse\&utm_medium=docs)은 이 예제를 더 확장하여, `ReplacingMergeTree`에서 `version` 컬럼을 활용하는 방법까지 다룹니다.


## 컬럼을 자주 업데이트할 때 CollapsingMergeTree 사용하기 \{#using-collapsingmergetree-for-updating-columns-frequently\}

컬럼을 업데이트한다는 것은 기존 행을 삭제하고 새 값으로 교체하는 작업을 의미합니다. 이미 본 것처럼, ClickHouse에서 이러한 유형의 변경(mutation)은 *머지(merge) 시점에* 결국(eventually) 적용됩니다. 업데이트해야 하는 행이 많다면, `ALTER TABLE..UPDATE`를 사용하는 대신 기존 데이터와 함께 새 데이터를 그대로 삽입하는 편이 더 효율적일 수 있습니다. 데이터가 오래된 것인지(stale) 또는 새로운 것인지를 나타내는 컬럼을 추가할 수도 있습니다. 그리고 사실 이러한 동작을 매우 잘 구현해 둔 테이블 엔진이 이미 존재합니다. 특히 오래된 데이터를 자동으로 삭제해 준다는 점에서 매우 유용합니다. 어떻게 동작하는지 살펴보겠습니다.

외부 시스템을 사용해 Hacker News 댓글의 조회 수를 추적하고, 몇 시간 간격으로 그 데이터를 ClickHouse에 적재한다고 가정하겠습니다. 오래된 행은 삭제되고, 새로운 행이 각 Hacker News 댓글의 최신 상태를 나타내도록 하고 싶습니다. 이러한 동작을 구현하기 위해 `CollapsingMergeTree`를 사용할 수 있습니다.

조회 수를 저장할 테이블을 다음과 같이 정의해 보겠습니다:

```sql
CREATE TABLE hackernews_views (
    id UInt32,
    author String,
    views UInt64,
    sign Int8
)
ENGINE = CollapsingMergeTree(sign)
PRIMARY KEY (id, author)
```

`hackernews_views` 테이블에는 sign이라는 이름의 `Int8` 컬럼이 있으며, 이를 **sign** 컬럼이라고 합니다. sign 컬럼의 이름은 임의로 정할 수 있지만 `Int8` 데이터 타입이어야 하며, 이 컬럼 이름이 `CollapsingMergeTree` 테이블의 생성자에 전달된다는 점에 유의하십시오.

`CollapsingMergeTree` 테이블의 sign 컬럼은 무엇입니까? 이 컬럼은 행의 *상태(state)*를 나타내며, sign 컬럼 값은 1 또는 -1만 허용됩니다. 동작 방식은 다음과 같습니다.

* 두 행이 동일한 기본 키(또는 기본 키와 다를 경우 정렬 순서)를 가지지만 sign 컬럼 값이 서로 다른 경우, 마지막에 +1로 삽입된 행이 상태 행이 되고 나머지 행들은 서로 상쇄됩니다.
* 서로 상쇄되는 행들은 머지 과정에서 삭제됩니다.
* 짝이 맞지 않는 행들은 유지됩니다.

이제 `hackernews_views` 테이블에 행을 하나 추가해 보겠습니다. 이 기본 키에 대한 유일한 행이므로 상태를 1로 설정합니다.

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

이제 views 컬럼을 변경하고자 한다고 가정해 보겠습니다. 두 개의 행을 삽입합니다. 하나는 기존 행을 무효화하는 것이고, 다른 하나는 행의 새로운 상태를 나타냅니다.

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

이제 테이블에는 기본 키 `(123, 'ricardo')`인 행이 3개 있습니다:

```sql
SELECT *
FROM hackernews_views
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │   -1 │
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │     0 │    1 │
└─────┴─────────┴───────┴──────┘
```

`FINAL`을 추가하면 현재 상태의 행이 반환된다는 점에 유의하십시오:`

```sql
SELECT *
FROM hackernews_views
FINAL
```

```response
┌──id─┬─author──┬─views─┬─sign─┐
│ 123 │ ricardo │   150 │    1 │
└─────┴─────────┴───────┴──────┘
```

하지만 물론, 대용량 테이블에서 `FINAL`을 사용하는 것은 권장되지 않습니다.

:::note
예시에서 `views` 컬럼에 전달되는 값은 실제로 필요하지 않으며, 이전 행의 현재 `views` 값과 일치할 필요도 없습니다. 사실, 기본 키와 -1만으로도 해당 행을 무효화할 수 있습니다:

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```

:::


## 여러 스레드에서의 실시간 업데이트 \{#real-time-updates-from-multiple-threads\}

`CollapsingMergeTree` 테이블에서는 행이 sign 컬럼을 사용해 서로를 상쇄하며, 행의 상태는 마지막으로 삽입된 행에 의해 결정됩니다. 그러나 여러 스레드에서 행을 삽입하면서 삽입 순서가 뒤섞일 수 있는 경우에는 문제가 될 수 있습니다. 이런 상황에서는 「마지막」 행을 사용하는 방식이 제대로 동작하지 않습니다.

이때 `VersionedCollapsingMergeTree`가 유용합니다. 이 엔진은 `CollapsingMergeTree`와 마찬가지로 행을 축약(collapse)하지만, 마지막으로 삽입된 행을 유지하는 대신, 사용자가 지정한 버전 컬럼의 값이 가장 큰 행을 유지합니다.

예를 살펴보겠습니다. Hacker News 댓글의 조회수를 추적하려고 하고, 데이터가 자주 업데이트된다고 가정합니다. 머지 작업을 강제하거나 기다리지 않고도 보고에 최신 값을 사용하고자 합니다. 이를 위해 `CollapsedMergeTree`와 유사한 테이블을 시작점으로 하되, 행 상태의 버전을 저장하기 위한 컬럼을 하나 추가합니다:

```sql
CREATE TABLE hackernews_views_vcmt (
    id UInt32,
    author String,
    views UInt64,
    sign Int8,
    version UInt32
)
ENGINE = VersionedCollapsingMergeTree(sign, version)
PRIMARY KEY (id, author)
```

이 테이블은 엔진으로 `VersionsedCollapsingMergeTree`를 사용하며 **sign 컬럼**과 **version 컬럼**을 지정합니다. 이 테이블이 동작하는 방식은 다음과 같습니다:

* 동일한 기본 키와 버전 값을 가지되 sign 값이 서로 다른 행 쌍을 삭제합니다.
* 행이 삽입된 순서는 중요하지 않습니다.
* version 컬럼이 기본 키의 일부가 아니면, ClickHouse가 기본 키의 마지막 필드로 version 컬럼을 암묵적으로 추가합니다.

쿼리를 작성할 때에도 유사한 방식의 로직을 사용합니다. 기본 키로 GROUP BY를 수행하고, 취소되었지만 아직 삭제되지 않은 행을 피하기 위한 로직을 적용합니다. 이제 `hackernews_views_vcmt` 테이블에 몇 개의 행을 추가해 보겠습니다:

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

이제 두 개의 행을 업데이트하고 그중 하나를 삭제합니다. 행을 삭제하려면 이전 버전 번호를 반드시 포함해야 합니다(기본 키의 일부이기 때문입니다).

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

앞에서와 마찬가지로 sign 컬럼의 부호에 따라 값을 더하거나 빼도록 하는 동일한 쿼리를 실행합니다:

```sql
SELECT
    id,
    author,
    sum(views * sign)
FROM hackernews_views_vcmt
GROUP BY (id, author)
HAVING sum(sign) > 0
ORDER BY id ASC
```

결과는 두 개의 행입니다.

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

강제로 테이블 병합을 실행해 보겠습니다:

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

결과에는 행이 두 개만 있어야 합니다:

```sql
SELECT *
FROM hackernews_views_vcmt
```

```response
┌─id─┬─author──┬─views─┬─sign─┬─version─┐
│  1 │ ricardo │    50 │    1 │       2 │
│  3 │ kenny   │  1000 │    1 │       2 │
└────┴─────────┴───────┴──────┴─────────┘
```

`VersionedCollapsingMergeTree` 테이블은 여러 클라이언트나 스레드에서 행을 삽입하면서 동시에 중복 제거를 구현해야 할 때 매우 유용합니다.


## 내 행이 중복 제거되지 않는 이유는 무엇입니까? \{#why-arent-my-rows-being-deduplicated\}

삽입된 행이 중복 제거되지 않는 한 가지 이유는 `INSERT` 문에서 멱등이 아닌(non-idempotent) 함수나 표현식을 사용하는 경우입니다. 예를 들어, `createdAt DateTime64(3) DEFAULT now()` 컬럼과 함께 행을 삽입하면, 각 행의 `createdAt` 컬럼 기본값이 모두 다르기 때문에 행이 반드시 고유해집니다. MergeTree / ReplicatedMergeTree 테이블 엔진은 각 삽입된 행이 고유한 체크섬을 생성하므로, 이 행들을 중복 제거해야 한다는 사실을 인지하지 못합니다.

이 경우 동일한 배치를 여러 번 삽입하더라도 동일한 행이 다시 삽입되지 않도록, 각 행 배치에 대해 직접 `insert_deduplication_token` 값을 지정할 수 있습니다. 이 설정의 사용 방법에 대한 자세한 내용은 [`insert_deduplication_token`에 대한 문서](/operations/settings/settings#insert_deduplication_token)를 참고하십시오.