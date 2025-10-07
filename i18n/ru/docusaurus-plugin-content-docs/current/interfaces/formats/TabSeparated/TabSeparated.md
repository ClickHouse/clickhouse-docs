---
slug: '/interfaces/formats/TabSeparated'
description: 'Документация для формата TSV'
title: TabSeparated
keywords: ['TabSeparated', 'TSV']
doc_type: reference
alias: 
input_format: true
output_format: true
---
| Input | Output | Alias  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## Описание {#description}

В формате TabSeparated данные записываются по строкам. Каждая строка содержит значения, разделенные табуляцией. Каждое значение завершается табуляцией, за исключением последнего значения в строке, которое завершается переводом строки. Предполагается, что везде используются строго Unix-переводы строк. Последняя строка также должна содержать перевод строки в конце. Значения записываются в текстовом формате, без заключительных кавычек, и со специальными символами, экранированными.

Этот формат также доступен под именем `TSV`.

Формат `TabSeparated` удобен для обработки данных с использованием пользовательских программ и скриптов. Он используется по умолчанию в HTTP интерфейсе и в пакетном режиме командной строки клиента. Этот формат также позволяет передавать данные между различными СУБД. Например, вы можете получить дамп из MySQL и загрузить его в ClickHouse или наоборот.

Формат `TabSeparated` поддерживает вывод итоговых значений (при использовании WITH TOTALS) и экстремальных значений (когда 'extremes' установлен в 1). В этих случаях итоговые значения и экстремальные значения выводятся после основных данных. Основной результат, итоговые значения и экстремальные значения разделяются друг от друга пустой строкой. Пример:

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

## Форматирование данных {#tabseparated-data-formatting}

Целые числа записываются в десятичной форме. Числа могут содержать дополнительный знак "+" в начале (игнорируется при парсинге и не записывается при форматировании). Неположительные числа не могут содержать знак минус. При чтении допускается интерпретировать пустую строку как ноль, или (для знаковых типов) строку, состоящую только из знака минус, как ноль. Числа, которые не помещаются в соответствующий тип данных, могут быть интерпретированы как другое число без сообщения об ошибке.

Числа с плавающей запятой записываются в десятичной форме. Точка используется в качестве десятичного разделителя. Поддерживаются экспоненциальные записи, а также 'inf', '+inf', '-inf' и 'nan'. Запись чисел с плавающей запятой может начинаться или заканчиваться десятичной точкой. При форматировании точность может теряться у чисел с плавающей запятой. При парсинге строгое требование не обязательно — можно читать ближайшее число, представленное в машинном формате.

Даты записываются в формате YYYY-MM-DD и интерпретируются в том же формате, но с любыми символами в качестве разделителей. Даты с временем записываются в формате `YYYY-MM-DD hh:mm:ss` и интерпретируются в том же формате, но с любыми символами в качестве разделителей. Все это происходит в системной временной зоне в момент запуска клиента или сервера (в зависимости от того, кто форматирует данные). Для дат с временем переход на летнее/зимнее время не указывается. Так что если дамп содержит времена в период летнего времени, дамп не совпадает однозначно с данными, и парсинг выберет одно из двух времен. При операции чтения некорректные даты и даты с временем могут быть интерпретированы с естественным переполнением или как нулевые даты и времена, без сообщения об ошибке.

В качестве исключения поддерживается также парсинг дат с временем в формате Unix timestamp, если он состоит ровно из 10 десятичных цифр. Результат не зависит от временной зоны. Форматы `YYYY-MM-DD hh:mm:ss` и `NNNNNNNNNN` автоматически различаются.

Строки выводятся с экранированными специальными символами с помощью обратной косой черты. Для вывода используются следующие escape-последовательности: `\b`, `\f`, `\r`, `\n`, `\t`, `\0`, `\'`, `\\`. Парсинг также поддерживает последовательности `\a`, `\v` и `\xHH` (шестнадцатеричные escape-последовательности) и любые последовательности `\c`, где `c` — это любой символ (эти последовательности преобразуются в `c`). Таким образом, чтение данных поддерживает форматы, где перевод строки может быть записан как `\n` или `\`, или как перевод строки. Например, строку `Hello world` с переводом строки между словами вместо пробела можно интерпретировать в любом из следующих вариантов:

```text
Hello\nworld

Hello\
world
```

Второй вариант поддерживается, потому что MySQL использует его при записи табуляцией разделенных дампов.

Минимальный набор символов, которые необходимо экранировать при передаче данных в формате TabSeparated: табуляция, перевод строки (LF) и обратная косая черта.

Только небольшой набор символов экранирован. Вы можете легко столкнуться со значением строки, которое ваш терминал испортит при выводе.

Массивы записываются как список значений, разделенных запятыми, в квадратных скобках. Числовые элементы в массиве форматируются как обычно. Типы `Date` и `DateTime` записываются в одинарных кавычках. Строки записываются в одинарных кавычках с теми же правилами экранирования, что и выше.

[NULL](/sql-reference/syntax.md) форматируется в соответствии с настройкой [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) (значение по умолчанию — `\N`).

В входных данных значения ENUM могут представляться как именами, так и id. Сначала мы пытаемся сопоставить входное значение с именем ENUM. Если не удается, и входное значение является числом, мы пытаемся сопоставить это число с id ENUM. Если входные данные содержат только id ENUM, рекомендуется включить настройку [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number) для оптимизации парсинга ENUM.

Каждый элемент структур [Nested](/sql-reference/data-types/nested-data-structures/index.md) представлен как массив.

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

## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Используя следующий tsv файл, названный `football.tsv`:

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

### Чтение данных {#reading-data}

Чтение данных с использованием формата `TabSeparated`:

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

Вывод будет в формате, разделенном табуляцией:

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

## Настройки формата {#format-settings}

| Настройка                                                                                                                                                       | Описание                                                                                                                                                                                                                                    | По умолчанию |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | Пользовательское представление NULL в формате TSV.                                                                                                                                                                                      | `\N`         |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | обработка пустых полей во входных данных TSV как значений по умолчанию. Для сложных значений по умолчанию также должна быть включена настройка [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields). | `false`      |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | обработка вставленных значений enum в формате TSV как индексы enum.                                                                                                                                                                      | `false`      |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | использование некоторых настроек и эвристики для вывода схемы в формате TSV. Если отключено, все поля будут считаться строками.                                                                                                          | `true`       |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | если установлено в true, конец строки в формате TSV будет `\r\n` вместо `\n`.                                                                                                                                                           | `false`      |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | если установлено в true, конец строки во входном формате TSV будет `\r\n` вместо `\n`.                                                                                                                                                 | `false`      |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | пропустить указанное количество строк в начале данных.                                                                                                                                                                                   | `0`          |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | автоматически обнаруживать заголовок с именами и типами в формате TSV.                                                                                                                                                                  | `true`       |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | пропустить завершающие пустые строки в конце данных.                                                                                                                                                                                    | `false`      |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | разрешить переменное количество колонок в формате TSV, игнорировать дополнительные колонки и использовать значения по умолчанию для отсутствующих колонок.                                                                                  | `false`      |