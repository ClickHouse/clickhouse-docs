---
sidebar_label: 'SAML SSO 제거'
slug: /cloud/security/saml-removal
title: 'SAML SSO 제거'
description: 'ClickHouse Cloud에서 SAML SSO를 제거하는 방법'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', 'single sign-on', 'IdP']
---

# SAML SSO 제거 \{#saml-sso-removal\}

고객은 ID 공급자를 변경하는 등의 이유로 조직에서 SAML 통합을 제거해야 할 수 있습니다. SAML 사용자는 다른 사용자 유형과는 별도의 사용자 ID입니다. 다른 인증 방법으로 전환하려면 아래 지침을 따르십시오.

:::warning
이 작업은 되돌릴 수 없습니다. SAML 통합을 제거하면 SAML 사용자는 복구할 수 없게 무효화됩니다. 조직에 대한 접근 권한을 유지할 수 있도록 아래 지침을 주의 깊게 따르십시오.
:::

## 시작하기 전에 \{#before-you-begin\}

조직에는 SAML이 제거된 이후에도 사용자를 다시 초대할 수 있도록, 대체 인증 방식을 사용하는 관리자 사용자가 한 명 있어야 합니다. 다음 단계를 수행하려면 Admin 권한을 가진 ClickHouse Cloud 사용자가 필요합니다.

<VerticalStepper headerLevel="h3">

### 초대 활성화 \{#enable-invitations\}

[ClickHouse Cloud](https://console.clickhouse.cloud)에 로그인한 후, 제목을 `Enable invitations for SAML organization`로 하여 지원 티켓을 제출하십시오. 이 티켓은 SAML 이외의 방법으로 사용자를 추가할 수 있는 기능을 요청하기 위한 것입니다.

### 재초대할 사용자 확인 \{#note-users-to-be-reinvited\}

왼쪽 하단에서 조직 이름을 클릭한 다음 `Users and Roles`를 선택하십시오. 각 사용자에 대해 `Provider` 컬럼을 확인하고, `Signed in with SSO`로 표시되는 모든 사용자는 SAML이 제거된 이후 조직으로 다시 초대해야 합니다.

SAML이 제거된 후 계정에 액세스하기 전에 새 초대를 수락해야 한다는 점을 사용자에게 반드시 알리십시오.

</VerticalStepper>

## SAML이 아닌 사용자를 조직에 추가 \{#add-non-saml-users\}

<VerticalStepper headerLevel="h3">

### 사용자 초대 \{#invite-users\}

왼쪽 하단에서 조직 이름을 클릭한 다음 `Users and Roles`를 선택합니다. [Invite users](/cloud/security/manage-cloud-users#invite-users) 안내에 따라 진행합니다. 

### 사용자의 초대 수락 \{#accept-invitation\}

사용자는 초대를 수락하기 전에 모든 SAML 연결에서 완전히 로그아웃해야 합니다. Google 또는 Microsoft 소셜 로그인을 사용해 초대를 수락하는 경우 `Continue with Google` 또는 `Continue with Microsoft` 버튼을 클릭해야 합니다. 이메일과 비밀번호를 사용하는 사용자는 https://console.clickhouse.cloud/?with=email 로 이동해 로그인한 뒤 초대를 수락해야 합니다.

:::note
사용자가 SAML 구성에 따라 자동으로 리디렉션되지 않도록 하는 가장 좋은 방법은 초대 수락 링크를 복사한 다음, 별도의 브라우저나 프라이빗/시크릿 브라우징 세션에 붙여넣어 그 세션에서 초대를 수락하도록 하는 것입니다.
::: 

### 쿼리와 대시보드 저장 \{#save-queries-and-dashboards\}

사용자가 새 계정으로 로그인한 후, 한 번 로그아웃한 다음 SAML 계정으로 다시 로그인하여 저장된 쿼리나 대시보드를 새 계정과 공유해야 합니다. 그런 다음 새 계정으로 해당 항목의 복사본을 저장해 절차를 완료합니다.

</VerticalStepper>

## SAML 제거 \{#remove-saml\}

다음 항목이 모두 완료되었는지 신중하게 확인하십시오:

- 조직에 SAML이 아닌 로그인 방식을 사용하는 Admin 역할이 부여된 사용자가 최소 1명 존재합니다.
- 필요한 모든 사용자가 다른 인증 방법을 사용하여 다시 초대되었습니다.
- 모든 저장된 쿼리와 대시보드가 SAML이 아닌 사용자 계정으로 이전되었습니다.

위 항목을 모두 완료했다면 Organization settings 탭으로 이동하여 `Enable SAML single sign-on` 설정을 토글하십시오. 경고 메시지가 표시됩니다. `Disable`을 클릭하십시오. 그런 다음 Users and roles 탭으로 이동하여 SAML 사용자를 제거하십시오.