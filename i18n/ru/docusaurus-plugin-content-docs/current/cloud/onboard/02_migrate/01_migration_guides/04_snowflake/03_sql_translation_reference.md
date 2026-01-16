---
sidebar_label: 'Справочник по преобразованию SQL'
slug: /migrations/snowflake-translation-reference
description: 'Справочник по преобразованию SQL'
keywords: ['Snowflake']
title: 'Миграция с Snowflake на ClickHouse'
show_related_blogs: true
doc_type: 'guide'
---

# Руководство по преобразованию SQL-запросов Snowflake \\{#snowflake-sql-translation-guide\\}

## Типы данных \\{#data-types\\}

### Числовые типы \\{#numerics\\}

Пользователи, перемещающие данные между ClickHouse и Snowflake, сразу заметят, что 
ClickHouse предоставляет более тонкий контроль точности при объявлении числовых типов. Например,
Snowflake предлагает тип Number для числовых значений. Это требует от пользователя указать 
точность (общее количество цифр) и масштаб (количество цифр справа от десятичной точки)
до общего значения 38. Объявления целых чисел синонимичны Number и просто 
определяют фиксированные точность и масштаб, при которых диапазон значений тот же. Это удобно, 
поскольку изменение точности (масштаб равен 0 для целых чисел) не влияет на 
размер данных на диске в Snowflake — для числового диапазона при записи на уровне микропартиций 
используется минимально необходимое количество байт. Масштаб, однако,
влияет на объем хранения и компенсируется за счет сжатия. Тип `Float64` предоставляет 
более широкий диапазон значений ценой потери точности.

В отличие от этого, ClickHouse предлагает несколько вариантов знаковых и беззнаковых 
типов с различной точностью для чисел с плавающей запятой и целых чисел. С их помощью вы 
можете явно задавать требуемую точность для целых чисел, чтобы оптимизировать объем 
хранилища и накладные расходы по памяти. Тип `Decimal`, эквивалентный типу Number в Snowflake, также обеспечивает 
вдвое большую точность и масштаб — до 76 цифр. В дополнение к аналогичному типу `Float64` 
ClickHouse также предоставляет `Float32` для случаев, когда точность менее критична, а 
сжатие имеет первостепенное значение.

### Строки \\{#strings\\}

