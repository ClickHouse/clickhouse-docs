---
'sidebar_label': 'Lightdash'
'sidebar_position': 131
'slug': '/integrations/lightdash'
'keywords':
- 'clickhouse'
- 'lightdash'
- 'data visualization'
- 'BI'
- 'semantic layer'
- 'dbt'
- 'self-serve analytics'
- 'connect'
'description': 'Lightdash는 dbt 위에 구축된 현대적인 오픈 소스 BI 도구로, 팀이 ClickHouse의 데이터를 탐색하고
  시각화할 수 있게 하는 의미론적 계층을 제공합니다. dbt에 의해 구동되는 빠르고 관리되는 분석을 위해 Lightdash를 ClickHouse에
  연결하는 방법을 배워보세요.'
'title': 'Lightdash를 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_visualization'
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


# Lightdash

<PartnerBadge/>

Lightdash는 **AI 우선 BI 플랫폼**으로, 현대 데이터 팀을 위해 설계되었으며, dbt의 개방성과 ClickHouse의 성능을 결합합니다. ClickHouse를 Lightdash에 연결하면 팀은 **AI 기반의 셀프 서비스 분석 경험**을 통해 dbt 의미 레이어에 기반하여 모든 질문에 대해 관리되고 일관된 메트릭으로 답을 받을 수 있습니다.

개발자들은 Lightdash의 개방적 아키텍처, 버전 관리된 YAML 모델 및 워크플로에 바로 통합되는 통합 기능을 좋아합니다 - GitHub부터 IDE까지입니다.

이 파트너십은 **ClickHouse의 속도**와 **Lightdash의 개발자 경험**을 결합하여 AI를 사용하여 인사이트를 탐색, 시각화 및 자동화하는 과정을 그 어느 때보다 쉽게 만듭니다.

## Lightdash와 ClickHouse로 인터랙티브 대시보드 만들기 {#build-an-interactive-dashboard}

이 가이드에서는 **Lightdash**가 **ClickHouse**와 연결되어 dbt 모델을 탐색하고 인터랙티브 대시보드를 구축하는 방법을 보여줍니다.  
아래 예시는 ClickHouse의 데이터를 기반으로 한 완성된 대시보드입니다.

<Image size="md" img={lightdash_02} alt="Lightdash 대시보드 예시" border />

<VerticalStepper headerLevel="h3">

### 연결 데이터 수집 {#connection-data-required}

Lightdash와 ClickHouse 간의 연결을 설정할 때 다음 세부 정보가 필요합니다:

- **Host:** ClickHouse 데이터베이스가 실행되는 주소  
- **User:** ClickHouse 데이터베이스 사용자 이름  
- **Password:** ClickHouse 데이터베이스 비밀번호  
- **DB name:** ClickHouse 데이터베이스 이름  
- **Schema:** dbt가 프로젝트를 컴파일하고 실행하는 데 사용하는 기본 스키마 (당신의 `profiles.yml`에 있음)  
- **Port:** ClickHouse HTTPS 인터페이스 포트 (기본값: `8443`)  
- **Secure:** 보안 연결을 위해 HTTPS/SSL 사용을 위한 옵션 활성화  
- **Retries:** 실패한 ClickHouse 쿼리를 재시도하는 횟수 (기본값: `3`)  
- **Start of week:** 보고 주가 시작되는 날 선택; 기본값은 창고 설정입니다

<ConnectionDetails />

---

### ClickHouse에 대한 dbt 프로필 구성 {#configuring-your-dbt-profile-for-clickhouse}

Lightdash에서는 연결이 기존 **dbt 프로젝트**를 기반으로 합니다.  
ClickHouse에 연결하려면 로컬 `~/.dbt/profiles.yml` 파일에 유효한 ClickHouse 대상 구성이 포함되어 있어야 합니다.

예를 들어:

<Image size="md" img={lightdash_01} alt="lightdash-clickhouse 프로젝트에 대한 profiles.yml 구성 예시" border />
<br/>

### ClickHouse에 연결된 Lightdash 프로젝트 만들기 {#creating-a-lightdash-project-connected-to-clickhouse}

dbt 프로필이 ClickHouse에 대해 구성되면, 당신의 **dbt 프로젝트**를 Lightdash에 연결해야 합니다.

이 과정은 모든 데이터 웨어하우스에 대해 동일하므로 이곳에서 자세히 설명하지는 않겠습니다 — dbt 프로젝트를 가져오는 공식 Lightdash 가이드를 참고할 수 있습니다:

