---
sidebar_label: 'Рекомендации по анализу'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Рекомендации по анализу данных в Tableau при использовании официального коннектора ClickHouse.'
title: 'Рекомендации по анализу'
doc_type: 'guide'
---



# Советы по анализу данных

## Функции MEDIAN() и PERCENTILE() {#median-and-percentile-functions}

- В режиме Live функции MEDIAN() и PERCENTILE() (начиная с версии коннектора v0.1.3) используют [функцию ClickHouse quantile()()](/sql-reference/aggregate-functions/reference/quantile/), что значительно ускоряет вычисления, но при этом используется выборка. Если требуются точные результаты вычислений, используйте функции `MEDIAN_EXACT()` и `PERCENTILE_EXACT()` (основанные на [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)).
- В режиме Extract нельзя использовать MEDIAN_EXACT() и PERCENTILE_EXACT(), поскольку MEDIAN() и PERCENTILE() всегда точны (и медленны).

## Дополнительные функции для вычисляемых полей в режиме Live {#additional-functions-for-calculated-fields-in-live-mode}

ClickHouse имеет огромное количество функций для анализа данных — гораздо больше, чем поддерживает Tableau. Для удобства пользователей мы добавили новые функции, доступные в режиме Live при создании вычисляемых полей. К сожалению, в интерфейсе Tableau невозможно добавить описания к этим функциям, поэтому мы приводим их описание здесь.

- **[Комбинатор агрегации `-If`](/sql-reference/aggregate-functions/combinators/#-if)** _(добавлено в v0.2.3)_ — позволяет применять фильтры на уровне строк непосредственно в агрегатных вычислениях. Добавлены функции `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()`.
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** _(добавлено в v0.2.1)_ — Забудьте о скучных столбчатых диаграммах! Используйте вместо них функцию `BAR()` (эквивалент [`bar()`](/sql-reference/functions/other-functions#bar) в ClickHouse). Например, это вычисляемое поле возвращает наглядные столбцы в виде строки:
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327.06 million
  █████  88.02 million
  ███████████████  259.37 million
  ```
- **`COUNTD_UNIQ([my_field])`** _(добавлено в v0.2.0)_ — Вычисляет приблизительное количество различных значений аргумента. Эквивалент [uniq()](/sql-reference/aggregate-functions/reference/uniq/). Намного быстрее, чем `COUNTD()`.
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** _(добавлено в v0.2.1)_ — эквивалент [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval) в ClickHouse. Округляет дату или дату и время вниз до заданного интервала, например:
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** _(добавлено в v0.2.1)_ — Возвращает округленное число с суффиксом (тысяча, миллион, миллиард и т. д.) в виде строки. Полезно для удобного восприятия больших чисел. Эквивалент [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity).
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** _(добавлено в v0.2.1)_ — Принимает временную дельту в секундах. Возвращает временную дельту в формате (год, месяц, день, час, минута, секунда) в виде строки. `optional_max_unit` — максимальная единица для отображения. Допустимые значения: `seconds`, `minutes`, `hours`, `days`, `months`, `years`. Эквивалент [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta).
- **`GET_SETTING([my_setting_name])`** _(добавлено в v0.2.1)_ — Возвращает текущее значение пользовательской настройки. Эквивалент [`getSetting()`](/sql-reference/functions/other-functions#getSetting).
- **`HEX([my_string])`** _(добавлено в v0.2.1)_ — Возвращает строку, содержащую шестнадцатеричное представление аргумента. Эквивалент [`hex()`](/sql-reference/functions/encoding-functions/#hex).
- **`KURTOSIS([my_number])`** — Вычисляет выборочный эксцесс последовательности. Эквивалент [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp).
- **`KURTOSISP([my_number])`** — Вычисляет эксцесс последовательности. Эквивалент [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop).
- **`MEDIAN_EXACT([my_number])`** _(добавлено в v0.1.3)_ — Точно вычисляет медиану числовой последовательности данных. Эквивалент [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
- **`MOD([my_number_1], [my_number_2])`** — Вычисляет остаток от деления. Если аргументы являются числами с плавающей точкой, они предварительно преобразуются в целые числа путем отбрасывания дробной части. Эквивалент [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo).
- **`PERCENTILE_EXACT([my_number], [level_float])`** _(добавлено в v0.1.3)_ — Точно вычисляет процентиль числовой последовательности данных. Рекомендуемый диапазон уровня — [0.01, 0.99]. Эквивалент [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
- **`PROPER([my_string])`** _(добавлено в v0.2.5)_ — Преобразует текстовую строку так, чтобы первая буква каждого слова была заглавной, а остальные буквы — строчными. Пробелы и неалфавитно-цифровые символы, такие как знаки пунктуации, также действуют как разделители. Например:
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
- **`RAND()`** _(добавлено в v0.2.1)_ — возвращает целое число (UInt32), например `3446222955`. Эквивалент [`rand()`](/sql-reference/functions/random-functions/#rand).
- **`RANDOM()`** _(добавлено в v0.2.1)_ — неофициальная функция Tableau [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results), которая возвращает число с плавающей точкой от 0 до 1.
- **`RAND_CONSTANT([optional_field])`** _(добавлено в v0.2.1)_ — Создает постоянный столбец со случайным значением. Аналогично `{RAND()}` Fixed LOD, но быстрее. Эквивалент [`randConstant()`](/sql-reference/functions/random-functions/#randConstant).
- **`REAL([my_number])`** — Приводит поле к типу float (Float64). Подробности [`здесь`](/sql-reference/data-types/decimal/#operations-and-result-type).
- **`SHA256([my_string])`** _(добавлено в v0.2.1)_ — Вычисляет хеш SHA-256 из строки и возвращает результирующий набор байтов в виде строки (FixedString). Удобно использовать с функцией `HEX()`, например, `HEX(SHA256([my_string]))`. Эквивалент [`SHA256()`](/sql-reference/functions/hash-functions#SHA256).
- **`SKEWNESS([my_number])`** — Вычисляет выборочную асимметрию последовательности. Эквивалент [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp).
- **`SKEWNESSP([my_number])`** — Вычисляет асимметрию последовательности. Эквивалент [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop).
- **`TO_TYPE_NAME([field])`** _(добавлено в v0.2.1)_ — Возвращает строку, содержащую имя типа ClickHouse переданного аргумента. Эквивалент [`toTypeName()`](/sql-reference/functions/other-functions#toTypeName).
- **`TRUNC([my_float])`** — Аналогично функции `FLOOR([my_float])`. Эквивалент [`trunc()`](/sql-reference/functions/rounding-functions#trunc).
- **`UNHEX([my_string])`** _(добавлено в v0.2.1)_ — Выполняет операцию, обратную `HEX()`. Эквивалент [`unhex()`](/sql-reference/functions/encoding-functions#unhex).
