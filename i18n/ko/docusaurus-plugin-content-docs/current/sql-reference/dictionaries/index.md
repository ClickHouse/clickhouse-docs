---
'description': 'ClickHouse에서 외부 딕셔너리 기능 개요'
'sidebar_label': '딕셔너리 정의'
'sidebar_position': 35
'slug': '/sql-reference/dictionaries'
'title': '딕셔너리'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# 딕셔너리

딕셔너리는 다양한 유형의 참조 목록에 편리한 매핑(`key -> attributes`)입니다.

ClickHouse는 쿼리에서 사용할 수 있는 딕셔너리 작업을 위한 특별한 함수를 지원합니다. 딕셔너리와 함수를 사용하는 것이 참조 테이블과의 `JOIN`보다 더 쉽고 효율적입니다.

ClickHouse는 다음을 지원합니다:

- [함수 집합](../../sql-reference/functions/ext-dict-functions.md)이 있는 딕셔너리.
- 특정 [함수 집합](../../sql-reference/functions/embedded-dict-functions.md)을 가진 [임베디드 딕셔너리](#embedded-dictionaries).

:::tip 튜토리얼
ClickHouse에서 딕셔너리를 사용하기 시작하려면 이 주제를 다룬 튜토리얼이 있습니다. [여기서](tutorial.md) 확인해 보세요.
:::

여러 데이터 소스에서 자신만의 딕셔너리를 추가할 수 있습니다. 딕셔너리의 소스는 ClickHouse 테이블, 로컬 텍스트 또는 실행 파일, HTTP(s) 리소스 또는 다른 DBMS가 될 수 있습니다. 자세한 내용은 "[딕셔너리 소스](#dictionary-sources)"를 참조하십시오.

ClickHouse는:

- 딕셔너리를 RAM에 전부 또는 부분적으로 저장합니다.
- 주기적으로 딕셔너리를 업데이트하고 누락된 값을 동적으로 로드합니다. 즉, 딕셔너리를 동적으로 로드할 수 있습니다.
- xml 파일이나 [DDL 쿼리](../../sql-reference/statements/create/dictionary.md)를 사용하여 딕셔너리를 생성할 수 있습니다.

딕셔너리의 구성은 하나 이상의 xml 파일에 위치할 수 있습니다. 구성 경로는 [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config) 매개변수에 지정됩니다.

딕셔너리는 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 설정에 따라 서버 시작 시 또는 처음 사용 시 로드될 수 있습니다.

[dictionaries](/operations/system-tables/dictionaries) 시스템 테이블에는 서버에 구성된 딕셔너리에 대한 정보가 포함되어 있습니다. 각 딕셔너리에 대해 다음을 확인할 수 있습니다:

- 딕셔너리 상태.
- 구성 매개변수.
- 딕셔너리에 할당된 RAM의 양 또는 딕셔너리가 성공적으로 로드된 이래의 쿼리 수와 같은 메트릭.

<CloudDetails />
## DDL 쿼리로 딕셔너리 생성 {#creating-a-dictionary-with-a-ddl-query}

딕셔너리는 [DDL 쿼리](../../sql-reference/statements/create/dictionary.md)를 사용하여 생성할 수 있습니다. 이는 권장되는 방법입니다. DDL로 생성된 딕셔너리는:
- 서버 구성 파일에 추가 레코드가 추가되지 않습니다.
- 딕셔너리는 테이블이나 뷰와 같은 일급 개체로 작업할 수 있습니다.
- 데이터는 딕셔너리 테이블 함수가 아닌 익숙한 SELECT를 사용하여 직접 읽을 수 있습니다. 딕셔너리에 직접 접근할 때 SELECT 문을 통해 캐시된 딕셔너리는 캐시된 데이터만 반환하고, 캐시되지 않은 딕셔너리는 저장된 모든 데이터를 반환합니다.
- 딕셔너리를 쉽게 이름을 변경할 수 있습니다.
## 구성 파일로 딕셔너리 생성 {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
구성 파일로 딕셔너리를 생성하는 것은 ClickHouse Cloud에는 적용되지 않습니다. 위에서 언급한 대로 DDL을 사용하고, `default` 사용자로서 딕셔너리를 생성해 주세요.
:::

딕셔너리 구성 파일에는 다음 형식이 있습니다:

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
`SELECT` 쿼리에서 딕셔너리를 설명하여 작은 딕셔너리에 대한 값을 변환할 수 있습니다(자세한 내용은 [transform](../../sql-reference/functions/other-functions.md) 함수). 이 기능은 딕셔너리와 관련이 없습니다.
:::
## 딕셔너리 구성 {#configuring-a-dictionary}

<CloudDetails />

딕셔너리가 xml 파일을 사용하여 구성된 경우, 딕셔너리 구성은 다음 구조를 가집니다:

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

해당 [DDL 쿼리](../../sql-reference/statements/create/dictionary.md)의 구조는 다음과 같습니다:

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
## 메모리에 딕셔너리 저장 {#storing-dictionaries-in-memory}

딕셔너리를 메모리에 저장하는 다양한 방법이 있습니다.

우리는 [flat](#flat), [hashed](#hashed) 및 [complex_key_hashed](#complex_key_hashed)를 권장합니다. 이들은 최적의 처리 속도를 제공합니다.

성능이 좋지 않거나 최적의 매개변수 선택에 어려움이 있는 가능성 때문에 캐싱은 권장되지 않습니다. [캐시](#cache) 섹션에서 자세히 읽어 보세요.

딕셔너리 성능을 향상시키는 방법은 여러 가지가 있습니다:

- `GROUP BY` 뒤에 딕셔너리 작업 함수를 호출합니다.
- 추출할 속성을 injective로 표시합니다. 속성은 서로 다른 키가 서로 다른 속성 값에 해당할 때 injective라고 합니다. 따라서 `GROUP BY`에서 키로 속성 값을 조회하는 함수를 사용할 때 이 함수는 자동으로 `GROUP BY`에서 제외됩니다.

ClickHouse는 딕셔너리 관련 오류에 대한 예외를 생성합니다. 오류의 예는 다음과 같습니다:

- 접근 중인 딕셔너리를 로드할 수 없습니다.
- `cached` 딕셔너리 쿼리 오류.

[system.dictionaries](../../operations/system-tables/dictionaries.md) 테이블에서 딕셔너리 목록과 그 상태를 확인할 수 있습니다.

<CloudDetails />

구성은 다음과 같이 보입니다:

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

해당 [DDL 쿼리](../../sql-reference/statements/create/dictionary.md):

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- layout settings
...
```

`complex-key*`라는 단어가 없는 딕셔너리는 [UInt64](../../sql-reference/data-types/int-uint.md) 유형의 키를 가지며, `complex-key*` 딕셔너리는 복합 키(임의 유형의 복합체)를 가집니다.

XML 딕셔너리에서 [UInt64](../../sql-reference/data-types/int-uint.md) 키는 `<id>` 태그로 정의됩니다.

구성 예시 (컬럼 key_column은 UInt64 유형임):
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

복합 `complex` 키 XML 딕셔너리는 `<key>` 태그로 정의됩니다.

복합 키 구성 예시 (키는 [String](../../sql-reference/data-types/string.md) 유형의 한 요소를 가집니다):
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
## 메모리에 딕셔너리 저장 방법 {#ways-to-store-dictionaries-in-memory}

메모리에 딕셔너리 데이터를 저장하는 다양한 방법은 CPU 및 RAM 사용과 관련된 트레이드오프가 있습니다. 딕셔너리와 관련된 [블로그 글](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)의 [레이아웃 선택](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) 단원에 게시된 결정 트리는 어떤 레이아웃을 사용할지 결정할 때 좋은 출발점입니다.

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
### flat {#flat}

딕셔너리는 평면 배열 형태로 메모리에 완전히 저장됩니다. 딕셔너리가 사용하는 메모리는 얼마입니까? 사용된 공간의 가장 큰 키 크기에 비례합니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 유형이며, 값은 `max_array_size`로 제한됩니다(기본값 - 500,000). 딕셔너리를 생성할 때 더 큰 키가 발견되면 ClickHouse는 예외를 발생시키며 딕셔너리를 생성하지 않습니다. 딕셔너리 평면 배열의 초기 크기는 `initial_array_size` 설정으로 제어됩니다(기본값 - 1024).

모든 유형의 소스가 지원됩니다. 업데이트 시 데이터(파일 또는 테이블에서)는 전부 읽힙니다.

이 방법은 사용 가능한 모든 방법 중에서 딕셔너리를 저장할 때 가장 좋은 성능을 제공합니다.

구성 예시:

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
### hashed {#hashed}

딕셔너리는 해시 테이블 형태로 메모리에 완전히 저장됩니다. 딕셔너리에는 어떤 수의 요소가 있거나 어떤 식별자를 가질 수 있습니다. 실제로 키의 수는 수천만 개에 이를 수 있습니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 유형입니다.

모든 유형의 소스가 지원됩니다. 업데이트 시 데이터(파일 또는 테이블)는 전부 읽힙니다.

구성 예시:

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
### sparse_hashed {#sparse_hashed}

`hashed`와 유사하지만 CPU 사용을 더 높이기 위해 더 적은 메모리를 사용합니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 유형입니다.

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

이 유형의 딕셔너리에 대해서는 `shards`를 사용할 수 있으며, 이 경우 `sparse_hashed`보다 `hashed`보다 더욱 중요합니다. `sparse_hashed`는 더 느리기 때문입니다.
### complex_key_hashed {#complex_key_hashed}

이 유형의 저장소는 복합 [키](#dictionary-key-and-fields)와 함께 사용하기 위한 것입니다. `hashed`와 유사합니다.

구성 예시:

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
### complex_key_sparse_hashed {#complex_key_sparse_hashed}

이 유형의 저장소는 복합 [키](#dictionary-key-and-fields)와 함께 사용하기 위한 것입니다. [sparse_hashed](#sparse_hashed)와 유사합니다.

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
### hashed_array {#hashed_array}

딕셔너리는 메모리에 완전히 저장됩니다. 각 속성은 배열에 저장됩니다. 키 속성은 해시 테이블 형태로 저장되며, 값은 속성 배열의 인덱스입니다. 딕셔너리는 어떤 수의 요소가 있거나 어떤 식별자를 가질 수 있습니다. 실제로 키의 수는 수천만 개에 이를 수 있습니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 유형입니다.

모든 유형의 소스가 지원됩니다. 업데이트 시 데이터(파일 또는 테이블)는 전부 읽힙니다.

구성 예시:

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
### complex_key_hashed_array {#complex_key_hashed_array}

이 유형의 저장소는 복합 [키](#dictionary-key-and-fields)와 함께 사용하기 위한 것입니다. [hashed_array](#hashed_array)와 유사합니다.

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
### range_hashed {#range_hashed}

딕셔너리는 해시 테이블 형태로 메모리에 저장되며, 정렬된 범위 배열과 해당 값들이 포함됩니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 유형입니다.
이 저장 방법은 해시와 동일하게 작동하며, 날짜/시간(임의 숫자형 데이터) 범위를 키 외에 추가로 사용할 수 있습니다.

예시: 테이블에는 각 광고주에 대한 할인 정보가 다음 형식으로 포함되어 있습니다:

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

날짜 범위의 샘플을 사용하기 위해서는 [structure](#dictionary-key-and-fields) 내에서 `range_min` 및 `range_max` 요소를 정의해야 합니다. 이 요소들은 `name` 및 `type` 요소를 포함해야 합니다(만약 `type`이 지정되지 않으면 기본 유형이 사용됩니다 - Date). `type`은 임의 숫자형 데이터(Date / DateTime / UInt64 / Int32 / 기타)일 수 있습니다.

:::note
`range_min` 및 `range_max`의 값은 `Int64` 유형에 맞아야 합니다.
:::

예시:

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

이 딕셔너리와 작업하기 위해서는 `dictGet` 함수에 추가 인수로 범위를 전달해야 합니다:

```sql
dictGet('dict_name', 'attr_name', id, date)
```
쿼리 예시:

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

이 함수는 지정된 `id`s 및 전달된 날짜를 포함하는 날짜 범위의 값을 반환합니다.

알고리즘의 세부 사항:

- `id`를 찾을 수 없거나 `id`에 대한 범위를 찾을 수 없는 경우, 속성 유형의 기본값이 반환됩니다.
- 겹치는 범위가 있고 `range_lookup_strategy=min`일 경우, 최소 `range_min`을 가지는 범위가 반환됩니다. 여러 개의 범위가 발견되면, 최소 `range_max`를 가지는 범위가 반환되며, 다시 여러 개의 범위가 발견될 경우(여러 범위가 동일한 `range_min`과 `range_max`를 가질 경우 임의의 범위가 반환됩니다.
- 겹치는 범위가 있고 `range_lookup_strategy=max`일 경우, 최대 `range_min`을 가지는 범위가 반환되며, 여러 개의 범위가 발견되면, 최대 `range_max`를 가지는 범위가 반환되고, 다시 여러 개의 범위가 발견될 경우(여러 범위가 동일한 `range_min`과 `range_max`를 가질 경우 임의의 범위가 반환됩니다.
- `range_max`가 `NULL`인 경우 이 범위는 열린 범위입니다. `NULL`은 최대 가능한 값으로 간주됩니다. `range_min`의 경우 `1970-01-01` 또는 `0`(-MAX_INT)를 열린값으로 사용할 수 있습니다.

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

겹치는 범위와 열린 범위가 있는 구성 예시:

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
### complex_key_range_hashed {#complex_key_range_hashed}

딕셔너리는 해시 테이블 형태로 메모리에 저장되며, 정렬된 범위 배열과 해당 값들이 포함됩니다(즉 [range_hashed](#range_hashed)). 이 유형의 저장소는 복합 [키](#dictionary-key-and-fields)와 함께 사용하기 위한 것입니다.

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
### cache {#cache}

딕셔너리는 고정된 셀 수를 가지는 캐시에 저장됩니다. 이 셀에는 자주 사용되는 요소가 포함됩니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 유형입니다.

딕셔너리를 검색할 때 캐시가 먼저 검색됩니다. 데이터 블록마다 캐시에서 찾을 수 없거나 오래된 모든 키가 `SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`를 사용하여 소스에서 요청됩니다. 그런 다음 수신된 데이터가 캐시에 기록됩니다.

딕셔너리에서 키를 찾을 수 없을 경우 캐시 업데이트 작업이 생성되어 업데이트 대기열에 추가됩니다. 업데이트 대기열 속성은 `max_update_queue_size`, `update_queue_push_timeout_milliseconds`, `query_wait_timeout_milliseconds`, `max_threads_for_updates` 설정으로 제어할 수 있습니다.

캐시 딕셔너리에 대해서는 캐시의 데이터 만료 [기간](#refreshing-dictionary-data-using-lifetime)을 설정할 수 있습니다. 셀이 로드된 이후 `lifetime`보다 더 많은 시간이 지나면 셀의 값은 사용되지 않으며 키는 만료됩니다. 다음 번 사용해야 할 때 키가 다시 요청됩니다. 이 동작은 설정 `allow_read_expired_keys`로 구성할 수 있습니다.

이것은 모든 딕셔너리 저장 방법 중에서 가장 비효율적입니다. 캐시의 속도는 올바른 설정과 사용 시나리오에 따라 크게 달라집니다. 캐시 유형의 딕셔너리는 적중률이 충분히 높은 경우에만 잘 작동합니다(권장 99% 이상). [system.dictionaries](../../operations/system-tables/dictionaries.md) 테이블에서 평균 적중률을 확인할 수 있습니다.

설정 `allow_read_expired_keys`가 1로 설정되면 기본값은 0입니다. 그런 경우 딕셔너리는 비동기 업데이트를 지원합니다. 클라이언트가 키를 요청하고 모든 키가 캐시에 있지만 일부 키가 만료된 경우, 딕셔너리는 만료된 키를 클라이언트에게 반환하고 소스에서 비동기적으로 요청합니다.

캐시 성능을 향상시키려면 `LIMIT`와 함께 서브쿼리를 사용하고 외부에서 딕셔너리 기능을 호출하십시오.

모든 유형의 소스가 지원됩니다.

설정 예시:

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

충분히 큰 캐시 크기를 설정하십시오. 셀 수를 선택하는 실험을 해야 합니다:

1. 어떤 값 설정합니다.
2. 캐시가 완전히 채워질 때까지 쿼리를 실행합니다.
3. `system.dictionaries` 테이블을 사용하여 메모리 소비를 평가합니다.
4. 필요한 메모리 소비가 도달할 때까지 셀 수를 늘리거나 줄입니다.

:::note
ClickHouse를 소스로 사용하지 마세요. 무작위 읽기로 쿼리를 처리하는 속도가 느립니다.
:::
### complex_key_cache {#complex_key_cache}

이 유형의 저장소는 복합 [키](#dictionary-key-and-fields)와 함께 사용하기 위한 것입니다. `cache`와 유사합니다.
### ssd_cache {#ssd_cache}

`cache`와 유사하지만 SSD에 데이터를 저장하고 RAM에 인덱스를 저장합니다. 업데이트 대기열과 관련된 모든 캐시 딕셔너리 설정도 SSD 캐시 딕셔너리에 적용할 수 있습니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 유형입니다.

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
### complex_key_ssd_cache {#complex_key_ssd_cache}

이 유형의 저장소는 복합 [키](#dictionary-key-and-fields)와 함께 사용하기 위한 것입니다. `ssd_cache`와 유사합니다.
### direct {#direct}

딕셔너리는 메모리에 저장되지 않고 요청 처리 중 소스로 직접 연결됩니다.

딕셔너리 키는 [UInt64](../../sql-reference/data-types/int-uint.md) 유형입니다.

모든 유형의 [소스](#dictionary-sources)가 지원되며, 로컬 파일은 제외됩니다.

구성 예시:

```xml
<layout>
  <direct />
</layout>
```

또는

```sql
LAYOUT(DIRECT())
```
### complex_key_direct {#complex_key_direct}

이 유형의 저장소는 복합 [키](#dictionary-key-and-fields)와 함께 사용하기 위한 것입니다. `direct`와 유사합니다.
### ip_trie {#ip_trie}

이 딕셔너리는 네트워크 접두사별로 IP 주소를 조회하도록 설계되었습니다. CIDR 표기법으로 IP 범위를 저장하고 주어진 IP가 어떤 접두사(예: 서브넷 또는 ASN 범위)에 해당하는지 신속하게 결정할 수 있도록 하여, 지리적 위치 검색이나 네트워크 분류와 같은 IP 기반 검색에 이상적입니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="IP based search with the ip_trie dictionary" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

**예시**

ClickHouse에 IP 접두사와 매핑이 포함된 테이블이 있다고 가정해 보겠습니다:

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

이 테이블에 대해 `ip_trie` 딕셔너리를 정의해 보겠습니다. `ip_trie` 레이아웃은 복합 키를 요구합니다:

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

키는 허용된 IP 접두사를 포함하는 단일 `String` 유형 속성만 포함해야 합니다. 다른 유형은 아직 지원되지 않습니다.

구문은 다음과 같습니다:

```sql
dictGetT('dict_name', 'attr_name', ip)
```

이 함수는 IPv4의 경우 `UInt32`, IPv6의 경우 `FixedString(16)`을 사용합니다. 예를 들어:

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

다른 유형은 아직 지원되지 않습니다. 이 함수는 이 IP 주소에 해당하는 접두사의 속성을 반환합니다. 겹치는 접두사가 있는 경우, 가장 구체적인 것이 반환됩니다.

데이터는 완전히 RAM에 적합해야 합니다.
## LIFETIME을 사용한 딕셔너리 데이터 새로 고침 {#refreshing-dictionary-data-using-lifetime}

ClickHouse는 주기적으로 `LIFETIME` 태그(초로 정의됨)에 따라 딕셔너리를 업데이트합니다. `LIFETIME`는 완전히 다운로드된 딕셔너리의 업데이트 간격과 캐시된 딕셔너리의 무효화 간격입니다.

업데이트 중에는 오래된 버전의 딕셔너리를 계속 쿼리할 수 있습니다. 딕셔너리 업데이트(딕셔너리를 처음 사용하는 경우를 제외하고)는 쿼리를 차단하지 않습니다. 업데이트 중에 오류가 발생하면 오류는 서버 로그에 기록되며, 쿼리는 오래된 딕셔너리를 사용하여 계속 진행될 수 있습니다. 딕셔너리 업데이트가 성공하면 오래된 딕셔너리 버전은 원자적으로 교체됩니다.

설정 예시:

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

`<lifetime>0</lifetime>`(`LIFETIME(0)`) 설정은 딕셔너리가 업데이트되지 않도록 합니다.

업데이트 간격을 설정할 수 있으며 ClickHouse는 이 범위 내에서 균등하게 무작위 시간을 선택합니다. 이는 많은 서버에서 업데이트할 때 딕셔너리 소스에 대한 부하를 분산시키기 위해 필요합니다.

설정 예시:

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

`<min>0</min>` 및 `<max>0</max>` 설정을 지정하면 ClickHouse는 타임아웃에 따라 딕셔너리를 재로드하지 않습니다.
이 경우, ClickHouse는 딕셔너리 구성 파일이 변경되거나 `SYSTEM RELOAD DICTIONARY` 명령이 실행되면 딕셔너리를 더 일찍 재로드할 수 있습니다.

딕셔너리를 업데이트할 때 ClickHouse 서버는 [소스](#dictionary-sources) 유형에 따라 다양한 논리를 적용합니다:

- 텍스트 파일의 경우 수정 시간을 확인합니다. 시간이 이전에 기록된 시간과 다르면 딕셔너리가 업데이트됩니다.
- 다른 소스로부터의 딕셔너리는 기본적으로 매번 업데이트됩니다.

ODBC, PostgreSQL, ClickHouse 등과 같은 다른 소스에 대해, 매번 업데이트하는 것이 아니라 실제로 변경된 경우에만 딕셔너리를 업데이트하는 쿼리를 설정할 수 있습니다. 이를 위해 다음 단계를 따르십시오:

- 딕셔너리 테이블에는 소스 데이터가 업데이트될 때마다 항상 변경되는 필드가 있어야 합니다.
- 소스의 설정에서 변경되는 필드를 검색하는 쿼리를 지정해야 합니다. ClickHouse 서버는 쿼리 결과를 행으로 해석하며, 이전 상태에 비해 이 행이 변경된 경우 딕셔너리가 업데이트됩니다. `[소스](#dictionary-sources)`의 설정에서 `<invalidate_query>` 필드에 쿼리를 지정하십시오.

설정 예시:

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

`Cache`, `ComplexKeyCache`, `SSDCache`, `SSDComplexKeyCache` 딕셔너리의 경우 동기 및 비동기 업데이트 둘 다 지원됩니다.

`Flat`, `Hashed`, `HashedArray`, `ComplexKeyHashed` 딕셔너리에 대해서도 이전 업데이트 이후에 변경된 데이터만 요청할 수 있습니다. 딕셔너리 소스 설정의 일부로서 `update_field`가 지정되면, 이전 업데이트 시간의 초 단위 값이 데이터 요청에 추가됩니다. 소스 유형(Executable, HTTP, MySQL, PostgreSQL, ClickHouse 또는 ODBC)에 따라 데이터 요청 전에 `update_field`에 대해 다른 논리가 적용됩니다.

- 소스가 HTTP인 경우 `update_field`는 쿼리 매개변수로 추가되며, 마지막 업데이트 시간을 매개변수 값으로 사용합니다.
- 소스가 Executable인 경우 `update_field`는 실행 가능한 스크립트 인수로 추가되며, 마지막 업데이트 시간을 인수 값으로 사용합니다.
- 소스가 ClickHouse, MySQL, PostgreSQL, ODBC인 경우 `WHERE`의 추가 부분이 있으며, `update_field`는 마지막 업데이트 시간보다 크거나 같다고 비교됩니다.
  - 기본적으로 이 `WHERE` 조건은 SQL 쿼리의 가장 높은 수준에서 확인됩니다. 또는 조건은 `{condition}` 키워드를 사용하여 쿼리 내의 다른 `WHERE` 절에서 확인할 수 있습니다. 예:
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

`update_field` 옵션이 설정되면, 추가 옵션인 `update_lag`를 설정할 수 있습니다. `update_lag` 옵션의 값은 업데이트된 데이터를 요청하기 전에 이전 업데이트 시간에서 뺄 수 있습니다.

설정 예시:

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
## 딕셔너리 소스 {#dictionary-sources}

<CloudDetails />

딕셔너리는 다양한 소스에서 ClickHouse에 연결할 수 있습니다.

딕셔너리가 xml 파일을 사용하여 구성된 경우, 구성은 다음과 같습니다:

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

DDL 쿼리의 경우, 위의 구성이 다음과 같이 보입니다:

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Source configuration
...
```

소스는 `source` 섹션에서 구성됩니다.

[로컬 파일](#local-file), [실행 파일](#executable-file), [HTTP(s)](#https), [ClickHouse](#clickhouse) 소스 유형에 대해 선택적 설정이 가능합니다:

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

- [로컬 파일](#local-file)
- [실행 파일](#executable-file)
- [실행 풀](#executable-pool)
- [HTTP(S)](#https)
- DBMS
  - [ODBC](#odbc)
  - [MySQL](#mysql)
  - [ClickHouse](#clickhouse)
  - [MongoDB](#mongodb)
  - [Redis](#redis)
  - [Cassandra](#cassandra)
  - [PostgreSQL](#postgresql)
### 로컬 파일 {#local-file}

설정 예시:

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

- `path` – 파일의 절대 경로.
- `format` – 파일 형식. [형식](/sql-reference/formats)에 설명된 모든 형식이 지원됩니다.

`FILE` 소스의 딕셔너리가 DDL 명령(`CREATE DICTIONARY ...`)을 통해 생성될 때, 소스 파일은 ClickHouse 노드에서 임의 파일에 대한 접근을 방지하기 위해 `user_files` 디렉토리에 있어야 합니다.

**참고**

- [딕셔너리 함수](/sql-reference/table-functions/dictionary)
### 실행 파일 {#executable-file}

실행 파일 작업은 [메모리에 딕셔너리가 저장되는 방법](#storing-dictionaries-in-memory)에 따라 다릅니다. 딕셔너리가 `cache`와 `complex_key_cache`를 사용하여 저장되는 경우, ClickHouse는 실행 파일의 STDIN으로 키를 요청합니다. 그렇지 않으면 ClickHouse는 실행 파일을 시작하고 그 출력을 딕셔너리 데이터로 취급합니다.

설정 예시:

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

- `command` — 실행 파일의 절대 경로 또는 파일 이름(명령의 디렉토리가 `PATH`에 있는 경우).
- `format` — 파일 형식. [형식](/sql-reference/formats)에 설명된 모든 형식이 지원됩니다.
- `command_termination_timeout` — 실행 가능한 스크립트는 주 루프를 포함해야 합니다. 딕셔너리가 삭제된 후에는 파이프가 닫히며, ClickHouse가 자식 프로세스에 SIGTERM 신호를 보내기 전에 `command_termination_timeout` 초 동안 종료할 수 있습니다. `command_termination_timeout`은 초 단위로 지정됩니다. 기본값은 10입니다. 선택적 매개변수입니다.
- `command_read_timeout` - 명령 stdout에서 데이터를 읽기 위한 타임아웃이며, 밀리초 단위입니다. 기본값은 10000입니다. 선택적 매개변수입니다.
- `command_write_timeout` - 명령 stdin으로 데이터를 쓰기 위한 타임아웃이며, 밀리초 단위입니다. 기본값은 10000입니다. 선택적 매개변수입니다.
- `implicit_key` — 실행 가능한 소스 파일은 값만 반환할 수 있으며, 요청된 키에 대한 일치는 결과의 행 순서에 의해 암묵적으로 결정됩니다. 기본값은 false입니다.
- `execute_direct` - `execute_direct` = `1`인 경우, `command`는 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)로 지정된 사용자 스크립트 폴더 내에서 검색됩니다. 추가 스크립트 인수는 공백 구분 기호를 사용하여 지정할 수 있습니다. 예: `script_name arg1 arg2`. `execute_direct` = `0`인 경우, `command`는 `bin/sh -c`에 대한 인수로 전달됩니다. 기본값은 `0`입니다. 선택적 매개변수입니다.
- `send_chunk_header` - 데이터 를 처리하기 전에 청크 수를 전송할지를 제어합니다. 선택적입니다. 기본값은 `false`입니다.

이 딕셔너리 소스는 XML 구성만을 통해 구성할 수 있습니다. DDL을 통해 실행 가능한 소스가 있는 딕셔너리를 생성하는 것은 비활성입니다. 그렇지 않으면 DB 사용자가 ClickHouse 노드에서 임의의 이진 파일을 실행할 수 있게 됩니다.
### 실행 풀 {#executable-pool}

실행 풀은 프로세스 풀에서 데이터를 로드할 수 있게 해줍니다. 이 소스는 소스에서 모든 데이터를 로드하는 딕셔너리 레이아웃과 함께 작동하지 않습니다. 실행 풀은 [메모리에 저장된](#ways-to-store-dictionaries-in-memory) 딕셔너리가 `cache`, `complex_key_cache`, `ssd_cache`, `complex_key_ssd_cache`, `direct` 또는 `complex_key_direct` 레이아웃을 사용할 때 작동합니다.

실행 풀은 지정된 명령으로 프로세스 풀을 생성하며 프로세스가 종료될 때까지 계속 실행됩니다. 프로그램은 STDIN에서 데이터가 사용 가능할 때 읽고 결과를 STDOUT으로 출력해야 합니다. STDIN에서 다음 데이터 블록을 기다릴 수 있습니다. ClickHouse는 데이터를 처리한 후 STDIN을 닫지 않으며 필요할 때마다 또 다른 청크의 데이터를 파이프합니다. 실행 가능한 스크립트는 이러한 방식의 데이터 처리에 준비되어 있어야 하며, STDIN을 폴링하고 결과를 STDOUT에 일찍 플러시해야 합니다.

설정 예시:

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

- `command` — 실행 파일의 절대 경로 또는 파일 이름(프로그램 디렉토리가 `PATH`에 기록된 경우).
- `format` — 파일 형식. [형식](/sql-reference/formats)에 설명된 모든 형식이 지원됩니다.
- `pool_size` — 풀의 크기입니다. `pool_size`로 0이 지정되면 풀 크기 제한이 없습니다. 기본값은 `16`입니다.
- `command_termination_timeout` — 실행 가능한 스크립트는 주 루프를 포함해야 합니다. 딕셔너리가 삭제된 후에는 파이프가 닫히며, 실행 파일은 `command_termination_timeout` 초 동안 종료할 수 있도록 됩니다. ClickHouse는 자식 프로세스에 SIGTERM 신호를 보내기 전에 지정된 초 단위로 대기합니다. 기본값은 10입니다. 선택적 매개변수입니다.
- `max_command_execution_time` — 데이터 블록 처리를 위한 실행 가능한 스크립트 명령의 최대 실행 시간입니다. 초 단위로 지정됩니다. 기본값은 10입니다. 선택적 매개변수입니다.
- `command_read_timeout` - 명령 stdout에서 데이터를 읽기 위한 타임아웃이며, 밀리초 단위입니다. 기본값은 10000입니다. 선택적 매개변수입니다.
- `command_write_timeout` - 명령 stdin으로 데이터를 쓰기 위한 타임아웃이며, 밀리초 단위입니다. 기본값은 10000입니다. 선택적 매개변수입니다.
- `implicit_key` — 실행 가능한 소스 파일은 값만 반환할 수 있으며, 요청된 키에 대한 일치는 결과의 행 순서에 의해 암묵적으로 결정됩니다. 기본값은 false입니다. 선택적 매개변수입니다.
- `execute_direct` - `execute_direct` = `1`인 경우, `command`는 [user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)로 지정된 사용자 스크립트 폴더 내에서 검색됩니다. 추가 스크립트 인수는 공백 구분 기호를 사용하여 지정할 수 있습니다. 예: `script_name arg1 arg2`. `execute_direct` = `0`인 경우, `command`는 `bin/sh -c`에 대한 인수로 전달됩니다. 기본값은 `1`입니다. 선택적 매개변수입니다.
- `send_chunk_header` - 데이터를 처리하기 전에 청크 수를 전송할지를 제어합니다. 선택적입니다. 기본값은 `false`.

이 딕셔너리 소스는 XML 구성만을 통해 구성할 수 있습니다. DDL을 통해 실행 가능한 소스가 있는 딕셔너리를 생성하는 것은 비활성입니다. 그렇지 않으면 DB 사용자가 ClickHouse 노드에서 임의의 이진 파일을 실행할 수 있게 됩니다.

### HTTP(S) {#https}

HTTP(S) 서버와 작업하는 것은 [딕셔너리가 메모리에 저장되는 방식](#storing-dictionaries-in-memory)에 따라 달라집니다. 딕셔너리가 `cache`와 `complex_key_cache`를 사용하여 저장되는 경우, ClickHouse는 `POST` 메서드를 통해 필요한 키를 요청합니다.

설정 예시:

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

ClickHouse가 HTTPS 리소스에 접근하려면 서버 구성에서 [openSSL을 구성해야](../../operations/server-configuration-parameters/settings.md#openssl) 합니다.

설정 필드:

- `url` – 소스 URL.
- `format` – 파일 형식. "[형식](/sql-reference/formats)"에 설명된 모든 형식이 지원됩니다.
- `credentials` – 기본 HTTP 인증. 선택적 매개변수.
- `user` – 인증에 필요한 사용자 이름.
- `password` – 인증에 필요한 비밀번호.
- `headers` – HTTP 요청에 사용되는 모든 사용자 정의 HTTP 헤더 항목. 선택적 매개변수.
- `header` – 단일 HTTP 헤더 항목.
- `name` – 요청에 전송되는 헤더의 식별자 이름.
- `value` – 특정 식별자 이름에 대해 설정된 값.

DDL 명령어(`CREATE DICTIONARY ...`)를 사용하여 딕셔너리를 생성할 때, HTTP 딕셔너리의 원격 호스트는 데이터베이스 사용자가 임의의 HTTP 서버에 접근하지 못하도록 config의 `remote_url_allow_hosts` 섹션 내용과 대조됩니다.

### DBMS {#dbms}
#### ODBC {#odbc}

이 방법을 사용하여 ODBC 드라이버가 있는 모든 데이터베이스에 연결할 수 있습니다.

설정 예시:

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

설정 필드:

- `db` – 데이터베이스의 이름. `<connection_string>` 매개변수에 데이터베이스 이름이 설정되어 있으면 생략할 수 있습니다.
- `table` – 테이블 이름과 존재하는 경우 스키마.
- `connection_string` – 연결 문자열.
- `invalidate_query` – 딕셔너리 상태를 확인하는 쿼리. 선택적 매개변수. [LIFETIME을 사용한 딕셔너리 데이터 새로 고침](#refreshing-dictionary-data-using-lifetime) 섹션에서 자세히 알아보세요.
- `background_reconnect` – 연결 실패 시 복제본에 백그라운드로 재연결합니다. 선택적 매개변수.
- `query` – 사용자정의 쿼리. 선택적 매개변수.

:::note
`table`과 `query` 필드를 함께 사용할 수 없습니다. `table` 또는 `query` 필드 중 하나는 반드시 선언되어야 합니다.
:::

ClickHouse는 ODBC 드라이버에서 인용 기호를 수신하고 드라이버에 쿼리에서 모든 설정을 인용하므로, 데이터베이스에서의 테이블 이름 케이스에 맞게 테이블 이름을 설정해야 합니다.

Oracle을 사용할 때 인코딩 관련 문제가 발생하는 경우, 해당 [FAQ](/knowledgebase/oracle-odbc) 항목을 참조하세요.
##### ODBC 딕셔너리 기능의 알려진 취약점 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBC 드라이버를 통해 데이터베이스에 연결할 때, 연결 매개변수 `Servername`을 대체할 수 있습니다. 이 경우 `odbc.ini`의 `USERNAME` 및 `PASSWORD` 값이 원격 서버로 전송되며, 유출될 수 있습니다.
:::

**안전하지 않은 사용 예**

PostgreSQL에 대해 unixODBC를 구성합시다. `/etc/odbc.ini`의 내용:

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

그 다음, 다음과 같은 쿼리를 실행하면:

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC 드라이버는 `odbc.ini`의 `USERNAME` 및 `PASSWORD` 값을 `some-server.com`으로 전송합니다.
##### PostgreSQL 연결 예 {#example-of-connecting-postgresql}

Ubuntu OS.

PostgreSQL ODBC 드라이버 및 unixODBC 설치:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini` 구성 (ClickHouse를 실행하는 사용자로 로그인한 경우 `~/.odbc.ini`):

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

ClickHouse의 딕셔너리 구성:

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

드라이버가 있는 라이브러리의 전체 경로를 지정하기 위해 `odbc.ini`를 수정해야 할 수 있습니다. `DRIVER=/usr/local/lib/psqlodbcw.so`.
##### MS SQL Server 연결 예 {#example-of-connecting-ms-sql-server}

Ubuntu OS.

MS SQL에 연결하기 위한 ODBC 드라이버 설치:

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

드라이버 구성:

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
- 특정 SQL Server 버전에서 지원되는 가장 원시 TDS 버전을 확인하려면 제품 문서를 참조하거나 [MS-TDS 제품 동작](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)을 참조하세요.

ClickHouse에서의 딕셔너리 구성:

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

#### Mysql {#mysql}

설정 예:

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

- `port` – MySQL 서버의 포트. 모든 복제본 또는 각각 개별적으로(`<replica>` 내부) 지정할 수 있습니다.

- `user` – MySQL 사용자 이름. 모든 복제본 또는 각각 개별적으로(`<replica>` 내부) 지정할 수 있습니다.

- `password` – MySQL 사용자 비밀번호. 모든 복제본 또는 각각 개별적으로(`<replica>` 내부) 지정할 수 있습니다.

- `replica` – 복제본 구성 섹션. 여러 섹션이 있을 수 있습니다.

      - `replica/host` – MySQL 호스트.
      - `replica/priority` – 복제본 우선순위. 연결을 시도할 때 ClickHouse는 우선순위 순서로 복제본을 통과합니다. 숫자가 낮을수록 우선순위가 높습니다.

- `db` – 데이터베이스의 이름.

- `table` – 테이블의 이름.

- `where` – 선택 기준. 조건의 구문은 MySQL의 `WHERE` 절과 동일합니다. 예: `id > 10 AND id < 20`. 선택적 매개변수.

- `invalidate_query` – 딕셔너리 상태를 확인하는 쿼리. 선택적 매개변수. [LIFETIME을 사용한 딕셔너리 데이터 새로 고침](#refreshing-dictionary-data-using-lifetime) 섹션에서 자세히 알아보세요.

- `fail_on_connection_loss` – 연결 손실 시 서버의 동작을 제어하는 구성 매개변수입니다. `true`인 경우 클라이언트와 서버 간의 연결이 끊어지면 즉시 예외가 발생합니다. `false`인 경우 ClickHouse 서버는 예외를 발생시키기 전에 쿼리를 세 번 다시 시도합니다. 다시 시도하면 응답 시간이 증가할 수 있습니다. 기본 값: `false`.

- `query` – 사용자정의 쿼리. 선택적 매개변수.

:::note
`table` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 그리고 `table` 또는 `query` 필드 중 하나는 반드시 선언되어야 합니다.
:::

:::note
명시적인 `secure` 매개변수는 없습니다. SSL 연결을 설정할 때 보안은 필수입니다.
:::

MySQL은 소켓을 통해 로컬 호스트에 연결할 수 있습니다. 이를 위해 `host`와 `socket`을 설정하세요.

설정 예:

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
#### ClickHouse {#clickhouse}

설정 예:

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

설정 필드:

- `host` – ClickHouse 호스트. 로컬 호스트인 경우, 쿼리는 네트워크 활동 없이 처리됩니다. 내결함성을 개선하기 위해 [분산](../../engines/table-engines/special/distributed.md) 테이블을 생성하고 이후 구성에 입력할 수 있습니다.
- `port` – ClickHouse 서버의 포트.
- `user` – ClickHouse 사용자 이름.
- `password` – ClickHouse 사용자 비밀번호.
- `db` – 데이터베이스의 이름.
- `table` – 테이블의 이름.
- `where` – 선택 기준. 생략할 수 있습니다.
- `invalidate_query` – 딕셔너리 상태를 확인하는 쿼리. 선택적 매개변수. [LIFETIME을 사용한 딕셔너리 데이터 새로 고침](#refreshing-dictionary-data-using-lifetime) 섹션에서 자세히 알아보세요.
- `secure` - 연결을 위해 ssl을 사용합니다.
- `query` – 사용자정의 쿼리. 선택적 매개변수.

:::note
`table` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 그리고 `table` 또는 `query` 필드 중 하나는 반드시 선언되어야 합니다.
:::
#### MongoDB {#mongodb}

설정 예:

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

- `host` – MongoDB 호스트.
- `port` – MongoDB 서버의 포트.
- `user` – MongoDB 사용자 이름.
- `password` – MongoDB 사용자 비밀번호.
- `db` – 데이터베이스의 이름.
- `collection` – 컬렉션의 이름.
- `options` - MongoDB 연결 문자열 옵션 (선택적 매개변수).

또는

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

설정 필드:

- `uri` - 연결을 설정하기 위한 URI.
- `collection` – 컬렉션의 이름.

[엔진에 대한 더 많은 정보](../../engines/table-engines/integrations/mongodb.md)
#### Redis {#redis}

설정 예:

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

- `host` – Redis 호스트.
- `port` – Redis 서버의 포트.
- `storage_type` – 키 작업에 사용하는 내부 Redis 저장소의 구조. `simple`은 단순 소스 및 해싱된 단일 키 소스를 위한 것이고, `hash_map`은 두 개의 키를 가진 해싱된 소스를 위한 것입니다. 범위 소스 및 복합 키 캐시 소스는 지원되지 않습니다. 생략할 수 있으며, 기본 값은 `simple`입니다.
- `db_index` – Redis 논리 데이터베이스의 특정 숫자 인덱스. 생략할 수 있으며, 기본 값은 0입니다.
#### Cassandra {#cassandra}

설정 예:

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

설정 필드:

- `host` – Cassandra 호스트 또는 쉼표로 구분된 호스트 목록.
- `port` – Cassandra 서버의 포트. 지정하지 않으면 기본 포트 9042가 사용됩니다.
- `user` – Cassandra 사용자 이름.
- `password` – Cassandra 사용자 비밀번호.
- `keyspace` – 키스페이스(데이터베이스)의 이름.
- `column_family` – 컬럼 패밀리(테이블)의 이름.
- `allow_filtering` – 클러스터링 키 컬럼에 대해 비용이 많이 드는 조건을 허용할지 여부. 기본 값은 1입니다.
- `partition_key_prefix` – Cassandra 테이블의 기본 키에서 파티션 키 컬럼 수. 복합 키 딕셔너리 작성에 필요합니다. 딕셔너리 정의에서 키 컬럼의 순서는 Cassandra에서와 같아야 합니다. 기본 값은 1입니다(첫 번째 키 컬럼이 파티션 키이고 다른 키 컬럼이 클러스터링 키입니다).
- `consistency` – 일관성 수준. 가능한 값: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`. 기본 값은 `One`입니다.
- `where` – 선택 기준(선택적).
- `max_threads` – 복합 키 딕셔너리에서 여러 파티션에서 데이터 로드를 위해 사용할 최대 스레드 수.
- `query` – 사용자정의 쿼리. 선택적 매개변수.

:::note
`column_family` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 그리고 `column_family` 또는 `query` 필드 중 하나는 반드시 선언되어야 합니다.
:::
#### PostgreSQL {#postgresql}

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

- `host` – PostgreSQL 서버의 호스트. 모든 복제본 또는 각각 개별적으로(`<replica>` 내부)에 대해 지정할 수 있습니다.
- `port` – PostgreSQL 서버의 포트. 모든 복제본 또는 각각 개별적으로(`<replica>` 내부)에 대해 지정할 수 있습니다.
- `user` – PostgreSQL 사용자 이름. 모든 복제본 또는 각각 개별적으로(`<replica>` 내부)에 대해 지정할 수 있습니다.
- `password` – PostgreSQL 사용자 비밀번호. 모든 복제본 또는 각각 개별적으로(`<replica>` 내부)에 대해 지정할 수 있습니다.
- `replica` – 복제본 구성 섹션. 여러 섹션이 있을 수 있습니다:
  - `replica/host` – PostgreSQL 호스트.
  - `replica/port` – PostgreSQL 포트.
  - `replica/priority` – 복제본 우선순위. 연결을 시도할 때 ClickHouse는 우선순위 순서로 복제본을 통과합니다. 숫자가 낮을수록 우선순위가 높습니다.
- `db` – 데이터베이스의 이름.
- `table` – 테이블의 이름.
- `where` – 선택 기준. PostgreSQL에서의 `WHERE` 절과 동일한 구문입니다. 예: `id > 10 AND id < 20`. 선택적 매개변수.
- `invalidate_query` – 딕셔너리 상태를 확인하는 쿼리. 선택적 매개변수. [LIFETIME을 사용한 딕셔너리 데이터 새로 고침](#refreshing-dictionary-data-using-lifetime) 섹션에서 자세히 알아보세요.
- `background_reconnect` – 연결 실패 시 백그라운드에서 복제본에 재연결합니다. 선택적 매개변수.
- `query` – 사용자정의 쿼리. 선택적 매개변수.

:::note
`table` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 그리고 `table` 또는 `query` 필드 중 하나는 반드시 선언되어야 합니다.
:::
### Null {#null}

더미(비어 있는) 딕셔너리를 만드는 데 사용할 수 있는 특별한 소스. 이러한 딕셔너리는 테스트에 유용하거나, 분산 테이블이 있는 노드에서 데이터와 쿼리 노드가 분리된 설정에서 유용할 수 있습니다.

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
## 딕셔너리 키 및 필드 {#dictionary-key-and-fields}

<CloudDetails />

`structure` 절은 딕셔너리 키 및 쿼리에 사용할 수 있는 필드를 설명합니다.

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

속성은 요소에서 설명됩니다:

- `<id>` — 키 컬럼
- `<attribute>` — 데이터 컬럼: 여러 개의 속성이 있을 수 있습니다.

DDL 쿼리:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

속성은 쿼리 본문에 설명됩니다:

- `PRIMARY KEY` — 키 컬럼
- `AttrName AttrType` — 데이터 컬럼. 여러 개의 속성이 있을 수 있습니다.
## 키 {#key}

ClickHouse는 다음과 같은 유형의 키를 지원합니다:

- 숫자 키. `UInt64`. `<id>` 태그에 정의되거나 `PRIMARY KEY` 키워드를 사용하여 정의됩니다.
- 복합 키. 서로 다른 유형의 값 집합. `<key>` 태그나 `PRIMARY KEY` 키워드로 정의됩니다.

XML 구조에는 `<id>` 또는 `<key>` 중 하나가 포함될 수 있습니다. DDL 쿼리에는 단일 `PRIMARY KEY`가 포함되어야 합니다.

:::note
키를 속성으로 설명하면 안 됩니다.
:::
### 숫자 키 {#numeric-key}

유형: `UInt64`.

구성 예시:

```xml
<id>
    <name>Id</name>
</id>
```

구성 필드:

- `name` – 키가 있는 컬럼의 이름.

DDL 쿼리의 경우:

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – 키가 있는 컬럼의 이름.
### 복합 키 {#composite-key}

키는 모든 타입의 필드로 이루어진 `tuple`일 수 있습니다. 이 경우 [배치](#storing-dictionaries-in-memory)는 `complex_key_hashed` 또는 `complex_key_cache`이어야 합니다.

:::tip
복합 키는 단일 요소로 구성될 수 있습니다. 이를 통해 문자열을 키로 사용할 수 있습니다.
:::

키 구조는 `<key>` 요소에서 설정됩니다. 키 필드는 딕셔너리의 [속성](#dictionary-key-and-fields)과 같은 형식으로 지정됩니다. 예:

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

`dictGet*` 함수에 대한 쿼리에서는 튜플이 키로 전달됩니다. 예: `dictGetString('dict_name', 'attr_name', tuple('field1에 대한 문자열', num_for_field2))`.
## 속성 {#attributes}

구성 예시:

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

| 태그                                                  | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 필수  |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| `name`                                               | 컬럼 이름.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 예    |
| `type`                                               | ClickHouse 데이터 유형: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md).<br/>ClickHouse는 딕셔너리에서 값의 유형을 지정한 데이터 유형으로 캐스팅하려고 시도합니다. 예를 들어 MySQL의 경우, 필드는 MySQL 소스 테이블에서 `TEXT`, `VARCHAR` 또는 `BLOB`일 수 있지만, ClickHouse에서는 `String`으로 업로드할 수 있습니다.<br/>[Nullable](../../sql-reference/data-types/nullable.md)는 현재 [Flat](#flat), [Hashed](#hashed), [ComplexKeyHashed](#complex_key_hashed), [Direct](#direct), [ComplexKeyDirect](#complex_key_direct), [RangeHashed](#range_hashed), Polygon, [Cache](#cache), [ComplexKeyCache](#complex_key_cache), [SSDCache](#ssd_cache), [SSDComplexKeyCache](#complex_key_ssd_cache) 딕셔너리에서 지원됩니다. [IPTrie](#ip_trie) 딕셔너리에서는 `Nullable` 유형이 지원되지 않습니다. | 예    |
| `null_value`                                         | 존재하지 않는 요소에 대한 기본값.<br/>예제에서는 빈 문자열입니다. [NULL](../syntax.md#null) 값은 `Nullable` 유형(유형 설명의 이전 행 참조)에만 사용할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 예    |
| `expression`                                         | ClickHouse가 값을 실행하는 [표현식](../../sql-reference/syntax.md#expressions).<br/>표현식은 원격 SQL 데이터베이스에서의 컬럼 이름이 될 수 있습니다. 이는 원격 컬럼에 대한 별칭을 만드는 데 사용할 수 있습니다.<br/><br/>기본 값: 표현식 없음.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 아니요 |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true`인 경우, 속성은 현재 키에 대한 부모 키의 값을 포함합니다. [계층적 딕셔너리](#hierarchical-dictionaries)를 참조하세요.<br/><br/>기본 값: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 아니요 |
| `injective`                                          | `id -> attribute` 이미지가 [injective](https://en.wikipedia.org/wiki/Injective_function)인지 여부를 나타내는 플래그.<br/>`true`인 경우 ClickHouse는 자동으로 `GROUP BY` 절 이후에 주입을 위한 딕셔너리 요청을 배치할 수 있습니다. 일반적으로 이는 이러한 요청의 수를 상당히 줄입니다.<br/><br/>기본 값: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 아니요 |
| `is_object_id`                                       | 쿼리가 MongoDB 문서에 대해 `ObjectID`로 실행되는지 여부를 나타내는 플래그.<br/><br/>기본 값: `false`.

## 계층적 딕셔너리 {#hierarchical-dictionaries}

ClickHouse는 [숫자 키](#numeric-key)를 가진 계층적 딕셔너리를 지원합니다.

다음 계층 구조를 살펴보십시오:

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

이 계층은 다음 딕셔너리 테이블로 표현될 수 있습니다.

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | Russia        |
| 2          | 1              | Moscow        |
| 3          | 2              | Center        |
| 4          | 0              | Great Britain |
| 5          | 4              | London        |

이 테이블은 요소의 가장 가까운 부모의 키를 포함하는 `parent_region` 컬럼을 포함합니다.

ClickHouse는 외부 딕셔너리 속성에 대한 계층적 속성을 지원합니다. 이 속성을 사용하면 위에 설명된 것과 유사한 계층적 딕셔너리를 구성할 수 있습니다.

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) 함수는 요소의 부모 체인을 가져오는 데 사용됩니다.

예를 들어, 딕셔너리의 구조는 다음과 같을 수 있습니다:

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
## 폴리곤 딕셔너리 {#polygon-dictionaries}

이 딕셔너리는 점-내-폴리곤 쿼리에 최적화되어 있으며, 본질적으로 "역 지오코딩" 조회를 수행합니다. 좌표(위도/경도)가 주어지면, 이 점을 포함하는 다각형/영역(국가 또는 지역 경계와 같은 많은 다각형 집합에서) 을 효율적으로 찾습니다. 이는 위치 좌표를 포함하는 지역에 매핑하는 데 적합합니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="ClickHouse의 Polygon Dictionaries" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

폴리곤 딕셔너리 구성의 예:

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

해당 [DDL-query](/sql-reference/statements/create/dictionary):
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

폴리곤 딕셔너리를 구성할 때, 키는 두 가지 유형 중 하나여야 합니다:

- 간단한 폴리곤. 이는 점의 배열입니다.
- 멀티폴리곤. 이는 폴리곤의 배열입니다. 각 폴리곤은 점의 2차원 배열입니다. 이 배열의 첫 번째 요소는 폴리곤의 외부 경계이며, 후속 요소는 제외할 영역을 지정합니다.

점은 배열이나 좌표의 튜플로 지정할 수 있습니다. 현재 구현에서는 오직 2차원 점만 지원됩니다.

사용자는 ClickHouse에서 지원하는 모든 형식으로 자신의 데이터를 업로드할 수 있습니다.

다음은 사용할 수 있는 3가지 [메모리 내 저장소](#storing-dictionaries-in-memory) 유형입니다:

- `POLYGON_SIMPLE`. 이것은 각 쿼리에 대해 모든 폴리곤을 선형으로 처리하는 단순한 구현으로, 추가 인덱스를 사용하지 않고 각 폴리곤에 대해 포함 여부를 확인합니다.

- `POLYGON_INDEX_EACH`. 각 폴리곤에 대해 별도의 인덱스가 구축되어 대부분의 경우에 빠르게 포함 여부를 확인할 수 있습니다(지리적 지역에 최적화됨).
또한 고려 중인 영역에 그리드가 겹쳐져 있어 고려되는 폴리곤 수가 크게 줄어듭니다.
그리드는 셀을 16개의 동일한 부분으로 재귀적으로 나누어 생성되며 두 개의 매개변수로 구성됩니다.
재귀 깊이가 `MAX_DEPTH`에 도달하거나 셀이 `MIN_INTERSECTIONS` 폴리곤을 넘지 않을 때 분할이 중단됩니다.
쿼리에 응답하기 위해 해당 셀을 참조하고, 이 안에 저장된 폴리곤의 인덱스를 번갈아 접근합니다.

- `POLYGON_INDEX_CELL`. 이 배치는 위에서 설명한 그리드를 생성합니다. 동일한 옵션이 제공됩니다. 각 시트 셀에 대해 해당하는 모든 폴리곤 조각에서 인덱스가 구축되어 요청에 빠르게 응답할 수 있습니다.

- `POLYGON`. `POLYGON_INDEX_CELL`의 동의어입니다.

딕셔너리 쿼리는 딕셔너리 작업을 위한 표준 [함수](../../sql-reference/functions/ext-dict-functions.md)를 사용하여 수행됩니다.
중요한 차이점은 여기서 키가 포함된 폴리곤을 찾고자 하는 점이라는 것입니다.

**예제**

위에서 정의한 딕셔너리를 사용한 예:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

'points' 테이블의 각 점에 대해 마지막 명령을 실행한 결과, 이 점을 포함하는 최소 면적의 폴리곤이 찾히고 요청된 속성이 출력됩니다.

**예제**

폴리곤 딕셔너리에서 SELECT 쿼리를 통해 컬럼을 읽을 수 있으며, 딕셔너리 구성이나 해당 DDL-query에서 `store_polygon_key_column = 1`을 활성화하면 됩니다.

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
## 정규 표현식 트리 딕셔너리 {#regexp-tree-dictionary}

이 딕셔너리는 계층 정규 표현식 패턴에 따라 키를 값에 매핑할 수 있게 해줍니다. 이는 정확한 키 매칭보다 패턴-매치 조회(예: 사용자 에이전트 문자열을 정규 표현식 패턴으로 분류하는 것)에 최적화되어 있습니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="ClickHouse 정규 표현식 트리 딕셔너리 소개" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
### ClickHouse 오픈 소스에서 정규 표현식 트리 딕셔너리 사용하기 {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

정규 표현식 트리 딕셔너리는 YAMLRegExpTree 소스를 사용하여 ClickHouse 오픈 소스에서 정의되며, 이는 정규 표현식 트리를 포함하는 YAML 파일의 경로를 제공합니다.

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

딕셔너리 소스 `YAMLRegExpTree`는 정규 표현식 트리의 구조를 나타냅니다. 예를 들어:

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

이 구성은 정규 표현식 트리 노드 목록으로 구성됩니다. 각 노드는 다음 구조를 가집니다:

- **regexp**: 노드의 정규 표현식입니다.
- **attributes**: 사용자 정의 딕셔너리 속성의 목록입니다. 이 예제에서는 두 개의 속성이 있습니다: `name`과 `version`. 첫 번째 노드는 두 속성을 모두 정의합니다. 두 번째 노드는 속성 `name`만 정의합니다. 속성 `version`은 두 번째 노드의 자식 노드에 의해 제공됩니다.
  - 속성의 값은 일치하는 정규 표현식의 캡처 그룹을 참조하는 **백 레퍼런스**를 포함할 수 있습니다. 이 예제에서 첫 번째 노드의 속성 `version` 값은 정규 표현식의 캡처 그룹 `(\d+[\.\d]*)`에 대한 백 레퍼런스 `\1`로 구성됩니다. 백 레퍼런스 번호는 1에서 9까지이며 `$1` 또는 `\1`(숫자 1의 경우)로 작성됩니다. 백 레퍼런스는 쿼리 실행 중에 일치하는 캡처 그룹으로 대체됩니다.
- **child nodes**: 정규 표현식 트리 노드의 자식 목록으로, 각 노드는 자체 속성과(잠재적으로) 자식 노드를 가집니다. 문자열 매칭은 깊이 우선 방식으로 진행됩니다. 문자열이 정규 표현식 노드와 일치하면, 딕셔너리는 이 노드의 자식 노드와도 일치하는지 확인합니다. 이 경우, 가장 깊은 일치하는 노드의 속성이 할당됩니다. 자식 노드의 속성은 부모 노드의 동명 속성을 덮어씁니다. YAML 파일 내의 자식 노드의 이름은 임의로 설정할 수 있습니다. 예를 들어 위 예의 `versions`.

정규 표현식 트리 딕셔너리는 오직 `dictGet`, `dictGetOrDefault`, 및 `dictGetAll` 함수를 사용하여 접근할 수 있습니다.

예제:

```sql
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

결과:

```text
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

이 경우, 우리는 먼저 상위 레이어의 두 번째 노드에서 정규 표현식 `\d+/tclwebkit(?:\d+[\.\d]*)`를 일치시킵니다. 그 후 딕셔너리는 자식 노드로 계속 탐색하고 문자열이 `3[12]/tclwebkit`와 또한 일치하는 것을 발견합니다. 결과적으로, 속성 `name`의 값은 `Android`(첫 번째 레이어에서 정의됨)이고, 속성 `version`의 값은 `12`(자식 노드에서 정의됨)입니다.

강력한 YAML 구성 파일을 사용하여 정규 표현식 트리 딕셔너리를 사용자 에이전트 문자열 파서로 사용할 수 있습니다. 우리는 [uap-core](https://github.com/ua-parser/uap-core)를 지원하며, 기능 테스트 [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)에서 사용 방법을 보여줍니다.
#### 속성 값 수집 {#collecting-attribute-values}

때때로, 잎 노드의 값만 반환하는 것보다 일치한 여러 정규 표현식의 값을 반환하는 것이 유용할 수 있습니다. 이러한 경우, 전문화된 [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) 함수를 사용할 수 있습니다. 노드에 속성 값 유형이 `T`인 경우, `dictGetAll`은 0개 이상의 값을 포함하는 `Array(T)`를 반환합니다.

기본적으로 각 키에 대해 반환되는 일치 수는 제한이 없습니다. 특정한 네 번째 인수로 경계를 전달하여 `dictGetAll`을 호출할 수 있습니다. 배열은 _위상적 순서_로 채워지며, 즉 자식 노드는 부모 노드보다 먼저, 형제 노드는 소스의 순서에 따릅니다.

예제:

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
#### 일치 모드 {#matching-modes}

패턴 매칭 동작은 특정 딕셔너리 설정으로 수정할 수 있습니다:
- `regexp_dict_flag_case_insensitive`: 대소문자를 구분하지 않는 매칭을 사용합니다(기본값은 `false`). 개별 표현식에서 `(?i)` 및 `(?-i)`로 재정의할 수 있습니다.
- `regexp_dict_flag_dotall`: '.'가 줄 바꿈 문자를 매칭하도록 허용합니다(기본값은 `false`).
### ClickHouse Cloud에서 정규 표현식 트리 딕셔너리 사용하기 {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

위에서 사용한 `YAMLRegExpTree` 소스는 ClickHouse 오픈 소스에서 작동하지만 ClickHouse Cloud에서는 작동하지 않습니다. ClickHouse Cloud에서 정규 표현식 트리 딕셔너리를 사용하려면, 먼저 ClickHouse 오픈 소스에서 YAML 파일에서 정규 표현식 트리 딕셔너리를 생성한 다음, `dictionary` 테이블 함수를 사용하여 CSV 파일로 덤프하고 [INTO OUTFILE](../statements/select/into-outfile.md) 절을 사용해야 합니다.

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

덤프된 파일의 스키마는 다음과 같습니다:

- `id UInt64`: RegexpTree 노드의 ID입니다.
- `parent_id UInt64`: 노드의 부모 ID입니다.
- `regexp String`: 정규 표현식 문자열입니다.
- `keys Array(String)`: 사용자 정의 속성의 이름입니다.
- `values Array(String)`: 사용자 정의 속성의 값입니다.

ClickHouse Cloud에서 딕셔너리를 생성하려면, 먼저 아래의 테이블 구조로 `regexp_dictionary_source_table` 테이블을 생성합니다:

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

그런 다음 아래와 같이 로컬 CSV를 업데이트합니다:

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

자세한 내용은 [로컬 파일 삽입 방식](/integrations/data-ingestion/insert-local-files)을 참조하십시오. 소스 테이블을 초기화한 후, 테이블 소스를 사용하여 RegexpTree를 생성할 수 있습니다:

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
## 내장형 딕셔너리 {#embedded-dictionaries}

<SelfManaged />

ClickHouse는 지오베이스 작업을 위한 기본 기능을 포함하고 있습니다.

이를 통해 다음을 수행할 수 있습니다:

- 지역 ID를 사용하여 원하는 언어로 해당 이름을 가져올 수 있습니다.
- 지역 ID를 사용하여 도시, 지역, 연방 구역, 국가 또는 대륙의 ID를 가져올 수 있습니다.
- 지역이 다른 지역의 일부인지 확인할 수 있습니다.
- 부모 지역의 체인을 가져올 수 있습니다.

모든 기능은 지역 소유권에 대한 서로 다른 관점을 동시에 사용할 수 있는 "전이 지역성"을 지원합니다. 더 많은 정보는 "웹 분석 딕셔너리 작업을 위한 함수" 섹션을 참조하십시오.

내부 딕셔너리는 기본 패키지에서 비활성화되어 있습니다.
이들을 활성화하려면 서버 설정 파일에서 `path_to_regions_hierarchy_file` 및 `path_to_regions_names_files` 매개변수를 주석 해제하세요.

지오베이스는 텍스트 파일에서 로드됩니다.

`regions_hierarchy*.txt` 파일을 `path_to_regions_hierarchy_file` 디렉토리에 놓습니다. 이 구성 매개변수는 `regions_hierarchy.txt` 파일(기본 지역 계층)에 대한 경로를 포함해야 하며, 다른 파일(`regions_hierarchy_ua.txt`)은 동일한 디렉토리에 있어야 합니다.

`regions_names_*.txt` 파일을 `path_to_regions_names_files` 디렉토리에 넣습니다.

이 파일을 직접 생성할 수도 있습니다. 파일 형식은 다음과 같습니다:

`regions_hierarchy*.txt`: 탭으로 구분된(헤더 없음), 열:

- 지역 ID (`UInt32`)
- 부모 지역 ID (`UInt32`)
- 지역 유형 (`UInt8`): 1 - 대륙, 3 - 국가, 4 - 연방 구역, 5 - 지역, 6 - 도시; 다른 유형은 값이 없습니다.
- 인구 (`UInt32`) - 선택적 열

`regions_names_*.txt`: 탭으로 구분된(헤더 없음), 열:

- 지역 ID (`UInt32`)
- 지역 이름 (`String`) - 탭이나 줄 바꿈을 포함할 수 없으며, 이스케이프된 것도 포함할 수 없습니다.

RAM에 저장하기 위해 평면 배열이 사용됩니다. 이로 인해 ID는 백만을 초과할 수 없습니다.

딕셔너리는 서버를 재시작하지 않고도 업데이트할 수 있습니다. 그러나 사용할 수 있는 딕셔너리 집합은 업데이트되지 않습니다.
업데이트를 위해 파일 수정 시간이 확인됩니다. 파일이 변경되면 딕셔너리가 업데이트됩니다.
변경 사항을 확인하는 간격은 `builtin_dictionaries_reload_interval` 매개변수로 구성됩니다.
딕셔너리 업데이트(처음 사용 시 로드 외)는 쿼리를 블록하지 않습니다. 업데이트 중에는 쿼리가 이전 버전의 딕셔너리를 사용합니다. 업데이트 중 오류가 발생하면 오류가 서버 로그에 기록되고 쿼리는 이전 버전의 딕셔너리를 계속 사용합니다.

지오베이스와 함께 딕셔너리를 주기적으로 업데이트하는 것을 권장합니다. 업데이트 중 새 파일을 생성하고 이를 별도의 위치에 작성합니다. 모든 것이 준비되면, 서버에서 사용하는 파일로 이름을 바꿉니다.

OS 식별자 및 검색 엔진 작업을 위한 기능도 있지만, 이는 사용하지 않는 것이 좋습니다.
