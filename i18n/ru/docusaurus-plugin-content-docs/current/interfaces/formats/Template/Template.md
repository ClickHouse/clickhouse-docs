---
alias: []
description: 'Документация по формату Template'
input_format: true
keywords: ['Template']
output_format: true
slug: /interfaces/formats/Template
title: 'Template'
doc_type: 'guide'
---

| Ввод | Вывод | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |



## Описание {#description}

В случаях, когда требуется больше возможностей настройки, чем предлагают другие стандартные форматы,
формат `Template` позволяет пользователю задать собственную строку формата с заполнителями для значений
и указать правила экранирования данных.

Используются следующие настройки:

| Настройка                                                                                                | Описание                                                                                                                   |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [`format_template_row`](#format_template_row)                                                            | Задаёт путь к файлу, содержащему строки формата для строк данных.                                                         |
| [`format_template_resultset`](#format_template_resultset)                                                | Задаёт путь к файлу, содержащему строки формата для результирующего набора                                                |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | Задаёт разделитель между строками, который выводится (или ожидается) после каждой строки, кроме последней (по умолчанию `\n`) |
| `format_template_row_format`                                                                             | Задаёт строку формата для строк данных [встроенным способом](#inline_specification).                                       |
| `format_template_resultset_format`                                                                       | Задаёт строку формата результирующего набора [встроенным способом](#inline_specification).                                 |
| Некоторые настройки других форматов (например, `output_format_json_quote_64bit_integers` при использовании экранирования `JSON`) |                                                                                                                            |


## Настройки и правила экранирования {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

Настройка `format_template_row` задает путь к файлу, содержащему строки форматирования для строк со следующим синтаксисом:

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

Где:

| Часть синтаксиса  | Описание                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `delimiter_i`   | Разделитель между значениями (символ `$` экранируется как `$$`)                                                        |
| `column_i`      | Имя или индекс столбца, значения которого должны быть выбраны или вставлены (если пусто, столбец будет пропущен) |
| `serializeAs_i` | Правило экранирования для значений столбца.                                                                               |

Поддерживаются следующие правила экранирования:

| Правило экранирования        | Описание                              |
| -------------------- | ---------------------------------------- |
| `CSV`, `JSON`, `XML` | Аналогично форматам с теми же названиями |
| `Escaped`            | Аналогично `TSV`                         |
| `Quoted`             | Аналогично `Values`                      |
| `Raw`                | Без экранирования, аналогично `TSVRaw`    |
| `None`               | Без правила экранирования — см. примечание ниже        |

:::note
Если правило экранирования не указано, используется `None`. `XML` подходит только для вывода.
:::

Рассмотрим пример. Дана следующая строка форматирования:

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

Следующие значения будут выведены (при использовании `SELECT`) или ожидаются (при использовании `INPUT`)
между разделителями `Search phrase:`, `, count:`, `, ad price: $` и `;` соответственно:

- `s` (с правилом экранирования `Quoted`)
- `c` (с правилом экранирования `Escaped`)
- `p` (с правилом экранирования `JSON`)

Например:

- При выполнении `INSERT` строка ниже соответствует ожидаемому шаблону и считывает значения `bathroom interior design`, `2166`, `$3` в столбцы `Search phrase`, `count`, `ad price`.
- При выполнении `SELECT` строка ниже является результатом вывода при условии, что значения `bathroom interior design`, `2166`, `$3` уже хранятся в таблице в столбцах `Search phrase`, `count`, `ad price`.

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

Настройка `format_template_rows_between_delimiter` задает разделитель между строками, который выводится (или ожидается) после каждой строки, кроме последней (по умолчанию `\n`)

### format_template_resultset {#format_template_resultset}

Настройка `format_template_resultset` задает путь к файлу, содержащему строку форматирования для набора результатов.

Строка форматирования для набора результатов имеет тот же синтаксис, что и строка форматирования для строк.
Она позволяет указать префикс, суффикс и способ вывода дополнительной информации и содержит следующие заполнители вместо имен столбцов:

- `data` — строки с данными в формате `format_template_row`, разделенные `format_template_rows_between_delimiter`. Этот заполнитель должен быть первым в строке форматирования.
- `totals` — строка с итоговыми значениями в формате `format_template_row` (при использовании WITH TOTALS).
- `min` — строка с минимальными значениями в формате `format_template_row` (когда extremes установлен в 1).
- `max` — строка с максимальными значениями в формате `format_template_row` (когда extremes установлен в 1).
- `rows` — общее количество выведенных строк.
- `rows_before_limit` — минимальное количество строк, которое было бы без LIMIT. Выводится только если запрос содержит LIMIT. Если запрос содержит GROUP BY, rows_before_limit_at_least является точным количеством строк, которое было бы без LIMIT.
- `time` — время выполнения запроса в секундах.
- `rows_read` — количество прочитанных строк.
- `bytes_read` — количество прочитанных байт (несжатых).

Для заполнителей `data`, `totals`, `min` и `max` не должно быть указано правило экранирования (или должно быть явно указано `None`). Для остальных заполнителей может быть указано любое правило экранирования.

:::note
Если настройка `format_template_resultset` является пустой строкой, в качестве значения по умолчанию используется `${data}`.
:::


Для запросов INSERT формат позволяет пропускать некоторые столбцы или поля при наличии префикса или суффикса (см. пример).

### Встроенная спецификация {#inline_specification}

Часто бывает сложно или невозможно развернуть конфигурации формата
(задаваемые параметрами `format_template_row`, `format_template_resultset`) для шаблонного формата в каталог на всех узлах кластера.
Кроме того, формат может быть настолько простым, что не требует размещения в отдельном файле.

В таких случаях можно использовать параметры `format_template_row_format` (для `format_template_row`) и `format_template_resultset_format` (для `format_template_resultset`), чтобы задать строку шаблона непосредственно в запросе,
а не указывать путь к файлу, содержащему её.

:::note
Правила для строк формата и escape-последовательностей такие же, как и для:

- [`format_template_row`](#format_template_row) при использовании `format_template_row_format`.
- [`format_template_resultset`](#format_template_resultset) при использовании `format_template_resultset_format`.
  :::


## Примеры использования {#example-usage}

Рассмотрим два примера использования формата `Template`: сначала для выборки данных, затем для вставки данных.

### Выборка данных {#selecting-data}

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>Поисковые фразы</title> </head>
 <body>
  <table border="1"> <caption>Поисковые фразы</caption>
    <tr> <th>Поисковая фраза</th> <th>Количество</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>Максимум</caption>
    ${max}
  </table>
  <b>Обработано ${rows_read:XML} строк за ${time:XML} сек</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

Результат:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Поисковые фразы</title>
  </head>
  <body>
    <table border="1">
      <caption>Поисковые фразы</caption>
      <tr>
        <th>Поисковая фраза</th>
        <th>Количество</th>
      </tr>
      <tr>
        <td></td>
        <td>8267016</td>
      </tr>
      <tr>
        <td>дизайн интерьера ванной</td>
        <td>2166</td>
      </tr>
      <tr>
        <td>clickhouse</td>
        <td>1655</td>
      </tr>
      <tr>
        <td>мода весна 2014</td>
        <td>1549</td>
      </tr>
      <tr>
        <td>фотографии произвольной формы</td>
        <td>1480</td>
      </tr>
    </table>
    <table border="1">
      <caption>Максимум</caption>
      <tr>
        <td></td>
        <td>8873898</td>
      </tr>
    </table>
    <b>Обработано 3095973 строк за 0.1569913 сек</b>
  </body>
</html>
```

### Вставка данных {#inserting-data}

```text
Некоторый заголовок
Просмотры страниц: 5, ID пользователя: 4324182021466249494, Бесполезное поле: hello, Длительность: 146, Знак: -1
Просмотры страниц: 6, ID пользователя: 4324182021466249494, Бесполезное поле: world, Длительность: 185, Знак: 1
Всего строк: 2
```

```sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT Template
```

```text title="/some/path/resultset.format"
Некоторый заголовок\n${data}\nВсего строк: ${:CSV}\n
```

```text title="/some/path/row.format"
Просмотры страниц: ${PageViews:CSV}, ID пользователя: ${UserID:CSV}, Бесполезное поле: ${:CSV}, Длительность: ${Duration:CSV}, Знак: ${Sign:CSV}
```

`PageViews`, `UserID`, `Duration` и `Sign` внутри заполнителей — это имена столбцов в таблице. Значения после `Бесполезное поле` в строках и после `\nВсего строк:` в суффиксе будут проигнорированы.
Все разделители во входных данных должны строго соответствовать разделителям в указанных строках формата.

### Встроенная спецификация {#in-line-specification}

Устали вручную форматировать таблицы markdown? В этом примере мы рассмотрим, как можно использовать формат `Template` и настройки встроенной спецификации для выполнения простой задачи — выборки (`SELECT`) имен некоторых форматов ClickHouse из таблицы `system.formats` и форматирования их в виде таблицы markdown. Это легко достигается с помощью формата `Template` и настроек `format_template_row_format` и `format_template_resultset_format`.


В предыдущих примерах мы указывали строки формата набора результатов и строк в отдельных файлах, а пути к этим файлам задавали с помощью настроек `format_template_resultset` и `format_template_row` соответственно. Здесь мы сделаем это прямо в настройках, потому что наш шаблон тривиален и состоит всего лишь из нескольких `|` и `-` для создания таблицы в Markdown. Мы зададим строку шаблона набора результатов с помощью настройки `format_template_resultset_format`. Чтобы сделать заголовок таблицы, мы добавили `|ClickHouse Formats|\n|---|\n` перед `${data}`. Мы используем настройку `format_template_row_format`, чтобы задать строку шаблона ``|`{0:XML}`|`` для наших строк. Формат `Template` вставит наши строки с заданным форматом в плейсхолдер `${data}`. В этом примере у нас только один столбец, но при необходимости вы можете добавить больше, добавив `{1:XML}`, `{2:XML}` и т. д. в строку шаблона для строк, выбирая правило экранирования по мере необходимости. В этом примере мы использовали правило экранирования `XML`.

```sql title="Query"
WITH formats AS
(
 SELECT * FROM system.formats
 ORDER BY rand()
 LIMIT 5
)
SELECT * FROM formats
FORMAT Template
SETTINGS
 format_template_row_format='|`${0:XML}`|',
 format_template_resultset_format='|Форматы ClickHouse|\n|---|\n${data}\n'
```

Посмотрите! Мы избавили себя от необходимости вручную добавлять все эти `|` и `-`, чтобы сделать эту таблицу в Markdown:

```response title="Response"
|Форматы ClickHouse|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
