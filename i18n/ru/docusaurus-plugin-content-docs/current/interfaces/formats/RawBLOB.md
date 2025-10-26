---
slug: '/interfaces/formats/RawBLOB'
description: 'Документация для формата RawBLOB'
title: RawBLOB
keywords: ['RawBLOB']
doc_type: reference
---
## Описание {#description}

Формат `RawBLOB` считывает все входные данные в одно значение. Возможно парсить только таблицу с одним полем типа [`String`](/sql-reference/data-types/string.md) или подобным.
Результат выводится в бинарном формате без ограничителей и экранирования. Если выводится более одного значения, формат становится неоднозначным, и будет невозможно прочитать данные обратно.

### Сравнение форматов Raw {#raw-formats-comparison}

Ниже представлено сравнение форматов `RawBLOB` и [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md).

`RawBLOB`:
- данные выводятся в бинарном формате, без экранирования;
- между значениями нет ограничителей;
- в конце каждого значения нет новой строки.

`TabSeparatedRaw`:
- данные выводятся без экранирования;
- строки содержат значения, разделённые табуляцией;
- после последнего значения в каждой строке есть перевод строки.

Следующее сравнение форматов `RawBLOB` и [RowBinary](./RowBinary/RowBinary.md).

`RawBLOB`:
- Строковые поля выводятся без префикса длины.

`RowBinary`:
- Строковые поля представлены длиной в формате varint (бесподписный [LEB128](https://en.wikipedia.org/wiki/LEB128)), за которым следуют байты строки.

Когда пустые данные передаются на вход `RawBLOB`, ClickHouse выбрасывает исключение:

```text
Code: 108. DB::Exception: No data to insert
```

## Пример использования {#example-usage}

```bash title="Query"
$ clickhouse-client --query "CREATE TABLE {some_table} (a String) ENGINE = Memory;"
$ cat {filename} | clickhouse-client --query="INSERT INTO {some_table} FORMAT RawBLOB"
$ clickhouse-client --query "SELECT * FROM {some_table} FORMAT RawBLOB" | md5sum
```

```text title="Response"
f9725a22f9191e064120d718e26862a9  -
```

## Настройки формата {#format-settings}