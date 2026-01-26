---
description: 'Движок `Dictionary` отображает данные словаря в виде таблицы ClickHouse.'
sidebar_label: 'Словарь'
sidebar_position: 20
slug: /engines/table-engines/special/dictionary
title: 'Движок таблицы Dictionary'
doc_type: 'reference'
---

# Движок таблицы словаря \{#dictionary-table-engine\}

Движок `Dictionary` отображает данные [словаря](../../../sql-reference/dictionaries/index.md) как таблицу ClickHouse.

## Пример \{#example\}

Рассмотрим в качестве примера словарь `products` со следующей конфигурацией:

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

Выполните запрос к данным из словаря:

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

Вы можете использовать функции [dictGet*](/sql-reference/functions/ext-dict-functions), чтобы получить данные словаря в данном формате.

Это представление не очень удобно, когда нужно получить необработанные данные или выполнить операцию `JOIN`. В таких случаях вы можете использовать движок `Dictionary`, который отображает данные словаря в виде таблицы.

Синтаксис:

```sql
CREATE TABLE %table_name% (%fields%) engine = Dictionary(%dictionary_name%)`
```

Пример использования:

```sql
CREATE TABLE products (product_id UInt64, title String) ENGINE = Dictionary(products);
```

Хорошо

Посмотрите, что содержится в таблице.

```sql
SELECT * FROM products LIMIT 1;
```

```text
┌────product_id─┬─title───────────┐
│        152689 │ Some item       │
└───────────────┴─────────────────┘
```

**См. также**

* [Табличная функция `dictionary`](/sql-reference/table-functions/dictionary)
