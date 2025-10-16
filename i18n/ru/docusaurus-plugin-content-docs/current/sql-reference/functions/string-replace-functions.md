---
slug: '/sql-reference/functions/string-replace-functions'
sidebar_label: 'Замена в строках'
description: 'Документация по Functions for Replacing in Strings'
title: 'Функции для замены в строках'
doc_type: reference
---
# Функции замены в строках

[Общие функции строк](string-functions.md) и [функции поиска в строках](string-search-functions.md) описаны отдельно.

## overlay {#overlay}

Заменяет часть строки `input` на другую строку `replace`, начиная с индексa `offset`, основанного на 1.

**Синтаксис**

```sql
overlay(s, replace, offset[, length])
```

**Параметры**

- `s`: строковый тип [String](../data-types/string.md).
- `replace`: строковый тип [String](../data-types/string.md).
- `offset`: целочисленный тип [Int](../data-types/int-uint.md) (основанный на 1). Если `offset` отрицательный, он считается от конца строки `s`.
- `length`: необязательный. Целочисленный тип [Int](../data-types/int-uint.md). `length` указывает длину фрагмента в входной строке `s`, который будет заменен. Если `length` не указан, количество байт, удаленных из `s`, равно длине `replace`; в противном случае удаляются `length` байт.

**Возвращаемое значение**

- Значение типа [String](../data-types/string.md).

**Пример**

```sql
SELECT overlay('My father is from Mexico.', 'mother', 4) AS res;
```

Результат:

```text
┌─res──────────────────────┐
│ My mother is from Mexico.│
└──────────────────────────┘
```

```sql
SELECT overlay('My father is from Mexico.', 'dad', 4, 6) AS res;
```

Результат:

```text
┌─res───────────────────┐
│ My dad is from Mexico.│
└───────────────────────┘
```

## overlayUTF8 {#overlayutf8}

Заменяет часть строки `input` на другую строку `replace`, начиная с индексa `offset`, основанного на 1.

Предполагается, что строка содержит текст с кодировкой UTF-8. Если это предположение нарушено, исключение не выбрасывается, и результат неопределен.

**Синтаксис**

```sql
overlayUTF8(s, replace, offset[, length])
```

**Параметры**

- `s`: строковый тип [String](../data-types/string.md).
- `replace`: строковый тип [String](../data-types/string.md).
- `offset`: целочисленный тип [Int](../data-types/int-uint.md) (основанный на 1). Если `offset` отрицательный, он считается от конца входной строки `s`.
- `length`: необязательный. Целочисленный тип [Int](../data-types/int-uint.md). `length` указывает длину фрагмента в входной строке `s`, который будет заменен. Если `length` не указан, количество символов, удаленных из `s`, равно длине `replace`; в противном случае удаляются `length` символов.

**Возвращаемое значение**

- Значение типа [String](../data-types/string.md).

**Пример**

```sql
SELECT overlay('Mein Vater ist aus Österreich.', 'der Türkei', 20) AS res;
```

Результат:

```text
┌─res───────────────────────────┐
│ Mein Vater ist aus der Türkei.│
└───────────────────────────────┘
```

## replaceOne {#replaceone}

Заменяет первое вхождение подстроки `pattern` в `haystack` на строку `replacement`.

**Синтаксис**

```sql
replaceOne(haystack, pattern, replacement)
```

## replaceAll {#replaceall}

Заменяет все вхождения подстроки `pattern` в `haystack` на строку `replacement`.

**Синтаксис**

```sql
replaceAll(haystack, pattern, replacement)
```

Псевдоним: `replace`.

## replaceRegexpOne {#replaceregexpone}