[dbt 프로젝트 가져오기 → Lightdash Docs](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

dbt 프로젝트를 연결한 후, Lightdash는 `profiles.yml` 파일에서 ClickHouse 구성을 자동으로 감지합니다. 연결 테스트가 성공하면 dbt 모델을 탐색하고 ClickHouse에 의해 제공되는 대시보드를 구축하기 시작할 수 있습니다.

---

### Lightdash에서 ClickHouse 데이터 탐색 {#exploring-your-clickhouse-data-in-lightdash}

연결된 후, Lightdash는 dbt 모델을 자동으로 동기화하고 다음을 노출합니다:

- YAML로 정의된 **차원** 및 **측정값**  
- 메트릭, 조인 및 탐색과 같은 **의미 레이어 로직**  
- 실시간 ClickHouse 쿼리에 의해 제공되는 **대시보드**  

이제 대시보드를 구축하고, 인사이트를 공유하며, ClickHouse 위에서 시각화를 생성하기 위해 **Ask AI**를 사용할 수도 있습니다 — 수동 SQL이 필요하지 않습니다.

---

### Lightdash에서 메트릭 및 차원 정의 {#defining-metrics-and-dimensions-in-lightdash}

Lightdash에서는 모든 **메트릭**과 **차원**이 dbt 모델 `.yml` 파일에서 직접 정의됩니다. 이는 비즈니스 로직을 버전 관리할 수 있고, 일관성이 있으며, 완전히 투명하게 만듭니다.

<Image size="md" img={lightdash_03} alt=".yml 파일에 메트릭을 정의한 예시" border />
<br/>

YAML로 정의하면 팀이 대시보드와 분석에서 동일한 정의를 사용하게 됩니다. 예를 들어, `total_order_count`, `total_revenue` 또는 `avg_order_value`와 같은 재사용 가능한 메트릭을 dbt 모델 옆에서 만들 수 있습니다 — UI에서 중복이 필요하지 않습니다.

이것들을 정의하는 방법에 대해 더 배우려면, 다음 Lightdash 가이드를 참조하십시오:  
- [메트릭 생성 방법](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)  
- [차원 생성 방법](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### 테이블에서 데이터 쿼리하기 {#querying-your-data-from-tables}

dbt 프로젝트가 Lightdash에 연결되고 동기화되면, **테이블**(또는 “탐색”)에서 직접 데이터를 탐색할 수 있습니다.  
각 테이블은 dbt 모델을 나타내며, YAML에서 정의한 메트릭과 차원을 포함합니다.

**탐색** 페이지는 다섯 개의 주요 영역으로 구성됩니다:

1. **차원 및 메트릭** — 선택한 테이블에서 사용할 수 있는 모든 필드  
2. **필터** — 쿼리로 반환되는 데이터 제한  
3. **차트** — 쿼리 결과 시각화  
4. **결과** — ClickHouse 데이터베이스에서 반환된 원본 데이터 보기  
5. **SQL** — 결과 뒤의 생성된 SQL 쿼리 검사  

<Image size="lg" img={lightdash_04} alt="Lightdash 탐색 보기에서 차원, 필터, 차트, 결과 및 SQL 표시" border />

여기에서 쿼리를 대화식으로 구축하고 조정할 수 있습니다 — 필드를 드래그 앤 드롭하고, 필터를 추가하며, 테이블, 막대 차트 또는 시계열과 같은 시각화 유형 간에 전환할 수 있습니다.

탐색 및 테이블에서 쿼리하는 방법에 대한 더 깊은 내용을 보려면:  
[테이블 및 탐색 페이지 소개 → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### 대시보드 구축하기 {#building-dashboards}

데이터를 탐색하고 시각화를 저장한 후, 이를 **대시보드**로 결합하여 팀과 공유할 수 있습니다.

Lightdash의 대시보드는 완전히 인터랙티브합니다 — 필터를 적용하고, 탭을 추가하며, 실시간 ClickHouse 쿼리에 의해 제공되는 차트를 볼 수 있습니다.

또한 대시보드 내에서 **새 차트를 직접 생성**할 수 있어 프로젝트를 정리하고 혼란 없이 유지할 수 있습니다. 이렇게 생성된 차트는 **해당 대시보드에 독점적입니다** — 프로젝트 내 다른 곳에서 재사용할 수 없습니다.

대시보드 전용 차트를 생성하려면:
1. **타일 추가** 클릭  
2. **새 차트** 선택  
3. 차트 빌더에서 시각화를 구축  
4. 저장 — 대시보드 하단에 나타납니다  

<Image size="lg" img={lightdash_05} alt="Lightdash 대시보드 내에서 차트 생성 및 정리" border />

대시보드 생성 및 정리에 대한 더 많은 정보를 여기에서 알아보세요:  
[대시보드 구축하기 → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Ask AI: dbt 기반의 셀프 서비스 분석 {#ask-ai}

Lightdash의 **AI 에이전트**는 데이터 탐색을 진정한 자기 서비스로 만듭니다.  
쿼리를 작성하는 대신, 사용자는 일반 언어로 질문을 할 수 있습니다 — 예를 들어 *“우리의 월간 수익 성장률은 어땠나요?”* — AI 에이전트는 dbt에서 정의한 메트릭과 모델을 참조하여 정확하고 일관된 시각화를 자동으로 생성합니다.

이는 dbt에서 사용하는 것과 동일한 의미 레이어에 의해 지원되므로, 모든 답변은 관리되고 설명 가능하며 빠릅니다 — 모두 ClickHouse에 의해 뒷받침됩니다.

<Image size="lg" img={lightdash_06} alt="Lightdash Ask AI 인터페이스에서 dbt 메트릭으로 구동되는 자연어 쿼리 표시" border />

:::tip
AI 에이전트에 대해 자세히 알아보려면: [AI 에이전트 → Lightdash Docs](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
:::
</VerticalStepper>

## 더 알아보기 {#learn-more}

dbt 프로젝트를 Lightdash에 연결하는 방법에 대해 더 알아보려면 [Lightdash Docs → ClickHouse 설정](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs) 를 방문하십시오.
