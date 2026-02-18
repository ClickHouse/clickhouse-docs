---
description: 'ClickHouse 외부 딕셔너리 기능 개요'
sidebar_label: '딕셔너리 정의'
sidebar_position: 35
slug: /sql-reference/dictionaries
title: '딕셔너리'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# 딕셔너리 \{#dictionaries\}

딕셔너리는 다양한 유형의 참조 목록에 편리하게 사용할 수 있는 (`key -> attributes`) 매핑입니다.

ClickHouse는 쿼리에서 사용할 수 있는 딕셔너리 작업용 특수 함수를 지원합니다. 참조 테이블과 `JOIN`을 사용하는 것보다 함수와 함께 딕셔너리를 사용하는 것이 더 쉽고 효율적입니다.

ClickHouse는 다음을 지원합니다:

- [함수 집합](../../sql-reference/functions/ext-dict-functions.md)을 사용하는 딕셔너리.
- 특정 [함수 집합](../../sql-reference/functions/embedded-dict-functions.md)을 가진 [내장 딕셔너리](#embedded-dictionaries).

:::tip Tutorial
ClickHouse에서 딕셔너리를 처음 사용하는 경우 해당 주제를 다루는 튜토리얼이 준비되어 있습니다. [여기](tutorial.md)를 참고하십시오.
:::

다양한 데이터 소스에서 사용자 정의 딕셔너리를 추가할 수 있습니다. 딕셔너리의 소스로는 ClickHouse 테이블, 로컬 텍스트 또는 실행 파일, HTTP(S) 리소스, 다른 DBMS 등이 될 수 있습니다. 자세한 내용은 「[Dictionary Sources](#dictionary-sources)」를 참조하십시오.

ClickHouse는 다음을 수행합니다:

- 딕셔너리를 RAM에 전체 또는 부분적으로 저장합니다.
- 딕셔너리를 주기적으로 업데이트하고 누락된 값을 동적으로 로드합니다. 다시 말해, 딕셔너리는 동적으로 로드될 수 있습니다.
- XML 파일 또는 [DDL 쿼리](../../sql-reference/statements/create/dictionary.md)로 딕셔너리를 생성할 수 있도록 허용합니다.

딕셔너리 구성은 하나 이상의 XML 파일에 위치할 수 있습니다. 구성 경로는 [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config) 파라미터에 지정됩니다.

딕셔너리는 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 설정에 따라 서버 시작 시 또는 처음 사용 시 로드될 수 있습니다.

[dictionaries](/operations/system-tables/dictionaries) 시스템 테이블에는 서버에서 구성된 딕셔너리에 대한 정보가 포함되어 있습니다. 각 딕셔너리에 대해 다음 정보를 확인할 수 있습니다:

- 딕셔너리 상태.
- 구성 파라미터.
- 딕셔너리에 할당된 RAM 양, 딕셔너리가 성공적으로 로드된 이후 처리된 쿼리 수 등의 메트릭.

<CloudDetails />

## DDL 쿼리로 딕셔너리 생성하기 \{#creating-a-dictionary-with-a-ddl-query\}

딕셔너리는 [DDL 쿼리](../../sql-reference/statements/create/dictionary.md)로 생성할 수 있으며, DDL로 딕셔너리를 생성하는 방법을 다음과 같은 이유로 권장합니다:

- 서버 설정 파일에 추가 레코드를 기록할 필요가 없습니다.
- 딕셔너리를 테이블이나 VIEW처럼 일급 객체로 다룰 수 있습니다.
- 딕셔너리 테이블 FUNCTION 대신 익숙한 SELECT를 사용하여 데이터를 직접 읽을 수 있습니다. SELECT 문을 통해 딕셔너리에 직접 접근하는 경우, 캐시된 딕셔너리는 캐시에 존재하는 데이터만 반환하고, 캐시되지 않는 딕셔너리는 저장하고 있는 모든 데이터를 반환한다는 점에 유의하십시오. 
- 딕셔너리 이름을 쉽게 변경할 수 있습니다.

## 설정 파일로 딕셔너리 생성하기 \{#creating-a-dictionary-with-a-configuration-file\}

<CloudNotSupportedBadge />

:::note
설정 파일로 딕셔너리를 생성하는 방법은 ClickHouse Cloud에서는 지원되지 않습니다. 위에서 설명한 대로 DDL을 사용하고, `default` USER로 딕셔너리를 생성하십시오.
:::

딕셔너리 설정 파일은 다음 형식을 가집니다:

```xml
<clickhouse>
    <comment>An optional element with any content. Ignored by the ClickHouse server.</comment>

    <!--Optional element. File name with substitutions-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Dictionary configuration. -->
        <!-- There can be any number of dictionary sections in a configuration file. -->
    </dictionary>

</clickhouse>
```

동일한 파일에서 원하는 만큼의 딕셔너리를 [구성](#configuring-a-dictionary)할 수 있습니다.

:::note
작은 딕셔너리의 값은 `SELECT` 쿼리에서 이를 정의하여 변환할 수 있습니다([transform](../../sql-reference/functions/other-functions.md) 함수를 참조하십시오). 이 기능은 딕셔너리와는 관련이 없습니다.
:::


## 딕셔너리 구성하기 \{#configuring-a-dictionary\}

<CloudDetails />

딕셔너리를 XML 파일로 구성하는 경우, 구성은 다음과 같은 구조를 따릅니다:

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- Complex key configuration -->
    </structure>

    <source>
      <!-- Source configuration -->
    </source>

    <layout>
      <!-- Memory layout configuration -->
    </layout>

    <lifetime>
      <!-- Lifetime of dictionary in memory -->
    </lifetime>
</dictionary>
```

해당 [DDL 쿼리](../../sql-reference/statements/create/dictionary.md)의 구조는 다음과 같습니다.

```sql
CREATE DICTIONARY dict_name
(
    ... -- attributes
)
PRIMARY KEY ... -- complex or single key configuration
SOURCE(...) -- Source configuration
LAYOUT(...) -- Memory layout configuration
LIFETIME(...) -- Lifetime of dictionary in memory
```


## 메모리에 딕셔너리 저장하기 \{#storing-dictionaries-in-memory\}

메모리에 딕셔너리를 저장하는 방식에는 여러 가지가 있습니다.

최적의 처리 속도를 제공하는 [flat](#flat), [hashed](#hashed), [complex&#95;key&#95;hashed](#complex_key_hashed) 방식을 사용하는 것을 권장합니다.

성능 저하 가능성과 최적의 매개변수 선정이 어렵다는 이유로 캐싱(caching)은 권장되지 않습니다. 자세한 내용은 [cache](#cache) 섹션을 참조하십시오.

딕셔너리 성능을 개선하는 방법은 다음과 같습니다.

* 딕셔너리 작업을 위한 함수는 `GROUP BY` 이후에 호출합니다.
* 추출할 속성을 단사(injective)로 표시합니다. 서로 다른 키가 서로 다른 속성 값에 대응하면 해당 속성은 단사라고 합니다. 따라서 `GROUP BY`에서 키를 사용해 속성 값을 가져오는 함수를 사용할 경우, 이 함수는 자동으로 `GROUP BY` 밖으로 이동됩니다.

ClickHouse는 딕셔너리 관련 오류에 대해 예외를 발생시킵니다. 오류 예시는 다음과 같습니다.

* 액세스하려는 딕셔너리를 로드할 수 없음.
* `cached` 딕셔너리를 쿼리하는 중 오류.

[system.dictionaries](../../operations/system-tables/dictionaries.md) 테이블에서 딕셔너리 목록과 상태를 확인할 수 있습니다.

<CloudDetails />

구성은 다음과 같습니다.

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- layout settings -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

이에 해당하는 [DDL 쿼리](../../sql-reference/statements/create/dictionary.md):

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- layout settings
...
```

레이아웃 이름에 `complex-key*`가 없는 딕셔너리는 키가 [UInt64](../../sql-reference/data-types/int-uint.md) 타입이며, `complex-key*` 딕셔너리는 복합 키(임의의 타입을 사용하는 복잡한 키)를 가집니다.

XML 딕셔너리에서 [UInt64](../../sql-reference/data-types/int-uint.md) 키는 `<id>` 태그로 정의됩니다.

구성 예(컬럼 key&#95;column의 타입은 UInt64입니다):

```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

복합 `complex` 키 XML 사전은 `<key>` 태그로 정의됩니다.

복합 키 구성 예시입니다(키는 [String](../../sql-reference/data-types/string.md) 타입의 요소 한 개를 가집니다):

```xml
...
<structure>
    <key>
        <attribute>
            <name>country_code</name>
            <type>String</type>
        </attribute>
    </key>
...
```


## 메모리에 딕셔너리를 저장하는 방법 \{#ways-to-store-dictionaries-in-memory\}

메모리에 딕셔너리 데이터를 저장하는 다양한 방식은 CPU 및 RAM 사용량 간의 절충 관계가 있습니다. 어떤 레이아웃을 사용할지 결정할 때에는 딕셔너리 관련 [블로그 게시물](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)의 [Choosing a Layout](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) 단락에 제시된 결정 트리를 출발점으로 삼는 것이 좋습니다.

- [flat](#flat)
- [hashed](#hashed)
- [sparse_hashed](#sparse_hashed)
- [complex_key_hashed](#complex_key_hashed)
- [complex_key_sparse_hashed](#complex_key_sparse_hashed)
- [hashed_array](#hashed_array)
- [complex_key_hashed_array](#complex_key_hashed_array)
- [range_hashed](#range_hashed)
- [complex_key_range_hashed](#complex_key_range_hashed)
- [cache](#cache)
- [complex_key_cache](#complex_key_cache)
- [ssd_cache](#ssd_cache)
- [complex_key_ssd_cache](#complex_key_ssd_cache)
- [direct](#direct)
- [complex_key_direct](#complex_key_direct)
- [ip_trie](#ip_trie)

### flat \{#flat\}

딕셔너리는 flat 배열(flat array) 형태로 전체가 메모리에 저장됩니다. 딕셔너리가 사용하는 메모리 양은 (공간 사용 측면에서) 가장 큰 키의 크기에 비례합니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 타입이며, 값(배열)의 크기는 `max_array_size`(기본값 — 500,000)로 제한됩니다. 딕셔너리를 생성하는 동안 더 큰 키가 발견되면 ClickHouse는 예외를 발생시키고 딕셔너리를 생성하지 않습니다. 딕셔너리 flat 배열의 초기 크기는 `initial_array_size` 설정(기본값 — 1024)으로 제어됩니다.

모든 유형의 소스를 지원합니다. 업데이트 시에는 데이터(파일 또는 테이블에서)를 전체를 읽어 들입니다.

이 방법은 사용 가능한 모든 딕셔너리 저장 방식 가운데 가장 뛰어난 성능을 제공합니다.

구성 예:

```xml
<layout>
  <flat>
    <initial_array_size>50000</initial_array_size>
    <max_array_size>5000000</max_array_size>
  </flat>
</layout>
```

또는

```sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```


### hashed \{#hashed\}

딕셔너리는 해시 테이블 형태로 전체가 메모리에 저장됩니다. 딕셔너리에는 어떤 식별자를 가진 요소든 개수 제한 없이 포함될 수 있습니다. 실제로는 키의 개수가 수천만 개에 이를 수 있습니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 타입입니다.

모든 유형의 소스를 지원합니다. 업데이트 시에는 데이터(파일 또는 테이블에서 가져온 데이터)를 전체를 읽어 처리합니다.

구성 예시는 다음과 같습니다:

```xml
<layout>
  <hashed />
</layout>
```

또는

```sql
LAYOUT(HASHED())
```

구성 예시:

```xml
<layout>
  <hashed>
    <!-- If shards greater then 1 (default is `1`) the dictionary will load
         data in parallel, useful if you have huge amount of elements in one
         dictionary. -->
    <shards>10</shards>

    <!-- Size of the backlog for blocks in parallel queue.

         Since the bottleneck in parallel loading is rehash, and so to avoid
         stalling because of thread is doing rehash, you need to have some
         backlog.

         10000 is good balance between memory and speed.
         Even for 10e10 elements and can handle all the load without starvation. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- Maximum load factor of the hash table, with greater values, the memory
         is utilized more efficiently (less memory is wasted) but read/performance
         may deteriorate.

         Valid values: [0.5, 0.99]
         Default: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

또는

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```


### sparse_hashed \{#sparse_hashed\}

`hashed`와 유사하지만, 메모리 사용량을 줄이는 대신 CPU 사용량이 더 많습니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 타입입니다.

구성 예시:

```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

또는

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

이 유형의 딕셔너리에는 `shards`를 사용할 수도 있으며, `sparse_hashed`가 `hashed`보다 느리므로 `shards` 사용은 `hashed`보다 `sparse_hashed`에서 더 중요합니다.


### complex_key_hashed \{#complex_key_hashed\}

이 저장소 유형은 복합 [키](#dictionary-key-and-fields)에 사용합니다. `hashed`와 유사합니다.

구성 예:

```xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

또는

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```


### complex_key_sparse_hashed \{#complex_key_sparse_hashed\}

이 저장소 유형은 복합 [키](#dictionary-key-and-fields)에 사용되는 유형입니다. [sparse&#95;hashed](#sparse_hashed)와 유사합니다.

구성 예시:

```xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

또는

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```


### hashed_array \{#hashed_array\}

딕셔너리는 전체가 메모리에 저장됩니다. 각 속성은 배열에 저장됩니다. 키 속성은 해시된 테이블 형태로 저장되며, 여기서 값은 속성 배열의 인덱스입니다. 딕셔너리는 어떤 식별자든 가질 수 있는 요소를 임의 개수만큼 포함할 수 있습니다. 실제로는 키의 개수가 수천만 개에 이를 수 있습니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 타입입니다.

모든 유형의 소스를 지원합니다. 업데이트 시에는 파일 또는 테이블에서 데이터를 전체 한 번에 읽습니다.

구성 예시는 다음과 같습니다:

```xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

또는

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```


### complex_key_hashed_array \{#complex_key_hashed_array\}

이 저장소 유형은 복합 [키](#dictionary-key-and-fields)에 사용됩니다. [hashed&#95;array](#hashed_array)와 유사합니다.

구성 예시:

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

또는

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```


### range_hashed \{#range_hashed\}

딕셔너리는 메모리에서 정렬된 범위 배열과 각 범위에 대응하는 값들로 구성된 해시 테이블 형태로 저장됩니다.

이 저장 방식은 `hashed`와 동일하게 동작하며, 키와 함께 날짜/시간(임의의 숫자 타입) 범위도 사용할 수 있습니다.

예시: 테이블에는 각 광고주에 대한 할인 정보가 다음 형식으로 포함되어 있습니다.

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

날짜 범위에 샘플을 사용하려면 [structure](#dictionary-key-and-fields)에서 `range_min` 및 `range_max` 요소를 정의합니다. 이 요소에는 `name` 및 `type` 요소가 포함되어야 합니다. `type`이 지정되지 않은 경우 기본 타입인 Date가 사용됩니다. `type`에는 임의의 숫자 타입(예: Date / DateTime / UInt64 / Int32 / 기타)을 지정할 수 있습니다.

:::note
`range_min` 및 `range_max` 값은 `Int64` 타입으로 표현 가능한 범위여야 합니다.
:::

예:

```xml
<layout>
    <range_hashed>
        <!-- Strategy for overlapping ranges (min/max). Default: min (return a matching range with the min(range_min -> range_max) value) -->
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

또는

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

이러한 딕셔너리를 사용하려면 범위를 지정하는 데 사용할 추가 인수를 `dictGet` 함수에 전달해야 합니다.

```sql
dictGet('dict_name', 'attr_name', id, date)
```

쿼리 예제:

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

이 FUNCTION은 지정된 `id` 값들과 전달된 날짜를 포함하는 날짜 범위에 대한 값을 반환합니다.

알고리즘 상세:

* `id`를 찾지 못했거나 해당 `id`에 대한 범위를 찾지 못한 경우, 속성 타입의 기본값을 반환합니다.
* 범위가 겹치고 `range_lookup_strategy=min`인 경우, 일치하는 범위 중 `range_min`이 최소인 범위를 반환합니다. 여러 범위가 있는 경우 `range_max`가 최소인 범위를 반환하고, 다시 여러 범위가 있는 경우(여러 범위의 `range_min`과 `range_max`가 동일한 경우) 그중 임의의 범위를 반환합니다.
* 범위가 겹치고 `range_lookup_strategy=max`인 경우, 일치하는 범위 중 `range_min`이 최대인 범위를 반환합니다. 여러 범위가 있는 경우 `range_max`가 최대인 범위를 반환하고, 다시 여러 범위가 있는 경우(여러 범위의 `range_min`과 `range_max`가 동일한 경우) 그중 임의의 범위를 반환합니다.
* `range_max`가 `NULL`이면, 해당 범위는 열린 범위로 간주됩니다. `NULL`은 가능한 최대 값으로 취급합니다. `range_min`의 열린 값으로는 `1970-01-01` 또는 `0`(-MAX&#95;INT)을 사용할 수 있습니다.

구성 예시:


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

또는

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

겹치는 구간과 열린 구간이 포함된 구성 예제:


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

### complex_key_range_hashed \{#complex_key_range_hashed\}

딕셔너리는 해시 테이블 형태로 메모리에 저장되며, 정렬된 범위 배열과 그에 대응하는 값들로 구성됩니다([range&#95;hashed](#range_hashed) 참조). 이 저장 방식은 복합 [키](#dictionary-key-and-fields)를 사용할 때 사용합니다.

구성 예는 다음과 같습니다:

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


### cache \{#cache\}

딕셔리는 고정된 개수의 셀을 가진 캐시에 저장됩니다. 이 셀에는 자주 사용되는 요소가 저장됩니다.

딕셔리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 타입입니다.

딕셔리를 조회할 때는 먼저 캐시를 검색합니다. 각 데이터 블록에 대해, 캐시에 없거나 오래된 모든 키를 `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` 쿼리를 사용하여 소스에서 요청합니다. 수신된 데이터는 캐시에 기록됩니다.

키가 딕셔리에 없으면 캐시 업데이트 작업이 생성되어 업데이트 큐에 추가됩니다. 업데이트 큐의 속성은 `max_update_queue_size`, `update_queue_push_timeout_milliseconds`, `query_wait_timeout_milliseconds`, `max_threads_for_updates` 설정으로 제어할 수 있습니다.

cache 딕셔리의 경우 캐시 내 데이터의 만료 [lifetime](#refreshing-dictionary-data-using-lifetime)을 설정할 수 있습니다. 셀에 데이터를 적재한 이후 `lifetime` 이상 시간이 지나면 해당 셀의 값은 사용되지 않고 키는 만료된 것으로 간주됩니다. 이 키는 다음에 사용이 필요할 때 다시 요청됩니다. 이 동작은 `allow_read_expired_keys` 설정으로 구성할 수 있습니다.

이는 딕셔리를 저장하는 방식 중 가장 비효율적인 방법입니다. 캐시의 성능은 적절한 설정과 사용 시나리오에 크게 의존합니다. cache 타입 딕셔리는 히트율이 충분히 높을 때(권장 99% 이상)만 성능이 좋습니다. 평균 히트율은 [system.dictionaries](../../operations/system-tables/dictionaries.md) 테이블에서 확인할 수 있습니다.

`allow_read_expired_keys` 설정이 1로 설정되어 있으면(기본값은 0), 딕셔리는 비동기 업데이트를 지원할 수 있습니다. 클라이언트가 키들을 요청했을 때, 모든 키가 캐시에 있지만 일부가 만료된 상태라면, 딕셔리는 클라이언트에게 만료된 키를 반환하고, 소스에는 이를 비동기적으로 다시 요청합니다.

캐시 성능을 향상시키려면 `LIMIT`이 있는 서브쿼리를 사용하고, 딕셔리를 사용하는 함수를 외부에서 호출하십시오.

모든 타입의 소스를 지원합니다.

설정 예:

```xml
<layout>
    <cache>
        <!-- The size of the cache, in number of cells. Rounded up to a power of two. -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- Allows to read expired keys. -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- Max size of update queue. -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- Max timeout in milliseconds for push update task into queue. -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- Max wait timeout in milliseconds for update task to complete. -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- Max threads for cache dictionary update. -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

또는

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

충분히 큰 캐시 크기를 설정합니다. 셀 개수는 실험을 통해 결정해야 합니다.

1. 임의의 값을 설정합니다.
2. 캐시가 완전히 채워질 때까지 쿼리를 실행합니다.
3. `system.dictionaries` 테이블을 사용하여 메모리 사용량을 확인합니다.
4. 원하는 메모리 사용량에 도달할 때까지 셀 개수를 늘리거나 줄입니다.

:::note
무작위 읽기(random reads)가 포함된 쿼리 처리 속도가 느리므로, 데이터 소스로 ClickHouse를 사용하지 마십시오.
:::


### complex_key_cache \{#complex_key_cache\}

이 저장소 유형은 복합 [키](#dictionary-key-and-fields)에 사용하는 것입니다. `cache`와 유사합니다.

### ssd_cache \{#ssd_cache\}

`cache`와 유사하지만, 데이터는 SSD에, 인덱스는 RAM에 저장합니다. 업데이트 큐와 관련된 `cache` 딕셔너리의 모든 설정은 SSD 캐시 딕셔너리에도 동일하게 적용할 수 있습니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 타입입니다.

```xml
<layout>
    <ssd_cache>
        <!-- Size of elementary read block in bytes. Recommended to be equal to SSD's page size. -->
        <block_size>4096</block_size>
        <!-- Max cache file size in bytes. -->
        <file_size>16777216</file_size>
        <!-- Size of RAM buffer in bytes for reading elements from SSD. -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- Size of RAM buffer in bytes for aggregating elements before flushing to SSD. -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- Path where cache file will be stored. -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

또는

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```


### complex_key_ssd_cache \{#complex_key_ssd_cache\}

이 저장소 유형은 복합 [키](#dictionary-key-and-fields)에 사용하는 것입니다. `ssd_cache`와 유사하게 동작합니다.

### direct \{#direct\}

딕셔너리는 메모리에 저장되지 않고, 요청을 처리할 때마다 소스에서 직접 데이터를 조회합니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 타입입니다.

로컬 파일을 제외한 모든 유형의 [소스](#dictionary-sources)를 지원합니다.

구성 예시는 다음과 같습니다:

```xml
<layout>
  <direct />
</layout>
```

또는

```sql
LAYOUT(DIRECT())
```


### complex_key_direct \{#complex_key_direct\}

이 저장 방식은 복합 [키](#dictionary-key-and-fields)에 사용하는 것입니다. `direct`와 유사합니다.

### ip_trie \{#ip_trie\}

이 딕셔너리는 네트워크 프리픽스를 기준으로 IP 주소를 조회하도록 설계되었습니다. CIDR 표기법으로 IP 범위를 저장하며, 특정 IP가 어떤 프리픽스(예: 서브넷 또는 ASN 범위)에 속하는지 빠르게 알아낼 수 있어, 지리적 위치 조회나 네트워크 분류와 같은 IP 기반 검색에 적합합니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="ip_trie 딕셔너리를 사용한 IP 기반 검색" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

**예시**

ClickHouse에 IP 프리픽스와 매핑 정보를 포함하는 테이블이 있다고 가정합니다:

```sql
CREATE TABLE my_ip_addresses (
    prefix String,
    asn UInt32,
    cca2 String
)
ENGINE = MergeTree
PRIMARY KEY prefix;
```

```sql
INSERT INTO my_ip_addresses VALUES
    ('202.79.32.0/20', 17501, 'NP'),
    ('2620:0:870::/48', 3856, 'US'),
    ('2a02:6b8:1::/48', 13238, 'RU'),
    ('2001:db8::/32', 65536, 'ZZ')
;
```

이 테이블에 `ip_trie` 딕셔너리를 정의해 보겠습니다. `ip_trie` 레이아웃에는 복합 키가 필요합니다.

```xml
<structure>
    <key>
        <attribute>
            <name>prefix</name>
            <type>String</type>
        </attribute>
    </key>
    <attribute>
            <name>asn</name>
            <type>UInt32</type>
            <null_value />
    </attribute>
    <attribute>
            <name>cca2</name>
            <type>String</type>
            <null_value>??</null_value>
    </attribute>
    ...
</structure>
<layout>
    <ip_trie>
        <!-- Key attribute `prefix` can be retrieved via dictGetString. -->
        <!-- This option increases memory usage. -->
        <access_to_key_from_attributes>true</access_to_key_from_attributes>
    </ip_trie>
</layout>
```

또는

```sql
CREATE DICTIONARY my_ip_trie_dictionary (
    prefix String,
    asn UInt32,
    cca2 String DEFAULT '??'
)
PRIMARY KEY prefix
SOURCE(CLICKHOUSE(TABLE 'my_ip_addresses'))
LAYOUT(IP_TRIE)
LIFETIME(3600);
```

키에는 허용된 IP 프리픽스를 포함하는 `String` 타입 속성이 정확히 하나만 있어야 합니다. 다른 타입은 아직 지원되지 않습니다.

구문은 다음과 같습니다.

```sql
dictGetT('dict_name', 'attr_name', ip)
```

이 함수는 IPv4의 경우 `UInt32`, IPv6의 경우 `FixedString(16)` 타입을 매개변수로 받습니다. 예를 들어:

```sql
SELECT dictGet('my_ip_trie_dictionary', 'cca2', toIPv4('202.79.32.10')) AS result;

┌─result─┐
│ NP     │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', 'asn', IPv6StringToNum('2001:db8::1')) AS result;

┌─result─┐
│  65536 │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', ('asn', 'cca2'), IPv6StringToNum('2001:db8::1')) AS result;

┌─result───────┐
│ (65536,'ZZ') │
└──────────────┘
```

다른 타입은 아직 지원되지 않습니다. 이 함수는 이 IP 주소에 해당하는 접두어의 속성을 반환합니다. 접두어가 서로 겹치는 경우 가장 구체적인 접두어가 반환됩니다.

데이터 전체가 RAM에 들어가야 합니다.


## LIFETIME을 사용한 딕셔너리 데이터 새로 고침 \{#refreshing-dictionary-data-using-lifetime\}

ClickHouse는 `LIFETIME` 태그(초 단위로 정의)를 기반으로 딕셔너리를 주기적으로 업데이트합니다. `LIFETIME`은 완전히 다운로드된 딕셔너리의 업데이트 간격이자 캐시된 딕셔너리의 무효화 간격입니다.

업데이트 중에도 딕셔너리의 이전 버전을 조회할 수 있습니다. 딕셔너리 업데이트는 (최초 로드 시를 제외하고) 쿼리를 차단하지 않습니다. 업데이트 중 오류가 발생하면 서버 로그에 오류가 기록되며, 쿼리는 딕셔너리의 이전 버전을 사용하여 계속 실행됩니다. 딕셔너리 업데이트가 성공하면 이전 버전이 원자적으로 교체됩니다.

설정 예제:

<CloudDetails />

```xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

또는

```sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

`<lifetime>0</lifetime>` (`LIFETIME(0)`)으로 설정하면 딕셔너리 업데이트가 방지됩니다.

업데이트 시간 간격을 설정할 수 있으며, ClickHouse는 이 범위 내에서 균등 분포된 무작위 시간을 선택합니다. 이는 다수의 서버에서 업데이트 시 딕셔너리 소스의 부하를 분산하기 위해 필요합니다.

설정 예제:

```xml
<dictionary>
    ...
    <lifetime>
        <min>300</min>
        <max>360</max>
    </lifetime>
    ...
</dictionary>
```

또는

```sql
LIFETIME(MIN 300 MAX 360)
```

`<min>0</min>` 및 `<max>0</max>`인 경우, ClickHouse는 타임아웃에 의해 딕셔너리를 다시 로드하지 않습니다.
이 경우, 딕셔너리 구성 파일이 변경되거나 `SYSTEM RELOAD DICTIONARY` 명령이 실행되면 ClickHouse는 딕셔너리를 더 일찍 다시 로드할 수 있습니다.

딕셔너리를 업데이트할 때 ClickHouse 서버는 [소스](#dictionary-sources) 유형에 따라 다른 로직을 적용합니다:

* 텍스트 파일인 경우 수정 시각을 확인합니다. 이 시각이 이전에 기록된 시각과 다르면 딕셔너리를 업데이트합니다.
* 다른 소스를 사용하는 딕셔너리는 기본적으로 매번 업데이트됩니다.

다른 소스(ODBC, PostgreSQL, ClickHouse 등)의 경우, 매번 업데이트하는 대신 딕셔너리가 실제로 변경되었을 때만 업데이트되도록 쿼리를 설정할 수 있습니다. 이를 수행하려면 다음 단계를 따르십시오:

* 딕셔너리 테이블에는 소스 데이터가 업데이트될 때마다 함께 변경되는 필드가 반드시 있어야 합니다.
* 소스의 설정에는 변경되는 필드 값을 가져오는 쿼리를 지정해야 합니다. ClickHouse 서버는 쿼리 결과를 하나의 행으로 해석하고, 이 행이 이전 상태와 비교하여 변경된 경우 딕셔너리가 갱신됩니다. [소스](#dictionary-sources)에 대한 설정에서 `<invalidate_query>` 필드에 쿼리를 지정합니다.

설정 예제:

```xml
<dictionary>
    ...
    <odbc>
      ...
      <invalidate_query>SELECT update_time FROM dictionary_source where id = 1</invalidate_query>
    </odbc>
    ...
</dictionary>
```

또는

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

`Cache`, `ComplexKeyCache`, `SSDCache`, `SSDComplexKeyCache` 딕셔너리는 동기 및 비동기 업데이트를 모두 지원합니다.

`Flat`, `Hashed`, `HashedArray`, `ComplexKeyHashed` 딕셔너리는 이전 업데이트 이후 변경된 데이터만 요청할 수 있습니다. 딕셔너리 소스 구성에서 `update_field`를 지정하면, 이전 업데이트 시간 값(초 단위)이 데이터 요청에 추가됩니다. 소스 유형(Executable, HTTP, MySQL, PostgreSQL, ClickHouse 또는 ODBC)에 따라 외부 소스에서 데이터를 요청하기 전에 `update_field`에 서로 다른 로직이 적용됩니다.

* 소스가 HTTP인 경우, 마지막 업데이트 시간을 값으로 사용하는 쿼리 매개변수로 `update_field`가 추가됩니다.
* Source가 Executable인 경우 `update_field`는 마지막 업데이트 시간을 값으로 갖는 실행 스크립트의 인수로 추가됩니다.
* 소스가 ClickHouse, MySQL, PostgreSQL, ODBC 중 하나인 경우 `WHERE` 절에 `update_field`가 마지막 업데이트 시간보다 크거나 같은지 비교하는 추가 조건이 포함됩니다.
  * 기본적으로 이 `WHERE` 조건은 SQL 쿼리의 최상위 레벨에서 평가됩니다. 또는 `{condition}` 키워드를 사용하여 쿼리 내의 다른 `WHERE` 절에서 이 조건을 평가하도록 할 수도 있습니다. 예:
    ```sql
    ...
    SOURCE(CLICKHOUSE(...
        update_field 'added_time'
        QUERY '
            SELECT my_arr.1 AS x, my_arr.2 AS y, creation_time
            FROM (
                SELECT arrayZip(x_arr, y_arr) AS my_arr, creation_time
                FROM dictionary_source
                WHERE {condition}
            )'
    ))
    ...
    ```

`update_field` 옵션이 설정된 경우, 추가 옵션인 `update_lag`도 설정할 수 있습니다. `update_lag` 옵션의 값은 갱신된 데이터를 요청하기 전에 이전 업데이트 시간에서 이 값만큼 뺀 시각을 사용하도록 합니다.

설정 예시는 다음과 같습니다:

```xml
<dictionary>
    ...
        <clickhouse>
            ...
            <update_field>added_time</update_field>
            <update_lag>15</update_lag>
        </clickhouse>
    ...
</dictionary>
```

또는

```sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```


## 딕셔너리 소스 \{#dictionary-sources\}

<CloudDetails />

딕셔너리는 여러 가지 소스를 통해 ClickHouse와 연결할 수 있습니다.

딕셔너리를 XML 파일로 구성하는 경우, 구성은 다음과 같습니다.

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- Source configuration -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

[DDL-query](../../sql-reference/statements/create/dictionary.md)로 작성하면, 위에서 설명한 구성은 다음과 같습니다.

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Source configuration
...
```

`source` 섹션에서 소스를 설정합니다.

소스 타입 [Local file](#local-file), [Executable file](#executable-file), [HTTP(s)](#https), [ClickHouse](#clickhouse)에 대해서는
선택적으로 사용할 수 있는 추가 설정이 있습니다:

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
  <settings>
      <format_csv_allow_single_quotes>0</format_csv_allow_single_quotes>
  </settings>
</source>
```

또는

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
SETTINGS(format_csv_allow_single_quotes = 0)
```

소스 유형(`source_type`):

* [로컬 파일](#local-file)
* [실행 파일](#executable-file)
* [실행 풀](#executable-pool)
* [HTTP(S)](#https)
* DBMS
  * [ODBC](#odbc)
  * [MySQL](#mysql)
  * [ClickHouse](#clickhouse)
  * [MongoDB](#mongodb)
  * [Redis](#redis)
  * [Cassandra](#cassandra)
  * [PostgreSQL](#postgresql)
  * [YTsaurus](#ytsaurus)


### 로컬 파일 \{#local-file\}

다음은 설정 예시입니다.

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
</source>
```

또는

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
```

설정 필드:

* `path` – 파일의 절대 경로입니다.
* `format` – 파일 형식입니다. [Formats](/sql-reference/formats)에 설명된 모든 형식을 지원합니다.

소스가 `FILE`인 딕셔너리를 DDL 명령(`CREATE DICTIONARY ...`)로 생성하는 경우, ClickHouse 노드에서 DB 사용자가 임의의 파일에 접근하지 못하도록 소스 파일은 반드시 `user_files` 디렉터리에 위치해야 합니다.

**함께 보기**

* [Dictionary function](/sql-reference/table-functions/dictionary)


### Executable File \{#executable-file\}

실행 파일을 사용할 때의 동작은 [딕셔너리가 메모리에 저장되는 방식](#storing-dictionaries-in-memory)에 따라 달라집니다. 딕셔너리가 `cache` 및 `complex_key_cache`를 사용해 저장되는 경우 ClickHouse는 필요한 키를 실행 파일의 STDIN으로 전송하여 요청합니다. 그렇지 않은 경우 ClickHouse는 실행 파일을 실행하고 그 출력을 딕셔너리 데이터로 처리합니다.

다음은 설정 예시입니다:

```xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

설정 필드:

* `command` — 실행 파일의 절대 경로이거나, (명령의 디렉터리가 `PATH`에 있는 경우) 파일 이름입니다.
* `format` — 파일 형식입니다. [Formats](/sql-reference/formats)에 설명된 모든 형식을 지원합니다.
* `command_termination_timeout` — 실행 스크립트에는 기본 읽기-쓰기 루프가 있어야 합니다. 딕셔너리가 소멸된 후 파이프가 닫히며, 자식 프로세스에 SIGTERM 신호를 보내기 전에 실행 파일이 종료할 수 있도록 `command_termination_timeout`초가 주어집니다. `command_termination_timeout`은 초 단위로 지정합니다. 기본값은 10입니다. 선택적 매개변수입니다.
* `command_read_timeout` - 명령의 stdout에서 데이터를 읽기 위한 타임아웃(밀리초)입니다. 기본값은 10000입니다. 선택적 매개변수입니다.
* `command_write_timeout` - 명령의 stdin에 데이터를 쓰기 위한 타임아웃(밀리초)입니다. 기본값은 10000입니다. 선택적 매개변수입니다.
* `implicit_key` — 실행 가능한 소스 파일은 값만 반환할 수 있으며, 요청된 키와의 대응은 결과에서 행의 순서에 따라 암묵적으로 결정됩니다. 기본값은 false입니다.
* `execute_direct` - `execute_direct` = `1`이면, [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)에 지정된 user&#95;scripts 폴더 안에서 `command`를 검색합니다. 공백 구분자를 사용하여 추가 스크립트 인수를 지정할 수 있습니다. 예: `script_name arg1 arg2`. `execute_direct` = `0`이면, `command`는 `bin/sh -c`의 인수로 전달됩니다. 기본값은 `0`입니다. 선택적 매개변수입니다.
* `send_chunk_header` - 프로세스로 전송할 데이터 청크를 보내기 전에 행 개수를 전송할지 여부를 제어합니다. 선택적 매개변수입니다. 기본값은 `false`입니다.

이 딕셔너리 소스는 XML 구성으로만 설정할 수 있습니다. 실행 가능한 소스를 사용하여 DDL로 딕셔너리를 생성하는 기능은 비활성화되어 있으며, 그렇지 않으면 DB 사용자가 ClickHouse 노드에서 임의의 바이너리를 실행할 수 있게 됩니다.


### Executable Pool \{#executable-pool\}

Executable pool은 프로세스 풀에서 데이터를 로드할 수 있게 합니다. 이 소스 유형은 원본에서 모든 데이터를 한 번에 로드해야 하는 딕셔너리 레이아웃에서는 사용할 수 없습니다. Executable pool은 딕셔너리가 `cache`, `complex_key_cache`, `ssd_cache`, `complex_key_ssd_cache`, `direct`, `complex_key_direct` 레이아웃을 사용하여 [저장](#ways-to-store-dictionaries-in-memory)되는 경우에 동작합니다.

Executable pool은 지정된 명령으로 프로세스 풀을 생성하고, 해당 프로세스들이 종료될 때까지 실행 상태로 유지합니다. 프로그램은 가능한 동안 STDIN에서 데이터를 읽고, 결과를 STDOUT으로 출력해야 합니다. 또한 STDIN에서 다음 데이터 블록을 기다릴 수 있습니다. ClickHouse는 데이터 블록을 처리한 후 STDIN을 닫지 않으며, 필요할 때 다른 데이터 청크를 파이프로 전달합니다. 실행 파일 또는 스크립트는 이러한 방식의 데이터 처리에 대비되어 있어야 합니다. 즉, STDIN을 주기적으로 확인(poll)하고, 데이터를 가능한 한 일찍 STDOUT으로 flush해야 합니다.

설정 예시는 다음과 같습니다:

```xml
<source>
    <executable_pool>
        <command><command>while read key; do printf "$key\tData for key $key\n"; done</command</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10<max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

설정 필드:

* `command` — 실행 파일의 절대 경로 또는 파일 이름(`PATH`에 프로그램 디렉터리가 설정된 경우).
* `format` — 파일 포맷. 「[Formats](/sql-reference/formats)」에 설명된 모든 포맷을 지원합니다.
* `pool_size` — 풀 크기입니다. `pool_size`에 0이 지정되면 풀 크기에 대한 제한이 없습니다. 기본값은 `16`입니다.
* `command_termination_timeout` — 실행 스크립트에는 주요 읽기-쓰기 루프가 있어야 합니다. 딕셔너리가 삭제되면 파이프가 닫히고, 실행 파일은 ClickHouse가 자식 프로세스에 SIGTERM 신호를 보내기 전에 종료를 위해 `command_termination_timeout` 초가 주어집니다. 초 단위로 지정합니다. 기본값은 10입니다. 선택적 파라미터입니다.
* `max_command_execution_time` — 데이터 블록을 처리하기 위한 실행 스크립트의 최대 실행 시간입니다. 초 단위로 지정합니다. 기본값은 10입니다. 선택적 파라미터입니다.
* `command_read_timeout` - 명령의 stdout에서 데이터를 읽기 위한 타임아웃(밀리초)입니다. 기본값은 10000입니다. 선택적 파라미터입니다.
* `command_write_timeout` - 명령의 stdin으로 데이터를 쓰기 위한 타임아웃(밀리초)입니다. 기본값은 10000입니다. 선택적 파라미터입니다.
* `implicit_key` — 실행 소스 파일이 값만 반환하고, 요청된 키와의 대응은 결과에서 행의 순서에 따라 암묵적으로 결정됩니다. 기본값은 `false`입니다. 선택적 파라미터입니다.
* `execute_direct` - `execute_direct` = `1`이면, `command`는 [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)에 지정된 user&#95;scripts 폴더 내에서 검색됩니다. 추가 스크립트 인수는 공백 구분자로 지정할 수 있습니다. 예: `script_name arg1 arg2`. `execute_direct` = `0`이면, `command`는 `bin/sh -c`의 인수로 전달됩니다. 기본값은 `1`입니다. 선택적 파라미터입니다.
* `send_chunk_header` - 처리할 데이터 청크를 보내기 전에 행 수를 전송할지 여부를 제어합니다. 선택적입니다. 기본값은 `false`입니다.

이 딕셔너리 소스는 XML 설정으로만 구성할 수 있습니다. 실행 가능한 소스를 사용하는 딕셔너리를 DDL로 생성하는 기능은 비활성화되어 있으며, 그렇지 않으면 데이터베이스 USER가 ClickHouse 노드에서 임의의 바이너리를 실행할 수 있게 됩니다.


### HTTP(S) \{#https\}

HTTP(S) 서버를 사용하는 방식은 [딕셔너리가 메모리에 저장되는 방식](#storing-dictionaries-in-memory)에 따라 달라집니다. 딕셔너리가 `cache` 및 `complex_key_cache`를 사용해 저장되는 경우, ClickHouse는 `POST` 메서드를 통해 필요한 키를 요청합니다.

설정 예:

```xml
<source>
    <http>
        <url>http://[::1]/os.tsv</url>
        <format>TabSeparated</format>
        <credentials>
            <user>user</user>
            <password>password</password>
        </credentials>
        <headers>
            <header>
                <name>API-KEY</name>
                <value>key</value>
            </header>
        </headers>
    </http>
</source>
```

또는

```sql
SOURCE(HTTP(
    url 'http://[::1]/os.tsv'
    format 'TabSeparated'
    credentials(user 'user' password 'password')
    headers(header(name 'API-KEY' value 'key'))
))
```

ClickHouse가 HTTPS 리소스에 액세스할 수 있도록 하려면 서버 설정에서 [OpenSSL을 구성](../../operations/server-configuration-parameters/settings.md#openssl)해야 합니다.

설정 필드는 다음과 같습니다.

* `url` – 소스 URL입니다.
* `format` – 파일 포맷입니다. 「[Formats](/sql-reference/formats)」에 설명된 모든 포맷을 지원합니다.
* `credentials` – HTTP Basic 인증입니다. 선택적 파라미터입니다.
* `user` – 인증에 필요한 사용자 이름입니다.
* `password` – 인증에 필요한 비밀번호입니다.
* `headers` – HTTP 요청에 사용되는 모든 사용자 정의 HTTP 헤더 항목입니다. 선택적 파라미터입니다.
* `header` – 단일 HTTP 헤더 항목입니다.
* `name` – 요청에서 전송되는 헤더에 사용되는 식별자 이름입니다.
* `value` – 특정 식별자 이름에 설정되는 값입니다.

DDL 명령(`CREATE DICTIONARY ...`)으로 딕셔너리를 생성할 때, HTTP 딕셔너리에 대한 원격 호스트는 데이터베이스 사용자가 임의의 HTTP 서버에 액세스하지 못하도록 설정의 `remote_url_allow_hosts` 섹션에 정의된 내용과 대조하여 검사됩니다.


### DBMS \{#dbms\}

#### ODBC \{#odbc\}

ODBC 드라이버가 있는 모든 데이터베이스에 이 방식을 사용해 연결할 수 있습니다.

다음은 설정 예시입니다.

```xml
<source>
    <odbc>
        <db>DatabaseName</db>
        <table>ShemaName.TableName</table>
        <connection_string>DSN=some_parameters</connection_string>
        <invalidate_query>SQL_QUERY</invalidate_query>
        <query>SELECT id, value_1, value_2 FROM ShemaName.TableName</query>
    </odbc>
</source>
```

또는

```sql
SOURCE(ODBC(
    db 'DatabaseName'
    table 'SchemaName.TableName'
    connection_string 'DSN=some_parameters'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

설정 필드는 다음과 같습니다:

* `db` – 데이터베이스 이름입니다. 데이터베이스 이름이 `<connection_string>` 매개변수에 설정되어 있으면 생략합니다.
* `table` – 테이블 이름과 (존재하는 경우) 스키마 이름입니다.
* `connection_string` – 연결 문자열입니다.
* `invalidate_query` – 딕셔너리 상태를 확인하기 위한 쿼리입니다. 선택적 매개변수입니다. 자세한 내용은 [LIFETIME을 사용한 딕셔너리 데이터 갱신](#refreshing-dictionary-data-using-lifetime) 섹션을 참조하십시오.
* `background_reconnect` – 연결이 실패했을 때 백그라운드에서 레플리카에 다시 연결합니다. 선택적 매개변수입니다.
* `query` – 사용자 지정 쿼리입니다. 선택적 매개변수입니다.

:::note
`table` 필드와 `query` 필드는 함께 사용할 수 없습니다. `table` 또는 `query` 필드 중 하나는 반드시 선언해야 합니다.
:::

ClickHouse는 ODBC 드라이버로부터 따옴표 문자를 전달받아 드라이버로 전송되는 쿼리에서 모든 설정 값에 따옴표를 적용하므로, 데이터베이스에 정의된 테이블 이름의 대소문자와 동일하게 테이블 이름을 설정해야 합니다.

Oracle을 사용할 때 인코딩에 문제가 발생하는 경우, 관련 [FAQ](/knowledgebase/oracle-odbc) 항목을 참조하십시오.


##### ODBC 딕셔너리 기능의 알려진 취약점 \{#known-vulnerability-of-the-odbc-dictionary-functionality\}

:::note
ODBC 드라이버를 통해 데이터베이스에 연결할 때 연결 매개변수 `Servername` 값이 변조될 수 있습니다. 이 경우 `odbc.ini`에 설정된 `USERNAME`과 `PASSWORD` 값이 원격 서버로 전송되어 유출될 수 있습니다.
:::

**안전하지 않은 사용 예시**

PostgreSQL용 unixODBC를 구성해 보겠습니다. `/etc/odbc.ini`의 내용은 다음과 같습니다.

```text
[gregtest]
Driver = /usr/lib/psqlodbca.so
Servername = localhost
PORT = 5432
DATABASE = test_db
#OPTION = 3
USERNAME = test
PASSWORD = test
```

그런 다음 아래와 같은 쿼리를 실행하면

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC 드라이버는 `odbc.ini`에 설정된 `USERNAME`과 `PASSWORD` 값을 `some-server.com`으로 전송합니다.


##### PostgreSQL 연결 예시 \{#example-of-connecting-postgresql\}

Ubuntu OS 환경에서:

PostgreSQL용 unixODBC 및 ODBC 드라이버를 설치합니다:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini` 구성 (`ClickHouse`를 실행하는 사용자 계정으로 로그인한 경우 `~/.odbc.ini`):

```text
    [DEFAULT]
    Driver = myconnection

    [myconnection]
    Description         = PostgreSQL connection to my_db
    Driver              = PostgreSQL Unicode
    Database            = my_db
    Servername          = 127.0.0.1
    UserName            = username
    Password            = password
    Port                = 5432
    Protocol            = 9.3
    ReadOnly            = No
    RowVersioning       = No
    ShowSystemTables    = No
    ConnSettings        =
```

ClickHouse 딕셔너리 구성:

```xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- You can specify the following parameters in connection_string: -->
                <!-- DSN=myconnection;UID=username;PWD=password;HOST=127.0.0.1;PORT=5432;DATABASE=my_db -->
                <connection_string>DSN=myconnection</connection_string>
                <table>postgresql_table</table>
            </odbc>
        </source>
        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>
        <layout>
            <hashed/>
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>some_column</name>
                <type>UInt64</type>
                <null_value>0</null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

또는

```sql
CREATE DICTIONARY table_name (
    id UInt64,
    some_column UInt64 DEFAULT 0
)
PRIMARY KEY id
SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 360)
```

`odbc.ini`를 편집하여 드라이버 라이브러리의 전체 경로인 `DRIVER=/usr/local/lib/psqlodbcw.so`를 지정해야 할 수도 있습니다.


##### MS SQL Server 연결 예시 \{#example-of-connecting-ms-sql-server\}

Ubuntu OS에서.

MS SQL Server에 연결하기 위한 ODBC 드라이버 설치:

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

드라이버 설정:

```bash
    $ cat /etc/freetds/freetds.conf
    ...

    [MSSQL]
    host = 192.168.56.101
    port = 1433
    tds version = 7.0
    client charset = UTF-8

    # test TDS connection
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # if you signed in under a user that runs ClickHouse

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (optional) test ODBC connection (to use isql-tool install the [unixodbc](https://packages.debian.org/sid/unixodbc)-package)
    $ isql -v MSSQL "user" "password"
```

비고:

* 특정 SQL Server 버전에서 지원되는 TDS의 최소 버전을 확인하려면 제품 문서를 참조하거나 [MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)를 확인하십시오.

ClickHouse에서 딕셔너리 구성:

```xml
<clickhouse>
    <dictionary>
        <name>test</name>
        <source>
            <odbc>
                <table>dict</table>
                <connection_string>DSN=MSSQL;UID=test;PWD=test</connection_string>
            </odbc>
        </source>

        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>

        <layout>
            <flat />
        </layout>

        <structure>
            <id>
                <name>k</name>
            </id>
            <attribute>
                <name>s</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

또는

```sql
CREATE DICTIONARY test (
    k UInt64,
    s String DEFAULT ''
)
PRIMARY KEY k
SOURCE(ODBC(table 'dict' connection_string 'DSN=MSSQL;UID=test;PWD=test'))
LAYOUT(FLAT())
LIFETIME(MIN 300 MAX 360)
```


#### Mysql \{#mysql\}

설정 예시는 다음과 같습니다.

```xml
<source>
  <mysql>
      <port>3306</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <replica>
          <host>example01-1</host>
          <priority>1</priority>
      </replica>
      <replica>
          <host>example01-2</host>
          <priority>1</priority>
      </replica>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

또는

```sql
SOURCE(MYSQL(
    port 3306
    user 'clickhouse'
    password 'qwerty'
    replica(host 'example01-1' priority 1)
    replica(host 'example01-2' priority 1)
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

설정 필드:

* `port` – MySQL 서버의 포트입니다. 모든 레플리카에 대해 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).

* `user` – MySQL 사용자 이름입니다. 모든 레플리카에 대해 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).

* `password` – MySQL 사용자의 비밀번호입니다. 모든 레플리카에 대해 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).

* `replica` – 레플리카 설정 섹션입니다. 여러 개의 섹션을 정의할 수 있습니다.

  * `replica/host` – MySQL 호스트입니다.
  * `replica/priority` – 레플리카 우선순위입니다. 접속을 시도할 때 ClickHouse는 우선순위 순서대로 레플리카를 순회합니다. 숫자가 낮을수록 우선순위가 높습니다.

* `db` – 데이터베이스 이름입니다.

* `table` – 테이블 이름입니다.

* `where` – 선택 조건입니다. 조건 구문의 문법은 MySQL의 `WHERE` 절과 동일하며, 예를 들어 `id > 10 AND id < 20`와 같습니다. 선택적 매개변수입니다.

* `invalidate_query` – 딕셔너리 상태를 확인하기 위한 쿼리입니다. 선택적 매개변수입니다. 자세한 내용은 [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime) 섹션을 참조하십시오.

* `fail_on_connection_loss` – 연결이 끊어졌을 때 서버 동작을 제어하는 설정 매개변수입니다. `true`이면 클라이언트와 서버 간 연결이 끊어진 경우 예외가 즉시 발생합니다. `false`이면 ClickHouse 서버는 예외를 던지기 전에 쿼리 실행을 세 번까지 재시도합니다. 재시도는 응답 시간이 증가하는 결과를 초래한다는 점에 유의하십시오. 기본값: `false`.

* `query` – 사용자 정의 쿼리입니다. 선택적 매개변수입니다.

:::note
`table` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 또한 `table` 또는 `query` 필드 중 하나는 반드시 선언해야 합니다.
:::

:::note
명시적인 `secure` 매개변수는 없습니다. SSL 연결을 설정하는 경우 보안이 필수입니다.
:::

MySQL은 로컬 호스트에서 소켓을 통해 연결할 수 있습니다. 이를 위해 `host`와 `socket`을 설정하십시오.

설정 예시는 다음과 같습니다:

```xml
<source>
  <mysql>
      <host>localhost</host>
      <socket>/path/to/socket/file.sock</socket>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

또는

```sql
SOURCE(MYSQL(
    host 'localhost'
    socket '/path/to/socket/file.sock'
    user 'clickhouse'
    password 'qwerty'
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```


#### ClickHouse \{#clickhouse\}

설정 예시는 다음과 같습니다:

```xml
<source>
    <clickhouse>
        <host>example01-01-1</host>
        <port>9000</port>
        <user>default</user>
        <password></password>
        <db>default</db>
        <table>ids</table>
        <where>id=10</where>
        <secure>1</secure>
        <query>SELECT id, value_1, value_2 FROM default.ids</query>
    </clickhouse>
</source>
```

또는

```sql
SOURCE(CLICKHOUSE(
    host 'example01-01-1'
    port 9000
    user 'default'
    password ''
    db 'default'
    table 'ids'
    where 'id=10'
    secure 1
    query 'SELECT id, value_1, value_2 FROM default.ids'
));
```

Setting 필드:

* `host` – ClickHouse 호스트입니다. 로컬 호스트인 경우 네트워크 통신 없이 쿼리가 처리됩니다. 장애 허용을 향상하려면 [Distributed](../../engines/table-engines/special/distributed.md) 테이블을 생성한 후 이후 설정에서 해당 테이블을 지정하면 됩니다.
* `port` – ClickHouse 서버 포트입니다.
* `user` – ClickHouse 사용자 이름입니다.
* `password` – ClickHouse 사용자 비밀번호입니다.
* `db` – 데이터베이스 이름입니다.
* `table` – 테이블 이름입니다.
* `where` – 선택 기준입니다. 생략할 수 있습니다.
* `invalidate_query` – 딕셔너리 상태를 확인하기 위한 쿼리입니다. 선택적 매개변수입니다. 자세한 내용은 [LIFETIME을 사용한 딕셔너리 데이터 갱신](#refreshing-dictionary-data-using-lifetime) 섹션을 참조하십시오.
* `secure` - 연결에 SSL을 사용합니다.
* `query` – 사용자 정의 쿼리입니다. 선택적 매개변수입니다.

:::note
`table` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 또한 `table` 또는 `query` 필드 중 하나는 반드시 선언해야 합니다.
:::


#### MongoDB \{#mongodb\}

설정 예시:

```xml
<source>
    <mongodb>
        <host>localhost</host>
        <port>27017</port>
        <user></user>
        <password></password>
        <db>test</db>
        <collection>dictionary_source</collection>
        <options>ssl=true</options>
    </mongodb>
</source>
```

또는

```xml
<source>
    <mongodb>
        <uri>mongodb://localhost:27017/test?ssl=true</uri>
        <collection>dictionary_source</collection>
    </mongodb>
</source>
```

또는

```sql
SOURCE(MONGODB(
    host 'localhost'
    port 27017
    user ''
    password ''
    db 'test'
    collection 'dictionary_source'
    options 'ssl=true'
))
```

설정 필드:

* `host` – MongoDB 호스트.
* `port` – MongoDB 서버 포트.
* `user` – MongoDB 사용자 이름.
* `password` – MongoDB 사용자 비밀번호.
* `db` – 데이터베이스 이름.
* `collection` – 컬렉션 이름.
* `options` - MongoDB 연결 문자열 옵션(선택 매개변수).

또는

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

설정 필드:

* `uri` - 연결을 설정할 때 사용할 URI입니다.
* `collection` – 컬렉션 이름입니다.

[엔진에 대한 자세한 내용](../../engines/table-engines/integrations/mongodb.md)


#### Redis \{#redis\}

설정 예시:

```xml
<source>
    <redis>
        <host>localhost</host>
        <port>6379</port>
        <storage_type>simple</storage_type>
        <db_index>0</db_index>
    </redis>
</source>
```

또는

```sql
SOURCE(REDIS(
    host 'localhost'
    port 6379
    storage_type 'simple'
    db_index 0
))
```

설정 필드:

* `host` – Redis 호스트입니다.
* `port` – Redis 서버의 포트입니다.
* `storage_type` – 키 작업에 사용하는 Redis 내부 저장 구조입니다. `simple`은 단순 소스 및 해시된 단일 키 소스를 위한 것이고, `hash_map`은 두 개의 키를 가진 해시 소스를 위한 것입니다. 범위 소스와 복합 키를 사용하는 캐시 소스는 지원되지 않습니다. 생략할 수 있으며, 기본값은 `simple`입니다.
* `db_index` – Redis 논리 데이터베이스의 숫자 인덱스 값입니다. 생략할 수 있으며, 기본값은 0입니다.


#### Cassandra \{#cassandra\}

설정 예제:

```xml
<source>
    <cassandra>
        <host>localhost</host>
        <port>9042</port>
        <user>username</user>
        <password>qwerty123</password>
        <keyspase>database_name</keyspase>
        <column_family>table_name</column_family>
        <allow_filtering>1</allow_filtering>
        <partition_key_prefix>1</partition_key_prefix>
        <consistency>One</consistency>
        <where>"SomeColumn" = 42</where>
        <max_threads>8</max_threads>
        <query>SELECT id, value_1, value_2 FROM database_name.table_name</query>
    </cassandra>
</source>
```

Setting 필드:

* `host` – Cassandra 호스트 또는 쉼표로 구분된 호스트 목록입니다.
* `port` – Cassandra 서버의 포트입니다. 지정하지 않으면 기본 포트 9042가 사용됩니다.
* `user` – Cassandra 사용자 이름입니다.
* `password` – Cassandra 사용자의 비밀번호입니다.
* `keyspace` – keyspace(데이터베이스) 이름입니다.
* `column_family` – column family(테이블) 이름입니다.
* `allow_filtering` – 클러스터링 키 컬럼에 대해 비용이 많이 들 수 있는 조건을 허용할지 여부를 나타내는 플래그입니다. 기본값은 1입니다.
* `partition_key_prefix` – Cassandra 테이블의 기본 키에서 파티션 키 컬럼 개수입니다. compose key 딕셔너리에 필요합니다. 딕셔너리 정의에서 키 컬럼의 순서는 Cassandra와 동일해야 합니다. 기본값은 1입니다(첫 번째 키 컬럼이 파티션 키이고 나머지 키 컬럼은 클러스터링 키입니다).
* `consistency` – 일관성(consistency) 수준입니다. 가능한 값: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`. 기본값은 `One`입니다.
* `where` – 선택적 조회 조건입니다.
* `max_threads` – compose key 딕셔너리에서 여러 파티션으로부터 데이터를 로드할 때 사용할 최대 스레드 수입니다.
* `query` – 사용자 정의 쿼리입니다. 선택적 파라미터입니다.

:::note
`column_family` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 또한 `column_family` 또는 `query` 필드 중 하나는 반드시 선언해야 합니다.
:::


#### PostgreSQL \{#postgresql\}

설정 예:

```xml
<source>
  <postgresql>
      <host>postgresql-hostname</hoat>
      <port>5432</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </postgresql>
</source>
```

또는

```sql
SOURCE(POSTGRESQL(
    port 5432
    host 'postgresql-hostname'
    user 'postgres_user'
    password 'postgres_password'
    db 'db_name'
    table 'table_name'
    replica(host 'example01-1' port 5432 priority 1)
    replica(host 'example01-2' port 5432 priority 2)
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

설정 필드:

* `host` – PostgreSQL 서버의 호스트입니다. 모든 레플리카에 대해 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).
* `port` – PostgreSQL 서버의 포트입니다. 모든 레플리카에 대해 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).
* `user` – PostgreSQL 사용자 이름입니다. 모든 레플리카에 대해 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).
* `password` – PostgreSQL 사용자 비밀번호입니다. 모든 레플리카에 대해 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).
* `replica` – 레플리카 구성을 위한 섹션입니다. 여러 개의 섹션을 둘 수 있습니다.
  * `replica/host` – PostgreSQL 호스트입니다.
  * `replica/port` – PostgreSQL 포트입니다.
  * `replica/priority` – 레플리카 우선순위입니다. 연결을 시도할 때 ClickHouse는 우선순위 순서대로 레플리카에 접속을 시도합니다. 숫자가 작을수록 우선순위가 높습니다.
* `db` – 데이터베이스 이름입니다.
* `table` – 테이블 이름입니다.
* `where` – 선택 기준입니다. 조건의 구문은 PostgreSQL의 `WHERE` 절과 동일합니다. 예: `id > 10 AND id < 20`. 선택적 매개변수입니다.
* `invalidate_query` – 딕셔너리 상태를 확인하기 위한 쿼리입니다. 선택적 매개변수입니다. 자세한 내용은 [LIFETIME을 사용한 딕셔너리 데이터 새로 고침](#refreshing-dictionary-data-using-lifetime) 섹션을 참고하십시오.
* `background_reconnect` – 연결이 실패할 경우 백그라운드에서 레플리카에 다시 연결합니다. 선택적 매개변수입니다.
* `query` – 사용자 정의 쿼리입니다. 선택적 매개변수입니다.

:::note
`table` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 또한 `table` 필드나 `query` 필드 중 하나는 반드시 선언해야 합니다.
:::


### YTsaurus \{#ytsaurus\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::info
이 기능은 향후 릴리스에서 이전 버전과 호환되지 않는 방식으로 변경될 수 있는 실험적 기능입니다.
설정 [`allow_experimental_ytsaurus_dictionary_source`](/operations/settings/settings#allow_experimental_ytsaurus_dictionary_source)을(를) 활성화하여
YTsaurus 딕셔너리 소스를 사용합니다.
:::

설정 예:

```xml
<source>
    <ytsaurus>
        <http_proxy_urls>http://localhost:8000</http_proxy_urls>
        <cypress_path>//tmp/test</cypress_path>
        <oauth_token>password</oauth_token>
        <check_table_schema>1</check_table_schema>
    </ytsaurus>
</source>
```

또는

```sql
SOURCE(YTSAURUS(
    http_proxy_urls 'http://localhost:8000'
    cypress_path '//tmp/test'
    oauth_token 'password'
))
```

설정 필드:

* `http_proxy_urls` – YTsaurus HTTP 프록시의 URL입니다.
* `cypress_path` – 테이블 소스의 Cypress 경로입니다.
* `oauth_token` – OAuth 토큰입니다.


### Null \{#null\}

더미(빈) 딕셔너리를 만드는 데 사용할 수 있는 특수한 소스입니다. 이러한 딕셔너리는 테스트용이나, 데이터 노드와 쿼리 노드가 분리되어 있고 쿼리 노드에 분산 테이블이 있는 구성에서 유용하게 사용할 수 있습니다.

```sql
CREATE DICTIONARY null_dict (
    id              UInt64,
    val             UInt8,
    default_val     UInt8 DEFAULT 123,
    nullable_val    Nullable(UInt8)
)
PRIMARY KEY id
SOURCE(NULL())
LAYOUT(FLAT())
LIFETIME(0);
```


## 딕셔너리 키와 필드 \{#dictionary-key-and-fields\}

<CloudDetails />

`structure` 절은 쿼리에서 사용되는 딕셔너리 키와 필드를 정의합니다.

XML 설명:

```xml
<dictionary>
    <structure>
        <id>
            <name>Id</name>
        </id>

        <attribute>
            <!-- Attribute parameters -->
        </attribute>

        ...

    </structure>
</dictionary>
```

속성은 다음 요소로 구성됩니다:

* `<id>` — 키 컬럼
* `<attribute>` — 데이터 컬럼: 여러 개의 속성이 있을 수 있습니다.

DDL 쿼리:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

Attributes는 쿼리 본문에서 다음과 같이 정의합니다:

* `PRIMARY KEY` — 키 컬럼입니다.
* `AttrName AttrType` — 데이터 컬럼입니다. 속성은 여러 개 정의할 수 있습니다.


## 키 \{#key\}

ClickHouse는 다음과 같은 유형의 키를 지원합니다:

- 숫자 키. `UInt64`. `<id>` 태그에서 또는 `PRIMARY KEY` 키워드를 사용하여 정의합니다.
- 복합 키. 서로 다른 타입의 값 집합(Set). `<key>` 태그에서 또는 `PRIMARY KEY` 키워드를 사용하여 정의합니다.

XML 구조에는 `<id>` 또는 `<key>` 중 하나만 포함될 수 있습니다. DDL 쿼리에는 반드시 하나의 `PRIMARY KEY`만 포함되어야 합니다.

:::note
키를 속성(attribute)으로 지정하면 안 됩니다.
:::

### 숫자 키 \{#numeric-key\}

타입: `UInt64`.

구성 예시:

```xml
<id>
    <name>Id</name>
</id>
```

구성 필드:

* `name` – 키 컬럼의 이름입니다.

DDL 쿼리의 경우:

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

* `PRIMARY KEY` – 키를 저장하는 컬럼의 이름입니다.


### 복합 키(Composite Key) \{#composite-key\}

키는 어떤 타입의 필드로도 `tuple`을 구성할 수 있습니다. 이 경우 [layout](#storing-dictionaries-in-memory)은 `complex_key_hashed` 또는 `complex_key_cache`이어야 합니다.

:::tip
복합 키는 하나의 요소만으로도 구성될 수 있습니다. 이렇게 하면 예를 들어 문자열을 키로 사용할 수 있습니다.
:::

키 구조는 `<key>` 요소에서 설정합니다. 키 필드는 딕셔너리의 [속성(attributes)](#dictionary-key-and-fields)과 동일한 형식으로 지정합니다. 예:

```xml
<structure>
    <key>
        <attribute>
            <name>field1</name>
            <type>String</type>
        </attribute>
        <attribute>
            <name>field2</name>
            <type>UInt32</type>
        </attribute>
        ...
    </key>
...
```

또는

```sql
CREATE DICTIONARY (
    field1 String,
    field2 UInt32
    ...
)
PRIMARY KEY field1, field2
...
```

`dictGet*` 함수에 대한 쿼리에서는 키로서 튜플이 전달됩니다. 예를 들어 `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`와 같습니다.


## 속성 \{#attributes\}

구성 예제:

```xml
<structure>
    ...
    <attribute>
        <name>Name</name>
        <type>ClickHouseDataType</type>
        <null_value></null_value>
        <expression>rand64()</expression>
        <hierarchical>true</hierarchical>
        <injective>true</injective>
        <is_object_id>true</is_object_id>
    </attribute>
</structure>
```

또는

```sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

구성 필드:


| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | 컬럼 이름.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Yes      |
| `type`                                               | ClickHouse 데이터 타입: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md).<br/>ClickHouse는 딕셔너리의 값을 지정된 데이터 타입으로 캐스팅하려고 시도합니다. 예를 들어 MySQL의 경우, MySQL 소스 테이블에서 필드는 `TEXT`, `VARCHAR`, 또는 `BLOB`일 수 있지만, ClickHouse에서는 `String`으로 업로드될 수 있습니다.<br/>[Nullable](../../sql-reference/data-types/nullable.md)은 현재 [Flat](#flat), [Hashed](#hashed), [ComplexKeyHashed](#complex_key_hashed), [Direct](#direct), [ComplexKeyDirect](#complex_key_direct), [RangeHashed](#range_hashed), Polygon, [Cache](#cache), [ComplexKeyCache](#complex_key_cache), [SSDCache](#ssd_cache), [SSDComplexKeyCache](#complex_key_ssd_cache) 딕셔너리에서 지원됩니다. [IPTrie](#ip_trie) 딕셔너리에서는 `Nullable` 타입이 지원되지 않습니다. | Yes      |
| `null_value`                                         | 존재하지 않는 요소의 기본값입니다.<br/>예제에서는 빈 문자열입니다. [NULL](../syntax.md#null) 값은 `Nullable` 타입에만 사용할 수 있습니다(앞 줄의 타입 설명을 참조하십시오).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Yes      |
| `expression`                                         | ClickHouse가 값에 대해 실행하는 [표현식](../../sql-reference/syntax.md#expressions)입니다.<br/>표현식은 원격 SQL 데이터베이스의 컬럼 이름일 수 있습니다. 이를 사용하여 원격 컬럼에 대한 별칭을 만들 수 있습니다.<br/><br/>기본값: 표현식 없음.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true`이면, 이 속성에는 현재 키의 부모 키 값이 포함됩니다. [Hierarchical Dictionaries](#hierarchical-dictionaries)를 참조하십시오.<br/><br/>기본값: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | No       |
| `injective`                                          | `id -> attribute` 매핑이 [단사 함수](https://en.wikipedia.org/wiki/Injective_function)인지 여부를 나타내는 플래그입니다.<br/>`true`이면 ClickHouse는 딕셔너리에 대한 요청을 `GROUP BY` 절 뒤로 자동으로 이동시킬 수 있습니다. 일반적으로 이러한 요청의 수를 크게 줄여 줍니다.<br/><br/>기본값: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No       |
| `is_object_id`                                       | 쿼리가 `ObjectID`로 MongoDB 문서에 대해 실행되는지 여부를 나타내는 플래그입니다.<br/><br/>기본값: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | No       |

## 계층형 사전 \{#hierarchical-dictionaries\}

ClickHouse는 [숫자 키](#numeric-key)를 사용하는 계층형 사전을 지원합니다.

다음과 같은 계층 구조를 살펴보십시오:

```text
0 (Common parent)
│
├── 1 (Russia)
│   │
│   └── 2 (Moscow)
│       │
│       └── 3 (Center)
│
└── 4 (Great Britain)
    │
    └── 5 (London)
```

이 계층 구조는 다음 딕셔너리 테이블로 표현할 수 있습니다.

| region&#95;id | parent&#95;region | region&#95;name |
| ------------- | ----------------- | --------------- |
| 1             | 0                 | Russia          |
| 2             | 1                 | Moscow          |
| 3             | 2                 | Center          |
| 4             | 0                 | Great Britain   |
| 5             | 4                 | London          |

이 테이블에는 각 요소에 대해 가장 가까운 상위 요소의 키를 포함하는 `parent_region` 컬럼이 있습니다.

ClickHouse는 외부 딕셔너리 속성에 대해 계층 속성을 지원합니다. 이 속성을 사용하면 위에서 설명한 것과 유사한 계층형 딕셔너리를 구성할 수 있습니다.

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictGetHierarchy) FUNCTION은 요소의 상위 계층 체인을 가져오는 데 사용됩니다.

예제로 사용하는 딕셔너리의 구조는 다음과 같습니다.

```xml
<dictionary>
    <structure>
        <id>
            <name>region_id</name>
        </id>

        <attribute>
            <name>parent_region</name>
            <type>UInt64</type>
            <null_value>0</null_value>
            <hierarchical>true</hierarchical>
        </attribute>

        <attribute>
            <name>region_name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

    </structure>
</dictionary>
```


## 폴리곤 딕셔너리 \{#polygon-dictionaries\}

이 딕셔너리는 포인트 인 폴리곤(point-in-polygon) 쿼리에 최적화되어 있으며, 본질적으로 역지오코딩(reverse geocoding) 방식의 조회에 사용됩니다. 좌표(위도/경도)가 주어지면, 여러 폴리곤(예: 국가 또는 지역 경계)을 대상으로 해당 점을 포함하는 폴리곤/지역을 효율적으로 찾습니다. 위치 좌표를 그것이 속한 지역으로 매핑하는 데 매우 적합합니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="ClickHouse의 폴리곤 딕셔너리" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

폴리곤 딕셔너리 설정 예시:

<CloudDetails />

```xml
<dictionary>
    <structure>
        <key>
            <attribute>
                <name>key</name>
                <type>Array(Array(Array(Array(Float64))))</type>
            </attribute>
        </key>

        <attribute>
            <name>name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

        <attribute>
            <name>value</name>
            <type>UInt64</type>
            <null_value>0</null_value>
        </attribute>
    </structure>

    <layout>
        <polygon>
            <store_polygon_key_column>1</store_polygon_key_column>
        </polygon>
    </layout>

    ...
</dictionary>
```

이에 해당하는 [DDL 쿼리](/sql-reference/statements/create/dictionary):

```sql
CREATE DICTIONARY polygon_dict_name (
    key Array(Array(Array(Array(Float64)))),
    name String,
    value UInt64
)
PRIMARY KEY key
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
...
```

폴리곤 딕셔너리를 구성할 때 키는 다음 두 가지 유형 중 하나여야 합니다:

* 단순 폴리곤. 점들의 배열입니다.
* MultiPolygon. 폴리곤들의 배열입니다. 각 폴리곤은 2차원 점 배열입니다. 이 배열의 첫 번째 요소는 폴리곤의 외곽 경계이고, 이후 요소들은 그 안에서 제외해야 할 영역을 지정합니다.

점은 좌표의 배열 또는 튜플로 지정할 수 있습니다. 현재 구현에서는 2차원 점만 지원합니다.

사용자는 ClickHouse가 지원하는 모든 형식으로 자체 데이터를 업로드할 수 있습니다.

다음과 같이 3가지 유형의 [인메모리 스토리지](#storing-dictionaries-in-memory)를 사용할 수 있습니다:

* `POLYGON_SIMPLE`. 이는 각 쿼리마다 모든 폴리곤을 선형으로 순차 탐색하고, 추가 인덱스를 사용하지 않고 각 폴리곤에 대해 포함 여부를 검사하는 단순(naive) 구현입니다.

* `POLYGON_INDEX_EACH`. 각 폴리곤에 대해 개별 인덱스를 생성하여, 대부분의 경우 포함 여부를 빠르게 확인할 수 있습니다(지리적 영역에 최적화됨).
  또한, 대상 영역 위에 그리드를 생성하여 검토해야 하는 폴리곤의 수를 크게 줄입니다.
  그리드는 셀을 16개의 동일한 부분으로 재귀적으로 분할하여 생성되며, 두 개의 파라미터로 설정됩니다.
  재귀 깊이가 `MAX_DEPTH`에 도달하거나, 셀이 교차하는 폴리곤 수가 `MIN_INTERSECTIONS` 이하가 되면 분할이 중단됩니다.
  쿼리에 응답할 때는 해당하는 셀을 찾은 다음, 그 셀에 저장된 폴리곤의 인덱스에 차례로 접근합니다.

* `POLYGON_INDEX_CELL`. 이 방식 역시 위에서 설명한 그리드를 생성합니다. 동일한 옵션을 사용할 수 있습니다. 각 그리드 셀마다, 그 셀에 속하는 폴리곤 조각 전체에 대한 인덱스를 생성하여 쿼리에 빠르게 응답할 수 있습니다.

* `POLYGON`. `POLYGON_INDEX_CELL`의 동의어입니다.

딕셔너리에 대한 쿼리는 딕셔너리 작업을 위한 표준 [functions](../../sql-reference/functions/ext-dict-functions.md)를 사용해 수행합니다.
중요한 차이점은, 여기서 키가 포함될 폴리곤을 찾아야 하는 점들이 된다는 점입니다.

**예시**

위에서 정의한 딕셔너리로 작업하는 예시는 다음과 같습니다:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

`points` 테이블의 각 점에 대해 마지막 명령을 실행하면, 해당 점을 포함하는 최소 면적의 폴리곤이 찾아지고 요청한 속성이 출력됩니다.

**예시**

딕셔너리 설정에서 `store_polygon_key_column = 1`을 지정하거나 해당 DDL 쿼리에서 설정하면, SELECT 쿼리를 통해 폴리곤 딕셔너리에서 컬럼을 읽을 수 있습니다.

쿼리:


```sql
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = TinyLog;

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], 'Value');

CREATE DICTIONARY polygons_test_dictionary
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(TABLE 'polygons_test_table'))
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
LIFETIME(0);

SELECT * FROM polygons_test_dictionary;
```

결과:

```text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```


## 정규 표현식 트리 딕셔너리 \{#regexp-tree-dictionary\}

이 딕셔너리는 계층적인 정규 표현식 패턴을 기반으로 키를 값에 매핑할 수 있습니다. 정확한 키 매칭보다는 정규 표현식 패턴 매칭(예: 정규식을 사용해 user agent 문자열과 같은 문자열을 분류)에 최적화되어 있습니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="ClickHouse 정규 표현식 트리 딕셔너리 소개" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### ClickHouse 오픈 소스 버전에서 정규식 트리 딕셔너리 사용 \{#use-regular-expression-tree-dictionary-in-clickhouse-open-source\}

정규식 트리 딕셔너리는 정규식 트리를 포함하는 YAML 파일의 경로를 지정하는 `YAMLRegExpTree` 소스를 사용하여 ClickHouse 오픈 소스 버전에서 정의됩니다.

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
...
```

딕셔너리 소스 `YAMLRegExpTree`는 정규식 트리의 구조를 나타냅니다. 예를 들면 다음과 같습니다.

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tclwebkit'
      version: '12'
    - regexp: '30/tclwebkit'
      version: '11'
    - regexp: '29/tclwebkit'
      version: '10'
```

이 구성은 정규식 트리 노드 목록으로 이루어져 있습니다. 각 노드는 다음과 같은 구조를 가집니다.

* **regexp**: 노드의 정규식입니다.
* **attributes**: 사용자 정의 딕셔너리 속성 목록입니다. 이 예제에서는 `name`과 `version` 두 개의 속성이 있습니다. 첫 번째 노드는 두 속성을 모두 정의합니다. 두 번째 노드는 속성 `name`만 정의합니다. 속성 `version`은 두 번째 노드의 자식 노드에서 제공합니다.
  * 속성 값에는 일치한 정규식의 캡처 그룹을 참조하는 **역참조(back reference)**가 포함될 수 있습니다. 예제에서 첫 번째 노드의 속성 `version` 값은 정규식의 캡처 그룹 `(\d+[\.\d]*)`에 대한 역참조 `\1`로 구성됩니다. 역참조 번호는 1에서 9까지이며 `$1` 또는 `\1` (숫자 1의 경우)와 같이 작성합니다. 쿼리 실행 중에는 역참조가 일치한 캡처 그룹으로 치환됩니다.
* **child nodes**: 정규식 트리 노드의 자식 목록입니다. 각 자식은 고유한 속성과 (필요하다면) 추가 자식 노드를 가질 수 있습니다. 문자열 매칭은 깊이 우선 방식으로 수행됩니다. 문자열이 어떤 정규식 노드와 일치하면, 딕셔너리는 해당 문자열이 그 노드의 자식 노드와도 일치하는지 확인합니다. 그런 경우 가장 깊이 있는 일치 노드의 속성이 할당됩니다. 자식 노드의 속성은 부모 노드와 이름이 같은 속성을 덮어씁니다. YAML 파일에서 자식 노드의 이름은 위 예시의 `versions`처럼 임의로 지정할 수 있습니다.

정규식 트리 딕셔너리는 `dictGet`, `dictGetOrDefault`, `dictGetAll` 함수로만 접근할 수 있습니다.

예시:

```sql
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

결과:

```text
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

이 경우 먼저 최상위 계층의 두 번째 노드에서 정규식 `\d+/tclwebkit(?:\d+[\.\d]*)`과 일치하는 항목을 찾습니다. 그런 다음 딕셔너리가 자식 노드들을 계속 탐색하여 해당 문자열이 `3[12]/tclwebkit`와도 일치한다는 것을 확인합니다. 그 결과, 속성 `name`의 값은 (첫 번째 계층에 정의된) `Android`이고, 속성 `version`의 값은 (자식 노드에 정의된) `12`가 됩니다.

강력한 YAML 구성 파일을 사용하면 정규 표현식 트리 딕셔너리(regexp tree dictionary)를 user agent 문자열 파서로 활용할 수 있습니다. [uap-core](https://github.com/ua-parser/uap-core)를 지원하며, 기능 테스트용 스크립트 [02504&#95;regexp&#95;dictionary&#95;ua&#95;parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)에서 이를 사용하는 방법을 보여줍니다.


#### 속성 값 수집 \{#collecting-attribute-values\}

여러 개의 정규식이 일치한 경우, 리프 노드의 값만 반환하는 대신 일치한 모든 정규식에서 나온 값을 반환해야 할 때가 있습니다. 이러한 상황에서는 특수한 [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictGetAll) 함수를 사용할 수 있습니다. 어떤 노드에 타입 `T`의 속성 값이 있으면, `dictGetAll`은 0개 이상의 값을 포함하는 `Array(T)`를 반환합니다.

기본적으로 키당 반환되는 매칭 개수에는 제한이 없습니다. 제한값은 `dictGetAll`의 선택적 네 번째 인수로 전달할 수 있습니다. 배열은 *위상 순서(topological order)*로 채워지며, 이는 자식 노드가 부모 노드보다 먼저 오고, 형제 노드들은 소스에서의 순서를 따른다는 의미입니다.

예시:

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String,
    topological_index Int64,
    captured Nullable(String),
    parent String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0)
```

```yaml
# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'clickhouse\.com'
  tag: 'ClickHouse'
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: 'ClickHouse Documentation'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: 'Documentation'
  topological_index: 2

- regexp: 'github.com'
  tag: 'GitHub'
  topological_index: 3
  captured: 'NULL'
```

```sql
CREATE TABLE urls (url String) ENGINE=MergeTree ORDER BY url;
INSERT INTO urls VALUES ('clickhouse.com'), ('clickhouse.com/docs/en'), ('github.com/clickhouse/tree/master/docs');
SELECT url, dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2) FROM urls;
```

결과:

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```


#### 매칭 모드 \{#matching-modes\}

패턴 매칭 동작은 다음 딕셔너리 설정으로 조정할 수 있습니다:

- `regexp_dict_flag_case_insensitive`: 대소문자를 구분하지 않는 매칭을 사용합니다(기본값은 `false`입니다). 개별 표현식에서는 `(?i)` 및 `(?-i)`를 사용하여 이를 재정의할 수 있습니다.
- `regexp_dict_flag_dotall`: `.` 문자가 줄바꿈 문자와도 매칭되도록 허용합니다(기본값은 `false`입니다).

### ClickHouse Cloud에서 정규식 트리 딕셔너리 사용하기 \{#use-regular-expression-tree-dictionary-in-clickhouse-cloud\}

위에서 사용한 `YAMLRegExpTree` 소스는 ClickHouse 오픈 소스에서는 동작하지만 ClickHouse Cloud에서는 동작하지 않습니다. ClickHouse에서 regexp 트리 딕셔너리를 사용하려면, 먼저 ClickHouse 오픈 소스에서 로컬 YAML 파일에서 regexp 트리 딕셔너리를 생성한 후, `dictionary` 테이블 함수와 [INTO OUTFILE](../statements/select/into-outfile.md) 절을 사용하여 이 딕셔너리를 CSV 파일로 내보냅니다.

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSV 파일의 내용은 다음과 같습니다:

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

덤프된 파일의 스키마는 다음과 같습니다.

* `id UInt64`: RegexpTree 노드의 id입니다.
* `parent_id UInt64`: 노드의 부모 id입니다.
* `regexp String`: 정규 표현식 문자열입니다.
* `keys Array(String)`: 사용자 정의 속성 이름입니다.
* `values Array(String)`: 사용자 정의 속성 값입니다.

ClickHouse Cloud에서 딕셔너리를 생성하려면 먼저 다음 구조를 가진 `regexp_dictionary_source_table` 테이블을 생성합니다.

```sql
CREATE TABLE regexp_dictionary_source_table
(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys   Array(String),
    values Array(String)
) ENGINE=Memory;
```

그런 다음 로컬 CSV를 다음과 같이 업데이트합니다.

```bash
clickhouse client \
    --host MY_HOST \
    --secure \
    --password MY_PASSWORD \
    --query "
    INSERT INTO regexp_dictionary_source_table
    SELECT * FROM input ('id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
    FORMAT CSV" < regexp_dict.csv
```

자세한 내용은 [Insert Local Files](/integrations/data-ingestion/insert-local-files)를 참조하십시오. 소스 테이블을 초기화한 후에는 테이블 소스를 기반으로 RegexpTree를 생성할 수 있습니다.

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_dictionary_source_table'))
LIFETIME(0)
LAYOUT(regexp_tree);
```


## Embedded Dictionaries \{#embedded-dictionaries\}

<SelfManaged />

ClickHouse에는 지오베이스(geobase)를 다루기 위한 내장 기능이 있습니다.

이를 통해 다음을 수행할 수 있습니다:

- 지역 ID를 사용하여 원하는 언어로 지역 이름을 가져옵니다.
- 지역 ID를 사용하여 도시, 구역, 연방 지구, 국가 또는 대륙의 ID를 가져옵니다.
- 한 지역이 다른 지역에 속하는지 확인합니다.
- 상위 지역의 체인을 가져옵니다.

모든 함수는 지역 소속 관계를 여러 관점에서 동시에 사용할 수 있는 「translocality」를 지원합니다. 자세한 내용은 「웹 분석 딕셔너리를 다루기 위한 함수」 섹션을 참고하십시오.

내부 딕셔너리는 기본 패키지에서는 비활성화되어 있습니다.
이를 활성화하려면 서버 설정 파일에서 `path_to_regions_hierarchy_file` 및 `path_to_regions_names_files` 매개변수의 주석을 해제해야 합니다.

지오베이스는 텍스트 파일에서 로드됩니다.

`regions_hierarchy*.txt` 파일을 `path_to_regions_hierarchy_file` 디렉터리에 배치하십시오. 이 설정 매개변수에는 `regions_hierarchy.txt` 파일(기본 지역 계층 구조)의 경로가 포함되어야 하며, 다른 파일(`regions_hierarchy_ua.txt`)은 동일한 디렉터리에 위치해야 합니다.

`regions_names_*.txt` 파일을 `path_to_regions_names_files` 디렉터리에 배치하십시오.

이 파일들을 직접 생성할 수도 있습니다. 파일 형식은 다음과 같습니다:

`regions_hierarchy*.txt`: TabSeparated (헤더 없음), 컬럼:

- 지역 ID (`UInt32`)
- 상위 지역 ID (`UInt32`)
- 지역 타입 (`UInt8`): 1 - 대륙, 3 - 국가, 4 - 연방 지구, 5 - 지역, 6 - 도시; 그 외 타입에는 값이 없습니다
- 인구(`UInt32`) — 선택 컬럼입니다.

`regions_names_*.txt`: TabSeparated (헤더 없음), 컬럼:

- 지역 ID (`UInt32`)
- 지역 이름 (`String`) — 탭이나 줄 바꿈을 포함할 수 없습니다(이스케이프된 경우에도 포함할 수 없음).

RAM에 저장하기 위해 평면 배열이 사용됩니다. 이 때문에 ID는 100만을 넘지 않아야 합니다.

딕셔너리는 서버를 재시작하지 않고도 업데이트할 수 있습니다. 단, 사용 가능한 딕셔너리의 집합 자체는 업데이트되지 않습니다.
업데이트를 위해 파일 수정 시간을 확인합니다. 파일이 변경된 경우 딕셔너리가 업데이트됩니다.
변경 사항을 확인하는 주기는 `builtin_dictionaries_reload_interval` 매개변수로 설정합니다.
처음 로드할 때를 제외한 딕셔너리 업데이트는 쿼리를 차단하지 않습니다. 업데이트 동안 쿼리는 이전 버전의 딕셔너리를 사용합니다. 업데이트 중 오류가 발생하면 해당 오류는 서버 로그에 기록되며, 쿼리는 이전 버전의 딕셔너리를 계속 사용합니다.

지오베이스 딕셔너리를 주기적으로 업데이트할 것을 권장합니다. 업데이트하는 동안 새 파일을 생성하여 별도의 위치에 기록하십시오. 모든 준비가 완료되면, 서버에서 사용 중인 파일 이름으로 변경하십시오.

OS 식별자 및 검색 엔진을 다루기 위한 함수도 있지만, 이러한 함수는 사용하지 않을 것을 권장합니다.