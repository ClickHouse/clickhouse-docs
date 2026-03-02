---
sidebar_label: '정규식과 Template'
sidebar_position: 3
slug: /integrations/data-formats/templates-regexp
title: 'ClickHouse에서 Template과 Regex를 사용하여 사용자 정의 텍스트 데이터 가져오기 및 내보내기'
description: 'ClickHouse에서 Template과 정규식(Regex)을 사용하여 사용자 정의 텍스트 데이터를 가져오고 내보내는 방법을 설명하는 페이지'
doc_type: 'guide'
keywords: ['데이터 포맷', 'Template', '정규식(Regex)', '사용자 정의 포맷', '파싱']
---

# ClickHouse에서 Template과 Regex를 사용하여 사용자 지정 텍스트 데이터 가져오기 및 내보내기 \{#importing-and-exporting-custom-text-data-using-templates-and-regex-in-clickhouse\}

사용자 지정 텍스트 형식의 데이터를 다뤄야 하는 경우가 자주 있습니다. 비표준 형식이거나, 잘못된 JSON, 손상된 CSV일 수도 있습니다. 이러한 경우 CSV 또는 JSON과 같은 표준 파서만으로는 모두 처리할 수 없습니다. 하지만 ClickHouse에는 강력한 Template 및 Regex 형식이 있어 이러한 상황에서도 데이터를 문제없이 처리할 수 있습니다.

## Template 기반으로 가져오기 \{#importing-based-on-a-template\}

다음 [로그 파일](assets/error.log)에서 데이터를 가져온다고 가정해 보겠습니다.

```bash
head error.log
```

```response
2023/01/15 14:51:17 [error]  client: 7.2.8.1, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/16 06:02:09 [error]  client: 8.4.2.7, server: example.com "GET /apple-touch-icon-120x120.png HTTP/1.1"
2023/01/15 13:46:13 [error]  client: 6.9.3.7, server: example.com "GET /apple-touch-icon.png HTTP/1.1"
2023/01/16 05:34:55 [error]  client: 9.9.7.6, server: example.com "GET /h5/static/cert/icon_yanzhengma.png HTTP/1.1"
```

이 데이터를 import하는 데 [Template](/interfaces/formats/Template) 형식을 사용할 수 있습니다. 입력 데이터의 각 행에 대해 값용 플레이스홀더를 포함한 템플릿 문자열을 정의해야 합니다.

```response
<time> [error] client: <ip>, server: <host> "<request>"
```

데이터를 가져올 테이블을 생성합니다:

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

지정된 Template를 사용하여 데이터를 가져오려면 Template 문자열을 파일에 저장해야 합니다. 여기서는 [row.template](assets/row.template) 파일에 저장합니다.

```response
${time:Escaped} [error]  client: ${ip:CSV}, server: ${host:CSV} ${request:JSON}
```

컬럼 이름과 이스케이프 규칙을 `${name:escaping}` 형식으로 정의합니다. 여기에는 CSV, JSON, Escaped, Quoted 등 여러 옵션을 사용할 수 있으며, 이 옵션들은 [각각에 해당하는 이스케이프 규칙](/interfaces/formats/Template)을 구현합니다.

