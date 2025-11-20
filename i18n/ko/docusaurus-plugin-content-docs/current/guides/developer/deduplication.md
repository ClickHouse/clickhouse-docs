---
'slug': '/guides/developer/deduplication'
'sidebar_label': '중복 제거 전략'
'sidebar_position': 3
'description': '자주 upserts, 업데이트 및 삭제를 수행해야 할 때 중복 제거를 사용하십시오.'
'title': '중복 제거 전략'
'keywords':
- 'deduplication strategies'
- 'data deduplication'
- 'upserts'
- 'updates and deletes'
- 'developer guide'
'doc_type': 'guide'
---

import deduplication from '@site/static/images/guides/developer/de_duplication.png';
import Image from '@theme/IdealImage';


# 중복 제거 전략

**중복 제거**는 ***데이터셋의 중복 행을 제거하는 과정***을 의미합니다. OLTP 데이터베이스에서는 각 행에 고유한 기본 키가 있기 때문에 쉽게 수행할 수 있지만, 이는 느린 삽입이라는 대가를 치르게 됩니다. 삽입된 각 행은 먼저 검색되어야 하며, 발견될 경우 교체되어야 합니다.

ClickHouse는 데이터 삽입 속도를 위해 설계되었습니다. 저장 파일은 변경 불가능하며 ClickHouse는 행을 삽입하기 전에 기존의 기본 키를 확인하지 않기 때문에 중복 제거에는 조금 더 많은 노력이 필요합니다. 또한 이로 인해 중복 제거는 즉각적이지 않으며 **최종적**입니다. 이는 몇 가지 부작용을 초래합니다:

- 언제든지 테이블에 중복이 존재할 수 있습니다 (같은 정렬 키를 가진 행)
- 중복 행의 실제 제거는 파트 병합 중에 발생합니다.
- 쿼리는 중복의 가능성을 허용해야 합니다.

<div class='transparent-table'>

|||
|------|----|
|<Image img={deduplication} alt="중복 제거 로고" size="sm"/>|ClickHouse는 중복 제거 및 기타 여러 주제에 대한 무료 교육을 제공합니다. [데이터 삭제 및 업데이트 교육 모듈](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)은 시작하기에 좋은 장소입니다.|

</div>

## 중복 제거 옵션 {#options-for-deduplication}

중복 제거는 ClickHouse의 다음 테이블 엔진을 사용하여 구현됩니다:

1. `ReplacingMergeTree` 테이블 엔진: 이 테이블 엔진을 사용하면, 동일한 정렬 키를 가진 중복 행이 병합 중에 제거됩니다. `ReplacingMergeTree`는 마지막으로 삽입된 행을 반환하고 싶은 경우(업서트 동작을 에뮬레이트) 좋은 옵션입니다.

2. 행 병합: `CollapsingMergeTree` 및 `VersionedCollapsingMergeTree` 테이블 엔진은 기존 행이 "취소"되고 새 행이 삽입되는 로직을 사용합니다. 이 엔진들은 `ReplacingMergeTree`보다 구현이 더 복잡하지만, 데이터가 병합되었는지 여부에 대해 걱정하지 않고 쿼리 및 집계를 더 간단하게 작성할 수 있습니다. 이 두 테이블 엔진은 데이터 업데이트가 잦을 때 유용합니다.

아래에서 이 두 가지 기술을 살펴보겠습니다. 더 많은 세부정보는 우리의 무료 주문형 [데이터 삭제 및 업데이트 교육 모듈](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)을 참조하십시오.

## Upserts를 위한 ReplacingMergeTree 사용하기 {#using-replacingmergetree-for-upserts}

Hacker News 댓글을 포함하는 테이블의 간단한 예를 살펴보겠습니다. 이 테이블은 댓글이 조회된 횟수를 나타내는 views 컬럼을 가지고 있습니다. 기사가 게시될 때 새 행을 삽입하고 하루에 한 번 조회수가 증가하면 총 조회수로 새 행을 업서트한다고 가정합니다:

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

`views` 컬럼을 업데이트하려면 동일한 기본 키로 새 행을 삽입합니다(새로운 `views` 컬럼의 값 참조):

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 100),
   (2, 'ch_fan', 'This is post #2', 200)
```

테이블에는 이제 4개의 행이 있습니다:

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

출력 위의 별개의 상자는 비하인드 씬에서 두 개의 파트를 보여줍니다 - 이 데이터는 아직 병합되지 않았으므로, 중복 행이 제거되지 않았습니다. `SELECT` 쿼리에서 `FINAL` 키워드를 사용해 보겠습니다. 이는 쿼리 결과의 논리적 병합을 유도합니다:

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

결과에는 2개의 행만 포함되며, 마지막으로 삽입된 행이 반환됩니다.

:::note
데이터 양이 적을 경우 `FINAL`을 사용하는 것은 괜찮습니다. 그러나 대량의 데이터를 다룰 때는 `FINAL` 사용이 최선의 선택이 아닐 수 있습니다. 열의 최신 값을 찾기 위한 더 나은 옵션에 대해 논의해 봅시다.
:::

### FINAL 회피하기 {#avoiding-final}

고유한 두 행의 `views` 컬럼을 다시 업데이트해 보겠습니다:

```sql
INSERT INTO hackernews_rmt VALUES
   (1, 'ricardo', 'This is post #1', 150),
   (2, 'ch_fan', 'This is post #2', 250)
