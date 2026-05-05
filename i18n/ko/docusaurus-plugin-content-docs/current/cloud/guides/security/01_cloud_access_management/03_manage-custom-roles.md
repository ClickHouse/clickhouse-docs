---
sidebar_label: '사용자 지정 역할 관리'
slug: /cloud/guides/security/manage-custom-roles
title: '사용자 지정 역할 관리'
description: '이 페이지에서는 관리자가 사용자 지정 역할을 추가, 수정, 삭제하는 방법을 설명합니다'
doc_type: 'guide'
keywords: ['사용자 지정 역할', '보안', '권한']
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/control_plane/1_users_and_roles.png'
import step_2 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/2_custom_role.png'
import step_3 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/3_custom_role.png'
import step_4 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/4_custom_role.png'
import step_5 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/5_custom_role.png'
import step_6 from '@site/static/images/cloud/guides/control_plane/manage_custom_roles/6_custom_role.png'

이 가이드는 ClickHouse Cloud에서 Admin 역할을 가진 사용자를 대상으로 합니다.

ClickHouse Cloud 고객은 미리 정의된 시스템 역할 중에서 선택하거나, 사용자에게 할당할 사용자 지정 역할을 만들 수 있습니다. 시스템 역할 및 각 역할에 연결된 권한에 대한 자세한 내용은 [Console 역할 및 권한](/cloud/security/console-roles)을 참조하십시오. 이 가이드에서는 사용자 지정 역할을 관리하는 방법을 설명합니다.

## 사용자 지정 역할 만들기 \{#create-custom-role\}

사용자 지정 역할에는 조직, 서비스, 데이터베이스 권한을 조합하여 포함할 수 있습니다. 권한은 모든 서비스와 데이터베이스 또는 그 일부에 적용할 수 있습니다.

<VerticalStepper headerLevel="h3">
  ### 조직 설정으로 이동하여 `Users and roles`를 선택합니다 \{#users-and-roles-1\}

  서비스 페이지에서 조직 이름을 선택합니다. 팝업 메뉴에서 `Users and roles` 메뉴 항목을 선택합니다.

  <Image img={step_1} size="lg" />

  ### `Roles` 탭을 선택합니다 \{#roles-tab\}

  화면 상단 중앙에 있는 `Roles` 탭을 선택합니다.

  <Image img={step_2} size="lg" />

  ### 오른쪽 상단에서 `Create new role`을 선택합니다 \{#create-new-role\}

  화면 오른쪽 상단의 `Create new role` 버튼을 선택합니다.

  <Image img={step_3} size="lg" />

  ### 역할 이름을 입력합니다 \{#name-the-role\}

  역할을 잘 설명하는 이름을 입력합니다. 이 이름은 사용자 및 API 키에 역할을 할당할 때 표시됩니다.

  <Image img={step_4} size="md" />

  ### `Allow`를 클릭하고 권한 범위를 선택합니다 \{#scope-permissions\}

  `Allow` 버튼을 클릭한 다음 Organization, Service 및/또는 Database 권한 중에서 선택합니다. 모든 권한에 대한 설명은 [Console 역할 및 권한](/cloud/security/console-roles)을 참조하십시오.

  :::tip
  콘솔에 로그인할 사용자는 최소한 Organization &gt; Access organization 권한을 갖도록 하십시오.
  :::

  <Image img={step_5} size="md" />

  ### 새 역할을 검토합니다 \{#review-role\}

  마무리하기 전에 새 역할에 할당된 권한을 검토합니다. 완료되면 `Create role`을 클릭합니다.

  <Image img={step_6} size="md" />
</VerticalStepper>

## 사용자 지정 역할 업데이트 \{#update-custom-role\}

사용자 지정 역할은 생성한 후에도 업데이트할 수 있습니다. 역할에서 제거된 권한은 사용자에게서 사라지며, 추가된 권한은 새로 부여됩니다.

:::tip
사용자 권한은 누적됩니다. 사용자가 여러 역할을 통해 특정 작업을 수행할 권한을 가지고 있다면, 그중 하나의 역할에서만 권한이 제거된 경우에는 즉시 액세스 권한을 잃지 않을 수 있습니다.
:::

1. 조직 설정으로 이동한 다음 `Users and roles`를 선택합니다
2. `Roles` 탭을 선택합니다
3. 업데이트할 역할 옆의 점 3개 아이콘을 선택합니다
4. `Edit`를 선택합니다
5. 권한을 수정합니다
6. `Edit role`을 선택합니다

## 사용자 지정 역할 삭제 \{#delete-custom-role\}

사용자 지정 역할은 언제든지 삭제할 수 있습니다.

:::warning
조직에는 관리 권한이 있는 사용자가 최소 1명 이상 있어야 합니다. 역할을 삭제했을 때 마지막 사용자에게서 관리 권한이 제거되는 경우에는 해당 역할을 삭제할 수 없습니다. 이 문제를 해결하려면 사용자 지정 역할을 삭제하기 전에 최소 1명의 사용자에게 Admin 시스템 역할을 할당하십시오.
:::

1. 조직 설정으로 이동하여 `Users and roles`를 선택합니다
2. `Roles` 탭을 선택합니다
3. 삭제하려는 역할 옆의 점 3개 메뉴를 선택합니다
4. 역할이 제거되면 액세스 권한을 잃게 되는 사용자와 API 키를 검토합니다. 필요에 따라 할당을 조정합니다.
5. 프로세스를 완료하려면 `Delete role`을 선택합니다