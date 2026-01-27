---
sidebar_label: 'Рекомендации по анализу'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Рекомендации по анализу в Tableau при использовании официального коннектора ClickHouse.'
title: 'Рекомендации по анализу'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

# Рекомендации по анализу \{#analysis-tips\}

## Функции MEDIAN() и PERCENTILE() \{#median-and-percentile-functions\}

- В режиме Live функции MEDIAN() и PERCENTILE() (начиная с релиза коннектора v0.1.3) используют [функцию ClickHouse quantile()()](/sql-reference/aggregate-functions/reference/quantile/), что значительно ускоряет вычисления, но основано на выборке. Если вам нужны точные результаты вычислений, используйте функции `MEDIAN_EXACT()` и `PERCENTILE_EXACT()` (основанные на [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)).
- В режиме Extract нельзя использовать MEDIAN_EXACT() и PERCENTILE_EXACT(), потому что MEDIAN() и PERCENTILE() всегда дают точный (и медленный) результат.

## Дополнительные функции для вычисляемых полей в режиме Live \{#additional-functions-for-calculated-fields-in-live-mode\}

В ClickHouse есть очень большое количество функций, которые можно использовать для анализа данных — значительно больше, чем в Tableau. Для удобства пользователей мы добавили новые функции, доступные в режиме Live при создании вычисляемых полей (Calculated Fields). К сожалению, в интерфейсе Tableau невозможно добавить описания к этим функциям, поэтому мы приведём их описание прямо здесь.

* **[`-If` Aggregation Combinator](/sql-reference/aggregate-functions/combinators/#-if)** *(добавлено в v0.2.3)* — позволяет использовать фильтры на уровне строк прямо в агрегатных вычислениях. Добавлены функции `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()`.
* **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(добавлено в v0.2.1)* — Забудьте о скучных столбчатых диаграммах! Вместо этого используйте функцию `BAR()` (эквивалент [`bar()`](/sql-reference/functions/other-functions#bar) в ClickHouse). Например, это вычисляемое поле возвращает наглядные столбики в виде строки типа String:
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327.06 million
  █████  88.02 million
  ███████████████  259.37 million
  ```
* **`COUNTD_UNIQ([my_field])`** *(добавлено в v0.2.0)* — Вычисляет примерное количество уникальных значений аргумента. Эквивалент функции [uniq()](/sql-reference/aggregate-functions/reference/uniq/). Гораздо быстрее, чем `COUNTD()`.
* **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(добавлено в v0.2.1)* — эквивалент функции [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval) в ClickHouse. Округляет дату или дату и время вниз до заданного интервала, например:
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
* **`FORMAT_READABLE_QUANTITY([my_integer])`** *(добавлено в v0.2.1)* — Возвращает округлённое число со строковым суффиксом (тысяча, миллион, миллиард и т.д.). Полезно для удобного восприятия больших чисел человеком. Эквивалент функции [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity).
* **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(добавлено в v0.2.1)* — Принимает временной интервал в секундах. Возвращает его в виде строки с разложением по единицам (год, месяц, день, час, минута, секунда). `optional_max_unit` — максимальная единица времени для отображения. Допустимые значения: `seconds`, `minutes`, `hours`, `days`, `months`, `years`. Эквивалент функции [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta).
* **`GET_SETTING([my_setting_name])`** *(добавлено в v0.2.1)* — возвращает текущее значение пользовательской настройки. Эквивалент функции [`getSetting()`](/sql-reference/functions/other-functions#getSetting).
* **`HEX([my_string])`** *(добавлено в v0.2.1)* — Возвращает строку, содержащую шестнадцатеричное представление аргумента. Является эквивалентом [`hex()`](/sql-reference/functions/encoding-functions/#hex).
* **`KURTOSIS([my_number])`** — Вычисляет выборочный эксцесс для последовательности. Эквивалент функции [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp).
* **`KURTOSISP([my_number])`** — Вычисляет эксцесс (крутость распределения) для последовательности значений. Эквивалент функции [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop).
* **`MEDIAN_EXACT([my_number])`** *(добавлено в v0.1.3)* — Точно вычисляет медиану последовательности числовых данных. Эквивалентно [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact).
* **`MOD([my_number_1], [my_number_2])`** — вычисляет остаток от деления. Если аргументы являются числами с плавающей запятой, они предварительно преобразуются в целые числа путём отбрасывания дробной части. Эквивалент функции [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo).
* **`PERCENTILE_EXACT([my_number], [level_float])`** *(добавлено в v0.1.3)* — Точно вычисляет значение перцентиля для числовой последовательности данных. Рекомендуемый диапазон уровней — [0.01, 0.99]. Эквивалент функции [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact).
* **`PROPER([my_string])`** *(добавлено в v0.2.5)* — Преобразует текстовую строку так, что первая буква каждого слова становится заглавной, а остальные буквы — строчными. Пробелы и небуквенно-цифровые символы, например знаки препинания, также считаются разделителями. Например:
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
* **`RAND()`** *(добавлено в v0.2.1)* — возвращает целое число типа UInt32, например `3446222955`. Эквивалент функции [`rand()`](/sql-reference/functions/random-functions/#rand).
* **`RANDOM()`** *(добавлена в v0.2.1)* — неофициальная функция Tableau [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results), которая возвращает вещественное число в диапазоне от 0 до 1.
* **`RAND_CONSTANT([optional_field])`** *(добавлено в v0.2.1)* — создает столбец с константным случайным значением. Похоже на `{RAND()}` с фиксированным уровнем детализации (Fixed LOD), но быстрее. Эквивалент [`randConstant()`](/sql-reference/functions/random-functions/#randConstant).
* **`REAL([my_number])`** — Приводит поле к типу float (Float64). Подробности [`здесь`](/sql-reference/data-types/decimal/#operations-and-result-type).
* **`SHA256([my_string])`** *(добавлено в v0.2.1)* — вычисляет хеш SHA-256 по строке и возвращает полученный набор байт в виде строки типа FixedString. Удобно использовать с функцией `HEX()`, например, `HEX(SHA256([my_string]))`. Эквивалент функции [`SHA256()`](/sql-reference/functions/hash-functions#SHA256).
* **`SKEWNESS([my_number])`** — вычисляет выборочную асимметрию последовательности. Эквивалентна функции [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp).
* **`SKEWNESSP([my_number])`** — вычисляет коэффициент асимметрии последовательности. Эквивалент функции [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop).
* **`TO_TYPE_NAME([field])`** *(добавлено в v0.2.1)* — Возвращает строку, содержащую имя типа в ClickHouse для переданного аргумента. Эквивалентно [`toTypeName()`](/sql-reference/functions/other-functions#toTypeName).
* **`TRUNC([my_float])`** — То же, что и функция `FLOOR([my_float])`. Эквивалент функции [`trunc()`](/sql-reference/functions/rounding-functions#trunc).
* **`UNHEX([my_string])`** *(добавлено в v0.2.1)* — выполняет операцию, обратную `HEX()`. Эквивалент функции [`unhex()`](/sql-reference/functions/encoding-functions#unhex).