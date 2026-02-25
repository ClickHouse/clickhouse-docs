---
sidebar_label: 'Vector'
sidebar_position: 220
slug: /integrations/vector
description: 'Vector를 사용하여 로그 파일을 tail하여 ClickHouse로 수집하는 방법'
title: 'Vector를 ClickHouse와 통합하기'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_ingestion'
  - website: 'https://vector.dev/'
keywords: ['vector', '로그 수집', '관측성', '데이터 수집', '파이프라인']
---

import Image from '@theme/IdealImage';
import vector01 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_01.png';
import vector02 from '@site/static/images/integrations/data-ingestion/etl-tools/vector_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Vector를 ClickHouse와 통합하기 \{#integrating-vector-with-clickhouse\}

<PartnerBadge />

프로덕션 애플리케이션에서는 로그를 실시간으로 분석할 수 있어야 합니다.
ClickHouse는 뛰어난 압축률(로그의 경우 최대 [170배](https://clickhouse.com/blog/log-compression-170x))과
대용량 데이터를 빠르게 집계하는 능력 덕분에 로그 데이터를 저장하고 분석하는 데 탁월합니다.

이 가이드에서는 인기 있는 데이터 파이프라인인 [Vector](https://vector.dev/docs/about/what-is-vector/)를 사용하여 Nginx 로그 파일을 tail 방식으로 읽고 ClickHouse로 전송하는 방법을 설명합니다.
아래 단계는 다른 종류의 로그 파일을 tail 방식으로 처리할 때에도 유사하게 적용됩니다.

**사전 준비 사항:**

* ClickHouse가 이미 실행 중이어야 합니다
* Vector가 설치되어 있어야 합니다

<VerticalStepper headerLevel="h2">
  ## 데이터베이스 및 테이블 생성하기 \{#1-create-a-database-and-table\}

  로그 이벤트를 저장할 테이블을 정의하세요:

  1. 먼저 `nginxdb`라는 이름의 새 데이터베이스를 생성하십시오:

  ```sql
  CREATE DATABASE IF NOT EXISTS nginxdb
  ```

  2. 전체 로그 이벤트를 하나의 문자열로 삽입합니다. 물론 이런 형식은 로그 데이터에 대한 분석을 수행하기에는 적합하지 않지만, 아래에서 ***materialized views***&#xB97C; 사용하여 이 문제를 해결합니다.

  ```sql
  CREATE TABLE IF NOT EXISTS  nginxdb.access_logs (
    message String
  )
  ENGINE = MergeTree()
  ORDER BY tuple()
  ```

  :::note
  **ORDER BY**는 아직 기본 키가 필요하지 않으므로 **tuple()** (빈 튜플)로 설정됩니다.
  :::

  ## Nginx 구성하기 \{#2--configure-nginx\}

  이 단계에서는 Nginx 로깅 구성 방법을 안내합니다.

  1. 다음 `access_log` 속성은 로그를 **combined** 형식으로 `/var/log/nginx/my_access.log`에 기록합니다.
     이 값은 `nginx.conf` 파일의 `http` 섹션에 설정합니다:

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

  2. `nginx.conf`를 수정했다면 Nginx를 반드시 다시 시작하십시오.

  3. 웹 서버의 여러 페이지를 방문하여 access 로그에 일부 로그 이벤트를 생성하십시오.
     **combined** 형식의 로그는 다음과 같은 형태입니다:

  ```bash
  192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
  192.168.208.1 - - [12/Oct/2021:03:31:44 +0000] "GET /favicon.ico HTTP/1.1" 404 555 "http://localhost/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
  192.168.208.1 - - [12/Oct/2021:03:31:49 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
  ```

  ## Vector 구성하기 \{#3-configure-vector\}

  Vector는 로그, 메트릭, 트레이스(**소스**라고 지칭됨)를 수집, 변환 및 라우팅하여 ClickHouse와의 기본 호환성을 포함한 다양한 벤더(**싱크**라고 지칭됨)로 전송합니다.
  소스와 싱크는 **vector.toml**이라는 이름의 구성 파일에 정의됩니다.

  1. 다음 **vector.toml** 파일은 **my&#95;access.log** 파일의 끝을 실시간으로 읽어들이는 **file** 타입의 **source**를 정의하고, 위에서 정의한 **access&#95;logs** 테이블을 **sink**로 지정합니다:

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

  2. 위 설정을 사용하여 Vector를 시작하십시오. 소스(source)와 싱크(sink)를 정의하는 방법에 대한 자세한 내용은 Vector [문서](https://vector.dev/docs/)를 참고하십시오.

  3. 다음 쿼리를 실행하여 액세스 로그가 ClickHouse에 정상적으로 삽입되는지 확인하십시오. 테이블에서 액세스 로그가 표시되어야 합니다:

  ```sql
  SELECT * FROM nginxdb.access_logs
  ```

  <Image img={vector01} size="lg" border alt="표 형식으로 ClickHouse 로그 조회" />

  ## 로그 파싱하기 \{#4-parse-the-logs\}

  ClickHouse에 로그를 저장하는 것은 유용하지만, 각 이벤트를 단일 문자열로 저장하면 데이터 분석이 제한됩니다.
  다음으로 [materialized view](/materialized-view/incremental-materialized-view)를 사용하여 로그 이벤트를 파싱하는 방법을 살펴보겠습니다.

  **Materialized view**는 SQL의 insert 트리거와 유사하게 작동합니다. 소스 테이블에 데이터 행이 삽입되면, materialized view가 해당 행을 변환하여 결과를 대상 테이블에 삽입합니다.
  Materialized view를 구성하여 **access&#95;logs**의 로그 이벤트를 파싱된 형태로 저장하도록 설정할 수 있습니다.
  이러한 로그 이벤트의 예시는 다음과 같습니다:

  ```bash
  192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"
  ```

  ClickHouse에는 위 문자열을 파싱할 수 있는 다양한 함수가 있습니다. [`splitByWhitespace`](/sql-reference/functions/splitting-merging-functions#splitByWhitespace) 함수는 공백을 기준으로 문자열을 파싱하여 각 토큰을 배열로 반환합니다.
  이를 확인하려면 다음 명령을 실행하세요:

  ```sql title="Query"
  SELECT splitByWhitespace('192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
  ```

  ```text title="Response"
  ["192.168.208.1","-","-","[12/Oct/2021:15:32:43","+0000]","\"GET","/","HTTP/1.1\"","304","0","\"-\"","\"Mozilla/5.0","(Macintosh;","Intel","Mac","OS","X","10_15_7)","AppleWebKit/537.36","(KHTML,","like","Gecko)","Chrome/93.0.4577.63","Safari/537.36\""]
  ```

  일부 문자열에는 추가 문자가 포함되어 있으며, 사용자 에이전트(브라우저 세부 정보)는 파싱할 필요가 없었지만,
  결과 배열은 필요한 형태에 근접합니다.

  `splitByWhitespace`와 유사하게, [`splitByRegexp`](/sql-reference/functions/splitting-merging-functions#splitByRegexp) 함수는 정규 표현식을 기반으로 문자열을 배열로 분할합니다.
  다음 명령을 실행하면 두 개의 문자열이 반환됩니다.

  ```sql
  SELECT splitByRegexp('\S \d+ "([^"]*)"', '192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36"')
  ```

  두 번째로 반환된 문자열은 로그에서 성공적으로 파싱된 user agent입니다:

  ```text
  ["192.168.208.1 - - [12/Oct/2021:15:32:43 +0000] \"GET / HTTP/1.1\" 30"," \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36\""]
  ```

  최종 `CREATE MATERIALIZED VIEW` 명령을 살펴보기 전에, 데이터 정리에 사용되는 몇 가지 함수를 더 확인하겠습니다.
  예를 들어, `RequestMethod`의 값이 `"GET`으로 되어 있어 불필요한 큰따옴표가 포함되어 있습니다.
  [`trimBoth` (별칭 `trim`)](/sql-reference/functions/string-functions#trimBoth) 함수를 사용하여 큰따옴표를 제거할 수 있습니다:

  ```sql
  SELECT trim(LEADING '"' FROM '"GET')
  ```

  시간 문자열 앞에 대괄호가 있으며, ClickHouse가 날짜로 파싱할 수 있는 형식도 아닙니다.
  하지만 구분자를 콜론(**:**)에서 쉼표(**,**)로 변경하면 파싱이 정상적으로 작동합니다:

  ```sql
  SELECT parseDateTimeBestEffort(replaceOne(trim(LEADING '[' FROM '[12/Oct/2021:15:32:43'), ':', ' '))
  ```

  이제 materialized view를 정의할 준비가 되었습니다.
  아래 정의에는 `POPULATE`가 포함되어 있으며, 이는 **access&#95;logs**에 있는 기존 행(row)들이 즉시 처리되어 삽입됨을 의미합니다.
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

  이제 정상적으로 작동하는지 확인하세요.
  액세스 로그가 컬럼으로 깔끔하게 파싱된 것을 확인할 수 있습니다:

  ```sql
  SELECT * FROM nginxdb.access_logs_view
  ```

  <Image img={vector02} size="lg" border alt="파싱된 ClickHouse 로그를 테이블 형식으로 확인하기" />

  :::note
  위의 예제에서는 데이터를 두 개의 테이블에 저장했지만, 초기 `nginxdb.access_logs` 테이블이 [`Null`](/engines/table-engines/special/null) 테이블 엔진을 사용하도록 변경할 수 있습니다.
  파싱된 데이터는 여전히 `nginxdb.access_logs_view` 테이블에 저장되지만, 원시 데이터는 테이블에 저장되지 않습니다.
  :::
</VerticalStepper>

> 간단히 설치하고 빠르게 설정할 수 있는 Vector를 사용하면 Nginx 서버에서 나오는 로그를 ClickHouse의 테이블로 전송할 수 있습니다. 구체화된 뷰(materialized view)를 사용하면 해당 로그를 컬럼으로 파싱하여 더 쉽게 분석할 수 있습니다.