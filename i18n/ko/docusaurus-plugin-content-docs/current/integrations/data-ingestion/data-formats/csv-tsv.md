---
sidebar_label: 'CSV 및 TSV'
slug: /integrations/data-formats/csv-tsv
title: 'ClickHouse에서 CSV 및 TSV 데이터 다루기'
description: 'ClickHouse에서 CSV 및 TSV 데이터를 다루는 방법을 설명하는 페이지입니다.'
keywords: ['CSV 형식', 'TSV 형식', '쉼표로 구분된 값', '탭으로 구분된 값', '데이터 임포트']
doc_type: 'guide'
---

# ClickHouse에서 CSV 및 TSV 데이터 다루기 \{#working-with-csv-and-tsv-data-in-clickhouse\}

ClickHouse는 CSV 형식으로 데이터를 가져오고 내보내는 작업을 지원합니다. CSV 파일은 헤더 행, 사용자 지정 구분 기호, 이스케이프 기호 등 다양한 형식상의 차이를 가질 수 있으므로, ClickHouse는 각 경우를 효율적으로 처리할 수 있도록 다양한 형식 옵션과 설정을 제공합니다.

## CSV 파일에서 데이터 가져오기 \{#importing-data-from-a-csv-file\}

데이터를 가져오기 전에 먼저 해당 구조에 맞는 테이블을 생성합니다:

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

[CSV 파일](assets/data_small.csv)의 데이터를 `sometable` 테이블로 가져오기 위해, 파일을 파이프를 사용해 `clickhouse-client`로 직접 전달할 수 있습니다.

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

여기서는 [FORMAT CSV](/interfaces/formats/CSV)를 사용하여 ClickHouse에 CSV 형식의 데이터를 수집하고 있음을 알립니다. 또는 [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) 절을 사용하여 로컬 파일에서 데이터를 로드할 수도 있습니다:

```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

여기서는 ClickHouse가 파일 형식을 인식할 수 있도록 `FORMAT CSV` 절을 사용합니다. [url()](/sql-reference/table-functions/url.md) 함수를 사용해 URL에서 직접 데이터를 로드하거나, [s3()](/sql-reference/table-functions/s3.md) 함수를 사용해 S3 파일에서 데이터를 로드할 수도 있습니다.

:::tip
`file()` 및 `INFILE`/`OUTFILE`의 경우 형식을 명시적으로 지정하지 않아도 됩니다.
이 경우 ClickHouse가 파일 확장자를 기준으로 형식을 자동으로 감지합니다.
:::


### 헤더가 있는 CSV 파일 \{#csv-files-with-headers\}

다음과 같이 [헤더가 있는 CSV 파일](assets/data_small_headers.csv)이 있다고 가정합니다.

```bash
head data-small-headers.csv
```

```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

이 파일에서 데이터를 가져오려면 [CSVWithNames](/interfaces/formats/CSVWithNames) 형식을 사용할 수 있습니다:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

이 경우 ClickHouse는 파일에서 데이터를 가져올 때 첫 번째 행을 건너뜁니다.

