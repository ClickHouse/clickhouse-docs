---
'slug': '/cloud/guides/sql-console/manage-sql-console-role-assignments'
'sidebar_label': 'SQL 콘솔 역할 할당 관리'
'title': 'SQL 콘솔 역할 할당 관리'
'description': 'SQL 콘솔 역할 할당 관리 방법을 보여주는 가이드'
'doc_type': 'guide'
'keywords':
- 'sql console'
- 'role assignments'
- 'access management'
- 'permissions'
- 'security'
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'


# SQL 콘솔 역할 할당 구성

> 이 가이드는 SQL 콘솔 역할 할당을 구성하는 방법을 보여줍니다. 이는 콘솔 전반에 걸친 접근 권한과 사용자가 Cloud 콘솔 내에서 접근할 수 있는 기능을 결정합니다.

<VerticalStepper headerLevel="h3">

### 서비스 접근 설정 {#access-service-settings}

서비스 페이지에서 SQL 콘솔 접근 설정을 조정하려는 서비스의 오른쪽 상단 모서리에 있는 메뉴를 클릭합니다.

<Image img={step_1} size="lg"/>

팝업 메뉴에서 `설정`을 선택합니다.

<Image img={step_2} size="lg"/>

### SQL 콘솔 접근 조정 {#adjust-sql-console-access}

"보안" 섹션에서 "SQL 콘솔 접근" 영역을 찾습니다:

<Image img={step_3} size="md"/>

### 서비스 관리자 설정 업데이트 {#update-settings-for-service-admin}

서비스 관리자에 대한 접근 제어 설정을 변경하려면 서비스 관리자 드롭다운 메뉴를 선택합니다:

<Image img={step_4} size="md"/>

다음 역할 중에서 선택할 수 있습니다:

| 역할           |
|----------------|
| `접근 없음`    |
| `읽기 전용`    |
| `전체 접근`    |

### 서비스 읽기 전용 설정 업데이트 {#update-settings-for-service-read-only}

서비스 읽기 전용에 대한 접근 제어 설정을 변경하려면 서비스 읽기 전용 드롭다운 메뉴를 선택합니다:

<Image img={step_5} size="md"/>

다음 역할 중에서 선택할 수 있습니다:

| 역할           |
|----------------|
| `접근 없음`    |
| `읽기 전용`    |
| `전체 접근`    |

### 접근 권한이 있는 사용자 검토 {#review-users-with-access}

서비스에 대한 사용자 개요는 사용자 수를 선택하여 볼 수 있습니다:

<Image img={step_6} size="md"/>

페이지 오른쪽에 사용자 수와 그들의 역할이 표시되는 탭이 열립니다:

<Image img={step_7} size="md"/>

</VerticalStepper>
