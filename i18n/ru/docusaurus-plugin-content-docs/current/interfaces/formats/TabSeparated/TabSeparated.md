---
alias: ['TSV']
description: 'Документация по формату TSV'
input_format: true
keywords: ['TabSeparated', 'TSV']
output_format: true
slug: /interfaces/formats/TabSeparated
title: 'TabSeparated'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## Описание \\{#description\\}

В формате TabSeparated данные записываются построчно. Каждая строка содержит значения, разделённые символами табуляции. После каждого значения следует символ табуляции, за исключением последнего значения в строке, за которым следует символ перевода строки. Везде предполагается использование перевода строки в формате Unix. Последняя строка также должна заканчиваться переводом строки. Значения записываются в текстовом формате, без заключения в кавычки и с экранированием специальных символов.

Этот формат также доступен под названием `TSV`.

Формат `TabSeparated` удобен для обработки данных пользовательскими программами и скриптами. Он используется по умолчанию в HTTP-интерфейсе и в пакетном режиме командного клиента. Этот формат также позволяет переносить данные между различными СУБД. Например, можно сделать дамп из MySQL и загрузить его в ClickHouse или наоборот.

Формат `TabSeparated` поддерживает вывод итоговых значений (при использовании WITH TOTALS) и экстремальных значений (когда параметр `extremes` установлен в 1). В этих случаях итоговые значения и экстремальные значения выводятся после основных данных. Основной результат, итоговые значения и экстремальные значения разделяются между собой пустой строкой. Пример:

```sql
SELECT EventDate, count() AS c FROM test.hits GROUP BY EventDate WITH TOTALS ORDER BY EventDate FORMAT TabSeparated

2014-03-17      1406958
2014-03-18      1383658
2014-03-19      1405797
2014-03-20      1353623
2014-03-21      1245779
2014-03-22      1031592
2014-03-23      1046491

1970-01-01      8873898

2014-03-17      1031592
2014-03-23      1406958
```

## Форматирование данных \\{#tabseparated-data-formatting\\}

Целые числа записываются в десятичной форме. Числа могут содержать дополнительный символ &quot;+&quot; в начале (он игнорируется при разборе и не записывается при форматировании). Неотрицательные числа не могут содержать знак минус. При чтении допускается интерпретировать пустую строку как ноль или (для знаковых типов) строку, состоящую только из знака минус, как ноль. Числа, которые не помещаются в соответствующий тип данных, могут быть разобраны как другое число, без сообщения об ошибке.

Числа с плавающей запятой записываются в десятичной форме. В качестве десятичного разделителя используется точка. Поддерживается экспоненциальная форма записи, а также значения &#39;inf&#39;, &#39;+inf&#39;, &#39;-inf&#39; и &#39;nan&#39;. Запись числа с плавающей запятой может начинаться или заканчиваться десятичной точкой.
При форматировании точность чисел с плавающей запятой может быть потеряна.
При разборе не обязательно считывать ближайшее к значению число, представимое в формате машины.

Даты записываются в формате YYYY-MM-DD и разбираются в том же формате, но с любыми символами в качестве разделителей.
Дата и время записываются в формате `YYYY-MM-DD hh:mm:ss` и разбираются в том же формате, но с любыми символами в качестве разделителей.
Все это происходит в системной временной зоне на момент запуска клиента или сервера (в зависимости от того, кто форматирует данные). Для дат со временем переход на летнее время не указывается. Поэтому, если дамп содержит время в период действия летнего времени, дамп однозначно не соответствует данным, и при разборе будет выбран один из двух возможных моментов времени.
При чтении некорректные даты и даты со временем могут быть разобраны с естественным переполнением или как нулевые дата и время, без сообщения об ошибке.

В качестве исключения разбор дат со временем также поддерживается в формате Unix timestamp, если он состоит ровно из 10 десятичных цифр. Результат не зависит от часового пояса. Форматы `YYYY-MM-DD hh:mm:ss` и `NNNNNNNNNN` различаются автоматически.

