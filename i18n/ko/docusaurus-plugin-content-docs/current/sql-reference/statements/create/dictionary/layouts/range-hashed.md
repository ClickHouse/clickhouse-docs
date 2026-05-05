---
slug: /sql-reference/statements/create/dictionary/layouts/range-hashed
title: 'range_hashed 딕셔너리 레이아웃 유형'
sidebar_label: 'range_hashed'
sidebar_position: 5
description: '정렬된 날짜/시간 범위 기반 해시 테이블을 사용하여 딕셔너리를 메모리에 저장합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## range_hashed \{#range_hashed\}

딕셔너리는 메모리 내에서 정렬된 범위 배열과 그에 해당하는 값들을 가진 해시 테이블 형태로 저장됩니다.

이 저장 방식은 `hashed`와 동일하게 동작하며, 키뿐만 아니라 날짜/시간(임의의 숫자 타입) 범위도 사용할 수 있습니다.

예: 테이블에는 각 광고주에 대한 할인 정보가 다음 형식으로 포함되어 있습니다.

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

날짜 범위용 샘플을 사용하려면 [structure](../attributes.md#composite-key)에서 `range_min` 및 `range_max` 요소를 정의합니다. 각 요소에는 `name` 및 `type` 요소가 포함되어야 합니다. `type`이 지정되지 않은 경우 기본 타입인 Date가 사용됩니다. `type`은 임의의 숫자 타입일 수 있습니다 (Date / DateTime / UInt64 / Int32 / 기타).

:::note
`range_min` 및 `range_max`의 값은 `Int64` 타입 범위에 포함되어야 합니다.
:::

예제:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    CREATE DICTIONARY discounts_dict (
        advertiser_id UInt64,
        discount_start_date Date,
        discount_end_date Date,
        amount Float64
    )
    PRIMARY KEY id
    SOURCE(CLICKHOUSE(TABLE 'discounts'))
    LIFETIME(MIN 1 MAX 1000)
    LAYOUT(RANGE_HASHED(range_lookup_strategy 'max'))
    RANGE(MIN discount_start_date MAX discount_end_date)
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <layout>
        <range_hashed>
            <!-- 겹치는 범위에 대한 전략(min/max)입니다. 기본값: min (일치하는 범위 중 min(range_min -> range_max) 값을 반환) -->
            <range_lookup_strategy>min</range_lookup_strategy>
        </range_hashed>
    </layout>
    <structure>
        <id>
            <name>advertiser_id</name>
        </id>
        <range_min>
            <name>discount_start_date</name>
            <type>Date</type>
        </range_min>
        <range_max>
            <name>discount_end_date</name>
            <type>Date</type>
        </range_max>
        ...
    ```
  </TabItem>
</Tabs>

<br />

이러한 딕셔너리를 사용하려면 범위 선택에 사용되는 추가 인수를 `dictGet` 함수에 전달해야 합니다:

```sql
dictGet('dict_name', 'attr_name', id, date)
```

쿼리 예제:

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

이 FUNCTION은 지정된 `id` 값들에 대해, 전달된 날짜를 포함하는 날짜 범위에 대한 값을 반환합니다.

알고리즘 동작 방식:

* `id`를 찾을 수 없거나 해당 `id`에 대한 범위를 찾을 수 없는 경우, 속성 타입의 기본값을 반환합니다.
* 범위가 서로 겹치고 `range_lookup_strategy=min`인 경우, 일치하는 범위 중 `range_min`이 가장 작은 범위를 반환합니다. 여러 범위가 발견되면 그중 `range_max`가 가장 작은 범위를 반환하고, 다시 여러 범위가 발견되는 경우(여러 범위의 `range_min`과 `range_max`가 동일한 경우) 이들 중 임의의 범위를 반환합니다.
* 범위가 서로 겹치고 `range_lookup_strategy=max`인 경우, 일치하는 범위 중 `range_min`이 가장 큰 범위를 반환합니다. 여러 범위가 발견되면 그중 `range_max`가 가장 큰 범위를 반환하고, 다시 여러 범위가 발견되는 경우(여러 범위의 `range_min`과 `range_max`가 동일한 경우) 이들 중 임의의 범위를 반환합니다.
* `range_max`가 `NULL`이면, 해당 범위는 열려 있는 범위입니다. `NULL`은 가능한 최대값으로 간주됩니다. `range_min`의 경우 열린 값으로 `1970-01-01` 또는 `0`(-MAX&#95;INT)을 사용할 수 있습니다.

구성 예:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    CREATE DICTIONARY somedict(
        Abcdef UInt64,
        StartTimeStamp UInt64,
        EndTimeStamp UInt64,
        XXXType String DEFAULT ''
    )
    PRIMARY KEY Abcdef
    RANGE(MIN StartTimeStamp MAX EndTimeStamp)
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <clickhouse>
        <dictionary>
            ...

            <layout>
                <range_hashed />
            </layout>

            <structure>
                <id>
                    <name>Abcdef</name>
                </id>
                <range_min>
                    <name>StartTimeStamp</name>
                    <type>UInt64</type>
                </range_min>
                <range_max>
                    <name>EndTimeStamp</name>
                    <type>UInt64</type>
                </range_max>
                <attribute>
                    <name>XXXType</name>
                    <type>String</type>
                    <null_value />
                </attribute>
            </structure>

        </dictionary>
    </clickhouse>
    ```
  </TabItem>
</Tabs>

<br />

겹치는 범위와 열린 범위를 포함한 구성 예시는 다음과 같습니다:

```sql
CREATE TABLE discounts
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
ENGINE = Memory;

INSERT INTO discounts VALUES (1, '2015-01-01', Null, 0.1);
INSERT INTO discounts VALUES (1, '2015-01-15', Null, 0.2);
INSERT INTO discounts VALUES (2, '2015-01-01', '2015-01-15', 0.3);
INSERT INTO discounts VALUES (2, '2015-01-04', '2015-01-10', 0.4);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-15', 0.5);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-10', 0.6);

SELECT * FROM discounts ORDER BY advertiser_id, discount_start_date;
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│             1 │          2015-01-01 │              ᴺᵁᴸᴸ │    0.1 │
│             1 │          2015-01-15 │              ᴺᵁᴸᴸ │    0.2 │
│             2 │          2015-01-01 │        2015-01-15 │    0.3 │
│             2 │          2015-01-04 │        2015-01-10 │    0.4 │
│             3 │          1970-01-01 │        2015-01-15 │    0.5 │
│             3 │          1970-01-01 │        2015-01-10 │    0.6 │
└───────────────┴─────────────────────┴───────────────────┴────────┘

-- RANGE_LOOKUP_STRATEGY 'max'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'max'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- the only one range is matching: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- two ranges are matching, range_min 2015-01-15 (0.2) is bigger than 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- two ranges are matching, range_min 2015-01-04 (0.4) is bigger than 2015-01-01 (0.3)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- two ranges are matching, range_min are equal, 2015-01-15 (0.5) is bigger than 2015-01-10 (0.6)
└─────┘

DROP DICTIONARY discounts_dict;

-- RANGE_LOOKUP_STRATEGY 'min'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'min'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- the only one range is matching: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- two ranges are matching, range_min 2015-01-01 (0.1) is less than 2015-01-15 (0.2)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- two ranges are matching, range_min 2015-01-01 (0.3) is less than 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- two ranges are matching, range_min are equal, 2015-01-10 (0.6) is less than 2015-01-15 (0.5)
└─────┘
```

## complex_key_range_hashed \{#complex_key_range_hashed\}

딕셔너리는 메모리에서 정렬된 범위 배열과 각 범위에 대응하는 값들로 구성된 해시 테이블 형태로 저장됩니다(자세한 내용은 [range&#95;hashed](#range_hashed) 참고). 이 저장 방식은 복합 [키](../attributes.md#composite-key)에 사용됩니다.

구성 예시:

```sql
CREATE DICTIONARY range_dictionary
(
  CountryID UInt64,
  CountryKey String,
  StartDate Date,
  EndDate Date,
  Tax Float64 DEFAULT 0.2
)
PRIMARY KEY CountryID, CountryKey
SOURCE(CLICKHOUSE(TABLE 'date_table'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(COMPLEX_KEY_RANGE_HASHED())
RANGE(MIN StartDate MAX EndDate);
```
