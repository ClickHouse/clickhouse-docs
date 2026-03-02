---
alias: ['TSV']
description: 'TSV 형식에 대한 문서'
input_format: true
keywords: ['TabSeparated', 'TSV']
output_format: true
slug: /interfaces/formats/TabSeparated
title: 'TabSeparated'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭  |
|-------|--------|--------|
| ✔     | ✔      | `TSV`  |



## 설명 \{#description\}

TabSeparated 형식에서는 데이터가 행 단위로 기록됩니다. 각 행은 탭으로 구분된 값들로 구성됩니다. 각 값 뒤에는 행의 마지막 값을 제외하고 탭 문자가 오며, 행의 마지막 값 뒤에는 줄 바꿈(line feed)이 옵니다. 전체적으로 Unix 스타일의 줄 바꿈만을 가정합니다. 마지막 행 역시 끝에 줄 바꿈을 포함해야 합니다. 값은 따옴표로 둘러싸지 않은 텍스트 형식으로 기록되며, 특수 문자는 이스케이프 처리됩니다.

이 형식은 `TSV`라는 이름으로도 제공됩니다.

`TabSeparated` 형식은 사용자 정의 프로그램과 스크립트를 사용해 데이터를 처리하기에 편리합니다. HTTP 인터페이스에서 기본값으로 사용되며, 커맨드라인 클라이언트의 배치 모드에서도 사용됩니다. 이 형식은 서로 다른 DBMS 간에 데이터를 전송할 때도 사용할 수 있습니다. 예를 들어, MySQL에서 덤프를 받아 ClickHouse로 업로드하거나, 그 반대로도 할 수 있습니다.

