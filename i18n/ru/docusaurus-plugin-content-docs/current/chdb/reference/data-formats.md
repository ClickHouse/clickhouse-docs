---
title: 'Форматы данных'
sidebar_label: 'Форматы данных'
slug: /chdb/reference/data-formats
description: 'Форматы данных для chDB'
keywords: ['chdb', 'форматы данных']
doc_type: 'reference'
---

Когда речь идет о форматах данных, chDB на 100% совместим по функциональности с ClickHouse.

Форматы ввода используются для разбора данных, передаваемых в `INSERT`, а также для `SELECT` из таблицы, использующей файловое хранилище, такой как `File`, `URL` или `S3`.
Форматы вывода используются для представления результатов `SELECT` и для выполнения `INSERT` в таблицы, использующие файловое хранилище.
Помимо форматов данных, которые поддерживает ClickHouse, chDB также поддерживает:

- `ArrowTable` как формат вывода, тип — Python `pyarrow.Table`
- `DataFrame` как формат ввода и вывода, тип — Python `pandas.DataFrame`. Примеры см. в [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- `Debug` как формат вывода (как алиас формата `CSV`), но с включенным подробным отладочным выводом из ClickHouse.

Поддерживаемые ClickHouse форматы данных:

| Формат                                     | Ввод | Вывод |
| ------------------------------------------ | ---- | ----- |
| TabSeparated                               | ✔    | ✔     |
| TabSeparatedRaw                            | ✔    | ✔     |
| TabSeparatedWithNames                      | ✔    | ✔     |
| TabSeparatedWithNamesAndTypes              | ✔    | ✔     |
| TabSeparatedRawWithNames                   | ✔    | ✔     |
| TabSeparatedRawWithNamesAndTypes           | ✔    | ✔     |
| Шаблон                                     | ✔    | ✔     |
| TemplateIgnoreSpaces                       | ✔    | ✗     |
| CSV                                        | ✔    | ✔     |
| CSVWithNames                               | ✔    | ✔     |
| CSVWithNamesAndTypes                       | ✔    | ✔     |
| CustomSeparated                            | ✔    | ✔     |
| CustomSeparatedWithNames                   | ✔    | ✔     |
| CustomSeparatedWithNamesAndTypes           | ✔    | ✔     |
| SQLInsert                                  | ✗    | ✔     |
| Параметры                                  | ✔    | ✔     |
| Вертикальный                               | ✗    | ✔     |
| JSON                                       | ✔    | ✔     |
| JSONAsString                               | ✔    | ✗     |
| JSONAsObject                               | ✔    | ✗     |
| JSON-строки                                | ✔    | ✔     |
| Столбцы JSON                               | ✔    | ✔     |
| JSONColumnsWithMetadata                    | ✔    | ✔     |
| JSONCompact                                | ✔    | ✔     |
| JSONCompactStrings                         | ✗    | ✔     |
| JSONCompactColumns                         | ✔    | ✔     |
| JSONEachRow                                | ✔    | ✔     |
| PrettyJSONEachRow                          | ✗    | ✔     |
| JSONEachRowWithProgress                    | ✗    | ✔     |
| JSONStringsEachRow                         | ✔    | ✔     |
| JSONStringsEachRowWithProgress             | ✗    | ✔     |
| JSONCompactEachRow                         | ✔    | ✔     |
| JSONCompactEachRowWithNames                | ✔    | ✔     |
| JSONCompactEachRowWithNamesAndTypes        | ✔    | ✔     |
| JSONCompactEachRowWithProgress             | ✗    | ✔     |
| JSONCompactStringsEachRow                  | ✔    | ✔     |
| JSONCompactStringsEachRowWithNames         | ✔    | ✔     |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔    | ✔     |
| JSONCompactStringsEachRowWithProgress      | ✗    | ✔     |
| JSONObjectEachRow                          | ✔    | ✔     |
| BSONEachRow                                | ✔    | ✔     |
| TSKV                                       | ✔    | ✔     |
| Красивый                                   | ✗    | ✔     |
| PrettyNoEscapes                            | ✗    | ✔     |
| PrettyMonoBlock                            | ✗    | ✔     |
| PrettyNoEscapesMonoBlock                   | ✗    | ✔     |
| PrettyCompact                              | ✗    | ✔     |
| PrettyCompactNoEscapes                     | ✗    | ✔     |
| PrettyCompactMonoBlock                     | ✗    | ✔     |
| PrettyCompactNoEscapesMonoBlock            | ✗    | ✔     |
| PrettySpace                                | ✗    | ✔     |
| PrettySpaceNoEscapes                       | ✗    | ✔     |
| PrettySpaceMonoBlock                       | ✗    | ✔     |
| PrettySpaceNoEscapesMonoBlock              | ✗    | ✔     |
| Prometheus                                 | ✗    | ✔     |
| Protobuf                                   | ✔    | ✔     |
| ProtobufSingle                             | ✔    | ✔     |
| ProtobufList                               | ✔    | ✔     |
| Avro                                       | ✔    | ✔     |
| AvroConfluent                              | ✔    | ✗     |
| Parquet                                    | ✔    | ✔     |
| ParquetMetadata                            | ✔    | ✗     |
| Arrow                                      | ✔    | ✔     |
| ArrowStream                                | ✔    | ✔     |
| ORC                                        | ✔    | ✔     |
| Один                                       | ✔    | ✗     |
| Npy                                        | ✔    | ✔     |
| RowBinary                                  | ✔    | ✔     |
| RowBinaryWithNames                         | ✔    | ✔     |
| RowBinaryWithNamesAndTypes                 | ✔    | ✔     |
| RowBinaryWithDefaults                      | ✔    | ✗     |
| Нативный                                   | ✔    | ✔     |
| Null                                       | ✗    | ✔     |
| XML                                        | ✗    | ✔     |
| CapnProto                                  | ✔    | ✔     |
| LineAsString                               | ✔    | ✔     |
| Регулярное выражение                       | ✔    | ✗     |
| RawBLOB                                    | ✔    | ✔     |
| MsgPack                                    | ✔    | ✔     |
| MySQLDump                                  | ✔    | ✗     |
| DWARF                                      | ✔    | ✗     |
| Markdown                                   | ✗    | ✔     |
| Форма                                      | ✔    | ✗     |

Для получения дополнительной информации и примеров см. [форматы ClickHouse для входных и выходных данных](/interfaces/formats).