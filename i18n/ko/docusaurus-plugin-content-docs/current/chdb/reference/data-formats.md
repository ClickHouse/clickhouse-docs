---
'title': '데이터 형식'
'sidebar_label': '데이터 형식'
'slug': '/chdb/reference/data-formats'
'description': 'chDB의 데이터 형식'
'keywords':
- 'chdb'
- 'data formats'
'doc_type': 'reference'
---

When it comes to data formats, chDB is 100% feature compatible with ClickHouse.

Input formats are used to parse the data provided to `INSERT` and `SELECT` from a file-backed table such as `File`, `URL` or `S3`.  
Output formats are used to arrange the results of a `SELECT`, and to perform `INSERT`s into a file-backed table.  
As well as the data formats that ClickHouse supports, chDB also supports:

- `ArrowTable` as an output format, the type is Python `pyarrow.Table`
- `DataFrame` as an input and output format, the type is Python `pandas.DataFrame`. For examples, see [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)
- `Debug` as ab output (as an alias of `CSV`), but with enabled debug verbose output from ClickHouse.

The supported data formats from ClickHouse are:

| Format                          | Input | Output |
|---------------------------------|-------|--------|
| TabSeparated                    | ✔     | ✔      |
| TabSeparatedRaw                 | ✔     | ✔      |
| TabSeparatedWithNames           | ✔     | ✔      |
| TabSeparatedWithNamesAndTypes   | ✔     | ✔      |
| TabSeparatedRawWithNames        | ✔     | ✔      |
| TabSeparatedRawWithNamesAndTypes| ✔     | ✔      |
| Template                        | ✔     | ✔      |
| TemplateIgnoreSpaces            | ✔     | ✗      |
| CSV                             | ✔     | ✔      |
| CSVWithNames                    | ✔     | ✔      |
| CSVWithNamesAndTypes            | ✔     | ✔      |
| CustomSeparated                 | ✔     | ✔      |
| CustomSeparatedWithNames        | ✔     | ✔      |
| CustomSeparatedWithNamesAndTypes| ✔     | ✔      |
| SQLInsert                       | ✗     | ✔      |
| Values                          | ✔     | ✔      |
| Vertical                        | ✗     | ✔      |
| JSON                            | ✔     | ✔      |
| JSONAsString                    | ✔     | ✗      |
| JSONAsObject                    | ✔     | ✗      |
| JSONStrings                     | ✔     | ✔      |
| JSONColumns                     | ✔     | ✔      |
| JSONColumnsWithMetadata         | ✔     | ✔      |
| JSONCompact                     | ✔     | ✔      |
| JSONCompactStrings              | ✗     | ✔      |
| JSONCompactColumns              | ✔     | ✔      |
| JSONEachRow                     | ✔     | ✔      |
| PrettyJSONEachRow               | ✗     | ✔      |
| JSONEachRowWithProgress         | ✗     | ✔      |
| JSONStringsEachRow              | ✔     | ✔      |
| JSONStringsEachRowWithProgress  | ✗     | ✔      |
| JSONCompactEachRow              | ✔     | ✔      |
| JSONCompactEachRowWithNames     | ✔     | ✔      |
| JSONCompactEachRowWithNamesAndTypes | ✔  | ✔      |
| JSONCompactEachRowWithProgress  | ✗     | ✔      |
| JSONCompactStringsEachRow       | ✔     | ✔      |
| JSONCompactStringsEachRowWithNames | ✔  | ✔      |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔ | ✔ |
| JSONCompactStringsEachRowWithProgress | ✗ | ✔      |
| JSONObjectEachRow               | ✔     | ✔      |
| BSONEachRow                     | ✔     | ✔      |
| TSKV                            | ✔     | ✔      |
| Pretty                          | ✗     | ✔      |
| PrettyNoEscapes                 | ✗     | ✔      |
| PrettyMonoBlock                 | ✗     | ✔      |
| PrettyNoEscapesMonoBlock        | ✗     | ✔      |
| PrettyCompact                   | ✗     | ✔      |
| PrettyCompactNoEscapes          | ✗     | ✔      |
| PrettyCompactMonoBlock          | ✗     | ✔      |
| PrettyCompactNoEscapesMonoBlock | ✗     | ✔      |
| PrettySpace                     | ✗     | ✔      |
| PrettySpaceNoEscapes            | ✗     | ✔      |
| PrettySpaceMonoBlock            | ✗     | ✔      |
| PrettySpaceNoEscapesMonoBlock   | ✗     | ✔      |
| Prometheus                      | ✗     | ✔      |
| Protobuf                        | ✔     | ✔      |
| ProtobufSingle                  | ✔     | ✔      |
| ProtobufList                    | ✔     | ✔      |
| Avro                            | ✔     | ✔      |
| AvroConfluent                   | ✔     | ✗      |
| Parquet                         | ✔     | ✔      |
| ParquetMetadata                 | ✔     | ✗      |
| Arrow                           | ✔     | ✔      |
| ArrowStream                     | ✔     | ✔      |
| ORC                             | ✔     | ✔      |
| One                             | ✔     | ✗      |
| Npy                             | ✔     | ✔      |
| RowBinary                       | ✔     | ✔      |
| RowBinaryWithNames              | ✔     | ✔      |
| RowBinaryWithNamesAndTypes      | ✔     | ✔      |
| RowBinaryWithDefaults           | ✔     | ✗      |
| Native                          | ✔     | ✔      |
| Null                            | ✗     | ✔      |
| XML                             | ✗     | ✔      |
| CapnProto                       | ✔     | ✔      |
| LineAsString                    | ✔     | ✔      |
| Regexp                          | ✔     | ✗      |
| RawBLOB                         | ✔     | ✔      |
| MsgPack                         | ✔     | ✔      |
| MySQLDump                       | ✔     | ✗      |
| DWARF                           | ✔     | ✗      |
| Markdown                        | ✗     | ✔      |
| Form                            | ✔     | ✗      |