Заменяет первое вхождение подстроки, соответствующей регулярному выражению `pattern` (в [синтаксисе re2](https://github.com/google/re2/wiki/Syntax)), в `haystack` на строку `replacement`.

`replacement` может содержать подстановки `\0-\9`. 
Подстановки `\1-\9` соответствуют 1-й до 9-й захватывающей группе (субвыражению), подстановка `\0` соответствует полному совпадению.

Чтобы использовать символ `\` в строках `pattern` или `replacement`, экранируйте его с помощью `\`. Также имейте в виду, что строковые литералы требуют дополнительного экранирования.

**Синтаксис**

```sql
replaceRegexpOne(haystack, pattern, replacement)
```

**Пример**

Преобразование дат ISO в американский формат:

```sql
SELECT DISTINCT
    EventDate,
    replaceRegexpOne(toString(EventDate), '(\\d{4})-(\\d{2})-(\\d{2})', '\\2/\\3/\\1') AS res
FROM test.hits
LIMIT 7
FORMAT TabSeparated
```

Результат:

```text
2014-03-17      03/17/2014
2014-03-18      03/18/2014
2014-03-19      03/19/2014
2014-03-20      03/20/2014
2014-03-21      03/21/2014
2014-03-22      03/22/2014
2014-03-23      03/23/2014
```

Копирование строки десять раз:

```sql
SELECT replaceRegexpOne('Hello, World!', '.*', '\\0\\0\\0\\0\\0\\0\\0\\0\\0\\0') AS res
```

Результат:

```text
┌─res────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World!Hello, World! │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## replaceRegexpAll {#replaceregexpall}

Как `replaceRegexpOne`, но заменяет все вхождения шаблона.

Псевдоним: `REGEXP_REPLACE`.

**Пример**

```sql
SELECT replaceRegexpAll('Hello, World!', '.', '\\0\\0') AS res
```

Результат:

```text
┌─res────────────────────────┐
│ HHeelllloo,,  WWoorrlldd!! │
└────────────────────────────┘
```

В качестве исключения, если регулярное выражение сработало на пустой подстроке, замена не выполняется больше одного раза, например:

```sql
SELECT replaceRegexpAll('Hello, World!', '^', 'here: ') AS res
```

Результат:

```text
┌─res─────────────────┐
│ here: Hello, World! │
└─────────────────────┘
```

## regexpQuoteMeta {#regexpquotemeta}

Добавляет обратную косую черту перед этими символами, имеющими специальное значение в регулярных выражениях: `\0`, `\\`, `|`, `(`, `)`, `^`, `$`, `.`, `[`, `]`, `?`, `*`, `+`, `{`, `:`, `-`.

Эта реализация немного отличается от re2::RE2::QuoteMeta. Она экранирует нулевой байт как `\0`, а не `\x00`, и экранирует только требуемые символы.
Для получения дополнительной информации см. [RE2](https://github.com/google/re2/blob/master/re2/re2.cc#L473)

**Синтаксис**

```sql
regexpQuoteMeta(s)
```

## format {#format}

Форматирует строку `pattern` со значениями (строки, целые числа и т.д.), перечисленными в аргументах, аналогично форматированию в Python. Строка шаблона может содержать поля замены, окруженные фигурными скобками `{}`. Все, что не находится в скобках, считается литеральным текстом и копируется в вывод без изменений. Литеральный символ скобки может быть экранирован двумя скобками: `{{ '{{' }}` и `{{ '}}' }}`. Имена полей могут быть числами (начиная с нуля) или пустыми (тогда они неявно получают монотонно возрастающие номера).

**Синтаксис**

```sql
format(pattern, s0, s1, ...)
```

**Пример**

```sql
SELECT format('{1} {0} {1}', 'World', 'Hello')
```

```result
┌─format('{1} {0} {1}', 'World', 'Hello')─┐
│ Hello World Hello                       │
└─────────────────────────────────────────┘
```

С неявными числами:

```sql
SELECT format('{} {}', 'Hello', 'World')
```

```result
┌─format('{} {}', 'Hello', 'World')─┐
│ Hello World                       │
└───────────────────────────────────┘
```

## translate {#translate}

Заменяет символы в строке `s` с помощью сопоставления символов «один к одному», определенного строками `from` и `to`. `from` и `to` должны быть постоянными ASCII-строками. Если `from` и `to` имеют одинаковые размеры, каждое вхождение 1-го символа `first` в `s` заменяется на 1-й символ `to`, 2-й символ `first` в `s` заменяется на 2-й символ `to` и т.д. Если `from` содержит больше символов, чем `to`, все вхождения символов в конце `from`, у которых нет соответствующего символа в `to`, удаляются из `s`. Не ASCII символы в `s` функцией не изменяются.

**Синтаксис**

```sql
translate(s, from, to)
```

**Пример**

```sql
SELECT translate('Hello, World!', 'delor', 'DELOR') AS res
```

Результат:

```text
┌─res───────────┐
│ HELLO, WORLD! │
└───────────────┘
```

`from` и `to` имеют разные длины:

```sql
SELECT translate('clickhouse', 'clickhouse', 'CLICK') AS res
```

Результат:

```text
┌─res───┐
│ CLICK │
└───────┘
```

## translateUTF8 {#translateutf8}

Как [translate](#translate), но предполагает, что `s`, `from` и `to` являются строками с кодировкой UTF-8.

**Синтаксис**

```sql
translateUTF8(s, from, to)
```

**Параметры**

- `s`: строковый тип [String](../data-types/string.md).
- `from`: строковый тип [String](../data-types/string.md).
- `to`: строковый тип [String](../data-types/string.md).

**Возвращаемое значение**

- Значение типа [String](../data-types/string.md).

**Примеры**

Запрос:

```sql
SELECT translateUTF8('Münchener Straße', 'üß', 'us') AS res;
```

```response
┌─res──────────────┐
│ Munchener Strase │
└──────────────────┘
```

## printf {#printf}

Функция `printf` форматирует заданную строку со значениями (строки, целые числа, числа с плавающей запятой и т.д.), перечисленными в аргументах, аналогично функции printf в C++. Строка формата может содержать спецификаторы формата, начинающиеся с символа `%`. Все, что не входит в `%` и следующий спецификатор формата, считается литеральным текстом и копируется в вывод без изменений. Литеральный символ `%` может быть экранирован как `%%`.

**Синтаксис**

```sql
printf(format, arg1, arg2, ...)
```

**Пример**

Запрос:

```sql
SELECT printf('%%%s %s %d', 'Hello', 'World', 2024);
```
```response
┌─printf('%%%s %s %d', 'Hello', 'World', 2024)─┐
│ %Hello World 2024                            │
└──────────────────────────────────────────────┘
```

<!-- 
Внутреннее содержание тегов ниже будет заменено во время сборки документации 
документацией, сгенерированной из system.functions. Пожалуйста, не изменяйте и не удаляйте теги.
См. : https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->