```

실제 병합이 일어나지 않았기 때문에 테이블에는 이제 6개의 행이 있습니다(우리가 `FINAL`을 사용했을 때 쿼리 시간 병합만 발생했습니다).

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

`FINAL`을 사용하는 대신 비즈니스 로직을 사용해 보겠습니다 - `views` 컬럼은 항상 증가하고 있으므로, 원하는 컬럼으로 그룹화한 후 `max` 함수를 사용하여 가장 큰 값을 가진 행을 선택할 수 있습니다:

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

위 쿼리와 같이 그룹화하는 것이 실제로 `FINAL` 키워드를 사용하는 것보다 쿼리 성능 측면에서 더 효율적일 수 있습니다.

우리의 [데이터 삭제 및 업데이트 교육 모듈](https://learn.clickhouse.com/visitor_catalog_class/show/1328954/?utm_source=clickhouse&utm_medium=docs)은 이 예제를 확장하며 `ReplacingMergeTree`와 함께 `version` 컬럼을 사용하는 방법에 대해 설명합니다.

## 자주 컬럼 업데이트를 위해 CollapsingMergeTree 사용하기 {#using-collapsingmergetree-for-updating-columns-frequently}

컬럼 업데이트는 기존 행을 삭제하고 새 값으로 교체하는 작업을 포함합니다. 이미 보셨듯이, ClickHouse에서 이러한 유형의 변형은 _최종적으로_ 발생합니다 - 병합 중에. 업데이트할 행이 많다면 `ALTER TABLE..UPDATE`를 피하고 기존 데이터 옆에 새 데이터를 삽입하는 것이 더 효율적일 수 있습니다. 데이터를 오래된 것인지 새로운 것인지 표시하는 컬럼을 추가할 수 있습니다... 그리고 실제로 이러한 동작을 잘 구현하는 테이블 엔진이 있습니다. 이를 살펴보겠습니다.

Hacker News 댓글의 조회 수를 외부 시스템을 사용하여 추적하고 몇 시간마다 ClickHouse로 데이터를 푸시한다고 가정해 보겠습니다. 우리는 오래된 행이 삭제되고 새 행이 각 Hacker News 댓글의 새로운 상태를 나타내기를 원합니다. 이 동작을 구현하기 위해 `CollapsingMergeTree`를 사용할 수 있습니다.

조회 수를 저장하기 위한 테이블을 정의해 보겠습니다:

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

`hackernews_views` 테이블에는 **sign** 컬럼이라고 하는 `Int8` 형 컬럼이 포함되어 있습니다. sign 컬럼의 이름은 임의적이지만, `Int8` 데이터 타입은 필수이며, sign 컬럼 이름이 `CollapsingMergeTree` 테이블의 생성자에 전달되었음을 주목하십시오.

`CollapsingMergeTree` 테이블의 sign 컬럼은 무엇인가요? 행의 _상태_를 나타내며, sign 컬럼은 1 또는 -1만 가질 수 있습니다. 이 방식은 다음과 같은 방식으로 작동합니다:

- 두 행이 동일한 기본 키를 가지지만 (기본 키와 다른 정렬 순서) sign 컬럼의 값이 다르면, +1로 마지막에 삽입된 행이 상태 행이 되고 다른 행들은 서로를 취소합니다.
- 서로를 취소하는 행들은 병합 중에 삭제됩니다.
- 일치하는 쌍이 없는 행들은 유지됩니다.

`hackernews_views` 테이블에 행을 추가해 보겠습니다. 이 기본 키의 유일한 행이기 때문에 상태를 1로 설정합니다:

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, 1)
```

이제 `views` 컬럼을 변경하려고 합니다. 기존 행을 취소하고 행의 새로운 상태를 포함하는 두 행을 삽입합니다:

```sql
INSERT INTO hackernews_views VALUES
   (123, 'ricardo', 0, -1),
   (123, 'ricardo', 150, 1)
```

테이블에는 이제 기본 키 `(123, 'ricardo')`로 3개의 행이 있습니다:

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

`FINAL`을 추가하면 현재 상태의 행이 반환됩니다:

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

하지만 물론, 큰 테이블에 대해 `FINAL`을 사용하는 것은 권장되지 않습니다.

:::note
우리 예제에서 `views` 컬럼에 전달된 값은 실제로 필요하지 않으며, 반드시 이전 행의 현재 `views` 값과 일치할 필요는 없습니다. 실제로, 기본 키와 -1로 행을 취소할 수 있습니다:

