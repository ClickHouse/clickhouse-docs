---
'sidebar_label': 'Справочник по переводу SQL'
'slug': '/migrations/snowflake-translation-reference'
'description': 'Справочник по переводу SQL'
'keywords':
- 'Snowflake'
'title': 'Перенос из Snowflake в ClickHouse'
'show_related_blogs': true
'doc_type': 'guide'
---


# Руководство по переводу SQL Snowflake

## Типы данных {#data-types}

### Числовые типы {#numerics}

Пользователи, перемещающие данные между ClickHouse и Snowflake, сразу заметят, что 
ClickHouse предлагает более детализированную точность при объявлении числовых типов. Например,
Snowflake предлагает тип Number для чисел. Это требует от пользователя указания 
точности (общего количества цифр) и масштаба (цифры справа от запятой)
до общего количества 38. Целочисленные объявления синонимичны Number и просто 
определяют фиксированную точность и масштаб, где диапазон остается тем же. Это удобно, 
так как изменение точности (масштаб равен 0 для целых чисел) не влияет на 
размер данных на диске в Snowflake - минимально необходимые байты используются для 
числового диапазона во время записи на уровне микро-раздела. Однако масштаб 
влияет на пространство для хранения и компенсируется сжатием. Тип `Float64` предлагает 
широкий диапазон значений с потерей точности.

В отличие от этого, ClickHouse предлагает несколько знаковых и незнаковых 
точностей как для чисел с плавающей запятой, так и для целых чисел. С их помощью 
пользователи ClickHouse могут быть четкими в отношении необходимой точности 
для целых чисел, чтобы оптимизировать использование памяти и дискового пространства. 
Тип Decimal, эквивалентный типу Number в Snowflake, также предлагает в два раза 
больше точности и масштаба — до 76 цифр. В дополнение к аналогичному значению `Float64`, 
ClickHouse также предоставляет `Float32`, когда точность менее критична, а 
сжатие имеет первостепенное значение.

### Строки {#strings}

