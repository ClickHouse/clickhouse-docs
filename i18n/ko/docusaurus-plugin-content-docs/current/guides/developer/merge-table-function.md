---
slug: /guides/developer/merge-table-function
sidebar_label: 'Merge 테이블 함수'
title: 'Merge 테이블 함수'
description: '여러 테이블을 동시에 쿼리합니다.'
doc_type: 'reference'
keywords: ['merge', '테이블 함수', '쿼리 패턴', '테이블 엔진', '데이터 액세스']
---

[Merge 테이블 함수](https://clickhouse.com/docs/sql-reference/table-functions/merge)는 여러 테이블을 병렬로 쿼리할 수 있도록 합니다.
이를 위해 임시 [Merge](https://clickhouse.com/docs/engines/table-engines/special/merge) 테이블을 생성하고, 각 테이블의 컬럼 합집합과 공통 타입을 기반으로 이 테이블의 구조를 결정합니다.

<iframe width="768" height="432" src="https://www.youtube.com/embed/b4YfRhD9SSI?si=MuoDwDWeikAV5ttk" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

## 테이블 설정 \{#setup-tables\}

[Jeff Sackmann의 테니스 데이터셋](https://github.com/JeffSackmann/tennis_atp)을 사용하여 이 함수를 활용하는 방법을 살펴봅니다.
1960년대까지 거슬러 올라가는 경기 기록이 들어 있는 CSV 파일을 처리하되, 각 10년대마다 조금씩 다른 스키마를 생성합니다.
또한 1990년대 스키마에는 몇 개의 컬럼을 추가합니다.

다음은 import 문입니다:

```sql
CREATE OR REPLACE TABLE atp_matches_1960s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1968..1969}.csv')
SETTINGS schema_inference_make_columns_nullable=0, 
         schema_inference_hints='winner_seed Nullable(String), loser_seed Nullable(UInt8)';

CREATE OR REPLACE TABLE atp_matches_1970s ORDER BY tourney_id AS 
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1970..1979}.csv')
SETTINGS schema_inference_make_columns_nullable=0, 
         schema_inference_hints='winner_seed Nullable(UInt8), loser_seed Nullable(UInt8)';

CREATE OR REPLACE TABLE atp_matches_1980s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1980..1989}.csv')
SETTINGS schema_inference_make_columns_nullable=0,
         schema_inference_hints='winner_seed Nullable(UInt16), loser_seed Nullable(UInt16)';

CREATE OR REPLACE TABLE atp_matches_1990s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score,
       toBool(arrayExists(x -> position(x, 'W/O') > 0, score))::Nullable(bool) AS walkover,
       toBool(arrayExists(x -> position(x, 'RET') > 0, score))::Nullable(bool) AS retirement
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1990..1999}.csv')
SETTINGS schema_inference_make_columns_nullable=0,
         schema_inference_hints='winner_seed Nullable(UInt16), loser_seed Nullable(UInt16), surface Enum(\'Hard\', \'Grass\', \'Clay\', \'Carpet\')';
```

## 여러 테이블의 스키마 \{#schema-multiple-tables\}

다음 쿼리를 실행하면 각 테이블의 컬럼과 해당 타입을 나란히 나열하여 차이점을 더 쉽게 확인할 수 있습니다.

```sql
SELECT * EXCEPT(position) FROM (
    SELECT position, name,
       any(if(table = 'atp_matches_1960s', type, null)) AS 1960s,
       any(if(table = 'atp_matches_1970s', type, null)) AS 1970s,
       any(if(table = 'atp_matches_1980s', type, null)) AS 1980s,
       any(if(table = 'atp_matches_1990s', type, null)) AS 1990s
    FROM system.columns
    WHERE database = currentDatabase() AND table LIKE 'atp_matches%'
    GROUP BY ALL
    ORDER BY position ASC
)
SETTINGS output_format_pretty_max_value_width=25;
```

```text
┌─name────────┬─1960s────────────┬─1970s───────────┬─1980s────────────┬─1990s─────────────────────┐
│ tourney_id  │ String           │ String          │ String           │ String                    │
│ surface     │ String           │ String          │ String           │ Enum8('Hard' = 1, 'Grass'⋯│
│ winner_name │ String           │ String          │ String           │ String                    │
│ loser_name  │ String           │ String          │ String           │ String                    │
│ winner_seed │ Nullable(String) │ Nullable(UInt8) │ Nullable(UInt16) │ Nullable(UInt16)          │
│ loser_seed  │ Nullable(UInt8)  │ Nullable(UInt8) │ Nullable(UInt16) │ Nullable(UInt16)          │
│ score       │ String           │ Array(String)   │ Array(String)    │ Array(String)             │
│ walkover    │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ            │ ᴺᵁᴸᴸ             │ Nullable(Bool)            │
│ retirement  │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ            │ ᴺᵁᴸᴸ             │ Nullable(Bool)            │
└─────────────┴──────────────────┴─────────────────┴──────────────────┴───────────────────────────┘
```

차이점을 살펴보겠습니다:

* 1970년대에는 `winner_seed` 타입을 `Nullable(String)`에서 `Nullable(UInt8)`로, `score`를 `String`에서 `Array(String)`으로 변경합니다.
* 1980년대에는 `winner_seed`와 `loser_seed`를 `Nullable(UInt8)`에서 `Nullable(UInt16)`로 변경합니다.
* 1990년대에는 `surface`를 `String`에서 `Enum('Hard', 'Grass', 'Clay', 'Carpet')`로 변경하고, `walkover`와 `retirement` 컬럼을 추가합니다.

## merge를 사용하여 여러 테이블을 조회하기 \{#querying-multiple-tables\}

John McEnroe가 시드 1번으로 배정된 선수를 상대로 거둔 승리를 찾는 쿼리를 작성해 보겠습니다.

```sql
SELECT loser_name, score
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1;
```

```text
┌─loser_name────┬─score───────────────────────────┐
│ Bjorn Borg    │ ['6-3','6-4']                   │
│ Bjorn Borg    │ ['7-6','6-1','6-7','5-7','6-4'] │
│ Bjorn Borg    │ ['7-6','6-4']                   │
│ Bjorn Borg    │ ['4-6','7-6','7-6','6-4']       │
│ Jimmy Connors │ ['6-1','6-3']                   │
│ Ivan Lendl    │ ['6-2','4-6','6-3','6-7','7-6'] │
│ Ivan Lendl    │ ['6-3','3-6','6-3','7-6']       │
│ Ivan Lendl    │ ['6-1','6-3']                   │
│ Stefan Edberg │ ['6-2','6-3']                   │
│ Stefan Edberg │ ['7-6','6-2']                   │
│ Stefan Edberg │ ['6-2','6-2']                   │
│ Jakob Hlasek  │ ['6-3','7-6']                   │
└───────────────┴─────────────────────────────────┘
```

다음으로, McEnroe가 시드 3번 이하였던 경기만 찾을 수 있도록 이 경기들을 필터링한다고 가정해 보겠습니다.
이는 `winner_seed`가 여러 테이블에서 서로 다른 데이터 타입을 사용하기 때문에 다소 까다로운 작업입니다:

```sql
SELECT loser_name, score, winner_seed
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1
AND multiIf(
  variantType(winner_seed) = 'UInt8', variantElement(winner_seed, 'UInt8') >= 3,
  variantType(winner_seed) = 'UInt16', variantElement(winner_seed, 'UInt16') >= 3,
  variantElement(winner_seed, 'String')::UInt16 >= 3
);
```

각 행에 대해 `winner_seed`의 타입을 확인하기 위해 [`variantType`](/docs/sql-reference/functions/other-functions#variantType) 함수를 사용하고, 그런 다음 내부 값을 추출하기 위해 [`variantElement`](/docs/sql-reference/functions/other-functions#variantElement)를 사용합니다.
타입이 `String`인 경우 숫자로 캐스팅한 후 비교를 수행합니다.
쿼리를 실행한 결과는 아래와 같습니다.

```text
┌─loser_name────┬─score─────────┬─winner_seed─┐
│ Bjorn Borg    │ ['6-3','6-4'] │ 3           │
│ Stefan Edberg │ ['6-2','6-3'] │ 6           │
│ Stefan Edberg │ ['7-6','6-2'] │ 4           │
│ Stefan Edberg │ ['6-2','6-2'] │ 7           │
└───────────────┴───────────────┴─────────────┘
```

## merge를 사용할 때 행은 어떤 테이블에서 오나요? \{#which-table-merge\}

행이 어떤 테이블에서 왔는지 알고 싶다면 어떻게 해야 할까요?
다음 쿼리와 같이 `_table` 가상 컬럼을 사용하여 확인할 수 있습니다.

```sql
SELECT _table, loser_name, score, winner_seed
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1
AND multiIf(
  variantType(winner_seed) = 'UInt8', variantElement(winner_seed, 'UInt8') >= 3,
  variantType(winner_seed) = 'UInt16', variantElement(winner_seed, 'UInt16') >= 3,
  variantElement(winner_seed, 'String')::UInt16 >= 3
);
```

```text
┌─_table────────────┬─loser_name────┬─score─────────┬─winner_seed─┐
│ atp_matches_1970s │ Bjorn Borg    │ ['6-3','6-4'] │ 3           │
│ atp_matches_1980s │ Stefan Edberg │ ['6-2','6-3'] │ 6           │
│ atp_matches_1980s │ Stefan Edberg │ ['7-6','6-2'] │ 4           │
│ atp_matches_1980s │ Stefan Edberg │ ['6-2','6-2'] │ 7           │
└───────────────────┴───────────────┴───────────────┴─────────────┘
```

이 가상 컬럼을 쿼리의 일부로 사용하여 `walkover` 컬럼의 값 개수를 셀 수도 있습니다.

```sql
SELECT _table, walkover, count()
FROM merge('atp_matches*')
GROUP BY ALL
ORDER BY _table;
```

```text
┌─_table────────────┬─walkover─┬─count()─┐
│ atp_matches_1960s │ ᴺᵁᴸᴸ     │    7542 │
│ atp_matches_1970s │ ᴺᵁᴸᴸ     │   39165 │
│ atp_matches_1980s │ ᴺᵁᴸᴸ     │   36233 │
│ atp_matches_1990s │ true     │     128 │
│ atp_matches_1990s │ false    │   37022 │
└───────────────────┴──────────┴─────────┘
```

`walkover` 컬럼이 `atp_matches_1990s`를 제외한 모든 행에서 `NULL`인 것을 확인할 수 있습니다.
`walkover` 컬럼이 `NULL`인 경우 `score` 컬럼에 문자열 `W/O`가 포함되어 있는지 확인하도록 쿼리를 업데이트해야 합니다:

```sql
SELECT _table,
   multiIf(
     walkover IS NOT NULL,
     walkover,
     variantType(score) = 'Array(String)',
     toBool(arrayExists(
        x -> position(x, 'W/O') > 0,
        variantElement(score, 'Array(String)')
     )),
     variantElement(score, 'String') LIKE '%W/O%'
   ),
   count()
FROM merge('atp_matches*')
GROUP BY ALL
ORDER BY _table;
```

`score`의 기본 타입이 `Array(String)`이면 배열을 순회하면서 `W/O`를 찾아야 하고, 타입이 `String`이면 문자열에서 `W/O`를 바로 검색하면 됩니다.

```text
┌─_table────────────┬─multiIf(isNo⋯, '%W/O%'))─┬─count()─┐
│ atp_matches_1960s │ true                     │     242 │
│ atp_matches_1960s │ false                    │    7300 │
│ atp_matches_1970s │ true                     │     422 │
│ atp_matches_1970s │ false                    │   38743 │
│ atp_matches_1980s │ true                     │      92 │
│ atp_matches_1980s │ false                    │   36141 │
│ atp_matches_1990s │ true                     │     128 │
│ atp_matches_1990s │ false                    │   37022 │
└───────────────────┴──────────────────────────┴─────────┘
```
