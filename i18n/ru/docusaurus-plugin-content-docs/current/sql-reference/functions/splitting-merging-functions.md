---
slug: /sql-reference/functions/splitting-merging-functions
sidebar_position: 165
sidebar_label: Разделение строк
---


# Функции для разделения строк

## splitByChar {#splitbychar}

Разделяет строку на подстроки, разделенные указанным символом. Использует постоянную строку `separator`, состоящую ровно из одного символа. Возвращает массив выбранных подстрок. Пустые подстроки могут быть выбраны, если разделитель встречается в начале или конце строки или если есть несколько последовательных разделителей.

**Синтаксис**

``` sql
splitByChar(separator, s[, max_substrings]))
```

**Аргументы**

- `separator` — Разделитель, который должен содержать ровно один символ. [Строка](../data-types/string.md).
- `s` — Строка для разделения. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равен 0. Если `max_substrings` > 0, возвращаемый массив будет содержать не более `max_substrings` подстрок, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

 Пустые подстроки могут быть выбраны, когда:

- Разделитель встречается в начале или конце строки;
- Есть несколько последовательных разделителей;
- Исходная строка `s` пуста.

:::note
Поведение параметра `max_substrings` изменилось, начиная с ClickHouse v22.11. В более ранних версиях, `max_substrings > 0` означало, что было выполнено `max_substring`-количество разбиений, и остаток строки возвращался как последний элемент списка.
Например,
- в v22.10: `SELECT splitByChar('=', 'a=b=c=d', 2);` возвращало `['a','b','c=d']`
- в v22.11: `SELECT splitByChar('=', 'a=b=c=d', 2);` возвращало `['a','b']`

Поведение, аналогичное ClickHouse до v22.11, можно достичь, установив
[splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string)
`SELECT splitByChar('=', 'a=b=c=d', 2) SETTINGS splitby_max_substrings_includes_remaining_string = 1 -- ['a', 'b=c=d']`
:::

**Пример**

``` sql
SELECT splitByChar(',', '1,2,3,abcde');
```

Результат:

``` text
┌─splitByChar(',', '1,2,3,abcde')─┐
│ ['1','2','3','abcde']           │
└─────────────────────────────────┘
```

## splitByString {#splitbystring}

Разделяет строку на подстроки, разделенные строкой. Используется постоянная строка `separator`, состоящая из нескольких символов в качестве разделителя. Если строка `separator` пуста, строка `s` разделяется на массив отдельных символов.

**Синтаксис**

``` sql
splitByString(separator, s[, max_substrings]))
```

**Аргументы**

- `separator` — Разделитель. [Строка](../data-types/string.md).
- `s` — Строка для разделения. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут больше, чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

Пустые подстроки могут быть выбраны, когда:

- Не пустой разделитель встречается в начале или конце строки;
- Есть несколько последовательных непустых разделителей;
- Исходная строка `s` пуста, в то время как разделитель не пуст.

:::note
Настройка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

``` sql
SELECT splitByString(', ', '1, 2 3, 4,5, abcde');
```

Результат:

``` text
┌─splitByString(', ', '1, 2 3, 4,5, abcde')─┐
│ ['1','2 3','4,5','abcde']                 │
└───────────────────────────────────────────┘
```

``` sql
SELECT splitByString('', 'abcde');
```

Результат:

