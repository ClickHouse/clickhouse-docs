---
'alias':
- 'TSV'
'description': 'TSV 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'TabSeparated'
- 'TSV'
'output_format': true
'slug': '/interfaces/formats/TabSeparated'
'title': 'TabSeparated'
'doc_type': 'reference'
---


| Input | Output | Alias  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |

## Description {#description}

TabSeparated 형식에서는 데이터가 행 단위로 작성됩니다. 각 행은 탭으로 구분된 값을 포함합니다. 각 값 뒤에는 탭이 따라오며, 행의 마지막 값 뒤에는 줄 바꿈이 따라옵니다. 모든 곳에서 엄격하게 Unix 줄 바꿈이 가정됩니다. 마지막 행에도 반드시 끝에 줄 바꿈이 포함되어야 합니다. 값은 따옴표 없이 텍스트 형식으로 작성되며, 특수 문자는 이스케이프 처리됩니다.

이 형식은 `TSV`라는 이름으로도 사용됩니다.

`TabSeparated` 형식은 사용자 정의 프로그램과 스크립트를 사용하여 데이터를 처리하기에 편리합니다. HTTP 인터페이스와 커맨드라인 클라이언트의 배치 모드에서 기본적으로 사용됩니다. 이 형식은 서로 다른 DBMS 간에 데이터를 전송하는 것도 허용합니다. 예를 들어, MySQL에서 덤프를 가져와 ClickHouse에 업로드할 수 있습니다. 또는 그 반대도 가능합니다.

`TabSeparated` 형식은 총 값(위치에 WITH TOTALS 사용 시)과 최대, 최소 값(‘extremes’가 1로 설정된 경우)을 출력하는 것을 지원합니다. 이 경우, 총 값과 최대, 최소 값은 주 데이터 뒤에 출력됩니다. 주요 결과, 총 값, 최대 및 최소 값은 서로 빈 줄로 구분됩니다. 예:

```sql
SELECT EventDate, count() AS c FROM test.hits GROUP BY EventDate WITH TOTALS ORDER BY EventDate FORMAT TabSeparated

2014-03-17      1406958
2014-03-18      1383658
2014-03-19      1405797
2014-03-20      1353623
2014-03-21      1245779
2014-03-22      1031592
2014-03-23      1046491

1970-01-01      8873898

2014-03-17      1031592
2014-03-23      1406958
```

## Data formatting {#tabseparated-data-formatting}

정수는 10진수 형태로 작성됩니다. 숫자는 시작 부분에 추가적인 "+" 기호를 포함할 수 있으며, 이는 파싱 시 무시되며 포맷팅 시 기록되지 않습니다. 음수가 아닌 숫자는 음수 기호를 포함할 수 없습니다. 읽기 시 빈 문자열을 0으로 파싱하거나(부호가 있는 유형의 경우) 음수 기호만 포함된 문자열을 0으로 파싱하는 것이 허용됩니다. 해당 데이터 유형에 맞지 않는 숫자는 오류 메시지 없이 다른 숫자로 파싱될 수 있습니다.

부동 소수점 숫자는 10진수 형태로 작성됩니다. 점은 소수 구분자로 사용됩니다. 지수 표기법도 지원하며, 'inf', '+inf', '-inf', 'nan'도 지원됩니다. 부동 소수점 숫자는 소수점으로 시작하거나 끝날 수 있습니다.
포맷팅 시 부동 소수점 숫자에서는 정밀도가 손실될 수 있습니다.
파싱 시 가장 근처의 기계 표현 가능한 숫자만 읽는 것이 엄격하게 요구되지 않습니다.

날짜는 YYYY-MM-DD 형식으로 작성되며 동일한 형식으로 파싱됩니다. 그러나 구분자는 어떤 문자라도 사용할 수 있습니다.
시간이 포함된 날짜는 `YYYY-MM-DD hh:mm:ss` 형식으로 작성되며 동일한 형식으로 파싱됩니다. 여기서도 구분자는 어떤 문자라도 사용할 수 있습니다.
모든 처리는 클라이언트 또는 서버가 데이터를 포맷할 때 시작하는 시스템 타임존에서 이루어집니다. 시간과 함께 제공된 날짜의 경우, 일광 절약 시간은 명시되지 않습니다. 따라서 덤프가 일광 절약 시간 중에 시간이 있는 경우, 덤프는 데이터와 일치하지 않으며, 파싱은 두 개의 시간 중 하나를 선택합니다.
읽기 작업 중에 잘못된 날짜와 시간이 포함된 날짜는 자연적으로 오버플로우로 또는 null 날짜 및 시간으로 파싱될 수 있으며, 오류 메시지는 나타나지 않습니다.

예외적으로, 날짜와 시간이 Unix 타임스탬프 형식으로 파싱하는 것도 지원됩니다. 이 형식은 정확히 10개의 10진수로 구성되어야 합니다. 결과는 시간대에 의존하지 않습니다. 형식 `YYYY-MM-DD hh:mm:ss`와 `NNNNNNNNNN`은 자동으로 구분됩니다.

