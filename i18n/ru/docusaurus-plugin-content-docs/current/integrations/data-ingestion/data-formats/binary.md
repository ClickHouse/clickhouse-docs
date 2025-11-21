---
sidebar_label: 'Двоичный и Native'
slug: /integrations/data-formats/binary-native
title: 'Использование двоичных форматов и формата Native в ClickHouse'
description: 'Страница, описывающая, как использовать двоичные форматы и формат Native в ClickHouse'
keywords: ['двоичные форматы', 'формат Native', 'rowbinary', 'rawblob', 'messagepack', 'protobuf', 'capn proto', 'форматы данных', 'производительность', 'сжатие']
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Использование формата Native и других двоичных форматов в ClickHouse

ClickHouse поддерживает несколько двоичных форматов, которые обеспечивают более высокую производительность и более эффективное использование дискового пространства. Двоичные форматы также безопасны с точки зрения кодировок символов, поскольку данные сохраняются в двоичном виде.

Мы будем использовать таблицу some_data [table](assets/some_data.sql) и [data](assets/some_data.tsv) для демонстрации; вы можете воспроизвести это на своём экземпляре ClickHouse.



## Экспорт в нативном формате ClickHouse {#exporting-in-a-native-clickhouse-format}

Наиболее эффективным форматом данных для экспорта и импорта данных между узлами ClickHouse является формат [Native](/interfaces/formats/Native). Экспорт выполняется с использованием конструкции `INTO OUTFILE`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse' FORMAT Native
```

Эта команда создаст файл [data.clickhouse](assets/data.clickhouse) в нативном формате.

### Импорт из нативного формата {#importing-from-a-native-format}

Для импорта данных можно использовать функцию [file()](/sql-reference/table-functions/file.md) для небольших файлов или в целях исследования:

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
При использовании функции `file()` в ClickHouse Cloud необходимо выполнять команды в `clickhouse client` на машине, где находится файл. Альтернативный вариант — использовать [`clickhouse-local`](/operations/utilities/clickhouse-local.md) для локального исследования файлов.
:::

В продакшене для импорта данных используется конструкция `FROM INFILE`:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
FORMAT Native
```

### Сжатие нативного формата {#native-format-compression}

Также можно включить сжатие при экспорте данных в формат Native (как и в большинство других форматов) с помощью конструкции `COMPRESSION`:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```

В данном примере использовано сжатие LZ4 для экспорта. Его необходимо указать при импорте данных:

```sql
INSERT INTO sometable
FROM INFILE 'data.clickhouse'
COMPRESSION 'lz4'
FORMAT Native
```


## Экспорт в RowBinary {#exporting-to-rowbinary}

Другой поддерживаемый бинарный формат — [RowBinary](/interfaces/formats/RowBinary), который позволяет импортировать и экспортировать данные в виде строк в бинарном представлении:

```sql
SELECT * FROM some_data
INTO OUTFILE 'data.binary' FORMAT RowBinary
```

Эта команда создаст файл [data.binary](assets/data.binary) в формате бинарных строк.

### Изучение файлов RowBinary {#exploring-rowbinary-files}

Автоматическое определение схемы не поддерживается для этого формата, поэтому для изучения данных перед загрузкой необходимо явно указать схему:

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

Рекомендуется использовать [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames), который также добавляет строку заголовка со списком столбцов. [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes) дополнительно добавит строку заголовка с типами столбцов.

### Импорт из файлов RowBinary {#importing-from-rowbinary-files}

Для загрузки данных из файла RowBinary можно использовать конструкцию `FROM INFILE`:

```sql
INSERT INTO sometable
FROM INFILE 'data.binary'
FORMAT RowBinary
```


## Импорт одного бинарного значения с использованием RawBLOB {#importing-single-binary-value-using-rawblob}

Предположим, необходимо прочитать целый бинарный файл и сохранить его в поле таблицы.
В этом случае можно использовать [формат RawBLOB](/interfaces/formats/RawBLOB). Этот формат можно использовать непосредственно только с таблицей, состоящей из одного столбца:

```sql
CREATE TABLE images(data String) ENGINE = Memory
```

Сохраним файл изображения в таблицу `images`:

```bash
cat image.jpg | clickhouse-client -q "INSERT INTO images FORMAT RawBLOB"
```

Можно проверить длину поля `data`, которая будет равна размеру исходного файла:

```sql
SELECT length(data) FROM images
```

```response
┌─length(data)─┐
│         6121 │
└──────────────┘
```

### Экспорт данных RawBLOB {#exporting-rawblob-data}

Этот формат также можно использовать для экспорта данных с помощью конструкции `INTO OUTFILE`:

```sql
SELECT * FROM images LIMIT 1
INTO OUTFILE 'out.jpg'
FORMAT RawBLOB
```

Обратите внимание, что необходимо использовать `LIMIT 1`, поскольку экспорт более одного значения приведёт к созданию повреждённого файла.


## MessagePack {#messagepack}

ClickHouse поддерживает импорт и экспорт данных в формате [MessagePack](https://msgpack.org/) с помощью формата [MsgPack](/interfaces/formats/MsgPack). Для экспорта данных в формат MessagePack:

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


## Protocol Buffers {#protocol-buffers}

<CloudNotSupportedBadge />

Для работы с [Protocol Buffers](/interfaces/formats/Protobuf) сначала необходимо определить [файл схемы](assets/schema.proto):

```protobuf
syntax = "proto3";

