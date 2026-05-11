---
sidebar_label: 'Cloud 사용자 관리'
slug: /cloud/security/manage-cloud-users
title: 'Cloud 사용자 관리'
description: '이 페이지에서는 관리자가 사용자를 추가하고 할당을 관리하며 사용자를 제거하는 방법을 설명합니다.'
doc_type: 'guide'
keywords: ['cloud 사용자', '액세스 관리', '보안', '권한', '팀 관리']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/control_plane/1_users_and_roles.png'
import step_2 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/2_invite_user.png'
import step_3 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/3_invite_user.png'
import step_4 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/4_invite_user.png'
import step_5 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/5_edit_user.png'
import step_6 from '@site/static/images/cloud/guides/control_plane/manage_cloud_users/6_edit_user.png'

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

이 가이드는 ClickHouse Cloud에서 Admin 역할을 보유한 사용자를 위한 것입니다.

## 조직에 사용자 추가 \{#add-users\}

### 사용자 초대 \{#invite-users\}

관리자는 한 번에 여러 사용자를 초대하고, 초대하는 시점에 하나 이상의 역할을 할당할 수 있습니다.

<VerticalStepper headerLevel="h3">
  ### 조직 설정으로 이동한 다음 Users and roles를 선택하십시오

  services 페이지에서 조직 이름을 선택합니다. 팝업 메뉴에서 `Users and roles` 메뉴 항목을 선택합니다.

  <Image img={step_1} size="lg" />

  ### 왼쪽 상단에서 `Invite members`를 선택하십시오

  왼쪽 상단의 `Invite members` 버튼을 클릭합니다.

  <Image img={step_2} size="lg" />

  ### 새 구성원의 이메일 주소를 입력하고 역할을 할당하십시오

  초대 화면 상단에 이메일 주소를 입력합니다. 사용자에게 할당할 하나 이상의 역할을 선택합니다.

  <Image img={step_3} size="lg" />

  ### `Send invites`를 클릭하십시오

  화면 하단의 `Send invites`를 클릭합니다. 사용자는 이메일을 받게 되며, 해당 이메일에서 조직에 참여할 수 있습니다. 초대 수락에 대한 자세한 내용은 [내 계정 관리](/cloud/security/manage-my-account)를 참조하십시오.

  <Image img={step_4} size="lg" />
</VerticalStepper>

### SAML ID 공급자를 통해 사용자 추가 \{#users-and-roles-1\}

<EnterprisePlanFeatureBadge feature="SAML SSO" />

조직이 [SAML SSO](/cloud/security/saml-setup)로 구성된 경우, 다음 단계를 따라 조직에 사용자를 추가합니다.

1. ID 공급자의 SAML 애플리케이션에 사용자를 추가합니다. 해당 사용자가 한 번 로그인하기 전까지는 ClickHouse에 나타나지 않습니다.
2. 사용자가 ClickHouse Cloud에 로그인하면 SAML 구성에서 선택한 기본 역할이 자동으로 할당됩니다.
3. 아래 `사용자 역할 할당 관리`의 지침을 따라 권한을 부여합니다.

### SAML 전용 인증 적용 \{#invite-members\}

조직에서 최소 한 명의 SAML 사용자에게 Admin 역할이 할당된 후, 다른 인증 방법을 사용하는 사용자를 모두 제거하여 조직에 SAML 전용 인증만 사용되도록 강제하십시오.

## 사용자 역할 할당 관리

Admin 역할이 할당된 사용자는 언제든지 다른 사용자의 권한을 업데이트할 수 있습니다.

<VerticalStepper headerLevel="h3">
  ### 조직 설정으로 이동하여 Users and roles를 선택합니다

  services 페이지에서 조직 이름을 선택합니다. 팝업 메뉴에서 `Users and roles` 메뉴 항목을 선택합니다.

  <Image img={step_1} size="lg" />

  ### 업데이트할 사용자를 선택하고 Edit를 선택합니다

  액세스를 수정할 사용자의 행 끝에 있는 메뉴를 선택합니다. 팝업 메뉴에서 `edit`를 선택합니다.

  <Image img={step_5} size="lg" />

  ### 권한을 업데이트합니다

  `Roles` 상자를 클릭해 메뉴를 펼칩니다. 확인란을 선택하여 사용자에게 역할을 추가하거나 제거합니다. 역할과 해당 권한 목록은 [Console roles and permissions](/cloud/security/console-roles)를 참조하십시오.

  <Image img={step_6} size="lg" />

  ### 변경 사항을 저장합니다

  탭 하단의 `Save changes` 버튼을 클릭하여 변경 사항을 저장합니다.
</VerticalStepper>

## 사용자 제거 {#remove-user}

:::note SAML 사용자 제거
ID 공급자의 ClickHouse 애플리케이션에서 할당이 해제된 SAML 사용자는 더 이상 ClickHouse Cloud에 로그인할 수 없습니다. 해당 계정은 콘솔에서 제거되지 않으며 수동으로 제거해야 합니다.
:::

아래 단계에 따라 사용자를 제거합니다. 

1. 왼쪽 하단에서 조직 이름을 선택합니다.
2. `Users and roles`를 클릭합니다.
3. 사용자 이름 옆의 점 세 개 아이콘을 클릭한 후 `Remove`를 선택합니다.
4. `Remove user` 버튼을 클릭하여 작업을 확인합니다.