ClickHouse и Snowflake используют различные подходы к хранению строковых 
данных. `VARCHAR` в Snowflake хранит символы Unicode в UTF-8, позволяя пользователю 
указать максимальную длину. Эта длина не влияет на хранение или 
производительность, минимальное количество байтов всегда используется для хранения строки, и 
предоставляет только ограничения, полезные для инструментов нижнего уровня. Другие типы, такие 
как `Text` и `NChar`, являются просто псевдонимами для этого типа. В свою очередь, 
ClickHouse хранит все [строковые данные как необработанные байты](/sql-reference/data-types/string) 
с помощью типа `String` (без необходимости указания длины), передавая кодирование 
пользователю, с доступными [функциями времени запроса](/sql-reference/functions/string-functions#lengthutf8) 
для различных кодировок. Мы рекомендуем читателю ознакомится с ["Неявным аргументом данных"](https://utf8everywhere.org/#cookie) 
для понимания мотивации. Таким образом, `String` в ClickHouse больше сопоставим 
с типом Binary в Snowflake. Как [Snowflake](https://docs.snowflake.com/en/sql-reference/collation), 
так и [ClickHouse](/sql-reference/statements/select/order-by#collation-support) 
поддерживают "коллацию", позволяя пользователям переопределять, как строки сортируются и сравниваются.

### Полуструктурированные типы {#semi-structured-data}

Snowflake поддерживает типы `VARIANT`, `OBJECT` и `ARRAY` для полуструктурированных 
данных.

ClickHouse предлагает эквиваленты [`Variant`](/sql-reference/data-types/variant), 
`Object` (теперь устаревший в пользу нативного типа `JSON`) и [`Array`](/sql-reference/data-types/array). 
Кроме того, ClickHouse имеет тип [`JSON`](/sql-reference/data-types/newjson), 
который заменяет теперь устаревший тип `Object('json')` и особенно эффективен по 
хранилищу в [сравнении с другими нативными типами JSON](https://jsonbench.com/).

ClickHouse также поддерживает именованные [`Tuple`s](/sql-reference/data-types/tuple) и массивы кортежей 
через тип [`Nested`](/sql-reference/data-types/nested-data-structures/nested), 
позволяя пользователям явно отображать вложенные структуры. Это позволяет применять 
кодеки и оптимизации типов на всем протяжении иерархии, в отличие от Snowflake, который 
требует, чтобы пользователь использовал типы `OBJECT`, `VARIANT` и `ARRAY` для 
внешнего объекта и не позволяет [явным внутренним типам](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#characteristics-of-an-object).
Этот внутренний тип также упрощает запросы на вложенные числовые значения в ClickHouse, 
которые не нуждаются в приведении типов и могут использоваться в определениях индексов.

В ClickHouse кодеки и оптимизированные типы также могут применяться к подструктурам. 
Это предоставляет дополнительное преимущество в том, что сжатие с вложенными структурами остается 
отличным и сопоставимым с развернутыми данными. В отличие от этого, из-за 
необходимости применения конкретных типов к подструктурам, Snowflake рекомендует [разворачивать 
данные для достижения оптимального сжатия](https://docs.snowflake.com/en/user-guide/semistructured-considerations#storing-semi-structured-data-in-a-variant-column-vs-flattening-the-nested-structure).
Snowflake также [налагает ограничения на размер](https://docs.snowflake.com/en/user-guide/semistructured-considerations#data-size-limitations) 
для этих типов данных.

### Справочник типов {#type-reference}

| Snowflake                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ClickHouse                                                                                                                                                     | Примечание                                                                                                                                                                                                                                                                                                                                                                            |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`NUMBER`](https://docs.snowflake.com/en/sql-reference/data-types-numeric)                                                                                                                                                                                                                                                                                                                                                                                                      | [`Decimal`](/sql-reference/data-types/decimal)                                                                                                                 | ClickHouse поддерживает в два раза большую точность и масштаб, чем Snowflake - 76 цифр против 38.                                                                                                                                                                                                                                                                                            |
| [`FLOAT`, `FLOAT4`, `FLOAT8`](https://docs.snowflake.com/en/sql-reference/data-types-numeric#data-types-for-floating-point-numbers)                                                                                                                                                                                                                                                                                                                                             | [`Float32`, `Float64`](/sql-reference/data-types/float)                                                                                                        | Все числа с плавающей запятой в Snowflake имеют размер 64 бита.                                                                                                                                                                                                                                                                                                                                             |
| [`VARCHAR`](https://docs.snowflake.com/en/sql-reference/data-types-text#varchar)                                                                                                                                                                                                                                                                                                                                                                                                | [`String`](/sql-reference/data-types/string)                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                 |
| [`BINARY`](https://docs.snowflake.com/en/sql-reference/data-types-text#binary)                                                                                                                                                                                                                                                                                                                                                                                                  | [`String`](/sql-reference/data-types/string)                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                 |
| [`BOOLEAN`](https://docs.snowflake.com/en/sql-reference/data-types-logical)                                                                                                                                                                                                                                                                                                                                                                                                     | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                 |
| [`DATE`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#date)                                                                                                                                                                                                                                                                                                                                                                                                  | [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32)                                                                         | `DATE` в Snowflake предлагает более широкий диапазон дат, чем ClickHouse, например мин. для `Date32` — `1900-01-01`, а для `Date` — `1970-01-01`. `Date` в ClickHouse обеспечивает более экономичное (двухбайтовое) хранилище.                                                                                                                                                                              |
| [`TIME(N)`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#time)                                                                                                                                                                                                                                                                                                                                                                                               | Нет прямого аналога, но может быть представлен через [`DateTime`](/sql-reference/data-types/datetime) и [`DateTime64(N)`](/sql-reference/data-types/datetime64).   | `DateTime64` использует те же концепции точности.                                                                                                                                                                                                                                                                                                                               |
| [`TIMESTAMP`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp) - [`TIMESTAMP_LTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_NTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz), [`TIMESTAMP_TZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz) | [`DateTime`](/sql-reference/data-types/datetime) и [`DateTime64`](/sql-reference/data-types/datetime64)                                                      | `DateTime` и `DateTime64` могут дополнительно иметь параметр TZ, определенный для колонки. Если он не указан, используется временная зона сервера. Кроме того, доступен параметр `--use_client_time_zone` для клиента.                                                                                                                                                            |
| [`VARIANT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#variant)                                                                                                                                                                                                                                                                                                                                                                                      | [`JSON`, `Tuple`, `Nested`](/interfaces/formats)                                                                                                   | Тип `JSON` является экспериментальным в ClickHouse. Этот тип выводит типы колонок во время вставки. Также могут использоваться `Tuple`, `Nested` и `Array` для создания явно типизированных структур в качестве альтернативы.                                                                                                                                                                              |
| [`OBJECT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#object)                                                                                                                                                                                                                                                                                                                                                                                        | [`Tuple`, `Map`, `JSON`](/interfaces/formats)                                                                                                      | Оба `OBJECT` и `Map` аналогичны типу `JSON` в ClickHouse, где ключи имеют тип `String`. ClickHouse требует, чтобы значение было согласованным и строго типизированным, тогда как Snowflake использует `VARIANT`. Это означает, что значения разных ключей могут быть разного типа. Если это необходимо в ClickHouse, явно определите иерархию с помощью `Tuple` или полагайтесь на тип `JSON`. |
| [`ARRAY`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#array)                                                                                                                                                                                                                                                                                                                                                                                          | [`Array`](/sql-reference/data-types/array), [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                                                | `ARRAY` в Snowflake использует `VARIANT` для элементов - супертип. Напротив, эти элементы имеют строгую типизацию в ClickHouse.                                                                                                                                                                                                                                                         |
| [`GEOGRAPHY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geography-data-type)                                                                                                                                                                                                                                                                                                                                                                            | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                                    | Snowflake налагает систему координат (WGS 84), в то время как ClickHouse применяет это на этапе выполнения запроса.                                                                                                                                                                                                                                                                                          |
| [`GEOMETRY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geometry-data-type)                                                                                                                                                                                                                                                                                                                                                                              | [`Point`, `Ring`, `Polygon`, `MultiPolygon`](/sql-reference/data-types/geo)                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                                                                                                                                                      |

| Тип ClickHouse   | Описание                                                                                         |
|-------------------|-----------------------------------------------------------------------------------------------------|
| `IPv4` и `IPv6` | Специфические типы для IP, позволяющие потенциально более эффективное хранение, чем в Snowflake.                      |
| `FixedString`     | Позволяет использовать фиксированную длину байтов, что полезно для хэширования.                              |
| `LowCardinality`  | Позволяет любому типу использовать кодирование словарей. Полезно, когда ожидается кардинальность < 100k. |
| `Enum`            | Позволяет эффективно кодировать именованные значения в диапазонах 8 или 16 бит.                             |
| `UUID`            | Для эффективного хранения UUID.                                                                     |
| `Array(Float32)`  | Векторы могут быть представлены как массив Float32 с поддерживаемыми функциями расстояния.                |

Наконец, ClickHouse предлагает уникальную возможность хранить промежуточное 
[состояние агрегатных функций](/sql-reference/data-types/aggregatefunction). Это состояние 
специфично для реализации, но позволяет хранить результат агрегации и впоследствии делать 
запросы (с соответствующими функциями слияния). Обычно эта функция используется через 
материализованное представление и, как показано ниже, предлагает возможность улучшить 
производительность конкретных запросов с минимальной стоимостью хранения, храня 
постепенные результаты запросов по вставленным данным (более подробная информация здесь).
