---
sidebar_label: 'Советы по анализу'
sidebar_position: 4
slug: /integrations/tableau/analysis-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Советы по анализу данных в Tableau при использовании официального коннектора ClickHouse.'
title: 'Советы по анализу'
doc_type: 'guide'
---

# Советы по анализу {#analysis-tips}

## Функции MEDIAN() и PERCENTILE() {#median-and-percentile-functions}

* В режиме Live функции MEDIAN() и PERCENTILE() (начиная с версии коннектора v0.1.3) используют [функцию ClickHouse quantile()()](/sql-reference/aggregate-functions/reference/quantile/), что существенно ускоряет вычисления, но основано на выборочном методе. Если вам нужны точные результаты вычислений, используйте функции `MEDIAN_EXACT()` и `PERCENTILE_EXACT()` (на основе [quantileExact()()](/sql-reference/aggregate-functions/reference/quantileexact/)).
* В режиме Extract нельзя использовать функции MEDIAN&#95;EXACT() и PERCENTILE&#95;EXACT(), потому что MEDIAN() и PERCENTILE() всегда дают точный (и медленный) результат.

## Дополнительные функции для вычисляемых полей в режиме Live {#additional-functions-for-calculated-fields-in-live-mode}

ClickHouse предоставляет обширный набор функций для анализа данных — значительно больше, чем поддерживает Tableau. Для удобства пользователей мы добавили новые функции, доступные в режиме Live при создании вычисляемых полей (Calculated Fields). К сожалению, в интерфейсе Tableau невозможно добавить описания этих функций, поэтому мы приводим их описание непосредственно здесь.