``` text
┌─splitByString('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByRegexp {#splitbyregexp}

Разделяет строку на подстроки, разделенные регулярным выражением. Использует строку регулярного выражения `regexp` в качестве разделителя. Если `regexp` пуст, строка `s` разделяется на массив отдельных символов. Если совпадение с этим регулярным выражением не найдено, строка `s` не будет разделена.

**Синтаксис**

``` sql
splitByRegexp(regexp, s[, max_substrings]))
```

**Аргументы**

- `regexp` — Регулярное выражение. Константа. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `s` — Строка для разделения. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут больше, чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

Пустые подстроки могут быть выбраны, когда:

- Не пустое совпадение регулярного выражения встречается в начале или конце строки;
- Есть несколько последовательных непустых совпадений регулярного выражения;
- Исходная строка `s` пуста, в то время как регулярное выражение непусто.

:::note
Настройка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

``` sql
SELECT splitByRegexp('\\d+', 'a12bc23de345f');
```

Результат:

``` text
┌─splitByRegexp('\\d+', 'a12bc23de345f')─┐
│ ['a','bc','de','f']                    │
└────────────────────────────────────────┘
```

``` sql
SELECT splitByRegexp('', 'abcde');
```

Результат:

``` text
┌─splitByRegexp('', 'abcde')─┐
│ ['a','b','c','d','e']      │
└────────────────────────────┘
```

## splitByWhitespace {#splitbywhitespace}

Разделяет строку на подстроки, разделенные пробельными символами. Возвращает массив выбранных подстрок.

**Синтаксис**

``` sql
splitByWhitespace(s[, max_substrings]))
```

**Аргументы**

- `s` — Строка для разделения. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут больше, чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).
 
:::note
Настройка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

``` sql
SELECT splitByWhitespace('  1!  a,  b.  ');
```

Результат:

``` text
┌─splitByWhitespace('  1!  a,  b.  ')─┐
│ ['1!','a,','b.']                    │
└─────────────────────────────────────┘
```

## splitByNonAlpha {#splitbynonalpha}

Разделяет строку на подстроки, разделенные пробельными и пунктуационными символами. Возвращает массив выбранных подстрок.

**Синтаксис**

``` sql
splitByNonAlpha(s[, max_substrings]))
```

**Аргументы**

- `s` — Строка для разделения. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут больше, чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

:::note
Настройка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

``` sql
SELECT splitByNonAlpha('  1!  a,  b.  ');
```

``` text
┌─splitByNonAlpha('  1!  a,  b.  ')─┐
│ ['1','a','b']                     │
└───────────────────────────────────┘
```

## arrayStringConcat {#arraystringconcat}

Конкатенирует строковые представления значений, перечисленных в массиве, с разделителем. `separator` является необязательным параметром: постоянной строкой, по умолчанию установленной в пустую строку. Возвращает строку.

**Синтаксис**

```sql
arrayStringConcat(arr\[, separator\])
```

**Пример**

``` sql
SELECT arrayStringConcat(['12/05/2021', '12:50:00'], ' ') AS DateString;
```

Результат:

```text
┌─DateString──────────┐
│ 12/05/2021 12:50:00 │
└─────────────────────┘
```

## alphaTokens {#alphatokens}

Выбирает подстроки последовательных байтов из диапазона a-z и A-Z. Возвращает массив подстрок.

**Синтаксис**

``` sql
alphaTokens(s[, max_substrings]))
```

Псевдоним: `splitByAlpha`

**Аргументы**

- `s` — Строка для разделения. [Строка](../data-types/string.md).
- `max_substrings` — Необязательный `Int64`, по умолчанию равен 0. Когда `max_substrings` > 0, возвращаемые подстроки не будут больше, чем `max_substrings`, в противном случае функция вернет столько подстрок, сколько возможно.

**Возвращаемое значение(я)**

- Массив выбранных подстрок. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

:::note
Настройка [splitby_max_substrings_includes_remaining_string](../../operations/settings/settings.md#splitby_max_substrings_includes_remaining_string) (по умолчанию: 0) управляет тем, включается ли оставшаяся строка в последний элемент результирующего массива, когда аргумент `max_substrings` > 0.
:::

**Пример**

``` sql
SELECT alphaTokens('abca1abc');
```

``` text
┌─alphaTokens('abca1abc')─┐
│ ['abca','abc']          │
└─────────────────────────┘
```

## extractAllGroups {#extractallgroups}

Извлекает все группы из неперекрывающихся подстрок, соответствующих регулярному выражению.

**Синтаксис**

``` sql
extractAllGroups(text, regexp)
```

**Аргументы**

- `text` — [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `regexp` — Регулярное выражение. Константа. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).

**Возвращаемые значения**

- Если функция находит хотя бы одну подходящую группу, она возвращает `Array(Array(String))` столбец, сгруппированный по group_id (от 1 до N, где N — количество захватывающих групп в `regexp`). Если нет подходящей группы, возвращает пустой массив. [Массив](../data-types/array.md).

**Пример**

``` sql
SELECT extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

Результат:

``` text
┌─extractAllGroups('abc=123, 8="hkl"', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','123'],['8','"hkl"']]                                         │
└───────────────────────────────────────────────────────────────────────┘
```

## ngrams {#ngrams}

Разделяет строку UTF-8 на n-граммы длиной `ngramsize` символов.

**Синтаксис** 

``` sql
ngrams(string, ngramsize)
```

**Аргументы**

- `string` — Строка. [Строка](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `ngramsize` — Размер n-граммы. [UInt](../data-types/int-uint.md).

**Возвращаемые значения**

- Массив с n-граммами. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

**Пример**

``` sql
SELECT ngrams('ClickHouse', 3);
```

Результат:

``` text
┌─ngrams('ClickHouse', 3)───────────────────────────┐
│ ['Cli','lic','ick','ckH','kHo','Hou','ous','use'] │
└───────────────────────────────────────────────────┘
```

## tokens {#tokens}

Разделяет строку на токены, используя не алфавитные символы ASCII в качестве разделителей.

**Аргументы**

- `input_string` — Любой набор байтов, представленный как объект типа [Строка](../data-types/string.md).

**Возвращаемое значение**

- Результирующий массив токенов из входной строки. [Массив](../data-types/array.md).

**Пример**

``` sql
SELECT tokens('test1,;\\ test2,;\\ test3,;\\   test4') AS tokens;
```

Результат:

``` text
┌─tokens────────────────────────────┐
│ ['test1','test2','test3','test4'] │
└───────────────────────────────────┘
```