이제 데이터를 가져올 때 `format_template_row` 설정 옵션의 인자로 이 파일을 사용할 수 있습니다 (*참고: 템플릿 파일과 데이터 파일의 끝에는 불필요한 `\n` 문자가 **있으면 안** 됩니다*):

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS format_template_row = 'row.template'
FORMAT Template
```

이제 데이터가 테이블에 적재되었는지 확인해 보겠습니다:

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


### 공백 건너뛰기 \{#skipping-whitespaces\}

템플릿 내 구분자 사이의 공백을 건너뛸 수 있게 해 주는 [TemplateIgnoreSpaces](/interfaces/formats/TemplateIgnoreSpaces) 사용을 고려하십시오:

```text
Template:               -->  "p1: ${p1:CSV}, p2: ${p2:CSV}"
TemplateIgnoreSpaces    -->  "p1:${p1:CSV}, p2:${p2:CSV}"
```


## 템플릿을 사용하여 데이터 내보내기 \{#exporting-data-using-templates\}

Template 포맷을 사용하면 데이터를 임의의 텍스트 형식으로도 내보낼 수 있습니다. 이 경우 두 개의 파일을 생성해야 합니다:

전체 결과 집합의 구조를 정의하는 [결과 세트 템플릿](assets/output.results):

```response
== Top 10 IPs ==
${data}
--- ${rows_read:XML} rows read in ${time:XML} ---
```

여기서 `rows_read`와 `time`은 각 요청마다 사용할 수 있는 시스템 메트릭입니다. `data`는 생성된 행을 나타내며(이 파일에서 `${data}`는 항상 첫 번째 플레이스홀더로 배치되어야 합니다), [**row template file**](assets/output.rows)에 정의된 템플릿을 기반으로 합니다:

```response
${ip:Escaped} generated ${total:Escaped} requests
```

이제 이러한 템플릿을 사용하여 다음 쿼리 결과를 내보내 보겠습니다.

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


### HTML 파일로 내보내기 \{#exporting-to-html-files\}

Template을 기반으로 한 결과는 [`INTO OUTFILE`](/sql-reference/statements/select/into-outfile.md) 절을 사용하여 파일로도 내보낼 수 있습니다. 주어진 [resultset](assets/html.results) 및 [row](assets/html.row) 형식을 사용해 HTML 파일을 생성해 보겠습니다:

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


### XML로 내보내기 \{#exporting-to-xml\}

Template 포맷은 XML을 포함하여 거의 모든 종류의 텍스트 포맷 파일을 생성하는 데 사용할 수 있습니다. 적절한 Template을 지정한 다음 내보내기를 수행하면 됩니다.

메타데이터를 포함한 표준 XML 결과가 필요하다면 [XML](/interfaces/formats/XML) 포맷을 사용하는 것도 고려하십시오.

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


## 정규식을 기반으로 데이터 가져오기 \{#importing-data-based-on-regular-expressions\}

[Regexp](/interfaces/formats/Regexp) 포맷은 입력 데이터를 더 복잡한 방식으로 파싱해야 하는 보다 정교한 경우에 사용됩니다. 이번에는 [error.log](assets/error.log) 예제 파일을 파싱하되, 파일 이름과 프로토콜을 추출하여 별도 컬럼으로 저장해 보겠습니다. 먼저 이를 위한 새 테이블을 준비합니다:

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

이제 정규식을 사용해 데이터를 가져올 수 있습니다:

```sql
INSERT INTO error_log FROM INFILE 'error.log'
SETTINGS
  format_regexp = '(.+?) \\[error\\]  client: (.+), server: (.+?) "GET .+?([^/]+\\.[^ ]+) (.+?)"'
FORMAT Regexp
```

ClickHouse는 각 캡처 그룹의 순서에 따라 해당 컬럼에 데이터를 삽입합니다. 이제 데이터를 확인해 보십시오.

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

기본적으로 ClickHouse는 일치하지 않는 행이 있으면 오류를 반환합니다. 일치하지 않는 행을 건너뛰려면 [format&#95;regexp&#95;skip&#95;unmatched](/operations/settings/settings-formats.md/#format_regexp_skip_unmatched) 옵션을 활성화하면 됩니다:

```sql
SET format_regexp_skip_unmatched = 1;
```


## 기타 포맷 \{#other-formats\}

ClickHouse는 다양한 사용 시나리오와 플랫폼을 지원하기 위해 텍스트 및 바이너리 등 여러 포맷을 제공합니다. 다음 문서에서 더 많은 포맷과 이를 다루는 방법을 살펴보십시오:

- [CSV 및 TSV 포맷](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON 포맷](/integrations/data-ingestion/data-formats/json/intro.md)
- **Regex 및 Template**
- [Native 및 바이너리 포맷](binary.md)
- [SQL 포맷](sql.md)

또한 [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)도 확인하십시오. ClickHouse 서버 없이 로컬/원격 파일을 완전한 기능으로 처리할 수 있는 휴대용 도구입니다.