---
sidebar_label: 'Бинарные и родные форматы'
slug: /integrations/data-formats/binary-native
title: 'Использование родных и бинарных форматов в ClickHouse'
description: 'Страница, описывающая, как использовать родные и бинарные форматы в ClickHouse'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Использование родных и бинарных форматов в ClickHouse

ClickHouse поддерживает несколько бинарных форматов, которые обеспечивают лучшую производительность и экономию пространства. Бинарные форматы также безопасны с точки зрения кодировки символов, поскольку данные сохраняются в бинарной форме.

Мы будем использовать some_data [таблицу](assets/some_data.sql) и [данные](assets/some_data.tsv) для демонстрации, не стесняйтесь воспроизводить это на вашей инстансе ClickHouse.

## Экспорт в родном формате ClickHouse {#exporting-in-a-native-clickhouse-format}

Наиболее эффективным форматом данных для экспорта и импорта данных между узлами ClickHouse является [Родной](/interfaces/formats.md/#native) формат. Экспорт выполняется с использованием оператора `INTO OUTFILE`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

Это создаст [data.clickhouse](assets/data.clickhouse) файл в родном формате.

### Импорт из родного формата {#importing-from-a-native-format}

Чтобы импортировать данные, мы можем использовать [file()](/sql-reference/table-functions/file.md) для небольших файлов или исследовательских целей:

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
При использовании функции `file()`, с ClickHouse Cloud вам необходимо выполнять команды в `clickhouse client` на машине, где находится файл. Другой вариант — использовать [`clickhouse-local`](/operations/utilities/clickhouse-local.md) для изучения файлов локально.
:::

В производственных условиях мы используем `FROM INFILE` для импорта данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### Сжатие родного формата {#native-format-compression}

Мы также можем включить сжатие при экспорте данных в родной формат (а также в большинстве других форматов) с помощью оператора `COMPRESSION`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

Мы использовали LZ4 сжатие для экспорта. Нам придется указать его при импорте данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## Экспорт в RowBinary {#exporting-to-rowbinary}

Другим поддерживаемым бинарным форматом является [RowBinary](/interfaces/formats.md/#rowbinary), который позволяет импортировать и экспортировать данные в бинарных строках:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

Это создаст [data.binary](assets/data.binary) файл в формате бинарных строк.

### Исследование файлов RowBinary {#exploring-rowbinary-files}
Автоматический вывод схемы не поддерживается для этого формата, поэтому, чтобы исследовать перед загрузкой, нам необходимо явно определить схему:

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
Чтобы загрузить данные из файла RowBinary, мы можем использовать оператор `FROM INFILE`:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## Импорт единственного бинарного значения с использованием RawBLOB {#importing-single-binary-value-using-rawblob}

Предположим, мы хотим прочитать весь бинарный файл и сохранить его в поле в таблице.
В таком случае можно использовать [формат RawBLOB](/interfaces/formats.md/#rawblob). Этот формат можно использовать только с таблицей, содержащей одну колонку:

```sql
CREATE TABLE images(data String) Engine = Memory
```

Давайте сохраним изображение в таблице `images`:

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

Этот формат также можно использовать для экспорта данных с помощью оператора `INTO OUTFILE`:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

Обратите внимание, что мы должны были использовать `LIMIT 1`, потому что экспорт более чем одного значения создаст поврежденный файл.

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

## Протокол Буферов {#protocol-buffers}

<CloudNotSupportedBadge/>

Для работы с [Протоколом Буферов](/interfaces/formats.md/#protobuf) сначала необходимо определить [файл схемы](assets/schema.proto):

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

Путь к этому файлу схемы (`schema.proto` в нашем случае) устанавливается в настройке `format_schema` для формата [Protobuf](/interfaces/formats.md/#protobuf):

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

Это сохраняет данные в файл [proto.bin](assets/proto.bin). ClickHouse также поддерживает импорт данных Protobuf, а также вложенных сообщений. Рассмотрите возможность использования [ProtobufSingle](/interfaces/formats.md/#protobufsingle) для работы с единственным сообщением Protocol Buffer (в этом случае длина ограничителей будет опущена).

## Cap'n Proto {#capn-proto}

<CloudNotSupportedBadge/>

Другим популярным форматом бинарной сериализации, поддерживаемым ClickHouse, является [Cap'n Proto](https://capnproto.org/). Аналогично формату `Protobuf`, мы должны определить файл схемы ([`schema.capnp`](assets/schema.capnp)) в нашем примере:

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

Теперь мы можем экспортировать и импортировать с использованием формата [CapnProto](/interfaces/formats.md/#capnproto) и этой схемы:

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

Обратите внимание, что нам пришлось привести колонку `Date` к типу `UInt32`, чтобы [соответствовать соответствующим типам](/interfaces/formats/CapnProto#data_types-matching-capnproto).

## Другие форматы {#other-formats}

ClickHouse вводит поддержку для множества форматов, как текстовых, так и бинарных, чтобы охватить различные сценарии и платформы. Узнайте больше о форматах и способах работы с ними в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- **Родные и бинарные форматы**
- [SQL форматы](sql.md)

И также ознакомьтесь с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - портативным полнофункциональным инструментом для работы с локальными/удаленными файлами без запуска сервера ClickHouse.
