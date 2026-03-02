---
description: '`Dictionary` 엔진은 딕셔너리 데이터를 ClickHouse 테이블 형태로 제공합니다.'
sidebar_label: '딕셔너리'
sidebar_position: 20
slug: /engines/table-engines/special/dictionary
title: 'Dictionary 테이블 엔진'
doc_type: 'reference'
---

# 딕셔너리 테이블 엔진 \{#dictionary-table-engine\}

`Dictionary` 엔진은 [딕셔너리](../../../sql-reference/statements/create/dictionary/overview.md) 데이터를 ClickHouse 테이블 형태로 보여줍니다.

## 예시 \{#example\}

예를 들어, 다음과 같이 구성된 `products` 딕셔너리를 생각해 보십시오:

```xml
<dictionaries>
    <dictionary>
        <name>products</name>
        <source>
            <odbc>
                <table>products</table>
                <connection_string>DSN=some-db-server</connection_string>
            </odbc>
        </source>
        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>
        <layout>
            <flat/>
        </layout>
        <structure>
            <id>
                <name>product_id</name>
            </id>
            <attribute>
                <name>title</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
    </dictionary>
</dictionaries>
```

딕셔너리 데이터에 대해 쿼리를 실행합니다:

```sql
SELECT
    name,
    type,
    key,
    attribute.names,
    attribute.types,
    bytes_allocated,
    element_count,
    source
FROM system.dictionaries
WHERE name = 'products'
```

```text
┌─name─────┬─type─┬─key────┬─attribute.names─┬─attribute.types─┬─bytes_allocated─┬─element_count─┬─source──────────┐
│ products │ Flat │ UInt64 │ ['title']       │ ['String']      │        23065376 │        175032 │ ODBC: .products │
└──────────┴──────┴────────┴─────────────────┴─────────────────┴─────────────────┴───────────────┴─────────────────┘
```

이 형식으로 딕셔너리 데이터를 가져오려면 [dictGet*](/sql-reference/functions/ext-dict-functions) 함수를 사용할 수 있습니다.

이 뷰는 원시 데이터가 필요하거나 `JOIN` 연산을 수행할 때에는 그다지 유용하지 않습니다. 이런 경우에는 딕셔너리 데이터를 테이블 형태로 보여주는 `Dictionary` 엔진을 사용할 수 있습니다.

구문:

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

사용 예시:

```sql
CREATE TABLE products (product_id UInt64, title String) ENGINE = Dictionary(products);
```

좋습니다.

테이블에 어떤 데이터가 있는지 확인하십시오.

```sql
SELECT * FROM products LIMIT 1;
```

```text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**추가 참고**

* [dictionary 함수](/sql-reference/table-functions/dictionary)
