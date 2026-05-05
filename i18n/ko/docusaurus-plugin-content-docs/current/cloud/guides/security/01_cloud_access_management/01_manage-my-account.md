---
sidebar_label: '내 계정 관리'
slug: /cloud/security/manage-my-account
title: '내 계정 관리'
description: '이 페이지에서는 초대 수락, MFA 설정 관리 및 비밀번호 재설정 방법을 설명합니다'
doc_type: 'guide'
keywords: ['계정 관리', '사용자 프로필', '보안', '클라우드 콘솔', '설정']
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


## 초대 수락 \{#accept-invitation\}

조직에 참여하기 위한 초대는 여러 가지 방법으로 수락할 수 있습니다. 처음 초대를 받는 경우라면, 아래에서 조직에 적합한 인증 방법을 선택하십시오. 

이미 다른 조직에 속해 있는 경우에는 기존 조직으로 먼저 로그인한 다음 페이지 왼쪽 하단에서 초대를 수락하거나, 이메일에서 초대를 수락한 뒤 기존 계정으로 로그인하십시오. 

:::note SAML Users
SAML을 사용하는 조직은 ClickHouse 조직마다 고유한 로그인 방법이 있습니다. 로그인하려면 관리자에게서 제공받은 직접 링크를 사용하십시오.
:::

### 이메일 및 비밀번호 \{#email-and-password\}

ClickHouse Cloud에서는 이메일 주소와 비밀번호로 인증할 수 있습니다. 이 방법을 사용할 때 ClickHouse 계정을 보호하는 가장 좋은 방법은 강도 높은 비밀번호를 사용하는 것입니다. 기억하기 쉬운 비밀번호를 만드는 데 도움을 주는 온라인 자료가 많이 있습니다. 또는 무작위 비밀번호 생성기를 사용하고, 비밀번호 관리자를 통해 비밀번호를 저장하여 보안을 강화할 수도 있습니다.

비밀번호는 최소 12자 이상이어야 하며, 다음 네 가지 복잡성 요구 사항 중 세 가지를 충족해야 합니다: 대문자, 소문자, 숫자 및/또는 특수 문자.

### 소셜 싱글 사인온(SSO) \{#social-sso\}

서비스에 가입하거나 초대를 수락하려면 `Continue with Google` 또는 `Continue with Microsoft Account`를 사용합니다.

회사에서 Google Workspace 또는 Microsoft 365를 사용 중인 경우, 기존 싱글 사인온 구성을 ClickHouse Cloud에서 그대로 활용할 수 있습니다. 이를 위해 회사 이메일 주소로 가입한 뒤, 다른 사용자들도 각자의 회사 이메일 주소로 초대하십시오. 이렇게 하면 사용자는 ClickHouse Cloud에 인증하기 전에, 아이덴티티 프로바이더를 거치든 Google 또는 Microsoft 인증을 사용하든 회사의 로그인 절차를 통해 먼저 로그인해야 합니다. 

### SAML single sign-on (SSO) \{#saml-sso\}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

SAML SSO를 사용하는 경우 사용자는 로그인 시 해당 아이덴티티 제공자(IdP)에 의해 자동으로 추가됩니다. Organization Admin 역할을 가진 ClickHouse Cloud 사용자는 SAML 사용자에게 할당된 [역할을 관리](/cloud/security/manage-cloud-users)하고, SAML을 유일한 인증 방법으로 적용하도록 강제할 수 있습니다.

## 다중 요소 인증(MFA) 관리 \{#mfa\}

이메일 + 비밀번호 또는 소셜 인증을 사용하는 사용자는 다중 요소 인증(MFA)을 통해 계정을 추가로 보호할 수 있습니다. MFA를 설정하려면 다음 단계를 따르십시오:

