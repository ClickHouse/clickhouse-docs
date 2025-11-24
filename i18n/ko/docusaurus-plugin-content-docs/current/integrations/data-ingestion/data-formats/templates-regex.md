---
'sidebar_label': '정규 표현식 및 템플릿'
'sidebar_position': 3
'slug': '/integrations/data-formats/templates-regexp'
'title': 'ClickHouse에서 템플릿과 정규식을 사용하여 사용자 정의 텍스트 데이터를 가져오고 내보내기'
'description': 'ClickHouse에서 템플릿과 정규식을 사용하여 사용자 정의 텍스트를 가져오고 내보내는 방법에 대한 페이지입니다.'
'doc_type': 'guide'
'keywords':
- 'data formats'
- 'templates'
- 'regex'
- 'custom formats'
- 'parsing'
---


# ClickHouse에서 템플릿 및 정규 표현식을 사용하여 사용자 지정 텍스트 데이터 가져오기 및 내보내기

우리는 종종 사용자 지정 텍스트 형식의 데이터로 작업해야 합니다. 비표준 형식이거나, 잘못된 JSON, 또는 깨진 CSV일 수 있습니다. CSV나 JSON과 같은 표준 파서는 이런 모든 경우에 작동하지 않을 수 있습니다. 그러나 ClickHouse는 강력한 템플릿 및 정규 표현식 형식으로 이 문제를 해결해줍니다.

## 템플릿을 기반으로 한 가져오기 {#importing-based-on-a-template}
다음 [로그 파일](assets/error.log)에서 데이터를 가져온다고 가정해 보겠습니다:

```bash
head error.log
```
```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

이 데이터를 가져오기 위해 [Template](/interfaces/formats/Template) 형식을 사용할 수 있습니다. 입력 데이터의 각 행에 대한 값 플레이스홀더가 포함된 템플릿 문자열을 정의해야 합니다:

```response
<time> [error] client: <ip>, server: <host> "<request>"
```

데이터를 가져올 테이블을 생성합시다:
```sql
CREATE TABLE error_log
(
    `time` DateTime,
    `ip` String,
    `host` String,
    `request` String
)
ENGINE = MergeTree
ORDER BY (host, request, time)
```

주어진 템플릿을 사용하여 데이터를 가져오기 위해서는 우리의 템플릿 문자열을 파일([row.template](assets/row.template)인 경우)로 저장해야 합니다:

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

`${name:escaping}` 형식으로 컬럼의 이름과 이스케이프 규칙을 정의합니다. 여기에는 CSV, JSON, Escaped, 또는 Quoted와 같은 여러 옵션이 있으며, 이는 [각각의 이스케이프 규칙](/interfaces/formats/Template)을 구현합니다.

이제 주어진 파일을 `format_template_row` 설정 옵션의 인수로 사용하여 데이터를 가져올 수 있습니다 (*참고, 템플릿과 데이터 파일 **마지막에** 추가적인 `\n` 기호가 **없어야** 합니다*):

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

그리고 데이터가 테이블에 로드되었는지 확인할 수 있습니다:

```sql
SELECT
    request,
    count(*)
FROM error_log
GROUP BY request
```
```response
┌─request──────────────────────────────────────────┬─count()─┐
│ GET /img/close.png HTTP/1.1                      │     176 │
│ GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1 │     172 │
│ GET /phone/images/icon_01.png HTTP/1.1           │     139 │
│ GET /apple-touch-icon-precomposed.png HTTP/1.1   │     161 │
│ GET /apple-touch-icon.png HTTP/1.1               │     162 │
│ GET /apple-touch-icon-120x120.png HTTP/1.1       │     190 │
└──────────────────────────────────────────────────┴─────────┘
```

### 공백 건너뛰기 {#skipping-whitespaces}
템플릿 내의 구분자 사이에서 공백을 건너뛸 수 있도록 허용하는 [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces)를 고려해 보십시오:
```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```

## 템플릿을 사용한 데이터 내보내기 {#exporting-data-using-templates}

또한 템플릿을 사용하여 데이터를 모든 텍스트 형식으로 내보낼 수 있습니다. 이 경우, 두 개의 파일을 생성해야 합니다:

전체 결과 집합을 정의하는 [결과 집합 템플릿](assets/output.results):

```response
== Top 10 IPs ==
${data}
--- ${rows_read:XML} rows read in ${time:XML} ---
```

여기서 `rows_read`와 `time`은 각 요청에 대해 사용할 수 있는 시스템 메트릭입니다. `data`는 생성된 행을 나타내며 (`${data}`는 이 파일에서 항상 첫 번째 플레이스홀더로 와야 함), [**행 템플릿 파일**](assets/output.rows)에서 정의된 템플릿을 기반으로 합니다:

```response
${ip:Escaped} generated ${total:Escaped} requests
```

이제 이 템플릿을 사용하여 다음 쿼리를 내보내 봅시다:

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
FORMAT Template SETTINGS format_template_resultset = 'output.results',
                         format_template_row = 'output.rows';

== Top 10 IPs ==

9.8.4.6 generated 3 requests
9.5.1.1 generated 3 requests
2.4.8.9 generated 3 requests
4.8.8.2 generated 3 requests
4.5.4.4 generated 3 requests
3.3.6.4 generated 2 requests
8.9.5.9 generated 2 requests
2.5.1.8 generated 2 requests
6.8.3.6 generated 2 requests
6.6.3.5 generated 2 requests

--- 1000 rows read in 0.001380604 ---
```

