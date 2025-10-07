---
slug: '/interfaces/formats'
sidebar_label: 'Посмотреть все форматы...'
sidebar_position: 21
description: 'Обзор поддерживаемых форматов данных для ввода и вывода в ClickHouse'
title: 'Форматы для ввода и вывода данных'
doc_type: reference
---
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Форматы для входных и выходных данных {#formats-for-input-and-output-data}

ClickHouse поддерживает большинство известных текстовых и бинарных форматов данных. Это позволяет легко интегрироваться почти в любой рабочий конвейер данных для использования преимуществ ClickHouse.

## Форматы входных данных {#input-formats}

Форматы входных данных используются для:
- Парсинга данных, предоставленных в операторах `INSERT`
- Выполнения запросов `SELECT` из таблиц с файловой поддержкой, таких как `File`, `URL` или `HDFS`
- Чтения словарей

Выбор правильного формата входных данных критически важен для эффективного приема данных в ClickHouse. С более чем 70 поддерживаемыми форматами, выбор наиболее производительного варианта может значительно повлиять на скорость вставки, использование CPU и памяти, а также общую эффективность системы. Чтобы помочь с выбором, мы провели бенчмаркинг производительности загрузки данных по форматам, выявив ключевые моменты:

- **Формат [Native](formats/Native.md) является наиболее эффективным входным форматом**, предлагая лучшее сжатие, наименьшие затраты ресурсов и минимальные накладные расходы на обработку на стороне сервера.
- **Сжатие имеет решающее значение** - LZ4 уменьшает размер данных с минимальными затратами CPU, в то время как ZSTD предлагает более высокое сжатие за счет дополнительных затрат CPU.
- **Предварительная сортировка оказывает умеренное влияние**, так как ClickHouse уже сортирует данные эффективно.
- **Пакетная обработка значительно повышает эффективность** - большие пакеты уменьшают накладные расходы на вставку и улучшают пропускную способность.

Для глубокого понимания результатов и лучших практик, прочитайте полный [анализ бенчмаркинга](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient).
Для полного тестирования результатов исследуйте онлайн-дошборд [FastFormats](https://fastformats.clickhouse.com/).

## Форматы выходных данных {#output-formats}

Поддерживаемые форматы выходных данных используются для:
- Организации результатов запроса `SELECT`
- Выполнения операций `INSERT` в таблицы с файловой поддержкой

## Обзор форматов {#formats-overview}

Поддерживаемые форматы:

| Формат                                                                                       | Вход | Выход |
|----------------------------------------------------------------------------------------------|------|-------|
| [TabSeparated](#tabseparated)                                                                | ✔    | ✔     |
| [TabSeparatedRaw](#tabseparatedraw)                                                        | ✔    | ✔     |
| [TabSeparatedWithNames](#tabseparatedwithnames)                                            | ✔    | ✔     |
| [TabSeparatedWithNamesAndTypes](#tabseparatedwithnamesandtypes)                            | ✔    | ✔     |
| [TabSeparatedRawWithNames](#tabseparatedrawwithnames)                                      | ✔    | ✔     |
| [TabSeparatedRawWithNamesAndTypes](#tabseparatedrawwithnamesandtypes)                      | ✔    | ✔     |
| [Template](#format-template)                                                                 | ✔    | ✔     |
| [TemplateIgnoreSpaces](#templateignorespaces)                                               | ✔    | ✗     |
| [CSV](#csv)                                                                                  | ✔    | ✔     |
| [CSVWithNames](#csvwithnames)                                                                | ✔    | ✔     |
| [CSVWithNamesAndTypes](#csvwithnamesandtypes)                                              | ✔    | ✔     |
| [CustomSeparated](#format-customseparated)                                                  | ✔    | ✔     |
| [CustomSeparatedWithNames](#customseparatedwithnames)                                       | ✔    | ✔     |
| [CustomSeparatedWithNamesAndTypes](#customseparatedwithnamesandtypes)                      | ✔    | ✔     |
| [SQLInsert](#sqlinsert)                                                                     | ✗    | ✔     |
| [Values](#data-format-values)                                                                | ✔    | ✔     |
| [Vertical](#vertical)                                                                        | ✗    | ✔     |
| [JSON](#json)                                                                                | ✔    | ✔     |
| [JSONAsString](#jsonasstring)                                                                | ✔    | ✗     |
| [JSONAsObject](#jsonasobject)                                                                | ✔    | ✗     |
| [JSONStrings](#jsonstrings)                                                                  | ✔    | ✔     |
| [JSONColumns](#jsoncolumns)                                                                  | ✔    | ✔     |
| [JSONColumnsWithMetadata](#jsoncolumnsmonoblock)                                           | ✔    | ✔     |
| [JSONCompact](#jsoncompact)                                                                  | ✔    | ✔     |
| [JSONCompactStrings](#jsoncompactstrings)                                                    | ✗    | ✔     |
| [JSONCompactColumns](#jsoncompactcolumns)                                                    | ✔    | ✔     |
| [JSONEachRow](#jsoneachrow)                                                                  | ✔    | ✔     |
| [PrettyJSONEachRow](#prettyjsoneachrow)                                                    | ✗    | ✔     |
| [JSONEachRowWithProgress](#jsoneachrowwithprogress)                                        | ✗    | ✔     |
| [JSONStringsEachRow](#jsonstringseachrow)                                                  | ✔    | ✔     |
| [JSONStringsEachRowWithProgress](#jsonstringseachrowwithprogress)                          | ✗    | ✔     |
| [JSONCompactEachRow](#jsoncompacteachrow)                                                  | ✔    | ✔     |
| [JSONCompactEachRowWithNames](#jsoncompacteachrowwithnames)                                | ✔    | ✔     |
| [JSONCompactEachRowWithNamesAndTypes](#jsoncompacteachrowwithnamesandtypes)                | ✔    | ✔     |
| [JSONCompactEachRowWithProgress](#jsoncompacteachrow)                                      | ✗    | ✔     |
| [JSONCompactStringsEachRow](#jsoncompactstringseachrow)                                    | ✔    | ✔     |
| [JSONCompactStringsEachRowWithNames](#jsoncompactstringseachrowwithnames)                  | ✔    | ✔     |
| [JSONCompactStringsEachRowWithNamesAndTypes](#jsoncompactstringseachrowwithnamesandtypes) | ✔    | ✔     |
| [JSONCompactStringsEachRowWithProgress](#jsoncompactstringseachrowwithnamesandtypes)      | ✗    | ✔     |
| [JSONObjectEachRow](#jsonobjecteachrow)                                                    | ✔    | ✔     |
| [BSONEachRow](#bsoneachrow)                                                                  | ✔    | ✔     |
| [TSKV](#tskv)                                                                                | ✔    | ✔     |
| [Pretty](#pretty)                                                                            | ✗    | ✔     |
| [PrettyNoEscapes](#prettynoescapes)                                                        | ✗    | ✔     |
| [PrettyMonoBlock](#prettymonoblock)                                                        | ✗    | ✔     |
| [PrettyNoEscapesMonoBlock](#prettynoescapesmonoblock)                                      | ✗    | ✔     |
| [PrettyCompact](#prettycompact)                                                              | ✗    | ✔     |
| [PrettyCompactNoEscapes](#prettycompactnoescapes)                                          | ✗    | ✔     |
| [PrettyCompactMonoBlock](#prettycompactmonoblock)                                          | ✗    | ✔     |
| [PrettyCompactNoEscapesMonoBlock](#prettycompactnoescapesmonoblock)                      | ✗    | ✔     |
| [PrettySpace](#prettyspace)                                                                  | ✗    | ✔     |
| [PrettySpaceNoEscapes](#prettyspacenoescapes)                                             | ✗    | ✔     |
| [PrettySpaceMonoBlock](#prettyspacemonoblock)                                            | ✗    | ✔     |
| [PrettySpaceNoEscapesMonoBlock](#prettyspacenoescapesmonoblock)                          | ✗    | ✔     |
| [Prometheus](#prometheus)                                                                    | ✗    | ✔     |
| [Protobuf](#protobuf)                                                                        | ✔    | ✔     |
| [ProtobufSingle](#protobufsingle)                                                            | ✔    | ✔     |
| [ProtobufList](#protobuflist)                                                                | ✔    | ✔     |
| [Avro](#data-format-avro)                                                                    | ✔    | ✔     |
| [AvroConfluent](#data-format-avro-confluent)                                               | ✔    | ✗     |
| [Parquet](#data-format-parquet)                                                              | ✔    | ✔     |
| [ParquetMetadata](#data-format-parquet-metadata)                                           | ✔    | ✗     |
| [Arrow](#data-format-arrow)                                                                  | ✔    | ✔     |
| [ArrowStream](#data-format-arrow-stream)                                                    | ✔    | ✔     |
| [ORC](#data-format-orc)                                                                      | ✔    | ✔     |
| [One](#data-format-one)                                                                      | ✔    | ✗     |
| [Npy](#data-format-npy)                                                                      | ✔    | ✔     |
| [RowBinary](#rowbinary)                                                                      | ✔    | ✔     |
| [RowBinaryWithNames](#rowbinarywithnamesandtypes)                                           | ✔    | ✔     |
| [RowBinaryWithNamesAndTypes](#rowbinarywithnamesandtypes)                                   | ✔    | ✔     |
| [RowBinaryWithDefaults](#rowbinarywithdefaults)                                             | ✔    | ✗     |
| [Native](#native)                                                                            | ✔    | ✔     |
| [Null](#null)                                                                                | ✗    | ✔     |
| [Hash](#hash)                                                                                | ✗    | ✔     |
| [XML](#xml)                                                                                  | ✗    | ✔     |
| [CapnProto](#capnproto)                                                                      | ✔    | ✔     |
| [LineAsString](#lineasstring)                                                                | ✔    | ✔     |
| [Regexp](#data-format-regexp)                                                                | ✔    | ✗     |
| [RawBLOB](#rawblob)                                                                          | ✔    | ✔     |
| [MsgPack](#msgpack)                                                                          | ✔    | ✔     |
| [MySQLDump](#mysqldump)                                                                      | ✔    | ✗     |
| [DWARF](#dwarf)                                                                              | ✔    | ✗     |
| [Markdown](#markdown)                                                                        | ✗    | ✔     |
| [Form](#form)                                                                                | ✔    | ✗     |

Вы можете управлять некоторыми параметрами обработки форматов с помощью настроек ClickHouse. Для получения дополнительной информации прочитайте раздел [Настройки](/operations/settings/settings-formats.md).

### TabSeparated {#tabseparated}

См. [TabSeparated](/interfaces/formats/TabSeparated)

### TabSeparatedRaw {#tabseparatedraw}

См. [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw)

### TabSeparatedWithNames {#tabseparatedwithnames}

См. [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)

### TabSeparatedWithNamesAndTypes {#tabseparatedwithnamesandtypes}

См. [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)

### TabSeparatedRawWithNames {#tabseparatedrawwithnames}

См. [TabSeparatedRawWithNames](/interfaces/formats/TabSeparatedRawWithNames)

### TabSeparatedRawWithNamesAndTypes {#tabseparatedrawwithnamesandtypes}

См. [TabSeparatedRawWithNamesAndTypes](/interfaces/formats/TabSeparatedRawWithNamesAndTypes)

### Template {#format-template}

См. [Template](/interfaces/formats/Template)

### TemplateIgnoreSpaces {#templateignorespaces}

См. [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces)

### TSKV {#tskv}

См. [TSKV](/interfaces/formats/TSKV)

### CSV {#csv}

См. [CSV](../interfaces/formats/CSV)

### CSVWithNames {#csvwithnames}

См. [CSVWithNames](/interfaces/formats/CSVWithNames)

### CSVWithNamesAndTypes {#csvwithnamesandtypes}

См. [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)

### CustomSeparated {#format-customseparated}

См. [CustomSeparated](/interfaces/formats/CustomSeparated)

### CustomSeparatedWithNames {#customseparatedwithnames}

См. [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)

### CustomSeparatedWithNamesAndTypes {#customseparatedwithnamesandtypes}

См. [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

### SQLInsert {#sqlinsert}

См. [SQLInsert](/interfaces/formats/SQLInsert)

### JSON {#json}

См. [JSON](/interfaces/formats/JSON)

### JSONStrings {#jsonstrings}

См. [JSONStrings](/interfaces/formats/JSONStrings)

### JSONColumns {#jsoncolumns}

См. [JSONColumns](/interfaces/formats/JSONColumns)

### JSONColumnsWithMetadata {#jsoncolumnsmonoblock}

См. [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)

### JSONAsString {#jsonasstring}

См. [JSONAsString](/interfaces/formats/JSONAsString)

### JSONAsObject {#jsonasobject}

См. [JSONAsObject](/interfaces/formats/JSONAsObject)

### JSONCompact {#jsoncompact}

См. [JSONCompact](/interfaces/formats/JSONCompact)

### JSONCompactStrings {#jsoncompactstrings}

См. [JSONCompactStrings](/interfaces/formats/JSONCompactStrings)

### JSONCompactColumns {#jsoncompactcolumns}

См. [JSONCompactColumns](/interfaces/formats/JSONCompactColumns)

### JSONEachRow {#jsoneachrow}

См. [JSONEachRow](/interfaces/formats/JSONEachRow)

### PrettyJSONEachRow {#prettyjsoneachrow}

См. [PrettyJSONEachRow](/interfaces/formats/PrettyJSONEachRow)

### JSONStringsEachRow {#jsonstringseachrow}

См. [JSONStringsEachRow](/interfaces/formats/JSONStringsEachRow)

### JSONCompactEachRow {#jsoncompacteachrow}

См. [JSONCompactEachRow](/interfaces/formats/JSONCompactEachRow)

### JSONCompactStringsEachRow {#jsoncompactstringseachrow}

См. [JSONCompactStringsEachRow](/interfaces/formats/JSONCompactStringsEachRow)

### JSONEachRowWithProgress {#jsoneachrowwithprogress}

См. [JSONEachRowWithProgress](/interfaces/formats/JSONEachRowWithProgress)

### JSONStringsEachRowWithProgress {#jsonstringseachrowwithprogress}

См. [JSONStringsEachRowWithProgress](/interfaces/formats/JSONStringsEachRowWithProgress)

### JSONCompactEachRowWithNames {#jsoncompacteachrowwithnames}

См. [JSONCompactEachRowWithNames](/interfaces/formats/JSONCompactEachRowWithNames)

### JSONCompactEachRowWithNamesAndTypes {#jsoncompacteachrowwithnamesandtypes}

См. [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)

### JSONCompactEachRowWithProgress {#jsoncompacteachrowwithprogress}

Похож на `JSONEachRowWithProgress`, но выводит события `row` в компактной форме, как в формате `JSONCompactEachRow`.

### JSONCompactStringsEachRowWithNames {#jsoncompactstringseachrowwithnames}

См. [JSONCompactStringsEachRowWithNames](/interfaces/formats/JSONCompactStringsEachRowWithNames)

### JSONCompactStringsEachRowWithNamesAndTypes {#jsoncompactstringseachrowwithnamesandtypes}

См. [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)

### JSONObjectEachRow {#jsonobjecteachrow}

См. [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow)

### Настройки формата JSON {#json-formats-settings}

См. [Настройки формата JSON](/operations/settings/formats)

### BSONEachRow {#bsoneachrow}

См. [BSONEachRow](/interfaces/formats/BSONEachRow)

### Native {#native}

См. [Native](/interfaces/formats/Native)

### Null {#null}

См. [Null](/interfaces/formats/Null)

### Hash {#hash}

См. [Hash](/interfaces/formats/Hash)

### Pretty {#pretty}

См. [Pretty](/interfaces/formats/Pretty)

### PrettyNoEscapes {#prettynoescapes}

См. [PrettyNoEscapes](/interfaces/formats/PrettyNoEscapes)

### PrettyMonoBlock {#prettymonoblock}

См. [PrettyMonoBlock](/interfaces/formats/PrettyMonoBlock)

### PrettyNoEscapesMonoBlock {#prettynoescapesmonoblock}

См. [PrettyNoEscapesMonoBlock](/interfaces/formats/PrettyNoEscapesMonoBlock)

### PrettyCompact {#prettycompact}

См. [PrettyCompact](/interfaces/formats/PrettyCompact)

### PrettyCompactNoEscapes {#prettycompactnoescapes}

См. [PrettyCompactNoEscapes](/interfaces/formats/PrettyCompactNoEscapes)

### PrettyCompactMonoBlock {#prettycompactmonoblock}

См. [PrettyCompactMonoBlock](/interfaces/formats/PrettyCompactMonoBlock)

### PrettyCompactNoEscapesMonoBlock {#prettycompactnoescapesmonoblock}

См. [PrettyCompactNoEscapesMonoBlock](/interfaces/formats/PrettyCompactNoEscapesMonoBlock)

### PrettySpace {#prettyspace}

См. [PrettySpace](/interfaces/formats/PrettySpace)

### PrettySpaceNoEscapes {#prettyspacenoescapes}

См. [PrettySpaceNoEscapes](/interfaces/formats/PrettySpaceNoEscapes)

### PrettySpaceMonoBlock {#prettyspacemonoblock}

См. [PrettySpaceMonoBlock](/interfaces/formats/PrettySpaceMonoBlock)

### PrettySpaceNoEscapesMonoBlock {#prettyspacenoescapesmonoblock}

См. [PrettySpaceNoEscapesMonoBlock](/interfaces/formats/PrettySpaceNoEscapesMonoBlock)

### RowBinary {#rowbinary}

См. [RowBinary](/interfaces/formats/RowBinary)

### RowBinaryWithNames {#rowbinarywithnames}

См. [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)

### RowBinaryWithNamesAndTypes {#rowbinarywithnamesandtypes}

См. [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)

### RowBinaryWithDefaults {#rowbinarywithdefaults}

См. [RowBinaryWithDefaults](/interfaces/formats/RowBinaryWithDefaults)

### Values {#data-format-values}

См. [Values](/interfaces/formats/Values)

### Vertical {#vertical}

См. [Vertical](/interfaces/formats/Vertical)

### XML {#xml}

См. [XML](/interfaces/formats/XML)

### CapnProto {#capnproto}

См. [CapnProto](/interfaces/formats/CapnProto)

### Prometheus {#prometheus}

См. [Prometheus](/interfaces/formats/Prometheus)

### Protobuf {#protobuf}

См. [Protobuf](/interfaces/formats/Protobuf)

### ProtobufSingle {#protobufsingle}

См. [ProtobufSingle](/interfaces/formats/ProtobufSingle)

### ProtobufList {#protobuflist}

См. [ProtobufList](/interfaces/formats/ProtobufList)

### Avro {#data-format-avro}

См. [Avro](/interfaces/formats/Avro)

### AvroConfluent {#data-format-avro-confluent}

См. [AvroConfluent](/interfaces/formats/AvroConfluent)

### Parquet {#data-format-parquet}

См. [Parquet](/interfaces/formats/Parquet)

### ParquetMetadata {#data-format-parquet-metadata}

См. [ParquetMetadata](/interfaces/formats/ParquetMetadata)

### Arrow {#data-format-arrow}

См. [Arrow](/interfaces/formats/ArrowStream)

### ArrowStream {#data-format-arrow-stream}

См. [ArrowStream](/interfaces/formats/ArrowStream)

### ORC {#data-format-orc}

См. [ORC](/interfaces/formats/ORC)

### One {#data-format-one}

См. [One](/interfaces/formats/One)

### Npy {#data-format-npy}

См. [Npy](/interfaces/formats/Npy)

### LineAsString {#lineasstring}

См.:
- [LineAsString](/interfaces/formats/LineAsString)
- [LineAsStringWithNames](/interfaces/formats/LineAsStringWithNames)
- [LineAsStringWithNamesAndTypes](/interfaces/formats/LineAsStringWithNamesAndTypes)

### Regexp {#data-format-regexp}

См. [Regexp](/interfaces/formats/Regexp)

### RawBLOB {#rawblob}

См. [RawBLOB](/interfaces/formats/RawBLOB)

### Markdown {#markdown}

См. [Markdown](/interfaces/formats/Markdown)

### MsgPack {#msgpack}

См. [MsgPack](/interfaces/formats/MsgPack)

### MySQLDump {#mysqldump}

См. [MySQLDump](/interfaces/formats/MySQLDump)

### DWARF {#dwarf}

См. [Dwarf](/interfaces/formats/DWARF)

### Form {#form}

См. [Form](/interfaces/formats/Form)

## Схема формата {#formatschema}

Имя файла, содержащего схему формата, задается настройкой `format_schema`.
Эту настройку необходимо установить, когда используется один из форматов `Cap'n Proto` и `Protobuf`.
Схема формата - это комбинация имени файла и названия типа сообщения в этом файле, разделенная двоеточием, например, `schemafile.proto:MessageType`.
Если файл имеет стандартное расширение для формата (например, `.proto` для `Protobuf`),
оно может быть опущено, и в этом случае схема формата выглядит как `schemafile:MessageType`.

Если вы вводите или выводите данные через [клиент](/interfaces/cli.md) в интерактивном режиме, имя файла, указанное в схеме формата,
может содержать абсолютный путь или путь относительно текущего каталога на клиенте.
Если вы используете клиент в [пакетном режиме](/interfaces/cli.md/#batch-mode), путь к схеме должен быть относительным по соображениям безопасности.

Если вы вводите или выводите данные через [HTTP интерфейс](/interfaces/http.md), имя файла, указанное в схеме формата,
должно находиться в директории, указанной в [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)
в конфигурации сервера.

## Пропуск ошибок {#skippingerrors}

Некоторые форматы, такие как `CSV`, `TabSeparated`, `TSKV`, `JSONEachRow`, `Template`, `CustomSeparated` и `Protobuf`, могут пропустить поврежденную строку, если произошла ошибка разбора, и продолжить разбор с начала следующей строки. См. настройки [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) и
[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio).
Ограничения:
- В случае ошибки разбора `JSONEachRow` пропускает все данные до новой строки (или EOF), поэтому строки должны разделяться `\n`, чтобы правильно учитывать ошибки.
- `Template` и `CustomSeparated` используют разделитель после последнего столбца и разделитель между строками, чтобы найти начало следующей строки, поэтому пропуск ошибок работает только если хотя бы один из них не пуст.