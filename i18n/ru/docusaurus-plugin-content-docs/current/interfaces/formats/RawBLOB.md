---
description: 'Документация для формата RawBLOB'
keywords: ['RawBLOB']
slug: /interfaces/formats/RawBLOB
title: 'RawBLOB'
---

## Описание {#description}

Формат `RawBLOB` читает все входные данные как одно значение. Возможно разобрать только таблицу с единственным полем типа [`String`](/sql-reference/data-types/string.md) или аналогичным. Результат выводится в бинарном формате без разделителей и экранирования. Если выводится более одного значения, формат становится неоднозначным, и будет невозможно считать данные обратно.

### Сравнение сырьевых форматов {#raw-formats-comparison}

Ниже приведено сравнение форматов `RawBLOB` и [`TabSeparatedRaw`](./TabSeparated/TabSeparatedRaw.md).

`RawBLOB`:
- данные выводятся в бинарном формате, без экранирования;
- между значениями нет разделителей;
- в конце каждого значения нет нового переноса строки.

`TabSeparatedRaw`:
- данные выводятся без экранирования;
- строки содержат значения, разделенные табуляцией;
- после последнего значения в каждой строке имеется перенос строки.

Следующее сравнение форматов `RawBLOB` и [RowBinary](./RowBinary/RowBinary.md).

`RawBLOB`:
- Строковые поля выводятся без префикса длиной.

`RowBinary`:
- Строковые поля представлены как длина в формате varint (беззнаковый [LEB128](https://en.wikipedia.org/wiki/LEB128)), за которой следуют байты строки.

Когда пустые данные передаются на ввод `RawBLOB`, ClickHouse выдает исключение:

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
