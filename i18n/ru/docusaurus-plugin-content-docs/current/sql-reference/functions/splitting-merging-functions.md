---
description: 'Документация по функциям для разбивки строк'
sidebar_label: 'Разбиение строк'
sidebar_position: 165
slug: /sql-reference/functions/splitting-merging-functions
title: 'Функции для разбивки строк'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Функции для разбивки строк

## splitByChar {#splitbychar}

Разбивает строку на подстроки, разделенные указанным символом. Использует постоянную строку `separator`, состоящую ровно из одного символа. Возвращает массив выбранных подстрок. Пустые подстроки могут быть выбраны, если разделитель находится в начале или конце строки, или если есть несколько последовательных разделителей.

**Синтаксис**

```sql
splitByChar(separator, s[, max_substrings]))
```

**Аргументы**

- `separator` — Разделитель должен быть символом с одним байтом. [Строка](../data-types/string.md).
- `s` — Строка для разбивки. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный параметр `Int64`, по умолчанию равен 0. Если `max_substrings` > 0, возвращаемый массив будет содержать не более `max_substrings` подстрок, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

Пустые подстроки могут быть выбраны, когда:

- Разделитель находится в начале или конце строки;
- Есть несколько последовательных разделителей;
- Исходная строка `s` пуста.

:::note
Поведение параметра `max_substrings` изменилось, начиная с ClickHouse v22.11. В версиях старше этой, `max_substrings > 0` означало, что выполнено `max_substring` разбиений, и оставшаяся часть строки возвращалась в качестве последнего элемента списка.
Например,
- в v22.10: `SELECT splitByChar('=', 'a=b=c=d', 2);` вернул `['a','b','c=d']`
- в v22.11: `SELECT splitByChar('=', 'a=b=c=d', 2);` вернул `['a','b']`

Поведение, аналогичное ClickHouse до v22.11, может быть достигнуто, установив
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)
`SELECT splitByChar('=', 'a=b=c=d', 2) SETTINGS splitby_max_substrings_includes_remaining_string = 1 -- ['a', 'b=c=d']`
:::

**Пример**

```sql
SELECT splitByChar(',', '1,2,3,abcde');
```

Результат:

```text
┌─splitByChar(',', '1,2,3,abcde')─┐
│ ['1','2','3','abcde']           │
└─────────────────────────────────┘
```

## splitByString {#splitbystring}

Разбивает строку на подстроки, разделенные строкой. Использует постоянную строку `separator` из нескольких символов в качестве разделителя. Если строка `separator` пуста, она разделит строку `s` на массив отдельных символов.

**Синтаксис**

```sql
splitByString(separator, s[, max_substrings]))
```

**Аргументы**

