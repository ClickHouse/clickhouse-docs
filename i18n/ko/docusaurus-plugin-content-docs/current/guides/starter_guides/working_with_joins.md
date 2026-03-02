---
title: 'ClickHouse에서 조인 사용하기'
description: 'ClickHouse에서 조인 사용 방법을 다루는 입문 가이드'
keywords: ['JOINs', 'SQL', 'INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'SEMI JOIN', 'ANTI JOIN', 'ANY JOIN', 'ASOF JOIN']
sidebar_label: 'ClickHouse에서 조인 사용하기'
slug: /guides/working-with-joins
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import imdb_schema from '@site/static/images/starter_guides/joins/imdb_schema.png';
import inner_join from '@site/static/images/starter_guides/joins/inner_join.png';
import outer_join from '@site/static/images/starter_guides/joins/outer_join.png';
import cross_join from '@site/static/images/starter_guides/joins/cross_join.png';
import semi_join from '@site/static/images/starter_guides/joins/semi_join.png';
import anti_join from '@site/static/images/starter_guides/joins/anti_join.png';
import any_join from '@site/static/images/starter_guides/joins/any_join.png';
import asof_join from '@site/static/images/starter_guides/joins/asof_join.png';
import asof_example from '@site/static/images/starter_guides/joins/asof_example.png';

ClickHouse는 표준 SQL 조인을 완벽하게 지원하므로 효율적인 데이터 분석이 가능합니다.
이 가이드에서는 정규화된 [IMDB](https://en.wikipedia.org/wiki/IMDb) 데이터셋(출처: [relational dataset repository](https://relational.fit.cvut.cz/dataset/IMDb))을 기반으로, 자주 사용되는 조인 유형 몇 가지와 이를 Venn 다이어그램과 예제 쿼리를 통해 사용하는 방법을 살펴봅니다.


## 테스트 데이터와 리소스 \{#test-data-and-resources\}

테이블을 생성하고 로드하는 방법에 대한 안내는 [여기](/integrations/dbt/guides)에서 확인할 수 있습니다.
테이블을 로컬에 생성하고 로드하지 않으려는 경우, 해당 데이터셋은 [playground](https://sql.clickhouse.com?query_id=AACTS8ZBT3G7SSGN8ZJBJY)에서도 사용할 수 있습니다.

예제 데이터셋에서 다음 네 개의 테이블을 사용합니다:

<Image img={imdb_schema} alt="IMDB 스키마" />

이 네 개의 테이블에 있는 데이터는 하나 이상의 장르를 가질 수 있는 영화들을 나타냅니다.
영화에서의 역할은 배우들이 맡습니다.

위 다이어그램의 화살표는 [외래 키와 기본 키 간의 관계](https://en.wikipedia.org/wiki/Foreign_key)를 나타냅니다. 예를 들어, `genres` 테이블의 한 행에 있는 `movie_id` 컬럼에는 `movies` 테이블의 한 행에 있는 `id` 값이 들어 있습니다.

영화와 배우 사이에는 [다대다 관계](https://en.wikipedia.org/wiki/Many-to-many_(data_model))가 있습니다.
이 다대다 관계는 `roles` 테이블을 사용하여 두 개의 [일대다 관계](https://en.wikipedia.org/wiki/One-to-many_(data_model))로 정규화됩니다.
`roles` 테이블의 각 행에는 `movies` 테이블과 `actors` 테이블의 `id` 컬럼 값이 포함되어 있습니다.

## ClickHouse에서 지원하는 조인 유형 \{#join-types-supported-in-clickhouse\}

ClickHouse는 다음과 같은 조인 유형을 지원합니다:

- [INNER JOIN](#inner-join)
- [OUTER JOIN](#left--right--full-outer-join)
- [CROSS JOIN](#cross-join)
- [SEMI JOIN](#left--right-semi-join)
- [ANTI JOIN](#left--right-anti-join)
- [ANY JOIN](#left--right--inner-any-join)
- [ASOF JOIN](#asof-join)

다음 절에서는 위에 나열한 각 JOIN 유형에 대한 예제 쿼리를 살펴봅니다.

## INNER JOIN \{#inner-join\}

`INNER JOIN`은 조인 키가 일치하는 각 행 쌍에 대해, 왼쪽 테이블의 행에서 가져온 컬럼 값과 오른쪽 테이블의 행에서 가져온 컬럼 값을 결합하여 반환합니다.
어떤 행이 둘 이상의 행과 일치하는 경우, 모든 조합이 반환되며(즉, 조인 키가 일치하는 행들에 대해 [데카르트 곱](https://en.wikipedia.org/wiki/Cartesian_product)이 생성됩니다).

<Image img={inner_join} alt="Inner Join" />

이 쿼리는 `movies` 테이블과 `genres` 테이블을 조인하여 각 영화의 장르를 찾습니다:

```sql
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
INNER JOIN genres AS g ON m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

```response
┌─name───────────────────────────────────┬─genre─────┐
│ Harry Potter and the Half-Blood Prince │ Action    │
│ Harry Potter and the Half-Blood Prince │ Adventure │
│ Harry Potter and the Half-Blood Prince │ Family    │
│ Harry Potter and the Half-Blood Prince │ Fantasy   │
│ Harry Potter and the Half-Blood Prince │ Thriller  │
│ DragonBall Z                           │ Action    │
│ DragonBall Z                           │ Adventure │
│ DragonBall Z                           │ Comedy    │
│ DragonBall Z                           │ Fantasy   │
│ DragonBall Z                           │ Sci-Fi    │
└────────────────────────────────────────┴───────────┘
```

:::note
`INNER` 키워드는 생략할 수 있습니다.
:::

`INNER JOIN`의 동작은 다음 조인 유형 중 하나를 사용하여 확장하거나 변경할 수 있습니다.


## (LEFT / RIGHT / FULL) OUTER JOIN \{#left--right--full-outer-join\}

`LEFT OUTER JOIN`은 기본적으로 `INNER JOIN`과 동일하게 동작하지만, 일치하는 행이 없는 왼쪽 테이블의 행에 대해서는 오른쪽 테이블 컬럼에 대해 ClickHouse가 [기본값](/sql-reference/statements/create/table#default_values)을 반환합니다.

`RIGHT OUTER JOIN` 쿼리도 유사하게 동작하며, 오른쪽 테이블에서 일치하는 행이 없는 행의 값과 함께 왼쪽 테이블 컬럼에 대한 기본값을 반환합니다.

`FULL OUTER JOIN` 쿼리는 `LEFT`와 `RIGHT OUTER JOIN`을 결합한 것으로, 왼쪽 및 오른쪽 테이블에서 일치하는 행이 없는 모든 행의 값을 반환하며, 각각 오른쪽 및 왼쪽 테이블 컬럼에 대한 기본값도 함께 반환합니다.

<Image img={outer_join} alt="Outer Join" />

:::note
ClickHouse는 기본값 대신 [NULL](/sql-reference/syntax/#null)을 반환하도록 [설정](/operations/settings/settings#join_use_nulls)할 수 있습니다(하지만 [성능상의 이유](/sql-reference/data-types/nullable/#storage-features)로 권장되지 않습니다).
:::

다음 쿼리는 `genres` 테이블에 일치하는 행이 없는 `movies` 테이블의 모든 행을 조회하여, 장르가 없는 모든 영화를 찾습니다. 이로 인해 `movie_id` 컬럼은 (쿼리 시점에) 기본값인 0을 갖게 됩니다:

```sql
SELECT m.name
FROM movies AS m
LEFT JOIN genres AS g ON m.id = g.movie_id
WHERE g.movie_id = 0
ORDER BY
    m.year DESC,
    m.name ASC
LIMIT 10;
```

```response
┌─name──────────────────────────────────────┐
│ """Pacific War, The"""                    │
│ """Turin 2006: XX Olympic Winter Games""" │
│ Arthur, the Movie                         │
│ Bridge to Terabithia                      │
│ Mars in Aries                             │
│ Master of Space and Time                  │
│ Ninth Life of Louis Drax, The             │
│ Paradox                                   │
│ Ratatouille                               │
│ """American Dad"""                        │
└───────────────────────────────────────────┘
```

:::note
`OUTER` 키워드는 생략해도 됩니다.
:::


## CROSS JOIN \{#cross-join\}

`CROSS JOIN`은 조인 키를 고려하지 않고 두 테이블의 전체 데카르트 곱을 생성합니다.
왼쪽 테이블의 각 행이 오른쪽 테이블의 각 행과 결합됩니다.

<Image img={cross_join} alt="Cross Join" />

따라서 다음 쿼리는 `movies` 테이블의 각 행을 `genres` 테이블의 각 행과 조합합니다:

```sql
SELECT
    m.name,
    m.id,
    g.movie_id,
    g.genre
FROM movies AS m
CROSS JOIN genres AS g
LIMIT 10;
```

```response
┌─name─┬─id─┬─movie_id─┬─genre───────┐
│ #28  │  0 │        1 │ Documentary │
│ #28  │  0 │        1 │ Short       │
│ #28  │  0 │        2 │ Comedy      │
│ #28  │  0 │        2 │ Crime       │
│ #28  │  0 │        5 │ Western     │
│ #28  │  0 │        6 │ Comedy      │
│ #28  │  0 │        6 │ Family      │
│ #28  │  0 │        8 │ Animation   │
│ #28  │  0 │        8 │ Comedy      │
│ #28  │  0 │        8 │ Short       │
└──────┴────┴──────────┴─────────────┘
```

앞선 예시의 쿼리만으로는 큰 의미가 없지만, 일치하는 행을 연결하기 위해 `WHERE` 절을 추가하면 각 영화에 대한 장르를 찾기 위한 `INNER JOIN` 동작을 그대로 재현할 수 있습니다.

```sql
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
CROSS JOIN genres AS g
WHERE m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

`CROSS JOIN`에 대한 대체 구문으로, `FROM` 절에서 여러 테이블을 쉼표로 구분하여 지정하는 방법이 있습니다.

ClickHouse는 쿼리의 `WHERE` 절에 조인 표현식이 있는 경우 `CROSS JOIN`을 `INNER JOIN`으로 [재작성](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/Core/Settings.h#L896)합니다.

예시 쿼리의 경우 [EXPLAIN SYNTAX](/sql-reference/statements/explain/#explain-syntax)를 사용하여 이를 확인할 수 있습니다(쿼리가 [실행](https://youtu.be/hP6G2Nlz_cA)되기 전에 재작성되는, 구문적으로 최적화된 버전을 반환합니다).

```sql
EXPLAIN SYNTAX
SELECT
    m.name AS name,
    g.genre AS genre
FROM movies AS m
CROSS JOIN genres AS g
WHERE m.id = g.movie_id
ORDER BY
    m.year DESC,
    m.name ASC,
    g.genre ASC
LIMIT 10;
```

```response
┌─explain─────────────────────────────────────┐
│ SELECT                                      │
│     name AS name,                           │
│     genre AS genre                          │
│ FROM movies AS m                            │
│ ALL INNER JOIN genres AS g ON id = movie_id │
│ WHERE id = movie_id                         │
│ ORDER BY                                    │
│     year DESC,                              │
│     name ASC,                               │
│     genre ASC                               │
│ LIMIT 10                                    │
└─────────────────────────────────────────────┘
```

구문상 최적화된 `CROSS JOIN` 쿼리 버전에서 `INNER JOIN` 절에는 `ALL` 키워드가 포함되어 있으며, 이는 `CROSS JOIN`을 `INNER JOIN`으로 다시 쓸 때에도 `CROSS JOIN`의 데카르트 곱 의미론이 유지되도록 명시적으로 추가된 것입니다. `INNER JOIN`의 경우 데카르트 곱은 [비활성화](/operations/settings/settings#join_default_strictness)할 수 있습니다.

```sql
ALL
```

그리고 위에서 설명했듯이 `RIGHT OUTER JOIN`에서는 `OUTER` 키워드를 생략할 수 있고, 선택적인 `ALL` 키워드를 추가할 수 있으므로, `ALL RIGHT JOIN`으로 작성해도 정상적으로 동작합니다.


## (LEFT / RIGHT) SEMI JOIN \{#left--right-semi-join\}

`LEFT SEMI JOIN` 쿼리는 오른쪽 테이블에서 조인 키가 최소 한 번 이상 일치하는 왼쪽 테이블의 각 행에 대해 컬럼 값을 반환합니다.
첫 번째로 발견된 일치 항목만 반환되며(카티션 곱은 비활성화됨) 그 이상은 반환되지 않습니다.

`RIGHT SEMI JOIN` 쿼리도 비슷하며, 왼쪽 테이블에서 최소 한 번 이상 일치하는 값이 있는 오른쪽 테이블의 모든 행에 대해 값을 반환하지만, 이 경우에도 첫 번째로 발견된 일치 항목만 반환합니다.

<Image img={semi_join} alt="세미 조인" />

이 쿼리는 2023년에 영화에 출연한 모든 배우를 찾습니다.
일반적인 (`INNER`) 조인을 사용하면, 동일한 배우가 2023년에 여러 역할을 맡은 경우 여러 번 나타난다는 점에 유의하십시오:

```sql
SELECT
    a.first_name,
    a.last_name
FROM actors AS a
LEFT SEMI JOIN roles AS r ON a.id = r.actor_id
WHERE toYear(created_at) = '2023'
ORDER BY id ASC
LIMIT 10;
```

```response
┌─first_name─┬─last_name──────────────┐
│ Michael    │ 'babeepower' Viera     │
│ Eloy       │ 'Chincheta'            │
│ Dieguito   │ 'El Cigala'            │
│ Antonio    │ 'El de Chipiona'       │
│ José       │ 'El Francés'           │
│ Félix      │ 'El Gato'              │
│ Marcial    │ 'El Jalisco'           │
│ José       │ 'El Morito'            │
│ Francisco  │ 'El Niño de la Manola' │
│ Víctor     │ 'El Payaso'            │
└────────────┴────────────────────────┘
```


## (LEFT / RIGHT) ANTI JOIN \{#left--right-anti-join\}

`LEFT ANTI JOIN`은 왼쪽 테이블에서 매칭되지 않는 모든 행의 컬럼 값을 반환합니다.

마찬가지로, `RIGHT ANTI JOIN`은 오른쪽 테이블에서 매칭되지 않는 모든 행의 컬럼 값을 반환합니다.

<Image img={anti_join} alt="Anti Join" />

앞서 살펴본 외부 조인 예제 쿼리는 데이터셋에서 장르가 없는 영화를 찾기 위해 ANTI JOIN을 사용하는 방식으로도 표현할 수 있습니다:

```sql
SELECT m.name
FROM movies AS m
LEFT ANTI JOIN genres AS g ON m.id = g.movie_id
ORDER BY
    year DESC,
    name ASC
LIMIT 10;
```

```response
┌─name──────────────────────────────────────┐
│ """Pacific War, The"""                    │
│ """Turin 2006: XX Olympic Winter Games""" │
│ Arthur, the Movie                         │
│ Bridge to Terabithia                      │
│ Mars in Aries                             │
│ Master of Space and Time                  │
│ Ninth Life of Louis Drax, The             │
│ Paradox                                   │
│ Ratatouille                               │
│ """American Dad"""                        │
└───────────────────────────────────────────┘
```


## (LEFT / RIGHT / INNER) ANY JOIN \{#left--right--inner-any-join\}

`LEFT ANY JOIN`은 `LEFT OUTER JOIN`과 `LEFT SEMI JOIN`을 결합한 것으로, ClickHouse는 왼쪽 테이블의 각 행에 대해 컬럼 값을 반환합니다. 이때 오른쪽 테이블에 일치하는 행이 있으면 그 행의 컬럼 값과 결합하여 반환하고, 일치하는 행이 없으면 오른쪽 테이블의 기본 컬럼 값과 결합하여 반환합니다.
왼쪽 테이블의 하나의 행이 오른쪽 테이블에서 둘 이상의 행과 일치할 경우, ClickHouse는 처음으로 발견된 일치 행과의 결합 컬럼 값만 반환합니다(데카르트 곱(cartesian product)은 비활성화됨).

마찬가지로, `RIGHT ANY JOIN`은 `RIGHT OUTER JOIN`과 `RIGHT SEMI JOIN`을 결합한 것입니다.

그리고 `INNER ANY JOIN`은 데카르트 곱(cartesian product)이 비활성화된 `INNER JOIN`입니다.

<Image img={any_join} alt="Any Join" />

다음 예시는 두 개의 임시 테이블(`left_table` 및 `right_table`)을 사용한 단순화된 예제에서 `LEFT ANY JOIN`을 보여 줍니다. 이 임시 테이블은 [values](https://github.com/ClickHouse/ClickHouse/blob/23.2/src/TableFunctions/TableFunctionValues.h) [테이블 함수](/sql-reference/table-functions/)로 생성됩니다.

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
LEFT ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   1 │   0 │
│   2 │   2 │
│   3 │   3 │
└─────┴─────┘
```

다음은 `RIGHT ANY JOIN`을 사용한 동일한 쿼리입니다:

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
RIGHT ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   2 │   2 │
│   2 │   2 │
│   3 │   3 │
│   3 │   3 │
│   0 │   4 │
└─────┴─────┘
```

다음은 `INNER ANY JOIN`이 포함된 쿼리입니다:

```sql
WITH
    left_table AS (SELECT * FROM VALUES('c UInt32', 1, 2, 3)),
    right_table AS (SELECT * FROM VALUES('c UInt32', 2, 2, 3, 3, 4))
SELECT
    l.c AS l_c,
    r.c AS r_c
FROM left_table AS l
INNER ANY JOIN right_table AS r ON l.c = r.c;
```

```response
┌─l_c─┬─r_c─┐
│   2 │   2 │
│   3 │   3 │
└─────┴─────┘
```


## ASOF JOIN \{#asof-join\}

`ASOF JOIN`은(는) 근사 일치 기능을 제공합니다.
왼쪽 테이블의 행에 오른쪽 테이블에서 정확히 일치하는 행이 없으면, 오른쪽 테이블에서 가장 가까운 행이 대신 매칭에 사용됩니다.

이는 시계열 분석에 특히 유용하며 쿼리 복잡성을 크게 줄일 수 있습니다.

<Image img={asof_join} alt="Asof Join" />

다음 예시는 주식 시장 데이터의 시계열 분석을 수행합니다.
`quotes` 테이블에는 하루 중 특정 시점을 기준으로 한 종목 심볼 시세가 저장됩니다.
예시 데이터에서 가격은 10초마다 한 번씩 갱신됩니다.
`trades` 테이블에는 종목 거래 내역이 나열되며, 특정 시점에 특정 종목이 일정 수량만큼 매수된 거래를 나타냅니다:

<Image img={asof_example} alt="Asof Example" />

각 거래의 정확한 비용을 계산하려면, 거래를 그와 가장 가까운 시점의 시세와 매칭해야 합니다.

이는 `ASOF JOIN`을 사용하면 간단하고 간결하게 처리할 수 있습니다. `ON` 절로는 정확 일치 조건을 지정하고, `AND` 절로는 가장 가까운 일치 조건을 지정합니다. 즉, 특정 심볼(정확 일치)에 대해 해당 심볼의 거래 시점(근사 일치)과 같거나 그 이전 시점 중에서 `quotes` 테이블에서 시간 값이 가장 ‘가까운’ 행을 찾는 방식입니다:

```sql
SELECT
    t.symbol,
    t.volume,
    t.time AS trade_time,
    q.time AS closest_quote_time,
    q.price AS quote_price,
    t.volume * q.price AS final_price
FROM trades t
ASOF LEFT JOIN quotes q ON t.symbol = q.symbol AND t.time >= q.time
FORMAT Vertical;
```

```response
Row 1:
──────
symbol:             ABC
volume:             200
trade_time:         2023-02-22 14:09:05
closest_quote_time: 2023-02-22 14:09:00
quote_price:        32.11
final_price:        6422

Row 2:
──────
symbol:             ABC
volume:             300
trade_time:         2023-02-22 14:09:28
closest_quote_time: 2023-02-22 14:09:20
quote_price:        32.15
final_price:        9645
```

:::note
`ASOF JOIN`에서 `ON` 절은 필수이며, `AND` 절에서 지정하는 비정확 일치 조건 외에 사용할 정확 일치 조건을 지정합니다.
:::


## 요약 \{#summary\}

이 가이드는 ClickHouse가 모든 표준 SQL 조인(join) 유형뿐만 아니라 분석 쿼리를 위한 특수 조인도 어떻게 지원하는지 설명합니다.
조인에 대한 더 자세한 내용은 [JOIN](/sql-reference/statements/select/join) SQL 문에 대한 문서를 참조하십시오.