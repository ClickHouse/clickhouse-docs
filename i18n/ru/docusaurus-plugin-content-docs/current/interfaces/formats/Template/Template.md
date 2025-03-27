---
alias: []
description: 'Документация для формата Template'
input_format: true
keywords: ['Template']
output_format: true
slug: /interfaces/formats/Template
title: 'Template'
---

| Ввод | Вывод | Псевдоним |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

Для случаев, когда вам требуется больше настроек, чем предлагают другие стандартные форматы, формат `Template` позволяет пользователю указать свою собственную строку формата с заполнителями для значений и задать правила экранирования для данных.

Он использует следующие настройки:

| Настройка                                                                                                  | Описание                                                                                                                |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | Указывает путь к файлу, содержащему строки формата для строк.                                                           |
| [`format_template_resultset`](#format_template_resultset)                                                | Указывает путь к файлу, содержащему строки формата для строк                                                            |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | Указывает разделитель между строками, который будет напечатан (или ожидается) после каждой строки, кроме последней (`\n` по умолчанию) |
| `format_template_row_format`                                                                             | Указывает строку формата для строк [инлайн](#inline_specification).                                                     |                                                                           
| `format_template_resultset_format`                                                                       | Указывает строку формата набора результатов [инлайн](#inline_specification).                                            |
| Некоторые настройки других форматов (например, `output_format_json_quote_64bit_integers`, когда используется `JSON` экранирование) |                                                                                                                            |

## Настройки и правила экранирования {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

Настройка `format_template_row` указывает путь к файлу, который содержит строки формата для строк со следующим синтаксисом:

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

Где:

| Часть синтаксиса | Описание                                                                                                       |
|----------------|-------------------------------------------------------------------------------------------------------------------|
| `delimiter_i`  | Разделитель между значениями (символ `$` может быть экранирован как `$$`)                                                    |
| `column_i`     | Имя или индекс столбца, значения которого должны быть выбраны или вставлены (если пусто, столбец будет пропущен) |
|`serializeAs_i` | Правило экранирования для значений столбца.                                                                           |

Поддерживаются следующие правила экранирования:

| Правило экранирования        | Описание                              |
|----------------------|------------------------------------------|
| `CSV`, `JSON`, `XML` | Похоже на форматы с теми же названиями |
| `Escaped`            | Похоже на `TSV`                         |
| `Quoted`             | Похоже на `Values`                      |
| `Raw`                | Без экранирования, похоже на `TSVRaw`    |   
| `None`               | Нет правила экранирования - см. примечание ниже        |

:::note
Если правило экранирования опущено, то будет использоваться `None`. `XML` подходит только для вывода.
:::

Рассмотрим пример. Данная строка формата:

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

Следующие значения будут напечатаны (если используется `SELECT`) или ожидаются (если используется `INPUT`) между колонками `Search phrase:`, `, count:`, `, ad price: $` и `;` соответственно:

- `s` (с правилом экранирования `Quoted`)
- `c` (с правилом экранирования `Escaped`)
- `p` (с правилом экранирования `JSON`)

Например:

- Если вы используете `INSERT`, строка ниже соответствует ожидаемому шаблону и будет читать значения `bathroom interior design`, `2166`, `$3` в столбцы `Search phrase`, `count`, `ad price`.
- Если вы используете `SELECT`, строка ниже - это вывод, при условии, что значения `bathroom interior design`, `2166`, `$3` уже хранятся в таблице в столбцах `Search phrase`, `count`, `ad price`.  

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

Настройка `format_template_rows_between_delimiter` указывает разделитель между строками, который будет напечатан (или ожидается) после каждой строки, кроме последней (`\n` по умолчанию).

### format_template_resultset {#format_template_resultset}

Настройка `format_template_resultset` указывает путь к файлу, который содержит строку формата для набора результатов. 

Строка формата для набора результатов имеет тот же синтаксис, что и строка формата для строк. 
Она позволяет указать префикс, суффикс и способ вывода некоторой дополнительной информации и содержит следующие заполнители вместо имен столбцов:

- `data` - это строки с данными в формате `format_template_row`, разделенные `format_template_rows_between_delimiter`. Этот заполнитель должен быть первым заполнителем в строке формата.
- `totals` - это строка с итоговыми значениями в формате `format_template_row` (когда используется WITH TOTALS).
- `min` - это строка с минимальными значениями в формате `format_template_row` (когда extremes установлены в 1).
- `max` - это строка с максимальными значениями в формате `format_template_row` (когда extremes установлены в 1).
- `rows` - общее количество выходных строк.
- `rows_before_limit` - минимальное количество строк, которое было бы без LIMIT. Выводится только если запрос содержит LIMIT. Если запрос содержит GROUP BY, rows_before_limit_at_least - это точное количество строк, которое было бы без LIMIT.
- `time` - время выполнения запроса в секундах.
- `rows_read` - количество строк, которые были прочитаны.
- `bytes_read` - количество байт (разжатых), которые были прочитаны.

Заполнители `data`, `totals`, `min` и `max` не должны иметь указанное правило экранирования (или `None` должно быть указано явно). Оставшиеся заполнители могут иметь любое указанное правило экранирования.

:::note
Если настройка `format_template_resultset` является пустой строкой, используется `${data}` как значение по умолчанию.
:::

Для запросов вставки формат позволяет пропускать некоторые столбцы или поля, если указаны префикс или суффикс (см. пример).

### Инлайн-спецификация {#inline_specification}

Часто бывает сложно или невозможно развернуть конфигурации формата 
(установленные с помощью `format_template_row`, `format_template_resultset`) для формата шаблона в директории на всех узлах кластера. 
Кроме того, формат может быть настолько тривиальным, что не требует размещения в файле.

Для этих случаев можно использовать `format_template_row_format` (для `format_template_row`) и `format_template_resultset_format` (для `format_template_resultset`), чтобы установить строку шаблона непосредственно в запросе, 
а не как путь к файлу, который содержит ее.

:::note
Правила строк формата и последовательностей экранирования такие же, как и для:
- [`format_template_row`](#format_template_row) при использовании `format_template_row_format`.
- [`format_template_resultset`](#format_template_resultset) при использовании `format_template_resultset_format`.
:::

## Пример использования {#example-usage}

Давайте рассмотрим два примера того, как мы можем использовать формат `Template`, сначала для выбора данных, а затем для вставки данных.

### Выбор данных {#selecting-data}

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>Max</caption>
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
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    <tr> <td></td> <td>8267016</td> </tr>
    <tr> <td>bathroom interior design</td> <td>2166</td> </tr>
    <tr> <td>clickhouse</td> <td>1655</td> </tr>
    <tr> <td>spring 2014 fashion</td> <td>1549</td> </tr>
    <tr> <td>freeform photos</td> <td>1480</td> </tr>
  </table>
  <table border="1"> <caption>Max</caption>
    <tr> <td></td> <td>8873898</td> </tr>
  </table>
  <b>Обработано 3095973 строк за 0.1569913 сек</b>
 </body>
</html>
```

### Вставка данных {#inserting-data}

```text
Некоторый заголовок
Просмотры страниц: 5, Идентификатор пользователя: 4324182021466249494, Бесполезное поле: hello, Продолжительность: 146, Знак: -1
Просмотры страниц: 6, Идентификатор пользователя: 4324182021466249494, Бесполезное поле: world, Продолжительность: 185, Знак: 1
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
Просмотры страниц: ${PageViews:CSV}, Идентификатор пользователя: ${UserID:CSV}, Бесполезное поле: ${:CSV}, Продолжительность: ${Duration:CSV}, Знак: ${Sign:CSV}
```

`PageViews`, `UserID`, `Duration` и `Sign` внутри заполнителей - это имена столбцов в таблице. Значения после `Бесполезное поле` в строках и после `\nВсего строк:` в суффиксе будут проигнорированы.
Все разделители в входных данных должны строго соответствовать разделителям в указанных строках формата.

### Инлайн-спецификация {#in-line-specification}

Устали от ручного форматирования таблиц в markdown? В этом примере мы посмотрим, как мы можем использовать формат `Template` и настройки инлайн-спецификации, чтобы достичь простой задачи - `SELECT`ить имена некоторых форматов ClickHouse из таблицы `system.formats` и отформатировать их как таблицу markdown. Это можно легко сделать с использованием формата `Template` и настроек `format_template_row_format` и `format_template_resultset_format`.

В предыдущих примерах мы указывали строки формата набора результатов и строк в отдельных файлах, с путями к этим файлам, указанными с помощью настроек `format_template_resultset` и `format_template_row`. Здесь мы сделаем это инлайн, потому что наш шаблон тривиален и состоит всего лишь из нескольких `|` и `-`, чтобы создать таблицу markdown. Мы укажем нашу строку шаблона набора результатов, используя настройку `format_template_resultset_format`. Чтобы создать заголовок таблицы, мы добавили `|ClickHouse Formats|\n|---|\n` перед `${data}`. Мы используем настройку `format_template_row_format`, чтобы указать строку шаблона `` |`{0:XML}`| `` для наших строк. Формат `Template` вставит наши строки с заданным форматом в заполнитель `${data}`. В этом примере у нас только один столбец, но если вы хотите добавить больше, вы можете сделать это, добавив `{1:XML}`, `{2:XML}`... и т.д. к строке шаблона строки, выбрав правило экранирования по мере необходимости. В этом примере мы выбрали правило экранирования `XML`. 

```sql title="Запрос"
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
 format_template_resultset_format='|ClickHouse Formats|\n|---|\n${data}\n'
```

Смотрите! Мы избавили себя от проблемы ручного добавления всех этих `|` и `-`, чтобы сделать таблицу markdown:

```response title="Ответ"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
