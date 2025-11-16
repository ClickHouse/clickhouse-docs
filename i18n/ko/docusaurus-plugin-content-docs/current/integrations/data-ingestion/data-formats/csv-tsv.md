---
'sidebar_label': 'CSV 및 TSV'
'slug': '/integrations/data-formats/csv-tsv'
'title': 'ClickHouse에서 CSV 및 TSV 데이터 작업하기'
'description': 'ClickHouse에서 CSV 및 TSV 데이터를 작업하는 방법을 설명하는 페이지'
'keywords':
- 'CSV format'
- 'TSV format'
- 'comma separated values'
- 'tab separated values'
- 'data import'
'doc_type': 'guide'
---



# ClickHouse에서 CSV 및 TSV 데이터 작업하기

ClickHouse는 CSV에서 데이터를 가져오고 내보내는 것을 지원합니다. CSV 파일은 헤더 행, 사용자 정의 구분 기호 및 이스케이프 기호를 포함하여 다양한 형식 세부정보를 가질 수 있으므로, ClickHouse는 각 경우를 효율적으로 처리하기 위해 형식 및 설정을 제공합니다.

## CSV 파일에서 데이터 가져오기 {#importing-data-from-a-csv-file}

데이터를 가져오기 전에 관련 구조의 테이블을 생성해 보겠습니다:

```sql
CREATE TABLE sometable
(
    `path` String,
    `month` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY tuple(month, path)
```

`sometable` 테이블로 [CSV 파일](assets/data_small.csv)에서 데이터를 가져오려면, 해당 파일을 clickhouse-client에 직접 파이프 할 수 있습니다:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

Note that we use [FORMAT CSV](/interfaces/formats/CSV) to let ClickHouse know we're ingesting CSV formatted data. Alternatively, we can load data from a local file using the [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) clause:

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

여기서는 `FORMAT CSV` 절을 사용하여 ClickHouse가 파일 형식을 이해할 수 있도록 합니다. 또한, [url()](/sql-reference/table-functions/url.md) 함수를 사용하여 URL에서 직접 데이터를 로드하거나, [s3()](/sql-reference/table-functions/s3.md) 함수를 사용하여 S3 파일에서 로드할 수 있습니다.

:::tip
`file()` 및 `INFILE`/`OUTFILE`에 대해 명시적인 형식 설정을 건너뛸 수 있습니다.
이 경우 ClickHouse는 파일 확장명에 따라 형식을 자동으로 감지합니다.
:::

### 헤더가 있는 CSV 파일 {#csv-files-with-headers}

우리의 [CSV 파일에 헤더가 포함되어 있다고 가정해 보겠습니다](assets/data_small_headers.csv):

```bash
head data-small-headers.csv
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

이 파일에서 데이터를 가져오기 위해, [CSVWithNames](/interfaces/formats/CSVWithNames) 형식을 사용할 수 있습니다:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

이 경우 ClickHouse는 파일에서 데이터를 가져올 때 첫 번째 행을 건너뜁니다.

:::tip
[버전](https://github.com/ClickHouse/ClickHouse/releases) 23.1부터 ClickHouse는 `CSV` 형식을 사용하여 CSV 파일에서 헤더를 자동으로 감지하므로 `CSVWithNames` 또는 `CSVWithNamesAndTypes`를 사용할 필요가 없습니다.
:::

### 사용자 정의 구분 기호가 있는 CSV 파일 {#csv-files-with-custom-delimiters}

CSV 파일이 쉼표가 아닌 다른 구분 기호를 사용하는 경우, [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 옵션을 사용하여 관련 기호를 설정할 수 있습니다:

```sql
SET format_csv_delimiter = ';'
```

이제 CSV 파일에서 가져올 때 `;` 기호가 쉼표 대신 구분 기호로 사용됩니다.

### CSV 파일에서 행 건너뛰기 {#skipping-lines-in-a-csv-file}

가끔 CSV 파일에서 데이터를 가져올 때 특정 수의 행을 건너뛰어야 할 수 있습니다. 이는 [input_format_csv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines) 옵션을 사용하여 수행할 수 있습니다:

```sql
SET input_format_csv_skip_first_lines = 10
```

이 경우 CSV 파일의 처음 10 행을 건너뛰게 됩니다:

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```
```response
┌─count()─┐
│     990 │
└─────────┘
```

따라서 [파일](assets/data_small.csv)에는 1k 행이 있지만 ClickHouse는 처음 10 행을 건너뛰라고 요청했기 때문에 990 행만 로드했습니다.

:::tip
`file()` 함수를 사용할 때, ClickHouse Cloud에서는 파일이 위치한 머신에서 `clickhouse client` 명령을 실행해야 합니다. 또 다른 옵션은 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)을 사용하여 로컬에서 파일을 탐색하는 것입니다.
:::

### CSV 파일에서 NULL 값 처리하기 {#treating-null-values-in-csv-files}

