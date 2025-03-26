---
sidebar_label: 'Двоичные и родные форматы'
slug: /integrations/data-formats/binary-native
title: 'Использование родных и двоичных форматов в ClickHouse'
description: 'Страница, описывающая, как использовать родные и двоичные форматы в ClickHouse'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Использование родных и двоичных форматов в ClickHouse

ClickHouse поддерживает несколько двоичных форматов, которые обеспечивают лучшую производительность и эффективность использования пространства. Двоичные форматы также безопасны с точки зрения кодировки символов, так как данные сохраняются в двоичном формате.

Мы собираемся использовать таблицу some_data [table](assets/some_data.sql) и [данные](assets/some_data.tsv) для демонстрации, не стесняйтесь воспроизводить это на своей инстанции ClickHouse.

## Экспорт в родном формате ClickHouse {#exporting-in-a-native-clickhouse-format}

Наиболее эффективный формат данных для экспорта и импорта данных между узлами ClickHouse — это [Native](/interfaces/formats.md/#native) формат. Экспорт осуществляется с использованием оператора `INTO OUTFILE`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

Это создаст файл [data.clickhouse](assets/data.clickhouse) в родном формате.

### Импорт из родного формата {#importing-from-a-native-format}

Для импорта данных мы можем использовать [file()](/sql-reference/table-functions/file.md) для небольших файлов или для целей исследования:

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
При использовании функции `file()`, с ClickHouse Cloud вам нужно будет выполнять команды в `clickhouse client` на машине, где находится файл. Другой вариант — использовать [`clickhouse-local`](/operations/utilities/clickhouse-local.md) для исследования файлов локально.
:::

На производстве мы используем `FROM INFILE` для импорта данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### Сжатие в родном формате {#native-format-compression}

Мы также можем включить сжатие при экспорте данных в родном формате (также как и в большинстве других форматов) с использованием оператора `COMPRESSION`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

Мы использовали сжатие LZ4 для экспорта. Нам придется указать это при импорте данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## Экспорт в RowBinary {#exporting-to-rowbinary}

Другим поддерживаемым двоичным форматом является [RowBinary](/interfaces/formats.md/#rowbinary), который позволяет импортировать и экспортировать данные в двоичных строках:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

Это создаст файл [data.binary](assets/data.binary) в формате двоичных строк.

### Исследование файлов RowBinary {#exploring-rowbinary-files}
Автоматическое определение схемы не поддерживается для этого формата, поэтому для исследования перед загрузкой мы должны явно определить схему:

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

Рассмотрите возможность использования [RowBinaryWithNames](/interfaces/formats.md/#rowbinarywithnames), который также добавляет строку заголовка со списком столбцов. [RowBinaryWithNamesAndTypes](/interfaces/formats.md/#rowbinarywithnamesandtypes) также добавит дополнительную строку заголовка с типами столбцов.

### Импорт из файлов RowBinary {#importing-from-rowbinary-files}
Для загрузки данных из файла RowBinary мы можем использовать оператор `FROM INFILE`:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## Импорт одиночного двоичного значения с использованием RawBLOB {#importing-single-binary-value-using-rawblob}

Предположим, мы хотим прочитать весь двоичный файл и сохранить его в поле таблицы.
В этом случае может быть использован [RawBLOB формат](/interfaces/formats.md/#rawblob). Этот формат можно использовать только с таблицей, содержащей один столбец:

```sql
CREATE TABLE images(data String) Engine = Memory
```

Давайте сохраним файл изображения в таблице `images`:

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

Мы можем проверить длину поля `data`, которая будет равна оригинальному размеру файла:

```sql
SELECT length(data) FROM images
```
```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### Экспорт данных RawBLOB {#exporting-rawblob-data}

Этот формат также может быть использован для экспорта данных с использованием оператора `INTO OUTFILE`:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

Обратите внимание, что нам пришлось использовать `LIMIT 1`, так как экспорт более чем одного значения создаст поврежденный файл.

## MessagePack {#messagepack}

ClickHouse поддерживает импорт и экспорт в [MessagePack](https://msgpack.org/) с использованием [MsgPack](/interfaces/formats.md/#msgpack). Для экспорта в формат MessagePack:

```sql
SELECT *
FROM some_data
INTO OUTFILE 'data.msgpk'
FORMAT MsgPack
```

Для импорта данных из [файла MessagePack](assets/data.msgpk):

```sql
INSERT INTO sometable
FROM INFILE 'data.msgpk'
FORMAT MsgPack
```

## Протокол Buffers {#protocol-buffers}

<CloudNotSupportedBadge/>

Для работы с [Protocol Buffers](/interfaces/formats.md/#protobuf) сначала нужно определить [файл схемы](assets/schema.proto):

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

Путь к этому файлу схемы (`schema.proto` в нашем случае) задается в параметре `format_schema` для формата [Protobuf](/interfaces/formats.md/#protobuf):

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

Это сохраняет данные в файл [proto.bin](assets/proto.bin). ClickHouse также поддерживает импорт данных Protobuf, а также вложенные сообщения. Рассмотрите использование [ProtobufSingle](/interfaces/formats.md/#protobufsingle) для работы с одним сообщением Protocol Buffer (длинные разделители будут опущены в этом случае).

## Cap’n Proto {#capn-proto}

<CloudNotSupportedBadge/>

Другой популярный формат двоичной сериализации, поддерживаемый ClickHouse, — это [Cap’n Proto](https://capnproto.org/). Аналогично формату `Protobuf`, мы должны определить файл схемы ([`schema.capnp`](assets/schema.capnp)) в нашем примере:

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

Теперь мы можем импортировать и экспортировать с использованием формата [CapnProto](/interfaces/formats.md/#capnproto) и этой схемы:

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

Обратите внимание, что нам пришлось привести к типу `Date` столбец как `UInt32`, чтобы [соответствовать соответствующим типам](/interfaces/formats/CapnProto#data_types-matching-capnproto).

## Другие форматы {#other-formats}

ClickHouse вводит поддержку многих форматов, как текстовых, так и двоичных, для различных сценариев и платформ. Изучите больше форматов и способы работы с ними в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON форматы](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- **Родные и двоичные форматы**
- [SQL форматы](sql.md)

А также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - портативным полнофункциональным инструментом для работы с локальными/удалёнными файлами без запуска сервера ClickHouse.
