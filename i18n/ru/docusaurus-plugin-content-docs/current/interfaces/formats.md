---
description: 'Обзор поддерживаемых форматов входных и выходных данных в ClickHouse'
sidebar_label: 'Просмотреть все форматы...'
sidebar_position: 21
slug: /interfaces/formats
title: 'Форматы входных и выходных данных'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Форматы входных и выходных данных {#formats-for-input-and-output-data}

ClickHouse поддерживает большинство известных текстовых и бинарных форматов данных. Это обеспечивает простую интеграцию практически в любой существующий конвейер данных и позволяет в полной мере использовать преимущества ClickHouse.

## Форматы ввода {#input-formats}

Форматы ввода используются для:
- Разбора данных, передаваемых в операторы `INSERT`
- Выполнения запросов `SELECT` к табличным данным с файловым хранилищем, таким как `File`, `URL` или `HDFS`
- Чтения словарей

Выбор подходящего формата ввода критически важен для эффективной ингестии данных в ClickHouse. При наличии более чем 70 поддерживаемых форматов выбор наиболее производительного варианта может существенно повлиять на скорость вставки, использование CPU и памяти, а также общую эффективность системы. Чтобы упростить выбор, мы провели бенчмарк производительности ингестии для различных форматов, что позволило выявить ключевые выводы:

- **Формат [Native](formats/Native.md) является наиболее эффективным форматом ввода**, обеспечивая наилучшее сжатие, минимальное использование ресурсов и минимальные накладные расходы на обработку на стороне сервера.
- **Сжатие имеет ключевое значение** — LZ4 уменьшает размер данных при минимальных затратах CPU, тогда как ZSTD обеспечивает более высокий уровень сжатия за счёт дополнительной нагрузки на CPU.
- **Предварительная сортировка оказывает умеренное влияние**, так как ClickHouse уже эффективно выполняет сортировку.
- **Объединение данных в батчи (batching) значительно повышает эффективность** — крупные батчи уменьшают накладные расходы на вставку и повышают пропускную способность.

Для детального разбора результатов и рекомендаций по лучшим практикам ознакомьтесь с полной [аналитикой бенчмарка](https://www.clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient).
Все результаты тестов доступны в онлайн-дашборде [FastFormats](https://fastformats.clickhouse.com/).

## Форматы вывода {#output-formats}

Поддерживаемые форматы вывода используются для:

- Представления результатов запроса `SELECT`
- Выполнения операций `INSERT` в таблицы с файловой поддержкой

## Обзор форматов {#formats-overview}

Поддерживаемые форматы:

| Формат                                                                                                     | Ввод | Вывод |
| ---------------------------------------------------------------------------------------------------------- | ---- | ----- |
| [TabSeparated](./formats/TabSeparated/TabSeparated.md)                                                     | ✔    | ✔     |
| [TabSeparatedRaw](./formats/TabSeparated/TabSeparatedRaw.md)                                               | ✔    | ✔     |
| [TabSeparatedWithNames](./formats/TabSeparated/TabSeparatedWithNames.md)                                   | ✔    | ✔     |
| [TabSeparatedWithNamesAndTypes](./formats/TabSeparated/TabSeparatedWithNamesAndTypes.md)                   | ✔    | ✔     |
| [TabSeparatedRawWithNames](./formats/TabSeparated/TabSeparatedRawWithNames.md)                             | ✔    | ✔     |
| [TabSeparatedRawWithNamesAndTypes](./formats/TabSeparated/TabSeparatedRawWithNamesAndTypes.md)             | ✔    | ✔     |
| [Template](./formats/Template/Template.md)                                                                 | ✔    | ✔     |
| [TemplateIgnoreSpaces](./formats/Template/TemplateIgnoreSpaces.md)                                         | ✔    | ✗     |
| [CSV](./formats/CSV/CSV.md)                                                                                | ✔    | ✔     |
| [CSVWithNames](./formats/CSV/CSVWithNames.md)                                                              | ✔    | ✔     |
| [CSVWithNamesAndTypes](./formats/CSV/CSVWithNamesAndTypes.md)                                              | ✔    | ✔     |
| [CustomSeparated](./formats/CustomSeparated/CustomSeparated.md)                                            | ✔    | ✔     |
| [CustomSeparatedWithNames](./formats/CustomSeparated/CustomSeparatedWithNames.md)                          | ✔    | ✔     |
| [CustomSeparatedWithNamesAndTypes](./formats/CustomSeparated/CustomSeparatedWithNamesAndTypes.md)          | ✔    | ✔     |
| [SQLInsert](./formats/SQLInsert.md)                                                                        | ✗    | ✔     |
| [Значения](./formats/Values.md)                                                                            | ✔    | ✔     |
| [Vertical](./formats/Vertical.md)                                                                          | ✗    | ✔     |
| [JSON](./formats/JSON/JSON.md)                                                                             | ✔    | ✔     |
| [JSONAsString](./formats/JSON/JSONAsString.md)                                                             | ✔    | ✗     |
| [JSONAsObject](./formats/JSON/JSONAsObject.md)                                                             | ✔    | ✗     |
| [JSONStrings](./formats/JSON/JSONStrings.md)                                                               | ✔    | ✔     |
| [JSONColumns](./formats/JSON/JSONColumns.md)                                                               | ✔    | ✔     |
| [JSONColumnsWithMetadata](./formats/JSON/JSONColumnsWithMetadata.md)                                       | ✔    | ✔     |
| [JSONCompact](./formats/JSON/JSONCompact.md)                                                               | ✔    | ✔     |
| [JSONCompactStrings](./formats/JSON/JSONCompactStrings.md)                                                 | ✗    | ✔     |
| [JSONCompactColumns](./formats/JSON/JSONCompactColumns.md)                                                 | ✔    | ✔     |
| [JSONEachRow](./formats/JSON/JSONEachRow.md)                                                               | ✔    | ✔     |
| [PrettyJSONEachRow](./formats/JSON/PrettyJSONEachRow.md)                                                   | ✗    | ✔     |
| [JSONEachRowWithProgress](./formats/JSON/JSONEachRowWithProgress.md)                                       | ✗    | ✔     |
| [JSONStringsEachRow](./formats/JSON/JSONStringsEachRow.md)                                                 | ✔    | ✔     |
| [JSONStringsEachRowWithProgress](./formats/JSON/JSONStringsEachRowWithProgress.md)                         | ✗    | ✔     |
| [JSONCompactEachRow](./formats/JSON/JSONCompactEachRow.md)                                                 | ✔    | ✔     |
| [JSONCompactEachRowWithNames](./formats/JSON/JSONCompactEachRowWithNames.md)                               | ✔    | ✔     |
| [JSONCompactEachRowWithNamesAndTypes](./formats/JSON/JSONCompactEachRowWithNamesAndTypes.md)               | ✔    | ✔     |
| [JSONCompactEachRowWithProgress](./formats/JSON/JSONCompactEachRowWithProgress.md)                         | ✗    | ✔     |
| [JSONCompactStringsEachRow](./formats/JSON/JSONCompactStringsEachRow.md)                                   | ✔    | ✔     |
| [JSONCompactStringsEachRowWithNames](./formats/JSON/JSONCompactStringsEachRowWithNames.md)                 | ✔    | ✔     |
| [JSONCompactStringsEachRowWithNamesAndTypes](./formats/JSON/JSONCompactStringsEachRowWithNamesAndTypes.md) | ✔    | ✔     |
| [JSONCompactStringsEachRowWithProgress](./formats/JSON/JSONCompactStringsEachRowWithProgress.md)           | ✗    | ✔     |
| [JSONObjectEachRow](./formats/JSON/JSONObjectEachRow.md)                                                   | ✔    | ✔     |
| [BSONEachRow](./formats/BSONEachRow.md)                                                                    | ✔    | ✔     |
| [TSKV](./formats/TabSeparated/TSKV.md)                                                                     | ✔    | ✔     |
| [Pretty](./formats/Pretty/Pretty.md)                                                                       | ✗    | ✔     |
| [PrettyNoEscapes](./formats/Pretty/PrettyNoEscapes.md)                                                     | ✗    | ✔     |
| [PrettyMonoBlock](./formats/Pretty/PrettyMonoBlock.md)                                                     | ✗    | ✔     |
| [PrettyNoEscapesMonoBlock](./formats/Pretty/PrettyNoEscapesMonoBlock.md)                                   | ✗    | ✔     |
| [PrettyCompact](./formats/Pretty/PrettyCompact.md)                                                         | ✗    | ✔     |
| [PrettyCompactNoEscapes](./formats/Pretty/PrettyCompactNoEscapes.md)                                       | ✗    | ✔     |
| [PrettyCompactMonoBlock](./formats/Pretty/PrettyCompactMonoBlock.md)                                       | ✗    | ✔     |
| [PrettyCompactNoEscapesMonoBlock](./formats/Pretty/PrettyCompactNoEscapesMonoBlock.md)                     | ✗    | ✔     |
| [PrettySpace](./formats/Pretty/PrettySpace.md)                                                             | ✗    | ✔     |
| [PrettySpaceNoEscapes](./formats/Pretty/PrettySpaceNoEscapes.md)                                           | ✗    | ✔     |
| [PrettySpaceMonoBlock](./formats/Pretty/PrettySpaceMonoBlock.md)                                           | ✗    | ✔     |
| [PrettySpaceNoEscapesMonoBlock](./formats/Pretty/PrettySpaceNoEscapesMonoBlock.md)                         | ✗    | ✔     |
| [Prometheus](./formats/Prometheus.md)                                                                      | ✗    | ✔     |
| [Protobuf](./formats/Protobuf/Protobuf.md)                                                                 | ✔    | ✔     |
| [ProtobufSingle](./formats/Protobuf/ProtobufSingle.md)                                                     | ✔    | ✔     |
| [ProtobufList](./formats/Protobuf/ProtobufList.md)                                                         | ✔    | ✔     |
| [Avro](./formats/Avro/Avro.md)                                                                             | ✔    | ✔     |
| [AvroConfluent](./formats/Avro/AvroConfluent.md)                                                           | ✔    | ✗     |
| [Parquet](./formats/Parquet/Parquet.md)                                                                    | ✔    | ✔     |
| [ParquetMetadata](./formats/Parquet/ParquetMetadata.md)                                                    | ✔    | ✗     |
| [Arrow](./formats/Arrow/Arrow.md)                                                                          | ✔    | ✔     |
| [ArrowStream](./formats/Arrow/ArrowStream.md)                                                              | ✔    | ✔     |
| [ORC](./formats/ORC.md)                                                                                    | ✔    | ✔     |
| [One](./formats/One.md)                                                                                    | ✔    | ✗     |
| [Npy](./formats/Npy.md)                                                                                    | ✔    | ✔     |
| [RowBinary](./formats/RowBinary/RowBinary.md)                                                              | ✔    | ✔     |
| [RowBinaryWithNames](./formats/RowBinary/RowBinaryWithNames.md)                                            | ✔    | ✔     |
| [RowBinaryWithNamesAndTypes](./formats/RowBinary/RowBinaryWithNamesAndTypes.md)                            | ✔    | ✔     |
| [RowBinaryWithDefaults](./formats/RowBinary/RowBinaryWithDefaults.md)                                      | ✔    | ✗     |
| [Native](./formats/Native.md)                                                                              | ✔    | ✔     |
| [Буферы](./formats/Buffers.md)                                                                             | ✔    | ✔     |
| [Null](./formats/Null.md)                                                                                  | ✗    | ✔     |
| [Hash](./formats/Hash.md)                                                                                  | ✗    | ✔     |
| [XML](./formats/XML.md)                                                                                    | ✗    | ✔     |
| [CapnProto](./formats/CapnProto.md)                                                                        | ✔    | ✔     |
| [LineAsString](./formats/LineAsString/LineAsString.md)                                                     | ✔    | ✔     |
| [LineAsStringWithNames](./formats/LineAsString/LineAsStringWithNames.md)                                   | ✔    | ✔     |
| [LineAsStringWithNamesAndTypes](./formats/LineAsString/LineAsStringWithNamesAndTypes.md)                   | ✔    | ✔     |
| [Регулярные выражения](./formats/Regexp.md)                                                                | ✔    | ✗     |
| [RawBLOB](./formats/RawBLOB.md)                                                                            | ✔    | ✔     |
| [MsgPack](./formats/MsgPack.md)                                                                            | ✔    | ✔     |
| [MySQLDump](./formats/MySQLDump.md)                                                                        | ✔    | ✗     |
| [DWARF](./formats/DWARF.md)                                                                                | ✔    | ✗     |
| [Markdown](./formats/Markdown.md)                                                                          | ✗    | ✔     |
| [Форма](./formats/Form.md)                                                                                 | ✔    | ✗     |

Вы можете управлять некоторыми параметрами обработки форматов с помощью настроек ClickHouse. Подробнее см. раздел [Настройки](/operations/settings/settings-formats.md).

## Схема формата {#formatschema}

Имя файла, содержащего схему формата, задаётся настройкой `format_schema`.
Эту настройку необходимо задать при использовании одного из форматов `Cap'n Proto` или `Protobuf`.
Схема формата — это комбинация имени файла и имени типа сообщения в этом файле, разделённых двоеточием,
например, `schemafile.proto:MessageType`.
Если файл имеет стандартное расширение для формата (например, `.proto` для `Protobuf`),
его можно опустить, и в этом случае схема формата будет выглядеть как `schemafile:MessageType`.

Если вы вводите или выводите данные через [клиент](/interfaces/cli.md) в интерактивном режиме, имя файла, указанное в схеме формата,
может содержать абсолютный путь или путь относительно текущего каталога на клиенте.
Если вы используете клиент в [пакетном режиме](/interfaces/cli.md/#batch-mode), путь к схеме должен быть относительным — по соображениям безопасности.

Если вы вводите или выводите данные через [HTTP-интерфейс](/interfaces/http.md), имя файла, указанное в схеме формата,
должно находиться в каталоге, указанном в [format_schema_path](/operations/server-configuration-parameters/settings.md/#format_schema_path)
в конфигурации сервера.

## Пропуск ошибок {#skippingerrors}

Некоторые форматы, такие как `CSV`, `TabSeparated`, `TSKV`, `JSONEachRow`, `Template`, `CustomSeparated` и `Protobuf`, могут пропускать некорректную строку при возникновении ошибки парсинга и продолжать разбор начиная со следующей строки. См. настройки [input_format_allow_errors_num](/operations/settings/settings-formats.md/#input_format_allow_errors_num) и
[input_format_allow_errors_ratio](/operations/settings/settings-formats.md/#input_format_allow_errors_ratio).
Ограничения:

- В случае ошибки парсинга `JSONEachRow` пропускает все данные до новой строки (или EOF), поэтому строки должны быть разделены символом `\n`, чтобы корректно подсчитывать ошибки.
- `Template` и `CustomSeparated` используют разделитель после последнего столбца и разделитель между строками, чтобы найти начало следующей строки, поэтому пропуск ошибок работает только в том случае, если хотя бы один из этих разделителей не пуст.