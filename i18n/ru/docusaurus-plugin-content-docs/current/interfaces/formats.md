---
description: 'Обзор поддерживаемых форматов данных для ввода и вывода в ClickHouse'
sidebar_label: 'Посмотреть все форматы...'
sidebar_position: 21
slug: /interfaces/formats
title: 'Форматы для ввода и вывода данных'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Форматы для ввода и вывода данных {#formats-for-input-and-output-data}

ClickHouse поддерживает большинство известных текстовых и бинарных форматов данных. Это позволяет легко интегрироваться в практически любой рабочий конвейер данных, чтобы воспользоваться преимуществами ClickHouse.

## Форматы ввода {#input-formats}

Форматы ввода используются для:
- Парсинга данных, предоставляемых в операциях `INSERT`
- Выполнения запросов `SELECT` из таблиц, основанных на файлах, таких как `File`, `URL` или `HDFS`
- Чтения словарей

Выбор правильного формата ввода имеет решающее значение для эффективного приёма данных в ClickHouse. С более чем 70 поддерживаемыми форматами выбор наиболее производительного варианта может значительно повлиять на скорость вставки, использование CPU и памяти, а также на общую эффективность системы. Чтобы помочь с этим выбором, мы провели бенчмаркинг производительности ввода по форматам, выявив ключевые выводы:

- **Формат [Native](formats/Native.md) является наиболее эффективным форматом ввода**, предлагая лучшее сжатие, минимальное 
  использование ресурсов и минимальные накладные расходы на обработку на стороне сервера.
- **Сжатие имеет решающее значение** - LZ4 уменьшает размер данных с минимальными затратами CPU, в то время как ZSTD предлагает более высокое сжатие за 
  счёт дополнительных затрат CPU.
- **Предварительная сортировка имеет умеренное влияние**, так как ClickHouse уже эффективно сортирует.
- **Пакетная загрузка значительно улучшает эффективность** - более крупные пакеты снижают накладные расходы на вставку и увеличивают пропускную способность.

Для глубокого анализа результатов и лучших практик 
читайте полный [анализ бенчмаркинга](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient).
Для ознакомления с полными результатами тестов исследуйте онлайн-дашборд [FastFormats](https://fastformats.clickhouse.com/).

## Форматы вывода {#output-formats}

Поддерживаемые форматы вывода используются для:
- Организации результатов запроса `SELECT`
- Выполнения операций `INSERT` в таблицы, основанные на файлах

## Обзор форматов {#formats-overview}

Поддерживаемые форматы:

| Формат                                                                                     | Ввод | Вывод |
|-------------------------------------------------------------------------------------------|-----|-------|
| [TabSeparated](#tabseparated)                                                             | ✔   | ✔     |
| [TabSeparatedRaw](#tabseparatedraw)                                                       | ✔   | ✔     |
| [TabSeparatedWithNames](#tabseparatedwithnames)                                           | ✔   | ✔     |
| [TabSeparatedWithNamesAndTypes](#tabseparatedwithnamesandtypes)                           | ✔   | ✔     |
| [TabSeparatedRawWithNames](#tabseparatedrawwithnames)                                     | ✔   | ✔     |
| [TabSeparatedRawWithNamesAndTypes](#tabseparatedrawwithnamesandtypes)                     | ✔   | ✔     |
| [Template](#format-template)                                                              | ✔   | ✔     |
| [TemplateIgnoreSpaces](#templateignorespaces)                                             | ✔   | ✗     |
| [CSV](#csv)                                                                               | ✔   | ✔     |
| [CSVWithNames](#csvwithnames)                                                             | ✔   | ✔     |
| [CSVWithNamesAndTypes](#csvwithnamesandtypes)                                             | ✔   | ✔     |
| [CustomSeparated](#format-customseparated)                                                | ✔   | ✔     |
| [CustomSeparatedWithNames](#customseparatedwithnames)                                     | ✔   | ✔     |
| [CustomSeparatedWithNamesAndTypes](#customseparatedwithnamesandtypes)                     | ✔   | ✔     |
| [SQLInsert](#sqlinsert)                                                                   | ✗   | ✔     |
| [Values](#data-format-values)                                                             | ✔   | ✔     |
| [Vertical](#vertical)                                                                     | ✗   | ✔     |
| [JSON](#json)                                                                             | ✔   | ✔     |
| [JSONAsString](#jsonasstring)                                                             | ✔   | ✗     |
| [JSONAsObject](#jsonasobject)                                                             | ✔   | ✗     |
| [JSONStrings](#jsonstrings)                                                               | ✔   | ✔     |
| [JSONColumns](#jsoncolumns)                                                               | ✔   | ✔     |
| [JSONColumnsWithMetadata](#jsoncolumnsmonoblock)                                          | ✔   | ✔     |
| [JSONCompact](#jsoncompact)                                                               | ✔   | ✔     |
| [JSONCompactStrings](#jsoncompactstrings)                                                 | ✗   | ✔     |
| [JSONCompactColumns](#jsoncompactcolumns)                                                 | ✔   | ✔     |
| [JSONEachRow](#jsoneachrow)                                                               | ✔   | ✔     |
| [PrettyJSONEachRow](#prettyjsoneachrow)                                                   | ✗   | ✔     |
| [JSONEachRowWithProgress](#jsoneachrowwithprogress)                                       | ✗   | ✔     |
| [JSONStringsEachRow](#jsonstringseachrow)                                                 | ✔   | ✔     |
| [JSONStringsEachRowWithProgress](#jsonstringseachrowwithprogress)                         | ✗   | ✔     |
| [JSONCompactEachRow](#jsoncompacteachrow)                                                 | ✔   | ✔     |
| [JSONCompactEachRowWithNames](#jsoncompacteachrowwithnames)                               | ✔   | ✔     |
| [JSONCompactEachRowWithNamesAndTypes](#jsoncompacteachrowwithnamesandtypes)               | ✔   | ✔     |
| [JSONCompactEachRowWithProgress](#jsoncompacteachrow)                                     | ✗    | ✔     |
| [JSONCompactStringsEachRow](#jsoncompactstringseachrow)                                   | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNames](#jsoncompactstringseachrowwithnames)                 | ✔   | ✔     |
| [JSONCompactStringsEachRowWithNamesAndTypes](#jsoncompactstringseachrowwithnamesandtypes) | ✔   | ✔     |
| [JSONCompactStringsEachRowWithProgress](#jsoncompactstringseachrowwithnamesandtypes)      | ✗   | ✔     |
| [JSONObjectEachRow](#jsonobjecteachrow)                                                   | ✔   | ✔     |
| [BSONEachRow](#bsoneachrow)                                                               | ✔   | ✔     |
| [TSKV](#tskv)                                                                             | ✔   | ✔     |
| [Pretty](#pretty)                                                                         | ✗   | ✔     |
| [PrettyNoEscapes](#prettynoescapes)                                                       | ✗   | ✔     |
| [PrettyMonoBlock](#prettymonoblock)                                                       | ✗   | ✔     |
| [PrettyNoEscapesMonoBlock](#prettynoescapesmonoblock)                                     | ✗   | ✔     |
| [PrettyCompact](#prettycompact)                                                           | ✗   | ✔     |
| [PrettyCompactNoEscapes](#prettycompactnoescapes)                                         | ✗   | ✔     |
| [PrettyCompactMonoBlock](#prettycompactmonoblock)                                         | ✗   | ✔     |
| [PrettyCompactNoEscapesMonoBlock](#prettycompactnoescapesmonoblock)                       | ✗   | ✔     |
| [PrettySpace](#prettyspace)                                                               | ✗   | ✔     |
| [PrettySpaceNoEscapes](#prettyspacenoescapes)                                             | ✗   | ✔     |
| [PrettySpaceMonoBlock](#prettyspacemonoblock)                                             | ✗   | ✔     |
| [PrettySpaceNoEscapesMonoBlock](#prettyspacenoescapesmonoblock)                           | ✗   | ✔     |
| [Prometheus](#prometheus)                                                                 | ✗   | ✔     |
| [Protobuf](#protobuf)                                                                     | ✔   | ✔     |
| [ProtobufSingle](#protobufsingle)                                                         | ✔   | ✔     |
| [ProtobufList](#protobuflist)                                                              | ✔   | ✔     |
| [Avro](#data-format-avro)                                                                 | ✔   | ✔     |
| [AvroConfluent](#data-format-avro-confluent)                                              | ✔   | ✗     |
| [Parquet](#data-format-parquet)                                                           | ✔   | ✔     |
| [ParquetMetadata](#data-format-parquet-metadata)                                          | ✔   | ✗     |
| [Arrow](#data-format-arrow)                                                               | ✔   | ✔     |
| [ArrowStream](#data-format-arrow-stream)                                                  | ✔   | ✔     |
| [ORC](#data-format-orc)                                                                   | ✔   | ✔     |
| [One](#data-format-one)                                                                   | ✔   | ✗     |
| [Npy](#data-format-npy)                                                                   | ✔   | ✔     |
| [RowBinary](#rowbinary)                                                                   | ✔   | ✔     |
| [RowBinaryWithNames](#rowbinarywithnamesandtypes)                                         | ✔   | ✔     |
| [RowBinaryWithNamesAndTypes](#rowbinarywithnamesandtypes)                                 | ✔   | ✔     |
| [RowBinaryWithDefaults](#rowbinarywithdefaults)                                           | ✔   | ✗     |
| [Native](#native)                                                                         | ✔   | ✔     |
| [Null](#null)                                                                             | ✗   | ✔     |
| [XML](#xml)                                                                               | ✗   | ✔     |
| [CapnProto](#capnproto)                                                                   | ✔   | ✔     |
| [LineAsString](#lineasstring)                                                             | ✔   | ✔     |
| [Regexp](#data-format-regexp)                                                             | ✔   | ✗     |
| [RawBLOB](#rawblob)                                                                       | ✔   | ✔     |
| [MsgPack](#msgpack)                                                                       | ✔   | ✔     |
| [MySQLDump](#mysqldump)                                                                   | ✔   | ✗     |
| [DWARF](#dwarf)                                                                           | ✔   | ✗     |
| [Markdown](#markdown)                                                                     | ✗   | ✔     |
| [Form](#form)                                                                             | ✔   | ✗     |


Вы можете контролировать некоторые параметры обработки формата с помощью настроек ClickHouse. Для получения дополнительной информации смотрите раздел [Настройки](/operations/settings/settings-formats.md).

### TabSeparated {#tabseparated}

Смотрите [TabSeparated](/interfaces/formats/TabSeparated)

### TabSeparatedRaw {#tabseparatedraw}

Смотрите [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw)

### TabSeparatedWithNames {#tabseparatedwithnames}

Смотрите [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)

### TabSeparatedWithNamesAndTypes {#tabseparatedwithnamesandtypes}

Смотрите [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)

### TabSeparatedRawWithNames {#tabseparatedrawwithnames}

Смотрите [TabSeparatedRawWithNames](/interfaces/formats/TabSeparatedRawWithNames)

### TabSeparatedRawWithNamesAndTypes {#tabseparatedrawwithnamesandtypes}

Смотрите [TabSeparatedRawWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)

### Template {#format-template}

Смотрите [Template](/interfaces/formats/Template)

### TemplateIgnoreSpaces {#templateignorespaces}

Смотрите [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces)

### TSKV {#tskv}

Смотрите [TSKV](/interfaces/formats/TSKV)

### CSV {#csv}

Смотрите [CSV](../interfaces/formats/CSV)

### CSVWithNames {#csvwithnames}

Смотрите [CSVWithNames](/interfaces/formats/CSVWithNames)

### CSVWithNamesAndTypes {#csvwithnamesandtypes}

Смотрите [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)

### CustomSeparated {#format-customseparated}

Смотрите [CustomSeparated](/interfaces/formats/CustomSeparated)

### CustomSeparatedWithNames {#customseparatedwithnames}

Смотрите [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)

### CustomSeparatedWithNamesAndTypes {#customseparatedwithnamesandtypes}

Смотрите [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

### SQLInsert {#sqlinsert}

Смотрите [SQLInsert](/interfaces/formats/SQLInsert)

### JSON {#json}

Смотрите [JSON](/interfaces/formats/JSON)

### JSONStrings {#jsonstrings}

Смотрите [JSONStrings](/interfaces/formats/JSONStrings)

### JSONColumns {#jsoncolumns}

Смотрите [JSONColumns](/interfaces/formats/JSONColumns)

### JSONColumnsWithMetadata {#jsoncolumnsmonoblock}

Смотрите [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)

### JSONAsString {#jsonasstring}

Смотрите [JSONAsString](/interfaces/formats/JSONAsString)

### JSONAsObject {#jsonasobject}

Смотрите [JSONAsObject](/interfaces/formats/JSONAsObject)

### JSONCompact {#jsoncompact}

Смотрите [JSONCompact](/interfaces/formats/JSONCompact)

### JSONCompactStrings {#jsoncompactstrings}

Смотрите [JSONCompactStrings](/interfaces/formats/JSONCompactStrings)

### JSONCompactColumns {#jsoncompactcolumns}

Смотрите [JSONCompactColumns](/interfaces/formats/JSONCompactColumns)

### JSONEachRow {#jsoneachrow}

Смотрите [JSONEachRow](/interfaces/formats/JSONEachRow)

### PrettyJSONEachRow {#prettyjsoneachrow}

Смотрите [PrettyJSONEachRow](/interfaces/formats/PrettyJSONEachRow)

### JSONStringsEachRow {#jsonstringseachrow}

Смотрите [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow)

### JSONCompactEachRow {#jsoncompacteachrow}

Смотрите [JSONCompactEachRow](/interfaces/formats/JSONCompactEachRow)

### JSONCompactStringsEachRow {#jsoncompactstringseachrow}

Смотрите [JSONCompactStringsEachRow](/interfaces/formats/JSONCompactStringsEachRow)

### JSONEachRowWithProgress {#jsoneachrowwithprogress}

Смотрите [JSONEachRowWithProgress](/interfaces/formats/JSONEachRowWithProgress)

### JSONStringsEachRowWithProgress {#jsonstringseachrowwithprogress}

Смотрите [JSONStringsEachRowWithProgress](/interfaces/formats/JSONStringsEachRowWithProgress)

### JSONCompactEachRowWithNames {#jsoncompacteachrowwithnames}

Смотрите [JSONCompactEachRowWithNames](/interfaces/formats/JSONCompactEachRowWithNames)

### JSONCompactEachRowWithNamesAndTypes {#jsoncompacteachrowwithnamesandtypes}

Смотрите [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)

### JSONCompactEachRowWithProgress {#jsoncompacteachrowwithprogress}

Аналогично `JSONEachRowWithProgress`, но выводит события `row` в компактном формате, как в формате `JSONCompactEachRow`.

### JSONCompactStringsEachRowWithNames {#jsoncompactstringseachrowwithnames}

Смотрите [JSONCompactStringsEachRowWithNames](/interfaces/formats/JSONCompactStringsEachRowWithNames)

### JSONCompactStringsEachRowWithNamesAndTypes {#jsoncompactstringseachrowwithnamesandtypes}

Смотрите [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)

### JSONObjectEachRow {#jsonobjecteachrow}

Смотрите [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow)

### Настройки JSON форматов {#json-formats-settings}

Смотрите [Настройки JSON форматов](/operations/settings/formats)

### BSONEachRow {#bsoneachrow}

Смотрите [BSONEachRow](/interfaces/formats/BSONEachRow)

### Native {#native}

Смотрите [Native](/interfaces/formats/Native)

### Null {#null}

Смотрите [Null](/interfaces/formats/Null)

### Pretty {#pretty}

Смотрите [Pretty](/interfaces/formats/Pretty)

### PrettyNoEscapes {#prettynoescapes}

Смотрите [PrettyNoEscapes](/interfaces/formats/PrettyNoEscapes)

### PrettyMonoBlock {#prettymonoblock}

Смотрите [PrettyMonoBlock](/interfaces/formats/PrettyMonoBlock)

### PrettyNoEscapesMonoBlock {#prettynoescapesmonoblock}

Смотрите [PrettyNoEscapesMonoBlock](/interfaces/formats/PrettyNoEscapesMonoBlock)

### PrettyCompact {#prettycompact}

Смотрите [PrettyCompact](/interfaces/formats/PrettyCompact)

### PrettyCompactNoEscapes {#prettycompactnoescapes}

Смотрите [PrettyCompactNoEscapes](/interfaces/formats/PrettyCompactNoEscapes)

### PrettyCompactMonoBlock {#prettycompactmonoblock}

Смотрите [PrettyCompactMonoBlock](/interfaces/formats/PrettyCompactMonoBlock)

### PrettyCompactNoEscapesMonoBlock {#prettycompactnoescapesmonoblock}

Смотрите [PrettyCompactNoEscapesMonoBlock](/interfaces/formats/PrettyCompactNoEscapesmonoBlock)

### PrettySpace {#prettyspace}

Смотрите [PrettySpace](/interfaces/formats/PrettySpace)

### PrettySpaceNoEscapes {#prettyspacenoescapes}

Смотрите [PrettySpaceNoEscapes](/interfaces/formats/PrettySpaceNoEscapes)

### PrettySpaceMonoBlock {#prettyspacemonoblock}

Смотрите [PrettySpaceMonoBlock](/interfaces/formats/PrettySpaceMonoBlock)

### PrettySpaceNoEscapesMonoBlock {#prettyspacenoescapesmonoblock}

Смотрите [PrettySpaceNoEscapesMonoBlock](/interfaces/formats/PrettySpaceNoEscapesMonoBlock)

### RowBinary {#rowbinary}

Смотрите [RowBinary](/interfaces/formats/RowBinary)

### RowBinaryWithNames {#rowbinarywithnames}

Смотрите [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)

### RowBinaryWithNamesAndTypes {#rowbinarywithnamesandtypes}

Смотрите [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)

### RowBinaryWithDefaults {#rowbinarywithdefaults}

Смотрите [RowBinaryWithDefaults](/interfaces/formats/RowBinaryWithDefaults)

### Values {#data-format-values}

Смотрите [Values](/interfaces/formats/Values)

### Vertical {#vertical}

Смотрите [Vertical](/interfaces/formats/Vertical)

### XML {#xml}

Смотрите [XML](/interfaces/formats/XML)

### CapnProto {#capnproto}

Смотрите [CapnProto](/interfaces/formats/CapnProto)

### Prometheus {#prometheus}

Смотрите [Prometheus](/interfaces/formats/Prometheus)

### Protobuf {#protobuf}

Смотрите [Protobuf](/interfaces/formats/Protobuf)

### ProtobufSingle {#protobufsingle}

Смотрите [ProtobufSingle](/interfaces/formats/ProtobufSingle)

### ProtobufList {#protobuflist}

Смотрите [ProtobufList](/interfaces/formats/ProtobufList)

### Avro {#data-format-avro}

Смотрите [Avro](/interfaces/formats/Avro)

### AvroConfluent {#data-format-avro-confluent}

Смотрите [AvroConfluent](/interfaces/formats/AvroConfluent)

### Parquet {#data-format-parquet}

Смотрите [Parquet](/interfaces/formats/Parquet)

### ParquetMetadata {#data-format-parquet-metadata}

Смотрите [ParquetMetadata](/interfaces/formats/ParquetMetadata)

### Arrow {#data-format-arrow}

Смотрите [Arrow](/interfaces/formats/ArrowStream)

### ArrowStream {#data-format-arrow-stream}

Смотрите [ArrowStream](/interfaces/formats/ArrowStream)

### ORC {#data-format-orc}

Смотрите [ORC](/interfaces/formats/ORC)

### One {#data-format-one}

Смотрите [One](/interfaces/formats/One)

### Npy {#data-format-npy}

Смотрите [Npy](/interfaces/formats/Npy)

### LineAsString {#lineasstring}

Смотрите:
- [LineAsString](/interfaces/formats/LineAsString)
- [LineAsStringWithNames](/interfaces/formats/LineAsStringWithNames)
- [LineAsStringWithNamesAndTypes](/interfaces/formats/LineAsStringWithNamesAndTypes)

### Regexp {#data-format-regexp}

Смотрите [Regexp](/interfaces/formats/Regexp)

### RawBLOB {#rawblob}

Смотрите [RawBLOB](/interfaces/formats/RawBLOB)

### Markdown {#markdown}

Смотрите [Markdown](/interfaces/formats/Markdown)

### MsgPack {#msgpack}

Смотрите [MsgPack](/interfaces/formats/MsgPack)

### MySQLDump {#mysqldump}

Смотрите [MySQLDump](/interfaces/formats/MySQLDump)

### DWARF {#dwarf}

Смотрите [Dwarf](/interfaces/formats/DWARF)

### Form {#form}

Смотрите [Form](/interfaces/formats/Form)

## Схема формата {#formatschema}

Имя файла, содержащего схему формата, задаётся с помощью настройки `format_schema`.
Необходимо установить эту настройку при использовании одного из форматов `Cap'n Proto` и `Protobuf`.
Схема формата — это комбинация имени файла и названия типа сообщения в этом файле, разделённых двоеточием,
например, `schemafile.proto:MessageType`.
Если файл имеет стандартное расширение для формата (например, `.proto` для `Protobuf`),
его можно опустить, и в этом случае схема формата выглядит как `schemafile:MessageType`.

Если вы вводите или выводите данные через [клиент](/interfaces/cli.md) в интерактивном режиме, то имя файла, указанное в схеме формата,
может содержать абсолютный путь или путь относительно текущего каталога на клиенте.
Если вы используете клиент в [пакетном режиме](/interfaces/cli.md/#batch-mode), путь к схеме должен быть относительным по соображениям безопасности.

Если вы вводите или выводите данные через [HTTP интерфейс](/interfaces/http.md), имя файла, указанное в схеме формата,
должно находиться в каталоге, указанном в [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)
в конфигурации сервера.

## Пропуск ошибок {#skippingerrors}

Некоторые форматы, такие как `CSV`, `TabSeparated`, `TSKV`, `JSONEachRow`, `Template`, `CustomSeparated` и `Protobuf`, могут пропускать повреждённые строки, если произошла ошибка парсинга и продолжать парсинг с начала следующей строки. Смотрите настройки [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) и
[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio).
Ограничения:
- В случае ошибки парсинга `JSONEachRow` пропускает все данные до новой строки (или EOF), поэтому строки должны быть разделены `\n`, чтобы правильно подсчитать ошибки.
- `Template` и `CustomSeparated` используют разделитель после последнего столбца и разделитель между строками для определения начала следующей строки, поэтому пропуск ошибок работает только в том случае, если хотя бы один из них не пуст.
