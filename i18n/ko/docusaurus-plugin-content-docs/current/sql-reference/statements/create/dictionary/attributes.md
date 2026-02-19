---
description: '딕셔너리 키 및 속성 구성'
sidebar_label: '속성'
sidebar_position: 2
slug: /sql-reference/statements/create/dictionary/attributes
title: '딕셔너리 속성'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';

<CloudDetails />

`structure` 절은 쿼리에서 사용할 수 있는 딕셔너리 키와 필드를 정의합니다.

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

속성은 다음 요소로 정의됩니다:

* `<id>` — 키 컬럼
* `<attribute>` — 데이터 컬럼: 여러 개의 속성을 가질 수 있습니다.

DDL 쿼리:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

속성은 쿼리 본문에서 정의합니다:

* `PRIMARY KEY` — 키 컬럼
* `AttrName AttrType` — 데이터 컬럼. 여러 개의 속성을 정의할 수 있습니다.


## 키 \{#key\}

ClickHouse는 다음과 같은 종류의 키를 지원합니다:

- 숫자 키(Numeric key). `UInt64`. `<id>` 태그에서 정의하거나 `PRIMARY KEY` 키워드를 사용하여 정의합니다.
- 복합 키(Composite key). 서로 다른 타입 값들로 구성된 Set입니다. `<key>` 태그에서 정의하거나 `PRIMARY KEY` 키워드를 사용하여 정의합니다.

XML 구조에는 `<id>` 또는 `<key>` 중 하나만 포함될 수 있습니다. DDL 쿼리에는 하나의 `PRIMARY KEY`만 포함되어야 합니다.

:::note
키를 속성(attribute)으로 정의해서는 안 됩니다.
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

* `PRIMARY KEY` – 키가 저장된 컬럼의 이름입니다.


### 복합 키(Composite Key) \{#composite-key\}

키는 임의 타입의 필드로 구성된 `tuple`일 수 있습니다. 이 경우 [layout](./layouts/)은 반드시 `complex_key_hashed` 또는 `complex_key_cache`여야 합니다.

:::tip
복합 키는 하나의 요소만으로도 구성될 수 있습니다. 예를 들어 문자열을 키로 사용할 수 있습니다.
:::

키 구조는 `<key>` 요소에 설정합니다. 키 필드는 딕셔너리 [속성(attributes)](#dictionary-key-and-fields)과 동일한 형식으로 지정합니다. 예:

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

`dictGet*` FUNCTION에 대한 쿼리에서는 키로서 튜플이 전달됩니다. 예를 들어 `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`와 같습니다.


## 속성 \{#attributes\}

구성 예:

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

구성 항목:


| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | 컬럼 이름입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 예       |
| `type`                                               | ClickHouse 데이터 타입: [UInt8](../../../data-types/int-uint.md), [UInt16](../../../data-types/int-uint.md), [UInt32](../../../data-types/int-uint.md), [UInt64](../../../data-types/int-uint.md), [Int8](../../../data-types/int-uint.md), [Int16](../../../data-types/int-uint.md), [Int32](../../../data-types/int-uint.md), [Int64](../../../data-types/int-uint.md), [Float32](../../../data-types/float.md), [Float64](../../../data-types/float.md), [UUID](../../../data-types/uuid.md), [Decimal32](../../../data-types/decimal.md), [Decimal64](../../../data-types/decimal.md), [Decimal128](../../../data-types/decimal.md), [Decimal256](../../../data-types/decimal.md),[Date](../../../data-types/date.md), [Date32](../../../data-types/date32.md), [DateTime](../../../data-types/datetime.md), [DateTime64](../../../data-types/datetime64.md), [String](../../../data-types/string.md), [Array](../../../data-types/array.md).<br/>ClickHouse는 딕셔너리에서 값을 가져와 지정된 데이터 타입으로 형변환하려고 시도합니다. 예를 들어 MySQL의 경우, MySQL 소스 테이블에서 필드는 `TEXT`, `VARCHAR`, `BLOB`일 수 있지만, ClickHouse에서는 `String`으로 저장될 수 있습니다.<br/>[널 허용(Nullable)](../../../data-types/nullable.md)은 현재 [Flat](./layouts/flat), [Hashed](./layouts/hashed), [ComplexKeyHashed](./layouts/hashed#complex_key_hashed), [Direct](./layouts/direct), [ComplexKeyDirect](./layouts/direct#complex_key_direct), [RangeHashed](./layouts/range-hashed), Polygon, [Cache](./layouts/cache), [ComplexKeyCache](./layouts/cache#complex_key_cache), [SSDCache](./layouts/ssd-cache), [SSDComplexKeyCache](./layouts/ssd-cache#complex_key_ssd_cache) 딕셔너리에서 지원됩니다. [IPTrie](./layouts/ip-trie) 딕셔너리에서는 `Nullable` 타입이 지원되지 않습니다. | 예       |
| `null_value`                                         | 존재하지 않는 요소에 대한 기본값입니다.<br/>예제에서는 빈 문자열입니다. [NULL](../../../syntax.md#null) 값은 `Nullable` 타입(위의 타입 설명 행 참조)에 대해서만 사용할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 예       |
| `expression`                                         | ClickHouse가 값에 대해 실행하는 [식(Expression)](../../../syntax.md#expressions)입니다.<br/>이 식은 원격 SQL 데이터베이스의 컬럼 이름일 수 있습니다. 이를 사용하여 원격 컬럼의 별칭을 만들 수 있습니다.<br/><br/>기본값: 식이 없습니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 아니요   |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true`이면, 현재 키의 부모 키 값을 포함하는 속성입니다. [계층형 딕셔너리(Hierarchical Dictionaries)](./layouts/hierarchical)를 참고하십시오.<br/><br/>기본값: `false`입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 아니요   |
| `injective`                                          | `id -> attribute` 대응이 [단사(injective)](https://en.wikipedia.org/wiki/Injective_function)인지 여부를 나타내는 플래그입니다.<br/>`true`이면, ClickHouse는 단사인 딕셔너리에 대한 요청을 `GROUP BY` 절 뒤에 자동으로 추가할 수 있습니다. 일반적으로 이러한 요청의 양을 크게 줄여 줍니다.<br/><br/>기본값: `false`입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 아니요   |
| `is_object_id`                                       | 쿼리가 MongoDB 문서에 대해 `ObjectID`로 실행되는지 여부를 나타내는 플래그입니다.<br/><br/>기본값: `false`입니다. | 아니요   |