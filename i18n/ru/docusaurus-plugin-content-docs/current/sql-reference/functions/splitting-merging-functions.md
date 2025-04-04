---
description: 'Документация по функциям для разделения строк'
sidebar_label: 'Разделение строк'
sidebar_position: 165
slug: /sql-reference/functions/splitting-merging-functions
title: 'Функции для разделения строк'
---


# Функции для разделения строк

## splitByChar {#splitbychar}

Разделяет строку на подстроки, отделенные заданным символом. Использует константную строку `separator`, которая состоит ровно из одного символа. 
Возвращает массив выбранных подстрок. Пустые подстроки могут быть выбраны, если разделитель встречается в начале или в конце строки, или если есть несколько последовательных разделителей.

**Синтаксис**

```sql
splitByChar(separator, s[, max_substrings]))
```

**Аргументы**

- `separator` — Разделитель, который должен содержать ровно один символ. [String](../data-types/string.md).
- `s` — Строка для разделения. [String](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равный 0. Если `max_substrings` > 0, возвращаемый массив будет содержать не более `max_substrings` подстрок, в противном случае функция вернет как можно больше подстрок.

**Возвращаемые значения**

- Массив выбранных подстрок. [Array](../data-types/array.md)([String](../data-types/string.md)).

Пустые подстроки могут быть выбраны, когда:

- Разделитель встречается в начале или в конце строки;
- Есть несколько последовательных разделителей;
- Исходная строка `s` пуста.

:::note
Поведение параметра `max_substrings` изменилось, начиная с ClickHouse v22.11. В версиях старше этой `max_substrings > 0` означало, что выполняется `max_substrings` разбиений, и остаток строки возвращается в качестве последнего элемента списка.
Например,
- в v22.10: `SELECT splitByChar('=', 'a=b=c=d', 2);` вернул `['a','b','c=d']`
- в v22.11: `SELECT splitByChar('=', 'a=b=c=d', 2);` вернул `['a','b']`

Похожее поведение, как в ClickHouse до v22.11, можно достичь, установив
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

Разделяет строку на подстроки, отделенные строкой. Использует константную строку `separator` из нескольких символов в качестве разделителя. Если строка `separator` пуста, она разделит строку `s` на массив отдельных символов.

**Синтаксис**

```sql
splitByString(separator, s[, max_substrings]))
```

**Аргументы**

- `separator` — Разделитель. [String](../data-types/string.md).
- `s` — Строка для разделения. [String](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равный 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут превышать `max_substrings`, в противном случае функция вернет как можно больше подстрок.

**Возвращаемые значения**

- Массив выбранных подстрок. [Array](../data-types/array.md)([String](../data-types/string.md)).

Пустые подстроки могут быть выбраны, когда:

- Не пустой разделитель встречается в начале или в конце строки;
- Есть несколько последовательных не пустых разделителей;
- Исходная строка `s` пуста, в то время как разделитель не пуст.

:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
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

Разделяет строку на подстроки, отделенные регулярным выражением. Использует строку регулярного выражения `regexp` в качестве разделителя. Если `regexp` пуста, она разделит строку `s` на массив отдельных символов. Если совпадений для этого регулярного выражения не найдено, строка `s` не будет разделена.

**Синтаксис**

```sql
splitByRegexp(regexp, s[, max_substrings]))
```

**Аргументы**

- `regexp` — Регулярное выражение. Константа. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `s` — Строка для разделения. [String](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равный 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут превышать `max_substrings`, в противном случае функция вернет как можно больше подстрок.

**Возвращаемые значения**

- Массив выбранных подстрок. [Array](../data-types/array.md)([String](../data-types/string.md)).

Пустые подстроки могут быть выбраны, когда:

- Не пустое совпадение регулярного выражения встречается в начале или в конце строки;
- Есть несколько последовательных не пустых совпадений регулярного выражения;
- Исходная строка `s` пуста, в то время как регулярное выражение не пусто.

:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
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

Разделяет строку на подстроки, отделенные пробельными символами. 
Возвращает массив выбранных подстрок.

**Синтаксис**

```sql
splitByWhitespace(s[, max_substrings]))
```

**Аргументы**

- `s` — Строка для разделения. [String](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равный 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут превышать `max_substrings`, в противном случае функция вернет как можно больше подстрок.

**Возвращаемые значения**

- Массив выбранных подстрок. [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
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

Разделяет строку на подстроки, отделенные пробельными и знаковыми символами. 
Возвращает массив выбранных подстрок.

**Синтаксис**

```sql
splitByNonAlpha(s[, max_substrings]))
```

**Аргументы**

- `s` — Строка для разделения. [String](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равный 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут превышать `max_substrings`, в противном случае функция вернет как можно больше подстрок.

**Возвращаемые значения**

- Массив выбранных подстрок. [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
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

Конкатенирует строковые представления значений, перечисленных в массиве, с разделителем. `separator` является необязательным параметром: это константная строка, по умолчанию установленная как пустая строка. 
Возвращает строку.

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

- `s` — Строка для разделения. [String](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равный 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут превышать `max_substrings`, в противном случае функция вернет как можно больше подстрок.

**Возвращаемые значения**

- Массив выбранных подстрок. [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
Установка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
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

- `text` — [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `regexp` — Регулярное выражение. Константа. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).

**Возвращаемые значения**

- Если функция находит хотя бы одну соответствующую группу, она возвращает `Array(Array(String))` столбец, сгруппированный по group_id (от 1 до N, где N — количество групп захвата в `regexp`). Если не найдено ни одной соответствующей группы, возвращается пустой массив. [Array](../data-types/array.md).

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

Разделяет строку UTF-8 на n-граммы из `ngramsize` символов.

**Синтаксис** 

```sql
ngrams(string, ngramsize)
```

**Аргументы**

- `string` — Строка. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `ngramsize` — Размер n-граммы. [UInt](../data-types/int-uint.md).

**Возвращаемые значения**

- Массив с n-граммами. [Array](../data-types/array.md)([String](../data-types/string.md)).

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

Разделяет строку на токены, используя неалфавитные ASCII символы в качестве разделителей.

**Аргументы**

- `input_string` — Любой набор байтов, представленный как объект типа [String](../data-types/string.md).

**Возвращаемое значение**

- Результирующий массив токенов из входной строки. [Array](../data-types/array.md).

**Пример**

```sql
SELECT tokens('test1,;\\ test2,;\\ test3,;\\   test4') AS tokens;
```

Результат:

```text
┌─tokens────────────────────────────┐
│ ['test1','test2','test3','test4'] │
└───────────────────────────────────┘
```
