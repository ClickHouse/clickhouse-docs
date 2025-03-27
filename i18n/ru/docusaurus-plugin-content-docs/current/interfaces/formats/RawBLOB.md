---
description: 'Документация для формата RawBLOB'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
---

## Описание {#description}

Формат `RawBLOB` считывает все входные данные в одно значение. Возможно разбить только таблицу с единственным полем типа [`String`](/sql-reference/data-types/string.md) или аналогичным. 
Результат выводится в бинарном формате без разделителей и экранирования. Если возвращается более одного значения, формат становится неоднозначным, и будет невозможно повторно считать данные.

### Сравнение форматов Raw {#raw-formats-comparison}

Ниже представлено сравнение форматов `RawBLOB` и [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md).

`RawBLOB`:
- данные выводятся в бинарном формате, без экранирования;
- разделителей между значениями нет;
- в конце каждого значения нет новой строки.

`TabSeparatedRaw`:
- данные выводятся без экранирования;
- строки содержат значения, разделенные табуляцией;
- в каждой строке после последнего значения есть перенос строки.

Следующее сравнение форматов `RawBLOB` и [RowBinary](./RowBinary/RowBinary.md).

`RawBLOB`:
- Поля типа String выводятся без предварительного указания длины.

`RowBinary`:
- Поля типа String представлены как длина в формате varint (беззнаковый [LEB128](https://en.wikipedia.org/wiki/LEB128)), за которой следуют байты строки.

Когда в `RawBLOB` подаются пустые данные, ClickHouse выбрасывает исключение:

```text
Код: 108. DB::Exception: Нет данных для вставки
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