1. [console.clickhouse.cloud](https://console.clickhouse.cloud/)에 로그인합니다.
2. 왼쪽 상단 ClickHouse 로고 옆에 있는 이름 이니셜을 클릭합니다.
3. Profile을 선택합니다.
4. 왼쪽에서 Security를 선택합니다.
5. Authenticator app 타일에서 `Set up`을 클릭합니다.
6. Authy, 1Password, Google Authenticator와 같은 인증 앱을 사용하여 QR 코드를 스캔합니다.
7. 코드를 입력하여 확인합니다.
8. 다음 화면에서 복구 코드를 복사하여 안전한 위치에 보관합니다.
9. `I have safely recorded this code` 옆의 확인란을 선택합니다.
10. `Continue`를 클릭합니다.

### 새 복구 코드 받기 \{#obtain-recovery-code\}

이전에 MFA를 등록했으나 복구 코드를 생성하지 않았거나 분실한 경우, 다음 단계를 따라 새 복구 코드를 받을 수 있습니다:

1. https://console.clickhouse.cloud 로 이동합니다.
2. 로그인 자격 증명과 MFA로 로그인합니다.
3. 왼쪽 상단의 프로필로 이동합니다.
4. 왼쪽 메뉴에서 Security를 클릭합니다.
5. Authenticator app 옆의 휴지통 아이콘을 클릭합니다.
6. Remove authenticator app을 클릭합니다.
7. 코드를 입력한 후 Continue를 클릭합니다.
8. Authenticator app 섹션에서 Set up을 클릭합니다.
9. QR 코드를 스캔한 다음 새 코드를 입력합니다.
10. 복구 코드를 복사하여 안전한 위치에 보관합니다.
11. `I have safely recorded this code` 옆의 체크박스를 선택합니다.
12. Continue를 클릭합니다.

## 계정 복구 \{#account-recovery\}

### 비밀번호를 잊은 경우 \{#forgot-password\}

비밀번호를 잊은 경우, 다음 단계를 따라 비밀번호를 직접 복구합니다.

1. https://console.clickhouse.cloud 로 이동합니다.
2. 이메일 주소를 입력하고 「Continue」를 클릭합니다.
3. 「Forgot your password?」를 클릭합니다.
4. 「Send password reset link」를 클릭합니다.
5. 이메일을 확인한 후, 이메일에서 「Reset password」를 클릭합니다.
6. 새 비밀번호를 입력하고 비밀번호를 다시 입력해 확인한 뒤 「Update password」를 클릭합니다.
7. 「Back to sign in」을 클릭합니다.
8. 새 비밀번호로 다시 로그인합니다.

### MFA 셀프 서비스 복구 \{#mfa-self-serivce-recovery\}

MFA 기기를 분실했거나 토큰을 삭제한 경우, 다음 단계를 따라 복구하고 새 토큰을 생성합니다:

1. https://console.clickhouse.cloud으로 이동합니다.
2. 자격 증명을 입력하고 「Continue」를 클릭합니다.
3. Multi-factor authentication 화면에서 「Cancel」을 클릭합니다.
4. 「Recovery code」를 클릭합니다.
5. 코드를 입력하고 「Continue」를 클릭합니다.
6. 새 복구 코드를 복사하여 안전한 위치에 보관합니다.
7. `I have safely recorded this code` 옆의 상자를 클릭하고 「Continue」를 클릭합니다.
8. 로그인한 후 화면 왼쪽 상단의 프로필로 이동합니다.
9. 화면 왼쪽 상단에서 「security」를 클릭합니다.
10. 기존 인증 앱을 제거하려면 「Authenticator app」 옆의 휴지통 아이콘을 클릭합니다.
11. 「Remove authenticator app」을 클릭합니다.
12. Multi-factor authentication 입력을 요청받으면 「Cancel」을 클릭합니다.
13. 「Recovery code」를 클릭합니다.
14. 복구 코드를 입력하고(7단계에서 새로 생성된 코드) 「Continue」를 클릭합니다.
15. 새 복구 코드를 복사하여 안전한 위치에 보관합니다. 제거 과정 중 화면을 벗어나는 상황에 대비한 안전 장치입니다.
16. `I have safely recorded this code` 옆의 상자를 클릭하고 「Continue」를 클릭합니다.
17. 위의 절차를 따라 새 MFA 수단을 설정합니다.

### MFA 및 복구 코드 분실 \{#lost-mfa-and-recovery-code\}

MFA 기기와 복구 코드를 모두 분실했거나 MFA 기기를 분실했고 복구 코드를 발급받지 않은 경우, 재설정을 요청하려면 다음 단계를 따르십시오.

**티켓 제출**: 조직 내에 다른 관리자 사용자가 있는 경우(단일 사용자 조직에 액세스하려는 상황이라도), Admin 역할이 할당된 조직 구성원에게 조직에 로그인하여 사용자를 대신해 MFA 재설정을 위한 지원 티켓을 제출해 달라고 요청하십시오. 요청이 적절히 인증되었는지 확인한 후 MFA를 재설정하고 Admin에게 알립니다. 이후 평소처럼 MFA 없이 로그인한 다음 프로필 설정으로 이동하여 필요하다면 새로운 인증 수단을 등록하십시오.

**이메일을 통한 재설정**: 조직 내 유일한 사용자라면 계정에 연결된 이메일 주소를 사용하여 이메일(support@clickhouse.com)로 지원 요청을 제출하십시오. 요청이 해당 이메일 주소에서 접수되었음을 확인한 후 MFA와 비밀번호를 모두 재설정합니다. 이메일에 전송된 비밀번호 재설정 링크를 열어 새 비밀번호를 설정한 다음, 프로필 설정으로 이동하여 필요하다면 새로운 인증 수단을 등록하십시오. 