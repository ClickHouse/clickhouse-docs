---
'description': 'Parametric Aggregate Functions에 대한 문서'
'sidebar_label': 'Parametric'
'sidebar_position': 38
'slug': '/sql-reference/aggregate-functions/parametric-functions'
'title': '매개변수 집계 함수'
'doc_type': 'reference'
---


# 매개변수 집계 함수

일부 집계 함수는 압축에 사용되는 인수 컬럼뿐만 아니라 초기화에 대한 상수인 매개변수 집합도 수용할 수 있습니다. 구문은 하나 대신 두 개의 괄호 쌍을 사용합니다. 첫 번째는 매개변수를, 두 번째는 인수를 위한 것입니다.

## histogram {#histogram}

적응형 히스토그램을 계산합니다. 정확한 결과를 보장하지 않습니다.

```sql
histogram(number_of_bins)(values)
```

이 함수는 [A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)을 사용합니다. 히스토그램 빈의 경계는 새로운 데이터가 함수에 들어올 때 조정됩니다. 일반적인 경우, 빈의 폭은 동일하지 않습니다.

**인수**

`values` — 입력 값을 생성하는 [표현식](/sql-reference/syntax#expressions).

**매개변수**

`number_of_bins` — 히스토그램의 빈 수에 대한 상한선입니다. 함수는 자동으로 빈 수를 계산합니다. 지정된 빈 수에 도달하려고 시도하지만 실패할 경우 더 적은 수의 빈을 사용합니다.

**반환 값**

- 다음 형식의 [튜플](../../sql-reference/data-types/tuple.md) [배열](../../sql-reference/data-types/array.md):

```
[(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
```

        - `lower` — 빈의 하한.
        - `upper` — 빈의 상한.
        - `height` — 빈의 계산된 높이.

**예제**

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

예를 들어 [bar](/sql-reference/functions/other-functions#bar) 함수를 사용하여 히스토그램을 시각화할 수 있습니다:

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

이 경우, 히스토그램 빈 경계를 알 수 없음을 기억해야 합니다.

## sequenceMatch {#sequencematch}

시퀀스에 패턴에 맞는 이벤트 체인이 포함되어 있는지 확인합니다.

**구문**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
같은 초에 발생하는 이벤트는 정의되지 않은 순서로 시퀀스에 놓일 수 있으며 결과에 영향을 미칩니다.
:::

**인수**

- `timestamp` — 시간 데이터를 포함하고 있는 것으로 간주되는 컬럼입니다. 일반적인 데이터 유형은 `Date` 및 `DateTime`입니다. 지원되는 [UInt](../../sql-reference/data-types/int-uint.md) 데이터 유형을 사용할 수도 있습니다.

- `cond1`, `cond2` — 이벤트 체인을 설명하는 조건입니다. 데이터 유형: `UInt8`. 최대 32개의 조건 인수를 전달할 수 있습니다. 함수는 이러한 조건에서 설명된 이벤트만 고려합니다. 시퀀스에 조건에 설명되지 않은 데이터가 포함되어 있으면, 함수는 이를 건너뜁니다.

**매개변수**

- `pattern` — 패턴 문자열입니다. [패턴 구문](#pattern-syntax)을 참조하세요.

**반환 값**

- 패턴이 일치하면 1을 반환합니다.
- 패턴이 일치하지 않으면 0을 반환합니다.

유형: `UInt8`.

#### 패턴 구문 {#pattern-syntax}

- `(?N)` — 위치 `N`의 조건 인수와 일치합니다. 조건은 `[1, 32]` 범위로 번호가 매겨집니다. 예를 들어, `(?1)`은 `cond1` 매개변수에 전달된 인수와 일치합니다.

- `.*` — 임의의 수의 이벤트와 일치합니다. 패턴의 이 요소와 일치하려면 조건 인수가 필요하지 않습니다.

- `(?t operator value)` — 두 이벤트를 분리해야 하는 시간을 초 단위로 설정합니다. 예를 들어, 패턴 `(?1)(?t>1800)(?2)`는 서로 1800초 이상 떨어져 발생하는 이벤트와 일치합니다. 이 이벤트 사이에는 임의의 수의 다른 이벤트가 놓일 수 있습니다. `>=`, `>`, `<`, `<=`, `==` 연산자를 사용할 수 있습니다.

**예제**

`t` 테이블의 데이터를 고려하세요:

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

쿼리를 실행하세요:

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

함수는 숫자 2가 숫자 1을 따르는 이벤트 체인을 발견했습니다. 이벤트로 설명되지 않은 숫자 3은 그들 사이에서 건너뛰었습니다. 예제에서 주어진 이벤트 체인을 검색할 때 이 숫자를 고려하려면 그것에 대해 조건을 만들어야 합니다.

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

이 경우, 함수는 패턴과 일치하는 이벤트 체인을 찾을 수 없었습니다. 왜냐하면 숫자 3에 대한 이벤트가 숫자 1과 2 사이에서 발생했기 때문입니다. 동일한 경우 숫자 4에 대한 조건을 확인했다면 시퀀스는 패턴과 일치하게 됩니다.

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**참조**

- [sequenceCount](#sequencecount)

## sequenceCount {#sequencecount}

패턴과 일치하는 이벤트 체인의 수를 계산합니다. 함수는 겹치지 않는 이벤트 체인을 검색합니다. 현재 체인이 일치한 후 다음 체인을 찾기 시작합니다.

:::note
같은 초에 발생하는 이벤트는 정의되지 않은 순서로 시퀀스에 놓일 수 있으며 결과에 영향을 미칩니다.
:::

**구문**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**인수**

- `timestamp` — 시간 데이터를 포함하고 있는 것으로 간주되는 컬럼입니다. 일반적인 데이터 유형은 `Date` 및 `DateTime`입니다. 지원되는 [UInt](../../sql-reference/data-types/int-uint.md) 데이터 유형을 사용할 수도 있습니다.

- `cond1`, `cond2` — 이벤트 체인을 설명하는 조건입니다. 데이터 유형: `UInt8`. 최대 32개의 조건 인수를 전달할 수 있습니다. 함수는 이러한 조건에서 설명된 이벤트만 고려합니다. 시퀀스에 조건에 설명되지 않은 데이터가 포함되어 있으면, 함수는 이를 건너뜁니다.

**매개변수**

- `pattern` — 패턴 문자열입니다. [패턴 구문](#pattern-syntax)을 참조하세요.

**반환 값**

- 일치하는 비겹치는 이벤트 체인의 수입니다.

유형: `UInt64`.

**예제**

`t` 테이블의 데이터를 고려하세요:

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

숫자 1 뒤에 숫자 2가 몇 번 발생하는지 계산하세요. 그 사이에 아무 다른 숫자가 있을 수 있습니다:

```sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```

## sequenceMatchEvents {#sequencematchevents}

패턴과 일치하는 가장 긴 이벤트 체인의 이벤트 타임스탬프를 반환합니다.

:::note
같은 초에 발생하는 이벤트는 정의되지 않은 순서로 시퀀스에 놓일 수 있으며 결과에 영향을 미칩니다.
:::

**구문**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**인수**

- `timestamp` — 시간 데이터를 포함하고 있는 것으로 간주되는 컬럼입니다. 일반적인 데이터 유형은 `Date` 및 `DateTime`입니다. 지원되는 [UInt](../../sql-reference/data-types/int-uint.md) 데이터 유형을 사용할 수도 있습니다.

- `cond1`, `cond2` — 이벤트 체인을 설명하는 조건입니다. 데이터 유형: `UInt8`. 최대 32개의 조건 인수를 전달할 수 있습니다. 함수는 이러한 조건에서 설명된 이벤트만 고려합니다. 시퀀스에 조건에 설명되지 않은 데이터가 포함되어 있으면, 함수는 이를 건너뜁니다.

**매개변수**

- `pattern` — 패턴 문자열입니다. [패턴 구문](#pattern-syntax)을 참조하세요.

**반환 값**

- 이벤트 체인에서 매치된 조건 인수(?N)의 타임스탬프 배열입니다. 배열의 위치는 패턴의 조건 인수 위치와 일치합니다.

유형: 배열.

**예제**

`t` 테이블의 데이터를 고려하세요:

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

가장 긴 체인의 이벤트 타임스탬프를 반환하세요.

```sql
SELECT sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│ [1,3,4]                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**참조**

- [sequenceMatch](#sequencematch)

## windowFunnel {#windowfunnel}

슬라이딩 시간 창에서 이벤트 체인을 검색하고 체인에서 발생한 최대 이벤트 수를 계산합니다.

이 함수는 다음 알고리즘에 따라 작동합니다:

- 함수는 체인의 첫 번째 조건을 유발하는 데이터를 검색하고 이벤트 카운터를 1로 설정합니다. 이는 슬라이딩 창이 시작되는 순간입니다.

- 체인에서 이벤트가 창 내에서 연속적으로 발생하면 카운터가 증가합니다. 이벤트 시퀀스가 중단되면 카운터는 증가하지 않습니다.

- 데이터에 서로 다른 완료 시점에서 여러 이벤트 체인이 있는 경우, 함수는 가장 긴 체인의 크기만 출력합니다.

**구문**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**인수**

- `timestamp` — 타임스탬프가 포함된 컬럼의 이름입니다. 지원되는 데이터 유형: [Date](../../sql-reference/data-types/date.md), [DateTime](/sql-reference/data-types/datetime) 및 기타 부호 없는 정수 유형 (타임스탬프는 `UInt64` 유형을 지원하지만, 유효 값은 2^63 - 1인 Int64의 최대 값을 초과할 수 없습니다).
- `cond` — 이벤트 체인을 설명하는 조건 또는 데이터입니다. [UInt8](../../sql-reference/data-types/int-uint.md).

**매개변수**

- `window` — 슬라이딩 창의 길이로, 첫 번째 및 마지막 조건 사이의 시간 간격입니다. `window`의 단위는 `timestamp` 자체에 따라 다릅니다. `timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window` 수식을 사용하여 결정됩니다.
- `mode` — 선택적 인수입니다. 하나 이상의 모드를 설정할 수 있습니다.
  - `'strict_deduplication'` — 이벤트 시퀀스에 같은 조건이 유지되면, 그러한 반복 이벤트는 추가 처리를 중단합니다. 주의: 같은 이벤트에 대해 여러 조건이 유지되는 경우 예기치 않게 작동할 수 있습니다.
  - `'strict_order'` — 다른 이벤트의 개입을 허용하지 않습니다. 예: `A->B->D->C`의 경우, `D`에서 `A->B->C` 찾기를 중단하며 최대 이벤트 수준은 2입니다.
  - `'strict_increase'` — 조건을 시간 스탬프가 엄격하게 증가하는 이벤트에만 적용합니다.
  - `'strict_once'` — 체인에서 각 이벤트가 조건을 여러 번 충족하더라도 한 번만 계산합니다.

**반환 값**

슬라이딩 시간 창 내에서 체인의 연속적으로 발생한 조건의 최대 수입니다.
선택된 모든 체인이 분석됩니다.

유형: `Integer`.

**예제**

특정 기간 동안 사용자가 전화기를 선택하고 온라인 가게에서 두 번 구매할 수 있는 충분한 시간을 설정합니다.

다음 이벤트 체인을 설정합니다:

1. 사용자가 가게의 계정에 로그인했습니다 (`eventID = 1003`).
2. 사용자가 전화기를 검색했습니다 (`eventID = 1007, product = 'phone'`).
3. 사용자가 주문을 했습니다 (`eventID = 1009`).
4. 사용자가 다시 주문을 했습니다 (`eventID = 1010`).

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

2019년 1월에서 2월 사이에 사용자가 `user_id`로 체인을 통해 얼마나 진전을 이루었는지 찾습니다.

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

## retention {#retention}

이 함수는 이벤트에 대한 특정 조건이 충족되었는지를 나타내는 `UInt8` 유형의 인수 집합을 인수로 취합니다. 어떤 조건도 인수로 지정할 수 있습니다([WHERE](/sql-reference/statements/select/where)와 같이).

첫 번째를 제외한 조건은 쌍으로 적용됩니다: 두 번째 조건이 참이면 첫 번째와 두 번째가 모두 참입니다. 세 번째는 첫 번째와 세 번째가 참이면 참입니다.

**구문**

```sql
retention(cond1, cond2, ..., cond32);
```

**인수**

- `cond` — `UInt8` 결과(1 또는 0)를 반환하는 표현식입니다.

**반환 값**

1 또는 0의 배열입니다.

- 1 — 이벤트에 대한 조건이 충족되었습니다.
- 0 — 이벤트에 대한 조건이 충족되지 않았습니다.

유형: `UInt8`.

**예제**

사이트 트래픽을 결정하기 위해 `retention` 함수를 계산하는 예제를 고려해 봅시다.

**1.** 예제를 설명하기 위한 테이블을 만듭니다.

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

**2.** `retention` 함수를 사용하여 고유 ID `uid`로 사용자를 그룹화합니다.

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

**3.** 하루 동안의 사이트 방문 총 수를 계산합니다.

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

여기서:

- `r1`- 2020-01-01일 동안 사이트를 방문한 고유 방문자의 수 (`cond1` 조건).
- `r2`- 2020-01-01에서 2020-01-02 사이의 특정 기간 동안 사이트를 방문한 고유 방문자의 수 (`cond1` 및 `cond2` 조건).
- `r3`- 2020-01-01일과 2020-01-03일 동안 사이트를 방문한 고유 방문자의 수 (`cond1` 및 `cond3` 조건).

## uniqUpTo(N)(x) {#uniquptonx}

지정된 한도 `N`까지 인수의 서로 다른 값을 계산합니다. 다른 인수 값의 수가 `N`보다 크면, 이 함수는 `N` + 1을 반환하고, 그렇지 않으면 정확한 값을 계산합니다.

작은 `N`(최대 10)에서 사용하는 것이 좋습니다. `N`의 최대값은 100입니다.

집계 함수의 상태에 대해, 이 함수는 1 + `N` \* 하나의 값의 바이트 크기만큼의 메모리를 사용합니다.
문자열을 처리할 때, 이 함수는 8바이트의 비암호화 해시를 저장합니다; 문자열에 대한 계산은 근사치입니다.

예를 들어 사용자가 웹사이트에서 한 모든 검색 쿼리를 기록하는 테이블이 있다고 가정해 보겠습니다. 테이블의 각 행은 단일 검색 쿼리를 나타내며, 사용자 ID, 검색 쿼리, 쿼리의 타임스탬프를 위한 열이 있습니다. `uniqUpTo`를 사용하여 적어도 5명의 고유 사용자가 생성한 키워드만 보여주는 보고서를 생성할 수 있습니다.

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)`는 각 `SearchPhrase`에 대해 고유한 `UserID` 값을 계산하지만, 4개의 고유 값까지만 계산합니다. `SearchPhrase`에 대해 4개의 고유 `UserID` 값 이상이 있는 경우, 함수는 5 (4 + 1)를 반환합니다. 그런 다음 `HAVING` 절은 고유 `UserID` 값의 수가 5 미만인 `SearchPhrase` 값을 필터링합니다. 이를 통해 적어도 5명의 고유 사용자가 사용한 검색 키워드 목록을 얻을 수 있습니다.

## sumMapFiltered {#summapfiltered}

이 함수는 [sumMap](/sql-reference/aggregate-functions/reference/summap)와 동일하게 작동하지만, 필터링을 위해 키 배열을 매개변수로 허용합니다. 이는 높은 카디널리티의 키 작업 시 특히 유용할 수 있습니다.

**구문**

`sumMapFiltered(keys_to_keep)(keys, values)`

**매개변수**

- `keys_to_keep`: 필터링에 사용할 [배열](../data-types/array.md) 키입니다.
- `keys`: [배열](../data-types/array.md) 키입니다.
- `values`: [배열](../data-types/array.md) 값입니다.

**반환 값**

- 정렬된 순서의 키 배열과 해당 키에 대해 합산된 값을 포함하는 두 개의 배열의 튜플을 반환합니다.

**예제**

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

## sumMapFilteredWithOverflow {#summapfilteredwithoverflow}

이 함수는 [sumMap](/sql-reference/aggregate-functions/reference/summap)와 동일하게 작동하지만, 필터링을 위해 키 배열을 매개변수로 허용합니다. 이는 높은 카디널리티의 키 작업 시 특히 유용할 수 있습니다. [sumMapFiltered](#summapfiltered) 함수와의 차이점은 오버플로우와 함께 합계를 수행한다는 것입니다 - 즉, 합계의 데이터 유형이 인수 데이터 유형과 동일하게 반환됩니다.

**구문**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**매개변수**

- `keys_to_keep`: 필터링에 사용할 [배열](../data-types/array.md) 키입니다.
- `keys`: [배열](../data-types/array.md) 키입니다.
- `values`: [배열](../data-types/array.md) 값입니다.

**반환 값**

- 정렬된 순서의 키 배열과 해당 키에 대해 합산된 값을 포함하는 두 개의 배열의 튜플을 반환합니다.

**예제**

이 예제에서는 `sum_map`이라는 테이블을 만들고 일부 데이터를 삽입한 다음 `sumMapFilteredWithOverflow` 및 `sumMapFiltered`와 결과 비교를 위해 `toTypeName` 함수를 사용합니다. 여기서 `requests`는 생성된 테이블에서 `UInt8` 유형이었고, `sumMapFiltered`는 오버플로우를 방지하기 위해 합산된 값의 유형을 `UInt64`로 승격했으며, 반면 `sumMapFilteredWithOverflow`는 결과를 저장하기에 충분하지 않은 `UInt8` 유형을 유지하므로 오버플로우가 발생했습니다.

쿼리:

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

결과:

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

## sequenceNextNode {#sequencenextnode}

이벤트 체인과 일치하는 다음 이벤트의 값을 반환합니다.

_실험적 함수이며, 사용을 활성화하려면 `SET allow_experimental_funnel_functions = 1`을 사용합니다._

**구문**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**매개변수**

- `direction` — 방향으로 탐색하는 데 사용됩니다.
  - forward — 앞으로 이동합니다.
  - backward — 뒤쪽으로 이동합니다.

- `base` — 기준점을 설정하는 데 사용됩니다.
  - head — 기준점을 첫 번째 이벤트로 설정합니다.
  - tail — 기준점을 마지막 이벤트로 설정합니다.
  - first_match — 기준점을 첫 번째 일치하는 `event1`으로 설정합니다.
  - last_match — 기준점을 마지막 일치하는 `event1`으로 설정합니다.

**인수**

- `timestamp` — 타임스탬프가 포함된 컬럼의 이름입니다. 지원되는 데이터 유형: [Date](../../sql-reference/data-types/date.md), [DateTime](/sql-reference/data-types/datetime) 및 기타 부호 없는 정수 유형.
- `event_column` — 반환할 다음 이벤트 값이 포함된 컬럼의 이름입니다. 지원되는 데이터 유형: [String](../../sql-reference/data-types/string.md) 및 [Nullable(String)](../../sql-reference/data-types/nullable.md).
- `base_condition` — 기준점이 충족해야 하는 조건입니다.
- `event1`, `event2`, ... — 이벤트 체인을 설명하는 조건입니다. [UInt8](../../sql-reference/data-types/int-uint.md).

**반환 값**

- `event_column[next_index]` — 패턴이 일치하고 다음 값이 존재하는 경우.
- `NULL` - 패턴이 일치하지 않거나 다음 값이 존재하지 않는 경우.

유형: [Nullable(String)](../../sql-reference/data-types/nullable.md).

**예제**

사건이 A->B->C->D->E인 경우, B->C 다음의 사건을 알고 싶다면 D입니다.

A->B 다음 사건을 찾는 쿼리 문:

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

**`forward` 및 `head`의 동작**

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

**`backward` 및 `tail`의 동작**

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

**`forward` 및 `first_match`의 동작**

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

**`backward` 및 `last_match`의 동작**

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

**`base_condition`의 동작**

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