* **[`-If` Aggregation Combinator](/sql-reference/aggregate-functions/combinators/#-if)** *(добавлено в v0.2.3)* — позволяет использовать фильтры на уровне строк непосредственно в агрегатных вычислениях. Добавлены функции `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()`.
* **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(добавлено в v0.2.1)* — Забудьте о скучных столбчатых диаграммах! Вместо этого используйте функцию `BAR()` (эквивалент [`bar()`](/sql-reference/functions/other-functions#bar) в ClickHouse). Например, это вычисляемое поле возвращает наглядные столбики в виде строки (String):
  ```text
  BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
  ```
  ```text
  == BAR() ==
  ██████████████████▊  327,06 млн
  █████  88,02 млн
  ███████████████  259,37 млн
  ```
* **`COUNTD_UNIQ([my_field])`** *(добавлена в v0.2.0)* — Вычисляет приблизительное число различных значений аргумента. Эквивалент функции [uniq()](/sql-reference/aggregate-functions/reference/uniq/). Гораздо быстрее, чем `COUNTD()`.
* **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(добавлена в v0.2.1)* — эквивалент функции [`toStartOfInterval()`](/sql-reference/functions/date-time-functions#toStartOfInterval) в ClickHouse. Округляет дату или дату и время в меньшую сторону до указанного интервала, например:
  ```text
   == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
      28.07.2004 06:54:50    |              21.07.2004 00:00:00
      17.07.2004 14:01:56    |              11.07.2004 00:00:00
      14.07.2004 07:43:00    |              11.07.2004 00:00:00
  ```
* **`FORMAT_READABLE_QUANTITY([my_integer])`** *(добавлена в v0.2.1)* — Возвращает округлённое число с суффиксом (тысяча, миллион, миллиард и т. д.) в виде строки. Полезна для удобства чтения больших чисел. Эквивалент [`formatReadableQuantity()`](/sql-reference/functions/other-functions#formatReadableQuantity).
* **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(добавлено в v0.2.1)* — Принимает временной интервал в секундах. Возвращает интервал в виде строки с единицами (год, месяц, день, час, минута, секунда). `optional_max_unit` — максимальная единица, которую нужно отобразить. Допустимые значения: `seconds`, `minutes`, `hours`, `days`, `months`, `years`. Эквивалент [`formatReadableTimeDelta()`](/sql-reference/functions/other-functions/#formatReadableTimeDelta).
* **`GET_SETTING([my_setting_name])`** *(добавлено в v0.2.1)* — Возвращает текущее значение пользовательской настройки. Эквивалент функции [`getSetting()`](/sql-reference/functions/other-functions#getSetting).
* **`HEX([my_string])`** *(добавлено в v0.2.1)* — Возвращает строку, содержащую шестнадцатеричное представление аргумента. Аналог функции [`hex()`](/sql-reference/functions/encoding-functions/#hex).
* **`KURTOSIS([my_number])`** — вычисляет выборочный эксцесс (куртозис) для последовательности. Эквивалентна [`kurtSamp()`](/sql-reference/aggregate-functions/reference/kurtsamp).
* **`KURTOSISP([my_number])`** — Вычисляет эксцесс распределения для последовательности значений. Эквивалент функции [`kurtPop()`](/sql-reference/aggregate-functions/reference/kurtpop).
* **`MEDIAN_EXACT([my_number])`** *(добавлено в v0.1.3)* — Точно вычисляет медиану последовательности числовых данных. Эквивалентно [`quantileExact(0.5)(...)`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
* **`MOD([my_number_1], [my_number_2])`** — вычисляет остаток от деления. Если аргументы являются числами с плавающей точкой, они предварительно преобразуются в целые числа с отбрасыванием дробной части. Эквивалент функции [`modulo()`](/sql-reference/functions/arithmetic-functions/#modulo).
* **`PERCENTILE_EXACT([my_number], [level_float])`** *(добавлено в v0.1.3)* — Точно вычисляет значение процентиля для числовой последовательности данных. Рекомендуемый диапазон параметра уровня — [0.01, 0.99]. Эквивалент функции [`quantileExact()()`](/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
* **`PROPER([my_string])`** *(добавлено в v0.2.5)* — Преобразует текстовую строку таким образом, что первая буква каждого слова становится заглавной, а остальные буквы — строчными. Пробелы и небуквенно-цифровые символы, например знаки препинания, также считаются разделителями. Например:
  ```text
  PROPER("PRODUCT name") => "Product Name"
  ```
  ```text
  PROPER("darcy-mae") => "Darcy-Mae"
  ```
* **`RAND()`** *(добавлено в v0.2.1)* — возвращает целое число (UInt32), например `3446222955`. Эквивалент функции [`rand()`](/sql-reference/functions/random-functions/#rand).
* **`RANDOM()`** *(добавлена в v0.2.1)* — неофициальная функция Tableau [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results), которая возвращает вещественное число от 0 до 1.
* **`RAND_CONSTANT([optional_field])`** *(добавлено в v0.2.1)* — создает константный столбец со случайным значением. Что-то вроде `{RAND()}` Fixed LOD, но быстрее. Эквивалент функции [`randConstant()`](/sql-reference/functions/random-functions/#randConstant).
* **`REAL([my_number])`** — Приводит поле к числу с плавающей точкой (Float64). Подробности [`здесь`](/sql-reference/data-types/decimal/#operations-and-result-type).
* **`SHA256([my_string])`** *(добавлено в v0.2.1)* — вычисляет хэш SHA-256 от строки и возвращает результирующий набор байтов в виде строки (FixedString). Удобно использовать вместе с функцией `HEX()`, например, `HEX(SHA256([my_string]))`. Аналог [`SHA256()`](/sql-reference/functions/hash-functions#SHA256).
* **`SKEWNESS([my_number])`** — Вычисляет выборочную асимметрию последовательности значений. Эквивалент функции [`skewSamp()`](/sql-reference/aggregate-functions/reference/skewsamp).
* **`SKEWNESSP([my_number])`** — Вычисляет коэффициент асимметрии числовой последовательности. Эквивалент функции [`skewPop()`](/sql-reference/aggregate-functions/reference/skewpop).
* **`TO_TYPE_NAME([field])`** *(добавлено в v0.2.1)* — Возвращает строку, содержащую имя типа ClickHouse для переданного аргумента. Эквивалент функции [`toTypeName()`](/sql-reference/functions/other-functions#toTypeName).
* **`TRUNC([my_float])`** — То же самое, что функция `FLOOR([my_float])`. Эквивалент функции [`trunc()`](/sql-reference/functions/rounding-functions#trunc).
* **`UNHEX([my_string])`** *(добавлено в v0.2.1)* — Выполняет операцию, обратную `HEX()`. Эквивалент функции [`unhex()`](/sql-reference/functions/encoding-functions#unhex).
