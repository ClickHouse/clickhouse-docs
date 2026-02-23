---
alias: []
description: 'Template 포맷에 대한 문서'
input_format: true
keywords: ['Template']
output_format: true
slug: /interfaces/formats/Template
title: 'Template'
doc_type: 'guide'
---

| 입력 | 출력 | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |



## Description \{#description\}

다른 표준 형식이 제공하는 것보다 더 세밀한 사용자 정의가 필요한 경우,
`Template` 형식을 사용하면 자리 표시자를 포함한 사용자 지정 형식 문자열과
데이터에 대한 이스케이프 규칙을 직접 지정할 수 있습니다.

다음 설정을 사용합니다:

| Setting                                                                                                  | Description                                                                                                                |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | 행에 대한 형식 문자열이 들어 있는 파일의 경로를 지정합니다.                                                                |
| [`format_template_resultset`](#format_template_resultset)                                                | 행에 대한 형식 문자열이 들어 있는 파일의 경로를 지정합니다.                                                                |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 행 사이의 구분자를 지정하며, 마지막 행을 제외한 각 행 뒤에 출력(또는 예상)되는 구분자입니다 (`\n`가 기본값).              |
| `format_template_row_format`                                                                             | 행에 대한 형식 문자열을 [인라인](#inline_specification)으로 지정합니다.                                                    |                                                                           
| `format_template_resultset_format`                                                                       | 결과 집합 형식 문자열을 [인라인](#inline_specification)으로 지정합니다.                                                    |
| 다른 형식의 일부 설정 (예: `JSON` escaping을 사용할 때 `output_format_json_quote_64bit_integers`)        |                                                                                                                            |



## 설정 및 이스케이프 규칙 \{#settings-and-escaping-rules\}

### format_template_row \{#format_template_row\}

`format_template_row` 설정은 다음 구문을 사용하는 행의 포맷 문자열이 포함된 파일의 경로를 지정합니다:

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

다음은 각 항목의 의미입니다.

| 구문 구성 요소        | 설명                                                 |
| --------------- | -------------------------------------------------- |
| `delimiter_i`   | 값 사이의 구분자 (`$` 기호는 `$$`로 이스케이프할 수 있습니다)            |
| `column_i`      | 선택하거나 삽입할 값이 있는 컬럼의 이름 또는 인덱스(비어 있으면 해당 컬럼은 건너뜁니다) |
| `serializeAs_i` | 컬럼 값에 적용할 이스케이프 규칙입니다.                             |

지원되는 이스케이프 규칙은 다음과 같습니다.

| 이스케이프 규칙             | 설명                         |
| -------------------- | -------------------------- |
| `CSV`, `JSON`, `XML` | 동일한 이름의 포맷과 유사합니다          |
| `Escaped`            | `TSV`와 유사합니다               |
| `Quoted`             | `Values`와 유사합니다            |
| `Raw`                | 이스케이프 없이, `TSVRaw`와 유사합니다  |
| `None`               | 이스케이프 규칙이 없습니다 - 아래 참고하십시오 |

:::note
이스케이프 규칙을 생략하면 `None`이 사용됩니다. `XML`은 출력에만 적합합니다.
:::

예제를 살펴보겠습니다. 다음과 같은 포맷 문자열이 있다고 가정합니다.

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

다음 값들은 각각 `SELECT`를 사용하는 경우에는 출력되고, `INPUT`을 사용하는 경우에는 입력으로 기대되며,
컬럼 `Search phrase:`, `, count:`, `, ad price: $` 및 `;` 구분자 사이에 위치합니다:

* `s` (이스케이프 규칙 `Quoted` 적용)
* `c` (이스케이프 규칙 `Escaped` 적용)
* `p` (이스케이프 규칙 `JSON` 적용)

예를 들어:

* `INSERT`를 수행하는 경우, 아래 줄은 예상되는 템플릿과 일치하며 값 `bathroom interior design`, `2166`, `$3`을(를) 컬럼 `Search phrase`, `count`, `ad price`로 읽어들입니다.
* `SELECT`를 수행하는 경우, 값 `bathroom interior design`, `2166`, `$3`이(가) 이미 테이블의 컬럼 `Search phrase`, `count`, `ad price`에 저장되어 있다고 가정하면, 아래와 같은 한 줄이 출력됩니다.

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter \{#format_template_rows_between_delimiter\}

`format_template_rows_between_delimiter` 설정은 행 사이의 구분자를 지정합니다. 이 구분자는 마지막 행을 제외한 모든 행 뒤에 출력되거나(또는 입력 시 기대되며), 기본값은 `\n`입니다.

### format_template_resultset \{#format_template_resultset\}

`format_template_resultset` 설정은 결과 집합에 대한 포맷 문자열을 포함하는 파일 경로를 지정합니다.

결과 집합에 대한 포맷 문자열은 각 행에 대한 포맷 문자열과 동일한 문법을 사용합니다.
이 설정을 사용하면 접두사(prefix), 접미사(suffix), 추가 정보를 출력하는 방식을 지정할 수 있으며, 컬럼 이름 대신 다음 플레이스홀더를 포함합니다:

* `data`는 `format_template_row` 형식의 데이터 행이며, `format_template_rows_between_delimiter`로 구분됩니다. 이 플레이스홀더는 포맷 문자열에서 첫 번째 플레이스홀더여야 합니다.
* `totals`는 `format_template_row` 형식의 총합 값이 담긴 행입니다(WITH TOTALS 사용 시).
* `min`는 `format_template_row` 형식의 최소값이 담긴 행입니다(extremes가 1로 설정된 경우).
* `max`는 `format_template_row` 형식의 최대값이 담긴 행입니다(extremes가 1로 설정된 경우).
* `rows`는 출력되는 전체 행 수입니다.
* `rows_before_limit`는 LIMIT이 없었을 때 존재했을 최소 행 수입니다. 쿼리에 LIMIT이 있는 경우에만 출력됩니다. 쿼리에 GROUP BY가 포함된 경우, rows&#95;before&#95;limit&#95;at&#95;least는 LIMIT이 없었을 때의 실제 행 수입니다.
* `time`은 요청 실행 시간(초)입니다.
* `rows_read`는 읽은 행 수입니다.
* `bytes_read`는 읽은 바이트 수(비압축)입니다.

`data`, `totals`, `min`, `max` 플레이스홀더에는 이스케이프 규칙을 지정하면 안 되며(또는 `None`을 명시적으로 지정해야 하며), 나머지 플레이스홀더에는 임의의 이스케이프 규칙을 지정할 수 있습니다.

:::note
`format_template_resultset` 설정이 빈 문자열이면, 기본값으로 `${data}`가 사용됩니다.
:::


insert 쿼리에서는 접두사(prefix)나 접미사(suffix)가 있는 경우(예시 참조) 일부 컬럼이나 필드를 생략하는 형식을 사용할 수 있습니다.

### In-line specification \{#inline_specification\}

종종 템플릿 형식에 대한 설정
(`format_template_row`, `format_template_resultset`로 설정되는)을 클러스터의 모든 노드에 있는 디렉터리에 배포하는 것이 어렵거나 불가능한 상황이 있습니다. 
또한 형식이 너무 단순하여 파일에 둘 필요가 없을 수도 있습니다.

이러한 경우에는 `format_template_row`에 대한 `format_template_row_format`과 `format_template_resultset`에 대한 `format_template_resultset_format`을 사용하여, 
해당 형식을 포함하는 파일 경로가 아니라 쿼리 안에서 직접 템플릿 문자열을 설정할 수 있습니다.

:::note
형식 문자열과 이스케이프 시퀀스에 대한 규칙은 다음과 동일합니다.
- `format_template_row_format`을 사용할 때는 [`format_template_row`](#format_template_row)의 규칙과 동일합니다.
- `format_template_resultset_format`을 사용할 때는 [`format_template_resultset`](#format_template_resultset)의 규칙과 동일합니다.
:::



## 사용 예 \{#example-usage\}

먼저 데이터를 조회하는 경우와 데이터를 삽입하는 경우, 이렇게 두 가지 예제를 통해 `Template` 포맷을 어떻게 사용할 수 있는지 살펴보겠습니다.

### 데이터 조회 \{#selecting-data\}

```sql
SELECT SearchPhrase, count() AS c FROM test.hits GROUP BY SearchPhrase ORDER BY c DESC LIMIT 5 FORMAT Template SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format', format_template_rows_between_delimiter = '\n    '
```

```text title="/some/path/resultset.format"
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    ${data}
  </table>
  <table border="1"> <caption>Max</caption>
    ${max}
  </table>
  <b>Processed ${rows_read:XML} rows in ${time:XML} sec</b>
 </body>
</html>
```

```text title="/some/path/row.format"
<tr> <td>${0:XML}</td> <td>${1:XML}</td> </tr>
```

결과:

```html
<!DOCTYPE HTML>
<html> <head> <title>Search phrases</title> </head>
 <body>
  <table border="1"> <caption>Search phrases</caption>
    <tr> <th>Search phrase</th> <th>Count</th> </tr>
    <tr> <td></td> <td>8267016</td> </tr>
    <tr> <td>bathroom interior design</td> <td>2166</td> </tr>
    <tr> <td>clickhouse</td> <td>1655</td> </tr>
    <tr> <td>spring 2014 fashion</td> <td>1549</td> </tr>
    <tr> <td>freeform photos</td> <td>1480</td> </tr>
  </table>
  <table border="1"> <caption>Max</caption>
    <tr> <td></td> <td>8873898</td> </tr>
  </table>
  <b>Processed 3095973 rows in 0.1569913 sec</b>
 </body>
</html>
```

### 데이터 삽입 \{#inserting-data\}

```text
Some header
Page views: 5, User id: 4324182021466249494, Useless field: hello, Duration: 146, Sign: -1
Page views: 6, User id: 4324182021466249494, Useless field: world, Duration: 185, Sign: 1
Total rows: 2
```

```sql
INSERT INTO UserActivity SETTINGS
format_template_resultset = '/some/path/resultset.format', format_template_row = '/some/path/row.format'
FORMAT Template
```

```text title="/some/path/resultset.format"
Some header\n${data}\nTotal rows: ${:CSV}\n
```

```text title="/some/path/row.format"
Page views: ${PageViews:CSV}, User id: ${UserID:CSV}, Useless field: ${:CSV}, Duration: ${Duration:CSV}, Sign: ${Sign:CSV}
```

`PageViews`, `UserID`, `Duration` 및 `Sign` 플레이스홀더는 테이블의 컬럼 이름을 나타냅니다. 행에서 `Useless field` 뒤에 오는 값과 접미사에서 `\nTotal rows:` 뒤에 오는 값은 무시됩니다.
입력 데이터의 모든 구분 기호는 지정된 포맷 문자열의 구분 기호와 정확히 동일해야 합니다.

### 인라인 지정 \{#in-line-specification\}

수동으로 마크다운 테이블을 포맷하는 일은 번거로울 수 있습니다. 이 예제에서는 `Template` 포맷과 인라인 지정 설정을 사용하여 간단한 작업을 수행하는 방법을 살펴봅니다. 이 작업은 `system.formats` 테이블에서 일부 ClickHouse 포맷의 이름을 `SELECT`로 조회한 다음, 이를 마크다운 테이블로 포맷하는 것입니다. 이는 `Template` 포맷과 `format_template_row_format`, `format_template_resultset_format` 설정을 사용하여 쉽게 수행할 수 있습니다.


이전 예제에서는 결과 집합(result-set)과 행(row) 포맷 문자열을 각각 별도의 파일에 지정하고, 그 파일들의 경로를 `format_template_resultset` 및 `format_template_row` 설정으로 지정했습니다. 여기서는 템플릿이 간단하여 마크다운 테이블을 만들기 위한 몇 개의 `|`와 `-`만 포함하므로 인라인으로 작성합니다. 결과 집합 템플릿 문자열은 `format_template_resultset_format` 설정을 사용하여 지정합니다. 테이블 헤더를 만들기 위해 `${data}` 앞에 `|ClickHouse Formats|\n|---|\n`를 추가했습니다. 행에 대해서는 `format_template_row_format` 설정을 사용하여 행 템플릿 문자열 ``|`{0:XML}`|``을 지정합니다. `Template` 포맷은 지정된 포맷으로 변환된 행들을 플레이스홀더 `${data}` 위치에 삽입합니다. 이 예시에서는 컬럼이 하나뿐이지만, 더 추가하려면 행 템플릿 문자열에 `{1:XML}`, `{2:XML}`... 등을 추가하면 되며, 적절한 이스케이프 규칙을 선택하면 됩니다. 이 예시에서는 `XML` 이스케이프 규칙을 사용했습니다.

```sql title="Query"
WITH formats AS
(
 SELECT * FROM system.formats
 ORDER BY rand()
 LIMIT 5
)
SELECT * FROM formats
FORMAT Template
SETTINGS
 format_template_row_format='|`${0:XML}`|',
 format_template_resultset_format='|ClickHouse Formats|\n|---|\n${data}\n'
```

보면 알 수 있듯이, 이제 그런 마크다운 테이블을 만들기 위해 `|`와 `-`를 일일이 직접 추가하는 수고를 덜 수 있습니다.

```response title="Response"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
