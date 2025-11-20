---
'sidebar_label': 'SAML SSO 설정'
'slug': '/cloud/security/saml-setup'
'title': 'SAML SSO 설정'
'description': 'ClickHouse Cloud와 함께 SAML SSO를 설정하는 방법'
'doc_type': 'guide'
'keywords':
- 'ClickHouse Cloud'
- 'SAML'
- 'SSO'
- 'single sign-on'
- 'IdP'
- 'Okta'
- 'Google'
---

import Image from '@theme/IdealImage';
import samlOrgId from '@site/static/images/cloud/security/saml-org-id.png';
import samlOktaSetup from '@site/static/images/cloud/security/saml-okta-setup.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# SAML SSO 설정

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud는 보안 주장 마크업 언어(SAML)를 통한 단일 로그인(SSO)을 지원합니다. 이를 통해 신원 공급자(IdP)로 인증하여 ClickHouse Cloud 조직에 안전하게 로그인할 수 있습니다.

현재 서비스 공급자 주도 SSO, 별도의 연결을 사용하는 여러 조직 및 즉시 프로비저닝을 지원합니다. 크로스 도메인 신원 관리 시스템(SCIM)이나 속성 매핑은 아직 지원하지 않습니다.

## 시작하기 전에 {#before-you-begin}

IdP에서 관리자 권한 및 ClickHouse Cloud 조직에서 **Admin** 역할이 필요합니다. IdP 내에서 연결을 설정한 후 아래 절차에서 요청한 정보를 가지고 저희에게 연락하여 프로세스를 완료하십시오.

로그인 프로세스를 간소화하기 위해 SAML 연결 외에 조직에 대한 **직접 링크**를 설정하는 것을 권장합니다. 각 IdP는 이를 다르게 처리합니다. 귀하의 IdP에 대해 이를 설정하는 방법은 계속 읽어보십시오.

## IdP 구성 방법 {#how-to-configure-your-idp}

### 단계 {#steps}

