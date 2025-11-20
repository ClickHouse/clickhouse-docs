---
'sidebar_label': '클라우드 사용자 관리'
'slug': '/cloud/security/manage-cloud-users'
'title': '클라우드 사용자 관리'
'description': '이 페이지에서는 관리자가 사용자를 추가하고, 할당을 관리하며, 사용자를 제거하는 방법을 설명합니다.'
'doc_type': 'guide'
'keywords':
- 'cloud users'
- 'access management'
- 'security'
- 'permissions'
- 'team management'
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/org_level_access/1_org_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/org_level_access/2_org_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/org_level_access/3_org_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/org_level_access/4_org_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/org_level_access/5_org_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/org_level_access/6_org_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/org_level_access/7_org_settings.png'
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

이 가이드는 ClickHouse Cloud에서 Organization Admin 역할을 가진 사용자를 위한 것입니다.

## 사용자를 조직에 추가하기 {#add-users}

### 사용자 초대하기 {#invite-users}

관리자는 한 번에 최대 세 명(3명의) 사용자를 초대하고 초대 시 조직 및 서비스 레벨 역할을 지정할 수 있습니다.

사용자를 초대하려면:
1. 왼쪽 하단 모서리에서 조직 이름을 선택합니다.
2. `사용자 및 역할`을 클릭합니다.
3. 왼쪽 상단 모서리에서 `구성원 초대`를 선택합니다.
4. 최대 3명의 새로운 사용자의 이메일 주소를 입력합니다.
5. 사용자에게 할당할 조직 및 서비스 역할을 선택합니다.
6. `초대 보내기`를 클릭합니다.

사용자는 조직에 가입할 수 있는 이메일을 받게 됩니다. 초대 수락에 대한 자세한 내용은 [내 계정 관리](/cloud/security/manage-my-account)를 참조하세요.

### SAML ID 공급자를 통한 사용자 추가 {#add-users-via-saml}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

조직이 [SAML SSO](/cloud/security/saml-setup)로 구성되어 있는 경우, 다음 단계를 따라 사용자를 조직에 추가하십시오.

1. ID 공급자의 SAML 애플리케이션에 사용자를 추가합니다. 사용자가 한 번 로그인하기 전까지 ClickHouse에 나타나지 않습니다.
2. 사용자가 ClickHouse Cloud에 로그인하면 `회원` 역할이 자동으로 할당되며 로그인만 가능하고 다른 접근 권한은 없습니다.
3. 아래의 `사용자 역할 할당 관리` 지침을 따라 권한을 부여합니다.

### SAML 전용 인증 시행 {#enforce-saml}

조직에 SAML 사용자 중 하나가 Organization Admin 역할로 할당된 후, 조직에서 다른 인증 방법을 가진 사용자를 제거하여 SAML 전용 인증을 시행하십시오.

## 사용자 역할 할당 관리 {#manage-role-assignments}

Organization Admin 역할이 할당된 사용자는 언제든지 다른 사용자의 권한을 업데이트할 수 있습니다.

<VerticalStepper headerLevel="h3">

### 조직 설정 접근하기 {#access-organization-settings}

서비스 페이지에서 조직 이름을 선택합니다:

<Image img={step_1} size="md"/>

### 사용자 및 역할 접근하기 {#access-users-and-roles}

팝업 메뉴에서 `사용자 및 역할` 항목을 선택하십시오.

<Image img={step_2} size="md"/>

### 업데이트할 사용자 선택하기 {#select-user-to-update}

접근을 수정하려는 사용자의 행 끝에 있는 메뉴 항목을 선택합니다:

<Image img={step_3} size="lg"/>

### `편집` 선택하기 {#select-edit}

<Image img={step_4} size="lg"/>

페이지 오른쪽에 탭이 표시됩니다:

<Image img={step_5} size="lg"/>

### 권한 업데이트하기 {#update-permissions}

드롭다운 메뉴 항목을 선택하여 콘솔 전반의 접근 권한 및 ClickHouse 콘솔 내에서 사용자가 접근할 수 있는 기능을 조정합니다. 역할 및 관련 권한 목록은 [콘솔 역할 및 권한](/cloud/security/console-roles)을 참조하십시오.

드롭다운 메뉴 항목을 선택하여 선택한 사용자의 서비스 역할의 접근 범위를 조정합니다. `특정 서비스`를 선택하면 서비스별로 사용자의 역할을 제어할 수 있습니다.

<Image img={step_6} size="md"/>

### 변경 사항 저장하기 {#save-changes}

탭 하단의 `변경 사항 저장` 버튼으로 변경 사항을 저장합니다:

<Image img={step_7} size="md"/>

</VerticalStepper>

## 사용자 제거하기 {#remove-user}
:::note SAML 사용자 제거
ID 공급자의 ClickHouse 애플리케이션에서 할당 해제된 SAML 사용자는 ClickHouse Cloud에 로그인할 수 없습니다. 계정은 콘솔에서 제거되지 않으며 수동으로 제거해야 합니다.
:::

사용자를 제거하려면 아래 단계를 따릅니다.

1. 왼쪽 하단 모서리에서 조직 이름을 선택합니다.
2. `사용자 및 역할`을 클릭합니다.
3. 사용자 이름 옆의 세 개의 점을 클릭하고 `제거`를 선택합니다.
4. `사용자 제거` 버튼을 클릭하여 작업을 확인합니다.
