---
slug: /integrations/integration-development/building-integrations
title: 'ClickHouse 통합 개발하기'
sidebar_label: '통합 개발하기'
sidebar_position: 2
description: 'ClickHouse 통합을 위한 수집, 활용, wire 프로토콜 및 클라이언트 관례를 소개합니다.'
keywords: ['파트너', '통합', '수집', '활용', 'ClickPipes', '언어별 클라이언트', 'user-agent']
doc_type: 'guide'
---

# ClickHouse와의 통합 구축 \{#building-integrations-with-clickhouse\}

이 페이지에서는 통합 지점을 개괄적으로 설명하여 수집 및 활용 작업의 범위를 정할 수 있도록 안내합니다. 검증 및 게시와 관련해서는 [통합 테스트하기](/integrations/integration-development/testing-your-integration) 및 [통합 문서화하기](/integrations/integration-development/documenting-your-integration)를 참조하십시오.

## 수집 \{#ingestion\}

데이터를 ClickHouse로 가져오는 방법은 2가지입니다. 제품이 수집 계층을 직접 운영할지, 아니면 위임할지에 따라 선택하십시오.

### 경로 A: ClickPipes (관리형, ClickHouse Cloud 전용) \{#path-a-clickpipes\}

수집 인프라를 직접 구축하고 운영하지 않으려면, [ClickPipes](/integrations/clickpipes)는 고객의 소스에서 고객의 ClickHouse Cloud 서비스로 데이터를 가져오는 관리형 서비스입니다. ClickPipes는 스케일링, 병렬화, 재시도, 지연 보고를 처리합니다.

현재 지원되는 소스는 다음과 같습니다:

* **스트리밍:** Apache Kafka (MSK, Confluent Cloud, Redpanda, Azure Event Hubs, WarpStream 포함), Amazon Kinesis
* **객체 스토리지:** Amazon S3 (S3 호환 스토리지 포함), Google Cloud Storage, Azure Blob Storage
* **CDC:** PostgreSQL, MySQL, MongoDB, BigQuery

### 경로 B: 공식 언어 클라이언트를 통한 자체 수집 \{#path-b-language-client\}

파이프라인을 직접 운영한다면 [공식 언어 클라이언트](/integrations/language-clients) 중 하나를 사용하십시오. 이러한 클라이언트는 직렬화, 배칭, TLS, 압축, 연결 풀링을 처리합니다. 런타임의 기본 타입 값을 전달하면 클라이언트가 wire 형식을 처리합니다.

* 공식 클라이언트: Python, Go, Java, JavaScript, Rust, C#, C++
* 두 가지 wire 프로토콜: HTTP(모든 클라이언트) 및 네이티브 TCP(Go 및 C++ 클라이언트만)
* 인증: 기본적으로 TLS를 통한 사용자 이름 및 비밀번호 인증을 사용하며, mTLS 및 SSL 클라이언트 인증서 인증은 모든 주요 클라이언트에서 지원됩니다
* 데이터 포맷은 보통 구현 세부 사항입니다. 클라이언트는 런타임 타입을 ClickHouse Native 또는 RowBinary 포맷으로 변환합니다. 이미 Arrow, Parquet, JSONEachRow 또는 다른 포맷의 데이터를 생성하고 있다면 대부분의 클라이언트는 사전 직렬화된 데이터를 위한 원시 바이트 API를 제공합니다
* 처리량을 높이려면 **1만~10만 행**씩 배치하고, 동기식 삽입의 상한선으로 대략 **초당 1회 삽입**을 목표로 하십시오. 클라이언트 측 배칭이 현실적이지 않다면 [비동기 삽입](/optimize/asynchronous-inserts)을 사용하여 배칭을 서버로 넘기십시오

관련 항목: [대량 삽입](/optimize/bulk-inserts).

## 활용 \{#consumption\}

HTTP와 네이티브 TCP는 모두 쿼리를 전달합니다. 네이티브는 바이너리 프로토콜이므로 오버헤드가 더 낮습니다. HTTP는 로드 밸런서와 프록시를 통해서도 사용할 수 있습니다. 둘 다 동등하게 지원되므로 기능 차이가 아니라 인프라를 기준으로 선택하십시오.

