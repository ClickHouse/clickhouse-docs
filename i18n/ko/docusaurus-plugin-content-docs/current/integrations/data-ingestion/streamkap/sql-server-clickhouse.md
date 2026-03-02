---
sidebar_label: 'ClickHouse용 SQL Server CDC'
sidebar_position: 13
keywords: ['clickhouse', 'Streamkap', 'CDC', 'sql server', 'connect', 'integrate', 'etl', 'data integration', 'change data capture']
slug: /integrations/data-ingestion/etl-tools/sql-server-clickhouse
description: '빠른 분석을 위해 SQL Server에서 ClickHouse로 데이터 스트리밍'
title: '빠른 분석을 위해 SQL Server에서 ClickHouse로 데이터 스트리밍'
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import image1 from '@site/static/images/integrations/data-ingestion/etl-tools/image1.png';
import image2 from '@site/static/images/integrations/data-ingestion/etl-tools/image2.png';
import image3 from '@site/static/images/integrations/data-ingestion/etl-tools/image3.png';


# 빠른 분석을 위한 SQL Server에서 ClickHouse로의 스트리밍: 단계별 가이드 \{#streaming-data-from-sql-server-to-clickhouse-for-fast-analytics-step-by-step-guide\}

이 문서에서는 SQL Server에서 ClickHouse로 데이터를 스트리밍하는 방법을 다루는 튜토리얼을 단계별로 설명합니다. ClickHouse는 내부 보고용 또는 고객 대시보드용 분석을 매우 빠르게 수행해야 할 때 이상적인 선택입니다. 두 데이터베이스를 설정하는 방법, 서로 연결하는 방법, 마지막으로 [Streamkap](https://streamkap.com)을 사용해 데이터를 스트리밍하는 방법까지 순서대로 살펴봅니다. 운영 업무는 SQL Server가 처리하지만, 분석을 위해 ClickHouse의 속도와 강력한 분석 기능이 필요한 경우라면, 이 가이드가 적합한 출발점입니다.

## 왜 SQL Server에서 ClickHouse로 데이터를 스트리밍해야 할까요? \{#why-stream-data-from-sql-server-to-clickhouse\}

이 문서를 보고 있다면 이미 그 한계를 체감하고 있을 가능성이 큽니다. SQL Server는 트랜잭션 처리에는 매우 안정적이지만, 무거운 실시간 분석 쿼리를 실행하도록 설계된 것은 아닙니다.

여기에서 ClickHouse가 진가를 발휘합니다. ClickHouse는 거대한 데이터셋에서도 매우 빠른 집계와 리포팅을 수행하도록 분석용으로 설계되었습니다. 따라서 트랜잭션 데이터를 ClickHouse로 전달하는 스트리밍 CDC 파이프라인을 구축하면, 운영, 프로덕트 팀, 고객 대시보드에 적합한 초고속 리포트를 실행할 수 있습니다.

일반적인 사용 사례:

- 프로덕션 애플리케이션이 느려지지 않도록 하는 내부 리포팅
- 빠르고 항상 최신 상태를 유지해야 하는 고객용 대시보드
- 사용자 활동 로그를 분석용으로 항상 최신 상태로 유지하기 위한 이벤트 스트리밍

## 시작하기 전에 필요한 사항 \{#what-youll-need-to-get-started\}

본격적으로 살펴보기 전에, 다음 항목들을 준비해 두어야 합니다:

### 사전 준비 사항 \{#prerequisites\}

- 실행 중인 SQL Server 인스턴스  

- 이 가이드에서는 AWS RDS for SQL Server를 사용하지만, 최신 SQL Server 인스턴스라면 어느 것이든 사용할 수 있습니다. [AWS SQL Server를 처음부터 설정하는 방법](https://streamkap.com/blog/how-to-stream-data-from-rds-sql-server-to-clickhouse-cloud-using-streamkap%23setting-up-a-new-rds-sql-server-from-scratch)
- ClickHouse 인스턴스  

- Self-hosted 또는 Cloud 환경. [ClickHouse를 처음부터 설정하는 방법](https://streamkap.com/blog/how-to-stream-data-from-rds-sql-server-to-clickhouse-cloud-using-streamkap%23creating-a-new-clickhouse-account)
- Streamkap  

- 이 도구가 데이터 스트리밍 파이프라인의 중추 역할을 합니다.

### 연결 정보 \{#connection-info\}

다음을 준비했는지 확인합니다:

- SQL Server 서버 주소, 포트, 사용자 이름, 비밀번호. Streamkap이 SQL Server 데이터베이스에 접근할 수 있도록 별도의 사용자와 역할을 생성하는 것을 권장합니다. [구성 방법은 문서를 참고하십시오.](https://www.google.com/url?q=https://docs.streamkap.com/docs/sql-server&sa=D&source=editors&ust=1760992472358213&usg=AOvVaw3jfocCF1VSijgsq1OCpZPj)
- ClickHouse 서버 주소, 포트, 사용자 이름, 비밀번호. ClickHouse의 IP 허용 목록은 어떤 서비스가 ClickHouse 데이터베이스에 연결할 수 있는지를 결정합니다. [여기 안내를 따르십시오.](https://www.google.com/url?q=https://docs.streamkap.com/docs/clickhouse&sa=D&source=editors&ust=1760992472359060&usg=AOvVaw3H1XqqwvqAso_TQPNBKEhD)
- 스트리밍할 테이블 — 우선은 하나의 테이블부터 시작하십시오.

## SQL Server를 소스로 설정하기 \{#setting-up-sql-server-as-a-source\}

본격적으로 시작합니다.

### 1단계: Streamkap에서 SQL Server 소스 생성하기 \{#step-1-creating-a-sql-server-source-in-streamkap\}

먼저 소스 연결을 설정합니다. 이 연결 설정을 통해 Streamkap은 어디에서 변경 사항을 가져올지 알게 됩니다.

다음과 같이 진행합니다.

1. Streamkap을 열고 Sources 섹션으로 이동합니다.
2. 새 Source를 생성합니다.

- 알아보기 쉬운 이름을 지정합니다 (예: sqlserver-demo-source).

3. SQL Server 연결 정보를 입력합니다.

- Host (예: your-db-instance.rds.amazonaws.com)
- Port (SQL Server의 기본 포트는 3306입니다)
- Username과 Password
- Database name

<Image img={image3} size="lg" />

#### 내부 동작 방식 \{#whats-happening-behind-the-scenes\}

<Image img={image1} size="lg" />

이 구성을 완료하면 Streamkap이 SQL Server에 연결하여 테이블을 자동으로 탐지합니다. 이 데모에서는 events나 transactions처럼 이미 데이터가 스트리밍되고 있는 테이블을 하나 선택합니다.

## ClickHouse 대상 생성 \{#creating-a-clickhouse-destination\}

이제 이 모든 데이터를 보내게 될 ClickHouse 대상을 설정합니다.

### 2단계: Streamkap에 ClickHouse 대상 추가하기 \{#step-2-add-a-clickhouse-destination-in-streamkap\}

소스 설정과 마찬가지로 ClickHouse 연결 정보를 사용하여 대상을 생성합니다.

#### 단계: \{#steps\}

1. Streamkap의 Destinations 석션으로 이동합니다.
2. 새 destination을 추가하고, destination 유형으로 ClickHouse를 선택합니다.
3. ClickHouse 정보를 입력합니다:

- Host
- Port(기본값은 9000)
- Username과 Password
- Database 이름

예시 스크린샷: Streamkap 대시보드에서 새 ClickHouse destination을 추가하는 화면입니다.

### Upsert 모드: 무엇인가요? \{#upsert-mode-what-is-that\}

중요한 단계입니다. ClickHouse의 「upsert」 모드를 사용하려 합니다. 이 모드는 내부적으로 ClickHouse의 ReplacingMergeTree 엔진을 사용합니다. 이를 통해 들어오는 레코드를 효율적으로 병합하고, 수집 이후의 업데이트를 처리할 수 있으며, ClickHouse에서 「part merging」이라고 부르는 방식을 활용합니다.

- 이를 통해 SQL Server 측에서 변경이 발생하더라도 대상 테이블이 중복 데이터로 가득 차지 않도록 할 수 있습니다.

### 스키마 변경 처리 \{#handling-schema-evolution\}

ClickHouse와 SQL Server는 항상 동일한 컬럼을 가지는 것은 아니며, 특히 애플리케이션이 운영 중이고 개발자가 수시로 컬럼을 계속 추가하는 경우에 그렇습니다.

- 좋은 소식: Streamkap은 기본적인 스키마 변경을 처리할 수 있습니다. 즉, SQL Server에 새 컬럼을 추가하면 ClickHouse 측에도 해당 컬럼이 반영됩니다.

대상 설정에서 「schema evolution」을 선택하십시오. 이후 필요에 따라 언제든지 이 설정을 조정할 수 있습니다.

## 스트리밍 파이프라인 구축 \{#building-the-streaming-pipeline\}

소스와 대상이 설정되었으므로, 이제 본격적으로 데이터를 스트리밍할 차례입니다.

### 3단계: Streamkap에서 파이프라인을 설정하기 \{#step-3-set-up-the-pipeline-in-streamkap\}

#### Pipeline Setup \{#pipeline-setup\}

1. Streamkap에서 Pipelines 탭으로 이동합니다.  

2. 새 파이프라인을 생성합니다.  

3. SQL Server 소스(sqlserver-demo-source)를 선택합니다.  

4. ClickHouse 대상(clickhouse-tutorial-destination)을 선택합니다.  

5. 스트리밍할 테이블을 선택합니다. 예를 들어 `events` 테이블이라고 가정합니다.  

6. Change Data Capture(변경 데이터 캡처, CDC)에 맞게 설정합니다.  

- 이번 실행에서는 신규 데이터만 스트리밍하도록 설정합니다(처음에는 백필(backfill)은 건너뛰고 CDC 이벤트에 집중해도 됩니다).

파이프라인 설정 화면 예시 — 소스, 대상, 테이블을 선택하는 화면.

#### 백필을 해야 할까요? \{#should-you-backfill\}

<Image img={image2} size="lg" />

다음과 같은 질문이 생길 수 있습니다. 예전 데이터를 백필해야 할까요?

많은 분석 사례에서는 지금 시점부터 발생하는 변경분을 스트리밍하는 것만으로도 충분하지만, 필요하다면 나중에 과거 데이터를 다시 불러와 적재할 수도 있습니다.

특별한 필요가 없다면, 일단은 「백필 안 함(don’t backfill)」을 선택하면 됩니다.

## 실제 스트리밍: 기대할 수 있는 것들 \{#streaming-in-action-what-to-expect\}

이제 파이프라인 구성이 완료되어 실행 중입니다!

### 4단계: 데이터 스트림 모니터링 \{#step-4-watch-the-data-stream\}

다음과 같은 일이 발생합니다.

* SQL Server의 소스 테이블에 새 데이터가 입력되면 Streamkap 파이프라인이 변경 내용을 캡처하여 ClickHouse로 전송합니다.
* ClickHouse는 ReplacingMergeTree와 파트 병합 덕분에 이러한 행을 수집하고, 업데이트를 병합합니다.
* 스키마도 함께 따라갑니다 — SQL Server에 컬럼을 추가하면 ClickHouse에도 동일하게 반영됩니다.

실시간으로 증가하는 행 개수를 보여주는 ClickHouse와 SQL Server의 라이브 대시보드 또는 로그를 확인할 수 있습니다.

SQL Server에 데이터가 들어올 때 ClickHouse의 행 수가 눈에 띄게 증가하는 것을 직접 확인할 수 있습니다.

```sql
-- Example: Checking rows in ClickHouse 
SELECT COUNT(*) FROM analytics.events; |
```

부하가 높은 상황에서는 어느 정도 지연이 발생할 수 있지만, 대부분의 사용 사례에서는 거의 실시간에 가까운 스트리밍으로 처리됩니다.


## 내부 동작: Streamkap은 실제로 무엇을 하는 것일까요? \{#under-the-hood-whats-streamkap-actually-doing\}

조금 더 자세한 내용을 설명하면 다음과 같습니다.

- Streamkap은 SQL Server의 바이너리 로그(복제에 사용되는 로그와 동일함)를 모니터링합니다.
- 테이블에서 행이 삽입, 업데이트, 삭제되면 즉시 Streamkap이 해당 이벤트를 포착합니다.
- 이 이벤트를 ClickHouse가 이해할 수 있는 형식으로 변환해 전송하여, 분석용 DB에 변경 사항을 즉시 반영합니다.

이는 단순한 ETL이 아니라, 실시간으로 스트리밍되는 완전한 변경 데이터 캡처(Change Data Capture, CDC)입니다.

## 고급 설정 \{#advanced-options\}

### Upsert 모드 vs. Insert 모드 \{#upsert-vs-insert-modes\}

모든 행을 단순히 삽입만 하는 방식(Insert 모드)과, 업데이트와 삭제까지 함께 반영되도록 하는 방식(Upsert 모드)은 어떤 차이가 있습니까?

- Insert 모드: 새로운 행은 모두 추가됩니다. 업데이트인 경우에도 그대로 추가되기 때문에 중복 데이터가 발생합니다.
- Upsert 모드: 기존 행에 대한 업데이트가 해당 행을 덮어써서 반영됩니다. 분석 데이터를 최신 상태로 정확하게 유지하는 데 훨씬 적합합니다.

### 스키마 변경 처리 \{#handling-schema-changes\}

애플리케이션이 변경되면 스키마도 함께 변경됩니다. 이 파이프라인에서는 다음과 같이 처리됩니다.

- 운영 테이블에 새로운 컬럼을 추가하는 경우  
  Streamkap이 이를 감지하여 ClickHouse 측에도 해당 컬럼을 추가합니다.
- 컬럼을 제거하는 경우  
  설정에 따라 마이그레이션이 필요할 수 있지만, 대부분의 컬럼 추가 작업은 별다른 문제 없이 처리됩니다.

## 실제 운영 환경 모니터링: 파이프라인 상태 모니터링 \{#real-world-monitoring-keeping-tabs-on-the-pipeline\}

### 파이프라인 상태 확인 \{#checking-pipeline-health\}

Streamkap은 다음을 확인할 수 있는 대시보드를 제공합니다.

- 파이프라인 지연 확인(데이터가 얼마나 최신인지)
- 행 개수와 처리량 모니터링
- 이상 발생 시 알림 수신

대시보드 예시: 지연 시간 그래프, 행 개수, 상태 지표.

### 모니터링해야 할 주요 메트릭 \{#common-metrics-to-watch\}

- Lag: ClickHouse가 SQL Server보다 얼마나 뒤처져 있는지
- Throughput: 초당 행 수
- Error Rate: 0에 매우 가까워야 함

## 실서비스 단계: ClickHouse에서 쿼리 실행하기 \{#going-live-querying-clickhouse\}

이제 데이터가 ClickHouse에 적재되었으므로, 다양한 고성능 분석 도구를 활용해 쿼리를 실행할 수 있습니다. 기본 예시는 다음과 같습니다:

```sql
-- See top 10 active users in the last hour
SELECT user\_id, COUNT(*) AS actionsFROM analytics.eventsWHERE event\_time >= now() - INTERVAL 1 HOURGROUP BY user\_idORDER BY actions DESCLIMIT 10;
```

ClickHouse를 Grafana, Superset, Redash와 같은 대시보드 도구와 연동하여 완전한 기능의 리포팅을 구현할 수 있습니다.


## 다음 단계 및 심화 학습 \{#next-steps-and-deep-dives\}

이 가이드는 할 수 있는 작업의 극히 일부만 다룹니다. 기본을 익혔다면, 다음 내용을 계속 살펴보십시오:

- 필터링된 스트림을 설정하여 일부 테이블/컬럼만 동기화
- 여러 소스를 하나의 분석용 DB로 스트리밍
- S3/데이터 레이크와 결합하여 콜드 스토리지 구성
- 테이블 변경 시 스키마 마이그레이션 자동화
- SSL 및 방화벽 규칙으로 파이프라인 보안 강화

보다 심층적인 가이드는 [Streamkap blog](https://streamkap.com/blog)을 계속해서 참고하십시오.

## FAQ 및 문제 해결 \{#faq-and-troubleshooting\}

Q: 클라우드 데이터베이스에서도 동작합니까?  
A: 네, 가능합니다! 이 예제에서는 AWS RDS를 사용했습니다. 적절한 포트를 열어 두었는지만 확인하면 됩니다.

Q: 성능은 어떻습니까?  
A: ClickHouse는 매우 빠릅니다. 병목 구간은 보통 네트워크나 소스 DB의 binlog 속도지만, 대부분의 경우 지연 시간은 1초 미만입니다.

Q: 삭제 작업도 처리할 수 있습니까?  
A: 물론입니다. upsert 모드에서는 삭제 작업도 플래그로 표시되어 ClickHouse에서도 처리됩니다.

## 마무리 \{#wrapping-up\}

이제 Streamkap을 사용해 SQL Server 데이터를 ClickHouse로 스트리밍하는 전체 과정을 살펴보았습니다. 이 방식은 빠르고 유연하며, 운영 데이터베이스에 부담을 주지 않으면서 최신 분석이 필요한 팀에 적합합니다.

직접 시도해 보시겠습니까?  
[Sign up page](https://app.streamkap.com/account/sign-up)로 이동하여 다음과 같은 주제를 추가로 다루기를 원하시는지 알려주십시오.

- Upsert와 Insert 비교 및 각각의 상세 동작
- 엔드 투 엔드 지연 시간: 최종 분석 VIEW를 얼마나 빨리 얻을 수 있는지
- 성능 튜닝과 처리량
- 이 스택을 기반으로 구현하는 실제 대시보드 사례

읽어 주셔서 감사합니다. 성공적인 스트리밍을 기원합니다.