NULL 값은 파일을 생성한 응용 프로그램에 따라 다르게 인코딩될 수 있습니다. 기본적으로 ClickHouse는 CSV에서 Null 값을 `\N`으로 사용합니다. 그러나 [format_csv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 옵션을 사용하여 이를 변경할 수 있습니다.

다음과 같은 CSV 파일이 있다고 가정해 보겠습니다:

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

이 파일에서 데이터를 로드하면 ClickHouse는 `Nothing`을 문자열로 처리합니다(올바릅니다):

```sql
SELECT * FROM file('nulls.csv')
```
```response
┌─c1──────┬─c2──────┐
│ Donald  │ 90      │
│ Joe     │ Nothing │
│ Nothing │ 70      │
└─────────┴─────────┘
```

ClickHouse가 `Nothing`을 `NULL`로 처리하게 하려면 다음 옵션을 사용하여 정의할 수 있습니다:

```sql
SET format_csv_null_representation = 'Nothing'
```

이제 우리가 예상했던 곳에 `NULL`이 있습니다:

```sql
SELECT * FROM file('nulls.csv')
```
```response
┌─c1─────┬─c2───┐
│ Donald │ 90   │
│ Joe    │ ᴺᵁᴸᴸ │
│ ᴺᵁᴸᴸ   │ 70   │
└────────┴──────┘
```

## TSV(탭 분리) 파일 {#tsv-tab-separated-files}

탭 분리 데이터 형식은 데이터 교환 형식으로 널리 사용됩니다. [TSV 파일](assets/data_small.tsv)에서 ClickHouse로 데이터를 로드하기 위해서는 [TabSeparated](/interfaces/formats/TabSeparated) 형식을 사용합니다:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

헤더가 있는 TSV 파일 작업을 위해 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames) 형식도 있습니다. 그리고 CSV와 마찬가지로 [input_format_tsv_skip_first_lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines) 옵션을 사용하여 처음 X 행을 건너뛸 수 있습니다.

### 원시 TSV {#raw-tsv}

경우에 따라 TSV 파일이 탭과 줄 바꿈을 이스케이프하지 않고 저장되기도 합니다. 이러한 파일을 처리하기 위해 [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw)를 사용해야 합니다.

## CSV로 내보내기 {#exporting-to-csv}

이전 예제의 모든 형식을 사용하여 데이터 내보내기도 가능합니다. 테이블(또는 쿼리)에서 CSV 형식으로 데이터를 내보내기 위해 같은 `FORMAT` 절을 사용합니다:

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSV
```
```response
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```

CSV 파일에 헤더를 추가하기 위해 [CSVWithNames](/interfaces/formats/CSVWithNames) 형식을 사용합니다:

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSVWithNames
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```

### CSV 파일로 내보낸 데이터 저장하기 {#saving-exported-data-to-a-csv-file}

내보낸 데이터를 파일로 저장하기 위해서는 [INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md) 절을 사용할 수 있습니다:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```
```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

ClickHouse가 36m 행을 CSV 파일로 저장하는 데 **~1** 초가 걸린 점에 유의하세요.

### 사용자 정의 구분 기호로 CSV 내보내기 {#exporting-csv-with-custom-delimiters}

