---
description: '매개변수 집계 함수에 대한 문서'
sidebar_label: '매개변수형'
sidebar_position: 38
slug: /sql-reference/aggregate-functions/parametric-functions
title: '매개변수 집계 함수'
doc_type: 'reference'
---

# 매개변수형 집계 함수(Parametric aggregate functions) \{#parametric-aggregate-functions\}

일부 집계 함수는 인수 컬럼(압축에 사용됨)뿐만 아니라 초기화를 위한 상수 매개변수 집합도 받을 수 있습니다. 구문은 하나 대신 두 쌍의 괄호를 사용하는 방식입니다. 첫 번째 괄호 쌍은 매개변수를, 두 번째 괄호 쌍은 인수를 지정합니다.

## histogram \{#histogram\}

적응형 히스토그램을 계산합니다. 정확한 결과를 보장하지 않습니다.

```sql
histogram(number_of_bins)(values)
```

이 함수는 [A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)을 사용합니다. 히스토그램 빈(bin)의 경계는 새로운 데이터가 함수에 입력될 때마다 조정됩니다. 일반적으로 빈의 너비는 서로 같지 않습니다.

**인수(Arguments)**

`values` — 입력 값으로 평가되는 [Expression](/sql-reference/syntax#expressions).

**파라미터(Parameters)**

`number_of_bins` — 히스토그램에서 빈의 개수에 대한 상한입니다. 함수는 빈의 개수를 자동으로 계산합니다. 지정된 빈 개수에 도달하도록 시도하지만, 실패할 경우 더 적은 빈 개수를 사용합니다.

**반환 값(Returned values)**

* 다음 형식의 [Tuples](../../sql-reference/data-types/tuple.md)로 이루어진 [Array](../../sql-reference/data-types/array.md):

  ```
  [(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
  ```

  * `lower` — 빈의 하한값입니다.
  * `upper` — 빈의 상한값입니다.
  * `height` — 빈의 높이입니다.

**예시(Example)**

```sql
SELECT histogram(5)(number + 1)
FROM (
    SELECT *
    FROM system.numbers
    LIMIT 20
)
```

```text
┌─histogram(5)(plus(number, 1))───────────────────────────────────────────┐
│ [(1,4.5,4),(4.5,8.5,4),(8.5,12.75,4.125),(12.75,17,4.625),(17,20,3.25)] │
└─────────────────────────────────────────────────────────────────────────┘
```

예를 들어 [bar](/sql-reference/functions/other-functions#bar) 함수를 사용하여 히스토그램을 시각화할 수 있습니다.

```sql
WITH histogram(5)(rand() % 100) AS hist
SELECT
    arrayJoin(hist).3 AS height,
    bar(height, 0, 6, 5) AS bar
FROM
(
    SELECT *
    FROM system.numbers
    LIMIT 20
)
```

```text
┌─height─┬─bar───┐
│  2.125 │ █▋    │
│   3.25 │ ██▌   │
│  5.625 │ ████▏ │
│  5.625 │ ████▏ │
│  3.375 │ ██▌   │
└────────┴───────┘
```

이 경우 히스토그램 구간 경계를 알 수 없다는 점을 유의해야 합니다.

## sequenceMatch \{#sequencematch\}

시퀀스에 지정된 패턴에 맞는 이벤트 체인이 포함되어 있는지 확인합니다.

**구문**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
같은 초에 발생하는 이벤트는 시퀀스 내에서 순서가 정의되지 않을 수 있어 결과에 영향을 줄 수 있습니다.
:::

**인수(Arguments)**

* `timestamp` — 시간 데이터를 포함하는 것으로 간주되는 컬럼입니다. 일반적인 데이터 타입은 `Date`와 `DateTime`입니다. 지원되는 [UInt](../../sql-reference/data-types/int-uint.md) 데이터 타입 가운데 어떤 것이든 사용할 수 있습니다.

* `cond1`, `cond2` — 이벤트 연쇄를 설명하는 조건입니다. 데이터 타입: `UInt8`. 최대 32개의 조건 인수를 전달할 수 있습니다. 함수는 이 조건들로 설명되는 이벤트만을 고려합니다. 시퀀스에 조건으로 설명되지 않은 데이터가 포함되어 있으면 함수는 이를 건너뜁니다.

**매개변수(Parameters)**

* `pattern` — 패턴 문자열입니다. [Pattern syntax](#pattern-syntax)를 참조하십시오.

**반환 값(Returned values)**

* 패턴이 일치하면 1.
* 패턴이 일치하지 않으면 0.

타입(Type): `UInt8`.

#### 패턴 구문 \{#pattern-syntax\}

* `(?N)` — 위치 `N`에 있는 조건 인수와 일치합니다. 조건은 `[1, 32]` 범위에서 번호가 매겨집니다. 예를 들어, `(?1)`은 `cond1` 매개변수에 전달된 인수와 일치합니다.

* `.*` — 임의 개수의 이벤트와 일치합니다. 이 패턴 요소를 매칭하는 데 조건 인수가 필요하지 않습니다.

* `(?t operator value)` — 두 이벤트 사이에 두어야 하는 시간을 초 단위로 설정합니다. 예를 들어, 패턴 `(?1)(?t>1800)(?2)`는 서로 1800초보다 더 긴 간격을 두고 발생하는 이벤트와 일치합니다. 이 이벤트들 사이에는 임의 개수의 어떤 이벤트가 와도 됩니다. `>=`, `>`, `<`, `<=`, `==` 연산자를 사용할 수 있습니다.

**예시**

`t` 테이블의 데이터를 살펴보십시오:

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

다음 쿼리를 실행합니다:

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

이 FUNCTION은 숫자 1 다음에 숫자 2가 오는 이벤트 체인을 찾았습니다. 그 사이에 있는 숫자 3은 이벤트로 정의되지 않았기 때문에 건너뛰었습니다. 예제에서 제시된 이벤트 체인을 검색할 때 이 숫자도 고려하려면, 이에 대한 조건을 만들어야 합니다.

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

이 경우에는 함수가 패턴과 일치하는 이벤트 체인을 찾지 못했습니다. 숫자 3에 대한 이벤트가 1과 2 사이에 발생했기 때문입니다. 같은 상황에서 숫자 4에 대한 조건을 확인했다면, 시퀀스는 패턴과 일치했을 것입니다.

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**참고**

* [sequenceCount](#sequencecount)

## sequenceCount \{#sequencecount\}

패턴과 일치하는 이벤트 체인의 개수를 셉니다. 이 FUNCTION은 서로 겹치지 않는 이벤트 체인을 검색하며, 현재 체인이 일치하면 그다음 체인부터 검색을 시작합니다.

:::note
같은 초에 발생하는 이벤트는 시퀀스 내에서 정의되지 않은 순서로 배치될 수 있으며, 이로 인해 결과에 영향을 미칠 수 있습니다.
:::

**구문**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**인자(Arguments)**

* `timestamp` — 시간 데이터를 포함하는 컬럼으로 간주됩니다. 일반적인 데이터 타입은 `Date` 및 `DateTime`입니다. 지원되는 [UInt](../../sql-reference/data-types/int-uint.md) 데이터 타입을 사용할 수도 있습니다.

* `cond1`, `cond2` — 이벤트 체인을 설명하는 조건입니다. 데이터 타입: `UInt8`. 최대 32개의 조건 인자를 전달할 수 있습니다. 함수는 이 조건들로 설명되는 이벤트만 고려합니다. 시퀀스에 조건으로 설명되지 않은 데이터가 포함되어 있으면, 함수는 이를 건너뜁니다.

**파라미터(Parameters)**

* `pattern` — 패턴 문자열입니다. [Pattern syntax](#pattern-syntax)를 참조하십시오.

**반환 값(Returned values)**

* 서로 겹치지 않으면서 패턴과 일치하는 이벤트 체인의 개수입니다.

타입: `UInt64`.

**예시(Example)**

`t` 테이블에 다음과 같은 데이터가 있다고 가정합니다:

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
│    4 │      1 │
│    5 │      3 │
│    6 │      2 │
└──────┴────────┘
```

숫자 1 이후에(그 사이에는 임의의 개수의 다른 숫자가 올 수 있을 때) 숫자 2가 나타나는 횟수를 셉니다:

```sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```

## sequenceMatchEvents \{#sequencematchevents\}

패턴과 일치하는 가장 긴 이벤트 체인의 이벤트 타임스탬프를 반환합니다.

:::note
같은 초에 발생한 이벤트는 시퀀스 내에서 정의되지 않은 순서로 배치될 수 있으며, 결과에 영향을 줄 수 있습니다.
:::

**구문**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**인수(Arguments)**

* `timestamp` — 시간 데이터를 포함하는 것으로 간주되는 컬럼입니다. 일반적인 데이터 타입은 `Date` 및 `DateTime`입니다. 지원되는 [UInt](../../sql-reference/data-types/int-uint.md) 데이터 타입을 사용할 수도 있습니다.

* `cond1`, `cond2` — 이벤트 체인을 설명하는 조건입니다. 데이터 타입: `UInt8`. 최대 32개의 조건 인수를 전달할 수 있습니다. 함수는 이 조건들로 설명되는 이벤트만을 고려합니다. 시퀀스에 조건으로 설명되지 않은 데이터가 포함되어 있으면, 함수는 해당 데이터를 건너뜁니다.

**매개변수(Parameters)**

* `pattern` — 패턴 문자열입니다. 자세한 내용은 [Pattern syntax](#pattern-syntax)를 참조하십시오.

**반환 값(Returned values)**

* 이벤트 체인에서 일치하는 조건 인수 (?N)에 해당하는 타임스탬프 배열입니다. 배열에서의 위치는 패턴에서 조건 인수의 위치와 일치합니다.

타입(Type): Array.

**예시(Example)**

다음은 `t` 테이블의 데이터입니다:

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
│    4 │      1 │
│    5 │      3 │
│    6 │      2 │
└──────┴────────┘
```

가장 긴 체인의 이벤트 타임스탬프를 반환합니다.

```sql
SELECT sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│ [1,3,4]                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**관련 항목**

* [sequenceMatch](#sequencematch)

## windowFunnel \{#windowfunnel\}

슬라이딩 시간 윈도우에서 이벤트 체인을 찾고, 해당 체인에서 발생한 이벤트의 최대 개수를 계산합니다.

이 함수는 다음 알고리즘에 따라 동작합니다.

* 함수는 체인에서 첫 번째 조건을 만족하는 데이터를 찾고, 이벤트 카운터를 1로 설정합니다. 이 시점부터 슬라이딩 윈도우가 시작됩니다.

* 윈도우 내에서 체인의 이벤트가 순차적으로 발생하면 카운터가 증가합니다. 이벤트의 순서가 깨지면 카운터는 증가하지 않습니다.

* 데이터에 서로 다른 진행 단계에 있는 여러 이벤트 체인이 존재하는 경우, 함수는 가장 긴 체인의 길이만 반환합니다.

**구문**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**인자(Arguments)**

* `timestamp` — 타임스탬프를 포함하는 컬럼 이름입니다. 지원되는 데이터 타입: [Date](../../sql-reference/data-types/date.md), [DateTime](/sql-reference/data-types/datetime) 및 기타 부호 없는 정수 타입(타임스탬프가 `UInt64` 타입을 지원하더라도 값은 Int64 최대값인 2^63 - 1을 초과할 수 없음에 유의하십시오).
* `cond` — 이벤트 체인을 설명하는 조건 또는 데이터입니다. [UInt8](../../sql-reference/data-types/int-uint.md).

**파라미터(Parameters)**

* `window` — 슬라이딩 윈도우의 길이로, 첫 번째 조건과 마지막 조건 사이의 시간 간격입니다. `window`의 단위는 `timestamp` 자체에 따라 달라지며, 식 `timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window`를 사용하여 결정합니다.
* `mode` — 선택적 인자입니다. 하나 이상의 모드를 설정할 수 있습니다.
  * `'strict_deduplication'` — 동일한 조건이 연속된 이벤트에 대해 성립하는 경우, 그러한 반복 이벤트 이후의 처리가 중단됩니다. 참고로, 하나의 이벤트에 대해 여러 조건이 동시에 성립하면 예상과 다르게 동작할 수 있습니다.
  * `'strict_order'` — 다른 이벤트가 중간에 끼어드는 것을 허용하지 않습니다. 예를 들어 `A->B->D->C` 인 경우, `D`에서 `A->B->C` 탐색을 중단하며 최대 이벤트 단계는 2가 됩니다.
  * `'strict_increase'` — 타임스탬프가 엄격히 증가하는 이벤트에만 조건을 적용합니다.
  * `'strict_once'` — 조건을 여러 번 만족하더라도 체인에서 각 이벤트를 한 번만 계산합니다.
  * `'allow_reentry'` — 엄격한 순서를 위반하는 이벤트를 무시합니다. 예: A-&gt;A-&gt;B-&gt;C 인 경우, 중복된 A를 무시하여 A-&gt;B-&gt;C 를 찾으며 최대 이벤트 단계는 3입니다.

**반환 값**

슬라이딩 시간 윈도우 내에서 체인에서 연속으로 트리거된 조건의 최대 개수입니다.
선택된 모든 체인을 분석합니다.

타입: `Integer`.

**예시**

온라인 상점에서 사용자가 휴대폰을 선택하고 두 번 구매하기에 특정 기간이 충분한지 판단합니다.

다음 이벤트 체인을 설정합니다:

1. 사용자가 상점 계정에 로그인했습니다 (`eventID = 1003`).
2. 사용자가 휴대폰을 검색했습니다 (`eventID = 1007, product = 'phone'`).
3. 사용자가 주문을 완료했습니다 (`eventID = 1009`).
4. 사용자가 주문을 한 번 더 완료했습니다 (`eventID = 1010`).

입력 테이블:

```text
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-01-28 │       1 │ 2019-01-29 10:00:00 │    1003 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-01-31 │       1 │ 2019-01-31 09:00:00 │    1007 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-01-30 │       1 │ 2019-01-30 08:00:00 │    1009 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-02-01 │       1 │ 2019-02-01 08:00:00 │    1010 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
```

2019년 1월부터 2월 사이 기간 동안 사용자 `user_id`가 체인에서 어디까지 진행했는지 확인합니다.

쿼리:

```sql
SELECT
    level,
    count() AS c
FROM
(
    SELECT
        user_id,
        windowFunnel(6048000000000000)(timestamp, eventID = 1003, eventID = 1009, eventID = 1007, eventID = 1010) AS level
    FROM trend
    WHERE (event_date >= '2019-01-01') AND (event_date <= '2019-02-02')
    GROUP BY user_id
)
GROUP BY level
ORDER BY level ASC;
```

결과:

```text
┌─level─┬─c─┐
│     4 │ 1 │
└───────┴───┘
```

**allow&#95;reentry 모드 예시**

이 예시는 `allow_reentry` 모드가 사용자 재진입 패턴에서 어떻게 동작하는지를 보여줍니다.

```sql
-- Sample data: user visits checkout -> product detail -> checkout again -> payment
-- Without allow_reentry: stops at level 2 (product detail page)
-- With allow_reentry: reaches level 4 (payment completion)

SELECT
    level,
    count() AS users
FROM
(
    SELECT
        user_id,
        windowFunnel(3600, 'strict_order', 'allow_reentry')(
            timestamp,
            action = 'begin_checkout',      -- Step 1: Begin checkout
            action = 'view_product_detail', -- Step 2: View product detail  
            action = 'begin_checkout',      -- Step 3: Begin checkout again (reentry)
            action = 'complete_payment'     -- Step 4: Complete payment
        ) AS level
    FROM user_events
    WHERE event_date = today()
    GROUP BY user_id
)
GROUP BY level
ORDER BY level ASC;
```

## retention \{#retention\}

이 함수는 1개에서 최대 32개까지의 `UInt8` 타입 인자를 받으며, 각 인자는 이벤트에 대해 특정 조건이 충족되었는지를 나타냅니다.
어떤 조건이든 인수로 지정할 수 있습니다([WHERE](/sql-reference/statements/select/where) 절과 동일하게).

첫 번째 조건을 제외한 나머지 조건은 쌍으로 평가됩니다. 첫 번째와 두 번째 조건이 모두 참이면 두 번째 조건의 결과가 참이 되고, 첫 번째와 세 번째 조건이 모두 참이면 세 번째 조건의 결과가 참이 되는 식으로 동작합니다.

**Syntax**

```sql
retention(cond1, cond2, ..., cond32);
```

**인수**

* `cond` — `UInt8` 결과(1 또는 0)를 반환하는 식입니다.

**반환 값**

1 또는 0으로 이루어진 배열입니다.

* 1 — 이벤트에 대한 조건이 충족되었습니다.
* 0 — 이벤트에 대한 조건이 충족되지 않았습니다.

타입: `UInt8`.

**예시**

사이트 트래픽을 파악하기 위해 `retention` 함수의 계산 예시를 살펴봅니다.

**1.** 예제를 위해 테이블을 생성합니다.

```sql
CREATE TABLE retention_test(date Date, uid Int32) ENGINE = Memory;

INSERT INTO retention_test SELECT '2020-01-01', number FROM numbers(5);
INSERT INTO retention_test SELECT '2020-01-02', number FROM numbers(10);
INSERT INTO retention_test SELECT '2020-01-03', number FROM numbers(15);
```

입력 테이블:

쿼리:

```sql
SELECT * FROM retention_test
```

결과:

```text
┌───────date─┬─uid─┐
│ 2020-01-01 │   0 │
│ 2020-01-01 │   1 │
│ 2020-01-01 │   2 │
│ 2020-01-01 │   3 │
│ 2020-01-01 │   4 │
└────────────┴─────┘
┌───────date─┬─uid─┐
│ 2020-01-02 │   0 │
│ 2020-01-02 │   1 │
│ 2020-01-02 │   2 │
│ 2020-01-02 │   3 │
│ 2020-01-02 │   4 │
│ 2020-01-02 │   5 │
│ 2020-01-02 │   6 │
│ 2020-01-02 │   7 │
│ 2020-01-02 │   8 │
│ 2020-01-02 │   9 │
└────────────┴─────┘
┌───────date─┬─uid─┐
│ 2020-01-03 │   0 │
│ 2020-01-03 │   1 │
│ 2020-01-03 │   2 │
│ 2020-01-03 │   3 │
│ 2020-01-03 │   4 │
│ 2020-01-03 │   5 │
│ 2020-01-03 │   6 │
│ 2020-01-03 │   7 │
│ 2020-01-03 │   8 │
│ 2020-01-03 │   9 │
│ 2020-01-03 │  10 │
│ 2020-01-03 │  11 │
│ 2020-01-03 │  12 │
│ 2020-01-03 │  13 │
│ 2020-01-03 │  14 │
└────────────┴─────┘
```

**2.** `retention` FUNCTION을 사용하여 고유 ID `uid`를 기준으로 사용자를 그룹화합니다.

쿼리:

```sql
SELECT
    uid,
    retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
FROM retention_test
WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
GROUP BY uid
ORDER BY uid ASC
```

결과:

```text
┌─uid─┬─r───────┐
│   0 │ [1,1,1] │
│   1 │ [1,1,1] │
│   2 │ [1,1,1] │
│   3 │ [1,1,1] │
│   4 │ [1,1,1] │
│   5 │ [0,0,0] │
│   6 │ [0,0,0] │
│   7 │ [0,0,0] │
│   8 │ [0,0,0] │
│   9 │ [0,0,0] │
│  10 │ [0,0,0] │
│  11 │ [0,0,0] │
│  12 │ [0,0,0] │
│  13 │ [0,0,0] │
│  14 │ [0,0,0] │
└─────┴─────────┘
```

**3.** 일별 총 사이트 방문 수를 계산합니다.

쿼리:

```sql
SELECT
    sum(r[1]) AS r1,
    sum(r[2]) AS r2,
    sum(r[3]) AS r3
FROM
(
    SELECT
        uid,
        retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
    FROM retention_test
    WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
    GROUP BY uid
)
```

결과:

```text
┌─r1─┬─r2─┬─r3─┐
│  5 │  5 │  5 │
└────┴────┴────┘
```

Where:

* `r1`- 2020-01-01 동안 사이트를 방문한 고유 방문자 수입니다 (`cond1` 조건).
* `r2`- 2020-01-01과 2020-01-02 사이의 특정 기간 동안 사이트를 방문한 고유 방문자 수입니다 (`cond1` 및 `cond2` 조건).
* `r3`- 2020-01-01과 2020-01-03의 특정 기간 동안 사이트를 방문한 고유 방문자 수입니다 (`cond1` 및 `cond3` 조건).

## uniqUpTo(N)(x) \{#uniquptonx\}

지정된 상한 `N`까지 인수의 서로 다른 값의 개수를 계산합니다. 서로 다른 인수 값의 개수가 `N`보다 크면 이 함수는 `N` + 1을 반환하고, 그렇지 않으면 정확한 값을 계산합니다.

`N`이 10 이하인 작은 값일 때 사용하는 것을 권장합니다. `N`의 최댓값은 100입니다.

집계 함수의 상태를 위해 이 함수는 1 + `N` * 값 하나의 크기(바이트)에 해당하는 양의 메모리를 사용합니다.
문자열을 처리할 때에는 이 함수가 8바이트 크기의 비암호화 해시 값을 저장하며, 문자열에 대해서는 근사값을 계산합니다.

예를 들어, 웹사이트에서 사용자들이 수행한 모든 검색 쿼리를 로그로 저장하는 테이블이 있다고 가정합니다. 테이블의 각 행은 단일 검색 쿼리를 나타내며, 사용자 ID, 검색 쿼리, 타임스탬프 컬럼을 포함합니다. `uniqUpTo`를 사용하여 최소 5명의 서로 다른 사용자가 검색한 키워드만 보여주는 보고서를 생성할 수 있습니다.

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)`는 각 `SearchPhrase`에 대해 서로 다른 `UserID` 값의 개수를 계산하지만, 최대 4개의 고유 값까지만 셉니다. 특정 `SearchPhrase`에 대해 서로 다른 `UserID` 값이 4개를 초과하면 함수는 5(4 + 1)를 반환합니다. 이어서 `HAVING` 절은 서로 다른 `UserID` 값의 개수가 5보다 작은 `SearchPhrase` 값을 제외합니다. 이렇게 하면 최소 5명의 서로 다른 사용자가 사용한 검색 키워드 목록을 얻을 수 있습니다.

## sumMapFiltered \{#summapfiltered\}

이 함수는 [sumMap](/sql-reference/aggregate-functions/reference/summap)와 동일하게 동작하지만, 추가로 필터링에 사용할 키 배열을 매개변수로 받습니다. 키의 카디널리티가 매우 높을 때 특히 유용합니다.

**구문**

`sumMapFiltered(keys_to_keep)(keys, values)`

**매개변수**

* `keys_to_keep`: 필터링에 사용할 키들의 [Array](../data-types/array.md).
* `keys`: 키들의 [Array](../data-types/array.md).
* `values`: 값들의 [Array](../data-types/array.md).

**반환 값**

* 두 개의 배열로 구성된 튜플을 반환합니다. 첫 번째 배열은 정렬된 순서의 키들이고, 두 번째 배열은 해당 키에 대해 합산된 값들입니다.

**예시**

쿼리:

```sql
CREATE TABLE sum_map
(
    `date` Date,
    `timeslot` DateTime,
    `statusMap` Nested(status UInt16, requests UInt64)
)
ENGINE = Log

INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10]);
```

```sql
SELECT sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests) FROM sum_map;
```

결과:

```response
   ┌─sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests)─┐
1. │ ([1,4,8],[10,20,10])                                            │
   └─────────────────────────────────────────────────────────────────┘
```

## sumMapFilteredWithOverflow \{#summapfilteredwithoverflow\}

이 함수는 필터링에 사용할 키 배열을 인자로 추가로 받는다는 점을 제외하면 [sumMap](/sql-reference/aggregate-functions/reference/summap) 함수와 동일하게 동작합니다. 이는 키의 카디널리티가 매우 높은 경우에 특히 유용합니다. 오버플로를 허용하는 방식으로 합계를 계산한다는 점에서 [sumMapFiltered](#summapfiltered) 함수와 다르며, 즉 합계에 대해 인자 데이터 타입과 동일한 데이터 타입을 그대로 반환합니다.

**Syntax**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**Parameters**

* `keys_to_keep`: 필터링에 사용할 키들의 [Array](../data-types/array.md).
* `keys`: 키들의 [Array](../data-types/array.md).
* `values`: 값들의 [Array](../data-types/array.md).

**Returned Value**

* 정렬된 순서의 키 배열과 해당 키에 대해 합산된 값 배열, 이렇게 두 개의 배열로 이루어진 튜플을 반환합니다.

**Example**

이 예시에서는 `sum_map` 테이블을 생성하고 일부 데이터를 삽입한 뒤, 결과 비교를 위해 `sumMapFilteredWithOverflow`, `sumMapFiltered`, `toTypeName` 함수를 모두 사용합니다. 생성한 테이블에서 `requests`의 타입은 `UInt8`이었기 때문에, `sumMapFiltered`는 오버플로를 방지하기 위해 합산된 값의 타입을 `UInt64`로 승격하는 반면, `sumMapFilteredWithOverflow`는 타입을 `UInt8`로 유지하여 결과를 저장하기에 충분하지 않아 오버플로가 발생합니다.

Query:

```sql
CREATE TABLE sum_map
(
    `date` Date,
    `timeslot` DateTime,
    `statusMap` Nested(status UInt8, requests UInt8)
)
ENGINE = Log

INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10]);
```

```sql
SELECT sumMapFilteredWithOverflow([1, 4, 8])(statusMap.status, statusMap.requests) as summap_overflow, toTypeName(summap_overflow) FROM sum_map;
```

```sql
SELECT sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests) as summap, toTypeName(summap) FROM sum_map;
```

반환값:

```response
   ┌─sum──────────────────┬─toTypeName(sum)───────────────────┐
1. │ ([1,4,8],[10,20,10]) │ Tuple(Array(UInt8), Array(UInt8)) │
   └──────────────────────┴───────────────────────────────────┘
```

```response
   ┌─summap───────────────┬─toTypeName(summap)─────────────────┐
1. │ ([1,4,8],[10,20,10]) │ Tuple(Array(UInt8), Array(UInt64)) │
   └──────────────────────┴────────────────────────────────────┘
```

## sequenceNextNode \{#sequencenextnode\}

이벤트 체인과 일치하는 다음 이벤트의 값을 반환합니다.

*실험적인 함수입니다. 사용을 활성화하려면 `SET allow_experimental_funnel_functions = 1`을(를) 설정합니다.*

**구문**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**매개변수(Parameters)**

* `direction` — 진행 방향을 지정하는 데 사용합니다.
  * forward — 앞으로 이동합니다.
  * backward — 뒤로 이동합니다.

* `base` — 기준점을 설정하는 데 사용합니다.
  * head — 첫 번째 이벤트를 기준점으로 설정합니다.
  * tail — 마지막 이벤트를 기준점으로 설정합니다.
  * first&#95;match — 처음으로 일치한 `event1`을 기준점으로 설정합니다.
  * last&#95;match — 마지막으로 일치한 `event1`을 기준점으로 설정합니다.

**인수(Arguments)**

* `timestamp` — 타임스탬프를 포함하는 컬럼 이름입니다. 지원되는 데이터 타입: [Date](../../sql-reference/data-types/date.md), [DateTime](/sql-reference/data-types/datetime) 및 기타 부호 없는 정수 타입.
* `event_column` — 다음에 반환될 이벤트 값이 저장된 컬럼 이름입니다. 지원되는 데이터 타입: [String](../../sql-reference/data-types/string.md) 및 [Nullable(String)](../../sql-reference/data-types/nullable.md).
* `base_condition` — 기준점이 만족해야 하는 조건입니다.
* `event1`, `event2`, ... — 이벤트 체인을 설명하는 조건입니다. [UInt8](../../sql-reference/data-types/int-uint.md).

**반환 값(Returned values)**

* `event_column[next_index]` — 패턴이 일치하고 다음 값이 존재하는 경우입니다.
* `NULL` - 패턴이 일치하지 않거나 다음 값이 존재하지 않는 경우입니다.

데이터 타입: [Nullable(String)](../../sql-reference/data-types/nullable.md).

**예시(Example)**

이 함수는 이벤트가 A-&gt;B-&gt;C-&gt;D-&gt;E 형태이고 B-&gt;C 다음의 이벤트(D)를 알고자 할 때 사용할 수 있습니다.

A-&gt;B 다음 이벤트를 찾는 쿼리는 다음과 같습니다.

```sql
CREATE TABLE test_flow (
    dt DateTime,
    id int,
    page String)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(dt)
ORDER BY id;

INSERT INTO test_flow VALUES (1, 1, 'A') (2, 1, 'B') (3, 1, 'C') (4, 1, 'D') (5, 1, 'E');

SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'A', page = 'A', page = 'B') as next_flow FROM test_flow GROUP BY id;
```

결과:

```text
┌─id─┬─next_flow─┐
│  1 │ C         │
└────┴───────────┘
```

**`forward` 및 `head` 동작**

```sql
ALTER TABLE test_flow DELETE WHERE 1 = 1 settings mutations_sync = 1;

INSERT INTO test_flow VALUES (1, 1, 'Home') (2, 1, 'Gift') (3, 1, 'Exit');
INSERT INTO test_flow VALUES (1, 2, 'Home') (2, 2, 'Home') (3, 2, 'Gift') (4, 2, 'Basket');
INSERT INTO test_flow VALUES (1, 3, 'Gift') (2, 3, 'Home') (3, 3, 'Gift') (4, 3, 'Basket');
```

```sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'Home', page = 'Home', page = 'Gift') FROM test_flow GROUP BY id;

                  dt   id   page
 1970-01-01 09:00:01    1   Home // Base point, Matched with Home
 1970-01-01 09:00:02    1   Gift // Matched with Gift
 1970-01-01 09:00:03    1   Exit // The result

 1970-01-01 09:00:01    2   Home // Base point, Matched with Home
 1970-01-01 09:00:02    2   Home // Unmatched with Gift
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

 1970-01-01 09:00:01    3   Gift // Base point, Unmatched with Home
 1970-01-01 09:00:02    3   Home
 1970-01-01 09:00:03    3   Gift
 1970-01-01 09:00:04    3   Basket
```

**`backward` 및 `tail`의 동작 방식**

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // Base point, Unmatched with Basket

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // The result
1970-01-01 09:00:03    2   Gift // Matched with Gift
1970-01-01 09:00:04    2   Basket // Base point, Matched with Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // The result
1970-01-01 09:00:03    3   Gift // Base point, Matched with Gift
1970-01-01 09:00:04    3   Basket // Base point, Matched with Basket
```

**`forward` 및 `first_match`의 동작 방식**

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit // The result

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket  The result

1970-01-01 09:00:01    3   Gift // Base point
1970-01-01 09:00:02    3   Home // The result
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit // Unmatched with Home

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket // Unmatched with Home

1970-01-01 09:00:01    3   Gift // Base point
1970-01-01 09:00:02    3   Home // Matched with Home
1970-01-01 09:00:03    3   Gift // The result
1970-01-01 09:00:04    3   Basket
```

**`backward` 및 `last_match`의 동작 방식**

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // The result
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // The result
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // The result
1970-01-01 09:00:03    3   Gift // Base point
1970-01-01 09:00:04    3   Basket
```

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // Matched with Home, the result is null
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home // The result
1970-01-01 09:00:02    2   Home // Matched with Home
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift // The result
1970-01-01 09:00:02    3   Home // Matched with Home
1970-01-01 09:00:03    3   Gift // Base point
1970-01-01 09:00:04    3   Basket
```

**`base_condition`의 동작 방식**

```sql
CREATE TABLE test_flow_basecond
(
    `dt` DateTime,
    `id` int,
    `page` String,
    `ref` String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(dt)
ORDER BY id;

INSERT INTO test_flow_basecond VALUES (1, 1, 'A', 'ref4') (2, 1, 'A', 'ref3') (3, 1, 'B', 'ref2') (4, 1, 'B', 'ref1');
```

```sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, ref = 'ref1', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // The head can not be base point because the ref column of the head unmatched with 'ref1'.
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1
```

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, ref = 'ref4', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1 // The tail can not be base point because the ref column of the tail unmatched with 'ref4'.
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // This row can not be base point because the ref column unmatched with 'ref3'.
 1970-01-01 09:00:02    1   A      ref3 // Base point
 1970-01-01 09:00:03    1   B      ref2 // The result
 1970-01-01 09:00:04    1   B      ref1
```

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // The result
 1970-01-01 09:00:03    1   B      ref2 // Base point
 1970-01-01 09:00:04    1   B      ref1 // This row can not be base point because the ref column unmatched with 'ref2'.
```
