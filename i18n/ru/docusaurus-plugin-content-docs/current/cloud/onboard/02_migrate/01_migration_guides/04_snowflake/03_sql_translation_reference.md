---
sidebar_label: 'Справочник по преобразованию SQL'
slug: /migrations/snowflake-translation-reference
description: 'Справочник по преобразованию SQL'
keywords: ['Snowflake']
title: 'Миграция с Snowflake на ClickHouse'
show_related_blogs: true
doc_type: 'guide'
---



# Руководство по преобразованию SQL из Snowflake



## Типы данных {#data-types}

### Числовые типы {#numerics}

Пользователи, переносящие данные между ClickHouse и Snowflake, сразу заметят, что
ClickHouse предлагает более детальную точность при объявлении числовых типов. Например,
Snowflake предлагает тип Number для числовых значений. Он требует от пользователя указания
точности (общего количества цифр) и масштаба (количества цифр справа от десятичной точки)
до максимального значения 38. Объявления целочисленных типов являются синонимами Number и просто
определяют фиксированную точность и масштаб с одинаковым диапазоном. Такое удобство
возможно, поскольку изменение точности (масштаб равен 0 для целых чисел) не влияет на
размер данных на диске в Snowflake — минимально необходимое количество байтов используется для
числового диапазона во время записи на уровне микроразделов. Однако масштаб
влияет на объем хранилища и компенсируется сжатием. Тип `Float64` предлагает
более широкий диапазон значений с потерей точности.

В отличие от этого, ClickHouse предлагает несколько вариантов знаковой и беззнаковой
точности для чисел с плавающей точкой и целых чисел. Благодаря этому пользователи ClickHouse могут явно указывать
требуемую точность для целых чисел, чтобы оптимизировать использование хранилища и памяти. Тип
Decimal, эквивалентный типу Number в Snowflake, также предлагает вдвое большую
точность и масштаб — 76 цифр. Помимо аналогичного типа `Float64`,
ClickHouse также предоставляет `Float32` для случаев, когда точность менее критична, а
сжатие имеет первостепенное значение.

### Строковые типы {#strings}