`TabSeparated` 형식은 총합 값(WITH TOTALS 사용 시)과 극값(설정 값 &#39;extremes&#39;를 1로 설정한 경우) 출력도 지원합니다. 이러한 경우 총합 값과 극값은 기본 데이터 뒤에 출력됩니다. 기본 결과, 총합 값, 극값은 서로 빈 줄로 구분됩니다. 예시는 다음과 같습니다.

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


## 데이터 형식 지정 \{#tabseparated-data-formatting\}

정수는 10진수 형태로 작성됩니다. 숫자 앞에 추가로 &quot;+&quot; 문자를 포함할 수 있습니다(파싱 시에는 무시되며, 포매팅 시에는 기록되지 않습니다). 음수가 아닌 숫자에는 음수 기호를 포함할 수 없습니다. 읽을 때 빈 문자열을 0으로 파싱하는 것이 허용되며, (부호 있는 타입의 경우) 마이너스 기호 하나만으로 이루어진 문자열도 0으로 파싱하는 것이 허용됩니다. 해당 데이터 타입 범위를 벗어나는 숫자는 오류 메시지 없이 다른 숫자로 파싱될 수 있습니다.

부동 소수점 수는 10진수 형태로 작성됩니다. 소수 구분자는 점을 사용합니다. 지수 표기법과 &#39;inf&#39;, &#39;+inf&#39;, &#39;-inf&#39;, &#39;nan&#39;이 지원됩니다. 부동 소수점 수 표기는 소수점으로 시작하거나 끝날 수 있습니다.
포매팅 과정에서 부동 소수점 수의 정밀도가 손실될 수 있습니다.
파싱 과정에서, 가장 가까운 머신 표현 가능 수를 엄밀하게 읽어야 할 필요는 없습니다.

날짜는 YYYY-MM-DD 형식으로 작성되며, 같은 형식으로 파싱되지만 구분자는 어떤 문자든 사용할 수 있습니다.
시간이 포함된 날짜는 `YYYY-MM-DD hh:mm:ss` 형식으로 작성되며, 같은 형식으로 파싱되지만 구분자는 어떤 문자든 사용할 수 있습니다.
이는 모두 클라이언트 또는 서버(데이터를 포매팅하는 주체)가 시작될 때의 시스템 시간대를 기준으로 수행됩니다. 시간과 함께 있는 날짜의 경우, 일광 절약 시간제는 지정되지 않습니다. 따라서 덤프에 일광 절약 시간제 동안의 시간이 포함되어 있으면, 덤프는 데이터와 명확하게 일치하지 않으며, 파싱 시 두 시간 값 중 하나가 선택됩니다.
읽기 작업 동안 잘못된 날짜나 시간과 함께 있는 날짜는 오류 메시지 없이 자연스러운 오버플로우로 파싱되거나 null 날짜/시간으로 파싱될 수 있습니다.

예외적으로, 정확히 10자리 10진수로 구성된 경우 Unix 타임스탬프 형식으로 시간과 함께 있는 날짜를 파싱하는 것도 지원합니다. 결과는 시간대에 의존하지 않습니다. `YYYY-MM-DD hh:mm:ss` 형식과 `NNNNNNNNNN` 형식은 자동으로 구분됩니다.

문자열은 특수 문자가 백슬래시로 이스케이프된 상태로 출력됩니다. 출력 시 다음 이스케이프 시퀀스가 사용됩니다: `\b`, `\f`, `\r`, `\n`, `\t`, `\0`, `\'`, `\\`. 파싱에서는 `\a`, `\v`, `\xHH`(16진 이스케이프 시퀀스)와 임의의 `\c` 시퀀스(여기서 `c`는 아무 문자나 가능)를 추가로 지원하며, 이러한 시퀀스는 `c`로 변환됩니다. 따라서 데이터를 읽을 때 줄 바꿈 문자는 `\n` 또는 `\` 또는 실제 줄 바꿈 문자로 작성된 형식을 모두 지원합니다. 예를 들어, 공백 대신 단어 사이에 줄 바꿈이 들어간 문자열 `Hello world`는 다음과 같은 변형 중 어느 형태로든 파싱될 수 있습니다:

```text
Hello\nworld

Hello\
world
```

두 번째 형태는 MySQL이 탭으로 구분된 덤프를 쓸 때 이 방식을 사용하기 때문에 지원됩니다.

TabSeparated 형식으로 데이터를 전달할 때 이스케이프해야 하는 최소 문자 집합은 탭, 줄 바꿈(LF), 백슬래시입니다.

이스케이프되는 문자 집합은 매우 작습니다. 터미널 출력 시 깨질 수 있는 문자열 값을 쉽게 마주칠 수 있습니다.

배열(Array)은 대괄호 안에 쉼표로 구분된 값 목록으로 기록됩니다. 배열의 숫자 요소는 일반적인 방식으로 포맷됩니다. `Date` 및 `DateTime` 타입은 작은따옴표로 감싸서 기록합니다. 문자열은 위와 동일한 이스케이프 규칙을 사용하여 작은따옴표로 감싸서 기록합니다.

[NULL](/sql-reference/syntax.md)은 설정 [format&#95;tsv&#95;null&#95;representation](/operations/settings/settings-formats.md/#format_tsv_null_representation)에 따라 포맷됩니다(기본값은 `\N`).

입력 데이터에서 ENUM 값은 이름 또는 ID로 표현할 수 있습니다. 먼저 입력 값을 ENUM 이름과 매칭하려고 시도합니다. 실패하고 입력 값이 숫자인 경우, 이 숫자를 ENUM ID와 매칭하려고 시도합니다.
입력 데이터에 ENUM ID만 포함되는 경우 ENUM 파싱을 최적화하기 위해 설정 [input&#95;format&#95;tsv&#95;enum&#95;as&#95;number](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)를 활성화하는 것이 좋습니다.

[Nested](/sql-reference/data-types/nested-data-structures/index.md) 구조의 각 요소는 배열로 표현됩니다.

예를 들면 다음과 같습니다.

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


## 사용 예시 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음 내용의 tsv 파일인 `football.tsv`를 사용합니다:

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

데이터를 삽입하십시오:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparated;
```

### 데이터 읽기 \{#reading-data\}

`TabSeparated` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT TabSeparated
```

출력은 탭으로 구분된 형식으로 표시됩니다.

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


## Format settings \{#format-settings\}

| Setting                                                                                                                                                          | Description                                                                                                                                                                                                                                    | Default |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| [`format_tsv_null_representation`](/operations/settings/settings-formats.md/#format_tsv_null_representation)                                             | TSV 형식에서 NULL을 표현하는 사용자 지정 문자열입니다.                                                                                                                                                                                         | `\N`    |
| [`input_format_tsv_empty_as_default`](/operations/settings/settings-formats.md/#input_format_tsv_empty_as_default)                                       | TSV 입력에서 빈 필드를 기본값으로 처리합니다. 복잡한 기본값 표현식을 사용하려면 [input_format_defaults_for_omitted_fields](/operations/settings/settings-formats.md/#input_format_defaults_for_omitted_fields)도 활성화해야 합니다. | `false` |
| [`input_format_tsv_enum_as_number`](/operations/settings/settings-formats.md/#input_format_tsv_enum_as_number)                                           | TSV 형식에서 삽입된 Enum 값을 Enum 인덱스로 처리합니다.                                                                                                                                                                                       | `false` |
| [`input_format_tsv_use_best_effort_in_schema_inference`](/operations/settings/settings-formats.md/#input_format_tsv_use_best_effort_in_schema_inference) | TSV 형식에서 스키마를 추론하기 위해 일부 조정과 휴리스틱을 사용합니다. 비활성화된 경우 모든 필드는 String으로 추론됩니다.                                                                                                                     | `true`  |
| [`output_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#output_format_tsv_crlf_end_of_line)                                     | true로 설정되면 TSV 출력 형식에서 줄 끝이 `\n` 대신 `\r\n`이 됩니다.                                                                                                                                                                          | `false` |
| [`input_format_tsv_crlf_end_of_line`](/operations/settings/settings-formats.md/#input_format_tsv_crlf_end_of_line)                                       | true로 설정되면 TSV 입력 형식에서 줄 끝이 `\n` 대신 `\r\n`이 됩니다.                                                                                                                                                                           | `false` |
| [`input_format_tsv_skip_first_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines)                                       | 데이터의 시작 부분에서 지정된 개수만큼 줄을 건너뜁니다.                                                                                                                                                                                        | `0`     |
| [`input_format_tsv_detect_header`](/operations/settings/settings-formats.md/#input_format_tsv_detect_header)                                             | TSV 형식에서 이름과 타입이 포함된 헤더를 자동으로 감지합니다.                                                                                                                                                                                  | `true`  |
| [`input_format_tsv_skip_trailing_empty_lines`](/operations/settings/settings-formats.md/#input_format_tsv_skip_trailing_empty_lines)                     | 데이터 끝부분의 후행 빈 줄을 건너뜁니다.                                                                                                                                                                                                      | `false` |
| [`input_format_tsv_allow_variable_number_of_columns`](/operations/settings/settings-formats.md/#input_format_tsv_allow_variable_number_of_columns)       | TSV 형식에서 컬럼 개수를 가변적으로 허용하고, 추가 컬럼은 무시하며, 누락된 컬럼에는 기본값을 사용합니다.                                                                                                                                       | `false` |
