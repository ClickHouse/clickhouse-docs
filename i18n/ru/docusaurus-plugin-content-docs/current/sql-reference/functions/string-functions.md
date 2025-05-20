---
description: 'Документация по функциям для работы со строками'
sidebar_label: 'Строки'
sidebar_position: 170
slug: /sql-reference/functions/string-functions
title: 'Функции для работы со строками'
---

import VersionBadge from '@theme/badges/VersionBadge';

# Функции для работы со строками

Функции для [поиска](string-search-functions.md) в строках и для [замены](string-replace-functions.md) в строках описаны отдельно.
## empty {#empty}

Проверяет, является ли входная строка пустой. Строка считается непустой, если она содержит хотя бы один байт, даже если этот байт — пробел или нулевой байт.

Функция также доступна для [массивов](/sql-reference/functions/array-functions#empty) и [UUID](uuid-functions.md#empty).

**Синтаксис**

```sql
empty(x)
```

**Аргументы**

- `x` — Входное значение. [Строка](../data-types/string.md).

**Возвращаемое значение**

- Возвращает `1` для пустой строки или `0` для непустой строки. [UInt8](../data-types/int-uint.md).

**Пример**

```sql
SELECT empty('');
```

Результат:

```result
┌─empty('')─┐
│         1 │
└───────────┘
```
## notEmpty {#notempty}

Проверяет, является ли входная строка непустой. Строка считается непустой, если она содержит хотя бы один байт, даже если этот байт — пробел или нулевой байт.

Функция также доступна для [массивов](/sql-reference/functions/array-functions#notempty) и [UUID](uuid-functions.md#notempty).

**Синтаксис**

```sql
notEmpty(x)
```

**Аргументы**

- `x` — Входное значение. [Строка](../data-types/string.md).

**Возвращаемое значение**

- Возвращает `1` для непустой строки или `0` для пустой строки. [UInt8](../data-types/int-uint.md).

**Пример**

```sql
SELECT notEmpty('text');
```

Результат:

```result
┌─notEmpty('text')─┐
│                1 │
└──────────────────┘
```
## length {#length}

Возвращает длину строки в байтах, а не в символах или кодовых точках Unicode. Функция также работает для массивов.

Псевдоним: `OCTET_LENGTH`

**Синтаксис**

```sql
length(s)
```

**Параметры**

- `s` — Входная строка или массив. [Строка](../data-types/string)/[Массив](../data-types/array).

**Возвращаемое значение**

- Длина строки или массива `s` в байтах. [UInt64](../data-types/int-uint).

**Пример**

Запрос:

```sql
SELECT length('Hello, world!');
```

Результат: 

```response
┌─length('Hello, world!')─┐
│                      13 │
└─────────────────────────┘
```

Запрос:

```sql
SELECT length([1, 2, 3, 4]);
```

Результат: 

```response
┌─length([1, 2, 3, 4])─┐
│                    4 │
└──────────────────────┘
```
## lengthUTF8 {#lengthutf8}

Возвращает длину строки в кодовых точках Unicode, а не в байтах или символах. Предполагается, что строка содержит корректно закодированный текст в UTF-8. Если это предположение нарушается, исключение не возникает, а результат остается неопределенным.

Псевдонимы:
- `CHAR_LENGTH`
- `CHARACTER_LENGTH`

**Синтаксис**

```sql
lengthUTF8(s)
```

**Параметры**

- `s` — Строка, содержащая корректно закодированный текст в UTF-8. [Строка](../data-types/string).

**Возвращаемое значение**

- Длина строки `s` в кодовых точках Unicode. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT lengthUTF8('Здравствуй, мир!');
```

Результат: 

```response
┌─lengthUTF8('Здравствуй, мир!')─┐
│                             16 │
└────────────────────────────────┘
```
## left {#left}

Возвращает подстроку строки `s` с заданным `offset`, начиная с левой стороны.

**Синтаксис**

```sql
left(s, offset)
```

**Параметры**

- `s` — Строка, из которой необходимо получить подстроку. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `offset` — Количество байт смещения. [(U)Int*](../data-types/int-uint).

**Возвращаемое значение**

- Для положительного `offset`: Подстрока `s` с `offset` байт, начиная слева.
- Для отрицательного `offset`: Подстрока `s` с `length(s) - |offset|` байт, начиная слева.
- Пустая строка, если `length` равно 0.

**Пример**

Запрос:

```sql
SELECT left('Hello', 3);
```

Результат:

```response
Hel
```

Запрос:

```sql
SELECT left('Hello', -3);
```

Результат:

```response
He
```
## leftUTF8 {#leftutf8}

Возвращает подстроку UTF-8 закодированной строки `s` с заданным `offset`, начиная слева.

**Синтаксис**

```sql
leftUTF8(s, offset)
```

**Параметры**

- `s` — UTF-8 закодированная строка, из которой необходимо получить подстроку. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `offset` — Количество байт смещения. [(U)Int*](../data-types/int-uint).

**Возвращаемое значение**

- Для положительного `offset`: Подстрока `s` с `offset` байт, начиная слева.
- Для отрицательного `offset`: Подстрока `s` с `length(s) - |offset|` байт, начиная слева.
- Пустая строка, если `length` равно 0.

**Пример**

Запрос:

```sql
SELECT leftUTF8('Привет', 4);
```

Результат:

```response
Прив
```

Запрос:

```sql
SELECT leftUTF8('Привет', -4);
```

Результат:

```response
Пр
```
## leftPad {#leftpad}

Дополняет строку слева пробелами или заданной строкой (многоразово, если необходимо) до достижения указанной `length`.

**Синтаксис**

```sql
leftPad(string, length[, pad_string])
```

Псевдоним: `LPAD`

**Аргументы**

- `string` — Входная строка, которую необходимо дополнить. [Строка](../data-types/string.md).
- `length` — Длина результирующей строки. [UInt или Int](../data-types/int-uint.md). Если значение меньше длины входной строки, то входная строка укорочена до `length` символов.
- `pad_string` — Строка, которой будет дополнена входная строка. [Строка](../data-types/string.md). Необязательно. Если не указано, то входная строка дополнится пробелами.

**Возвращаемое значение**

- Строка, дополненная слева до указанной длины. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT leftPad('abc', 7, '*'), leftPad('def', 7);
```

Результат:

```result
┌─leftPad('abc', 7, '*')─┬─leftPad('def', 7)─┐
│ ****abc                │     def           │
└────────────────────────┴───────────────────┘
```
## leftPadUTF8 {#leftpadutf8}

Дополняет строку слева пробелами или заданной строкой (многоразово, если необходимо) до достижения указанной длины. В отличие от [leftPad](#leftpad), который измеряет длину строки в байтах, длина строки измеряется в кодовых точках.

**Синтаксис**

```sql
leftPadUTF8(string, length[, pad_string])
```

**Аргументы**

- `string` — Входная строка, которую необходимо дополнить. [Строка](../data-types/string.md).
- `length` — Длина результирующей строки. [UInt или Int](../data-types/int-uint.md). Если значение меньше длины входной строки, то входная строка укорочена до `length` символов.
- `pad_string` — Строка, которой будет дополнена входная строка. [Строка](../data-types/string.md). Необязательно. Если не указано, то входная строка дополнится пробелами.

**Возвращаемое значение**

- Строка, дополненная слева до указанной длины. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT leftPadUTF8('абвг', 7, '*'), leftPadUTF8('дежз', 7);
```

Результат:

```result
┌─leftPadUTF8('абвг', 7, '*')─┬─leftPadUTF8('дежз', 7)─┐
│ ***абвг                     │    дежз                │
└─────────────────────────────┴────────────────────────┘
```
## right {#right}

Возвращает подстроку строки `s` с заданным `offset`, начиная с правой стороны.

**Синтаксис**

```sql
right(s, offset)
```

**Параметры**

- `s` — Строка, из которой необходимо получить подстроку. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `offset` — Количество байт смещения. [(U)Int*](../data-types/int-uint).

**Возвращаемое значение**

- Для положительного `offset`: Подстрока `s` с `offset` байт, начиная с правой стороны.
- Для отрицательного `offset`: Подстрока `s` с `length(s) - |offset|` байт, начиная с правой стороны.
- Пустая строка, если `length` равно 0.

**Пример**

Запрос:

```sql
SELECT right('Hello', 3);
```

Результат:

```response
llo
```

Запрос:

```sql
SELECT right('Hello', -3);
```

Результат:

```response
lo
```
## rightUTF8 {#rightutf8}

Возвращает подстроку UTF-8 закодированной строки `s` с заданным `offset`, начиная с правой стороны.

**Синтаксис**

```sql
rightUTF8(s, offset)
```

**Параметры**

- `s` — UTF-8 закодированная строка, из которой необходимо получить подстроку. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `offset` — Количество байт смещения. [(U)Int*](../data-types/int-uint).

**Возвращаемое значение**

- Для положительного `offset`: Подстрока `s` с `offset` байт, начиная с правой стороны.
- Для отрицательного `offset`: Подстрока `s` с `length(s) - |offset|` байт, начиная с правой стороны.
- Пустая строка, если `length` равно 0.

**Пример**

Запрос:

```sql
SELECT rightUTF8('Привет', 4);
```

Результат:

```response
ивет
```

Запрос:

```sql
SELECT rightUTF8('Привет', -4);
```

Результат:

```response
ет
```
## rightPad {#rightpad}

Дополняет строку справа пробелами или заданной строкой (многоразово, если необходимо) до достижения указанной `length`.

**Синтаксис**

```sql
rightPad(string, length[, pad_string])
```

Псевдоним: `RPAD`

**Аргументы**

- `string` — Входная строка, которую необходимо дополнить. [Строка](../data-types/string.md).
- `length` — Длина результирующей строки. [UInt или Int](../data-types/int-uint.md). Если значение меньше длины входной строки, то входная строка укорочена до `length` символов.
- `pad_string` — Строка, которой будет дополнена входная строка. [Строка](../data-types/string.md). Необязательно. Если не указано, то входная строка дополнится пробелами.

**Возвращаемое значение**

- Строка, дополненная справа до указанной длины. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT rightPad('abc', 7, '*'), rightPad('abc', 7);
```

Результат:

```result
┌─rightPad('abc', 7, '*')─┬─rightPad('abc', 7)─┐
│ abc****                 │ abc                │
└─────────────────────────┴────────────────────┘
```
## rightPadUTF8 {#rightpadutf8}

Дополняет строку справа пробелами или заданной строкой (многоразово, если необходимо) до достижения указанной длины. В отличие от [rightPad](#rightpad), который измеряет длину строки в байтах, длина строки измеряется в кодовых точках.

**Синтаксис**

```sql
rightPadUTF8(string, length[, pad_string])
```

**Аргументы**

- `string` — Входная строка, которую необходимо дополнить. [Строка](../data-types/string.md).
- `length` — Длина результирующей строки. [UInt или Int](../data-types/int-uint.md). Если значение меньше длины входной строки, то входная строка укорочена до `length` символов.
- `pad_string` — Строка, которой будет дополнена входная строка. [Строка](../data-types/string.md). Необязательно. Если не указано, то входная строка дополнится пробелами.

**Возвращаемое значение**

- Строка, дополненная справа до указанной длины. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT rightPadUTF8('абвг', 7, '*'), rightPadUTF8('абвг', 7);
```

Результат:

```result
┌─rightPadUTF8('абвг', 7, '*')─┬─rightPadUTF8('абвг', 7)─┐
│ абвг***                      │ абвг                    │
└──────────────────────────────┴─────────────────────────┘
```
## compareSubstrings {#comparesubstrings}

Сравнивает две строки лексикографически.

**Синтаксис**

```sql
compareSubstrings(string1, string2, string1_offset, string2_offset, num_bytes);
```

**Аргументы**

- `string1` — Первая строка для сравнения. [Строка](../data-types/string.md)
- `string2` - Вторая строка для сравнения. [Строка](../data-types/string.md)
- `string1_offset` — Позиция (с нуля) в `string1`, с которой начинается сравнение. [UInt*](../data-types/int-uint.md).
- `string2_offset` — Позиция (индекс с нуля) в `string2`, с которой начинается сравнение. [UInt*](../data-types/int-uint.md).
- `num_bytes` — Максимальное количество байт для сравнения в обеих строках. Если `string_offset` + `num_bytes` превышает конец входной строки, `num_bytes` будет сокращено соответственно. [UInt*](../data-types/int-uint.md).

**Возвращаемое значение**

- -1 — Если `string1`[`string1_offset` : `string1_offset` + `num_bytes`] < `string2`[`string2_offset` : `string2_offset` + `num_bytes`].
- 0 — Если `string1`[`string1_offset` : `string1_offset` + `num_bytes`] = `string2`[`string2_offset` : `string2_offset` + `num_bytes`].
- 1 — Если `string1`[`string1_offset` : `string1_offset` + `num_bytes`] > `string2`[`string2_offset` : `string2_offset` + `num_bytes`].

**Пример**

Запрос:

```sql
SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result,
```

Результат:

```result
┌─result─┐
│      0 │
└────────┘
```
## lower {#lower}

Преобразует символы ASCII латинского алфавита в строке в нижний регистр.

**Синтаксис**

```sql
lower(input)
```

Псевдоним: `lcase`

**Параметры**

- `input`: Строка типа [Строка](../data-types/string.md).

**Возвращаемое значение**

- Значение типа [Строка](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT lower('CLICKHOUSE');
```

```response
┌─lower('CLICKHOUSE')─┐
│ clickhouse          │
└─────────────────────┘
```
## upper {#upper}

Преобразует символы ASCII латинского алфавита в строке в верхний регистр.

**Синтаксис**

```sql
upper(input)
```

Псевдоним: `ucase`

**Параметры**

- `input` — Строка типа [Строка](../data-types/string.md).

**Возвращаемое значение**

- Значение типа [Строка](../data-types/string.md).

**Примеры**

Запрос:

```sql
SELECT upper('clickhouse');
```

```response
┌─upper('clickhouse')─┐
│ CLICKHOUSE          │
└─────────────────────┘
```
## lowerUTF8 {#lowerutf8}

Преобразует строку в нижний регистр, предполагая, что строка содержит корректно закодированный текст в UTF-8. Если это предположение нарушается, исключение не возникает, а результат остается неопределенным.

:::note
Не определяет язык, например, для турецкого результат может быть не совсем корректным (i/İ против i/I). Если длина байтовой последовательности UTF-8 различна для верхнего и нижнего регистра кодовой точки (таких как `ẞ` и `ß`), результат может быть некорректным для этой кодовой точки.
:::

**Синтаксис**

```sql
lowerUTF8(input)
```

**Параметры**

- `input` — Строка типа [Строка](../data-types/string.md).

**Возвращаемое значение**

- Значение типа [Строка](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT lowerUTF8('MÜNCHEN') as Lowerutf8;
```

Результат:

```response
┌─Lowerutf8─┐
│ münchen   │
└───────────┘
```
## upperUTF8 {#upperutf8}

Преобразует строку в верхний регистр, предполагая, что строка содержит корректно закодированный текст в UTF-8. Если это предположение нарушается, исключение не возникает, а результат остается неопределенным.

:::note
Не определяет язык, например, для турецкого результат может быть не совсем корректным (i/İ против i/I). Если длина байтовой последовательности UTF-8 различна для верхнего и нижнего регистра кодовой точки (таких как `ẞ` и `ß`), результат может быть некорректным для этой кодовой точки.
:::

**Синтаксис**

```sql
upperUTF8(input)
```

**Параметры**

- `input` — Строка типа [Строка](../data-types/string.md).

**Возвращаемое значение**

- Значение типа [Строка](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT upperUTF8('München') as Upperutf8;
```

Результат:

```response
┌─Upperutf8─┐
│ MÜNCHEN   │
└───────────┘
```
## isValidUTF8 {#isvalidutf8}

Возвращает 1, если набор байтов является корректно закодированным текстом в UTF-8, иначе 0.

**Синтаксис**

```sql
isValidUTF8(input)
```

**Параметры**

- `input` — Строка типа [Строка](../data-types/string.md).

**Возвращаемое значение**

- Возвращает `1`, если набор байтов является корректно закодированным текстом в UTF-8, иначе `0`.

Запрос:

```sql
SELECT isValidUTF8('\xc3\xb1') AS valid, isValidUTF8('\xc3\x28') AS invalid;
```

Результат:

```response
┌─valid─┬─invalid─┐
│     1 │       0 │
└───────┴─────────┘
```
## toValidUTF8 {#tovalidutf8}

Заменяет некорректные символы UTF-8 символом `�` (U+FFFD). Все подряд идущие некорректные символы объединяются в один заменяющий символ.

**Синтаксис**

```sql
toValidUTF8(input_string)
```

**Аргументы**

- `input_string` — Любой набор байтов, представленный в виде объекта [Строка](../data-types/string.md).

**Возвращаемое значение**

- Корректная строка UTF-8.

**Пример**

```sql
SELECT toValidUTF8('\x61\xF0\x80\x80\x80b');
```

```result
┌─toValidUTF8('a����b')─┐
│ a�b                   │
└───────────────────────┘
```
## repeat {#repeat}

Конкатенирует строку столько раз, сколько указано.

**Синтаксис**

```sql
repeat(s, n)
```

Псевдоним: `REPEAT`

**Аргументы**

- `s` — Строка для повторения. [Строка](../data-types/string.md).
- `n` — Количество раз для повторения строки. [UInt* или Int*](../data-types/int-uint.md).

**Возвращаемое значение**

Строка, содержащая строку `s`, повторенную `n` раз. Если `n` &lt;= 0, функция возвращает пустую строку. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT repeat('abc', 10);
```

Результат:

```result
┌─repeat('abc', 10)──────────────┐
│ abcabcabcabcabcabcabcabcabcabc │
└────────────────────────────────┘
```
## space {#space}

Конкатенирует пробел (` `) столько раз, сколько указано.

**Синтаксис**

```sql
space(n)
```

Псевдоним: `SPACE`.

**Аргументы**

- `n` — Количество раз для повторения пробела. [UInt* или Int*](../data-types/int-uint.md).

**Возвращаемое значение**

Строка, содержащая пробел ` `, повторенный `n` раз. Если `n` &lt;= 0, функция возвращает пустую строку. [Строка](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT space(3);
```

Результат:

```text
┌─space(3) ────┐
│              │
└──────────────┘
```
## reverse {#reverse}

Инвертирует последовательность байтов в строке.
## reverseUTF8 {#reverseutf8}

Инвертирует последовательность кодовых точек Unicode в строке. Предполагается, что строка содержит корректно закодированный текст в UTF-8. Если это предположение нарушается, исключение не возникает, а результат остается неопределенным.
## concat {#concat}

Конкатенирует заданные аргументы.

**Синтаксис**

```sql
concat(s1, s2, ...)
```

**Аргументы**

Значения произвольного типа.

Аргументы, которые не являются типами [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md), преобразуются в строки с использованием их стандартной сериализации. Поскольку это снижает производительность, не рекомендуется использовать аргументы, отличные от String/FixedString.

**Возвращаемые значения**

Строка, созданная путем конкатенации аргументов.

Если какое-либо из аргументов равно `NULL`, функция возвращает `NULL`.

**Пример**

Запрос:

```sql
SELECT concat('Hello, ', 'World!');
```

Результат:

```result
┌─concat('Hello, ', 'World!')─┐
│ Hello, World!               │
└─────────────────────────────┘
```

Запрос:

```sql
SELECT concat(42, 144);
```

Результат:

```result
┌─concat(42, 144)─┐
│ 42144           │
└─────────────────┘
```

:::note `||` оператор
Используйте оператор || для конкатенации строк как более лаконичную альтернативу `concat()`. Например, `'Hello, ' || 'World!'` эквивалентно `concat('Hello, ', 'World!')`.
:::
## concatAssumeInjective {#concatassumeinjective}

Как [concat](#concat), но предполагает, что `concat(s1, s2, ...) → sn` является инъективной. Может быть использован для оптимизации GROUP BY.

Функция называется инъективной, если она возвращает для различных аргументов различные результаты. Другими словами: различные аргументы никогда не приводят к идентичному результату.

**Синтаксис**

```sql
concatAssumeInjective(s1, s2, ...)
```

**Аргументы**

Значения типа String или FixedString.

**Возвращаемые значения**

Строка, созданная путем конкатенации аргументов.

Если какое-либо из значений аргументов равно `NULL`, функция возвращает `NULL`.

**Пример**

Входная таблица:

```sql
CREATE TABLE key_val(`key1` String, `key2` String, `value` UInt32) ENGINE = TinyLog;
INSERT INTO key_val VALUES ('Hello, ','World',1), ('Hello, ','World',2), ('Hello, ','World!',3), ('Hello',', World!',2);
SELECT * from key_val;
```

```result
┌─key1────┬─key2─────┬─value─┐
│ Hello,  │ World    │     1 │
│ Hello,  │ World    │     2 │
│ Hello,  │ World!   │     3 │
│ Hello   │ , World! │     2 │
└─────────┴──────────┴───────┘
```

```sql
SELECT concat(key1, key2), sum(value) FROM key_val GROUP BY concatAssumeInjective(key1, key2);
```

Результат:

```result
┌─concat(key1, key2)─┬─sum(value)─┐
│ Hello, World!      │          3 │
│ Hello, World!      │          2 │
│ Hello, World       │          3 │
└────────────────────┴────────────┘
```
## concatWithSeparator {#concatwithseparator}

Конкатенирует заданные строки с заданным разделителем.

**Синтаксис**

```sql
concatWithSeparator(sep, expr1, expr2, expr3...)
```

Псевдоним: `concat_ws`

**Аргументы**

- sep — разделитель. Конст [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- exprN — выражение для конкатенации. Аргументы, которые не являются типами [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md), преобразуются в строки с использованием их стандартной сериализации. Поскольку это снижает производительность, не рекомендуется использовать аргументы, отличные от String/FixedString.

**Возвращаемые значения**

Строка, созданная путем конкатенации аргументов.

Если какое-либо из значений аргументов равно `NULL`, функция возвращает `NULL`.

**Пример**

```sql
SELECT concatWithSeparator('a', '1', '2', '3', '4')
```

Результат:

```result
┌─concatWithSeparator('a', '1', '2', '3', '4')─┐
│ 1a2a3a4                                      │
└──────────────────────────────────────────────┘
```
## concatWithSeparatorAssumeInjective {#concatwithseparatorassumeinjective}

Как `concatWithSeparator`, но предполагает, что `concatWithSeparator(sep, expr1, expr2, expr3...) → result` является инъективной. Может быть использован для оптимизации GROUP BY.

Функция называется инъективной, если она возвращает для различных аргументов различные результаты. Другими словами: различные аргументы никогда не приводят к идентичному результату.
## substring {#substring}

Возвращает подстроку строки `s`, которая начинается с указанного байтового индекса `offset`. Подсчет байтов начинается с 1. Если `offset` равен 0, возвращается пустая строка. Если `offset` отрицателен, подстрока начинается с `pos` символов от конца строки, а не с начала. Необязательный аргумент `length` указывает максимальное количество байтов, которое может иметь возвращаемая подстрока.

**Синтаксис**

```sql
substring(s, offset[, length])
```

Псевдонимы:
- `substr`
- `mid`
- `byteSlice`

**Аргументы**

- `s` — Строка, из которой необходимо получить подстроку. [Строка](../data-types/string.md), [FixedString](../data-types/fixedstring.md) или [Enum](../data-types/enum.md)
- `offset` — Начальная позиция подстроки в `s`. [(U)Int*](../data-types/int-uint.md).
- `length` — Максимальная длина подстроки. [(U)Int*](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

Подстрока строки `s` с длиной `length`, начиная с индекса `offset`. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT 'database' AS db, substr(db, 5), substr(db, 5, 1)
```

Результат:

```result
┌─db───────┬─substring('database', 5)─┬─substring('database', 5, 1)─┐
│ database │ base                     │ b                           │
└──────────┴──────────────────────────┴─────────────────────────────┘
```
## substringUTF8 {#substringutf8}

Возвращает подстроку строки `s`, которая начинается с указанного байтового индекса `offset` для кодовых точек Unicode. Подсчет байтов начинается с 1. Если `offset` равен 0, возвращается пустая строка. Если `offset` отрицателен, подстрока начинается с `pos` символов от конца строки, а не с начала. Необязательный аргумент `length` указывает максимальное количество байтов, которое может иметь возвращаемая подстрока.

Предполагается, что строка содержит корректно закодированный текст в UTF-8. Если это предположение нарушается, исключение не возникает, а результат остается неопределенным.

**Синтаксис**

```sql
substringUTF8(s, offset[, length])
```

**Аргументы**

- `s` — Строка, из которой необходимо получить подстроку. [Строка](../data-types/string.md), [FixedString](../data-types/fixedstring.md) или [Enum](../data-types/enum.md)
- `offset` — Начальная позиция подстроки в `s`. [(U)Int*](../data-types/int-uint.md).
- `length` — Максимальная длина подстроки. [(U)Int*](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

Подстрока строки `s` с длиной `length`, начиная с индекса `offset`.

**Детали реализации**

Предполагается, что строка содержит корректно закодированный текст в UTF-8. Если это предположение нарушается, исключение не возникает, а результат остается неопределенным.

**Пример**

```sql
SELECT 'Täglich grüßt das Murmeltier.' AS str,
       substringUTF8(str, 9),
       substringUTF8(str, 9, 5)
```

```response
Täglich grüßt das Murmeltier.    grüßt das Murmeltier.    grüßt
```
## substringIndex {#substringindex}

Возвращает подстроку `s` до `count` вхождений разделителя `delim`, как в Spark или MySQL.

**Синтаксис**

```sql
substringIndex(s, delim, count)
```
Псевдоним: `SUBSTRING_INDEX`


**Аргументы**

- s — Строка, из которой необходимо извлечь подстроку. [Строка](../data-types/string.md).
- delim — Символ для разделения. [Строка](../data-types/string.md).
- count — Количество вхождений разделителя для подсчета до извлечения подстроки. Если count положительное, возвращается все слева от последнего разделителя (подсчет идет слева). Если count отрицательное, возвращается все справа от последнего разделителя (подсчет идет справа). [UInt или Int](../data-types/int-uint.md)

**Пример**

```sql
SELECT substringIndex('www.clickhouse.com', '.', 2)
```

Результат:
```sql
┌─substringIndex('www.clickhouse.com', '.', 2)─┐
│ www.clickhouse                               │
└──────────────────────────────────────────────┘
```
## substringIndexUTF8 {#substringindexutf8}

Возвращает подстроку `s` до `count` вхождений разделителя `delim`, специально для кодовых точек Unicode.

Предполагается, что строка содержит корректно закодированный текст в UTF-8. Если это предположение нарушается, исключение не возникает, а результат остается неопределенным.

**Синтаксис**

```sql
substringIndexUTF8(s, delim, count)
```

**Аргументы**

- `s` — Строка, из которой необходимо извлечь подстроку. [Строка](../data-types/string.md).
- `delim` — Символ для разделения. [Строка](../data-types/string.md).
- `count` — Количество вхождений разделителя для подсчета до извлечения подстроки. Если count положительное, возвращается все слева от последнего разделителя (подсчет идет слева). Если count отрицательное, возвращается все справа от последнего разделителя (подсчет идет справа). [UInt или Int](../data-types/int-uint.md)

**Возвращаемое значение**

Подстрока [Строка](../data-types/string.md) `s` до `count` вхождений `delim`.

**Детали реализации**

Предполагается, что строка содержит корректно закодированный текст в UTF-8. Если это предположение нарушается, исключение не возникает, а результат остается неопределенным.

**Пример**

```sql
SELECT substringIndexUTF8('www.straßen-in-europa.de', '.', 2)
```

```response
www.straßen-in-europa
```
## appendTrailingCharIfAbsent {#appendtrailingcharifabsent}

Добавляет символ `c` в строку `s`, если `s` непустая и не заканчивается на `c`.

**Синтаксис**

```sql
appendTrailingCharIfAbsent(s, c)
```
## convertCharset {#convertcharset}

Возвращает строку `s`, преобразованную из кодировки `from` в кодировку `to`.

**Синтаксис**

```sql
convertCharset(s, from, to)
```
## base32Encode {#base32encode}

Кодирует строку с использованием [Base32](https://datatracker.ietf.org/doc/html/rfc4648#section-6).

**Синтаксис**

```sql
base32Encode(plaintext)
```

**Аргументы**

- `plaintext` — [Строка](../data-types/string.md) столбец или константа.

**Возвращаемое значение**

- Строка, содержащая закодированное значение аргумента. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).

**Пример**

```sql
SELECT base32Encode('Encoded');
```

Результат:

```result
┌─base32Encode('Encoded')─┐
│ IVXGG33EMVSA====        │
└─────────────────────────┘
```
## base32Decode {#base32decode}

Принимает строку и декодирует ее с использованием схемы кодирования [Base32](https://datatracker.ietf.org/doc/html/rfc4648#section-6).

**Синтаксис**

```sql
base32Decode(encoded)
```

**Аргументы**

- `encoded` — [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md). Если строка не является корректным Base32 закодированным значением, возникает исключение.

**Возвращаемое значение**

- Строка, содержащая декодированное значение аргумента. [Строка](../data-types/string.md).

**Пример**

```sql
SELECT base32Decode('IVXGG33EMVSA====');
```

Результат:

```result
┌─base32Decode('IVXGG33EMVSA====')─┐
│ Encoded                          │
└──────────────────────────────────┘
```
## tryBase32Decode {#trybase32decode}

Как `base32Decode`, но возвращает пустую строку в случае ошибки.

**Синтаксис**

```sql
tryBase32Decode(encoded)
```

**Параметры**

- `encoded`: [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md). Если строка не является корректным Base32 закодированным значением, возвращает пустую строку в случае ошибки.

**Возвращаемое значение**

- Строка, содержащая декодированное значение аргумента.

**Примеры**

Запрос:

```sql
SELECT tryBase32Decode('IVXGG33EMVSA====') as res, tryBase32Decode('invalid') as res_invalid;
```

```response
┌─res─────┬─res_invalid─┐
│ Encoded │             │
└─────────┴─────────────┘
```
## base58Encode {#base58encode}

Кодирует строку с использованием [Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58) в алфавите "Bitcoin".

**Синтаксис**

```sql
base58Encode(plaintext)
```

**Аргументы**

- `plaintext` — [Строка](../data-types/string.md) столбец или константа.

**Возвращаемое значение**

- Строка, содержащая закодированное значение аргумента. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).

**Пример**

```sql
SELECT base58Encode('Encoded');
```

Результат:

```result
┌─base58Encode('Encoded')─┐
│ 3dc8KtHrwM              │
└─────────────────────────┘
```

## base58Decode {#base58decode}

Принимает строку и декодирует её с использованием схемы кодирования [Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58) с использованием алфавита "Bitcoin".

**Синтаксис**

```sql
base58Decode(encoded)
```

**Аргументы**

- `encoded` — [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md). Если строка не является допустимым значением, закодированным в Base58, выбрасывается исключение.

**Возвращаемое значение**

- Строка, содержащая декодированное значение аргумента. [String](../data-types/string.md).

**Пример**

```sql
SELECT base58Decode('3dc8KtHrwM');
```

Результат:

```result
┌─base58Decode('3dc8KtHrwM')─┐
│ Encoded                    │
└────────────────────────────┘
```
## tryBase58Decode {#trybase58decode}

Как `base58Decode`, но возвращает пустую строку в случае ошибки.

**Синтаксис**

```sql
tryBase58Decode(encoded)
```

**Параметры**

- `encoded`: [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md). Если строка не является допустимым значением, закодированным в Base58, возвращает пустую строку в случае ошибки.

**Возвращаемое значение**

- Строка, содержащая декодированное значение аргумента.

**Примеры**

Запрос:

```sql
SELECT tryBase58Decode('3dc8KtHrwM') as res, tryBase58Decode('invalid') as res_invalid;
```

```response
┌─res─────┬─res_invalid─┐
│ Encoded │             │
└─────────┴─────────────┘
```
## base64Encode {#base64encode}

Кодирует String или FixedString в формат base64 в соответствии с [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4).

Псевдоним: `TO_BASE64`.

**Синтаксис**

```sql
base64Encode(plaintext)
```

**Аргументы**

- `plaintext` — колонка [String](../data-types/string.md) или константа.

**Возвращаемое значение**

- Строка, содержащая закодированное значение аргумента.

**Пример**

```sql
SELECT base64Encode('clickhouse');
```

Результат:

```result
┌─base64Encode('clickhouse')─┐
│ Y2xpY2tob3VzZQ==           │
└────────────────────────────┘
```
## base64URLEncode {#base64urlencode}

Кодирует URL (String или FixedString) в формат base64 с модификациями, специфичными для URL, в соответствии с [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5).

**Синтаксис**

```sql
base64URLEncode(url)
```

**Аргументы**

- `url` — колонка [String](../data-types/string.md) или константа.

**Возвращаемое значение**

- Строка, содержащая закодированное значение аргумента.

**Пример**

```sql
SELECT base64URLEncode('https://clickhouse.com');
```

Результат:

```result
┌─base64URLEncode('https://clickhouse.com')─┐
│ aHR0cDovL2NsaWNraG91c2UuY29t              │
└───────────────────────────────────────────┘
```
## base64Decode {#base64decode}

Принимает строку и декодирует её из base64 в соответствии с [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4). Выбрасывает исключение в случае ошибки.

Псевдоним: `FROM_BASE64`.

**Синтаксис**

```sql
base64Decode(encoded)
```

**Аргументы**

- `encoded` — колонка [String](../data-types/string.md) или константа. Если строка не является допустимым значением, закодированным в Base64, выбрасывается исключение.

**Возвращаемое значение**

- Строка, содержащая декодированное значение аргумента.

**Пример**

```sql
SELECT base64Decode('Y2xpY2tob3VzZQ==');
```

Результат:

```result
┌─base64Decode('Y2xpY2tob3VzZQ==')─┐
│ clickhouse                       │
└──────────────────────────────────┘
```
## base64URLDecode {#base64urldecode}

Принимает строку, закодированную в формате base64, и декодирует её из base64 с модификациями, специфичными для URL, в соответствии с [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5). Выбрасывает исключение в случае ошибки.

**Синтаксис**

```sql
base64URLDecode(encodedUrl)
```

**Аргументы**

- `encodedURL` — колонка [String](../data-types/string.md) или константа. Если строка не является допустимым значением, закодированным в Base64 с модификациями для URL, выбрасывается исключение.

**Возвращаемое значение**

- Строка, содержащая декодированное значение аргумента.

**Пример**

```sql
SELECT base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t');
```

Результат:

```result
┌─base64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t')─┐
│ https://clickhouse.com                          │
└─────────────────────────────────────────────────┘
```
## tryBase64Decode {#trybase64decode}

Как `base64Decode`, но возвращает пустую строку в случае ошибки.

**Синтаксис**

```sql
tryBase64Decode(encoded)
```

**Аргументы**

- `encoded` — колонка [String](../data-types/string.md) или константа. Если строка не является допустимым значением, закодированным в Base64, возвращает пустую строку.

**Возвращаемое значение**

- Строка, содержащая декодированное значение аргумента.

**Примеры**

Запрос:

```sql
SELECT tryBase64Decode('RW5jb2RlZA==') as res, tryBase64Decode('invalid') as res_invalid;
```

```response
┌─res────────┬─res_invalid─┐
│ clickhouse │             │
└────────────┴─────────────┘
```
## tryBase64URLDecode {#trybase64urldecode}

Как `base64URLDecode`, но возвращает пустую строку в случае ошибки.

**Синтаксис**

```sql
tryBase64URLDecode(encodedUrl)
```

**Параметры**

- `encodedURL` — колонка [String](../data-types/string.md) или константа. Если строка не является допустимым значением, закодированным в Base64 с модификациями для URL, возвращает пустую строку.

**Возвращаемое значение**

- Строка, содержащая декодированное значение аргумента.

**Примеры**

Запрос:

```sql
SELECT tryBase64URLDecode('aHR0cDovL2NsaWNraG91c2UuY29t') as res, tryBase64Decode('aHR0cHM6Ly9jbGlja') as res_invalid;
```

```response
┌─res────────────────────┬─res_invalid─┐
│ https://clickhouse.com │             │
└────────────────────────┴─────────────┘
```
## endsWith {#endswith}

Возвращает, заканчивается ли строка `str` на `suffix`.

**Синтаксис**

```sql
endsWith(str, suffix)
```
## endsWithUTF8 {#endswithutf8}

Возвращает, заканчивается ли строка `str` на `suffix`. Разница между `endsWithUTF8` и `endsWith` в том, что `endsWithUTF8` сопоставляет `str` и `suffix` по символам UTF-8.

**Синтаксис**

```sql
endsWithUTF8(str, suffix)
```

**Пример**

```sql
SELECT endsWithUTF8('中国', '\xbd'), endsWith('中国', '\xbd')
```

Результат:

```result
┌─endsWithUTF8('中国', '½')─┬─endsWith('中国', '½')─┐
│                        0 │                    1 │
└──────────────────────────┴──────────────────────┘
```
## startsWith {#startswith}

Возвращает, начинается ли строка `str` на `prefix`.

**Синтаксис**

```sql
startsWith(str, prefix)
```

**Пример**

```sql
SELECT startsWith('Spider-Man', 'Spi');
```
## startsWithUTF8 {#startswithutf8}

<VersionBadge minVersion='23.8' />

Возвращает, начинается ли строка `str` на `prefix`. Разница между `startsWithUTF8` и `startsWith` в том, что `startsWithUTF8` сопоставляет `str` и `suffix` по символам UTF-8.

**Пример**

```sql
SELECT startsWithUTF8('中国', '\xe4'), startsWith('中国', '\xe4')
```

Результат:

```result
┌─startsWithUTF8('中国', '⥩─┬─startsWith('中国', '⥩─┐
│                          0 │                      1 │
└────────────────────────────┴────────────────────────┘
```
## trim {#trim}

Убирает указанные символы из начала или конца строки. Если не указано иное, функция удаляет пробелы (ASCII-символ 32).

**Синтаксис**

```sql
trim([[LEADING|TRAILING|BOTH] trim_character FROM] input_string)
```

**Аргументы**

- `trim_character` — Символы для обрезки. [String](../data-types/string.md).
- `input_string` — Строка для обрезки. [String](../data-types/string.md).

**Возвращаемое значение**

Строка без начальных и/или конечных указанных символов. [String](../data-types/string.md).

**Пример**

```sql
SELECT trim(BOTH ' ()' FROM '(   Hello, world!   )');
```

Результат:

```result
┌─trim(BOTH ' ()' FROM '(   Hello, world!   )')─┐
│ Hello, world!                                 │
└───────────────────────────────────────────────┘
```
## trimLeft {#trimleft}

Удаляет последовательные вхождения пробелов (ASCII-символ 32) из начала строки.

**Синтаксис**

```sql
trimLeft(input_string[, trim_characters])
```

Псевдоним: `ltrim`.

**Аргументы**

- `input_string` — Строка для обрезки. [String](../data-types/string.md).
- `trim_characters` — Символы для обрезки. Необязательно. [String](../data-types/string.md). Если не указано, используется `' '` (один пробел) как символ для обрезки.

**Возвращаемое значение**

Строка без начальных общих пробелов. [String](../data-types/string.md).

**Пример**

```sql
SELECT trimLeft('     Hello, world!     ');
```

Результат:

```result
┌─trimLeft('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```
## trimRight {#trimright}

Удаляет последовательные вхождения пробелов (ASCII-символ 32) из конца строки.

**Синтаксис**

```sql
trimRight(input_string[, trim_characters])
```

Псевдоним: `rtrim`.

**Аргументы**

- `input_string` — Строка для обрезки. [String](../data-types/string.md).
- `trim_characters` — Символы для обрезки. Необязательно. [String](../data-types/string.md). Если не указано, используется `' '` (один пробел) как символ для обрезки.

**Возвращаемое значение**

Строка без конечных общих пробелов. [String](../data-types/string.md).

**Пример**

```sql
SELECT trimRight('     Hello, world!     ');
```

Результат:

```result
┌─trimRight('     Hello, world!     ')─┐
│      Hello, world!                   │
└──────────────────────────────────────┘
```
## trimBoth {#trimboth}

Удаляет последовательные вхождения пробелов (ASCII-символ 32) с обеих сторон строки.

**Синтаксис**

```sql
trimBoth(input_string[, trim_characters])
```

Псевдоним: `trim`.

**Аргументы**

- `input_string` — Строка для обрезки. [String](../data-types/string.md).
- `trim_characters` — Символы для обрезки. Необязательно. [String](../data-types/string.md). Если не указано, используется `' '` (один пробел) как символ для обрезки.

**Возвращаемое значение**

Строка без начальных и конечных общих пробелов. [String](../data-types/string.md).

**Пример**

```sql
SELECT trimBoth('     Hello, world!     ');
```

Результат:

```result
┌─trimBoth('     Hello, world!     ')─┐
│ Hello, world!                       │
└─────────────────────────────────────┘
```
## CRC32 {#crc32}

Возвращает контрольную сумму CRC32 строки, используя полином CRC-32-IEEE 802.3 и начальное значение `0xffffffff` (реализация zlib).

Тип результата — UInt32.
## CRC32IEEE {#crc32ieee}

Возвращает контрольную сумму CRC32 строки, используя полином CRC-32-IEEE 802.3.

Тип результата — UInt32.
## CRC64 {#crc64}

Возвращает контрольную сумму CRC64 строки, используя полином CRC-64-ECMA.

Тип результата — UInt64.
## normalizeUTF8NFC {#normalizeutf8nfc}

Преобразует строку в [нормализованную форму NFC](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms), предполагая, что строка является действительным текстом, закодированным в UTF8.

**Синтаксис**

```sql
normalizeUTF8NFC(words)
```

**Аргументы**

- `words` — Входная строка, закодированная в UTF8. [String](../data-types/string.md).

**Возвращаемое значение**

- Строка, преобразованная в нормализованную форму NFC. [String](../data-types/string.md).

**Пример**

```sql
SELECT length('â'), normalizeUTF8NFC('â') AS nfc, length(nfc) AS nfc_len;
```

Результат:

```result
┌─length('â')─┬─nfc─┬─nfc_len─┐
│           2 │ â   │       2 │
└─────────────┴─────┴─────────┘
```
## normalizeUTF8NFD {#normalizeutf8nfd}

Преобразует строку в [нормализованную форму NFD](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms), предполагая, что строка является действительным текстом, закодированным в UTF8.

**Синтаксис**

```sql
normalizeUTF8NFD(words)
```

**Аргументы**

- `words` — Входная строка, закодированная в UTF8. [String](../data-types/string.md).

**Возвращаемое значение**

- Строка, преобразованная в нормализованную форму NFD. [String](../data-types/string.md).

**Пример**

```sql
SELECT length('â'), normalizeUTF8NFD('â') AS nfd, length(nfd) AS nfd_len;
```

Результат:

```result
┌─length('â')─┬─nfd─┬─nfd_len─┐
│           2 │ â   │       3 │
└─────────────┴─────┴─────────┘
```
## normalizeUTF8NFKC {#normalizeutf8nfkc}

Преобразует строку в [нормализованную форму NFKC](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms), предполагая, что строка является действительным текстом, закодированным в UTF8.

**Синтаксис**

```sql
normalizeUTF8NFKC(words)
```

**Аргументы**

- `words` — Входная строка, закодированная в UTF8. [String](../data-types/string.md).

**Возвращаемое значение**

- Строка, преобразованная в нормализованную форму NFKC. [String](../data-types/string.md).

**Пример**

```sql
SELECT length('â'), normalizeUTF8NFKC('â') AS nfkc, length(nfkc) AS nfkc_len;
```

Результат:

```result
┌─length('â')─┬─nfkc─┬─nfkc_len─┐
│           2 │ â    │        2 │
└─────────────┴──────┴──────────┘
```
## normalizeUTF8NFKD {#normalizeutf8nfkd}

Преобразует строку в [нормализованную форму NFKD](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms), предполагая, что строка является действительным текстом, закодированным в UTF8.

**Синтаксис**

```sql
normalizeUTF8NFKD(words)
```

**Аргументы**

- `words` — Входная строка, закодированная в UTF8. [String](../data-types/string.md).

**Возвращаемое значение**

- Строка, преобразованная в нормализованную форму NFKD. [String](../data-types/string.md).

**Пример**

```sql
SELECT length('â'), normalizeUTF8NFKD('â') AS nfkd, length(nfkd) AS nfkd_len;
```

Результат:

```result
┌─length('â')─┬─nfkd─┬─nfkd_len─┐
│           2 │ â    │        3 │
└─────────────┴──────┴──────────┘
```
## encodeXMLComponent {#encodexmlcomponent}

Экранирует символы со специальным значением в XML, чтобы их можно было затем поместить в текстовый узел или атрибут XML.

Следующие символы заменяются: `<`, `&`, `>`, `"`, `'`.
Также смотрите [список ссылок на символы XML и HTML](https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references).

**Синтаксис**

```sql
encodeXMLComponent(x)
```

**Аргументы**

- `x` — Входная строка. [String](../data-types/string.md).

**Возвращаемое значение**

- Экранированная строка. [String](../data-types/string.md).

**Пример**

```sql
SELECT encodeXMLComponent('Hello, "world"!');
SELECT encodeXMLComponent('<123>');
SELECT encodeXMLComponent('&clickhouse');
SELECT encodeXMLComponent('\'foo\'');
```

Результат:

```result
Hello, &quot;world&quot;!
&lt;123&gt;
&amp;clickhouse
&apos;foo&apos;
```
## decodeXMLComponent {#decodexmlcomponent}

Декодирует подстроки со специальным значением в XML. Эти подстроки: `&quot;` `&amp;` `&apos;` `&gt;` `&lt;`

Эта функция также заменяет числовые ссылочные символы на символы Unicode. Поддерживаются как десятичные (например, `&#10003;`), так и шестнадцатеричные (`&#x2713;`) формы.

**Синтаксис**

```sql
decodeXMLComponent(x)
```

**Аргументы**

- `x` — Входная строка. [String](../data-types/string.md).

**Возвращаемое значение**

- Неэкраненная строка. [String](../data-types/string.md).

**Пример**

```sql
SELECT decodeXMLComponent('&apos;foo&apos;');
SELECT decodeXMLComponent('&lt; &#x3A3; &gt;');
```

Результат:

```result
'foo'
< Σ >
```
## decodeHTMLComponent {#decodehtmlcomponent}

Декодирует подстроки со специальным значением в HTML. Например: `&hbar;` `&gt;` `&diamondsuit;` `&heartsuit;` `&lt;` и т.д.

Эта функция также заменяет числовые ссылочные символы на символы Unicode. Поддерживаются как десятичные (например, `&#10003;`), так и шестнадцатеричные (`&#x2713;`) формы.

**Синтаксис**

```sql
decodeHTMLComponent(x)
```

**Аргументы**

- `x` — Входная строка. [String](../data-types/string.md).

**Возвращаемое значение**

- Неэкраненная строка. [String](../data-types/string.md).

**Пример**

```sql
SELECT decodeHTMLComponent('\'CH\'');
SELECT decodeHTMLComponent('I&heartsuit;ClickHouse');
```

Результат:

```result
'CH'
I♥ClickHouse'
```
## extractTextFromHTML {#extracttextfromhtml}

Эта функция извлекает простой текст из HTML или XHTML.

Она не соответствует 100% спецификации HTML, XML или XHTML, но реализация достаточно точна и быстра. Правила следующие:

1. Комментарии пропускаются. Пример: `<!-- test -->`. Комментарий должен заканчиваться на `-->`. Вложенные комментарии не допускаются.
Примечание: конструкции, такие как `<!-->` и `<!--->`, не являются допустимыми комментариями в HTML, но они пропускаются другими правилами.
2. CDATA вставляется без изменений. Примечание: CDATA специфично для XML/XHTML и обрабатывается на "наилучших условиях".
3. Элементы `script` и `style` удаляются вместе со всем их содержимым. Примечание: предполагается, что закрывающий тег не может появиться внутри содержимого. Например, в строковом литерале JS он должен быть экранирован как `"<\/script>"`.
Примечание: комментарии и CDATA могут быть внутри `script` или `style` - тогда закрывающие теги не ищутся внутри CDATA. Пример: `<script><![CDATA[</script>]]></script>`. Но они всё равно ищутся внутри комментариев. Иногда это становится сложным: `<script>var x = "<!--"; </script> var y = "-->"; alert(x + y);</script>`
Примечание: `script` и `style` могут быть именами пространств имен XML - тогда они не рассматриваются как обычные элементы `script` или `style`. Пример: `<script:a>Hello</script:a>`.
Примечание: пробелы могут быть после имени закрывающего тега: `</script >`, но не перед ним: `< / script>`.
4. Другие теги или элементы, похожие на теги, пропускаются без внутреннего содержимого. Пример: `<a>.</a>`
Примечание: ожидается, что этот HTML является незаконным: `<a test=">"></a>`
Примечание: также пропускаются конструкции, подобные тегам: `<>`, `<!>`, и т.д.
Примечание: тег без конца пропускается до конца ввода: `<hello   `
5. HTML и XML сущности не декодируются. Они должны обрабатываться отдельной функцией.
6. Пробелы в тексте сжимаются или вставляются по конкретным правилам.
    - Пробелы в начале и в конце удаляются.
    - Последовательные пробелы сжимаются.
    - Но если текст разделен другими элементами и нет пробела, он вставляется.
    - Это может привести к неестественным примерам: `Hello<b>world</b>`, `Hello<!-- -->world` - в HTML нет пробела, но функция вставляет его. Также учтите: `Hello<p>world</p>`, `Hello<br>world`. Такое поведение разумно для анализа данных, например, для преобразования HTML в мешок слов.
7. Также обратите внимание, что правильная обработка пробелов требует поддержки свойств `<pre></pre>` и CSS `display` и `white-space`.

**Синтаксис**

```sql
extractTextFromHTML(x)
```

**Аргументы**

- `x` — входной текст. [String](../data-types/string.md).

**Возвращаемое значение**

- Извлеченный текст. [String](../data-types/string.md).

**Пример**

Первый пример содержит несколько тегов и комментарий и также показывает обработку пробелов.
Второй пример показывает обработку `CDATA` и тега `script`.
В третьем примере текст извлекается из полного HTML-ответа, полученного с помощью функции [url](../../sql-reference/table-functions/url.md).

```sql
SELECT extractTextFromHTML(' <p> A text <i>with</i><b>tags</b>. <!-- comments --> </p> ');
SELECT extractTextFromHTML('<![CDATA[The content within <b>CDATA</b>]]> <script>alert("Script");</script>');
SELECT extractTextFromHTML(html) FROM url('http://www.donothingfor2minutes.com/', RawBLOB, 'html String');
```

Результат:

```result
A text with tags .
The content within <b>CDATA</b>
Do Nothing for 2 Minutes 2:00 &nbsp;
```
## ascii {#ascii}

Возвращает код ASCII (в виде Int32) первого символа строки `s`.

Если `s` пустая, результат равен 0. Если первый символ не является символом ASCII или не относится к диапазону Latin-1, результат неопределен.

**Синтаксис**

```sql
ascii(s)
```
## soundex {#soundex}

Возвращает [код Soundex](https://en.wikipedia.org/wiki/Soundex) строки.

**Синтаксис**

```sql
soundex(val)
```

**Аргументы**

- `val` — Входное значение. [String](../data-types/string.md)

**Возвращаемое значение**

- Код Soundex входного значения. [String](../data-types/string.md)

**Пример**

```sql
select soundex('aksel');
```

Результат:

```result
┌─soundex('aksel')─┐
│ A240             │
└──────────────────┘
```
## punycodeEncode {#punycodeencode}

Возвращает [представление Punycode](https://en.wikipedia.org/wiki/Punycode) строки.
Строка должна быть закодирована в UTF8, в противном случае поведение неопределено.

**Синтаксис**

```sql
punycodeEncode(val)
```

**Аргументы**

- `val` — Входное значение. [String](../data-types/string.md)

**Возвращаемое значение**

- Представление Punycode входного значения. [String](../data-types/string.md)

**Пример**

```sql
select punycodeEncode('München');
```

Результат:

```result
┌─punycodeEncode('München')─┐
│ Mnchen-3ya                │
└───────────────────────────┘
```
## punycodeDecode {#punycodedecode}

Возвращает текст в виде UTF8 для строки, закодированной в [Punycode](https://en.wikipedia.org/wiki/Punycode).
Если не передана допустимая строка, закодированная в Punycode, выбрасывается исключение.

**Синтаксис**

```sql
punycodeEncode(val)
```

**Аргументы**

- `val` — Строка, закодированная в Punycode. [String](../data-types/string.md)

**Возвращаемое значение**

- Открытый текст входного значения. [String](../data-types/string.md)

**Пример**

```sql
select punycodeDecode('Mnchen-3ya');
```

Результат:

```result
┌─punycodeDecode('Mnchen-3ya')─┐
│ München                      │
└──────────────────────────────┘
```
## tryPunycodeDecode {#trypunycodedecode}

Как `punycodeDecode`, но возвращает пустую строку, если не передана допустимая строка, закодированная в Punycode.
## idnaEncode {#idnaencode}

Возвращает ASCII представление (алгоритм ToASCII) доменного имени в соответствии с механизмом [Международные доменные имена в приложениях](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA).
Входная строка должна быть закодирована в UTF и переводима в строку ASCII, в противном случае выбрасывается исключение.
Примечание: нельзя выполнять процентное декодирование или обрезку табуляций, пробелов или управляющих символов.

**Синтаксис**

```sql
idnaEncode(val)
```

**Аргументы**

- `val` — Входное значение. [String](../data-types/string.md)

**Возвращаемое значение**

- ASCII представление в соответствии с механизмом IDNA входного значения. [String](../data-types/string.md)

**Пример**

```sql
select idnaEncode('straße.münchen.de');
```

Результат:

```result
┌─idnaEncode('straße.münchen.de')─────┐
│ xn--strae-oqa.xn--mnchen-3ya.de     │
└─────────────────────────────────────┘
```
## tryIdnaEncode {#tryidnaencode}

Как `idnaEncode`, но возвращает пустую строку в случае ошибки вместо выбрасывания исключения.
## idnaDecode {#idnadecode}

Возвращает представление Unicode (UTF-8) (алгоритм ToUnicode) доменного имени в соответствии с механизмом [Международные доменные имена в приложениях](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA).
В случае ошибки (например, если ввод неверен) возвращается входная строка.
Обратите внимание, что повторное применение `idnaEncode()` и `idnaDecode()` не обязательно возвращает оригинальную строку из-за нормализации регистра.

**Синтаксис**

```sql
idnaDecode(val)
```

**Аргументы**

- `val` — Входное значение. [String](../data-types/string.md)

**Возвращаемое значение**

- Представление Unicode (UTF-8) в соответствии с механизмом IDNA входного значения. [String](../data-types/string.md)

**Пример**

```sql
select idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de');
```

Результат:

```result
┌─idnaDecode('xn--strae-oqa.xn--mnchen-3ya.de')─┐
│ straße.münchen.de                             │
└───────────────────────────────────────────────┘
```
## byteHammingDistance {#bytehammingdistance}

Вычисляет [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между двумя байтовыми строками.

**Синтаксис**

```sql
byteHammingDistance(string1, string2)
```

**Примеры**

```sql
SELECT byteHammingDistance('karolin', 'kathrin');
```

Результат:

```text
┌─byteHammingDistance('karolin', 'kathrin')─┐
│                                         3 │
└───────────────────────────────────────────┘
```

Псевдоним: `mismatches`
## stringJaccardIndex {#stringjaccardindex}

Вычисляет [Jaccard similarity index](https://en.wikipedia.org/wiki/Jaccard_index) между двумя байтовыми строками.

**Синтаксис**

```sql
stringJaccardIndex(string1, string2)
```

**Примеры**

```sql
SELECT stringJaccardIndex('clickhouse', 'mouse');
```

Результат:

```text
┌─stringJaccardIndex('clickhouse', 'mouse')─┐
│                                       0.4 │
└───────────────────────────────────────────┘
```
## stringJaccardIndexUTF8 {#stringjaccardindexutf8}

Как [stringJaccardIndex](#stringjaccardindex), но для строк, закодированных в UTF8.
## editDistance {#editdistance}

Вычисляет [расстояние редактирования](https://en.wikipedia.org/wiki/Edit_distance) между двумя байтовыми строками.

**Синтаксис**

```sql
editDistance(string1, string2)
```

**Примеры**

```sql
SELECT editDistance('clickhouse', 'mouse');
```

Результат:

```text
┌─editDistance('clickhouse', 'mouse')─┐
│                                   6 │
└─────────────────────────────────────┘
```

Псевдоним: `levenshteinDistance`
## editDistanceUTF8 {#editdistanceutf8}

Вычисляет [расстояние редактирования](https://en.wikipedia.org/wiki/Edit_distance) между двумя строками UTF8.

**Синтаксис**

```sql
editDistanceUTF8(string1, string2)
```

**Примеры**

```sql
SELECT editDistanceUTF8('我是谁', '我是我');
```

Результат:

```text
┌─editDistanceUTF8('我是谁', '我是我')──┐
│                                   1 │
└─────────────────────────────────────┘
```

Псевдоним: `levenshteinDistanceUTF8`
## damerauLevenshteinDistance {#dameraulevenshteindistance}

Вычисляет [расстояние Дамерау-Левенштейна](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance) между двумя байтовыми строками.

**Синтаксис**

```sql
damerauLevenshteinDistance(string1, string2)
```

**Примеры**

```sql
SELECT damerauLevenshteinDistance('clickhouse', 'mouse');
```

Результат:

```text
┌─damerauLevenshteinDistance('clickhouse', 'mouse')─┐
│                                                 6 │
└───────────────────────────────────────────────────┘
```
## jaroSimilarity {#jarosimilarity}

Вычисляет [схожесть Jaro](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro_similarity) между двумя байтовыми строками.

**Синтаксис**

```sql
jaroSimilarity(string1, string2)
```

**Примеры**

```sql
SELECT jaroSimilarity('clickhouse', 'click');
```

Результат:

```text
┌─jaroSimilarity('clickhouse', 'click')─┐
│                    0.8333333333333333 │
└───────────────────────────────────────┘
```
## jaroWinklerSimilarity {#jarowinklersimilarity}

Вычисляет [схожесть Jaro-Winkler](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro%E2%80%93Winkler_similarity) между двумя байтовыми строками.

**Синтаксис**

```sql
jaroWinklerSimilarity(string1, string2)
```

**Примеры**

```sql
SELECT jaroWinklerSimilarity('clickhouse', 'click');
```

Результат:

```text
┌─jaroWinklerSimilarity('clickhouse', 'click')─┐
│                           0.8999999999999999 │
└──────────────────────────────────────────────┘
```
## initcap {#initcap}

Преобразует первую букву каждого слова в верхний регистр, а остальные — в нижний. Слова представляют собой последовательности алфавитных символов, разделенные неалфавитными символами.

:::note
Поскольку `initCap` преобразует только первую букву каждого слова в верхний регистр, вы можете наблюдать неожиданное поведение для слов, содержащих апострофы или заглавные буквы. Например:

```sql
SELECT initCap('mother''s daughter'), initCap('joe McAdam');
```

вернет

```response
┌─initCap('mother\'s daughter')─┬─initCap('joe McAdam')─┐
│ Mother'S Daughter             │ Joe Mcadam            │
└───────────────────────────────┴───────────────────────┘
```

Это известное поведение, на данный момент нет планов по его исправлению.
:::

**Синтаксис**

```sql
initcap(val)
```

**Аргументы**

- `val` — Входное значение. [String](../data-types/string.md).

**Возвращаемое значение**

- `val` с первой буквой каждого слова, преобразованной в верхний регистр. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT initcap('building for fast');
```

Результат:

```text
┌─initcap('building for fast')─┐
│ Building For Fast            │
└──────────────────────────────┘
```
## initcapUTF8 {#initcaputf8}

Как [initcap](#initcap), `initcapUTF8` преобразует первую букву каждого слова в верхний регистр, а остальные — в нижний. Предполагает, что строка содержит действительный текст, закодированный в UTF-8. 
Если это предположение нарушается, исключение не выбрасывается, и результат неопределен.

:::note
Эта функция не определяет язык; например, для турецкого результат может быть не совсем правильным (i/İ против i/I).
Если длина последовательности байтов UTF-8 различается для верхнего и нижнего регистра кода точки, результат может быть неправильным для этой кодовой точки.
:::

**Синтаксис**

```sql
initcapUTF8(val)
```

**Аргументы**

- `val` — Входное значение. [String](../data-types/string.md).

**Возвращаемое значение**

- `val` с первой буквой каждого слова, преобразованной в верхний регистр. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT initcapUTF8('не тормозит');
```

Результат:

```text
┌─initcapUTF8('не тормозит')─┐
│ Не Тормозит                │
└────────────────────────────┘
```
## firstLine {#firstline}

Возвращает первую строку из многострочной строки.

**Синтаксис**

```sql
firstLine(val)
```

**Аргументы**

- `val` — Входное значение. [String](../data-types/string.md)

**Возвращаемое значение**

- Первая строка входного значения или всё значение, если не существует разделителей строк. [String](../data-types/string.md)

**Пример**

```sql
select firstLine('foo\nbar\nbaz');
```

Результат:

```result
┌─firstLine('foo\nbar\nbaz')─┐
│ foo                        │
└────────────────────────────┘
```
```yaml
title: 'stringCompare'
sidebar_label: 'stringCompare'
keywords: ['string', 'compare', 'sql']
description: 'Сравнивает две строки лексикографически.'
```

## stringCompare {#stringcompare}

Сравнивает две строки лексикографически.

**Синтаксис**

```sql
stringCompare(string1, string2[, str1_off, string2_offset, num_bytes]);
```

**Аргументы**

- `string1` — Первая строка для сравнения. [String](../data-types/string.md)
- `string2` - Вторая строка для сравнения. [String](../data-types/string.md)
- `string1_offset` — Позиция (с нуля) в `string1`, с которой начинается сравнение. Необязательный, положительное число.
- `string2_offset` — Позиция (индекс с нуля) в `string2`, с которой начинается сравнение. Необязательный, положительное число.
- `num_bytes` — Максимальное количество байт для сравнения в обеих строках. Если `string_offset` + `num_bytes` превышает конец входной строки, `num_bytes` будет уменьшено соответственно.

**Возвращаемое значение**

- -1 — Если `string1`[`string1_offset`: `string1_offset` + `num_bytes`] < `string2`[`string2_offset`:`string2_offset` + `num_bytes`] и `string1_offset` < len(`string1`) и `string2_offset` < len(`string2`).
Если `string1_offset` >= len(`string1`) и `string2_offset` < len(`string2`).
- 0 — Если `string1`[`string1_offset`: `string1_offset` + `num_bytes`] = `string2`[`string2_offset`:`string2_offset` + `num_bytes`] и `string1_offset` < len(`string1`) и `string2_offset` < len(`string2`).
Если `string1_offset` >= len(`string1`) и `string2_offset` >= len(`string2`).
- 1 — Если `string1`[`string1_offset`: `string1_offset` + `num_bytes`] > `string2`[`string2_offset`:`string2_offset` + `num_bytes`] и `string1_offset` < len(`string1`) и `string2_offset` < len(`string2`).
Если `string1_offset` < len(`string1`) и `string2_offset` >= len(`string2`).

**Пример**

```sql
SELECT
    stringCompare('alice', 'bob', 0, 0, 3) as result1,
    stringCompare('alice', 'alicia', 0, 0, 3) as result2,
    stringCompare('bob', 'alice', 0, 0, 3) as result3
```
Результат:
```result
   ┌─result1─┬─result2─┬─result3─┐
1. │      -1 │       0 │       1 │
   └─────────┴─────────┴─────────┘
```

```sql
SELECT
    stringCompare('alice', 'alicia') as result2,
    stringCompare('alice', 'alice') as result1,
    stringCompare('bob', 'alice') as result3
```
Результат:
```result
   ┌─result2─┬─result1─┬─result3─┐
1. │      -1 │       0 │       1 │
   └─────────┴─────────┴─────────┘
```
## sparseGrams {#sparsegrams}

Находит все подстроки данной строки, длина которых составляет не менее `n`, 
где хеши (n-1)-грамм на границах подстроки
строго больше хешей любых (n-1)-грамм внутри подстроки.
Использует [crc32](./string-functions.md#crc32) как хеш-функцию.

**Синтаксис**

```sql
sparseGrams(s[, min_ngram_length]);
```

**Аргументы**

- `s` — Входная строка. [String](../data-types/string.md)
- `min_ngram_length` — Минимальная длина извлекаемой n-граммы. Значение по умолчанию и минимальное — 3.
- `max_ngram_length` — Максимальная длина извлекаемой n-граммы. Значение по умолчанию — 100. Не должно быть меньше 'min_ngram_length'.

**Возвращаемое значение**

- Массив выбранных подстрок. [Array](../data-types/array.md)([String](../data-types/string.md)).

**Пример**

```sql
SELECT sparseGrams('alice', 3) AS result
```
Результат:
```result
   ┌─result─────────────────────┐
1. │ ['ali','lic','lice','ice'] │
   └────────────────────────────┘
```
## sparseGramsUTF8 {#sparsegramsutf8}

Находит все подстроки данной строки, длина которых составляет не менее `n`, 
где хеши (n-1)-грамм на границах подстроки
строго больше хешей любых (n-1)-грамм внутри подстроки.
Использует [crc32](./string-functions.md#crc32) как хеш-функцию.
Ожидает строку в кодировке UTF-8, выбрасывает исключение в случае неверной последовательности UTF-8.

**Синтаксис**

```sql
sparseGramsUTF8(s[, min_ngram_length]);
```

**Аргументы**

- `s` — Входная строка. [String](../data-types/string.md)
- `min_ngram_length` — Минимальная длина извлекаемой n-граммы. Значение по умолчанию и минимальное — 3.
- `max_ngram_length` — Максимальная длина извлекаемой n-граммы. Значение по умолчанию — 100. Не должно быть меньше 'min_ngram_length'.

**Возвращаемое значение**

- Массив выбранных подстрок. [Array](../data-types/array.md)([String](../data-types/string.md)).

**Пример**

```sql
SELECT sparseGramsUTF8('алиса', 3) AS result
```
Результат:
```result
   ┌─result──────────────┐
1. │ ['али','лис','иса'] │
   └─────────────────────┘
```
## sparseGramsHashes {#sparsegramshashes}

Находит хеши всех подстрок данной строки, длина которых составляет не менее `n`, 
где хеши (n-1)-грамм на границах подстроки
строго больше хешей любых (n-1)-грамм внутри подстроки.
Использует [crc32](./string-functions.md#crc32) как хеш-функцию.

**Синтаксис**

```sql
sparseGramsHashes(s[, min_ngram_length]);
```

**Аргументы**

- `s` — Входная строка. [String](../data-types/string.md)
- `min_ngram_length` — Минимальная длина извлекаемой n-граммы. Значение по умолчанию и минимальное — 3.
- `max_ngram_length` — Максимальная длина извлекаемой n-граммы. Значение по умолчанию — 100. Не должно быть меньше 'min_ngram_length'.

**Возвращаемое значение**

- Массив хешей crc32-c выбранных подстрок. [Array](../data-types/array.md)([UInt32](../data-types/int-uint.md)).

**Пример**

```sql
SELECT sparseGramsHashes('alice', 3) AS result
```
Результат:
```result
   ┌─result────────────────────────────────────────┐
1. │ [1265796434,3725069146,1689963195,3410985998] │
   └───────────────────────────────────────────────┘
```
## sparseGramsHashesUTF8 {#sparsegramshashesutf8}

Находит хеши всех подстрок данной строки, длина которых составляет не менее `n`, 
где хеши (n-1)-грамм на границах подстроки
строго больше хешей любых (n-1)-грамм внутри подстроки.
Использует [crc32](./string-functions.md#crc32) как хеш-функцию.
Ожидает строку в кодировке UTF-8, выбрасывает исключение в случае неверной последовательности UTF-8.

**Синтаксис**

```sql
sparseGramsHashesUTF8(s[, min_ngram_length]);
```

**Аргументы**

- `s` — Входная строка. [String](../data-types/string.md)
- `min_ngram_length` — Минимальная длина извлекаемой n-граммы. Значение по умолчанию и минимальное — 3.
- `max_ngram_length` — Максимальная длина извлекаемой n-граммы. Значение по умолчанию — 100. Не должно быть меньше 'min_ngram_length'.

**Возвращаемое значение**

- Массив хешей crc32-c выбранных подстрок. [Array](../data-types/array.md)([UInt32](../data-types/int-uint.md)).

**Пример**

```sql
SELECT sparseGramsHashesUTF8('алиса', 3) AS result
```
Результат:
```result
   ┌─result───────────────────────────┐
1. │ [417784657,728683856,3071092609] │
   └──────────────────────────────────┘
```
## stringBytesUniq {#stringbytesuniq}

Считает количество уникальных байтов в строке.

**Синтаксис**

```sql
stringBytesUniq(s)
```

**Аргументы**

- `s` — Строка для анализа. [String](../data-types/string.md).

**Возвращаемое значение**

- Количество уникальных байтов в строке. [UInt16](../data-types/int-uint.md).

**Пример**

```sql
SELECT stringBytesUniq('Hello');
```

Результат:

```result
┌─stringBytesUniq('Hello')─┐
│                        4 │
└──────────────────────────┘
```
## stringBytesEntropy {#stringbytesentropy}

Выводит энтропию Шеннона распределения байтов в строке.

**Синтаксис**

```sql
stringBytesEntropy(s)
```

**Аргументы**

- `s` — Строка для анализа. [String](../data-types/string.md).

**Возвращаемое значение**

- Энтропия Шеннона распределения байтов в строке. [Float64](../data-types/float.md).

**Пример**

```sql
SELECT stringBytesEntropy('Hello, world!');
```

Результат:

```result
┌─stringBytesEntropy('Hello, world!')─┐
│                         3.07049960  │
└─────────────────────────────────────┘
```
