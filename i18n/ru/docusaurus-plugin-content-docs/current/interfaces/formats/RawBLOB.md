---
description: 'Документация о формате RawBLOB'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
doc_type: 'reference'
---



## Описание {#description}

Формат `RawBLOB` считывает все входные данные в одно значение. Возможен разбор только таблицы с одним полем типа [`String`](/sql-reference/data-types/string.md) или аналогичного типа.
Результат выводится в двоичном формате без разделителей и экранирования. Если выводится более одного значения, формат становится неоднозначным, и прочитать данные обратно будет невозможно.

### Сравнение форматов Raw {#raw-formats-comparison}

Ниже приведено сравнение форматов `RawBLOB` и [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md).

`RawBLOB`:

- данные выводятся в двоичном формате без экранирования;
- между значениями отсутствуют разделители;
- отсутствует перевод строки в конце каждого значения.

`TabSeparatedRaw`:

- данные выводятся без экранирования;
- строки содержат значения, разделённые табуляцией;
- после последнего значения в каждой строке присутствует перевод строки.

Ниже приведено сравнение форматов `RawBLOB` и [RowBinary](./RowBinary/RowBinary.md).

`RawBLOB`:

- строковые поля выводятся без префикса длины.

`RowBinary`:

- строковые поля представлены как длина в формате varint (беззнаковый [LEB128](https://en.wikipedia.org/wiki/LEB128)), за которой следуют байты строки.

Когда на вход `RawBLOB` передаются пустые данные, ClickHouse выбрасывает исключение:

```text
Code: 108. DB::Exception: No data to insert
```


## Пример использования {#example-usage}

```bash title="Запрос"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="Ответ"
f9725a22f9191e064120d718e26862a9  -
```


## Настройки формата {#format-settings}