```sql
INSERT INTO hackernews_views(id, author, sign) VALUES
   (123, 'ricardo', -1)
```
:::

## 여러 스레드에서 실시간 업데이트 {#real-time-updates-from-multiple-threads}

`CollapsingMergeTree` 테이블에서는 행이 sign 컬럼을 사용하여 서로를 취소하며, 행의 상태는 마지막으로 삽입된 행에 의해 결정됩니다. 하지만 이는 서로 다른 스레드에서 행을 삽입하는 경우 문제가 될 수 있으며, 행이 순서대로 삽입되지 않을 수 있습니다. 이 경우 마지막 행을 사용하는 것은 효과가 없습니다.

여기서 `VersionedCollapsingMergeTree`가 유용합니다. 이 테이블은 `CollapsingMergeTree`처럼 행을 병합하지만, 마지막으로 삽입된 행 대신 사용자가 지정한 version 컬럼의 값이 가장 높은 행을 유지합니다.

예를 살펴보겠습니다. Hacker News 댓글의 조회 수를 추적하고 데이터가 자주 업데이트된다고 가정해 보겠습니다. 우리는 보고가 병합을 강제하거나 기다리지 않고 최신 값을 사용하기를 원합니다. 우리는 상태 행의 버전을 저장하는 컬럼을 추가한 `CollapsedMergeTree`와 비슷한 테이블로 시작합니다:

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

테이블은 엔진으로 `VersionsedCollapsingMergeTree`를 사용하며, **sign 컬럼**과 **version 컬럼**을 전달합니다. 테이블의 작동 방식은 다음과 같습니다:

- 동일한 기본 키와 버전을 가지며 sign이 다른 각 행 쌍을 삭제합니다.
- 행의 삽입 순서는 중요하지 않습니다.
- 버전 컬럼이 기본 키의 일부가 아닌 경우, ClickHouse는 마지막 필드로 기본 키에 암묵적으로 추가합니다.

쿼리를 작성할 때에도 같은 유형의 로직을 사용합니다 - 기본 키로 그룹화하고 삭제되지 않은 취소된 행을 피하기 위해 영리한 로직을 사용합니다. `hackernews_views_vcmt` 테이블에 행을 추가해 보겠습니다:

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, 1, 1),
   (2, 'ch_fan', 0, 1, 1),
   (3, 'kenny', 0, 1, 1)
```

이제 두 개의 행을 업데이트하고 그 중 하나를 삭제합니다. 행을 취소하려면 이전 버전 번호를 포함하세요(기본 키의 일부이므로):

```sql
INSERT INTO hackernews_views_vcmt VALUES
   (1, 'ricardo', 0, -1, 1),
   (1, 'ricardo', 50, 1, 2),
   (2, 'ch_fan', 0, -1, 1),
   (3, 'kenny', 0, -1, 1),
   (3, 'kenny', 1000, 1, 2)
```

신중하게 값을 더하고 빼는 동일한 쿼리를 실행하겠습니다:

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

결과는 두 개의 행입니다:

```response
┌─id─┬─author──┬─sum(multiply(views, sign))─┐
│  1 │ ricardo │                         50 │
│  3 │ kenny   │                       1000 │
└────┴─────────┴────────────────────────────┘
```

테이블 병합을 강제로 실행해 보겠습니다:

```sql
OPTIMIZE TABLE hackernews_views_vcmt
```

결과에는 오직 두 개의 행만 있어야 합니다:

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

`VersionedCollapsingMergeTree` 테이블은 여러 클라이언트 및/또는 스레드에서 행을 삽입하면서 중복 제거를 구현하고자 할 때 매우 유용합니다.

## 내 행이 중복 제거되지 않는 이유는 무엇인가요? {#why-arent-my-rows-being-deduplicated}

삽입된 행이 중복 제거되지 않는 한 가지 이유는 `INSERT` 문에서 비멱등 함수 또는 표현식을 사용 중일 경우입니다. 예를 들어, 컬럼 `createdAt DateTime64(3) DEFAULT now()`로 행을 삽입하는 경우, 각 행이 고유한 기본값을 가질 것이기 때문에 행은 고유하다는 보장이 있습니다. MergeTree / ReplicatedMergeTree 테이블 엔진은 각 삽입된 행이 고유한 체크섬을 생성할 것이기 때문에 행을 중복 제거해야 한다고 알지 못합니다.

이 경우, 각 행 배치에 대한 `insert_deduplication_token`을 지정하여 동일한 배치의 여러 삽입이 동일한 행을 재삽입하지 않도록 할 수 있습니다. 이 설정을 사용하는 방법에 대한 자세한 내용은 [insert_deduplication_token에 대한 문서](/operations/settings/settings#insert_deduplication_token)를 참조하십시오.