message MessageType {
  string path = 1;
  date month = 2;
  uint32 hits = 3;
};
```

Путь к этому файлу схемы (`schema.proto` в данном случае) указывается в параметре `format_schema` для формата [Protobuf](/interfaces/formats/Protobuf):

```sql
SELECT * FROM some_data
INTO OUTFILE 'proto.bin'
FORMAT Protobuf
SETTINGS format_schema = 'schema:MessageType'
```

Эта команда сохраняет данные в файл [proto.bin](assets/proto.bin). ClickHouse также поддерживает импорт данных Protobuf и вложенных сообщений. Для работы с одним сообщением Protocol Buffer рекомендуется использовать формат [ProtobufSingle](/interfaces/formats/ProtobufSingle) (в этом случае разделители длины будут опущены).


## Cap'n Proto {#capn-proto}

<CloudNotSupportedBadge />

Другой популярный формат бинарной сериализации, поддерживаемый ClickHouse, — это [Cap'n Proto](https://capnproto.org/). Аналогично формату `Protobuf`, необходимо определить файл схемы ([`schema.capnp`](assets/schema.capnp)) в нашем примере:

```response
@0xec8ff1a10aa10dbe;

struct PathStats {
  path @0 :Text;
  month @1 :UInt32;
  hits @2 :UInt32;
}
```

Теперь можно импортировать и экспортировать данные, используя формат [CapnProto](/interfaces/formats/CapnProto) и эту схему:

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

Обратите внимание, что столбец `Date` необходимо привести к типу `UInt32`, чтобы [соответствовать типам данных](/interfaces/formats/CapnProto#data_types-matching-capnproto).


## Другие форматы {#other-formats}

ClickHouse поддерживает множество форматов — как текстовых, так и бинарных — для различных сценариев и платформ. Подробнее о форматах и способах работы с ними читайте в следующих статьях:

- [Форматы CSV и TSV](csv-tsv.md)
- [Parquet](parquet.md)
- [Форматы JSON](/integrations/data-ingestion/data-formats/json/intro.md)
- [Регулярные выражения и шаблоны](templates-regex.md)
- **Нативные и бинарные форматы**
- [Форматы SQL](sql.md)

Также рекомендуем ознакомиться с [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) — портативным полнофункциональным инструментом для работы с локальными и удалёнными файлами без запуска сервера ClickHouse.