:::tip
[버전](https://github.com/ClickHouse/ClickHouse/releases) 23.1부터는 `CSV` 형식을 사용할 때 ClickHouse가 CSV 파일의 헤더를 자동으로 감지하므로 `CSVWithNames`나 `CSVWithNamesAndTypes`를 사용할 필요가 없습니다.
:::


### 사용자 지정 구분 기호를 사용하는 CSV 파일 \{#csv-files-with-custom-delimiters\}

CSV 파일이 쉼표가 아닌 다른 구분 기호를 사용하는 경우, [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 옵션을 사용하여 해당 구분 기호를 설정할 수 있습니다:

```sql
SET format_csv_delimiter = ';'
```

이제 CSV 파일을 가져올 때는 쉼표 대신 `;` 기호가 구분자로 사용됩니다.


### CSV 파일에서 행 건너뛰기 \{#skipping-lines-in-a-csv-file\}

CSV 파일에서 데이터를 가져올 때 처음 몇 행을 건너뛰어야 할 때가 있습니다. 이는 [input&#95;format&#95;csv&#95;skip&#95;first&#95;lines](/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines) 옵션을 사용하여 설정할 수 있습니다.

```sql
SET input_format_csv_skip_first_lines = 10
```

이 경우 CSV 파일의 처음 10줄을 건너뜁니다:

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```

```response
┌─count()─┐
│     990 │
└─────────┘
```

[파일](assets/data_small.csv)에 1,000개의 행이 있지만, 처음 10개를 건너뛰도록 지정했기 때문에 ClickHouse는 990개만 로드했습니다.

:::tip
`file()` 함수를 사용할 때 ClickHouse Cloud에서는 파일이 위치한 호스트에서 `clickhouse client`로 명령을 실행해야 합니다. 또 다른 방법으로는 [`clickhouse-local`](/operations/utilities/clickhouse-local.md)을 사용하여 로컬에서 파일을 살펴볼 수 있습니다.
:::


### CSV 파일에서 NULL 값 처리 \{#treating-null-values-in-csv-files\}

NULL 값은 파일을 생성한 애플리케이션에 따라 서로 다르게 인코딩될 수 있습니다. 기본적으로 ClickHouse는 CSV에서 NULL 값을 `\N`으로 표현합니다. 하지만 [format&#95;csv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) 옵션을 사용해 이를 변경할 수 있습니다.

다음과 같은 CSV 파일이 있다고 가정해 보겠습니다:

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

이 파일에서 데이터를 로드하면 ClickHouse는 `Nothing`을 String으로 취급합니다(이는 올바른 동작입니다).

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

ClickHouse에서 `Nothing`을 `NULL`로 처리하도록 하려면, 다음 옵션을 사용해 설정합니다:

```sql
SET format_csv_null_representation = 'Nothing'
```

이제 예상했던 위치에 `NULL`이 들어갔습니다:

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


## TSV (tab-separated) files \{#tsv-tab-separated-files\}

탭으로 구분되는 데이터 형식은 데이터 교환 형식으로 널리 사용됩니다. [TSV 파일](assets/data_small.tsv)에서 ClickHouse로 데이터를 적재하려면 [TabSeparated](/interfaces/formats/TabSeparated) 형식을 사용합니다:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```

헤더를 포함한 TSV 파일을 처리할 수 있도록 [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames) 형식도 있습니다. 또한 CSV와 마찬가지로 [input&#95;format&#95;tsv&#95;skip&#95;first&#95;lines](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines) 옵션을 사용해 처음 X줄을 건너뛸 수 있습니다.


### Raw TSV \{#raw-tsv\}

일부 TSV 파일은 탭과 줄 바꿈을 이스케이프하지 않은 채 저장됩니다. 이러한 파일을 처리하려면 [TabSeparatedRaw](/interfaces/formats/TabSeparatedRaw) 형식을 사용해야 합니다.

## CSV로 내보내기 \{#exporting-to-csv\}

앞에서 사용한 모든 형식은 데이터 내보내기에도 사용할 수 있습니다. 테이블(또는 쿼리)의 데이터를 CSV 형식으로 내보내려면 동일한 `FORMAT` 절을 사용합니다.

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

CSV 파일에 헤더를 추가하려면 [CSVWithNames](/interfaces/formats/CSVWithNames) 형식을 사용합니다:

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


### 내보낸 데이터를 CSV 파일로 저장하기 \{#saving-exported-data-to-a-csv-file\}

내보낸 데이터를 파일로 저장하려면 [INTO...OUTFILE](/sql-reference/statements/select/into-outfile.md) 절을 사용할 수 있습니다.

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```

```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

ClickHouse가 3천6백만 행을 CSV 파일에 저장하는 데 **약 1**초가 소요된 점에 주목하십시오.


### 사용자 지정 구분 기호로 CSV 내보내기 \{#exporting-csv-with-custom-delimiters\}

쉼표 이외의 구분 기호를 사용하려면 [format&#95;csv&#95;delimiter](/operations/settings/settings-formats.md/#format_csv_delimiter) 설정 옵션을 사용하면 됩니다:

```sql
SET format_csv_delimiter = '|'
```

이제 ClickHouse에서는 CSV 형식에서 구분 기호로 `|` 문자를 사용합니다:

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


### Windows용 CSV 내보내기 \{#exporting-csv-for-windows\}

CSV 파일을 Windows 환경에서 문제없이 사용하려면 [output&#95;format&#95;csv&#95;crlf&#95;end&#95;of&#95;line](/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line) 옵션을 활성화하는 것이 좋습니다. 이렇게 하면 줄바꿈 문자로 `\n` 대신 `\r\n`을 사용합니다:

```sql
SET output_format_csv_crlf_end_of_line = 1;
```


## CSV 파일에 대한 스키마 추론 \{#schema-inference-for-csv-files\}

알 수 없는 CSV 파일을 다뤄야 하는 경우가 자주 발생하므로, 컬럼에 어떤 타입을 사용해야 하는지 파악해야 합니다. ClickHouse는 기본적으로 지정된 CSV 파일을 분석하여 데이터 형식을 추론하려고 합니다. 이것을 「스키마 추론(schema inference)」이라고 합니다. 감지된 데이터 타입은 [file()](/sql-reference/table-functions/file.md) 함수와 `DESCRIBE` 구문을 함께 사용하여 확인할 수 있습니다:

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

여기서 ClickHouse는 CSV 파일의 컬럼 타입을 효율적으로 추론할 수 있습니다. ClickHouse가 추론하지 않게 하려면 다음 옵션을 사용해 이 기능을 비활성화할 수 있습니다:

```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

이 경우 모든 컬럼은 `String` 타입으로 처리됩니다.


### 컬럼 타입을 명시적으로 지정하여 CSV 내보내기 및 가져오기 \{#exporting-and-importing-csv-with-explicit-column-types\}

ClickHouse에서는 [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes) (및 기타 *WithNames 포맷 계열)을 사용해 데이터를 내보낼 때 컬럼 타입을 명시적으로 지정할 수도 있습니다.

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

이 포맷에서는 두 개의 헤더 행을 포함합니다. 하나는 컬럼 이름을, 다른 하나는 컬럼 타입을 나타냅니다. 이렇게 하면 ClickHouse(및 다른 애플리케이션)에서 [이와 같은 파일](assets/data_csv_types.csv)로부터 데이터를 로드할 때 컬럼 타입을 식별할 수 있습니다.

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

이제 ClickHouse는 더 이상 추측에 의존하지 않고 (두 번째) 헤더 행을 기반으로 컬럼 유형을 판별합니다.


## 사용자 지정 구분자, 구분 기호, 이스케이프 규칙 \{#custom-delimiters-separators-and-escaping-rules\}

복잡한 경우에는 텍스트 데이터가 매우 맞춤형 방식으로 포맷되더라도 여전히 일정한 구조를 가질 수 있습니다. ClickHouse에는 이러한 경우를 위한 [CustomSeparated](/interfaces/formats/CustomSeparated) 전용 포맷이 있으며, 이를 통해 사용자 지정 이스케이프 규칙, 구분자, 줄 구분자, 시작/종료 기호를 설정할 수 있습니다.

파일에 다음과 같은 데이터가 있다고 가정합니다.

```text
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

각 행은 `row()`로 감싸져 있고, 줄은 `,`로 구분되고, 개별 값은 `;`로 구분됩니다. 이 경우 다음 설정을 사용하여 이 파일에서 데이터를 읽을 수 있습니다:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

이제 사용자 지정 형식으로 된 [파일](assets/data_small_custom.txt)에서 데이터를 로드해 보겠습니다.

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

헤더가 올바르게 내보내지고 가져와지도록 [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)를 사용할 수도 있습니다. 더 복잡한 사례를 처리하려면 [regex 및 Template](templates-regex.md) 포맷을 살펴보십시오.


## 대용량 CSV 파일 작업 \{#working-with-large-csv-files\}

CSV 파일은 매우 클 수 있으며, ClickHouse는 크기에 관계없이 파일을 효율적으로 처리합니다. 대용량 파일은 보통 압축된 상태로 제공되며, ClickHouse에서는 처리 전에 압축을 해제할 필요 없이 바로 처리할 수 있습니다. INSERT할 때 `COMPRESSION` 절을 사용할 수 있습니다:

```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

`COMPRESSION` 절을 생략하더라도 ClickHouse는 파일 확장자를 기준으로 압축 형식을 추론하려고 시도합니다. 같은 방식을 사용하면 압축된 형식으로 파일을 직접 내보낼 수 있습니다.

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

이 작업은 압축된 `data_csv.csv.gz` 파일을 생성합니다.


## Other formats \{#other-formats\}

ClickHouse는 다양한 시나리오와 플랫폼을 아우르기 위해 텍스트 및 바이너리 형식을 포함한 여러 포맷을 지원합니다. 다음 문서에서 더 많은 포맷과 이를 활용하는 방법을 살펴보십시오:

- **CSV 및 TSV 형식**
- [Parquet](parquet.md)
- [JSON 형식](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex 및 템플릿](templates-regex.md)
- [네이티브 및 바이너리 형식](binary.md)
- [SQL 형식](sql.md)

또한 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)도 확인하십시오 — ClickHouse 서버 없이 로컬/원격 파일을 다룰 수 있는 휴대 가능한 모든 기능을 갖춘 도구입니다.