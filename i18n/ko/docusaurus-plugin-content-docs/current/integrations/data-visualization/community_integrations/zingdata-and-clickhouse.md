---
'sidebar_label': 'Zing Data'
'sidebar_position': 206
'slug': '/integrations/zingdata'
'keywords':
- 'Zing Data'
'description': 'Zing Data는 iOS, Android 및 웹을 위해 만들어진 ClickHouse용 간단한 소셜 비즈니스 인텔리전스입니다.'
'title': 'Zing Data를 ClickHouse에 연결하기'
'show_related_blogs': true
'doc_type': 'guide'
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


# Zing Data를 ClickHouse에 연결하기

<CommunityMaintainedBadge/>

<a href="https://www.zingdata.com/" target="_blank">Zing Data</a>는 데이터 탐색 및 시각화 플랫폼입니다. Zing Data는 ClickHouse에서 제공하는 JS 드라이버를 사용하여 ClickHouse에 연결합니다.

## 연결 방법 {#how-to-connect}
1. 연결 세부정보를 수집합니다.
<ConnectionDetails />

2. Zing Data를 다운로드하거나 방문합니다.

    * 모바일에서 Zing Data와 ClickHouse를 사용하려면 [Google Play 스토어](https://play.google.com/store/apps/details?id=com.getzingdata.android) 또는 [Apple 앱 스토어](https://apps.apple.com/us/app/zing-data-collaborative-bi/id1563294091)에서 Zing Data 앱을 다운로드합니다.

    * 웹에서 Zing Data와 ClickHouse를 사용하려면 [Zing 웹 콘솔](https://console.getzingdata.com/)을 방문하여 계정을 생성합니다.

3. 데이터 소스를 추가합니다.

    * Zing Data와 ClickHouse 데이터를 상호작용하려면 **_데이터 소스_**를 정의해야 합니다. Zing Data의 모바일 앱 메뉴에서 **소스**를 선택한 다음 **데이터 소스 추가**를 클릭합니다.

    * 웹에서 데이터 소스를 추가하려면 상단 메뉴에서 **데이터 소스**를 클릭하고 **새 데이터 소스**를 클릭한 후 드롭다운 메뉴에서 **Clickhouse**를 선택합니다.

    <Image size="md" img={zing_01} alt="새 데이터 소스 버튼과 드롭다운 메뉴의 ClickHouse 옵션을 보여주는 Zing Data 인터페이스" border />
    <br/>

4. 연결 세부정보를 입력하고 **연결 확인**을 클릭합니다.

    <Image size="md" img={zing_02} alt="서버, 포트, 데이터베이스, 사용자 이름 및 비밀번호 필드를 포함하는 Zing Data의 ClickHouse 연결 구성 양식" border />
    <br/>

5. 연결이 성공하면 Zing은 테이블 선택으로 진행합니다. 필요한 테이블을 선택하고 **저장**을 클릭합니다. Zing이 데이터 소스에 연결할 수 없으면 자격 증명을 확인하고 다시 시도하라는 메시지가 표시됩니다. 자격 증명을 확인하고 다시 시도한 후에도 문제가 발생하면, <a id="contact_link" href="mailto:hello@getzingdata.com">여기에서 Zing 지원에 문의하십시오.</a>

    <Image size="md" img={zing_03} alt="체크박스가 있는 사용 가능한 ClickHouse 테이블을 보여주는 Zing Data의 테이블 선택 인터페이스" border />
    <br/>

6. Clickhouse 데이터 소스가 추가되면 Zing 조직의 모든 사용자에게 **데이터 소스** / **소스** 탭에서 사용할 수 있습니다.

## Zing Data에서 차트 및 대시보드 생성하기 {#creating-charts-and-dashboards-in-zing-data}

1. Clickhouse 데이터 소스가 추가된 후, 웹에서 **Zing 앱**을 클릭하거나 모바일에서 데이터 소스를 클릭하여 차트를 생성합니다.

2. 차트를 생성하려면 테이블 목록에서 테이블을 클릭합니다.

    <Image size="sm" img={zing_04} alt="사용 가능한 ClickHouse 테이블을 보여주는 Zing Data 인터페이스의 테이블 목록" border />
    <br/>

3. 시각적 쿼리 빌더를 사용하여 원하는 필드, 집계 등을 선택하고 **질문 실행**을 클릭합니다.

    <Image size="md" img={zing_05} alt="필드 선택 및 집계 옵션이 포함된 Zing Data의 시각적 쿼리 빌더 인터페이스" border />
    <br/>

4. SQL에 익숙하다면, 쿼리를 실행하고 차트를 생성하기 위해 사용자 정의 SQL을 작성할 수도 있습니다.

    <Image size="md" img={zing_06} alt="SQL 쿼리 작성 인터페이스를 보여주는 Zing Data의 SQL 편집기 모드" border />
    <Image size="md" img={zing_07} alt="표 형태로 데이터가 표시된 Zing Data의 SQL 쿼리 결과" border />

5. 예시 차트는 다음과 같이 보일 수 있습니다. 질문은 세 개의 점 메뉴를 사용하여 저장할 수 있습니다. 차트에 댓글을 달고, 팀원을 태그하고, 실시간 알림을 생성하고, 차트 유형을 변경할 수 있습니다.

    <Image size="md" img={zing_08} alt="ClickHouse의 데이터를 보여주는 Zing Data의 예시 차트 시각화와 옵션 메뉴" border />
    <br/>

6. 대시보드는 홈 화면의 **대시보드** 아래 "+" 아이콘을 사용하여 생성할 수 있습니다. 기존 질문은 드래그하여 대시보드에 표시할 수 있습니다.

    <Image size="md" img={zing_09} alt="대시보드 레이아웃에 배열된 여러 시각화를 보여주는 Zing Data 대시보드 보기" border />
    <br/>

## 관련 콘텐츠 {#related-content}

- [문서](https://docs.getzingdata.com/docs/)
- [빠른 시작](https://getzingdata.com/quickstart/)
- [대시보드 만들기](https://getzingdata.com/blog/new-feature-create-multi-question-dashboards/)에 대한 가이드
