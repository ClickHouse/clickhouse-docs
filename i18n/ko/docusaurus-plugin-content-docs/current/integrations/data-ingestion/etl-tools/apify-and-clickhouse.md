---
sidebar_label: 'Apify'
keywords: ['apify', '웹 스크래핑', '데이터 수집', '액터', '데이터셋', '자동화', '웹훅']
slug: /integrations/apify
description: 'Apify의 웹 스크래핑 및 자동화 데이터를 ClickHouse로 로드합니다'
title: 'Apify를 ClickHouse에 연결'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
  - website: 'https://apify.com/'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

<CommunityMaintainedBadge />

[Apify](https://apify.com/)는 웹 스크래핑 및 자동화 플랫폼입니다. [**Actor**](https://docs.apify.com/platform/actors)라고 하는 서버리스 클라우드 프로그램을 구축, 실행, 확장할 수 있습니다. Actor는 웹사이트를 스크레이프하고, 웹을 크롤링하고, 데이터를 처리하거나, 워크플로를 자동화합니다. 각 Actor 실행은 [**데이터셋**](https://docs.apify.com/platform/storage/dataset)에 저장되는 구조화된 출력(JSON 객체 모음)을 생성합니다.

스크레이프하거나 처리한 데이터를 분석, 모니터링 또는 데이터 보강 파이프라인용으로 ClickHouse에 로드합니다.

## 핵심 개념 \{#key-concepts\}

| Apify 개념                                                             | 설명                                                                                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **[Actor](https://docs.apify.com/platform/actors)**                  | Apify 플랫폼에서 실행되는 서버리스 클라우드 프로그램입니다. [Apify Store](https://apify.com/store)에서는 바로 사용할 수 있는 수천 개의 Actor를 제공합니다.                       |
| **[Dataset](https://docs.apify.com/platform/storage/dataset)**       | Actor 실행 결과로 생성되는 출력입니다. [Apify API](https://docs.apify.com/api/v2)를 통해 JSON, CSV, XML 또는 기타 형식으로 가져올 수 있는, 테이블과 유사한 JSON 객체 모음입니다. |
| **[Webhook](https://docs.apify.com/platform/integrations/webhooks)** | Actor 실행이 성공하거나 실패했을 때 또는 기타 수명 주기 이벤트가 발생했을 때 트리거되는 이벤트 기반 HTTP 호출입니다. 웹훅을 사용해 Apify와 ClickHouse 간 파이프라인을 자동화하십시오.                 |

## 설정 가이드 \{#setup-guide\}

<VerticalStepper headerLevel="h3">
  ### ClickHouse 연결 정보 수집하기 \{#1-gather-your-connection-details\}

  <ConnectionDetails />

  ### Apify 사전 요구 사항 \{#2-apify-prerequisites\}

  다음 항목도 필요합니다:

  * [Apify 계정](https://console.apify.com/sign-up) (무료 티어 사용 가능)
  * [Apify API 토큰](https://docs.apify.com/platform/integrations/api#api-token) - [Apify Console](https://console.apify.com/)의 **Settings &gt; Integrations**에서 확인할 수 있습니다.
  * 로컬에 설치된 Node.js 18+ (JavaScript 예시용)

  ### 의존성 설치 \{#3-install-dependencies\}

  Apify JavaScript client와 ClickHouse JavaScript client를 설치하십시오:

  ```bash
  npm install apify-client @clickhouse/client
  ```

  :::note
  Apify는 [Python client](https://docs.apify.com/api/client/python)도 제공합니다. Python을 선호하는 경우 pip로 `apify-client`를 설치하고, ClickHouse에는 [clickhouse-connect](/integrations/python)를 사용하십시오.
  :::

  ### ClickHouse에 대상 테이블 생성하기 \{#4-create-a-target-table\}

  스크레이핑한 데이터를 저장할 테이블을 생성하십시오. schema는 사용하는 Actor에 따라 달라집니다. 이 예시에서는 제품 스크레이핑 Actor에 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)를 사용합니다:

  ```sql
  CREATE TABLE apify_products
  (
      url        String,
      title      String,
      price      Float64,
      currency   String,
      scraped_at DateTime DEFAULT now()
  )
  ENGINE = MergeTree()
  ORDER BY (scraped_at, url);
  ```

  ### Apify 데이터셋 가져와 ClickHouse에 로드하기 \{#5-fetch-and-load\}

  다음 스크립트는 Apify Actor 실행 결과를 가져와 ClickHouse에 삽입합니다:

  ```javascript
  import { ApifyClient } from 'apify-client';
  import { createClient } from '@clickhouse/client';

  // 클라이언트 초기화
  const apify = new ApifyClient({ token: 'YOUR_APIFY_API_TOKEN' });
  const clickhouse = createClient({
      url: 'https://YOUR_CLICKHOUSE_HOST:8443',
      username: 'default',
      password: 'YOUR_CLICKHOUSE_PASSWORD',
      database: 'default',
  });

  // Actor의 마지막 실행에서 데이터셋 항목 가져오기
  const run = await apify.actor('YOUR_ACTOR_ID').call();
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();

  console.log(`Fetched ${items.length} items from Apify dataset.`);

  // ClickHouse에 삽입
  await clickhouse.insert({
      table: 'apify_products',
      values: items,
      format: 'JSONEachRow',
  });

  console.log(`Inserted ${items.length} rows into ClickHouse.`);
  await clickhouse.close();
  ```

  :::tip
  대규모 데이터셋의 경우 [List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items) 엔드포인트의 `limit` 및 `offset` 매개변수를 사용해 결과를 페이지 단위로 가져오십시오. 비어 있지 않고 중복이 제거된 항목만 가져오려면 `clean=true`도 전달할 수 있습니다.
  :::

  ### 웹훅으로 자동화하기 \{#6-automate-with-webhooks\}

  스크립트를 수동으로 실행하는 대신, Actor가 완료될 때마다 데이터가 ClickHouse에 로드되도록 파이프라인을 자동화하십시오:

  1. [Apify Console](https://console.apify.com/)에서 해당 Actor로 이동한 다음 **Integrations** 탭을 여십시오.
  2. 다음과 같이 새 웹훅을 추가하십시오:
     * **Event type:** `ACTOR.RUN.SUCCEEDED`
     * **Action:** 로더 엔드포인트로 HTTP POST를 보내거나, ClickHouse 삽입을 처리하는 다른 Actor를 트리거합니다.
  3. 웹훅 payload에는 `defaultDatasetId`가 포함되며, 이를 사용해 실행 결과를 가져올 수 있습니다.

  payload 세부 정보와 설정 옵션은 [Apify 웹훅 문서](https://docs.apify.com/platform/integrations/webhooks)를 참조하십시오.

  다른 방법으로는 [Apify Schedules](https://docs.apify.com/platform/schedules)를 사용해 cron과 유사한 일정으로 Actor를 실행하고, 로드 단계에는 웹훅을 함께 사용하는 방식이 있습니다.
</VerticalStepper>

## 모범 사례 \{#best-practices\}

### Apify에서 데이터 가져오기 \{#fetching-data-from-apify\}

직접 HTTP 호출을 사용하는 대신 Apify 클라이언트 라이브러리([JavaScript](https://docs.apify.com/api/client/js)용 `apify-client` 또는 [Python](https://docs.apify.com/api/client/python)용)를 사용하세요. 이 라이브러리는 페이지네이션, 재시도, 인증을 자동으로 처리합니다. 대규모 데이터셋의 경우 [List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items) 엔드포인트의 `limit` 및 `offset` 매개변수를 사용해 결과를 페이지별로 나누어 가져오세요.

### ClickHouse에 로드하기 \{#loading-into-clickhouse\}

ClickHouse에 삽입할 때는 [`JSONEachRow`](/interfaces/formats/JSONEachRow) 형식을 사용하십시오. 별도의 변환 없이 Apify의 JSON 출력에 바로 매핑됩니다.

ClickHouse 테이블의 schema를 Actor의 출력 필드에 맞추십시오. Actor의 출력 schema는 [Apify Store](https://apify.com/store) 페이지 또는 실행 후 **Dataset** 탭에서 확인할 수 있습니다.

### 성능 \{#performance\}

JavaScript 클라이언트에서 높은 처리량으로 삽입하려면 [성능 최적화를 위한 팁](/integrations/javascript#tips-for-performance-optimizations)을 따르십시오. 한 번에 한 행씩 삽입하지 말고 여러 행을 묶어 더 큰 단위로 삽입하며, 클라이언트 측에서 배치 처리하기 어려운 경우 [비동기 삽입](/optimize/asynchronous-inserts)을 고려하십시오.

### 보안 \{#security\}

이 페이지의 예시는 설명을 단순화하기 위해 `default` 사용자와 데이터베이스를 사용합니다. 프로덕션에서는 대상 테이블에 삽입하는 데 필요한 최소 권한만 부여된 전용 사용자를 생성하고, 자격 증명은 안전하게 저장하십시오(예를 들어 소스 코드에 커밋하지 말고 환경 변수나 시크릿 관리 도구를 사용하십시오). 자세한 지침은 [Cloud 접근 관리](/cloud/security/cloud_access_management)를 참조하십시오.

## 관련 자료 \{#related-resources\}

* [Apify Platform 문서](https://docs.apify.com)
* [Apify API 레퍼런스](https://docs.apify.com/api/v2)
* [Apify JavaScript 클라이언트](https://docs.apify.com/api/client/js)
* [Apify Python 클라이언트](https://docs.apify.com/api/client/python)
* [Apify Store (바로 사용할 수 있는 Actors)](https://apify.com/store)
* [Apify 연동 개요](https://docs.apify.com/platform/integrations)
* [ClickHouse JavaScript 클라이언트](/integrations/language-clients/js.md)