쉼표 외의 구분 기호로 내보내고자 하는 경우에는 [format_csv_delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 설정 옵션을 사용할 수 있습니다:

```sql
SET format_csv_delimiter = '|'
```

이제 ClickHouse는 CSV 형식에 대해 `|`를 구분 기호로 사용합니다:

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSV
```
```response
"Akiba_Hebrew_Academy"|"2017-08-01"|241
"Aegithina_tiphia"|"2018-02-01"|34
"1971-72_Utah_Stars_season"|"2016-10-01"|1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8"|"2015-12-01"|73
"2016_Greater_Western_Sydney_Giants_season"|"2017-05-01"|86
```

### Windows용 CSV 내보내기 {#exporting-csv-for-windows}

CSV 파일이 Windows 환경에서 잘 작동하도록 하려면 [output_format_csv_crlf_end_of_line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line) 옵션을 활성화하는 것을 고려해야 합니다. 이 경우 줄 바꿈에 `\n` 대신 `\r\n`을 사용합니다:

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## CSV 파일에 대한 스키마 추론 {#schema-inference-for-csv-files}

많은 경우, 우리는 알 수 없는 CSV 파일을 다루어야 하므로, 컬럼에 어떤 유형을 사용할지 탐색해야 합니다. Clickhouse는 기본적으로 주어진 CSV 파일의 분석을 바탕으로 데이터 형식을 추측하려고 합니다. 이는 "스키마 추론"으로 알려져 있습니다. 감지된 데이터 유형은 `DESCRIBE` 문과 [file()](/sql-reference/table-functions/file.md) 함수를 함께 사용하여 탐색할 수 있습니다:

```sql
DESCRIBE file('data-small.csv', CSV)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(Date)   │              │                    │         │                  │                │
│ c3   │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

여기서 ClickHouse는 우리의 CSV 파일에 대한 컬럼 유형을 효율적으로 추측할 수 있습니다. ClickHouse가 추측하지 않도록 하려면 다음 옵션을 사용하여 이를 비활성화할 수 있습니다:

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

이 경우 모든 컬럼 유형은 `String`으로 처리됩니다.

### 명시적인 컬럼 유형으로 CSV 내보내기 및 가져오기 {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse는 [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes) (및 기타 *WithNames 형식군)를 사용할 때 데이터 내보내기 시 명시적으로 컬럼 유형을 설정할 수 있도록 허용합니다:

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSVWithNamesAndTypes
```
```response
"path","month","hits"
"String","Date","UInt32"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```

이 형식은 두 개의 헤더 행을 포함합니다 - 하나는 컬럼 이름이 되는 행이고 다른 하나는 컬럼 유형이 되는 행입니다. 이렇게 하면 ClickHouse(및 기타 응용 프로그램)가 [이러한 파일](assets/data_csv_types.csv)에서 데이터를 로드할 때 컬럼 유형을 식별할 수 있습니다:

```sql
DESCRIBE file('data_csv_types.csv', CSVWithNamesAndTypes)
```
```response
┌─name──┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ String │              │                    │         │                  │                │
│ month │ Date   │              │                    │         │                  │                │
│ hits  │ UInt32 │              │                    │         │                  │                │
└───────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

이제 ClickHouse는 추측하는 대신 (두 번째) 헤더 행에 따라 컬럼 유형을 식별합니다.

## 사용자 정의 구분 기호, 구분 기호 및 이스케이프 규칙 {#custom-delimiters-separators-and-escaping-rules}

복잡한 경우, 텍스트 데이터는 매우 사용자 정의된 방식으로 형식이 지정될 수 있지만 여전히 구조를 가질 수 있습니다. ClickHouse에는 이러한 경우를 위한 특별한 [CustomSeparated](/interfaces/formats/CustomSeparated) 형식이 있으며, 사용자 정의 이스케이프 규칙, 구분 기호, 라인 구분 기호 및 시작/종료 기호를 설정할 수 있습니다.

파일에 다음과 같은 데이터가 있다고 가정해 보겠습니다:

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

우리는 개별 행이 `row()`로 감싸져 있고, 줄이 `,`로 구분되며, 개별 값이 `;`로 구분되어 있는 것을 볼 수 있습니다. 이 경우, 다음 설정을 사용하여 이 파일에서 데이터를 읽을 수 있습니다:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

이제 우리는 사용자 정의 형식 [파일](assets/data_small_custom.txt)에서 데이터를 로드할 수 있습니다:

```sql
SELECT *
FROM file('data_small_custom.txt', CustomSeparated)
LIMIT 3
```
```response
┌─c1────────────────────────┬─────────c2─┬──c3─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │ 241 │
│ Aegithina_tiphia          │ 2018-02-01 │  34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │   1 │
└───────────────────────────┴────────────┴─────┘
```

헤더를 올바르게 내보내고 가져오려면 [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)도 사용할 수 있습니다. 더 복잡한 경우를 다루기 위해 [정규 표현식 및 템플릿](templates-regex.md) 형식을 탐색하세요.

## 대형 CSV 파일 작업하기 {#working-with-large-csv-files}

CSV 파일은 클 수 있으며 ClickHouse는 모든 크기의 파일을 효율적으로 처리합니다. 대형 파일은 보통 압축되어 있으며 ClickHouse는 처리하기 전에 압축 해제를 요구하지 않습니다. 삽입 중에 `COMPRESSION` 절을 사용할 수 있습니다:

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

`COMPRESSION` 절이 생략된 경우에도 ClickHouse는 파일 확장명에 따라 파일 압축을 추측하려고 합니다. 동일한 접근 방식을 사용하여 파일을 압축된 형식으로 직접 내보낼 수 있습니다:

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

이렇게 하면 압축된 `data_csv.csv.gz` 파일이 생성됩니다.

## 기타 형식 {#other-formats}

ClickHouse는 다양한 시나리오 및 플랫폼을 다루기 위해 많은 형식(텍스트 및 이진 형식)을 지원합니다. 다음 문서에서 더 많은 형식과 이를 작업하는 방법을 탐색하세요:

- **CSV 및 TSV 형식**
- [Parquet](parquet.md)
- [JSON 형식](/integrations/data-ingestion/data-formats/json/intro.md)
- [정규 표현식 및 템플릿](templates-regex.md)
- [네이티브 및 이진 형식](binary.md)
- [SQL 형식](sql.md)

또한 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)를 확인해보세요 - Clickhouse 서버 없이 로컬/원격 파일에서 작업할 수 있는 포괄적인 도구입니다.