<details>
   <summary>  조직 ID 얻기  </summary>
   
   모든 설정은 조직 ID가 필요합니다. 조직 ID를 얻으려면:

   1. [ClickHouse Cloud](https://console.clickhouse.cloud) 조직에 로그인합니다.
   
      <Image img={samlOrgId} size="md" alt="조직 ID" force/>
      
   3. 왼쪽 하단에서 **조직** 아래의 조직 이름을 클릭합니다.
   
   4. 팝업 메뉴에서 **조직 세부정보**를 선택합니다.
   
   5. 아래에서 사용할 **조직 ID**를 기록해 둡니다.
      
</details>

<details> 
   <summary>  SAML 통합 구성  </summary>
   
   ClickHouse는 서비스 공급자 주도 SAML 연결을 사용합니다. 즉, https://console.clickhouse.cloud 또는 직접 링크를 통해 로그인할 수 있습니다. 현재 신원 공급자 주도 연결은 지원하지 않습니다. 기본 SAML 구성에는 다음이 포함됩니다:

- SSO URL 또는 ACS URL:  `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` 

- Audience URI 또는 Entity ID: `urn:auth0:ch-production:{organizationid}` 

- 애플리케이션 사용자 이름: `email`

- 속성 매핑: `email = user.email`

- 조직에 접근하기 위한 직접 링크: `https://console.clickhouse.cloud/?connection={organizationid}` 

   특정 구성 단계는 아래의 특정 신원 공급자를 참조하십시오.
   
</details>

<details>
   <summary>  연결 정보 얻기  </summary>

   신원 공급자 SSO URL 및 x.509 인증서를 얻습니다. 이 정보를 검색하는 방법에 대한 지침은 아래의 특정 신원 공급자를 참조하십시오.

</details>

<details>
   <summary>  지원 사례 제출  </summary>
   
   1. ClickHouse Cloud 콘솔로 돌아갑니다.
      
   2. 왼쪽에서 **도움말**을 선택한 다음, 지원 하위 메뉴를 선택합니다.
   
   3. **새 사례**를 클릭합니다.
   
   4. 주제로 "SAML SSO 설정"을 입력합니다.
   
   5. 설명란에 위에서 수집한 링크를 붙여넣고 티켓에 인증서를 첨부합니다.
   
   6. 이 연결에 대해 어떤 도메인이 허용되어야 하는지 알려주세요 (예: domain.com, domain.ai 등).
   
   7. 새 사례를 만듭니다.
   
   8. ClickHouse Cloud 내에서 설정을 완료하고 테스트 준비가 되었을 때 알려드리겠습니다.

</details>

<details>
   <summary>  설정 완료  </summary>

   1. 신원 공급자에서 사용자 액세스를 할당합니다. 

   2. https://console.clickhouse.cloud 또는 위의 'SAML 통합 구성'에서 구성한 직접 링크를 통해 ClickHouse에 로그인합니다. 사용자는 처음에 'Member' 역할이 할당되어 조직에 로그인하고 개인 설정을 업데이트할 수 있습니다.

   3. ClickHouse 조직에서 로그아웃합니다. 

   4. 원래 인증 방법으로 로그인하여 새로운 SSO 계정에 Admin 역할을 할당합니다.
- 이메일 + 비밀번호 계정의 경우 `https://console.clickhouse.cloud/?with=email`을 사용해 주세요.
- 소셜 로그인의 경우, 적절한 버튼(**Continue with Google** 또는 **Continue with Microsoft**)을 클릭해 주세요.

:::note
`?with=email`의 `email`은 리터럴 매개변수 값이며, 플레이스홀더가 아닙니다.
:::

   5. 원래 인증 방법으로 로그아웃하고 https://console.clickhouse.cloud 또는 위의 'SAML 통합 구성'에서 구성한 직접 링크를 통해 다시 로그인합니다.

   6. 비SAML 사용자 제거하기 - organizaiton에 대해 SAML을 활성화합니다. 앞으로 사용자는 귀하의 신원 공급자를 통해 할당됩니다.
   
</details>

### Okta SAML 구성 {#configure-okta-saml}

각 ClickHouse 조직에 대해 Okta에서 두 개의 앱 통합을 구성합니다: 하나의 SAML 앱과 하나의 직접 링크를 위한 북마크입니다.

<details>
   <summary>  1. 액세스를 관리할 그룹 생성  </summary>
   
   1. **관리자**로 Okta 인스턴스에 로그인합니다.

   2. 왼쪽의 **그룹**을 선택합니다.

   3. **그룹 추가**를 클릭합니다.

   4. 그룹의 이름과 설명을 입력합니다. 이 그룹은 SAML 앱과 관련된 북마크 앱 간의 사용자 일관성을 유지하는 데 사용됩니다.

   5. **저장**을 클릭합니다.

   6. 생성한 그룹의 이름을 클릭합니다.

   7. **사용자 할당**을 클릭하여 ClickHouse 조직에 액세스할 수 있는 사용자를 할당합니다.

</details>

<details>
   <summary>  2. 사용자들이 원활하게 로그인할 수 있도록 북마크 앱 생성  </summary>
   
   1. 왼쪽에서 **애플리케이션**을 선택한 다음 **애플리케이션** 하위 제목을 선택합니다.
   
   2. **앱 카탈로그 탐색**을 클릭합니다.
   
   3. **Bookmark App**을 검색하고 선택합니다.
   
   4. **통합 추가**를 클릭합니다.
   
   5. 앱의 레이블을 선택합니다.
   
   6. URL을 `https://console.clickhouse.cloud/?connection={organizationid}`로 입력합니다.
   
   7. **할당** 탭으로 이동하여 위에서 생성한 그룹을 추가합니다.
   
</details>

<details>
   <summary>  3. 연결을 활성화하기 위한 SAML 앱 생성  </summary>
   
   1. 왼쪽에서 **애플리케이션**을 선택한 다음 **애플리케이션** 하위 제목을 선택합니다.
   
   2. **앱 통합 만들기**를 클릭합니다.
   
   3. SAML 2.0을 선택하고 다음을 클릭합니다.
   
   4. 애플리케이션 이름을 입력하고 **사용자에게 애플리케이션 아이콘을 표시하지 않음** 옆의 체크박스를 체크한 후 **다음**을 클릭합니다. 
   
   5. 다음 값을 사용하여 SAML 설정 화면을 채웁니다.
   
      | 필드                          | 값 |
      |--------------------------------|-------|
      | 단일 사인온 URL             | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Audience URI (SP Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | 기본 RelayState             | 비워 두기       |
      | Name ID 형식                 | 지정되지 않음       |
      | 애플리케이션 사용자 이름           | 이메일             |
      | 애플리케이션 사용자 이름 업데이트 | 생성 및 업데이트 |
   
   7. 다음 Attribute Statement을 입력합니다.

      | 이름    | 이름 형식   | 값      |
      |---------|---------------|------------|
      | email   | Basic         | user.email |
   
   9. **다음**을 클릭합니다.
   
   10. 피드백 화면에서 요청한 정보를 입력하고 **완료**를 클릭합니다.
   
   11. **할당** 탭으로 이동하여 위에서 생성한 그룹을 추가합니다.
   
   12. 새 앱의 **Sign On** 탭에서 **SAML 설정 지침 보기** 버튼을 클릭합니다. 
   
         <Image img={samlOktaSetup} size="md" alt="Okta SAML 설정 지침" force/>
   
   13. 이 세 가지 항목을 수집하고 프로세스를 완료하기 위해 위의 지원 사례 제출로 이동합니다.
     - 신원 공급자 단일 사인온 URL
     - 신원 공급자 발급자
     - X.509 인증서
   
</details>

### Google SAML 구성 {#configure-google-saml}

각 조직에 대해 Google에서 하나의 SAML 앱을 구성하고 사용자가 북마크할 수 있도록 직접 링크(`https://console.clickhouse.cloud/?connection={organizationId}`)를 제공해야 합니다. 특히 여러 조직의 SSO를 사용하는 경우 필수입니다.

<details>
   <summary>  Google 웹 앱 생성  </summary>
   
   1. Google 관리자 콘솔(admin.google.com)로 이동합니다.

   <Image img={samlGoogleApp} size="md" alt="Google SAML 앱" force/>

   2. 왼쪽에서 **앱**, 그런 다음 **웹 및 모바일 앱**을 클릭합니다.
   
   3. 상단 메뉴에서 **앱 추가**를 클릭한 후 **사용자 정의 SAML 앱 추가**를 선택합니다.
   
   4. 앱의 이름을 입력하고 **계속**을 클릭합니다.
   
   5. 이 두 항목을 수집하고 위의 지원 사례를 제출하여 저희에게 정보를 제출하십시오. 주의: 이 데이터를 복사하기 전에 설정을 완료한 경우, 앱의 홈 화면에서 **메타데이터 다운로드**를 클릭하여 X.509 인증서를 얻으세요.
     - SSO URL
     - X.509 인증서
   
   7. 아래에 ACS URL 및 Entity ID를 입력합니다.
   
      | 필드     | 값 |
      |-----------|-------|
      | ACS URL   | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | Entity ID | `urn:auth0:ch-production:{organizationid}` |
   
   8. **서명된 응답** 옵션을 체크합니다.
   
   9. Name ID 형식으로 **이메일**을 선택하고 Name ID를 **기본 정보 > 주요 이메일**로 남겨둡니다.
   
   10. **계속**을 클릭합니다.
   
   11. 다음 Attribute 매핑을 입력합니다:
       
      | 필드             | 값         |
      |-------------------|---------------|
      | 기본 정보 | 주요 이메일 |
      | 앱 속성    | 이메일         |
       
   13. **완료**를 클릭합니다.
   
   14. 앱을 활성화하려면 모든 사용자에게 대해 **OFF**를 클릭한 후 설정을 **ON**으로 변경합니다. 액세스는 화면 왼쪽에서 그룹이나 조직 단위를 선택하여 제한할 수도 있습니다.
       
</details>

### Azure (Microsoft) SAML 구성 {#configure-azure-microsoft-saml}

Azure (Microsoft) SAML은 Azure Active Directory (AD) 또는 Microsoft Entra로도 알려질 수 있습니다.

<details>
   <summary>  Azure 기업 애플리케이션 생성  </summary>
   
   각 조직에 대해 별도의 로그인 URL이 있는 하나의 애플리케이션 통합을 설정합니다.
   
   1. Microsoft Entra 관리 센터에 로그인합니다.
   
   2. 왼쪽에서 **애플리케이션 > 기업 애플리케이션**으로 이동합니다.
   
   3. 상단 메뉴에서 **신규 애플리케이션**을 클릭합니다.
   
   4. 상단 메뉴에서 **자신의 애플리케이션 만들기**를 클릭합니다.
   
   5. 이름을 입력하고 **갤러리에서 찾을 수 없는 다른 애플리케이션 통합(비 갤러리)**을 선택한 후 **생성**을 클릭합니다.
   
      <Image img={samlAzureApp} size="md" alt="Azure 비 갤러리 앱" force/>
   
   6. 왼쪽에서 **사용자 및 그룹**을 클릭하고 사용자를 할당합니다.
   
   7. 왼쪽에서 **단일 사인온**을 클릭합니다.
   
   8. **SAML**을 클릭합니다.
   
   9. 다음 설정을 사용하여 기본 SAML 구성 화면을 채웁니다.
   
      | 필드                     | 값 |
      |---------------------------|-------|
      | 식별자 (Entity ID)    | `urn:auth0:ch-production:{organizationid}` |
      | 응답 URL (Assertion Consumer Service URL) | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 로그인 URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 비워 두기 |
      | 로그아웃 URL                | 비워 두기 |
   
   11. Attributes & Claims에서 다음을 추가(A) 또는 업데이트(U)합니다:
   
       | 주장 이름                           | 형식        | 소스 속성 |
       |--------------------------------------|---------------|------------------|
       | (U) 고유 사용자 식별자 (Name ID) | 이메일 주소 | user.mail        |
       | (A) 이메일                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | 생략         | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="속성과 주장" force/>
   
   12. 다음 두 항목을 수집하고 위의 지원 사례 제출로 이동하여 프로세스를 완료합니다:
     - 로그인 URL
     - 인증서 (Base64)

</details>

### Duo SAML 구성 {#configure-duo-saml}

<details>
   <summary> Duo를 위한 일반 SAML 서비스 공급자 생성  </summary>
   
   1. [일반 SAML 서비스 공급자를 위한 Duo 단일 사인온](https://duo.com/docs/sso-generic) 지침을 따릅니다.
   
   2. 다음 Bridge Attribute 매핑을 사용합니다:

      |  Bridge Attribute  |  ClickHouse Attribute  | 
      |:-------------------|:-----------------------|
      | 이메일 주소      | 이메일                  |
   
   3. 다음 값을 사용하여 Duo에서 Cloud 애플리케이션을 업데이트합니다:

      |  필드    |  값                                     |
      |:----------|:-------------------------------------------|
      | Entity ID | `urn:auth0:ch-production:{organizationid}` |
      | Assertion Consumer Service (ACS) URL | `https://auth.clickhouse.cloud/login/callback?connection={organizationid}` |
      | 서비스 공급자 로그인 URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. 이 두 항목을 수집하고 위의 지원 사례 제출로 이동하여 프로세스를 완료합니다:
      - 단일 사인온 URL
      - 인증서
   
</details>

## 작동 방식 {#how-it-works}

### SAML SSO를 통한 사용자 관리 {#user-management-with-saml-sso}

사용자 권한 관리 및 SAML 연결에 대한 접근 제한에 대한 자세한 내용은 [클라우드 사용자 관리](/cloud/security/manage-cloud-users)를 참조하십시오.

### 서비스 공급자 주도 SSO {#service-provider-initiated-sso}

우리는 서비스 공급자 주도 SSO만 사용합니다. 즉, 사용자는 `https://console.clickhouse.cloud`로 이동하여 이메일 주소를 입력하여 인증을 위해 IdP로 리디렉션됩니다. 이미 IdP를 통해 인증된 사용자는 로그인 페이지에서 이메일 주소를 입력하지 않고도 직접 링크를 이용하여 자동으로 조직에 로그인할 수 있습니다.

### 다중 조직 SSO {#multi-org-sso}

ClickHouse Cloud는 각 조직에 대해 별도의 연결을 제공하여 다중 조직 SSO를 지원합니다. 각 조직에 로그인할 때 직접 링크(`https://console.clickhouse.cloud/?connection={organizationid}`)를 사용하십시오. 다른 조직에 로그인하기 전에 반드시 한 조직에서 로그아웃하십시오.

## 추가 정보 {#additional-information}

보안은 인증에 있어 우리의 최우선 사항입니다. 이러한 이유로, SSO 구현 시 몇 가지 결정을 내렸습니다. 사용자에게 알려야 할 사항은 다음과 같습니다.

- **서비스 공급자 주도 인증 흐름만 처리합니다.** 사용자들은 `https://console.clickhouse.cloud`로 이동하여 이메일 주소를 입력하여 신원 공급자로 리디렉션됩니다. 사용자들은 URL을 기억할 필요가 없도록 북마크 애플리케이션 또는 바로 가기를 추가하는 방법에 대한 지침을 제공합니다.

- **SSO 및 비SSO 계정을 자동으로 연결하지 않습니다.** 동일한 이메일 주소를 사용하는 경우에도 ClickHouse 사용자 목록에서 여러 계정을 볼 수 있습니다.

## 일반 문제 해결 {#troubleshooting-common-issues}

| 오류 | 원인 | 해결책 | 
|:------|:------|:---------|
| 시스템에 잘못된 구성이 있거나 서비스 중단이 있을 수 있습니다 | 신원 공급자 주도 로그인 | 이 오류를 해결하려면 직접 링크 `https://console.clickhouse.cloud/?connection={organizationid}`를 사용해 보십시오. 위의 신원 공급자에 대한 지침을 따라 사용자의 기본 로그인 방법으로 설정하시기 바랍니다. | 
| 신원 공급자로 리디렉션된 후 로그인 페이지로 돌아갑니다 | 신원 공급자에 이메일 속성 매핑이 없습니다 | 위의 신원 공급자에 대한 지침을 따라 사용자 이메일 속성을 구성하고 다시 로그인합니다. | 
| 사용자가 이 애플리케이션에 할당되지 않았습니다 | 사용자가 신원 공급자의 ClickHouse 애플리케이션에 할당되지 않았습니다 | 신원 공급자에서 애플리케이션에 사용자를 할당하고 다시 로그인합니다. |
| 여러 ClickHouse 조직과 SAML SSO를 통합했으나, 사용한 링크나 타일과 관계없이 항상 같은 조직에 로그인되어 있습니다 | 첫 번째 조직에 여전히 로그인되어 있습니다 | 로그아웃한 후 다른 조직에 로그인합니다. |
| URL이 잠깐 `access denied`를 표시합니다 | 귀하의 이메일 도메인이 설정한 도메인과 일치하지 않습니다 | 이 오류를 해결하기 위해 지원팀에 문의하십시오. |