* **애플리케이션 코드:** 수집용과 동일한 [공식 언어 클라이언트](/integrations/language-clients)를 사용하십시오
* **BI 및 SQL 도구:** ClickHouse는 공식 [JDBC v2 드라이버](/integrations/java) (Java)와 [ODBC 드라이버](/interfaces/odbc)를 제공합니다. Tableau, Looker, Power BI, Metabase, Apache Superset, Grafana는 이러한 드라이버나 ClickHouse 및 파트너가 유지 관리하는 전용 커넥터를 통해 연동됩니다
* **결과 포맷:** 일반적으로 클라이언트가 직렬화를 담당합니다. 제품에 필요하다면 전송 시 Arrow, Parquet 또는 기타 컬럼형 포맷을 요청할 수 있습니다

### 결과 세트 크기 조정 \{#result-set-sizing\}

대부분의 분석 쿼리는 작은 결과 세트(집계, 요약, 상위 N개)를 반환하므로, 전송 경로가 병목이 되는 경우는 드뭅니다. ClickHouse 테이블은 수십억 개의 행을 저장할 수 있으며, 대규모 팩트 테이블에 대해 제한 없는 `SELECT *`를 실행하면 테라바이트 단위의 데이터가 전송될 수 있습니다. **애플리케이션에서 요청 범위를 조정하십시오:** `LIMIT`, 페이지네이션, 스트리밍 읽기, 명시적인 컬럼 목록을 사용하십시오. 사용자 대상 분석 기능을 구축하는 경우, 제한 없는 결과 세트는 전송 문제가 아니라 UX 문제로 다루어야 합니다.

ClickHouse는 배열, 튜플, 맵, JSON, nested, LowCardinality 등을 포함한 풍부한 타입 시스템을 제공합니다. 공식 클라이언트는 이를 각 언어에서 자연스럽게 사용하는 타입으로 매핑합니다. 제품에서 ClickHouse 데이터를 최종 사용자에게 노출하는 경우, 타입 매핑 전략을 초기에 수립하십시오.

## 다음 단계 \{#next-steps\}

한 가지 방식을 선택해 [ClickHouse Cloud 체험판](https://clickhouse.com/cloud)으로 통합을 프로토타이핑한 다음, [파트너 포털](https://clickhouse.com/partners)에서 통합을 등록하십시오.

## User-agent 문자열 규약 \{#user-agent-string-convention\}

HTTP 클라이언트는 통합을 식별할 수 있는 `User-Agent` 문자열을 설정해야 합니다. ClickHouse는 이를 서버 측에서 분석하여 도입 현황을 추적하고, 사용 관련 telemetry를 파악하며, 로드맵 수립에 반영합니다.

포맷:

```text
<app_name>/<app_version> <client_name>/<client_version> (<comment>; <key1>: <value1>; <key2>: <value2>)
```

예시:

* `clickhouse-java/0.8.0`
* `my-analytics-app/3.1.2 clickhouse-js/1.2.0 (env: staging; region: us-east-1; lv: node/20.10)`

규칙:

* 클라이언트 이름이나 버전에는 공백을 넣을 수 없습니다
* 주석을 포함하는 경우, 반드시 맨 앞에 와야 합니다
* 표준 메타데이터 키: `lv` (언어 또는 프레임워크 버전), `os`, `arch`
* TCP 및 네이티브 프로토콜 클라이언트는 `User-Agent`가 아니라 프로토콜 필드를 통해 클라이언트 이름과 버전을 전달합니다

JDBC를 사용하는 경우, 드라이버가 `User-Agent` 및 관련 필드를 설정하는 방법은 [클라이언트 식별](/integrations/language-clients/java/jdbc#client-identification)을 참조하십시오.

## 샌드박스 및 평가판 이용 \{#sandbox-and-trial-access\}

[ClickHouse Cloud](https://clickhouse.com/cloud)는 개발 및 통합 검증을 위한 무료 평가판을 제공합니다. House Mate 파트너는 [파트너 포털](https://clickhouse.com/partners)을 통해 추가 개발 크레딧을 요청할 수 있습니다.