For further information and examples, see [ClickHouse formats for input and output data](/interfaces/formats).

---

데이터 형식에 관한 한, chDB는 ClickHouse와 100% 기능 호환됩니다.

입력 형식은 `INSERT` 및 `SELECT`에 제공된 데이터를 구문 분석하는 데 사용되며, `File`, `URL` 또는 `S3`와 같은 파일 기반 테이블에서 사용됩니다.  
출력 형식은 `SELECT`의 결과를 정렬하고 파일 기반 테이블에 `INSERT`를 수행하는 데 사용됩니다.  
ClickHouse가 지원하는 데이터 형식 외에도 chDB는 다음을 지원합니다:

- 출력 형식으로서의 `ArrowTable`, 타입은 Python `pyarrow.Table`입니다.
- 입력 및 출력 형식으로서의 `DataFrame`, 타입은 Python `pandas.DataFrame`입니다. 예제는 [`test_joindf.py`](https://github.com/chdb-io/chdb/blob/main/tests/test_joindf.py)를 참조하십시오.
- `Debug`는 ClickHouse에서 디버그 상세 출력을 활성화한 상태의 `CSV`의 별칭으로서의 출력입니다.

ClickHouse에서 지원하는 데이터 형식은 다음과 같습니다:

| 형식                           | 입력 | 출력 |
|-------------------------------|------|------|
| TabSeparated                   | ✔    | ✔    |
| TabSeparatedRaw                | ✔    | ✔    |
| TabSeparatedWithNames          | ✔    | ✔    |
| TabSeparatedWithNamesAndTypes  | ✔    | ✔    |
| TabSeparatedRawWithNames       | ✔    | ✔    |
| TabSeparatedRawWithNamesAndTypes | ✔  | ✔    |
| Template                       | ✔    | ✔    |
| TemplateIgnoreSpaces           | ✔    | ✗    |
| CSV                            | ✔    | ✔    |
| CSVWithNames                   | ✔    | ✔    |
| CSVWithNamesAndTypes           | ✔    | ✔    |
| CustomSeparated                | ✔    | ✔    |
| CustomSeparatedWithNames       | ✔    | ✔    |
| CustomSeparatedWithNamesAndTypes | ✔  | ✔    |
| SQLInsert                      | ✗    | ✔    |
| Values                         | ✔    | ✔    |
| Vertical                       | ✗    | ✔    |
| JSON                           | ✔    | ✔    |
| JSONAsString                   | ✔    | ✗    |
| JSONAsObject                   | ✔    | ✗    |
| JSONStrings                    | ✔    | ✔    |
| JSONColumns                    | ✔    | ✔    |
| JSONColumnsWithMetadata        | ✔    | ✔    |
| JSONCompact                    | ✔    | ✔    |
| JSONCompactStrings             | ✗    | ✔    |
| JSONCompactColumns             | ✔    | ✔    |
| JSONEachRow                    | ✔    | ✔    |
| PrettyJSONEachRow              | ✗    | ✔    |
| JSONEachRowWithProgress        | ✗    | ✔    |
| JSONStringsEachRow             | ✔    | ✔    |
| JSONStringsEachRowWithProgress | ✗    | ✔    |
| JSONCompactEachRow             | ✔    | ✔    |
| JSONCompactEachRowWithNames    | ✔    | ✔    |
| JSONCompactEachRowWithNamesAndTypes | ✔ | ✔    |
| JSONCompactEachRowWithProgress | ✗    | ✔    |
| JSONCompactStringsEachRow      | ✔    | ✔    |
| JSONCompactStringsEachRowWithNames | ✔ | ✔    |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔ | ✔ |
| JSONCompactStringsEachRowWithProgress | ✗ | ✔    |
| JSONObjectEachRow              | ✔    | ✔    |
| BSONEachRow                    | ✔    | ✔    |
| TSKV                           | ✔    | ✔    |
| Pretty                         | ✗    | ✔    |
| PrettyNoEscapes                | ✗    | ✔    |
| PrettyMonoBlock                | ✗    | ✔    |
| PrettyNoEscapesMonoBlock       | ✗    | ✔    |
| PrettyCompact                  | ✗    | ✔    |
| PrettyCompactNoEscapes         | ✗    | ✔    |
| PrettyCompactMonoBlock         | ✗    | ✔    |
| PrettyCompactNoEscapesMonoBlock| ✗    | ✔    |
| PrettySpace                    | ✗    | ✔    |
| PrettySpaceNoEscapes           | ✗    | ✔    |
| PrettySpaceMonoBlock           | ✗    | ✔    |
| PrettySpaceNoEscapesMonoBlock  | ✗    | ✔    |
| Prometheus                     | ✗    | ✔    |
| Protobuf                       | ✔    | ✔    |
| ProtobufSingle                 | ✔    | ✔    |
| ProtobufList                   | ✔    | ✔    |
| Avro                           | ✔    | ✔    |
| AvroConfluent                  | ✔    | ✗    |
| Parquet                        | ✔    | ✔    |
| ParquetMetadata                | ✔    | ✗    |
| Arrow                          | ✔    | ✔    |
| ArrowStream                    | ✔    | ✔    |
| ORC                            | ✔    | ✔    |
| One                            | ✔    | ✗    |
| Npy                            | ✔    | ✔    |
| RowBinary                      | ✔    | ✔    |
| RowBinaryWithNames             | ✔    | ✔    |
| RowBinaryWithNamesAndTypes     | ✔    | ✔    |
| RowBinaryWithDefaults          | ✔    | ✗    |
| Native                         | ✔    | ✔    |
| Null                           | ✗    | ✔    |
| XML                            | ✗    | ✔    |
| CapnProto                      | ✔    | ✔    |
| LineAsString                   | ✔    | ✔    |
| Regexp                         | ✔    | ✗    |
| RawBLOB                        | ✔    | ✔    |
| MsgPack                        | ✔    | ✔    |
| MySQLDump                      | ✔    | ✗    |
| DWARF                          | ✔    | ✗    |
| Markdown                       | ✗    | ✔    |
| Form                           | ✔    | ✗    |

더 많은 정보와 예제는 [ClickHouse의 입력 및 출력 데이터 형식](/interfaces/formats)을 참조하십시오.
