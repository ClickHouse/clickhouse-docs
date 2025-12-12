---
description: 'Документация по формату RawBLOB'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
doc_type: 'reference'
---

## Описание {#description}

Формат `RawBLOB` считывает все входные данные в одно значение. Можно разобрать только таблицу с одним полем типа [`String`](/sql-reference/data-types/string.md) или аналогичного типа.
Результат выводится в двоичном формате без разделителей и экранирования. Если выводится более одного значения, формат становится неоднозначным, и прочитать данные обратно будет невозможно.

### Сравнение форматов Raw {#raw-formats-comparison}

Ниже приведено сравнение форматов `RawBLOB` и [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md).

`RawBLOB`:

* данные выводятся в двоичном формате, без экранирования;
* между значениями нет разделителей;
* в конце каждого значения нет символа новой строки.

`TabSeparatedRaw`:

* данные выводятся без экранирования;
* строки содержат значения, разделённые символами табуляции;
* после последнего значения в каждой строке есть перевод строки.

Ниже приведено сравнение форматов `RawBLOB` и [RowBinary](./RowBinary/RowBinary.md).

`RawBLOB`:

* поля типа String выводятся без префикса длины.

`RowBinary`:

* поля типа String представляются как длина в формате varint (беззнаковый [LEB128] ([https://en.wikipedia.org/wiki/LEB128](https://en.wikipedia.org/wiki/LEB128))), за которой следуют байты строки.

Когда на вход `RawBLOB` подаются пустые данные, ClickHouse генерирует исключение:

```text
Код: 108. DB::Exception: Отсутствуют данные для вставки
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

## Параметры форматирования {#format-settings}