문자열은 백슬래시 이스케이프된 특수 문자로 출력됩니다. 출력 시 다음 이스케이프 시퀀스가 사용됩니다: `\b`, `\f`, `\r`, `\n`, `\t`, `\0`, `\'`, `\\`. 파싱 또한 이스케이프 시퀀스 `\a`, `\v`, 및 `\xHH` (16진수 이스케이프 시퀀스)와 모든 `\c` 시퀀스를 지원합니다. 여기서 `c`는 모든 문자입니다(이 시퀀스는 `c`로 변환됩니다). 따라서 데이터 읽기는 개행을 `\n` 또는 `\`, 또는 개행으로 쓸 수 있는 형식도 지원합니다. 예를 들어, 단어 사이에 공백 대신 개행이 있는 문자열 `Hello world`는 다음과 같은 변형 중 어느 것에서도 파싱될 수 있습니다:

```text
Hello\nworld

Hello\
world
```

두 번째 변형은 MySQL이 탭으로 구분된 덤프를 작성할 때 사용하므로 지원됩니다.

TabSeparated 형식으로 데이터를 전달할 때 이스케이프해야 하는 최소 문자 집합: 탭, 줄 바꿈(LF) 및 백슬래시입니다.

이스케이프되는 기호의 집합은 매우 제한적입니다. 출력 시 터미널이 망가뜨릴 수 있는 문자열 값을 우연히 발견할 수 있습니다.

배열은 대괄호 안에 쉼표로 구분된 값 목록으로 작성됩니다. 배열의 숫자 항목은 일반 형태로 포맷됩니다. `Date` 및 `DateTime` 유형은 단일 인용부호로 작성됩니다. 문자열은 단일 인용부호로 작성되며 위에서 설명한 이스케이프 규칙을 따릅니다.

[NULL](/sql-reference/syntax.md)는 설정 [format_tsv_null_representation](/operations/settings/settings-formats.md/#format_tsv_null_representation) (기본값은 `\N`)에 따라 포맷됩니다.

입력 데이터에서 ENUM 값은 이름 또는 id로 표현할 수 있습니다. 먼저 입력 값을 ENUM 이름과 매칭해 보려 합니다. 이 과정에서 실패하고 입력 값이 숫자라면, 이 숫자를 ENUM id와 매칭하려 합니다.
입력 데이터에 ENUM id만 포함된 경우, ENUM 파싱을 최적화하기 위해 설정 [input_format_tsv_enum_as_number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)를 활성화하는 것이 좋습니다.

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 구조의 각 요소는 배열로 표현됩니다.

예를 들어:

```sql
CREATE TABLE nestedt
(
    `id` UInt8,
    `aux` Nested(
        a UInt8,
        b String
    )
)
ENGINE = TinyLog
```
```sql
INSERT INTO nestedt VALUES ( 1, [1], ['a'])
```
```sql
SELECT * FROM nestedt FORMAT TSV
```

```response
1  [1]    ['a']
```

## Example usage {#example-usage}

### Inserting data {#inserting-data}

`football.tsv`라는 이름의 다음 tsv 파일을 사용하여:

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparated;
```

### Reading data {#reading-data}

`TabSeparated` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

출력은 탭으로 구분된 형식이 될 것입니다:

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

## Format settings {#format-settings}

| Setting                                                                                                                                                          | Description                                                                                                                                                                                                                                    | Default |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV 형식에서 사용자 정의 NULL 표현.                                                                                                                                                                                                       | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | TSV 입력에서 빈 필드를 기본값으로 처리합니다. 복잡한 기본 표현식을 위해 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)도 활성화되어야 합니다. | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | TSV 형식에서 삽입된 열거형 값을 열거형 인덱스로 처리합니다.                                                                                                                                                                              | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | TSV 형식에서 스키마를 추론하기 위해 일부 수정 및 휴리스틱을 사용합니다. 비활성화할 경우 모든 필드는 문자열로 추론됩니다.                                                                                                               | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | true로 설정하면 TSV 출력 형식의 줄 끝이 `\r\n`이 됩니다.                                                                                                                                                                               | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | true로 설정하면 TSV 입력 형식의 줄 끝이 `\r\n`이 됩니다.                                                                                                                                                                               | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | 데이터의 시작 부분에서 지정된 행 수를 건너뜁니다.                                                                                                                                                                                       | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | TSV 형식에서 이름 및 유형이 포함된 헤더를 자동으로 감지합니다.                                                                                                                                                                          | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | 데이터 끝에 있는 여분의 빈 행을 건너뜁니다.                                                                                                                                                                                                | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | TSV 형식에서 가변 열 수를 허용하고, 여분의 열을 무시하며 누락된 열에는 기본값을 사용합니다.                                                                                                                                                  | `false` |