ClickHouse и Snowflake используют различные подходы к хранению строковых 
данных. Тип `VARCHAR` в Snowflake хранит символы Unicode в UTF-8, позволяя
пользователю задавать максимальную длину. Эта длина не влияет на объем хранения или 
производительность: для хранения строки всегда используется минимально необходимое количество байт, а
сама длина служит лишь ограничением, полезным для последующих инструментов. Другие типы, такие
как `Text` и `NChar`, являются просто псевдонимами этого типа. Напротив, ClickHouse 
хранит все [строковые данные как сырые байты](/sql-reference/data-types/string) в типе `String`
(без необходимости указывать длину), перекладывая выбор кодировки на пользователя; при этом
[функции, используемые при выполнении запросов](/sql-reference/functions/string-functions#lengthUTF8)
доступны для разных кодировок. За мотивацией такого подхода мы отсылаем читателя к разделу ["Opaque data argument"](https://utf8everywhere.org/#cookie).
Таким образом, ClickHouse `String` по своей реализации ближе 
к типу Binary в Snowflake. И [Snowflake](https://docs.snowflake.com/en/sql-reference/collation),
и [ClickHouse](/sql-reference/statements/select/order-by#collation-support) 
поддерживают колляцию (collation), позволяя пользователям переопределять,
как строки сортируются и сравниваются.

### Полуструктурированные типы \\{#semi-structured-data\\}

Snowflake поддерживает типы `VARIANT`, `OBJECT` и `ARRAY` для полуструктурированных
данных.

ClickHouse предлагает эквивалентные типы [`Variant`](/sql-reference/data-types/variant),
`Object` (в настоящее время устаревший в пользу нативного типа `JSON`) и [`Array`](/sql-reference/data-types/array).
Дополнительно в ClickHouse есть тип [`JSON`](/sql-reference/data-types/newjson), 
который заменяет теперь устаревший тип `Object('json')` и отличается высокой
производительностью и эффективным использованием хранилища [по сравнению с другими нативными типами JSON](https://jsonbench.com/).

ClickHouse также поддерживает именованные [`Tuple`](/sql-reference/data-types/tuple) и массивы кортежей
через тип [`Nested`](/sql-reference/data-types/nested-data-structures/nested),
что позволяет явно отображать вложенные структуры. Это дает возможность применять кодеки и 
оптимизации типов по всей иерархии, в отличие от Snowflake, который 
требует от пользователя использовать типы `OBJECT`, `VARIANT` и `ARRAY` для внешнего
объекта и не допускает [явной внутренней типизации](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#characteristics-of-an-object).
Такая внутренняя типизация также упрощает запросы к вложенным числовым значениям в ClickHouse, 
которые не нужно приводить к типу и которые могут использоваться в определениях индексов.

В ClickHouse кодеки и оптимизированные типы также могут применяться к подструктурам. 
Это дает дополнительное преимущество: сжатие для вложенных структур остается 
отличным и сопоставимым с «развернутыми» данными. Напротив, из-за невозможности 
применения конкретных типов к подструктурам Snowflake рекомендует [разворачивать
структуру данных для достижения оптимального сжатия](https://docs.snowflake.com/en/user-guide/semistructured-considerations#storing-semi-structured-data-in-a-variant-column-vs-flattening-the-nested-structure).
Snowflake также [накладывает ограничения по размеру](https://docs.snowflake.com/en/user-guide/semistructured-considerations#data-size-limitations)
для этих типов данных.

### Справочник типов \\{#type-reference\\}

| Snowflake                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ClickHouse                                                                                                                                                                | Примечание                                                                                                                                                                                                                                                                                                                                                                                      |   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | - |
| [`NUMBER`](https://docs.snowflake.com/en/sql-reference/data-types-numeric)                                                                                                                                                                                                                                                                                                                                                                                                      | [`Decimal`](/sql-reference/data-types/decimal)                                                                                                                            | ClickHouse поддерживает вдвое большую точность и масштаб по сравнению со Snowflake — 76 разрядов против 38.                                                                                                                                                                                                                                                                                     |   |
| [`FLOAT`, `FLOAT4`, `FLOAT8`](https://docs.snowflake.com/en/sql-reference/data-types-numeric#data-types-for-floating-point-numbers)                                                                                                                                                                                                                                                                                                                                             | [`Float32`, `Float64`](/sql-reference/data-types/float)                                                                                                                   | Все числа с плавающей запятой в Snowflake — 64-битные.                                                                                                                                                                                                                                                                                                                                          |   |
| [`VARCHAR`](https://docs.snowflake.com/en/sql-reference/data-types-text#varchar)                                                                                                                                                                                                                                                                                                                                                                                                | [`String`](/sql-reference/data-types/string)                                                                                                                              |                                                                                                                                                                                                                                                                                                                                                                                                 |   |
| [`BINARY`](https://docs.snowflake.com/en/sql-reference/data-types-text#binary)                                                                                                                                                                                                                                                                                                                                                                                                  | [`String`](/sql-reference/data-types/string)                                                                                                                              |                                                                                                                                                                                                                                                                                                                                                                                                 |   |
| [`BOOLEAN`](https://docs.snowflake.com/en/sql-reference/data-types-logical)                                                                                                                                                                                                                                                                                                                                                                                                     | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                               |                                                                                                                                                                                                                                                                                                                                                                                                 |   |
| [`DATE`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#date)                                                                                                                                                                                                                                                                                                                                                                                                  | [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32)                                                                                    | `DATE` в Snowflake поддерживает более широкий диапазон дат, чем ClickHouse, например, минимальное значение для `Date32` — `1900-01-01`, а для `Date` — `1970-01-01`. `Date` в ClickHouse обеспечивает более экономичное с точки зрения хранения (двухбайтовое) представление дат.                                                                                                               |   |
| [`TIME(N)`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#time)                                                                                                                                                                                                                                                                                                                                                                                               | Прямого аналога нет, но его можно представить с помощью типов [`DateTime`](/sql-reference/data-types/datetime) и [`DateTime64(N)`](/sql-reference/data-types/datetime64). | `DateTime64` использует те же уровни точности.                                                                                                                                                                                                                                                                                                                                                  |   |
| [`TIMESTAMP`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp) - [`TIMESTAMP_LTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_NTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_TZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz) | [`DateTime`](/sql-reference/data-types/datetime) и [`DateTime64`](/sql-reference/data-types/datetime64)                                                                   | Для столбца типов `DateTime` и `DateTime64` при необходимости можно указать параметр TZ. Если он не указан, используется часовой пояс сервера. Кроме того, для клиента доступен параметр `--use_client_time_zone`.                                                                                                                                                                              |   |
| [`VARIANT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#variant)                                                                                                                                                                                                                                                                                                                                                                                      | [`JSON`, `Tuple`, `Nested`](/interfaces/formats)                                                                                                                          | Тип `JSON` в ClickHouse является экспериментальным. Этот тип определяет типы столбцов во время вставки. В качестве альтернативы можно использовать `Tuple`, `Nested` и `Array` для построения явно типизированных структур.                                                                                                                                                                     |   |
| [`OBJECT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#object)                                                                                                                                                                                                                                                                                                                                                                                        | [`Tuple`, `Map`, `JSON`](/interfaces/formats)                                                                                                                             | И `OBJECT`, и `Map` аналогичны типу `JSON` в ClickHouse, где ключи имеют тип `String`. ClickHouse требует, чтобы значения были однородными и строго типизированными, в то время как Snowflake использует `VARIANT`. Это означает, что значения разных ключей могут иметь разный тип. Если такой подход нужен в ClickHouse, явно опишите структуру с помощью `Tuple` или используйте тип `JSON`. |   |
| [`ARRAY`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#array)                                                                                                                                                                                                                                                                                                                                                                                          | [`Array`](/sql-reference/data-types/array), [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                                                           | `ARRAY` в Snowflake хранит элементы в виде `VARIANT` — супертима. В ClickHouse, напротив, элементы строго типизированы.                                                                                                                                                                                                                                                                         |   |
| [`GEOGRAPHY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geography-data-type)                                                                                                                                                                                                                                                                                                                                                                            | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                                               | Snowflake задаёт систему координат (WGS 84), тогда как в ClickHouse она применяется только на этапе выполнения запроса.                                                                                                                                                                                                                                                                         |   |
| [`GEOMETRY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geometry-data-type)                                                                                                                                                                                                                                                                                                                                                                              | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                                               |                                                                                                                                                                                                                                                                                                                                                                                                 |   |

| Тип ClickHouse    | Описание                                                                                                   |
|-------------------|------------------------------------------------------------------------------------------------------------|
| `IPv4` and `IPv6` | Специализированные типы для IP-адресов, потенциально позволяющие более эффективное хранение, чем в Snowflake. |
| `FixedString`     | Позволяет использовать фиксированную длину в байтах, что полезно для хешей.                               |
| `LowCardinality`  | Позволяет хранить значения любого типа в словарной (dictionary) кодировке. Полезно, когда ожидаемая кардинальность &lt; 100 тыс. |
| `Enum`            | Позволяет эффективно кодировать именованные значения в 8- или 16-битных диапазонах.                       |
| `UUID`            | Для эффективного хранения UUID.                                                                           |
| `Array(Float32)`  | Векторы могут быть представлены как массив типа Array(Float32) с поддерживаемыми функциями расстояния.    |

Наконец, ClickHouse предоставляет уникальную возможность хранить промежуточное 
[состояние агрегатных функций](/sql-reference/data-types/aggregatefunction). Это
состояние является специфичным для реализации, но позволяет сохранять результат агрегации 
и в дальнейшем запрашивать его (с использованием соответствующих функций слияния). Как правило, 
эта возможность используется через материализованное представление и, как показано ниже, 
обеспечивает повышение производительности отдельных запросов при минимальных затратах на хранение 
за счёт сохранения инкрементальных результатов запросов по вставленным данным (подробнее здесь).