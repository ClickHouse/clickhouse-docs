---
description: 'Конфигурация ключа и атрибутов словаря'
sidebar_label: 'Атрибуты'
sidebar_position: 2
slug: /sql-reference/statements/create/dictionary/attributes
title: 'Атрибуты словаря'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';

<CloudDetails />

Секция `structure` описывает ключ словаря и поля, доступные для запросов.

Описание в формате XML:

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

Атрибуты задаются в элементах:

* `<id>` — ключевой столбец
* `<attribute>` — столбец данных: атрибутов может быть несколько.

DDL-запрос:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

Атрибуты описываются в теле запроса:

* `PRIMARY KEY` — ключевой столбец
* `AttrName AttrType` — столбец данных. Атрибутов может быть несколько.


## Ключ \{#key\}

ClickHouse поддерживает следующие типы ключей:

- Числовой ключ. `UInt64`. Задаётся в теге `<id>` или с помощью ключевого слова `PRIMARY KEY`.
- Составной ключ. Набор значений разных типов. Задаётся в теге `<key>` или с помощью ключевого слова `PRIMARY KEY`.

XML-структура может содержать либо `<id>`, либо `<key>`. DDL-запрос должен содержать ровно один `PRIMARY KEY`.

:::note
Нельзя описывать ключ как атрибут.
:::

### Числовой ключ \{#numeric-key\}

Тип: `UInt64`.

Пример конфигурации:

```xml
<id>
    <name>Id</name>
</id>
```

Поля конфигурации:

* `name` – имя столбца, содержащего ключи.

Для DDL-запроса:

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

* `PRIMARY KEY` – Имя столбца, содержащего ключи.


### Составной ключ \{#composite-key\}

Ключ может быть `tuple` из полей любых типов. [layout](./layouts/) в этом случае должен быть `complex_key_hashed` или `complex_key_cache`.

:::tip
Составной ключ может состоять из одного элемента. Например, это позволяет использовать строку в качестве ключа.
:::

Структура ключа задаётся в элементе `<key>`. Поля ключа указываются в том же формате, что и [атрибуты](#attributes) словаря. Пример:

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

или

```sql
CREATE DICTIONARY (
    field1 String,
    field2 UInt32
    ...
)
PRIMARY KEY field1, field2
...
```

В запросе к функции `dictGet*` в качестве ключа передается кортеж. Пример: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`.


## Атрибуты \{#attributes\}

Пример конфигурации:

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

или

```sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

Параметры конфигурации:


| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | Имя столбца.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Yes      |
| `type`                                               | Тип данных ClickHouse: [UInt8](../../../data-types/int-uint.md), [UInt16](../../../data-types/int-uint.md), [UInt32](../../../data-types/int-uint.md), [UInt64](../../../data-types/int-uint.md), [Int8](../../../data-types/int-uint.md), [Int16](../../../data-types/int-uint.md), [Int32](../../../data-types/int-uint.md), [Int64](../../../data-types/int-uint.md), [Float32](../../../data-types/float.md), [Float64](../../../data-types/float.md), [UUID](../../../data-types/uuid.md), [Decimal32](../../../data-types/decimal.md), [Decimal64](../../../data-types/decimal.md), [Decimal128](../../../data-types/decimal.md), [Decimal256](../../../data-types/decimal.md),[Date](../../../data-types/date.md), [Date32](../../../data-types/date32.md), [DateTime](../../../data-types/datetime.md), [DateTime64](../../../data-types/datetime64.md), [String](../../../data-types/string.md), [Array](../../../data-types/array.md).<br/>ClickHouse пытается привести значение из словаря к указанному типу данных. Например, для MySQL поле в исходной таблице MySQL может иметь тип `TEXT`, `VARCHAR` или `BLOB`, но в ClickHouse оно может быть загружено как `String`.<br/>[Nullable](../../../data-types/nullable.md) в настоящее время поддерживается для словарей [Flat](./layouts/flat), [Hashed](./layouts/hashed), [ComplexKeyHashed](./layouts/hashed#complex_key_hashed), [Direct](./layouts/direct), [ComplexKeyDirect](./layouts/direct#complex_key_direct), [RangeHashed](./layouts/range-hashed), Polygon, [Cache](./layouts/cache), [ComplexKeyCache](./layouts/cache#complex_key_cache), [SSDCache](./layouts/ssd-cache), [SSDComplexKeyCache](./layouts/ssd-cache#complex_key_ssd_cache). В словарях [IPTrie](./layouts/ip-trie) типы `Nullable` не поддерживаются. | Yes      |
| `null_value`                                         | Значение по умолчанию для несуществующего элемента.<br/>В примере это пустая строка. Значение [NULL](../../../syntax.md#null) может использоваться только для типов `Nullable` (см. предыдущую строку с описанием типов).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Yes      |
| `expression`                                         | [Выражение](../../../syntax.md#expressions), которое ClickHouse выполняет над значением.<br/>Выражением может быть имя столбца в удалённой SQL базе данных. Таким образом, вы можете использовать его для создания псевдонима для удалённого столбца.<br/><br/>Значение по умолчанию: выражение отсутствует.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | Если `true`, атрибут содержит значение родительского ключа для текущего ключа. См. [Иерархические словари](./layouts/hierarchical).<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | No       |
| `injective`                                          | Флаг, который показывает, является ли отображение `id -> attribute` [инъективным](https://en.wikipedia.org/wiki/Injective_function).<br/>Если `true`, ClickHouse может автоматически размещать запросы к инъективным словарям сразу после предложения `GROUP BY`. Обычно это значительно уменьшает количество таких запросов.<br/><br/>Значение по умолчанию: `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No       |
| `is_object_id`                                       | Флаг, который показывает, выполняется ли запрос для документа MongoDB по `ObjectID`.<br/><br/>Значение по умолчанию: `false`.