### HTML 파일로 내보내기 {#exporting-to-html-files}
템플릿 기반 결과는 [`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md) 절을 사용하여 파일로 내보낼 수도 있습니다. 주어진 [resultset](assets/html.results) 및 [row](assets/html.row) 형식을 기반으로 HTML 파일을 생성합시다:

```sql
SELECT
    ip,
    count() AS total
FROM error_log GROUP BY ip ORDER BY total DESC LIMIT 10
INTO OUTFILE 'out.html'
FORMAT Template
SETTINGS format_template_resultset = 'html.results',
         format_template_row = 'html.row'
```

### XML로 내보내기 {#exporting-to-xml}

템플릿 형식은 XML을 포함한 모든 상상 가능한 텍스트 형식 파일을 생성하는 데 사용할 수 있습니다. 관련 템플릿을 넣고 내보내기만 하면 됩니다.

또한 표준 XML 결과를 포함한 메타데이터를 얻기 위해 [XML](/interfaces/formats/XML) 형식을 사용하는 것도 고려하세요:

```sql
SELECT *
FROM error_log
LIMIT 3
FORMAT XML
```
```xml
<?xml version='1.0' encoding='UTF-8' ?>
<result>
        <meta>
                <columns>
                        <column>
                                <name>time</name>
                                <type>DateTime</type>
                        </column>
                        ...
                </columns>
        </meta>
        <data>
                <row>
                        <time>2023-01-15 13:00:01</time>
                        <ip>3.5.9.2</ip>
                        <host>example.com</host>
                        <request>GET /apple-touch-icon-120x120.png HTTP/1.1</request>
                </row>
                ...
        </data>
        <rows>3</rows>
        <rows_before_limit_at_least>1000</rows_before_limit_at_least>
        <statistics>
                <elapsed>0.000745001</elapsed>
                <rows_read>1000</rows_read>
                <bytes_read>88184</bytes_read>
        </statistics>
</result>

```

## 정규 표현식을 기반으로 한 데이터 가져오기 {#importing-data-based-on-regular-expressions}

[Regexp](/interfaces/formats/Regexp) 형식은 입력 데이터를 더 복잡한 방식으로 구문 분석해야 할 때 더 정교한 경우를 다룹니다. 이번에는 파일 이름과 프로토콜을 캡처하여 별도의 컬럼에 저장하기 위해 우리의 [error.log](assets/error.log) 예제 파일을 파싱해봅시다. 먼저, 이를 위해 새로운 테이블을 준비합시다:

```sql
CREATE TABLE error_log
(
    `time` DateTime,
    `ip` String,
    `host` String,
    `file` String,
    `protocol` String
)
ENGINE = MergeTree
ORDER BY (host, file, time)
```

이제 정규 표현식을 기반으로 데이터를 가져올 수 있습니다:

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse는 각 캡처 그룹에서 데이터를 적절한 컬럼에 순서에 따라 삽입합니다. 데이터를 확인해봅시다:

```sql
SELECT * FROM error_log LIMIT 5
```
```response
┌────────────────time─┬─ip──────┬─host────────┬─file─────────────────────────┬─protocol─┐
│ 2023-01-15 13:00:01 │ 3.5.9.2 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:01:40 │ 3.7.2.5 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:16:49 │ 9.2.9.2 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:21:38 │ 8.8.5.3 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
│ 2023-01-15 13:31:27 │ 9.5.8.4 │ example.com │ apple-touch-icon-120x120.png │ HTTP/1.1 │
└─────────────────────┴─────────┴─────────────┴──────────────────────────────┴──────────┘
```

기본적으로 ClickHouse는 일치하지 않는 행이 있는 경우 오류를 발생시킵니다. 대신 일치하지 않는 행을 건너뛰고 싶다면, [format_regexp_skip_unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched) 옵션을 사용하여 이를 활성화하십시오:

```sql
SET format_regexp_skip_unmatched = 1;
```

## 기타 형식 {#other-formats}

ClickHouse는 다양한 시나리오와 플랫폼을 포함하기 위해 많은 텍스트 및 이진 형식을 지원합니다. 다음 기사에서 더 많은 형식과 이를 다루는 방법을 탐색하십시오:

- [CSV 및 TSV 형식](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 형식](/integrations/data-ingestion/data-formats/json/intro.md)
- **정규 표현식 및 템플릿**
- [네이티브 및 이진 형식](binary.md)
- [SQL 형식](sql.md)

그리고 ClickHouse 서버 없이 로컬/원격 파일에서 작업할 수 있는 휴대용 풀 기능 도구인 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)도 확인해 보십시오.
