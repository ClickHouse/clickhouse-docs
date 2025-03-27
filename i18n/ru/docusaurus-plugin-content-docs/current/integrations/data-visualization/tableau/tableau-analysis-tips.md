---
sidebar_label: 'Советы по анализу'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Советы по анализу в Tableau при использовании официального соединителя ClickHouse.'
title: 'Советы по анализу'
---


# Советы по анализу
## Функции MEDIAN() и PERCENTILE() {#median-and-percentile-functions}
- В режиме Live функции MEDIAN() и PERCENTILE() (начиная с выпуска соединителя v0.1.3) используют [функцию ClickHouse quantile()()]( /sql-reference/aggregate-functions/reference/quantile/), что значительно ускоряет вычисления, но использует выборку. Если вы хотите получить точные результаты вычислений, используйте функции `MEDIAN_EXACT()` и `PERCENTILE_EXACT()` (основанные на [quantileExact()()]( /sql-reference/aggregate-functions/reference/quantileexact/)).
- В режиме Extract вы не можете использовать MEDIAN_EXACT() и PERCENTILE_EXACT(), так как MEDIAN() и PERCENTILE() всегда точны (и медленные).
## Дополнительные функции для вычисляемых полей в режиме Live {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse имеет огромное количество функций, которые можно использовать для анализа данных — гораздо больше, чем поддерживает Tableau. Для удобства пользователей мы добавили новые функции, которые доступны для использования в режиме Live при создании вычисляемых полей. К сожалению, в интерфейсе Tableau невозможно добавить описания для этих функций, поэтому мы приведем их описание прямо здесь.
- **[`-If` агрегатный комбинатор](/sql-reference/aggregate-functions/combinators/#-if)** *(добавлен в v0.2.3)* - позволяет иметь фильтры на уровне строк прямо в агрегатных расчетах. Добавлены функции `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()`.
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(добавлен в v0.2.1)* — Забудьте о скучных столбчатых диаграммах! Используйте функцию `BAR()` вместо этого (эквивалент [`bar()`](/sql-reference/functions/other-functions#bar) в ClickHouse). Например, это вычисляемое поле возвращает красивые бары в виде строки:
    ```text
    BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
    ```
    ```text
    == BAR() ==
    ██████████████████▊  327.06 million
    █████  88.02 million
    ███████████████  259.37 million
    ```
- **`COUNTD_UNIQ([my_field])`** *(добавлен в v0.2.0)* — Вычисляет приблизительное количество различных значений аргумента. Эквивалент [uniq()](/sql-reference/aggregate-functions/reference/uniq/). Гораздо быстрее, чем `COUNTD()`.
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(добавлен в v0.2.1)* — эквивалент [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#tostartofinterval) в ClickHouse. Округляет дату или дату и время до заданного интервала, например:
    ```text
     == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
        28.07.2004 06:54:50    |              21.07.2004 00:00:00
        17.07.2004 14:01:56    |              11.07.2004 00:00:00
        14.07.2004 07:43:00    |              11.07.2004 00:00:00
    ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(добавлен в v0.2.1)* — Возвращает округленное число с суффиксом (тысяча, миллион, миллиард и т.д.) в виде строки. Полезно для восприятия больших чисел человеком. Эквивалент [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatreadablequantity).
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(добавлен в v0.2.1)* — Принимает временной интервал в секундах. Возвращает временной интервал с (год, месяц, день, час, минута, секунда) в виде строки. `optional_max_unit` — максимальная единица для отображения. Допустимые значения: `seconds`, `minutes`, `hours`, `days`, `months`, `years`. Эквивалент [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatreadabletimedelta).
- **`GET_SETTING([my_setting_name])`** *(добавлен в v0.2.1)* — Возвращает текущее значение настраиваемой настройки. Эквивалент [`getSetting()`](/sql-reference/functions/other-functions#getsetting).
- **`HEX([my_string])`** *(добавлен в v0.2.1)* — Возвращает строку, содержащую шестнадцатеричное представление аргумента. Эквивалент [`hex()`](/sql-reference/functions/encoding-functions/#hex).
- **`KURTOSIS([my_number])`** — Вычисляет выборочную куртозу последовательности. Эквивалент [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp).
- **`KURTOSISP([my_number])`** — Вычисляет куртозу последовательности. Эквивалент [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop).
- **`MEDIAN_EXACT([my_number])`** *(добавлен в v0.1.3)* — Точно вычисляет медиану числовой последовательности. Эквивалент [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
- **`MOD([my_number_1], [my_number_2])`** — Вычисляет остаток после деления. Если аргументы — число с плавающей запятой, то они предварительно преобразуются в целые числа с отбрасыванием десятичной части. Эквивалент [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo).
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(добавлен в v0.1.3)* — Точно вычисляет процентиль числовой последовательности. Рекомендуемый диапазон уровней [0.01, 0.99]. Эквивалент [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
- **`PROPER([my_string])`** *(добавлен в v0.2.5)* - Преобразует текстовую строку так, чтобы первая буква каждого слова была заглавной, а остальные буквы — строчными. Пробелы и неалфавитные символы, такие как знаки препинания, также действуют как разделители. Например:
    ```text
    PROPER("PRODUCT name") => "Product Name"
    ```
    ```text
    PROPER("darcy-mae") => "Darcy-Mae"
    ```
- **`RAND()`** *(добавлен в v0.2.1)* — возвращает целое число (UInt32), например `3446222955`. Эквивалент [`rand()`](/sql-reference/functions/random-functions/#rand).
- **`RANDOM()`** *(добавлен в v0.2.1)* — неофициальная функция Tableau [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results), которая возвращает число с плавающей запятой от 0 до 1.
- **`RAND_CONSTANT([optional_field])`** *(добавлен в v0.2.1)* — Создает постоянный столбец со случайным значением. Что-то вроде `{RAND()}` Фиксированного LOD, но быстрее. Эквивалент [`randConstant()`](/sql-reference/functions/random-functions/#randconstant).
- **`REAL([my_number])`** — Приводит поле к типу с плавающей запятой (Float64). Подробности [`здесь`](/sql-reference/data-types/decimal/#operations-and-result-type).
- **`SHA256([my_string])`** *(добавлен в v0.2.1)* — Вычисляет хэш SHA-256 строки и возвращает полученный набор байтов в виде строки (FixedString). Удобно использовать с функцией `HEX()`, например, `HEX(SHA256([my_string]))`. Эквивалент [`SHA256()`](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256).
- **`SKEWNESS([my_number])`** — Вычисляет выборочную асимметрию последовательности. Эквивалент [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp).
- **`SKEWNESSP([my_number])`** — Вычисляет асимметрию последовательности. Эквивалент [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop).
- **`TO_TYPE_NAME([field])`** *(добавлен в v0.2.1)* — Возвращает строку, содержащую имя типа ClickHouse для переданного аргумента. Эквивалент [`toTypeName()`](/sql-reference/functions/other-functions#totypename).
- **`TRUNC([my_float])`** — Это то же самое, что и функция `FLOOR([my_float])`. Эквивалент [`trunc()`](/sql-reference/functions/rounding-functions#truncate).
- **`UNHEX([my_string])`** *(добавлен в v0.2.1)* — Выполняет противоположную операцию функции `HEX()`. Эквивалент [`unhex()`](/sql-reference/functions/encoding-functions#unhex).
