---
slug: /use-cases/observability/clickstack/integrations/cloudflare-logs
title: 'ClickStack으로 Cloudflare 로그 모니터링'
sidebar_label: 'Cloudflare 로그'
pagination_prev: null
pagination_next: null
description: 'S3에서 로그를 지속적으로 수집하기 위해 ClickPipes를 사용하여 Cloudflare Logpush 데이터를 ClickStack으로 수집합니다'
doc_type: 'guide'
keywords: ['Cloudflare', '로그', 'ClickStack', 'ClickPipes', 'S3', 'HTTP', 'Logpush']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clickpipe_s3 from '@site/static/images/clickstack/cloudflare/clickpipe-s3.png';
import continuous_ingestion from '@site/static/images/clickstack/cloudflare/continuous-ingestion.png';
import parse_information from '@site/static/images/clickstack/cloudflare/parse-information.png';
import add_source from '@site/static/images/clickstack/cloudflare/add-source.png';
import configure_optional from '@site/static/images/clickstack/cloudflare/configure-optional-fields.png';
import save_source from '@site/static/images/clickstack/cloudflare/save-source.png';
import search_view from '@site/static/images/clickstack/cloudflare/search-view.png';
import log_view from '@site/static/images/clickstack/cloudflare/log-view.png';
import import_dashboard from '@site/static/images/clickstack/cloudflare/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudflare/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudflare/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# ClickStack으로 Cloudflare 로그 모니터링 \{#cloudflare-clickstack\}

:::note[요약]
이 가이드에서는 ClickPipes를 사용해 Cloudflare 로그를 ClickStack으로 수집하는 방법을 설명합니다. Cloudflare Logpush는 로그를 S3에 기록하며, ClickPipes는 새 파일을 ClickHouse로 지속적으로 수집합니다. OpenTelemetry Collector를 사용하는 대부분의 ClickStack 통합 가이드와 달리, 이 가이드에서는 [ClickPipes](/integrations/clickpipes)를 사용해 S3에서 데이터를 직접 가져옵니다.

프로덕션 수집을 구성하기 전에 대시보드를 미리 살펴보고 싶다면 데모 데이터세트를 사용할 수 있습니다.
:::

## 개요 \{#overview\}

