---
'alias': []
'description': '템플릿 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'Template'
'output_format': true
'slug': '/interfaces/formats/Template'
'title': '템플릿'
'doc_type': 'guide'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Description {#description}

기본 형식보다 더 많은 사용자 정의가 필요한 경우, 
`Template` 형식은 사용자가 값에 대한 자리 표시자와 데이터에 대한 이스케이프 규칙을 사용하여 자신만의 사용자 정의 형식 문자열을 지정할 수 있도록 합니다.

다음 설정을 사용합니다:

| Setting                                                                                                  | Description                                                                                                                |
|----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| [`format_template_row`](#format_template_row)                                                            | 행에 대한 포맷 문자열이 포함된 파일의 경로를 지정합니다.                                                             |
| [`format_template_resultset`](#format_template_resultset)                                                | 결과 집합에 대한 포맷 문자열이 포함된 파일의 경로를 지정합니다.                                                       |
| [`format_template_rows_between_delimiter`](#format_template_rows_between_delimiter)                      | 마지막 행을 제외한 각 행 뒤에 인쇄(또는 기대)되는 행 사이의 구분 기호를 지정합니다 (`\n` 기본값)                      |
| `format_template_row_format`                                                                             | 행에 대한 포맷 문자열을 지정합니다 [인라인](#inline_specification).                                                  |                                                                           
| `format_template_resultset_format`                                                                       | 결과 집합 포맷 문자열을 지정합니다 [인라인](#inline_specification).                                                    |
| 기타 형식의 일부 설정 (예: `output_format_json_quote_64bit_integers`를 사용할 때 `JSON` 이스케이핑) |                                                                                                                            |

## Settings and escaping rules {#settings-and-escaping-rules}

### format_template_row {#format_template_row}

설정 `format_template_row`는 다음 구문을 사용하여 행에 대한 포맷 문자열이 포함된 파일의 경로를 지정합니다:

```text
delimiter_1${column_1:serializeAs_1}delimiter_2${column_2:serializeAs_2} ... delimiter_N
```

어디서:

| Part of syntax | Description                                                                                                       |
|----------------|-------------------------------------------------------------------------------------------------------------------|
| `delimiter_i`  | 값 사이의 구분 기호 (`$` 기호는 `$$`로 이스케이프할 수 있습니다)                                                |
| `column_i`     | 선택되거나 삽입될 값의 컬럼 이름 또는 인덱스 (비어 있으면 해당 컬럼은 건너뛰게 됩니다)                           |
| `serializeAs_i` | 컬럼 값에 대한 이스케이프 규칙.                                                                                |

다음 이스케이프 규칙이 지원됩니다:

| Escaping Rule        | Description                              |
|----------------------|------------------------------------------|
| `CSV`, `JSON`, `XML` | 동일 이름 형식과 유사 |
| `Escaped`            | `TSV`와 유사                         |
| `Quoted`             | `Values`와 유사                      |
| `Raw`                | 이스케이프 없이, `TSVRaw`와 유사    |   
| `None`               | 이스케이프 규칙 없음 - 아래 참고     |

:::note
이스케이프 규칙이 생략되면 `None`이 사용됩니다. `XML`은 출력에만 적합합니다.
:::

예를 살펴보겠습니다. 다음 형식 문자열이 주어집니다:

```text
Search phrase: ${s:Quoted}, count: ${c:Escaped}, ad price: $$${p:JSON};
```

다음 값들이 각 컬럼 사이에서 인쇄되거나 (사용 시 `SELECT`) 예상됩니다 (입력 사용 시):

- `s` (이스케이프 규칙 `Quoted` 사용)
- `c` (이스케이프 규칙 `Escaped` 사용)
- `p` (이스케이프 규칙 `JSON` 사용)

예를 들어:

- `INSERT`하는 경우, 아래 줄은 예상 템플릿에 일치하며 `Search phrase`, `count`, `ad price` 컬럼에 `bathroom interior design`, `2166`, `$3` 값을 읽어옵니다.
- `SELECT`하는 경우, 아래 줄은 결과로 출력되며, `Search phrase`, `count`, `ad price` 컬럼에 이미 `bathroom interior design`, `2166`, `$3` 값이 저장되어 있다고 가정합니다.  

```yaml
Search phrase: 'bathroom interior design', count: 2166, ad price: $3;
```

### format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

설정 `format_template_rows_between_delimiter`는 행 사이의 구분 기호를 지정합니다. 이는 마지막 행을 제외한 각 행 뒤에 인쇄(또는 기대)됩니다 (`\n` 기본값).

### format_template_resultset {#format_template_resultset}

설정 `format_template_resultset`은 결과 집합에 대한 형식 문자열이 포함된 파일의 경로를 지정합니다.

결과 집합의 형식 문자열은 행에 대한 형식 문자열과 동일한 구문을 사용합니다. 
접두사, 접미사 및 추가 정보를 인쇄하는 방법을 지정할 수 있으며 다음 자리 표시자 대신 컬럼 이름을 포함합니다:

- `data`는 `format_template_row` 형식으로 데이터가 포함된 행으로, `format_template_rows_between_delimiter`로 구분됩니다. 이 자리 표시자는 형식 문자열에서 첫 번째 자리 표시자여야 합니다.
- `totals`는 `format_template_row` 형식으로 총 값이 포함된 행입니다 (위에서 TOTALS 사용 시).
- `min`은 `format_template_row` 형식으로 최소 값이 포함된 행입니다 (극값이 1로 설정된 경우).
- `max`는 `format_template_row` 형식으로 최대 값이 포함된 행입니다 (극값이 1로 설정된 경우).
- `rows`는 출력된 총 행 수입니다.
- `rows_before_limit`는 LIMIT이 없었을 경우의 최소 행 수입니다. LIMIT이 있는 쿼리에서만 출력됩니다. 쿼리에 GROUP BY가 포함된 경우, rows_before_limit_at_least는 LIMIT 없이 존재했을 정확한 행 수입니다.
- `time`은 요청 실행 시간을 초 단위로 나타냅니다.
- `rows_read`는 읽힌 행의 수입니다.
- `bytes_read`는 읽힌 (압축되지 않은) 바이트 수입니다.

자리 표시자 `data`, `totals`, `min` 및 `max`는 이스케이프 규칙을 지정할 수 없습니다 (또는 `None`이 명시적으로 지정되어야 합니다). 나머지 자리 표시자는 모든 이스케이프 규칙을 지정할 수 있습니다.

:::note
`format_template_resultset` 설정이 빈 문자열인 경우, 기본값으로 `${data}`가 사용됩니다.
:::

삽입 쿼리에서는 접두사나 접미사를 사용할 경우 일부 컬럼이나 필드를 건너뛰는 형식을 허용합니다 (예시 참조).

### In-line specification {#inline_specification}

종종 형식 구성을 배포하는 것은 어렵거나 불가능합니다 
(`format_template_row`, `format_template_resultset`에 의해 설정됨) 클러스터의 모든 노드에 대한 디렉토리로. 
또한, 형식이 매우 사소해서 파일에 배치할 필요가 없을 수 있습니다.

이 경우 `format_template_row_format` (for `format_template_row`) 및 `format_template_resultset_format` (for `format_template_resultset`)를 사용하여 형식 문자열을 쿼리 내에 직접 설정할 수 있습니다,  
형식을 포함하는 파일의 경로 대신에 말입니다.

:::note
형식 문자열 및 이스케이프 시퀀스에 대한 규칙은 다음과 동일합니다:
- [`format_template_row`](#format_template_row) 사용 시 `format_template_row_format`.
- [`format_template_resultset`](#format_template_resultset) 사용 시 `format_template_resultset_format`.
:::

## Example usage {#example-usage}

`Template` 형식을 사용하는 두 가지 예를 살펴보겠습니다. 첫 번째는 데이터 선택이고 두 번째는 데이터 삽입입니다.

### Selecting data {#selecting-data}

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

### Inserting data {#inserting-data}

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

`PageViews`, `UserID`, `Duration` 및 `Sign` 자리 표시자 내부는 테이블의 컬럼 이름입니다. `Useless field` 다음에 있는 값을 행에서, `\nTotal rows:` 다음에 있는 값을 접미사에서 무시합니다.
입력 데이터의 모든 구분 기호는 지정된 형식 문자열의 구분 기호와 정확히 동일해야 합니다.

### In-line specification {#in-line-specification}

마크다운 테이블을 수동으로 형식화하는 것이 지겹나요? 이 예에서는 `Template` 형식과 인라인 지정 설정을 사용하여 `system.formats` 테이블에서 일부 ClickHouse 형식의 이름을 `SELECT`하고 이를 마크다운 테이블로 형식화하는 방법을 보여줍니다. 이는 `Template` 형식과 설정 `format_template_row_format` 및 `format_template_resultset_format`를 사용하여 쉽게 달성할 수 있습니다.

이전 예제에서는 결과 집합 및 행 형식 문자열을 별도의 파일에 지정했으며, 해당 파일의 경로는 각각 `format_template_resultset` 및 `format_template_row` 설정을 사용하여 지정되었습니다. 여기서는 우리 템플릿이 아주 사소하므로, 인라인으로 진행합니다. 이 템플릿은 마크다운 테이블을 만드는 데 필요한 몇 개의 `|`와 `-`로만 구성되어 있습니다. 우리는 `format_template_resultset_format` 설정을 사용하여 결과 집합 템플릿 문자열을 지정합니다. 테이블 헤더를 만들기 위해 `${data}` 전에 `|ClickHouse Formats|\n|---|\n`을 추가했습니다. 우리는 설정 `format_template_row_format`을 사용하여 행에 대한 템플릿 문자열을 `` |`{0:XML}`| ``로 지정합니다. `Template` 형식은 주어진 형식으로 우리 행을 자리 표시자 `${data}`에 삽입합니다. 이 예에서는 단일 컬럼만 있지만, 더 추가하고 싶다면 `{1:XML}`, `{2:XML}`... 등을 행 템플릿 문자열에 추가하고 적절한 이스케이프 규칙을 선택하면 됩니다. 이 예에서는 이스케이프 규칙 `XML`을 선택했습니다. 

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

봐요! 우리는 마크다운 테이블을 만드는 모든 `|`와 `-`를 수동으로 추가하는 번거로움을 덜었습니다:

```response title="Response"
|ClickHouse Formats|
|---|
|`BSONEachRow`|
|`CustomSeparatedWithNames`|
|`Prometheus`|
|`DWARF`|
|`Avro`|
```
