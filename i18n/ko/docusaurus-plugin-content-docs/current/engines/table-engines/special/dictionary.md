---
'description': '`Dictionary` 엔진은 ClickHouse 테이블로 딕셔너리 데이터를 표시합니다.'
'sidebar_label': 'Dictionary'
'sidebar_position': 20
'slug': '/engines/table-engines/special/dictionary'
'title': '딕셔너리 테이블 엔진'
'doc_type': 'reference'
---


# 딕셔너리 테이블 엔진

`Dictionary` 엔진은 [딕셔너리](../../../sql-reference/dictionaries/index.md) 데이터를 ClickHouse 테이블로 표시합니다.

## 예제 {#example}

예를 들어, 다음 구성으로 `products` 딕셔너리를 고려해 보십시오:

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

딕셔너리 데이터를 쿼리합니다:

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

이 형식으로 딕셔너리 데이터를 가져오려면 [dictGet\*](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) 함수를 사용할 수 있습니다.

이 뷰는 원시 데이터를 가져오거나 `JOIN` 작업을 수행할 때 유용하지 않습니다. 이러한 경우에는 딕셔너리 데이터를 테이블로 표시하는 `Dictionary` 엔진을 사용할 수 있습니다.

구문:

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

사용 예제:

```sql
CREATE TABLE products (product_id UInt64, title String) ENGINE = Dictionary(products);
```

      Ok

테이블에 무엇이 있는지 확인해 보세요.

```sql
SELECT * FROM products LIMIT 1;
```

```text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**참고**

- [딕셔너리 함수](/sql-reference/table-functions/dictionary)
