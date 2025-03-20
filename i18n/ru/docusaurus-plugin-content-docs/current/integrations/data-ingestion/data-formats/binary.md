---
sidebar_label: 'Двоичные и родные форматы'
slug: /integrations/data-formats/binary-native
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Использование родных и двоичных форматов в ClickHouse

ClickHouse поддерживает несколько двоичных форматов, которые обеспечивают лучшую производительность и эффективность использования пространства. Двоичные форматы также безопасны в кодировке символов, так как данные сохраняются в двоичном виде.

Мы будем использовать некоторые данные [таблицы](assets/some_data.sql) и [данные](assets/some_data.tsv) для демонстрации, не стесняйтесь воспроизводить это на вашей инстанции ClickHouse.

## Экспорт в родном формате ClickHouse {#exporting-in-a-native-clickhouse-format}

Самый эффективный формат данных для экспорта и импорта данных между узлами ClickHouse - это [родной]( /interfaces/formats.md/#native) формат. Экспорт осуществляется с помощью ключевого слова `INTO OUTFILE`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

Это создаст файл [data.clickhouse](assets/data.clickhouse) в родном формате.

### Импорт из родного формата {#importing-from-a-native-format}

Для импорта данных мы можем использовать [file()](/sql-reference/table-functions/file.md) для небольших файлов или целей исследования:

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
При использовании функции `file()`, в ClickHouse Cloud вам нужно будет выполнять команды в `clickhouse client` на машине, где находится файл. Другой вариант - использовать [`clickhouse-local`](/operations/utilities/clickhouse-local.md) для локального исследования файлов.
:::

В производственной среде мы используем `FROM INFILE` для импорта данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### Сжатие родного формата {#native-format-compression}

Мы также можем включить сжатие при экспорте данных в родном формате (а также в большинстве других форматов) с помощью ключевого слова `COMPRESSION`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

Мы использовали сжатие LZ4 для экспорта. Нам нужно будет указать его при импорте данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

## Экспорт в RowBinary {#exporting-to-rowbinary}

Другой поддерживаемый двоичный формат - это [RowBinary](/interfaces/formats.md/#rowbinary), который позволяет импортировать и экспортировать данные в двоично представленных строках:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

Это создаст файл [data.binary](assets/data.binary) в формате двоичных строк.

### Исследование файлов RowBinary {#exploring-rowbinary-files}
Автоматическое определение схемы для этого формата не поддерживается, поэтому для исследования перед загрузкой нам нужно будет явно определить схему:

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
Чтобы загрузить данные из файла RowBinary, мы можем использовать ключевое слово `FROM INFILE`:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```

## Импорт одного двоичного значения с помощью RawBLOB {#importing-single-binary-value-using-rawblob}

Предположим, мы хотим прочитать весь двоичный файл и сохранить его в поле таблицы. Это случай, когда может быть использован [формат RawBLOB](/interfaces/formats.md/#rawblob). Этот формат может быть использован непосредственно только с таблицей с одним столбцом:

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

Этот формат также может быть использован для экспорта данных с помощью ключевого слова `INTO OUTFILE`:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

Обратите внимание, что нам нужно было использовать `LIMIT 1`, потому что экспорт более чем одного значения нарушит целостность файла.

## MessagePack {#messagepack}

ClickHouse поддерживает импорт и экспорт в [MessagePack](https://msgpack.org/) с использованием [MsgPack](/interfaces/formats.md/#msgpack). Чтобы экспортировать в формат MessagePack:

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

Чтобы работать с [Протоколами Buffers](/interfaces/formats.md/#protobuf), нам необходимо сначала определить [файл схемы](assets/schema.proto):

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

Путь к этому файлу схемы (`schema.proto` в нашем случае) устанавливается в параметре `format_schema` для формата [Protobuf](/interfaces/formats.md/#protobuf):

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

Это сохраняет данные в файл [proto.bin](assets/proto.bin). ClickHouse также поддерживает импорт данных Protobuf, а также вложенные сообщения. Рассмотрите возможность использования [ProtobufSingle](/interfaces/formats.md/#protobufsingle) для работы с одним сообщением Protocol Buffer (длины разделителей будут опущены в этом случае).

## Cap’n Proto {#capn-proto}

<CloudNotSupportedBadge/>

Еще одним популярным форматом бинарной сериализации, поддерживаемым ClickHouse, является [Cap’n Proto](https://capnproto.org/). Аналогично формату `Protobuf`, нам нужно определить файл схемы ([`schema.capnp`](assets/schema.capnp)) в нашем примере:

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

Обратите внимание, что нам пришлось привести колонку `Date` к типу `UInt32`, чтобы [совпадать с соответствующими типами](/interfaces/formats/CapnProto#data_types-matching-capnproto).

## Другие форматы {#other-formats}

ClickHouse вводит поддержку для многих форматов, как текстовых, так и бинарных, чтобы покрыть различные сценарии и платформы. Изучите更多 форматов и способы работы с ними в следующих статьях:

- [CSV и TSV форматы](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON форматы](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- **Родные и двоичные форматы**
- [SQL форматы](sql.md)

Также проверьте [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - переносимый полнофункциональный инструмент для работы с локальными/удаленными файлами без запуска сервера ClickHouse.
