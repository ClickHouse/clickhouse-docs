---
slug: '/engines/table-engines/special/dictionary'
sidebar_label: Dictionary
sidebar_position: 20
description: 'Движок `Dictionary` отображает данные словаря как таблицу ClickHouse.'
title: 'Движок таблицы Dictionary'
doc_type: reference
---
# Движок таблицы Dictionary

Движок `Dictionary` отображает данные [словаря](../../../sql-reference/dictionaries/index.md) в виде таблицы ClickHouse.

## Пример {#example}

В качестве примера рассмотрим словарь `products` со следующей конфигурацией:

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

Запросить данные словаря:

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

Вы можете использовать функцию [dictGet\*](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull), чтобы получить данные словаря в этом формате.

Этот вид не полезен, когда необходимо получить сырые данные или при выполнении операции `JOIN`. Для этих случаев вы можете использовать движок `Dictionary`, который отображает данные словаря в таблице.

Синтаксис:

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

Пример использования:

```sql
CREATE TABLE products (product_id UInt64, title String) ENGINE = Dictionary(products);
```

      Ok

Посмотрите, что находится в таблице.

```sql
SELECT * FROM products LIMIT 1;
```

```text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**См. также**

- [Функция Dictionary](/sql-reference/table-functions/dictionary)