Cloudflare [Logpush](https://developers.cloudflare.com/logs/about/)는 HTTP 요청 로그를 Amazon S3와 같은 대상으로 내보냅니다. 이러한 로그를 ClickStack으로 전달하면 다음과 같은 작업이 가능합니다.

* 다른 관측성 데이터와 함께 엣지 트래픽, 캐시 성능, 보안 이벤트를 분석할 수 있습니다
* ClickHouse SQL을 사용해 로그를 쿼리할 수 있습니다
* Cloudflare의 기본 보존 기간보다 오래 로그를 보관할 수 있습니다

이 가이드에서는 [ClickPipes](/integrations/clickpipes)를 사용해 S3의 Cloudflare 로그 파일을 ClickHouse로 지속적으로 수집합니다. S3는 Cloudflare와 ClickHouse 사이에서 내구성 있는 버퍼 역할을 하며, exactly-once 시맨틱과 재생 기능을 제공합니다.

:::note[대안: 직접 HTTP 수집]
Cloudflare Logpush는 로그를 [HTTP 엔드포인트](https://developers.cloudflare.com/logs/get-started/enable-destinations/http/)로 직접 푸시하는 것도 지원합니다. Cloudflare는 줄바꿈으로 구분된 JSON(NDJSON) 형식으로 로그를 내보내고, ClickHouse는 `JSONEachRow`를 통해 이 형식을 기본 지원하므로, 다음 엔드포인트 URL 형식을 사용해 Logpush가 ClickHouse Cloud HTTP 인터페이스를 직접 가리키도록 구성할 수 있습니다.

```text
https://YOUR_CLICKHOUSE_HOST:8443/?query=INSERT+INTO+cloudflare_http_logs+FORMAT+JSONEachRow&header_Authorization=Basic+BASE64_CREDENTIALS
```

`YOUR_CLICKHOUSE_HOST`는 ClickHouse Cloud 호스트 이름으로, `BASE64_CREDENTIALS`는 Base64로 인코딩된 자격 증명(`echo -n 'default:YOUR_PASSWORD' | base64`)으로 바꾸십시오.

이 방법은 설정이 더 간단하며(S3, SQS 또는 IAM 구성이 필요 없음), Cloudflare Logpush는 전송에 실패하더라도 [과거 데이터를 백필할 수 없습니다](https://developers.cloudflare.com/logs/logpush/). 따라서 푸시 중 ClickHouse를 사용할 수 없으면 해당 로그는 영구적으로 손실됩니다.
:::

## 기존 Cloudflare Logpush 연동 \{#existing-cloudflare\}

이 섹션에서는 Cloudflare Logpush가 로그를 S3로 내보내도록 이미 구성되어 있다고 가정합니다. 아직 구성하지 않았다면 먼저 [Cloudflare의 AWS S3 설정 가이드](https://developers.cloudflare.com/logs/get-started/enable-destinations/aws-s3/)를 따르십시오.

### 사전 요구 사항 \{#prerequisites\}

* **ClickHouse Cloud 서비스**가 실행 중이어야 합니다(ClickPipes는 Cloud 전용 기능이므로 ClickStack OSS에서는 사용할 수 없습니다)
* Cloudflare Logpush가 S3 버킷에 로그를 지속적으로 기록하고 있어야 합니다
* Cloudflare가 로그를 기록하는 S3 버킷 이름과 리전

<VerticalStepper headerLevel="h4">
  #### S3 인증 설정 \{#configure-auth\}

  ClickPipes가 S3 버킷에서 데이터를 읽으려면 적절한 권한이 필요합니다. [S3 데이터에 안전하게 액세스하기](/docs/cloud/data-sources/secure-s3) 가이드를 참조하여 IAM 역할 기반 액세스 또는 자격 증명 기반 액세스를 구성하십시오.

  ClickPipes S3 인증 및 권한에 대한 자세한 내용은 [S3 ClickPipes 참조 문서](/docs/integrations/clickpipes/object-storage/s3/overview#access-control)를 참조하십시오.

  #### ClickPipes 작업 생성 \{#create-clickpipes\}

  1. ClickHouse Cloud Console → **데이터 소스** → **ClickPipe 생성**
  2. **소스**: Amazon S3

  <Image img={clickpipe_s3} alt="ClickPipe S3" />

  **연결:**

  * **S3 파일 경로**: 파일과 일치하도록 와일드카드를 포함한 Cloudflare 로그 버킷 경로입니다. Logpush에서 일별 하위 폴더를 활성화한 경우, 하위 디렉터리 전반에서 파일을 일치시키려면 `**`를 사용하십시오:
    * 하위 폴더 없음: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/*`
    * 날짜별 하위 폴더: `https://your-bucket.s3.us-east-1.amazonaws.com/logs/**/*`
  * **인증**: 인증 방법을 선택하고 자격 증명 또는 IAM Role ARN을 입력하십시오

  **수집 설정:**

  **Incoming data**를 클릭한 후 다음을 설정하십시오:

  * **지속적 수집**을 켜세요
  * **정렬**: 사전식 정렬

  <Image img={continuous_ingestion} alt="지속적인 수집" />

  Cloudflare Logpush는 날짜 기반 이름(예: `20250127/...`)으로 파일을 작성하며, 이는 자연스럽게 사전순(lexicographical) 순서를 따릅니다. ClickPipes는 30초마다 새 파일을 폴링하고, 마지막으로 처리된 파일보다 이름이 큰 파일을 수집합니다.

  **스키마 매핑:**

  **Parse information**을 클릭하십시오. ClickPipes가 로그 파일을 샘플링하여 스키마를 자동으로 감지합니다. 매핑된 컬럼을 검토하고 필요에 따라 유형을 조정하십시오. 대상 테이블의 **정렬 키(Sorting key)**를 정의하십시오. Cloudflare 로그의 경우 `(EdgeStartTimestamp, ClientCountry, EdgeResponseStatus)`가 적합한 선택입니다.

  <Image img={parse_information} alt="파싱 정보" />

  **Complete Setup**를 클릭하십시오.

  :::note
  처음 생성 시, ClickPipes는 지속적인 폴링으로 전환하기 전에 지정된 경로의 **모든 기존 파일**을 초기 로드합니다. 버킷에 Cloudflare 로그가 대량으로 누적되어 있는 경우, 이 초기 로드에 상당한 시간이 소요될 수 있습니다.
  :::

  #### HyperDX 데이터 소스 설정 \{#configure-source\}

  ClickPipes는 Cloudflare의 기본 필드 이름을 사용하여 Cloudflare 로그를 플랫 테이블로 수집합니다. HyperDX에서 이 로그를 확인하려면 Cloudflare 컬럼을 HyperDX의 로그 뷰에 매핑하는 사용자 정의 데이터 소스를 구성하십시오.

  1. HyperDX를 열고 **팀 설정** → **소스**로 이동합니다

  <Image img={add_source} alt="소스 추가" />

  2. **Add source**를 클릭하고 다음 설정을 구성하세요. 모든 필드를 보려면 **Configure Optional Fields**를 클릭하세요:

  <Image img={configure_optional} alt="선택 항목 구성" />

  | 설정             | 값                                                                                                                                                                                                                                                                                                                 |
  | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **이름**         | `Cloudflare Logs`                                                                                                                                                                                                                                                                                                 |
  | **소스 데이터 유형**  | 로그                                                                                                                                                                                                                                                                                                                |
  | **데이터베이스**     | `default`                                                                                                                                                                                                                                                                                                         |
  | **테이블**        | `cloudflare_http_logs`                                                                                                                                                                                                                                                                                            |
  | **타임스탬프 컬럼**   | `toDateTime(EdgeStartTimestamp / 1000000000)`                                                                                                                                                                                                                                                                     |
  | **기본 선택 항목**   | `EdgeStartTimestamp, ClientRequestMethod, ClientRequestURI, EdgeResponseStatus, ClientCountry`                                                                                                                                                                                                                    |
  | **서비스명 표현식**   | `'cloudflare'`                                                                                                                                                                                                                                                                                                    |
  | **로그 레벨 표현식**  | `multiIf(EdgeResponseStatus >= 500, 'ERROR', EdgeResponseStatus >= 400, 'WARN', 'INFO')`                                                                                                                                                                                                                          |
  | **본문 식**       | `concat(ClientRequestMethod, ' ', ClientRequestURI, ' ', toString(EdgeResponseStatus))`                                                                                                                                                                                                                           |
  | **로그 속성 표현식**  | `map('http.method', ClientRequestMethod, 'http.status_code', toString(EdgeResponseStatus), 'http.url', ClientRequestURI, 'client.country', ClientCountry, 'client.ip', ClientIP, 'cache.status', CacheCacheStatus, 'bot.score', toString(BotScore), 'cloudflare.ray_id', RayID, 'cloudflare.colo', EdgeColoCode)` |
  | **리소스 속성 표현식** | `map('cloudflare.zone', ClientRequestHost)`                                                                                                                                                                                                                                                                       |
  | **암시적 컬럼 식**   | `concat(ClientRequestMethod, ' ', ClientRequestURI)`                                                                                                                                                                                                                                                              |

  3. **Save Source**를 클릭하세요

  <Image img={save_source} alt="소스 저장" />

  이를 통해 Cloudflare의 기본 컬럼이 데이터 변환이나 중복 없이 HyperDX의 로그 뷰어에 직접 매핑됩니다. **Body**에는 `GET /api/v1/users 200`과 같은 요청 요약이 표시되며, 모든 Cloudflare 필드는 검색 가능한 속성으로 제공됩니다.

  #### HyperDX에서 데이터 확인 \{#verify-hyperdx\}

  **Search** 뷰로 이동하여 **Cloudflare Logs** 소스를 선택하십시오. 데이터가 포함된 시간 범위를 설정하십시오. 다음과 같은 로그 항목이 표시됩니다:

  * Body 컬럼의 요청 요약 정보(예: `GET /api/v1/users 200`)
  * HTTP 상태 코드에 따라 색상으로 구분된 심각도(INFO는 2xx, WARN은 4xx, ERROR는 5xx)
  * `http.status_code`, `client.country`, `cache.status`, `bot.score`와 같이 검색할 수 있는 속성

  <Image img={search_view} alt="검색 보기" />

  <Image img={log_view} alt="로그 뷰" />
</VerticalStepper>

## 데모 데이터셋 \{#demo-dataset\}

프로덕션용 Cloudflare Logpush를 구성하기 전에 통합을 테스트하려는 사용자를 위해, 실제와 유사한 HTTP 요청 로그가 포함된 샘플 데이터셋을 제공합니다.

<VerticalStepper headerLevel="h4">
  #### 데모 데이터셋으로 ClickPipes 시작하기 \{#start-demo\}

  1. ClickHouse Cloud Console → **Data Sources** → **Create ClickPipe**
  2. **Source**: Amazon S3
  3. **Authentication**: Public
  4. **S3 file path**: `https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/cloudflare/cloudflare-http-logs.json`
  5. **Incoming data**를 클릭합니다
  6. 형식으로 **JSON**을 선택합니다
  7. **Parse information**을 클릭하고 감지된 스키마를 검토합니다
  8. **Table name**을 `cloudflare_http_logs`로 설정합니다
  9. **Complete Setup**을 클릭합니다

  이 데이터셋에는 24시간에 걸친 5,000개의 HTTP 요청 로그 항목이 포함되어 있으며, 여러 국가의 트래픽, 캐시 적중 및 미적중, API 및 정적 에셋 요청, 오류 응답, 보안 이벤트 등 실제와 유사한 패턴이 반영되어 있습니다.

  #### HyperDX 데이터 소스 구성 \{#configure-demo-source\}

  [데이터 소스 구성 단계](#configure-source)를 따라 `cloudflare_http_logs` 테이블을 가리키는 HyperDX 소스를 생성하십시오. 프로덕션 통합 섹션에서 이미 소스를 구성했다면 이 단계는 필요하지 않습니다.

  #### 데모 데이터 확인 \{#verify-demo\}

  ```sql
  SELECT count() FROM cloudflare_http_logs;
  -- 5000을 반환해야 합니다
  ```

  HyperDX에서 **Search** 보기로 이동하여 **Cloudflare Logs** 소스를 선택한 다음, 시간 범위를 **2026-02-23 00:00:00 - 2026-02-26 00:00:00**으로 설정합니다.

  요청 요약, 검색 가능한 Cloudflare 속성, HTTP 상태 코드에 기반한 심각도 수준이 포함된 로그 항목이 표시되어야 합니다.

  <Image img={search_view} alt="검색 보기" />

  <Image img={log_view} alt="로그 보기" />

  :::note[시간대 표시]
  HyperDX는 사용 중인 브라우저의 로컬 시간대로 타임스탬프를 표시합니다. 데모 데이터는 **2026-02-24 00:00:00 - 2026-02-25 00:00:00 (UTC)** 범위에 걸쳐 있습니다. 넓은 시간 범위를 사용하면 위치와 관계없이 데모 로그를 확인할 수 있습니다. 로그가 표시되면 더 명확하게 시각화할 수 있도록 범위를 24시간으로 좁힐 수 있습니다.
  :::
</VerticalStepper>

## 대시보드 및 시각화 \{#dashboards\}

<VerticalStepper headerLevel="h4">
  #### <TrackedLink href={useBaseUrl('/examples/cloudflare-logs-dashboard.json')} download="cloudflare-logs-dashboard.json" eventName="docs.cloudflare_logs_monitoring.dashboard_download">다운로드</TrackedLink> 대시보드 구성 파일 \{#download\}

  #### 대시보드 가져오기 \{#import-dashboard\}

  1. HyperDX → **Dashboards** → **Import Dashboard**

  <Image img={import_dashboard} alt="대시보드 가져오기" />

  2. `cloudflare-logs-dashboard.json` 업로드 → **Finish Import**

  <Image img={finish_import} alt="대시보드 가져오기" />

  #### 대시보드 보기 \{#view-dashboard\}

  <Image img={example_dashboard} alt="예시 대시보드" />

  :::note
  데모 데이터세트의 경우 시간 범위를 **2026-02-24 00:00:00 - 2026-02-25 00:00:00 (UTC)**로 설정하십시오(로컬 시간대에 맞게 조정). 가져온 대시보드에는 기본적으로 시간 범위가 지정되어 있지 않습니다.
  :::
</VerticalStepper>

## 문제 해결 \{#troubleshooting\}

### ClickHouse에 데이터가 표시되지 않는 경우 \{#no-data\}

테이블이 생성되었고 데이터가 들어 있는지 확인하십시오:

```sql
SHOW TABLES FROM default LIKE 'cloudflare_http_logs';
SELECT count() FROM cloudflare_http_logs;
```

테이블이 존재하지만 비어 있다면 ClickPipes에서 오류를 확인하십시오: ClickHouse Cloud Console → **Data Sources** → 해당 ClickPipe → **Logs**. 비공개 버킷의 인증 문제는 [S3 ClickPipes access control documentation](/docs/integrations/clickpipes/object-storage/s3/overview#access-control)을 참조하십시오.

### HyperDX에 로그가 표시되지 않는 경우 \{#no-hyperdx\}

데이터가 ClickHouse에는 있지만 HyperDX에서 보이지 않는다면 데이터 소스 구성을 확인하십시오:

* HyperDX → **Team Settings** → **Sources**에서 `cloudflare_http_logs`용 소스가 있는지 확인하십시오
* **Timestamp Column**이 `toDateTime(EdgeStartTimestamp / 1000000000)`으로 설정되어 있는지 확인하십시오 — Cloudflare 타임스탬프는 나노초 단위이므로 변환해야 합니다
* HyperDX의 시간 범위에 데이터가 포함되어 있는지 확인하십시오. 데모 데이터세트의 경우 **2026-02-23 00:00:00 - 2026-02-26 00:00:00**을 사용하십시오

## 다음 단계 \{#next-steps\}

* 보안 이벤트(WAF 차단, 봇 트래픽 급증, 오류율 임계값)를 위한 [알림](/use-cases/observability/clickstack/alerts)을 설정하십시오
* 데이터 볼륨에 맞춰 [보존 정책](/use-cases/observability/clickstack/ttl)을 최적화하십시오
* 특정 사용 사례(API 성능, 캐시 최적화, 지역별 트래픽 분석)에 맞는 추가 대시보드를 생성하십시오

## 프로덕션 환경으로 전환하기 \{#going-to-production\}

이 가이드는 공개 데모 데이터세트를 사용해 Cloudflare 로그를 수집하는 방법을 보여줍니다. 프로덕션 배포에서는 Cloudflare Logpush가 자체 S3 버킷에 데이터를 기록하도록 구성하고, 안전한 액세스를 위해 [IAM role-based authentication](/docs/cloud/data-sources/secure-s3)을 사용해 ClickPipes를 설정하십시오. 스토리지 비용과 수집량을 줄이려면 필요한 [Logpush fields](https://developers.cloudflare.com/logs/logpush/logpush-job/datasets/zone/http_requests/)만 선택하십시오. 파일을 더 체계적으로 구성할 수 있도록 Logpush에서 일별 하위 폴더를 활성화하고, 하위 디렉터리 전체와 일치하도록 ClickPipes 경로 패턴에 `**/*`를 사용하십시오.

백필 및 순서가 뒤바뀐 파일 처리를 위한 [SQS-based unordered ingestion](/docs/integrations/clickpipes/object-storage/s3/overview#continuous-ingestion-any-order)을 비롯한 고급 구성 옵션은 [S3 ClickPipes documentation](/docs/integrations/clickpipes/object-storage/s3/overview)을 참조하십시오.