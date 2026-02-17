---
sidebar_label: 'Zing Data'
sidebar_position: 206
slug: /integrations/zingdata
keywords: ['Zing Data']
description: 'Zing Data는 iOS, Android 및 웹을 위해 만들어진, ClickHouse용 간편한 소셜 비즈니스 인텔리전스입니다.'
title: 'Zing Data를 ClickHouse와 연결하기'
show_related_blogs: true
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import zing_01 from '@site/static/images/integrations/data-visualization/zing_01.png';
import zing_02 from '@site/static/images/integrations/data-visualization/zing_02.png';
import zing_03 from '@site/static/images/integrations/data-visualization/zing_03.png';
import zing_04 from '@site/static/images/integrations/data-visualization/zing_04.png';
import zing_05 from '@site/static/images/integrations/data-visualization/zing_05.png';
import zing_06 from '@site/static/images/integrations/data-visualization/zing_06.png';
import zing_07 from '@site/static/images/integrations/data-visualization/zing_07.png';
import zing_08 from '@site/static/images/integrations/data-visualization/zing_08.png';
import zing_09 from '@site/static/images/integrations/data-visualization/zing_09.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Zing Data를 ClickHouse에 연결하기 \{#connect-zing-data-to-clickhouse\}

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a>는 데이터 탐색 및 시각화를 위한 플랫폼입니다. Zing Data는 ClickHouse에서 제공하는 JS 드라이버를 사용하여 ClickHouse에 연결합니다.

## 연결 방법 \{#how-to-connect\}

1. 연결 정보를 준비합니다.

<ConnectionDetails />

2. Zing Data 다운로드 또는 접속

    * 모바일에서 Zing Data와 함께 ClickHouse를 사용하려면 [Google Play Store](https://play.google.com/store/apps/details?id=com.getzingdata.android) 또는 [Apple App Store](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091)에서 Zing Data 앱을 다운로드합니다.

    * 웹에서 Zing Data와 함께 ClickHouse를 사용하려면 [Zing 웹 콘솔](https://console.getzingdata.com/)에 접속하여 계정을 만듭니다.

3. 데이터 소스 추가

    * Zing Data에서 ClickHouse 데이터를 조회하려면 **_데이터 소스(datasource)_**를 정의해야 합니다. Zing Data 모바일 앱 메뉴에서 **Sources**를 선택한 후 **Add a Datasource**를 클릭합니다.

    * 웹에서 데이터 소스를 추가하려면 상단 메뉴에서 **Data Sources**를 클릭하고 **New Datasource**를 클릭한 다음 드롭다운 메뉴에서 **ClickHouse**를 선택합니다.

    <Image size="md" img={zing_01} alt="드롭다운 메뉴에서 New Datasource 버튼과 ClickHouse 옵션이 표시된 Zing Data 인터페이스" border />
    <br/>

4. 연결 정보를 입력한 후 **Check Connection**을 클릭합니다.

    <Image size="md" img={zing_02} alt="서버, 포트, 데이터베이스, 사용자 이름, 비밀번호 필드가 있는 Zing Data의 ClickHouse 연결 구성 폼" border />
    <br/>

5. 연결에 성공하면 Zing에서 테이블 선택 단계로 이동합니다. 필요한 테이블을 선택하고 **Save**를 클릭합니다. Zing에서 데이터 소스에 연결할 수 없는 경우, 자격 증명을 확인하고 다시 시도하라는 메시지가 표시됩니다. 자격 증명을 확인하고 다시 시도했음에도 문제가 계속되면 <a id="contact_link" href="mailto:hello@getzingdata.com">여기에서 Zing 지원팀에 문의하십시오.</a>

    <Image size="md" img={zing_03} alt="체크박스와 함께 사용 가능한 ClickHouse 테이블이 표시된 Zing Data 테이블 선택 인터페이스" border />
    <br/>

6. ClickHouse 데이터 소스가 추가되면 Zing 조직의 모든 사용자가 **Data Sources** / **Sources** 탭에서 해당 데이터 소스를 사용할 수 있습니다.

## Zing Data에서 차트와 대시보드 생성하기 \{#creating-charts-and-dashboards-in-zing-data\}

1. ClickHouse 데이터 소스가 추가된 후 웹에서는 **Zing App**을 클릭하고, 모바일에서는 해당 데이터 소스를 눌러 차트 생성을 시작합니다.

2. 테이블 목록에서 원하는 테이블을 클릭하여 차트를 생성합니다.

    <Image size="sm" img={zing_04} alt="사용 가능한 ClickHouse 테이블이 있는 테이블 목록을 보여주는 Zing Data 인터페이스" border />
    <br/>

3. 시각적 쿼리 빌더를 사용해 필요한 필드, 집계 등을 선택한 후 **Run Question**을 클릭합니다.

    <Image size="md" img={zing_05} alt="필드 선택 및 집계 옵션이 포함된 Zing Data 시각적 쿼리 빌더 인터페이스" border />
    <br/>

4. SQL에 익숙하다면, 사용자 지정 SQL을 작성해 쿼리를 실행하고 차트를 생성할 수도 있습니다.

    <Image size="md" img={zing_06} alt="SQL 쿼리 작성 인터페이스를 보여주는 Zing Data의 SQL 편집기 모드" border />
    <Image size="md" img={zing_07} alt="표 형식으로 데이터가 표시된 Zing Data의 SQL 쿼리 결과 화면" border />

5. 예시 차트는 다음과 같습니다. 질문은 점 3개 메뉴를 사용해 저장할 수 있습니다. 차트에 댓글을 남기고, 팀원을 태그하며, 실시간 경고를 생성하고, 차트 유형을 변경하는 등의 작업을 할 수 있습니다.

    <Image size="md" img={zing_08} alt="옵션 메뉴와 함께 ClickHouse 데이터가 표시된 Zing Data의 예시 차트 시각화" border />
    <br/>

6. 대시보드는 홈 화면의 **Dashboards** 아래에 있는 "+" 아이콘을 사용해 생성할 수 있습니다. 기존 질문을 드래그하여 대시보드에 배치해 표시할 수 있습니다.

    <Image size="md" img={zing_09} alt="여러 시각화가 대시보드 레이아웃으로 배열된 Zing Data 대시보드 화면" border />
    <br/>

## 관련 자료 \{#related-content\}

- [문서](https://docs.getzingdata.com/docs/)
- [빠른 시작](https://getzingdata.com/quickstart/)
- [대시보드 만들기 가이드](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)