Строки выводятся с экранированием специальных символов обратной косой чертой. Для вывода используются следующие escape-последовательности: `\b`, `\f`, `\r`, `\n`, `\t`, `\0`, `\'`, `\\`. При разборе также поддерживаются последовательности `\a`, `\v` и `\xHH` (шестнадцатеричные escape-последовательности), а также любые последовательности `\c`, где `c` — любой символ (эти последовательности преобразуются в `c`). Таким образом, при чтении данных поддерживаются форматы, в которых перевод строки может быть записан как `\n`, как `\` или как собственно символ перевода строки. Например, строка `Hello world` с переводом строки между словами вместо пробела может быть разобрана в любом из следующих вариантов:

```text
Hello\nworld

Hello\
world
```

Второй вариант поддерживается, потому что MySQL использует его при записи дампов с разделителем табуляции.

Минимальный набор символов, которые необходимо экранировать при передаче данных в формате TabSeparated: табуляция, перевод строки (LF) и обратная косая черта.

Экранируется только небольшой набор символов. Вы легко можете наткнуться на строковое значение, которое ваш терминал исказит при выводе.

Массивы записываются как список значений, разделённых запятыми, в квадратных скобках. Числовые элементы в массиве форматируются как обычно. Типы `Date` и `DateTime` записываются в одинарных кавычках. Строки записываются в одинарных кавычках с теми же правилами экранирования, что и выше.

[NULL](/sql-reference/syntax.md) форматируется в соответствии с настройкой [format&#95;tsv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) (значение по умолчанию — `\N`).

Во входных данных значения ENUM могут быть представлены как именами, так и идентификаторами. Сначала предпринимается попытка сопоставить входное значение с именем ENUM. Если это не удаётся и входное значение является числом, выполняется попытка сопоставить это число идентификатору ENUM.
Если входные данные содержат только идентификаторы ENUM, рекомендуется включить настройку [input&#95;format&#95;tsv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) для оптимизации разбора ENUM.

Каждый элемент структур [Nested](/sql-reference/data-types/nested-data-structures/index.md) представляется в виде массива.

Например:

```sql
CREATE TABLE nestedt
(
    `id` UInt8,
    `aux` Nested(
        a UInt8,
        b String
    )
)
ENGINE = TinyLog
```

```sql
INSERT INTO nestedt VALUES ( 1, [1], ['a'])
```

```sql
SELECT * FROM nestedt FORMAT TSV
```

```response
1  [1]    ['a']
```

## Пример использования \\{#example-usage\\}

### Вставка данных \\{#inserting-data\\}

Используя следующий TSV-файл с именем `football.tsv`:

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

Вставьте данные:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparated;
```

### Чтение данных \\{#reading-data\\}

Считывайте данные в формате `TabSeparated`:

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

Результат будет выведен в формате с разделителями табуляции:

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

## Настройки формата \\{#format-settings\\}

| Setting                                                                                                                                                          | Description                                                                                                                                                                                                                                    | Default |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | Пользовательское представление значения NULL в формате TSV.                                                                                                                                                                                   | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | трактовать пустые поля во входных данных TSV как значения по умолчанию. Для сложных выражений по умолчанию параметр [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields) также должен быть включён. | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | трактовать вставляемые значения enum в форматах TSV как индексы enum.                                                                                                                                                                         | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | использовать дополнительные эвристики для определения схемы в формате TSV. Если параметр отключён, все поля будут интерпретированы как String.                                                                                               | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | если значение параметра равно true, конец строки в выходном формате TSV будет `\r\n` вместо `\n`.                                                                                                                                             | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | если значение параметра равно true, конец строки во входном формате TSV будет `\r\n` вместо `\n`.                                                                                                                                             | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | пропускать указанное количество строк в начале данных.                                                                                                                                                                                        | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | автоматически определять заголовок с именами и типами в формате TSV.                                                                                                                                                                          | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | пропускать завершающие пустые строки в конце данных.                                                                                                                                                                                          | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | разрешить переменное количество столбцов в формате TSV, игнорировать лишние столбцы и использовать значения по умолчанию для отсутствующих столбцов.                                                                                          | `false` |
