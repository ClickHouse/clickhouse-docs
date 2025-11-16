---
'sidebar_label': 'Vector'
'sidebar_position': 220
'slug': '/integrations/vector'
'description': 'Vector를 사용하여 ClickHouse로 로그 파일을 테일링하는 방법'
'title': 'ClickHouse와 Vector 통합'
'show_related_blogs': true
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_ingestion'
- 'website': 'https://vector.dev/'
'keywords':
- 'vector'
- 'log collection'
- 'observability'
- 'data ingestion'
- 'pipeline'
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# ClickHouse와 Vector 통합

<PartnerBadge/>

실시간으로 로그를 분석할 수 있는 능력은 프로덕션 애플리케이션에 있어 매우 중요합니다.  
ClickHouse는 우수한 압축 성능(로그의 경우 최대 [170배](https://clickhouse.com/blog/log-compression-170x))과 대량 데이터를 빠르게 집계할 수 있는 능력 덕분에 로그 데이터를 저장하고 분석하는 데 뛰어난 성능을 발휘합니다.

이 가이드는 인기 있는 데이터 파이프라인 [Vector](https://vector.dev/docs/about/what-is-vector/)를 사용하여 Nginx 로그 파일을 테일하고 ClickHouse에 전송하는 방법을 보여줍니다.  
아래 단계는 모든 타입의 로그 파일에 대해 유사합니다.

**사전 요구 사항:**
- ClickHouse가 이미 실행 중임
- Vector가 설치되어 있음

<VerticalStepper headerLevel="h2">

## 데이터베이스 및 테이블 생성 {#1-create-a-database-and-table}

로그 이벤트를 저장할 테이블을 정의합니다:

1. `nginxdb`라는 새 데이터베이스로 시작합니다:

```sql
CREATE DATABASE IF NOT EXISTS nginxdb
```

2. 전체 로그 이벤트를 단일 문자열로 삽입합니다. 명백하게도, 이는 로그 데이터에 대한 분석을 수행하는 데 좋은 형식은 아니지만, 아래에서 ***물리화된 뷰***를 사용하여 그 부분을 해결할 것입니다.

```sql
CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
  message String
)
ENGINE = MergeTree()
ORDER BY tuple()
```

:::note  
**ORDER BY**는 기본 키가 필요하지 않으므로 **tuple()**(빈 튜플)로 설정합니다.  
:::

## Nginx 구성 {#2--configure-nginx}

이 단계에서는 Nginx 로깅 구성을 설정하는 방법을 보여줍니다.

1. 다음 `access_log` 속성은 로그를 **combined** 형식으로 `/var/log/nginx/my_access.log`에 전송합니다.  
이 값은 `nginx.conf`의 `http` 섹션에 추가됩니다:

```bash
http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  access_log  /var/log/nginx/my_access.log combined;
  sendfile        on;
  keepalive_timeout  65;
  include /etc/nginx/conf.d/*.conf;
}
```

2. `nginx.conf`를 수정해야 하는 경우 Nginx를 재시작해야 합니다.

3. 웹 서버의 페이지를 방문하여 액세스 로그에 로그 이벤트를 생성합니다.  
**combined** 형식의 로그는 다음과 같이 표시됩니다:

```bash
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

## Vector 구성 {#3-configure-vector}

Vector는 로그, 메트릭 및 트레이스를 수집, 변환 및 라우팅(이를 **sources**라고 함)하여 ClickHouse와 같은 다양한 벤더(이를 **sinks**라고 함)에 전달합니다.  
소스와 싱크는 **vector.toml**이라는 구성 파일에 정의됩니다.

1. 아래의 **vector.toml** 파일은 **my_access.log**의 끝을 테일하는 **file** 타입의 **source**를 정의하며, 위에서 정의한 **access_logs** 테이블을 **sink**로 정의합니다:

```bash
[sources.nginx_logs]
type = "file"
include = [ "/var/log/nginx/my_access.log" ]
read_from = "end"

[sinks.clickhouse]
type = "clickhouse"
inputs = ["nginx_logs"]
endpoint = "http://clickhouse-server:8123"
database = "nginxdb"
table = "access_logs"
skip_unknown_fields = true
```

2. 위의 구성 파일을 사용하여 Vector를 시작합니다. 소스 및 싱크를 정의하는 방법에 대한 자세한 내용은 Vector [문서](https://vector.dev/docs/)를 참조하세요.

3. 아래 쿼리를 실행하여 액세스 로그가 ClickHouse에 삽입되고 있는지 확인합니다. 테이블에서 액세스 로그를 확인할 수 있어야 합니다:

```sql
SELECT * FROM nginxdb.access_logs
```

<Image img={vector01} size="lg" border alt="ClickHouse 로그를 테이블 형식으로 보기" />

## 로그 파싱 {#4-parse-the-logs}

ClickHouse에 로그가 저장되는 것은 훌륭하지만, 각 이벤트를 단일 문자열로 저장하는 것은 많은 데이터 분석을 용이하게 하지 않습니다.  
다음으로, [물리화된 뷰](/materialized-view/incremental-materialized-view)를 사용하여 로그 이벤트를 파싱하는 방법에 대해 살펴보겠습니다.

**물리화된 뷰**는 SQL의 삽입 트리거와 유사하게 작동합니다. 소스 테이블에 데이터 행이 삽입되면, 물리화된 뷰는 이들 행의 변형을 수행하고 결과를 대상 테이블에 삽입합니다.  
물리화된 뷰는 **access_logs**에서 로그 이벤트의 파싱된 표현을 구성하도록 설정할 수 있습니다. 아래에는 그러한 로그 이벤트의 예가 표시됩니다:

```bash
192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
```

ClickHouse에서는 위 문자열을 파싱하는 여러 함수가 있습니다. [`splitByWhitespace`](/sql-reference/functions/splitting-merging-functions#splitByWhitespace) 함수는 공백으로 문자열을 파싱하고 각 토큰을 배열로 반환합니다.  
이를 보여주기 위해 다음 명령을 실행합니다:

```sql title="Query"
SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

```text title="Response"
["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
```

몇 개의 문자열에는 추가 문자가 있어 사용자 에이전트(브라우저 세부정보)를 파싱할 필요가 없었지만,
결과 배열은 필요한 것과 가까운 상태입니다.

`splitByWhitespace`와 유사하게, [`splitByRegexp`](/sql-reference/functions/splitting-merging-functions#splitByRegexp) 함수는 정규 표현식에 따라 문자열을 배열로 분할합니다.  
다음 명령을 실행하면 두 개의 문자열이 반환됩니다.

```sql
SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
```

반환된 두 번째 문자열에는 로그에서 성공적으로 파싱된 사용자 에이전트가 포함되어 있습니다:

```text
["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
```

최종 `CREATE MATERIALIZED VIEW` 명령을 살펴보기 전에 데이터를 정리하는 데 사용되는 몇 가지 함수를 더 살펴보겠습니다.  
예를 들어, `RequestMethod`의 값은 `"GET`으로 원치 않는 따옴표가 포함되어 있습니다. 
[`trimBoth` (별칭 `trim`)](/sql-reference/functions/string-functions#trimBoth) 함수를 사용하여 따옴표를 제거할 수 있습니다:

```sql
SELECT trim(LEADING '"' FROM '"GET')
```

시간 문자열에는 선행 대괄호가 포함되어 있으며, ClickHouse가 날짜로 파싱할 수 있는 형식이 아닙니다.  
하지만 구분자를 콜론(**:**)에서 쉼표(**,**)로 변경하면 파싱이 잘 진행됩니다:

```sql
SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
```

이제 물리화된 뷰를 정의할 준비가 되었습니다.  
아래 정의에는 `POPULATE`가 포함되어 있어 기존의 행들이 **access_logs**에서 즉시 처리되고 삽입됩니다.  
다음 SQL 문을 실행하세요:

```sql
CREATE MATERIALIZED VIEW nginxdb.access_logs_view
(
  RemoteAddr String,
  Client String,
  RemoteUser String,
  TimeLocal DateTime,
  RequestMethod String,
  Request String,
  HttpVersion String,
  Status Int32,
  BytesSent Int64,
  UserAgent String
)
ENGINE = MergeTree()
ORDER BY RemoteAddr
POPULATE AS
WITH
  splitByWhitespace(message) as split,
  splitByRegexp('\S \d+ "([^"]*)"', message) as referer
SELECT
  split[1] AS RemoteAddr,
  split[2] AS Client,
  split[3] AS RemoteUser,
  parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM split[4]), ':', ' ')) AS TimeLocal,
  trim(LEADING '"' FROM split[6]) AS RequestMethod,
  split[7] AS Request,
  trim(TRAILING '"' FROM split[8]) AS HttpVersion,
  split[9] AS Status,
  split[10] AS BytesSent,
  trim(BOTH '"' from referer[2]) AS UserAgent
FROM
  (SELECT message FROM nginxdb.access_logs)
```

작동했는지 확인하십시오.  
액세스 로그가 열로 잘 파싱되어 있는 것을 볼 수 있어야 합니다:

```sql
SELECT * FROM nginxdb.access_logs_view
```

<Image img={vector02} size="lg" border alt="파싱된 ClickHouse 로그를 테이블 형식으로 보기" />

:::note  
위의 수업에서는 데이터를 두 개의 테이블에 저장했지만, 초기 `nginxdb.access_logs` 테이블을 [`Null`](/engines/table-engines/special/null) 테이블 엔진을 사용하도록 변경할 수 있습니다.  
파싱된 데이터는 여전히 `nginxdb.access_logs_view` 테이블에 저장되지만, 원시 데이터는 테이블에 저장되지 않습니다.  
:::

</VerticalStepper>

> Vector를 사용하면 간단한 설치와 빠른 구성이 요구되며, 이를 통해 Nginx 서버에서 ClickHouse의 테이블로 로그를 전송할 수 있습니다. 물리화된 뷰를 사용하면 이러한 로그를 열로 파싱하여 더 쉽게 분석할 수 있습니다.
