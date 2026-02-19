---
description: '메모리에 딕셔너리를 저장하기 위한 레이아웃 유형'
sidebar_label: '개요'
sidebar_position: 1
slug: /sql-reference/statements/create/dictionary/layouts
title: '딕셔너리 레이아웃'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## 딕셔너리 레이아웃 유형 \{#storing-dictionaries-in-memory\}

딕셔너리를 메모리에 저장하는 방법에는 여러 가지가 있으며, 각 방식은 CPU와 RAM 사용량 측면에서 트레이드오프가 있습니다.

| Layout | 설명 |
|---|---|
| [flat](./flat.md) | 키로 인덱싱되는 평탄한 배열에 데이터를 저장합니다. 가장 빠른 레이아웃이지만, 키는 `UInt64`여야 하고 `max_array_size`로 제한됩니다. |
| [hashed](./hashed.md) | 데이터를 해시 테이블에 저장합니다. 키 크기에 제한이 없으며, 요소 개수에도 제한이 없습니다. |
| [sparse_hashed](./hashed.md#sparse_hashed) | `hashed`와 같지만, 더 적은 메모리를 사용하기 위해 CPU 사용량을 늘립니다. |
| [complex_key_hashed](./hashed.md#complex_key_hashed) | 복합 키를 위한 `hashed`와 같은 레이아웃입니다. |
| [complex_key_sparse_hashed](./hashed.md#complex_key_sparse_hashed) | 복합 키를 위한 `sparse_hashed`와 같은 레이아웃입니다. |
| [hashed_array](./hashed-array.md) | 속성을 배열에 저장하고, 해시 테이블로 키를 배열 인덱스에 매핑합니다. 속성이 많을 때 메모리 효율이 좋습니다. |
| [complex_key_hashed_array](./hashed-array.md#complex_key_hashed_array) | 복합 키를 위한 `hashed_array`와 같은 레이아웃입니다. |
| [range_hashed](./range-hashed.md) | 정렬된 범위를 가진 해시 테이블입니다. 키와 날짜/시간 범위를 통한 조회를 지원합니다. |
| [complex_key_range_hashed](./range-hashed.md#complex_key_range_hashed) | 복합 키를 위한 `range_hashed`와 같은 레이아웃입니다. |
| [cache](./cache.md) | 고정 크기의 메모리 내(in-memory) 캐시입니다. 자주 접근되는 키만 저장됩니다. |
| [complex_key_cache](./complex-key-cache.md) | 복합 키를 위한 `cache`와 같은 레이아웃입니다. |
| [ssd_cache](./ssd-cache.md) | `cache`와 같지만, 데이터를 SSD에 저장하고 메모리 내 인덱스를 사용합니다. |
| [complex_key_ssd_cache](./ssd-cache.md#complex_key_ssd_cache) | 복합 키를 위한 `ssd_cache`와 같은 레이아웃입니다. |
| [direct](./direct.md) | 메모리에 저장하지 않고, 각 요청마다 소스를 직접 쿼리합니다. |
| [complex_key_direct](./direct.md#complex_key_direct) | 복합 키를 위한 `direct`와 같은 레이아웃입니다. |
| [ip_trie](./ip-trie.md) | 빠른 IP 프리픽스 조회(CIDR 기반)를 위한 트라이 구조입니다. |

:::tip 추천 레이아웃
[flat](./flat.md), [hashed](./hashed.md), [complex_key_hashed](./hashed.md#complex_key_hashed)가 가장 우수한 쿼리 성능을 제공합니다.
캐시형 레이아웃은 잠재적으로 낮은 성능과 매개변수 튜닝의 어려움 때문에 권장되지 않습니다. 자세한 내용은 [cache](./cache.md)를 참조하십시오.
:::

## 딕셔너리 레이아웃 지정 \{#specify-dictionary-layout\}

<CloudDetails />

`LAYOUT` 절(DDL용) 또는 구성 파일 정의에서 `layout` 설정을 사용하여 딕셔너리 레이아웃을 구성할 수 있습니다.

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- 레이아웃 설정
...
```

</TabItem>
<TabItem value="xml" label="구성 파일">

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- 레이아웃 설정 -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

</TabItem>
</Tabs>

<br/>

전체 DDL 구문은 [CREATE DICTIONARY](../index.md)를 참조하십시오.

레이아웃 이름에 `complex-key*` 단어가 없는 딕셔너리는 [UInt64](../../../data-types/int-uint.md) 타입의 키를 가지며, `complex-key*` 딕셔너리는 복합 키(여러 임의 타입으로 구성된 키)를 가집니다.

**숫자형 키 예시**(컬럼 key_column은 [UInt64](../../../data-types/int-uint.md) 타입입니다):

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (
    key_column UInt64,
    ...
)
PRIMARY KEY key_column
```

</TabItem>
<TabItem value="xml" label="구성 파일">

```xml
<structure>
    <id>
        <name>key_column</name>
    </id>
    ...
</structure>
```

</TabItem>
</Tabs>

<br/>

**복합 키 예시**(key는 [String](../../../data-types/string.md) 타입의 요소 하나로 구성됩니다):

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (
    country_code String,
    ...
)
PRIMARY KEY country_code
```

</TabItem>
<TabItem value="xml" label="구성 파일">

```xml
<structure>
    <key>
        <attribute>
            <name>country_code</name>
            <type>String</type>
        </attribute>
    </key>
    ...
</structure>
```

</TabItem>
</Tabs>

## 딕셔너리 성능 향상 \{#improve-performance\}

딕셔너리 성능을 향상시키는 방법은 여러 가지가 있습니다.

- `GROUP BY` 이후에 딕셔너리를 사용하는 함수를 호출합니다.
- 추출할 속성(attribute)을 단사(injective)로 표시합니다.  
  속성이 단사라고 불리는 것은 서로 다른 키가 서로 다른 속성 값에 대응될 때입니다.  
  따라서 `GROUP BY`에서 키를 이용해 속성 값을 가져오는 함수를 사용하는 경우, 이 함수는 자동으로 `GROUP BY` 연산 밖으로 이동됩니다.

ClickHouse는 딕셔너리 관련 오류에 대해 예외를 발생시킵니다.
오류 예시는 다음과 같습니다.

- 액세스하려는 딕셔너리를 로드하지 못한 경우
- `cached` 딕셔너리에 대한 쿼리 오류

[system.dictionaries](../../../../operations/system-tables/dictionaries.md) 테이블에서 딕셔너리 목록과 해당 상태를 조회할 수 있습니다.