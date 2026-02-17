---
sidebar_label: 'Cloud 사용자 관리'
slug: /cloud/security/manage-cloud-users
title: 'Cloud 사용자 관리'
description: '이 페이지에서는 관리자가 사용자를 추가하고 할당을 관리하며 사용자를 제거하는 방법을 설명합니다.'
doc_type: 'guide'
keywords: ['cloud 사용자', '액세스 관리', '보안', '권한', '팀 관리']
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

이 가이드는 ClickHouse Cloud에서 Organization Admin 역할을 보유한 사용자를 위한 것입니다.


## 조직에 사용자 추가 \{#add-users\}

### 사용자 초대 \{#invite-users\}

관리자는 한 번에 최대 3명의 사용자를 초대할 수 있으며, 초대 시 조직 및 서비스 수준 역할을 함께 부여할 수 있습니다. 

사용자를 초대하려면 다음 단계를 수행하십시오.

1. 화면 왼쪽 하단에서 조직 이름을 선택합니다.
2. `Users and roles`를 클릭합니다.
3. 화면 왼쪽 상단에서 `Invite members`를 선택합니다.
4. 새 사용자 최대 3명의 이메일 주소를 입력합니다.
5. 사용자에게 부여할 조직 및 서비스 역할을 선택합니다.
6. `Send invites`를 클릭합니다.

사용자는 조직에 가입할 수 있는 초대 이메일을 받게 됩니다. 초대 수락 방법에 대한 자세한 내용은 [내 계정 관리](/cloud/security/manage-my-account)를 참고하십시오.

### SAML ID 공급자를 통해 사용자 추가 \{#add-users-via-saml\}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

조직이 [SAML SSO](/cloud/security/saml-setup)로 구성된 경우, 다음 단계를 따라 조직에 사용자를 추가합니다.

1. ID 공급자의 SAML 애플리케이션에 사용자를 추가합니다. 해당 사용자가 한 번 로그인하기 전까지는 ClickHouse에 나타나지 않습니다.
2. 사용자가 ClickHouse Cloud에 로그인하면 자동으로 `Member` 역할이 할당되며, 로그인만 가능하고 그 외의 접근 권한은 없습니다.
3. 아래 `Manage user role assignments`의 지침을 따라 권한을 부여합니다.

### SAML 전용 인증 적용 \{#enforce-saml\}

조직에서 최소 한 명의 SAML 사용자에게 Organization Admin 역할이 할당된 후, 다른 인증 방법을 사용하는 사용자를 모두 제거하여 조직에 SAML 전용 인증만 사용되도록 강제하십시오.

## 사용자 역할 할당 관리 \{#manage-role-assignments\}

Organization Admin 역할이 할당된 사용자는 언제든지 다른 사용자의 권한을 업데이트할 수 있습니다.

<VerticalStepper headerLevel="h3">

### 조직 설정 열기 \{#access-organization-settings\}

서비스 페이지에서 조직 이름을 선택합니다:

<Image img={step_1} size="md"/>

### 사용자 및 역할 열기 \{#access-users-and-roles\}

팝업 메뉴에서 `Users and roles` 메뉴 항목을 선택합니다.

<Image img={step_2} size="md"/>

### 업데이트할 사용자 선택 \{#select-user-to-update\}

액세스 권한을 변경하려는 사용자의 행 끝에 있는 메뉴 항목을 선택합니다:

<Image img={step_3} size="lg"/>

### `edit` 선택 \{#select-edit\}

<Image img={step_4} size="lg"/>

페이지 오른쪽에 탭이 표시됩니다:

<Image img={step_5} size="lg"/>

### 권한 업데이트 \{#update-permissions\}

드롭다운 메뉴에서 항목을 선택하여 콘솔 전체 액세스 권한과 사용자가 ClickHouse 콘솔 내에서 이용할 수 있는 기능을 설정합니다. 역할과 해당 권한 목록은 [Console roles and permissions](/cloud/security/console-roles)을 참고하십시오.

선택된 사용자의 서비스 역할(service role)의 액세스 범위를 조정하려면 드롭다운 메뉴에서 항목을 선택합니다. `Specific services`를 선택하면 서비스별로 사용자의 역할을 제어할 수 있습니다.

<Image img={step_6} size="md"/>

### 변경 사항 저장 \{#save-changes\}

탭 하단의 `Save changes` 버튼을 클릭하여 변경 사항을 저장합니다:

<Image img={step_7} size="md"/>

</VerticalStepper>

## 사용자 제거 \{#remove-user\}

:::note SAML 사용자 제거
ID 공급자의 ClickHouse 애플리케이션에서 할당이 해제된 SAML 사용자는 더 이상 ClickHouse Cloud에 로그인할 수 없습니다. 해당 계정은 콘솔에서 제거되지 않으며 수동으로 제거해야 합니다.
:::

아래 단계에 따라 사용자를 제거합니다. 

1. 왼쪽 하단에서 조직 이름을 선택합니다.
2. `Users and roles`를 클릭합니다.
3. 사용자 이름 옆의 점 세 개 아이콘을 클릭한 후 `Remove`를 선택합니다.
4. `Remove user` 버튼을 클릭하여 작업을 확인합니다.