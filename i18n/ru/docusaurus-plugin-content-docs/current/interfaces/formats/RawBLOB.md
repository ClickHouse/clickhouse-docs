---
title: RawBLOB
slug: /interfaces/formats/RawBLOB
keywords: ['RawBLOB']
---

## Описание {#description}

Формат `RawBLOB` читает все входные данные в одно значение. Возможно парсить только таблицу с одним полем типа [`String`](/sql-reference/data-types/string.md) или аналогичным.
Результат выводится в двоичном формате без разделителей и экранирования. Если выводится более одного значения, формат становится неоднозначным, и будет невозможно считать данные обратно.

### Сравнение сырых форматов {#raw-formats-comparison}

Ниже представлено сравнение форматов `RawBLOB` и [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md).

`RawBLOB`:
- данные выводятся в двоичном формате, без экранирования;
- между значениями нет разделителей;
- в конце каждого значения нет новой строки.

`TabSeparatedRaw`:
- данные выводятся без экранирования;
- строки содержат значения, разделенные табуляцией;
- после последнего значения в каждой строке есть перенос строки.

Следующее сравнение форматов `RawBLOB` и [RowBinary](./RowBinary/RowBinary.md).

`RawBLOB`:
- Поля строкового типа выводятся без префикса длины.

`RowBinary`:
- Поля строкового типа представлены как длина в формате varint (без знака [LEB128] (https://en.wikipedia.org/wiki/LEB128)), за которой следуют байты строки.

Когда пустые данные передаются на вход `RawBLOB`, ClickHouse выбрасывает исключение:

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
