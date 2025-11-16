---
'sidebar_label': 'Hashboard'
'sidebar_position': 132
'slug': '/integrations/hashboard'
'keywords':
- 'clickhouse'
- 'Hashboard'
- 'connect'
- 'integrate'
- 'ui'
- 'analytics'
'description': 'Hashboard는 ClickHouse와 쉽게 통합되어 실시간 데이터 분석을 수행할 수 있는 강력한 분석 플랫폼입니다.'
'title': 'ClickHouse를 Hashboard에 연결하기'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse를 Hashboard에 연결하기

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com)는 귀하의 조직 내에서 메트릭을 추적하고 실행 가능한 인사이트를 발견할 수 있는 대화형 데이터 탐색 도구입니다. Hashboard는 ClickHouse 데이터베이스에 실시간 SQL 쿼리를 발행하며, 자체 서비스 및 애드혹 데이터 탐색 사용 사례에 특히 유용합니다.

<Image size="md" img={hashboard_01} alt="Hashboard 데이터 탐색기 인터페이스로 대화형 쿼리 빌더 및 시각화를 보여줌" border />

<br/>

이 가이드는 Hashboard와 귀하의 ClickHouse 인스턴스를 연결하는 단계를 안내합니다. 이 정보는 Hashboard의 [ClickHouse 통합 문서](https://docs.hashboard.com/docs/database-connections/clickhouse)에서도 확인할 수 있습니다.

## 전제 조건 {#pre-requisites}

- 귀하의 인프라에서 호스팅되거나 [ClickHouse Cloud](https://clickhouse.com/)에 호스팅된 ClickHouse 데이터베이스.
- [Hashboard 계정](https://hashboard.com/getAccess) 및 프로젝트.

## Hashboard를 ClickHouse에 연결하는 단계 {#steps-to-connect-hashboard-to-clickhouse}

### 1. 연결 세부정보 수집 {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Hashboard에 새 데이터베이스 연결 추가 {#2-add-a-new-database-connection-in-hashboard}

1. 귀하의 [Hashboard 프로젝트](https://hashboard.com/app)로 이동합니다.
2. 사이드 내비게이션 바에서 기어 아이콘을 클릭하여 설정 페이지를 엽니다.
3. `+ New Database Connection`을 클릭합니다.
4. 모달에서 "ClickHouse"를 선택합니다.
5. 이전에 수집한 정보를 사용하여 **연결 이름**, **호스트**, **포트**, **사용자 이름**, **비밀번호**, **데이터베이스** 필드를 입력합니다.
6. "Test"를 클릭하여 연결이 성공적으로 구성되었는지 확인합니다.
7. "Add"를 클릭합니다.

이제 귀하의 ClickHouse 데이터베이스가 Hashboard에 연결되었으며 [데이터 모델](https://docs.hashboard.com/docs/data-modeling/add-data-model), [탐색](https://docs.hashboard.com/docs/visualizing-data/explorations), [메트릭](https://docs.hashboard.com/docs/metrics), 및 [대시보드](https://docs.hashboard.com/docs/dashboards)를 구축하는 과정으로 진행할 수 있습니다. 이러한 기능에 대한 자세한 내용은 해당 Hashboard 문서를 참조하십시오.

## 더 알아보기 {#learn-more}

더 많은 고급 기능과 문제 해결을 위해 [Hashboard 문서](https://docs.hashboard.com/)를 방문하십시오.
