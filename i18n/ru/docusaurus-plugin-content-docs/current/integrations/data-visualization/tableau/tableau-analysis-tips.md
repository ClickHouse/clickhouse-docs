---
sidebar_label: 'Советы по аналитике'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'онлайн', 'mysql', 'подключить', 'интегрировать', 'интерфейс']
description: 'Советы по аналитике в Tableau при использовании официального соединителя ClickHouse.'
title: 'Советы по аналитике'
---


# Советы по аналитике
## Функции MEDIAN() и PERCENTILE() {#median-and-percentile-functions}
- В режиме Live функции MEDIAN() и PERCENTILE() (начиная с версии соединителя v0.1.3) используют функцию [ClickHouse quantile()()](https://clickhouse.com/sql-reference/aggregate-functions/reference/quantile/), что значительно ускоряет расчёты, но использует выборку. Если вы хотите получить точные результаты вычислений, используйте функции `MEDIAN_EXACT()` и `PERCENTILE_EXACT()` (основанные на [quantileExact()()](https://clickhouse.com/sql-reference/aggregate-functions/reference/quantileexact/)).
- В режиме Extract вы не можете использовать MEDIAN_EXACT() и PERCENTILE_EXACT() потому что MEDIAN() и PERCENTILE() всегда точны (и медленны).
## Дополнительные функции для вычисляемых полей в режиме Live {#additional-functions-for-calculated-fields-in-live-mode}
ClickHouse имеет огромное количество функций, которые можно использовать для анализа данных — гораздо больше, чем поддерживает Tableau. Для удобства пользователей мы добавили новые функции, доступные для использования в режиме Live при создании вычисляемых полей. К сожалению, в интерфейсе Tableau невозможно добавить описания к этим функциям, поэтому мы добавим описание прямо здесь.
- **[`-If` Аггрегационный комбинатор](/sql-reference/aggregate-functions/combinators/#-if)** *(добавлено в v0.2.3)* - позволяет иметь фильтры на уровне строк прямо в агрегированном вычислении. Добавлены функции `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()`.
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(добавлено в v0.2.1)* — Забудьте о скучных столбчатых диаграммах! Вместо этого используйте функцию `BAR()` (эквивалент [`bar()`](/sql-reference/functions/other-functions#bar) в ClickHouse). Например, это вычисляемое поле возвращает красивые бары в виде строки:
    ```text
    BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
    ```
    ```text
    == BAR() ==
    ██████████████████▊  327.06 миллионов
    █████  88.02 миллионов
    ███████████████  259.37 миллионов
    ```
- **`COUNTD_UNIQ([my_field])`** *(добавлено в v0.2.0)* — Вычисляет приблизительное количество различных значений аргумента. Эквивалент [uniq()](/sql-reference/aggregate-functions/reference/uniq/). Значительно быстрее, чем `COUNTD()`.
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(добавлено в v0.2.1)* — эквивалент [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#tostartofinterval) в ClickHouse. Округляет дату или дату и время до заданного интервала, например:
    ```text
     == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
        28.07.2004 06:54:50    |              21.07.2004 00:00:00
        17.07.2004 14:01:56    |              11.07.2004 00:00:00
        14.07.2004 07:43:00    |              11.07.2004 00:00:00
    ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(добавлено в v0.2.1)* — Возвращает округлённое число с суффиксом (тысяча, миллион, миллиард и т.д.) в виде строки. Полезно для чтения больших чисел человеком. Эквивалент [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatreadablequantity).
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(добавлено в v0.2.1)* — Принимает временной интервал в секундах. Возвращает временной интервал с (год, месяц, день, час, минута, секунда) в виде строки. `optional_max_unit` — максимальная единица для отображения. Допустимые значения: `seconds`, `minutes`, `hours`, `days`, `months`, `years`. Эквивалент [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatreadabletimedelta).
- **`GET_SETTING([my_setting_name])`** *(добавлено в v0.2.1)* — Возвращает текущее значение настраиваемого параметра. Эквивалент [`getSetting()`](/sql-reference/functions/other-functions#getsetting).
- **`HEX([my_string])`** *(добавлено в v0.2.1)* — Возвращает строку, содержащую шестнадцатеричное представление аргумента. Эквивалент [`hex()`](/sql-reference/functions/encoding-functions/#hex).
- **`KURTOSIS([my_number])`** — Вычисляет выборочную куртозу последовательности. Эквивалент [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp).
- **`KURTOSISP([my_number])`** — Вычисляет куртозу последовательности. Эквивалент [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop).
- **`MEDIAN_EXACT([my_number])`** *(добавлено в v0.1.3)* — Точно вычисляет медиану последовательности числовых данных. Эквивалент [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
- **`MOD([my_number_1], [my_number_2])`** — Вычисляет остаток после деления. Если аргументы являются числами с плавающей точкой, они предварительно преобразуются в целые числа за счёт отбрасывания десятичной части. Эквивалент [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo).
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(добавлено в v0.1.3)* — Точно вычисляет процентиль последовательности числовых данных. Рекомендуемый диапазон уровней [0.01, 0.99]. Эквивалент [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
- **`PROPER([my_string])`** *(добавлено в v0.2.5)* - Преобразует текстовую строку так, чтобы первая буква каждого слова была заглавной, а остальные буквы — строчными. Пробелы и неалфавитные символы, такие как знаки препинания, также служат разделителями. Например:
    ```text
    PROPER("PRODUCT name") => "Product Name"
    ```
    ```text
    PROPER("darcy-mae") => "Darcy-Mae"
    ```
- **`RAND()`** *(добавлено в v0.2.1)* — возвращает целое число (UInt32), например `3446222955`. Эквивалент [`rand()`](/sql-reference/functions/random-functions/#rand).
- **`RANDOM()`** *(добавлено в v0.2.1)* — неофициальная функция [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau, которая возвращает число с плавающей запятой от 0 до 1.
- **`RAND_CONSTANT([optional_field])`** *(добавлено в v0.2.1)* — Создаёт постоянную колонку с случайным значением. Что-то вроде `{RAND()}` фиксированного уровня детализации, но быстрее. Эквивалент [`randConstant()`](/sql-reference/functions/random-functions/#randconstant).
- **`REAL([my_number])`** — Приводит поле к типу float (Float64). Подробности [`здесь`](/sql-reference/data-types/decimal/#operations-and-result-type).
- **`SHA256([my_string])`** *(добавлено в v0.2.1)* — Вычисляет SHA-256 хеш от строки и возвращает результирующий набор байтов в виде строки (FixedString). Удобно использовать с функцией `HEX()`, например, `HEX(SHA256([my_string]))`. Эквивалент [`SHA256()`](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256).
- **`SKEWNESS([my_number])`** — Вычисляет выборочную асимметрию последовательности. Эквивалент [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp).
- **`SKEWNESSP([my_number])`** — Вычисляет асимметрию последовательности. Эквивалент [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop).
- **`TO_TYPE_NAME([field])`** *(добавлено в v0.2.1)* — Возвращает строку, содержащую имя типа ClickHouse для переданного аргумента. Эквивалент [`toTypeName()`](/sql-reference/functions/other-functions#totypename).
- **`TRUNC([my_float])`** — То же самое, что и функция `FLOOR([my_float])`. Эквивалент [`trunc()`](/sql-reference/functions/rounding-functions#truncate).
- **`UNHEX([my_string])`** *(добавлено в v0.2.1)* — Выполняет противоположную операцию функции `HEX()`. Эквивалент [`unhex()`](/sql-reference/functions/encoding-functions#unhex).