- `separator` — Разделитель. [Строка](../data-types/string.md).
- `s` — Строка для разбивки. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный параметр `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки будут не более чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

Пустые подстроки могут быть выбраны, когда:

- Непустой разделитель находится в начале или конце строки;
- Есть несколько последовательных непустых разделителей;
- Исходная строка `s` пуста, а разделитель непустой.

:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включена ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

```sql
SELECT splitByString(', ', '1, 2 3, 4,5, abcde');
```

Результат:

```text
┌─splitByString(', ', '1, 2 3, 4,5, abcde')─┐
│ ['1','2 3','4,5','abcde']                 │
└───────────────────────────────────────────┘
```

```sql
SELECT splitByString('', 'abcde');
```

Результат:

```text
┌─splitByString('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByRegexp {#splitbyregexp}

Разбивает строку на подстроки, разделенные регулярным выражением. Использует строку регулярного выражения `regexp` в качестве разделителя. Если `regexp` пуст, она разделит строку `s` на массив отдельных символов. Если совпадение по этому регулярному выражению не найдено, строка `s` не будет разбита.

**Синтаксис**

```sql
splitByRegexp(regexp, s[, max_substrings]))
```

**Аргументы**

- `regexp` — Регулярное выражение. Константа. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `s` — Строка для разбивки. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный параметр `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки будут не более чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

Пустые подстроки могут быть выбраны, когда:

- Непустое совпадение регулярного выражения находится в начале или конце строки;
- Есть несколько последовательных непустых совпадений регулярного выражения;
- Исходная строка `s` пуста, а регулярное выражение непустое.

:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включена ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

```sql
SELECT splitByRegexp('\\d+', 'a12bc23de345f');
```

Результат:

```text
┌─splitByRegexp('\\d+', 'a12bc23de345f')─┐
│ ['a','bc','de','f']                    │
└────────────────────────────────────────┘
```

```sql
SELECT splitByRegexp('', 'abcde');
```

Результат:

```text
┌─splitByRegexp('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByWhitespace {#splitbywhitespace}

Разбивает строку на подстроки, разделенные символами пробела. 
Возвращает массив выбранных подстрок.

**Синтаксис**

```sql
splitByWhitespace(s[, max_substrings]))
```

**Аргументы**

- `s` — Строка для разбивки. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный параметр `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки будут не более чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).
 
:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включена ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

```sql
SELECT splitByWhitespace('  1!  a,  b.  ');
```

Результат:

```text
┌─splitByWhitespace('  1!  a,  b.  ')─┐
│ ['1!','a,','b.']                    │
└─────────────────────────────────────┘
```

## splitByNonAlpha {#splitbynonalpha}

Разбивает строку на подстроки, разделенные символами пробела и пунктуации. 
Возвращает массив выбранных подстрок.

**Синтаксис**

```sql
splitByNonAlpha(s[, max_substrings]))
```

**Аргументы**

- `s` — Строка для разбивки. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный параметр `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки будут не более чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включена ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

```sql
SELECT splitByNonAlpha('  1!  a,  b.  ');
```

```text
┌─splitByNonAlpha('  1!  a,  b.  ')─┐
│ ['1','a','b']                     │
└───────────────────────────────────┘
```

## arrayStringConcat {#arraystringconcat}

Конкатенирует строковые представления значений, перечисленных в массиве, с разделителем. `separator` является необязательным параметром: постоянная строка, по умолчанию равная пустой строке. Возвращает строку.

**Синтаксис**

```sql
arrayStringConcat(arr\[, separator\])
```

**Пример**

```sql
SELECT arrayStringConcat(['12/05/2021', '12:50:00'], ' ') AS DateString;
```

Результат:

```text
┌─DateString──────────┐
│ 12/05/2021 12:50:00 │
└─────────────────────┘
```

## alphaTokens {#alphatokens}

Выбирает подстроки последовательных байтов из диапазонов a-z и A-Z. Возвращает массив подстрок.

**Синтаксис**

```sql
alphaTokens(s[, max_substrings]))
```

Псевдоним: `splitByAlpha`

**Аргументы**

- `s` — Строка для разбивки. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный параметр `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки будут не более чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включена ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

```sql
SELECT alphaTokens('abca1abc');
```

```text
┌─alphaTokens('abca1abc')─┐
│ ['abca','abc']          │
└─────────────────────────┘
```

## extractAllGroups {#extractallgroups}

Извлекает все группы из неперекрывающихся подстрок, соответствующих регулярному выражению.

**Синтаксис**

```sql
extractAllGroups(text, regexp)
```

**Аргументы**

- `text` — [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `regexp` — Регулярное выражение. Константа. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).

**Возвращаемые значения**

- Если функция находит хотя бы одну совпадающую группу, она возвращает `Array(Array(String))` столбец, сгруппированный по group_id (от 1 до N, где N — число захватывающих групп в `regexp`). Если группы совпадения отсутствуют, возвращается пустой массив. [Массив](../data-types/array.md).

**Пример**

```sql
SELECT extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

Результат:

```text
┌─extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','123'],['8','"hkl"']]                                         │
└───────────────────────────────────────────────────────────────────────┘
```

## ngrams {#ngrams}

<DeprecatedBadge/>

Разбивает строку UTF-8 на n-граммы размером `ngramsize` символов. Эта функция устарела. Рекомендуется использовать [tokens](#tokens) с токенизатором `ngram`. Функция может быть удалена в какой-то момент в будущем.

**Синтаксис**

```sql
ngrams(string, ngramsize)
```

**Аргументы**

- `string` — Строка. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `ngramsize` — Размер n-граммы. [UInt](../data-types/int-uint.md).

**Возвращаемые значения**

- Массив с n-граммами. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

**Пример**

```sql
SELECT ngrams('ClickHouse', 3);
```

Результат:

```text
┌─ngrams('ClickHouse', 3)───────────────────────────┐
│ ['Cli','lic','ick','ckH','kHo','Hou','ous','use'] │
└───────────────────────────────────────────────────┘
```

## tokens {#tokens}

Разбивает строку на токены с использованием данного токенизатора. 
По умолчанию токенизатор использует неалфавитные ASCII-символы в качестве разделителей.

**Аргументы**

- `value` — Входная строка. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `tokenizer` — Токенизатор для использования. Допустимые аргументы: `default`, `ngram` и `noop`. Необязательный параметр, если не указан явно, по умолчанию равен `default`. [const String](../data-types/string.md)
- `ngrams` — Только актуально, если аргумент `tokenizer` равен `ngram`: Необязательный параметр, который определяет длину n-граммов. Если не установлен явно, по умолчанию равен `3`. [UInt8](../data-types/int-uint.md).

**Возвращаемое значение**

- Результирующий массив токенов из входной строки. [Массив](../data-types/array.md).

**Пример**

С использованием настроек по умолчанию:

```sql
SELECT tokens('test1,;\\ test2,;\\ test3,;\\   test4') AS tokens;
```

Результат:

```text
┌─tokens────────────────────────────┐
│ ['test1','test2','test3','test4'] │
└───────────────────────────────────┘
```

С использованием токенизатора ngram с длиной ngram 3:

```sql
SELECT tokens('abc def', 'ngram', 3) AS tokens;
```

Результат:

```text
┌─tokens──────────────────────────┐
│ ['abc','bc ','c d',' de','def'] │
└─────────────────────────────────┘
```
