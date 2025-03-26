---
description: 'Документация по функциям работы со строками'
sidebar_label: 'Строки'
sidebar_position: 170
slug: /sql-reference/functions/string-functions
title: 'Функции для работы со строками'
---

import VersionBadge from '@theme/badges/VersionBadge';

# Функции для работы со строками

Функции для [поиска](string-search-functions.md) в строках и для [замены](string-replace-functions.md) в строках описаны отдельно.
## empty {#empty}

Проверяет, является ли входная строка пустой. Строка считается непустой, если она содержит хотя бы один байт, даже если этот байт является пробелом или нулевым байтом.

Функция также доступна для [массивов](/sql-reference/functions/array-functions#empty) и [UUID-ов](uuid-functions.md#empty).

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

Проверяет, является ли входная строка непустой. Строка считается непустой, если она содержит хотя бы один байт, даже если этот байт является пробелом или нулевым байтом.

Функция также доступна для [массивов](/sql-reference/functions/array-functions#notempty) и [UUID-ов](uuid-functions.md#notempty).

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

Возвращает длину строки в кодовых точках Unicode, а не в байтах или символах. Предполагается, что строка содержит допустимый текст в кодировке UTF-8. Если это предположение нарушается, исключение не выбрасывается, и результат неопределен.

Псевдонимы:
- `CHAR_LENGTH`
- `CHARACTER_LENGTH`

**Синтаксис**

```sql
lengthUTF8(s)
```

**Параметры**

- `s` — Строка, содержащая допустимый текст в кодировке UTF-8. [Строка](../data-types/string).

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

Возвращает подстроку строки `s` с указанным `offset`, начиная с левой стороны.

**Синтаксис**

```sql
left(s, offset)
```

**Параметры**

- `s` — Строка, из которой нужно извлечь подстроку. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `offset` — Количество байт смещения. [(U)Int*](../data-types/int-uint).

**Возвращаемое значение**

- Для положительного `offset`: Подстрока `s` длиной `offset` байт, начиная с левой стороны строки.
- Для отрицательного `offset`: Подстрока `s` длиной `length(s) - |offset|` байт, начиная с левой стороны строки.
- Пустая строка, если `length` равна 0.

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

Возвращает подстроку UTF-8 кодированной строки `s` с указанным `offset`, начиная с левой стороны.

**Синтаксис**

```sql
leftUTF8(s, offset)
```

**Параметры**

- `s` — UTF-8 кодированная строка, из которой нужно извлечь подстроку. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `offset` — Количество байт смещения. [(U)Int*](../data-types/int-uint).

**Возвращаемое значение**

- Для положительного `offset`: Подстрока `s` длиной `offset` байт, начиная с левой стороны строки.
- Для отрицательного `offset`: Подстрока `s` длиной `length(s) - |offset|` байт, начиная с левой стороны строки.
- Пустая строка, если `length` равна 0.

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

Дополняет строку слева пробелами или указанной строкой (несколько раз, если это необходимо) до тех пор, пока результирующая строка не достигнет указанной длины.

**Синтаксис**

```sql
leftPad(string, length[, pad_string])
```

Псевдоним: `LPAD`

**Аргументы**

- `string` — Входная строка, которую нужно дополнить. [Строка](../data-types/string.md).
- `length` — Длина результирующей строки. [UInt или Int](../data-types/int-uint.md). Если значение меньше длины входной строки, то входная строка обрезается до `length` символов.
- `pad_string` — Строка, которой нужно дополнить входную строку. [Строка](../data-types/string.md). Необязательно. Если не указана, строка дополняется пробелами.

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

Дополняет строку слева пробелами или указанной строкой (несколько раз, если это необходимо) до тех пор, пока результирующая строка не достигнет заданной длины. В отличие от [leftPad](#leftpad), которая измеряет длину строки в байтах, длина строки измеряется в кодовых точках.

**Синтаксис**

```sql
leftPadUTF8(string, length[, pad_string])
```

**Аргументы**

- `string` — Входная строка, которую нужно дополнить. [Строка](../data-types/string.md).
- `length` — Длина результирующей строки. [UInt или Int](../data-types/int-uint.md). Если значение меньше длины входной строки, то входная строка обрезается до `length` символов.
- `pad_string` — Строка, которой нужно дополнить входную строку. [Строка](../data-types/string.md). Необязательно. Если не указана, строка дополняется пробелами.

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

Возвращает подстроку строки `s` с указанным `offset`, начиная с правой стороны.

**Синтаксис**

```sql
right(s, offset)
```

**Параметры**

- `s` — Строка, из которой нужно извлечь подстроку. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `offset` — Количество байт смещения. [(U)Int*](../data-types/int-uint).

**Возвращаемое значение**

- Для положительного `offset`: Подстрока `s` длиной `offset` байт, начиная с правой стороны строки.
- Для отрицательного `offset`: Подстрока `s` длиной `length(s) - |offset|` байт, начиная с правой стороны строки.
- Пустая строка, если `length` равна 0.

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

Возвращает подстроку UTF-8 кодированной строки `s` с указанным `offset`, начиная с правой стороны.

**Синтаксис**

```sql
rightUTF8(s, offset)
```

**Параметры**

- `s` — UTF-8 кодированная строка, из которой нужно извлечь подстроку. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `offset` — Количество байт смещения. [(U)Int*](../data-types/int-uint).

**Возвращаемое значение**

- Для положительного `offset`: Подстрока `s` длиной `offset` байт, начиная с правой стороны строки.
- Для отрицательного `offset`: Подстрока `s` длиной `length(s) - |offset|` байт, начиная с правой стороны строки.
- Пустая строка, если `length` равна 0.

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

Дополняет строку справа пробелами или указанной строкой (несколько раз, если это необходимо) до тех пор, пока результирующая строка не достигнет указанной длины.

**Синтаксис**

```sql
rightPad(string, length[, pad_string])
```

Псевдоним: `RPAD`

**Аргументы**

- `string` — Входная строка, которую нужно дополнить. [Строка](../data-types/string.md).
- `length` — Длина результирующей строки. [UInt или Int](../data-types/int-uint.md). Если значение меньше длины входной строки, то входная строка обрезается до `length` символов.
- `pad_string` — Строка, которой нужно дополнить входную строку. [Строка](../data-types/string.md). Необязательно. Если не указана, строка дополняется пробелами.

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

Дополняет строку справа пробелами или указанной строкой (несколько раз, если это необходимо) до тех пор, пока результирующая строка не достигнет заданной длины. В отличие от [rightPad](#rightpad), которая измеряет длину строки в байтах, длина строки измеряется в кодовых точках.

**Синтаксис**

```sql
rightPadUTF8(string, length[, pad_string])
```

**Аргументы**

- `string` — Входная строка, которую нужно дополнить. [Строка](../data-types/string.md).
- `length` — Длина результирующей строки. [UInt или Int](../data-types/int-uint.md). Если значение меньше длины входной строки, то входная строка обрезается до `length` символов.
- `pad_string` — Строка, которой нужно дополнить входную строку. [Строка](../data-types/string.md). Необязательно. Если не указана, строка дополняется пробелами.

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
- `string1_offset` — Позиция (индекс, начиная с нуля) в `string1`, с которой начинается сравнение. [UInt*](../data-types/int-uint.md).
- `string2_offset` — Позиция (индекс, начиная с нуля) в `string2`, с которой начинается сравнение. [UInt*](../data-types/int-uint.md).
- `num_bytes` — Максимальное количество байт, которое нужно сравнить в обеих строках. Если `string_offset` + `num_bytes` превышает конец входной строки, то `num_bytes` будет уменьшен соответственно. [UInt*](../data-types/int-uint.md).

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

Преобразует символы латиницы ASCII в строке в строчные буквы.

**Синтаксис**

```sql
lower(input)
```

Псевдоним: `lcase`

**Параметры**

- `input`: Строковый тип [Строка](../data-types/string.md).

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

Преобразует символы латиницы ASCII в строке в заглавные буквы.

**Синтаксис**

```sql
upper(input)
```

Псевдоним: `ucase`

**Параметры**

- `input` — Строковый тип [Строка](../data-types/string.md).

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

Преобразует строку в строчные буквы, предполагая, что строка содержит допустимый текст в кодировке UTF-8. Если это предположение нарушается, исключение не выбрасывается, и результат неопределен.

:::note
Не распознает язык, например, для турецкого результат может быть не совсем корректным (i/İ против i/I). Если длина байтовой последовательности UTF-8 различна для заглавных и строчных букв кодовой точки (например, `ẞ` и `ß`), результат может быть некорректным для этой кодовой точки.
:::

**Синтаксис**

```sql
lowerUTF8(input)
```

**Параметры**

- `input` — Строковый тип [Строка](../data-types/string.md).

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

Преобразует строку в заглавные буквы, предполагая, что строка содержит допустимый текст в кодировке UTF-8. Если это предположение нарушается, исключение не выбрасывается, и результат неопределен.

:::note
Не распознает язык, например, для турецкого результат может быть не совсем корректным (i/İ против i/I). Если длина байтовой последовательности UTF-8 различна для заглавных и строчных букв кодовой точки (например, `ẞ` и `ß`), результат может быть некорректным для этой кодовой точки.
:::

**Синтаксис**

```sql
upperUTF8(input)
```

**Параметры**

- `input` — Строковый тип [Строка](../data-types/string.md).

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

Возвращает 1, если набор байтов является допустимым текстом в кодировке UTF-8, в противном случае 0.

**Синтаксис**

```sql
isValidUTF8(input)
```

**Параметры**

- `input` — Строковый тип [Строка](../data-types/string.md).

**Возвращаемое значение**

- Возвращает `1`, если набор байтов является допустимым текстом в кодировке UTF-8, в противном случае `0`.

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

Заменяет недопустимые символы UTF-8 на символ `�` (U+FFFD). Все идущие подряд недопустимые символы сжимаются в один символ замены.

**Синтаксис**

```sql
toValidUTF8(input_string)
```

**Аргументы**

- `input_string` — Любой набор байтов, представленный в виде объекта типа [Строка](../data-types/string.md).

**Возвращаемое значение**

- Допустимая строка в кодировке UTF-8.

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

- `s` — Строка, которую нужно повторить. [Строка](../data-types/string.md).
- `n` — Количество повторений строки. [UInt* или Int*](../data-types/int-uint.md).

**Возвращаемое значение**

Строка, содержащая строку `s`, повторяющуюся `n` раз. Если `n` &lt;= 0, функция возвращает пустую строку. [Строка](../data-types/string.md).

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

- `n` — Количество повторений пробела. [UInt* или Int*](../data-types/int-uint.md).

**Возвращаемое значение**

Строка, содержащая строку ` `, повторяющуюся `n` раз. Если `n` &lt;= 0, функция возвращает пустую строку. [Строка](../data-types/string.md).

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

Обращает последовательность байтов в строке.
## reverseUTF8 {#reverseutf8}

Обращает последовательность кодовых точек Unicode в строке. Предполагается, что строка содержит допустимый текст в кодировке UTF-8. Если это предположение нарушается, исключение не выбрасывается, и результат неопределен.
## concat {#concat}

Конкатенирует заданные аргументы.

**Синтаксис**

```sql
concat(s1, s2, ...)
```

**Аргументы**

Значения произвольного типа.

Аргументы, которые не являются типами [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md), конвертируются в строки с использованием их стандартной сериализации. Поскольку это снижает производительность, не рекомендуется использовать аргументы, отличные от String/FixedString.

**Возвращаемые значения**

Строка, созданная путем конкатенации аргументов.

Если любое из аргументов равно `NULL`, функция возвращает `NULL`.

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
Используйте оператор || для конкатенации строк в качестве краткой альтернативы `concat()`. Например, `'Hello, ' || 'World!'` эквивалентно `concat('Hello, ', 'World!')`.
:::
## concatAssumeInjective {#concatassumeinjective}

Как [concat](#concat), но предполагает, что `concat(s1, s2, ...) → sn` является инъективным. Может быть использован для оптимизации GROUP BY.

Функция называется инъективной, если для разных аргументов она возвращает разные результаты. Другими словами: разные аргументы никогда не производят одинаковый результат.

**Синтаксис**

```sql
concatAssumeInjective(s1, s2, ...)
```

**Аргументы**

Значения типа String или FixedString.

**Возвращаемые значения**

Строка, созданная путем конкатенации аргументов.

Если любое из значений аргументов равно `NULL`, функция возвращает `NULL`.

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

- sep — разделитель. Константный [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- exprN — выражение, которое необходимо конкатенировать. Аргументы, которые не являются типами [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md), конвертируются в строки с использованием их стандартной сериализации. Поскольку это снижает производительность, не рекомендуется использовать аргументы, отличные от String/FixedString.

**Возвращаемые значения**

Строка, созданная путем конкатенации аргументов.

Если любое из значений аргументов равно `NULL`, функция возвращает `NULL`.

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

Как `concatWithSeparator`, но предполагает, что `concatWithSeparator(sep, expr1, expr2, expr3...) → result` является инъективным. Может быть использован для оптимизации GROUP BY.

Функция называется инъективной, если для разных аргументов она возвращает разные результаты. Другими словами: разные аргументы никогда не производят одинаковый результат.
## substring {#substring}

Возвращает подстроку строки `s`, которая начинается с указанного индекса байта `offset`. Число байтов начинается с 1. Если `offset` равен 0, возвращается пустая строка. Если `offset` отрицательный, подстрока начинается с `pos` символов от конца строки, а не с начала. Дополнительным аргументом `length` задается максимальное количество байтов, которые может иметь возвращаемая подстрока.

**Синтаксис**

```sql
substring(s, offset[, length])
```

Псевдонимы:
- `substr`
- `mid`
- `byteSlice`

**Аргументы**

- `s` — Строка, из которой нужно извлечь подстроку. [Строка](../data-types/string.md), [FixedString](../data-types/fixedstring.md) или [Enum](../data-types/enum.md)
- `offset` — Начальная позиция подстроки в `s`. [(U)Int*](../data-types/int-uint.md).
- `length` — Максимальная длина подстроки. [(U)Int*](../data-types/int-uint.md). Необязательно.

**Возвращаемое значение**

Подстрока `s` длиной `length` байт, начиная с индекса `offset`. [Строка](../data-types/string.md).

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

Возвращает подстроку строки `s`, которая начинается с указанного индекса байта `offset` для кодовых точек Unicode. Число байтов начинается с 1. Если `offset` равно 0, возвращается пустая строка. Если `offset` отрицательный, подстрока начинается с `pos` символов от конца строки, а не с начала. Дополнительным аргументом `length` задается максимальное количество байтов, которые может иметь возвращаемая подстрока.

Предполагается, что строка содержит допустимый текст в кодировке UTF-8. Если это предположение нарушается, исключение не выбрасывается, и результат неопределен.

**Синтаксис**

```sql
substringUTF8(s, offset[, length])
```

**Аргументы**

- `s` — Строка, из которой нужно извлечь подстроку. [Строка](../data-types/string.md), [FixedString](../data-types/fixedstring.md) или [Enum](../data-types/enum.md)
- `offset` — Начальная позиция подстроки в `s`. [(U)Int*](../data-types/int-uint.md).
- `length` — Максимальная длина подстроки. [(U)Int*](../data-types/int-uint.md). Необязательно.

**Возвращаемое значение**

Подстрока `s` длиной `length` байт, начиная с индекса `offset`.

**Подробности реализации**

Предполагается, что строка содержит допустимый текст в кодировке UTF-8. Если это предположение нарушается, исключение не выбрасывается, и результат неопределен.

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

- s — Строка, из которой нужно извлечь подстроку. [Строка](../data-types/string.md).
- delim — Символ-разделитель. [Строка](../data-types/string.md).
- count — Количество вхождений разделителя, которые нужно подсчитать перед извлечением подстроки. Если count положительное, возвращается всё слева от последнего разделителя (считается слева). Если count отрицательное, возвращается всё справа от последнего разделителя (считается справа). [UInt или Int](../data-types/int-uint.md)

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

Возвращает подстроку `s` до `count` вхождений разделителя `delim`, конкретно для кодовых точек Unicode.

Предполагается, что строка содержит допустимый текст в кодировке UTF-8. Если это предположение нарушается, исключение не выбрасывается, и результат неопределен.

**Синтаксис**

```sql
substringIndexUTF8(s, delim, count)
```

**Аргументы**

- `s` — Строка, из которой нужно извлечь подстроку. [Строка](../data-types/string.md).
- `delim` — Символ-разделитель. [Строка](../data-types/string.md).
- `count` — Количество вхождений разделителя, которые нужно подсчитать перед извлечением подстроки. Если count положительное, возвращается всё слева от последнего разделителя (считается слева). Если count отрицательное, возвращается всё справа от последнего разделителя (считается справа). [UInt или Int](../data-types/int-uint.md)

**Возвращаемое значение**

Подстрока [Строка](../data-types/string.md) `s` до `count` вхождений `delim`.

**Подробности реализации**

Предполагается, что строка содержит допустимый текст в кодировке UTF-8. Если это предположение нарушается, исключение не выбрасывается, и результат неопределен.

**Пример**

```sql
SELECT substringIndexUTF8('www.straßen-in-europa.de', '.', 2)
```

```response
www.straßen-in-europa
```
## appendTrailingCharIfAbsent {#appendtrailingcharifabsent}

Добавляет символ `c` к строке `s`, если `s` непустая и не заканчивается символом `c`.

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
## base58Encode {#base58encode}

Кодирует строку с использованием [Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58) в алфавите "Bitcoin".

**Синтаксис**

```sql
base58Encode(plaintext)
```

**Аргументы**

- `plaintext` — [Строка](../data-types/string.md) или константа.

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

Принимает строку и декодирует её с использованием кодировки [Base58](https://datatracker.ietf.org/doc/html/draft-msporny-base58) с использованием алфавита "Bitcoin".

**Синтаксис**

```sql
base58Decode(encoded)
```

**Аргументы**

- `encoded` — [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md). Если строка не является допустимым значением, закодированным в Base58, будет выброшено исключение.

**Возвращаемое значение**

- Строка, содержащая декодированное значение аргумента. [Строка](../data-types/string.md).

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

- `encoded`: [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md). Если строка не является допустимым значением, закодированным в Base58, возвращает пустую строку в случае ошибки.

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

Кодирует строку или фиксированную строку как base64 в соответствии с [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4).

Псевдоним: `TO_BASE64`.

**Синтаксис**

```sql
base64Encode(plaintext)
```

**Аргументы**

- `plaintext` — [Строка](../data-types/string.md) или константа.

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

Кодирует URL (String или FixedString) в base64 с модификациями, специфичными для URL, в соответствии с [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5).

**Синтаксис**

```sql
base64URLEncode(url)
```

**Аргументы**

- `url` — [String](../data-types/string.md) столбец или константа.

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

Принимает строку и декодирует её из base64, в соответствии с [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-4). Вызывает исключение в случае ошибки.

Псевдоним: `FROM_BASE64`.

**Синтаксис**

```sql
base64Decode(encoded)
```

**Аргументы**

- `encoded` — [String](../data-types/string.md) столбец или константа. Если строка не является допустимым значением, закодированным в Base64, возникает исключение.

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

Принимает URL, закодированный в base64, и декодирует его из base64 с модификациями, специфичными для URL, в соответствии с [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648#section-5). Вызывает исключение в случае ошибки.

**Синтаксис**

```sql
base64URLDecode(encodedUrl)
```

**Аргументы**

- `encodedURL` — [String](../data-types/string.md) столбец или константа. Если строка не является допустимым значением, закодированным в Base64 с модификациями для URL, возникает исключение.

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

- `encoded` — [String](../data-types/string.md) столбец или константа. Если строка не является допустимым значением, закодированным в Base64, возвращает пустую строку.

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

- `encodedURL` — [String](../data-types/string.md) столбец или константа. Если строка не является допустимым значением, закодированным в Base64 с модификациями для URL, возвращает пустую строку.

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

Возвращает, заканчивается ли строка `str` на `suffix`, разница между `endsWithUTF8` и `endsWith` заключается в том, что `endsWithUTF8` сопоставляет `str` и `suffix` по символам UTF-8.

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

Возвращает, начинается ли строка `str` на `prefix`, разница между `startsWithUTF8` и `startsWith` заключается в том, что `startsWithUTF8` сопоставляет `str` и `suffix` по символам UTF-8.

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

Удаляет указанные символы с начала или конца строки. Если не указано иное, функция удаляет пробелы (ASCII-символ 32).

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

Удаляет последовательные вхождения пробелов (ASCII-символ 32) с начала строки.

**Синтаксис**

```sql
trimLeft(input_string[, trim_characters])
```

Псевдоним: `ltrim`.

**Аргументы**

- `input_string` — Строка для обрезки. [String](../data-types/string.md).
- `trim_characters` — Символы для обрезки. Необязательный. [String](../data-types/string.md). Если не указано, используется `' '` (одинарный пробел) в качестве символа обрезки.

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

Удаляет последовательные вхождения пробелов (ASCII-символ 32) с конца строки.

**Синтаксис**

```sql
trimRight(input_string[, trim_characters])
```

Псевдоним: `rtrim`.

**Аргументы**

- `input_string` — Строка для обрезки. [String](../data-types/string.md).
- `trim_characters` — Символы для обрезки. Необязательный. [String](../data-types/string.md). Если не указано, используется `' '` (одинарный пробел) в качестве символа обрезки.

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

Удаляет последовательные вхождения пробелов (ASCII-символ 32) с обоих концов строки.

**Синтаксис**

```sql
trimBoth(input_string[, trim_characters])
```

Псевдоним: `trim`.

**Аргументы**

- `input_string` — Строка для обрезки. [String](../data-types/string.md).
- `trim_characters` — Символы для обрезки. Необязательный. [String](../data-types/string.md). Если не указано, используется `' '` (одинарный пробел) в качестве символа обрезки.

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

Возвращает контрольную сумму CRC32 для строки с использованием полинома CRC-32-IEEE 802.3 и начального значения `0xffffffff` (реализация zlib).

Тип результата — UInt32.
## CRC32IEEE {#crc32ieee}

Возвращает контрольную сумму CRC32 для строки, с использованием полинома CRC-32-IEEE 802.3.

Тип результата — UInt32.
## CRC64 {#crc64}

Возвращает контрольную сумму CRC64 для строки, с использованием полинома CRC-64-ECMA.

Тип результата — UInt64.
## normalizeUTF8NFC {#normalizeutf8nfc}

Конвертирует строку в [нормализованную форму NFC](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms), предполагая, что строка является допустимым текстом, закодированным в UTF8.

**Синтаксис**

```sql
normalizeUTF8NFC(words)
```

**Аргументы**

- `words` — Строка входного текста, закодированная в UTF8. [String](../data-types/string.md).

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

Конвертирует строку в [нормализованную форму NFD](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms), предполагая, что строка является допустимым текстом, закодированным в UTF8.

**Синтаксис**

```sql
normalizeUTF8NFD(words)
```

**Аргументы**

- `words` — Строка входного текста, закодированная в UTF8. [String](../data-types/string.md).

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

Конвертирует строку в [нормализованную форму NFKC](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms), предполагая, что строка является допустимым текстом, закодированным в UTF8.

**Синтаксис**

```sql
normalizeUTF8NFKC(words)
```

**Аргументы**

- `words` — Строка входного текста, закодированная в UTF8. [String](../data-types/string.md).

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

Конвертирует строку в [нормализованную форму NFKD](https://en.wikipedia.org/wiki/Unicode_equivalence#Normal_forms), предполагая, что строка является допустимым текстом, закодированным в UTF8.

**Синтаксис**

```sql
normalizeUTF8NFKD(words)
```

**Аргументы**

- `words` — Строка входного текста, закодированная в UTF8. [String](../data-types/string.md).

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

Экранирует символы со специальным значением в XML, чтобы их можно было разместить в текстовом узле или атрибуте XML.

Следующие символы заменяются: `<`, `&`, `>`, `"`, `'`.
Смотрите также [список ссылок на символы XML и HTML](https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references).

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

Декодирует подстроки со специальным значением в XML. Эти подстроки: `&quot;`, `&amp;`, `&apos;`, `&gt;`, `&lt;`.

Эта функция также заменяет числовые ссылки на символы на символы Юникода. Поддерживаются как десятичные (например, `&#10003;`), так и шестнадцатеричные (`&#x2713;`) формы.

**Синтаксис**

```sql
decodeXMLComponent(x)
```

**Аргументы**

- `x` — Входная строка. [String](../data-types/string.md).

**Возвращаемое значение**

- Декодированная строка. [String](../data-types/string.md).

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

Декодирует подстроки со специальным значением в HTML. Например: `&hbar;`, `&gt;`, `&diamondsuit;`, `&heartsuit;`, `&lt;` и т.д.

Эта функция также заменяет числовые ссылки на символы на символы Юникода. Поддерживаются как десятичные (например, `&#10003;`), так и шестнадцатеричные (`&#x2713;`) формы.

**Синтаксис**

```sql
decodeHTMLComponent(x)
```

**Аргументы**

- `x` — Входная строка. [String](../data-types/string.md).

**Возвращаемое значение**

- Декодированная строка. [String](../data-types/string.md).

**Пример**

```sql
SELECT decodeHTMLComponent(''CH');
SELECT decodeHTMLComponent('I&heartsuit;ClickHouse');
```

Результат:

```result
'CH'
I♥ClickHouse'
```
## extractTextFromHTML {#extracttextfromhtml}

Эта функция извлекает простой текст из HTML или XHTML.

Она не полностью соответствует спецификации HTML, XML или XHTML, но реализация довольно точна и быстра. Правила следующие:

1. Комментарии пропускаются. Пример: `<!-- test -->`. Комментарий должен заканчиваться на `-->`. Вложенные комментарии запрещены.
Примечание: конструкции типа `<!-->` и `<!--->` не являются допустимыми комментариями в HTML, но они пропускаются другими правилами.
2. CDATA копируется без изменений. Примечание: CDATA специфично для XML/XHTML и обрабатывается на основе “лучшего усилия”.
3. Элементы `script` и `style` удаляются вместе со всем их содержимым. Примечание: предполагается, что закрывающий тег не может появиться внутри содержимого. Например, в строковом литерале JS должен быть экранирован как `"<\/script>"`.
Примечание: комментарии и CDATA могут присутствовать внутри `script` или `style` — тогда закрывающие теги не ищутся внутри CDATA. Пример: `<script><![CDATA[</script>]]></script>`. Но они все равно ищутся внутри комментариев. Иногда это становится сложным: `<script>var x = "<!--"; </script> var y = "-->"; alert(x + y);</script>`.
Примечание: `script` и `style` могут быть именами XML-пространств имен — тогда они не обрабатываются как обычные элементы `script` или `style`. Пример: `<script:a>Hello</script:a>`.
Примечание: пробелы возможны после имени закрывающего тега: `</script >`, но не перед: `< / script>`.
4. Другие теги или тегоподобные элементы пропускаются без внутреннего содержимого. Пример: `<a>.</a>`.
Примечание: ожидается, что этот HTML недопустим: `<a test=">"></a>`.
Примечание: также игнорируется что-то, похожее на теги: `<>`, `<!>`, и т.д.
Примечание: тег без конца пропускается до конца ввода: `<hello   `.
5. HTML и XML сущности не декодируются. Они должны обрабатываться отдельной функцией.
6. Пробелы в тексте сокращаются или вставляются по определенным правилам.
    - Пробелы в начале и в конце удаляются.
    - Последовательные пробелы сокращаются.
    - Но если текст разделен другими элементами и пробелов нет, вставляется пробел.
    - Это может привести к неестественным примерам: `Hello<b>world</b>`, `Hello<!-- -->world` — в этом HTML нет пробела, но функция вставляет его. Также учтите: `Hello<p>world</p>`, `Hello<br>world`. Это поведение разумно для анализа данных, например, чтобы преобразовать HTML в пакет слов.
7. Также обратите внимание, что корректная обработка пробелов требует поддержки свойств `<pre></pre>` и CSS `display` и `white-space`.

**Синтаксис**

```sql
extractTextFromHTML(x)
```

**Аргументы**

- `x` — входной текст. [String](../data-types/string.md).

**Возвращаемое значение**

- Извлеченный текст. [String](../data-types/string.md).

**Пример**

Первый пример содержит несколько тегов и комментарий и также демонстрирует обработку пробелов.
Второй пример показывает обработку `CDATA` и элемента `script`.
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

Возвращает кодовую точку ASCII (в виде Int32) первого символа строки `s`.

Если `s` пустая, результат — 0. Если первый символ не является ASCII символом или не является частью диапазона дополнения Latin-1 кодировки UTF-16, результат неопределен.

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
Строка должна быть закодирована в UTF8, в противном случае поведение будет неопределенным.

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

Возвращает текст в формате UTF8 из [строки, закодированной в Punycode](https://en.wikipedia.org/wiki/Punycode).
Если предоставлена недопустимая строка, закодированная в Punycode, возникает исключение.

**Синтаксис**

```sql
punycodeEncode(val)
```

**Аргументы**

- `val` — строка, закодированная в Punycode. [String](../data-types/string.md)

**Возвращаемое значение**

- Исходный текст входного значения. [String](../data-types/string.md)

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

Как `punycodeDecode`, но возвращает пустую строку, если предоставлена недопустимая строка, закодированная в Punycode.
## idnaEncode {#idnaencode}

Возвращает ASCII-представление (алгоритм ToASCII) доменного имени в соответствии с механизмом [Internationalized Domain Names in Applications](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA).
Входная строка должна быть закодирована в UTF и переводима в ASCII-строку, иначе возникает исключение.
Примечание: проводятся декодирование процента или обрезка табуляций, пробелов или управляющих символов не проводится.

**Синтаксис**

```sql
idnaEncode(val)
```

**Аргументы**

- `val` — Входное значение. [String](../data-types/string.md)

**Возвращаемое значение**

- ASCII-представление в соответствии с механизмом IDNA входного значения. [String](../data-types/string.md)

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

Как `idnaEncode`, но возвращает пустую строку в случае ошибки вместо того, чтобы вызывать исключение.
## idnaDecode {#idnadecode}

Возвращает представление Юникода (UTF-8) доменного имени в соответствии с механизмом [Internationalized Domain Names in Applications](https://en.wikipedia.org/wiki/Internationalized_domain_name#Internationalizing_Domain_Names_in_Applications) (IDNA).
В случае ошибки (например, из-за недопустимого ввода) возвращается входная строка.
Обратите внимание, что повторное применение `idnaEncode()` и `idnaDecode()` не обязательно вернет исходную строку из-за нормализации регистра.

**Синтаксис**

```sql
idnaDecode(val)
```

**Аргументы**

- `val` — Входное значение. [String](../data-types/string.md)

**Возвращаемое значение**

- Юникодное (UTF-8) представление в соответствии с механизмом IDNA входного значения. [String](../data-types/string.md)

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

Вычисляет [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между двумя строками байтов.

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

Вычисляет [индекс схожести Жарра](https://en.wikipedia.org/wiki/Jaccard_index) между двумя строками байтов.

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

Вычисляет [расстояние редактирования](https://en.wikipedia.org/wiki/Edit_distance) между двумя строками байтов.

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

Вычисляет [расстояние Дамерау-Левенштейна](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance) между двумя строками байтов.

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

Вычисляет [схожесть Jaro](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro_similarity) между двумя строками байтов.

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

Вычисляет [схожесть Jaro-Winkler](https://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance#Jaro%E2%80%93Winkler_similarity) между двумя строками байтов.

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

Конвертирует первую букву каждого слова в верхний регистр, а остальные — в нижний. Слова — это последовательности алфавитно-цифровых символов, разделенные неалфавитными символами.

:::note
Поскольку `initCap` преобразует только первую букву каждого слова в верхний регистр, вы можете наблюдать неожидаемое поведение для слов, содержащих апострофы или прописные буквы. Например:

```sql
SELECT initCap('mother''s daughter'), initCap('joe McAdam');
```

возвращает

```response
┌─initCap('mother\'s daughter')─┬─initCap('joe McAdam')─┐
│ Mother'S Daughter             │ Joe Mcadam            │
└───────────────────────────────┴───────────────────────┘
```

Это известное поведение, на данный момент нет планов его исправить.
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

Как [initcap](#initcap), `initcapUTF8` преобразует первую букву каждого слова в верхний регистр, а остальные — в нижний. Предполагает, что строка содержит допустимый текст, закодированный в UTF-8.
Если это предположение нарушается, исключение не вызывается, а результат остается неопределенным.

:::note
Эта функция не обнаруживает язык, например, для турецкого результат может быть не совсем правильным (i/İ против i/I).
Если длина байтовой последовательности UTF-8 отличается для верхнего и нижнего регистров какого-либо кода, результат может быть неправильным для этого кода.
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

- Первая строка входного значения или все значение, если нет разделителей строк. [String](../data-types/string.md)

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
## stringCompare {#stringcompare}

Сравнивает две строки лексикографически.

**Синтаксис**

```sql
stringCompare(string1, string2[, str1_off, string2_offset, num_bytes]);
```

**Аргументы**

- `string1` — Первая строка для сравнения. [String](../data-types/string.md)
- `string2` - Вторая строка для сравнения. [String](../data-types/string.md)
- `string1_offset` — Позиция (нумерация с нуля) в `string1`, с которой начинается сравнение. Необязательный, положительный номер.
- `string2_offset` — Позиция (индекс, нумерация с нуля) в `string2`, с которой начинается сравнение. Необязательный, положительный номер.
- `num_bytes` — Максимальное количество байтов для сравнения в обеих строках. Если `string_offset` + `num_bytes` превышает конец входной строки, `num_bytes` будет уменьшено соответствующим образом.

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
