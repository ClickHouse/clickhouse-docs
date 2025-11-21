---
title: 'Форматы данных'
sidebar_label: 'Форматы данных'
slug: /chdb/reference/data-formats
description: 'Форматы данных для chDB'
keywords: ['chdb', 'data formats']
doc_type: 'reference'
---

Когда речь заходит о форматах данных, chDB на 100% совместим по возможностям с ClickHouse.

Форматы ввода используются для разбора данных, передаваемых в `INSERT`, а также в `SELECT` из таблицы, использующей файловое хранилище (например, `File`, `URL` или `S3`).
Форматы вывода используются для формирования результатов `SELECT`, а также для выполнения `INSERT` в таблицу, использующую файловое хранилище.
Помимо форматов данных, которые поддерживает ClickHouse, chDB также поддерживает:

- `ArrowTable` как формат вывода, тип — Python `pyarrow.Table`
- `DataFrame` как формат ввода и вывода, тип — Python `pandas.DataFrame`. Примеры см. в [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- `Debug` как формат вывода (как псевдоним формата `CSV`), но с включённым подробным отладочным выводом из ClickHouse.

Поддерживаемые в ClickHouse форматы данных:

| Формат                                     | Входные данные | Результат |
| ------------------------------------------ | -------------- | --------- |
| TabSeparated                               | ✔              | ✔         |
| TabSeparatedRaw                            | ✔              | ✔         |
| TabSeparatedWithNames                      | ✔              | ✔         |
| TabSeparatedWithNamesAndTypes              | ✔              | ✔         |
| TabSeparatedRawWithNames                   | ✔              | ✔         |
| TabSeparatedRawWithNamesAndTypes           | ✔              | ✔         |
| Шаблон                                     | ✔              | ✔         |
| TemplateIgnoreSpaces                       | ✔              | ✗         |
| CSV                                        | ✔              | ✔         |
| CSVWithNames                               | ✔              | ✔         |
| CSVWithNamesAndTypes                       | ✔              | ✔         |
| CustomSeparated                            | ✔              | ✔         |
| CustomSeparatedWithNames                   | ✔              | ✔         |
| CustomSeparatedWithNamesAndTypes           | ✔              | ✔         |
| SQLInsert                                  | ✗              | ✔         |
| Значения                                   | ✔              | ✔         |
| Vertical                                   | ✗              | ✔         |
| JSON                                       | ✔              | ✔         |
| JSONAsString                               | ✔              | ✗         |
| JSONAsObject                               | ✔              | ✗         |
| JSONStrings                                | ✔              | ✔         |
| JSON-колонки                               | ✔              | ✔         |
| JSONColumnsWithMetadata                    | ✔              | ✔         |
| JSONCompact                                | ✔              | ✔         |
| JSONCompactStrings                         | ✗              | ✔         |
| JSONCompactColumns                         | ✔              | ✔         |
| JSONEachRow                                | ✔              | ✔         |
| PrettyJSONEachRow                          | ✗              | ✔         |
| JSONEachRowWithProgress                    | ✗              | ✔         |
| JSONStringsEachRow                         | ✔              | ✔         |
| JSONStringsEachRowWithProgress             | ✗              | ✔         |
| JSONCompactEachRow                         | ✔              | ✔         |
| JSONCompactEachRowWithNames                | ✔              | ✔         |
| JSONCompactEachRowWithNamesAndTypes        | ✔              | ✔         |
| JSONCompactEachRowWithProgress             | ✗              | ✔         |
| JSONCompactStringsEachRow                  | ✔              | ✔         |
| JSONCompactStringsEachRowWithNames         | ✔              | ✔         |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔              | ✔         |
| JSONCompactStringsEachRowWithProgress      | ✗              | ✔         |
| JSONObjectEachRow                          | ✔              | ✔         |
| BSONEachRow                                | ✔              | ✔         |
| TSKV                                       | ✔              | ✔         |
| Красивый                                   | ✗              | ✔         |
| PrettyNoEscapes                            | ✗              | ✔         |
| PrettyMonoBlock                            | ✗              | ✔         |
| PrettyNoEscapesMonoBlock                   | ✗              | ✔         |
| PrettyCompact                              | ✗              | ✔         |
| PrettyCompactNoEscapes                     | ✗              | ✔         |
| PrettyCompactMonoBlock                     | ✗              | ✔         |
| PrettyCompactNoEscapesMonoBlock            | ✗              | ✔         |
| PrettySpace                                | ✗              | ✔         |
| PrettySpaceNoEscapes                       | ✗              | ✔         |
| PrettySpaceMonoBlock                       | ✗              | ✔         |
| PrettySpaceNoEscapesMonoBlock              | ✗              | ✔         |
| Prometheus                                 | ✗              | ✔         |
| Protobuf                                   | ✔              | ✔         |
| ProtobufSingle                             | ✔              | ✔         |
| ProtobufList                               | ✔              | ✔         |
| Avro                                       | ✔              | ✔         |
| AvroConfluent                              | ✔              | ✗         |
| Parquet                                    | ✔              | ✔         |
| ParquetMetadata                            | ✔              | ✗         |
| Arrow                                      | ✔              | ✔         |
| ArrowStream                                | ✔              | ✔         |
| ORC                                        | ✔              | ✔         |
| Один                                       | ✔              | ✗         |
| Npy                                        | ✔              | ✔         |
| RowBinary                                  | ✔              | ✔         |
| RowBinaryWithNames                         | ✔              | ✔         |
| RowBinaryWithNamesAndTypes                 | ✔              | ✔         |
| RowBinaryWithDefaults                      | ✔              | ✗         |
| Native                                     | ✔              | ✔         |
| Null                                       | ✗              | ✔         |
| XML                                        | ✗              | ✔         |
| CapnProto                                  | ✔              | ✔         |
| LineAsString                               | ✔              | ✔         |
| Regexp                                     | ✔              | ✗         |
| RawBLOB                                    | ✔              | ✔         |
| MsgPack                                    | ✔              | ✔         |
| MySQLDump                                  | ✔              | ✗         |
| DWARF                                      | ✔              | ✗         |
| Markdown                                   | ✗              | ✔         |
| Форма                                      | ✔              | ✗         |

Для получения дополнительной информации и примеров см. раздел [Форматы ClickHouse для входных и выходных данных](/interfaces/formats).