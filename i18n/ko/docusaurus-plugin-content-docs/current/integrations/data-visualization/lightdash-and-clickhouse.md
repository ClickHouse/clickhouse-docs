---
sidebar_label: 'Lightdash'
sidebar_position: 131
slug: /integrations/lightdash
keywords: ['clickhouse', 'lightdash', '데이터 시각화', 'BI', '시맨틱 레이어', 'dbt', '셀프 서비스 분석', '연결']
description: 'Lightdash는 dbt 위에 구축된 최신 오픈 소스 BI 도구로, 팀이 시맨틱 레이어를 통해 ClickHouse 데이터를 탐색하고 시각화할 수 있도록 합니다. 이 가이드에서는 dbt로 구동되는 빠르고 거버넌스가 적용된 분석을 위해 Lightdash를 ClickHouse에 연결하는 방법을 설명합니다.'
title: 'Lightdash를 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import lightdash_01 from '@site/static/images/integrations/data-visualization/lightdash_01.png';
import lightdash_02 from '@site/static/images/integrations/data-visualization/lightdash_02.png';
import lightdash_03 from '@site/static/images/integrations/data-visualization/lightdash_03.png';
import lightdash_04 from '@site/static/images/integrations/data-visualization/lightdash_04.png';
import lightdash_05 from '@site/static/images/integrations/data-visualization/lightdash_05.png';
import lightdash_06 from '@site/static/images/integrations/data-visualization/lightdash_06.png';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Lightdash \{#lightdash\}

<PartnerBadge/>

Lightdash는 현대적인 데이터 팀을 위해 구축된 **AI 중심 BI 플랫폼**으로, dbt의 개방성과 ClickHouse의 성능을 결합합니다. ClickHouse를 Lightdash에 연결하면, 팀은 dbt 시맨틱 레이어를 기반으로 한 **AI 기반 셀프 서비스 분석 환경**을 활용하여, 모든 질문에 거버넌스가 적용된 일관된 지표로 답변할 수 있습니다.

개발자들은 개방형 아키텍처, 버전 관리되는 YAML 모델, GitHub부터 IDE까지 워크플로에 자연스럽게 통합되는 다양한 연동 기능 때문에 Lightdash를 선호합니다.

이번 파트너십은 **ClickHouse의 속도**와 **Lightdash의 개발자 경험**을 결합하여, AI를 활용해 인사이트를 탐색하고, 시각화하며, 자동화하는 작업을 그 어느 때보다 쉽게 만들어 줍니다.

## Lightdash와 ClickHouse로 대화형 대시보드 구축하기 \{#build-an-interactive-dashboard\}

이 가이드에서는 **Lightdash**가 **ClickHouse**에 연결하여 dbt 모델을 탐색하고 대화형 대시보드를 만드는 방법을 설명합니다.  
아래는 ClickHouse 데이터를 기반으로 하는 완성된 대시보드 예시입니다.

<Image size="md" img={lightdash_02} alt="Lightdash 대시보드 예시" border />

<VerticalStepper headerLevel="h3">
  ### 연결 정보 수집

  Lightdash와 ClickHouse 간의 연결을 설정할 때 다음 세부 정보가 필요합니다:

  * **Host:** ClickHouse 데이터베이스가 실행 중인 호스트 주소
  * **사용자:** ClickHouse 데이터베이스 사용자 이름
  * **Password:** ClickHouse 데이터베이스의 비밀번호
  * **DB name:** ClickHouse 데이터베이스 이름
  * **스키마(Schema):** dbt가 프로젝트를 컴파일하고 실행할 때 사용하는 기본 스키마입니다 (`profiles.yml` 파일에서 설정됨).
  * **포트(Port):** ClickHouse HTTPS 인터페이스 포트입니다 (기본값: `8443`)
  * **Secure:** 보안 연결을 위해 HTTPS/SSL을 사용하려면 이 옵션을 활성화하십시오
  * **Retries:** 실패한 ClickHouse 쿼리에 대해 Lightdash가 재시도하는 횟수(기본값: `3`)
  * **주 시작 요일:** 보고 주간이 시작되는 요일을 선택합니다. 기본값은 웨어하우스 설정을 따릅니다.

  <ConnectionDetails />

  ***

  ### ClickHouse용 dbt 프로필을 구성하세요

  Lightdash에서 연결은 기존 **dbt 프로젝트**를 기반으로 합니다.
  ClickHouse를 연결하려면 로컬 `~/.dbt/profiles.yml` 파일에 유효한 ClickHouse 대상 구성이 포함되어 있는지 확인하세요.

  예를 들어:

  <Image size="md" img={lightdash_01} alt="lightdash-clickhouse 프로젝트용 profiles.yml 구성 예제" border />

  <br />

  ### ClickHouse에 연결된 Lightdash 프로젝트 생성

  ClickHouse에 대한 dbt 프로필이 구성되면, **dbt 프로젝트**를 Lightdash에 연결하세요.

  이 과정은 모든 데이터 웨어하우스에서 동일하므로 여기서는 자세히 설명하지 않습니다. dbt 프로젝트 가져오기에 대한 자세한 내용은 공식 Lightdash 가이드를 참조하세요:

  [dbt 프로젝트 가져오기 → Lightdash 문서](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  dbt 프로젝트를 연결하면 Lightdash가 `profiles.yml` 파일에서 ClickHouse 구성을 자동으로 감지합니다. 연결 테스트가 성공하면 dbt 모델을 탐색하고 ClickHouse 기반 대시보드를 구축하실 수 있습니다.

  ***

  ### Lightdash에서 ClickHouse 데이터 탐색

  연결되면 Lightdash가 자동으로 dbt 모델을 동기화하고 다음을 노출합니다:

  * YAML에서 정의된 **차원(Dimensions)** 및 **측정값(Measures)**
  * **시맨틱 레이어 로직**(메트릭, 조인, 익스플로어 등)
  * 실시간 ClickHouse 쿼리를 기반으로 하는 **대시보드**

  이제 ClickHouse 위에서 직접 대시보드를 구축하고, 인사이트를 공유하며, **Ask AI**를 사용하여 시각화를 생성할 수 있습니다 — 수동으로 SQL을 작성할 필요가 없습니다.

  ***

  ### Lightdash에서 메트릭 및 차원 정의

  Lightdash에서는 모든 **메트릭**과 **차원**이 dbt 모델 `.yml` 파일에 직접 정의됩니다. 이를 통해 비즈니스 로직의 버전 관리, 일관성 유지 및 완전한 투명성이 보장됩니다.

  <Image size="md" img={lightdash_03} alt=".yml 파일에서 메트릭을 정의하는 예시" border />

  <br />

  YAML에서 이러한 정의를 작성하면 팀 전체가 대시보드와 분석 전반에 걸쳐 동일한 정의를 사용하게 됩니다. 예를 들어, `total_order_count`, `total_revenue`, `avg_order_value`와 같은 재사용 가능한 메트릭을 dbt 모델 바로 옆에 생성할 수 있으며, UI에서 중복 작업을 수행할 필요가 없습니다.

  이를 정의하는 방법에 대한 자세한 내용은 다음 Lightdash 가이드를 참조하세요:

  * [메트릭 생성 방법](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)
  * [차원 생성 방법](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### 테이블에서 데이터 쿼리하기

  dbt 프로젝트가 Lightdash에 연결되고 동기화되면 **테이블**(또는 &quot;explores&quot;)에서 직접 데이터를 탐색하실 수 있습니다.
  각 테이블은 dbt 모델을 나타내며 YAML에서 정의하신 메트릭과 차원을 포함합니다.

  **Explore** 페이지는 다섯 개의 주요 영역으로 구성되어 있습니다:

  1. **차원(Dimensions)과 지표(Metrics)** — 선택한 테이블에서 사용할 수 있는 모든 필드
  2. **Filters** — 쿼리가 반환하는 데이터를 제한합니다
  3. **차트(Chart)** — 쿼리 결과를 시각화합니다.
  4. **결과** — ClickHouse 데이터베이스에서 반환된 원시 데이터를 조회합니다
  5. **SQL** — 결과를 만드는 데 사용된 SQL 쿼리를 확인합니다

  <Image size="lg" img={lightdash_04} alt="차원, 필터, 차트, 결과, SQL이 표시되는 Lightdash Explore 화면" border />

  여기에서 필드를 드래그 앤 드롭하고 필터를 추가하며 테이블, 막대 차트, 시계열 등의 시각화 유형을 전환하면서 대화형으로 쿼리를 구성하고 조정할 수 있습니다.

  탐색(Explore) 기능과 테이블에서 쿼리를 실행하는 방법에 대한 자세한 내용은 다음을 참조하세요:
  [An intro to tables and the Explore page → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### 대시보드 구축하기

  데이터를 탐색하고 시각화를 저장한 후, 이를 **대시보드**로 결합하여 팀과 공유하실 수 있습니다.

  Lightdash의 대시보드는 완전히 인터랙티브합니다. 필터 적용, 탭 추가, 실시간 ClickHouse 쿼리 기반 차트 확인이 가능합니다.

  **대시보드 내에서 직접** 새로운 차트를 생성할 수도 있으며, 이를 통해 프로젝트를 체계적이고 정돈된 상태로 유지할 수 있습니다. 이 방식으로 생성된 차트는 **해당 대시보드 전용**이므로 프로젝트의 다른 곳에서 재사용할 수 없습니다.

  대시보드 전용 차트를 만들려면:

  1. **Add tile**을 클릭합니다
  2. **New chart**을 선택합니다
  3. 차트 빌더에서 시각화 만들기
  4. 저장하면 대시보드 맨 아래에 표시됩니다

  <Image size="lg" img={lightdash_05} alt="Lightdash 대시보드에서 차트 생성 및 정리" border />

  대시보드 생성 및 구성 방법에 대한 자세한 내용은 다음을 참조하세요:
  [Building dashboards → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### Ask AI: dbt 기반 셀프 서비스 분석

  Lightdash의 **AI Agents**는 데이터 탐색을 완전한 셀프 서비스로 만들어 줍니다.
  쿼리를 작성하는 대신, *&quot;월별 매출 성장률은 어떻게 되나요?&quot;* 와 같이 자연어로 질문하기만 하면 AI Agent가 자동으로 적절한 시각화를 생성하며, dbt로 정의된 메트릭과 모델을 참조하여 정확성과 일관성을 보장합니다.

  dbt에서 사용하는 것과 동일한 시맨틱 레이어(semantic layer)로 구동되므로, 모든 응답이 거버넌스를 준수하고 설명 가능하며 빠르게 제공됩니다 — 모두 ClickHouse를 기반으로 합니다.

  <Image size="lg" img={lightdash_06} alt="dbt metrics를 기반으로 자연어 쿼리를 수행하는 Lightdash Ask AI 인터페이스" border />

  :::tip
  AI 에이전트에 대한 자세한 내용은 여기에서 확인하세요: [AI Agents → Lightdash Docs](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)
  :::
</VerticalStepper>

## 자세히 알아보기 {#learn-more}

dbt 프로젝트를 Lightdash에 연결하는 방법에 대해 더 알아보려면 [Lightdash 문서 → ClickHouse 설정](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)을 참고하십시오.