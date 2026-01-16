---
sidebar_label: 'Native и двоичные'
slug: /integrations/data-formats/binary-native
title: 'Использование формата Native и двоичных форматов в ClickHouse'
description: 'Страница, описывающая, как использовать формат Native и двоичные форматы в ClickHouse'
keywords: ['двоичные форматы', 'формат Native', 'rowbinary', 'rawblob', 'messagepack', 'protobuf', 'capn proto', 'форматы данных', 'производительность', 'сжатие']
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Использование формата Native и бинарных форматов в ClickHouse \\{#using-native-and-binary-formats-in-clickhouse\\}

ClickHouse поддерживает несколько бинарных форматов, которые обеспечивают более высокую производительность и эффективность использования дискового пространства. Бинарные форматы также безопасны с точки зрения кодировки символов, поскольку данные сохраняются в двоичном виде.

Для демонстрации мы будем использовать [таблицу some_data](assets/some_data.sql) и [данные](assets/some_data.tsv); вы можете воспроизвести это в своём экземпляре ClickHouse.

## Экспорт в нативном формате ClickHouse \\{#exporting-in-a-native-clickhouse-format\\}

Наиболее эффективный формат данных для экспорта и импорта между узлами ClickHouse — формат [Native](/interfaces/formats/Native). Экспорт выполняется с помощью оператора `INTO OUTFILE`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

Это создаст файл [data.clickhouse](assets/data.clickhouse) в нативном формате.

### Импорт из нативного формата \\{#importing-from-a-native-format\\}

Чтобы импортировать данные, можно использовать [file()](/sql-reference/table-functions/file.md) для небольших файлов или в исследовательских целях:

```sql
DESCRIBE file('data.clickhouse', Native);
```

```response
┌─name──┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ String │              │                    │         │                  │                │
│ month │ Date   │              │                    │         │                  │                │
│ hits  │ UInt32 │              │                    │         │                  │                │
└───────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

:::tip
При использовании функции `file()` с ClickHouse Cloud вам нужно запускать команды в `clickhouse client` на машине, где расположен файл. Другой вариант — использовать [`clickhouse-local`](/operations/utilities/clickhouse-local.md) для локальной работы с файлами.
:::

В production-среде мы используем `FROM INFILE` для импорта данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### Сжатие в формате Native \\{#native-format-compression\\}

Мы также можем включить сжатие при экспорте данных в формат Native, как и для большинства других форматов, с помощью клаузы `COMPRESSION`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

Мы использовали сжатие LZ4 при экспорте. Его нужно будет указать при импорте данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## Экспорт в RowBinary \\{#exporting-to-rowbinary\\}

Ещё один поддерживаемый двоичный формат — [RowBinary](/interfaces/formats/RowBinary), который позволяет импортировать и экспортировать данные в виде строк в двоичном формате:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

Это создаст файл [data.binary](assets/data.binary) в формате бинарных строк.

### Исследование файлов RowBinary \\{#exploring-rowbinary-files\\}

Автоматическое определение схемы для этого формата не поддерживается, поэтому, чтобы исследовать данные перед загрузкой, необходимо явно задать схему:

```sql
SELECT *
FROM file('data.binary', RowBinary, 'path String, month Date, hits UInt32')
LIMIT 5
```

```response
┌─path───────────────────────────┬──────month─┬─hits─┐
│ Bangor_City_Forest             │ 2015-07-01 │   34 │
│ Alireza_Afzal                  │ 2017-02-01 │   24 │
│ Akhaura-Laksam-Chittagong_Line │ 2015-09-01 │   30 │
│ 1973_National_500              │ 2017-10-01 │   80 │
│ Attachment                     │ 2017-09-01 │ 1356 │
└────────────────────────────────┴────────────┴──────┘
```

Рассмотрите использование [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames), который также добавляет строку заголовка со списком столбцов. [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes) дополнительно добавит строку заголовка с типами столбцов.

### Импорт из файлов RowBinary \\{#importing-from-rowbinary-files\\}

Чтобы загрузить данные из файла RowBinary, можно использовать конструкцию `FROM INFILE`:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## Импорт одного двоичного значения с помощью RawBLOB \\{#importing-single-binary-value-using-rawblob\\}

Предположим, что мы хотим прочитать весь двоичный файл и сохранить его в поле таблицы.
В таком случае можно использовать [формат RawBLOB](/interfaces/formats/RawBLOB). Этот формат может использоваться только с таблицей с одним столбцом:

```sql
CREATE TABLE images(data String) ENGINE = Memory
```

Сохраним файл с изображением в таблицу `images`:

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

Мы можем проверить длину поля `data` — она будет равна исходному размеру файла:

```sql
SELECT length(data) FROM images
```

```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### Экспорт данных в формате RawBLOB \\{#exporting-rawblob-data\\}

Этот формат также можно использовать для экспорта данных с помощью конструкции `INTO OUTFILE`:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

Обратите внимание, что нам пришлось использовать `LIMIT 1`, так как экспорт более чем одного значения приведёт к повреждению файла.

## MessagePack \\{#messagepack\\}

ClickHouse поддерживает импорт и экспорт данных в формат [MessagePack](https://msgpack.org/) с использованием формата [MsgPack](/interfaces/formats/MsgPack). Чтобы экспортировать данные в формат MessagePack:

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

Чтобы импортировать данные из [файла в формате MessagePack](assets/data.msgpk):

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## Protocol Buffers \\{#protocol-buffers\\}

<CloudNotSupportedBadge />

Чтобы работать с [Protocol Buffers](/interfaces/formats/Protobuf), сначала нужно определить [файл схемы](assets/schema.proto):

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

Путь к этому файлу схемы (в нашем случае `schema.proto`) указывается в настройке `format_schema` для формата [Protobuf](/interfaces/formats/Protobuf):

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

Это сохраняет данные в файл [proto.bin](assets/proto.bin). ClickHouse также поддерживает импорт данных Protobuf, включая вложенные сообщения. Рассмотрите возможность использования [ProtobufSingle](/interfaces/formats/ProtobufSingle) для работы с одним сообщением Protocol Buffer (в этом случае разделители длины будут опущены).

## Cap&#39;n Proto \\{#capn-proto\\}

<CloudNotSupportedBadge />

Еще один популярный бинарный формат сериализации, поддерживаемый ClickHouse, — [Cap&#39;n Proto](https://capnproto.org/). Как и в случае с форматом `Protobuf`, в нашем примере нужно определить файл схемы ([`schema.capnp`](assets/schema.capnp)):

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

Теперь мы можем импортировать и экспортировать, используя формат [CapnProto](/interfaces/formats/CapnProto) и следующую схему:

```sql
SELECT
    path,
    CAST(month, 'UInt32') AS month,
    hits
FROM some_data
INTO OUTFILE 'capnp.bin'
FORMAT CapnProto
SETTINGS format_schema = 'schema:PathStats'
```

Обратите внимание, что нам пришлось привести столбец `Date` к типу `UInt32`, чтобы [типы данных совпадали](/interfaces/formats/CapnProto#data_types-matching-capnproto).

## Другие форматы \\{#other-formats\\}

ClickHouse поддерживает множество форматов, как текстовых, так и двоичных, чтобы охватывать различные сценарии и платформы. Узнайте больше о форматах и способах работы с ними в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- **Форматы Native и двоичные**
- [SQL-форматы](sql.md)

А также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — переносимым полнофункциональным инструментом для работы с локальными и удалёнными файлами без запуска сервера ClickHouse.