ClickHouse и Snowflake используют противоположные подходы к хранению строковых
данных. Тип `VARCHAR` в Snowflake содержит символы Unicode в кодировке UTF-8, позволяя
пользователю указать максимальную длину. Эта длина не влияет на хранение или
производительность, поскольку для хранения строки всегда используется минимальное количество байтов, и
скорее предоставляет только ограничения, полезные для последующих инструментов. Другие типы, такие
как `Text` и `NChar`, являются просто псевдонимами этого типа. ClickHouse, напротив,
хранит все [строковые данные как необработанные байты](/sql-reference/data-types/string) с типом `String`
(указание длины не требуется), оставляя кодирование на усмотрение пользователя, с
[функциями времени выполнения запроса](/sql-reference/functions/string-functions#lengthUTF8),
доступными для различных кодировок. Мы отсылаем читателя к ["Opaque data argument"](https://utf8everywhere.org/#cookie)
для понимания мотивации такого подхода. Таким образом, тип `String` в ClickHouse более сопоставим
с типом Binary в Snowflake по своей реализации. И [Snowflake](https://docs.snowflake.com/en/sql-reference/collation),
и [ClickHouse](/sql-reference/statements/select/order-by#collation-support)
поддерживают сортировку (collation), позволяя пользователям переопределять способ сортировки и сравнения строк.

### Полуструктурированные типы {#semi-structured-data}

Snowflake поддерживает типы `VARIANT`, `OBJECT` и `ARRAY` для полуструктурированных
данных.

ClickHouse предлагает эквивалентные типы [`Variant`](/sql-reference/data-types/variant),
`Object` (теперь устаревший в пользу нативного типа `JSON`) и [`Array`](/sql-reference/data-types/array).
Кроме того, ClickHouse имеет тип [`JSON`](/sql-reference/data-types/newjson),
который заменяет устаревший тип `Object('json')` и отличается особенно высокой
производительностью и эффективностью хранения [по сравнению с другими нативными типами JSON](https://jsonbench.com/).

ClickHouse также поддерживает именованные [`Tuple`](/sql-reference/data-types/tuple) и массивы кортежей
через тип [`Nested`](/sql-reference/data-types/nested-data-structures/nested),
позволяя пользователям явно отображать вложенные структуры. Это позволяет применять кодеки и оптимизации типов
на всех уровнях иерархии, в отличие от Snowflake, который
требует от пользователя использовать типы `OBJECT`, `VARIANT` и `ARRAY` для внешнего
объекта и не позволяет [явно указывать внутренние типы](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#characteristics-of-an-object).
Такая внутренняя типизация также упрощает запросы к вложенным числовым значениям в ClickHouse,
которые не требуют приведения типов и могут использоваться в определениях индексов.

В ClickHouse кодеки и оптимизированные типы также могут применяться к подструктурам.
Это обеспечивает дополнительное преимущество: сжатие вложенных структур остается
превосходным и сопоставимым со сжатием плоских данных. В отличие от этого, из-за
невозможности применять конкретные типы к подструктурам, Snowflake рекомендует [выравнивать
данные для достижения оптимального сжатия](https://docs.snowflake.com/en/user-guide/semistructured-considerations#storing-semi-structured-data-in-a-variant-column-vs-flattening-the-nested-structure).
Snowflake также [накладывает ограничения на размер](https://docs.snowflake.com/en/user-guide/semistructured-considerations#data-size-limitations)
этих типов данных.


### Справочник типов {#type-reference}


| Snowflake                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ClickHouse                                                                                                                                                              | Примечание                                                                                                                                                                                                                                                                                                                                                                                       |   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | - |
| [`NUMBER`](https://docs.snowflake.com/en/sql-reference/data-types-numeric)                                                                                                                                                                                                                                                                                                                                                                                                      | [`Decimal`](/sql-reference/data-types/decimal)                                                                                                                          | ClickHouse поддерживает вдвое более высокую точность и масштаб, чем Snowflake — 76 цифр против 38.                                                                                                                                                                                                                                                                                               |   |
| [`FLOAT`, `FLOAT4`, `FLOAT8`](https://docs.snowflake.com/en/sql-reference/data-types-numeric#data-types-for-floating-point-numbers)                                                                                                                                                                                                                                                                                                                                             | [`Float32`, `Float64`](/sql-reference/data-types/float)                                                                                                                 | Все числа с плавающей запятой в Snowflake — 64‑битные.                                                                                                                                                                                                                                                                                                                                           |   |
| [`VARCHAR`](https://docs.snowflake.com/en/sql-reference/data-types-text#varchar)                                                                                                                                                                                                                                                                                                                                                                                                | [`String`](/sql-reference/data-types/string)                                                                                                                            |                                                                                                                                                                                                                                                                                                                                                                                                  |   |
| [`BINARY`](https://docs.snowflake.com/en/sql-reference/data-types-text#binary)                                                                                                                                                                                                                                                                                                                                                                                                  | [`String`](/sql-reference/data-types/string)                                                                                                                            |                                                                                                                                                                                                                                                                                                                                                                                                  |   |
| [`BOOLEAN`](https://docs.snowflake.com/en/sql-reference/data-types-logical)                                                                                                                                                                                                                                                                                                                                                                                                     | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                             |                                                                                                                                                                                                                                                                                                                                                                                                  |   |
| [`DATE`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#date)                                                                                                                                                                                                                                                                                                                                                                                                  | [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32)                                                                                  | `DATE` в Snowflake поддерживает более широкий диапазон дат, чем в ClickHouse, например, минимальное значение для `Date32` — `1900-01-01`, а для `Date` — `1970-01-01`. Тип `Date` в ClickHouse обеспечивает более экономичное по объёму (двухбайтовое) хранение.                                                                                                                                 |   |
| [`TIME(N)`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#time)                                                                                                                                                                                                                                                                                                                                                                                               | Прямого эквивалента нет, но его можно представить с помощью [`DateTime`](/sql-reference/data-types/datetime) и [`DateTime64(N)`](/sql-reference/data-types/datetime64). | `DateTime64` использует те же уровни точности.                                                                                                                                                                                                                                                                                                                                                   |   |
| [`TIMESTAMP`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp) - [`TIMESTAMP_LTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_NTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_TZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz) | [`DateTime`](/sql-reference/data-types/datetime) и [`DateTime64`](/sql-reference/data-types/datetime64)                                                                 | `DateTime` и `DateTime64` могут опционально иметь параметр TZ, заданный для столбца. Если он не указан, используется часовой пояс сервера. Дополнительно для клиента доступен параметр `--use_client_time_zone`.                                                                                                                                                                                 |   |
| [`VARIANT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#variant)                                                                                                                                                                                                                                                                                                                                                                                      | [`JSON`, `Tuple`, `Nested`](/interfaces/formats)                                                                                                                        | Тип `JSON` в ClickHouse является экспериментальным. Этот тип определяет типы столбцов при вставке данных. `Tuple`, `Nested` и `Array` также могут использоваться для явного задания типизированных структур в качестве альтернативы.                                                                                                                                                             |   |
| [`OBJECT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#object)                                                                                                                                                                                                                                                                                                                                                                                        | [`Tuple`, `Map`, `JSON`](/interfaces/formats)                                                                                                                           | И `OBJECT`, и `Map` аналогичны типу `JSON` в ClickHouse, где ключи имеют тип `String`. В ClickHouse значения должны быть однородными и строго типизированными, тогда как в Snowflake используется `VARIANT`. Это означает, что значения разных ключей могут иметь разный тип. Если такая гибкость требуется в ClickHouse, явно определите иерархию с помощью `Tuple` или используйте тип `JSON`. |   |
| [`ARRAY`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#array)                                                                                                                                                                                                                                                                                                                                                                                          | [`Array`](/sql-reference/data-types/array), [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                                                         | `ARRAY` в Snowflake использует `VARIANT` для элементов — сверхтип. В отличие от этого, в ClickHouse элементы имеют строгую типизацию.                                                                                                                                                                                                                                                            |   |
| [`GEOGRAPHY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geography-data-type)                                                                                                                                                                                                                                                                                                                                                                            | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                                             | Snowflake жёстко задаёт систему координат (WGS 84), тогда как в ClickHouse она выбирается при выполнении запроса.                                                                                                                                                                                                                                                                                |   |
| [`GEOMETRY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geometry-data-type)                                                                                                                                                                                                                                                                                                                                                                              | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                                             |                                                                                                                                                                                                                                                                                                                                                                                                  |   |



| Тип ClickHouse    | Описание                                                                                             |
|-------------------|-----------------------------------------------------------------------------------------------------|
| `IPv4` and `IPv6` | Специализированные IP-типы, потенциально позволяющие более эффективное хранение, чем в Snowflake.  |
| `FixedString`     | Позволяет задать фиксированную длину строки в байтах, что полезно для хешей.                        |
| `LowCardinality`  | Позволяет выполнить словарное кодирование любого типа. Полезен, когда ожидаемая кардинальность < 100k. |
| `Enum`            | Обеспечивает эффективное кодирование именованных значений в 8- или 16-битных диапазонах.           |
| `UUID`            | Для эффективного хранения UUID.                                                                     |
| `Array(Float32)`  | Векторы могут быть представлены как массив Float32 с поддержкой функций вычисления расстояния.     |

Наконец, ClickHouse предлагает уникальную возможность хранить промежуточное 
[состояние агрегатных функций](/sql-reference/data-types/aggregatefunction). Это
состояние является специфичным для реализации, но позволяет сохранять результат агрегации и 
впоследствии запрашивать его (с использованием соответствующих функций слияния). Обычно эта 
возможность используется через материализованное представление и, как показано ниже, позволяет 
повысить производительность определённых запросов при минимальных затратах на хранение за счёт
сохранения инкрементального результата запросов по вставленным данным (подробности здесь).
