---
sidebar_label: 'Двоичные и Нативные'
slug: /integrations/data-formats/binary-native
title: 'Использование нативных и двоичных форматов в ClickHouse'
description: 'Страница, описывающая, как использовать нативные и двоичные форматы в ClickHouse'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Использование нативных и двоичных форматов в ClickHouse

ClickHouse поддерживает несколько двоичных форматов, что обеспечивает лучшую производительность и эффективность использования пространства. Двоичные форматы также безопасны с точки зрения кодирования символов, поскольку данные сохраняются в двоичном виде.

Мы будем использовать some_data [таблицу](assets/some_data.sql) и [данные](assets/some_data.tsv) для демонстрации, не стесняйтесь воспроизводить это на своей инстанции ClickHouse.

## Экспорт в нативный формат ClickHouse {#exporting-in-a-native-clickhouse-format}

Самым эффективным форматом данных для экспорта и импорта данных между узлами ClickHouse является [Native](/interfaces/formats.md/#native) формат. Экспорт выполняется с использованием оператора `INTO OUTFILE`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

Это создаст [data.clickhouse](assets/data.clickhouse) файл в нативном формате.

### Импорт из нативного формата {#importing-from-a-native-format}

Для импорта данных мы можем использовать [file()](/sql-reference/table-functions/file.md) для небольших файлов или для исследовательских целей:

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
При использовании функции `file()`, с ClickHouse Cloud вам нужно будет выполнять команды в `clickhouse client` на машине, где находится файл. Другой вариант - использовать [`clickhouse-local`](/operations/utilities/clickhouse-local.md) для исследования файлов локально.
:::

В production мы используем `FROM INFILE` для импорта данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### Сжатие нативного формата {#native-format-compression}

Мы также можем включить сжатие при экспорте данных в нативный формат (также как и в большинстве других форматов) с использованием оператора `COMPRESSION`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

Мы использовали сжатие LZ4 для экспорта. Мы должны указать это при импорте данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## Экспорт в RowBinary {#exporting-to-rowbinary}

Другой поддерживаемый двоичный формат - это [RowBinary](/interfaces/formats.md/#rowbinary), который позволяет импортировать и экспортировать данные в двоичных строках:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

Это создаст [data.binary](assets/data.binary) файл в формате двоичных строк.

### Исследование файлов RowBinary {#exploring-rowbinary-files}
Автоматическое определение схемы не поддерживается для этого формата, поэтому для анализа перед загрузкой мы должны явно определить схему:

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

Рекомендуется использовать [RowBinaryWithNames](/interfaces/formats.md/#rowbinarywithnames), который также добавляет строку заголовка со списком колонок. [RowBinaryWithNamesAndTypes](/interfaces/formats.md/#rowbinarywithnamesandtypes) также добавит дополнительную строку заголовка с типами колонок.

### Импорт из файлов RowBinary {#importing-from-rowbinary-files}
Для загрузки данных из файла RowBinary мы можем использовать оператор `FROM INFILE`:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## Импортирование одного двоичного значения с использованием RawBLOB {#importing-single-binary-value-using-rawblob}

Предположим, мы хотим прочитать весь двоичный файл и сохранить его в поле таблицы.
Это случай, когда можно использовать [RawBLOB формат](/interfaces/formats.md/#rawblob). Этот формат можно использовать только с одно-колоночной таблицей:

```sql
CREATE TABLE images(data String) Engine = Memory
```

Давайте сохраним файл изображения в таблицу `images`:

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

Мы можем проверить длину поля `data`, которая будет равна размеру исходного файла:

```sql
SELECT length(data) FROM images
```
```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### Экспорт данных RawBLOB {#exporting-rawblob-data}

Этот формат также может использоваться для экспорта данных с помощью оператора `INTO OUTFILE`:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

Обратите внимание, что нам пришлось использовать `LIMIT 1`, потому что экспорт больше одного значения создаст поврежденный файл.

## MessagePack {#messagepack}

ClickHouse поддерживает импорт и экспорт в [MessagePack](https://msgpack.org/) с использованием [MsgPack](/interfaces/formats.md/#msgpack). Чтобы экспортировать в формат MessagePack:

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

Чтобы импортировать данные из [файла MessagePack](assets/data.msgpk):

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## Protocol Buffers {#protocol-buffers}

<CloudNotSupportedBadge/>

Для работы с [Protocol Buffers](/interfaces/formats.md/#protobuf) мы сначала должны определить [файл схемы](assets/schema.proto):

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

Путь к этому файлу схемы (`schema.proto` в нашем случае) устанавливается в настройках `format_schema` для формата [Protobuf](/interfaces/formats.md/#protobuf):

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

Это сохраняет данные в файл [proto.bin](assets/proto.bin). ClickHouse также поддерживает импорт данных Protobuf, а также вложенных сообщений. Рассмотрите возможность использования [ProtobufSingle](/interfaces/formats.md/#protobufsingle) для работы с одним сообщением Protocol Buffer (в этом случае длины разделителей будут опущены).

## Cap’n Proto {#capn-proto}

<CloudNotSupportedBadge/>

Другой популярный формат двоичной сериализации, поддерживаемый ClickHouse, это [Cap’n Proto](https://capnproto.org/). Подобно формату `Protobuf`, мы должны определить файл схемы ([`schema.capnp`](assets/schema.capnp)) в нашем примере:

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

Теперь мы можем импортировать и экспортировать, используя формат [CapnProto](/interfaces/formats.md/#capnproto) и эту схему:

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

Обратите внимание, что нам пришлось преобразовать колонку `Date` в `UInt32`, чтобы [совпадать с соответствующими типами](/interfaces/formats/CapnProto#data_types-matching-capnproto).

## Другие форматы {#other-formats}

ClickHouse вводит поддержку множества форматов, как текстовых, так и двоичных, чтобы покрыть различные сценарии и платформы. Исследуйте больше форматов и способы работы с ними в следующих статьях:

- [CSV и TSV форматы](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON форматы](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex и шаблоны](templates-regex.md)
- **Нативные и двоичные форматы**
- [SQL форматы](sql.md)

И также проверьте [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - портативный полнофункциональный инструмент для работы с локальными/удалёнными файлами без запуска сервера ClickHouse.
