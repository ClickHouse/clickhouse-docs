---
slug: /cloud/guides/sql-console/manage-sql-console-role-assignments
sidebar_label: 'SQL 콘솔 역할 할당 관리'
title: 'SQL 콘솔 역할 할당 관리'
description: 'SQL 콘솔 역할 할당을 관리하는 방법을 안내하는 가이드'
doc_type: 'guide'
keywords: ['sql console', '역할 할당', '액세스 관리', '권한', '보안']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'


# SQL 콘솔 역할 할당 구성 \{#configuring-sql-console-role-assignments\}

> 이 가이드는 SQL 콘솔 역할 할당을 구성하는 방법을 설명합니다. 역할 할당은 콘솔 전체의 액세스 권한과 사용자가 Cloud 콘솔 내에서 사용할 수 있는 기능을 결정합니다.

<VerticalStepper headerLevel="h3">

### 서비스 설정에 액세스하기 \{#access-service-settings\}

서비스 페이지에서 SQL 콘솔 액세스 설정을 조정하려는 서비스의 오른쪽 상단에 있는 메뉴를 클릭합니다.

<Image img={step_1} size="lg"/>

팝업 메뉴에서 `settings`를 선택합니다.

<Image img={step_2} size="lg"/>

### SQL 콘솔 액세스 조정 \{#adjust-sql-console-access\}

「Security」 섹션에서 「SQL console access」 영역을 찾습니다:

<Image img={step_3} size="md"/>

### Service Admin 설정 업데이트 \{#update-settings-for-service-admin\}

Service Admin 역할에 대한 액세스 제어 설정을 변경하려면 Service Admin의 드롭다운 메뉴를 선택합니다:

<Image img={step_4} size="md"/>

다음 역할 중에서 선택할 수 있습니다:

| 역할          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

### Service Read Only 설정 업데이트 \{#update-settings-for-service-read-only\}

Service Read Only 역할에 대한 액세스 제어 설정을 변경하려면 Service Read Only의 드롭다운 메뉴를 선택합니다:

<Image img={step_5} size="md"/>

다음 역할 중에서 선택할 수 있습니다:

| 역할          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

### 액세스 권한이 있는 사용자 검토 \{#review-users-with-access\}

서비스에 대한 사용자 개요는 사용자 수를 선택하여 확인할 수 있습니다:

<Image img={step_6} size="md"/>

페이지 오른쪽에 탭이 열리며 전체 사용자 수와 각 사용자의 역할이 표시됩니다:

<Image img={step_7} size="md"/>

</VerticalStepper>
