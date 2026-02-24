---
sidebar_label: 'SAML SSO 설정'
slug: /cloud/security/saml-setup
title: 'SAML SSO 설정'
description: 'ClickHouse Cloud에서 SAML SSO를 설정하는 방법'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', '싱글 사인온', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlSelfServe1 from '@site/static/images/cloud/security/saml-self-serve-1.png';
import samlSelfServe2 from '@site/static/images/cloud/security/saml-self-serve-2.png';
import samlSelfServe3 from '@site/static/images/cloud/security/saml-self-serve-3.png';
import samlSelfServe4 from '@site/static/images/cloud/security/saml-self-serve-4.png';
import samlSelfServe5 from '@site/static/images/cloud/security/saml-self-serve-5.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# SAML SSO 설정 \{#saml-sso-setup\}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud는 Security Assertion Markup Language(SAML)를 통한 Single Sign-On(SSO)를 지원합니다. 이를 통해 IdP(Identity Provider)를 통한 인증으로 ClickHouse Cloud 조직에 안전하게 로그인할 수 있습니다.

현재 서비스 공급자 시작(Service Provider-initiated) 방식의 SSO, 개별 연결을 사용하는 여러 조직, 그리고 즉시 프로비저닝(Just-in-time provisioning)을 지원합니다. 아직 SCIM(System for Cross-domain Identity Management) 또는 속성 매핑(attribute mapping)은 지원하지 않습니다.

SAML 연동을 활성화하면 신규 사용자에게 할당될 기본 역할을 지정하고 세션 타임아웃 설정을 조정할 수 있습니다.

## 시작하기 전에 \{#before-you-begin\}

IdP에서 Admin 권한, 도메인 DNS 설정에 TXT 레코드를 추가할 수 있는 권한, ClickHouse Cloud 조직에서의 **Admin** 역할이 필요합니다. 로그인 절차를 단순화하기 위해 SAML 연결과 함께 **조직으로 바로 이동하는 직접 링크**를 추가로 설정할 것을 권장합니다. IdP마다 이를 처리하는 방식이 다릅니다. 사용하는 IdP에서 이를 설정하는 방법은 아래 내용을 참조하십시오.

## IdP 구성 방법 \{#how-to-configure-your-idp\}

### 단계 \{#steps\}

<VerticalStepper headerLevel="h3">
  ### 조직 설정에 액세스

  왼쪽 하단 모서리에 있는 조직 이름을 클릭한 다음 「Organization details」를 선택합니다.

  ### SAML Single Sign-On 활성화

  `Enable SAML single sign-on` 옆의 토글을 클릭합니다. 설정 과정에서 여러 번 이 화면으로 돌아와야 하므로 이 화면은 열어 둔 상태로 두십시오.

  <Image img={samlSelfServe1} size="lg" alt="Start SAML setup" force />

  ### IdP에서 애플리케이션 생성

  IdP(Identity Provider) 내에 애플리케이션을 생성하고, `Enable SAML single sign-on` 화면에 있는 값을 IdP 설정에 복사합니다. 이 단계에 대한 자세한 내용은 아래의 IdP별 섹션을 참고하십시오.

  * [Okta SAML 구성](#configure-okta-saml)
  * [Google SAML 구성](#configure-google-saml)
  * [Azure (Microsoft) SAML 구성](#configure-azure-microsoft-saml)
  * [Duo SAML 구성](#configure-duo-saml)

  :::tip
  ClickHouse는 IdP에서 시작하는 로그인(IdP initiated sign-in)을 지원하지 않습니다. 사용자가 ClickHouse Cloud에 쉽게 액세스할 수 있도록, 다음 로그인 URL 형식을 사용하여 사용자를 위한 북마크를 설정하십시오: `https://console.clickhouse.cloud/?connection={orgId}` 여기에서 `{orgID}`는 「Organization details」 페이지에 표시되는 조직 ID입니다.
  :::

  <Image img={samlSelfServe2} size="lg" alt="Create identity provider application" force />

  ### SAML 구성에 메타데이터 URL 추가

  SAML 공급자에서 `Metadata URL`을 가져옵니다. ClickHouse Cloud로 돌아와 `Next: Provide metadata URL`을 클릭한 후 텍스트 상자에 URL을 붙여 넣습니다.

  <Image img={samlSelfServe3} size="lg" alt="Add metadata URL" force />

  ### 도메인 검증 코드 받기

  `Next: Verify your domains`를 클릭합니다. 텍스트 상자에 도메인을 입력하고 `Check domain`을 클릭합니다. 그러면 DNS 공급자에 TXT 레코드로 추가할 무작위 검증 코드가 생성됩니다.

  <Image img={samlSelfServe4} size="lg" alt="Add domain to verify" force />

  ### 도메인 검증

  DNS 공급자에서 TXT 레코드를 생성합니다. DNS 공급자의 TXT 레코드 Name 필드에 `TXT record name`을 복사합니다. DNS 공급자의 Content 필드에는 `Value`를 복사하여 붙여 넣습니다. `Verify and Finish`를 클릭하여 과정을 완료합니다.

  :::note
  DNS 레코드가 업데이트되어 검증되기까지는 몇 분 정도 소요될 수 있습니다. 설정 페이지를 나갔다가 나중에 다시 돌아와도 과정을 처음부터 다시 시작하지 않고 이어서 진행할 수 있습니다.
  :::

  <Image img={samlSelfServe5} size="lg" alt="Verify your domain" force />

  ### 기본 역할 및 세션 타임아웃 업데이트

  SAML 설정이 완료되면, 사용자가 로그인할 때 부여되는 기본 역할을 설정하고 세션 타임아웃 설정도 조정할 수 있습니다.

  사용할 수 있는 기본 역할은 다음과 같습니다.

  * Admin
  * Service Admin
  * Service Read Only
  * Member

  이러한 역할에 부여되는 권한에 대한 자세한 내용은 [Console roles and permissions](/cloud/security/console-roles)을 검토하십시오.

  ### 관리자 사용자 구성

  :::note
  다른 인증 방식으로 설정된 사용자는 조직의 관리자가 제거할 때까지 유지됩니다.
  :::

  SAML을 통해 첫 번째 관리자 사용자를 할당하려면:

  1. [ClickHouse Cloud](https://console.clickhouse.cloud)에서 로그아웃합니다.
  2. IdP에서 ClickHouse 애플리케이션에 관리자 사용자를 할당합니다.
  3. 사용자에게 https://console.clickhouse.cloud/?connection={orgId} (바로가기 URL)를 통해 로그인하도록 요청합니다. 이는 이전 단계에서 생성한 북마크를 통해서일 수도 있습니다. 사용자는 처음 로그인하기 전까지 ClickHouse Cloud에 표시되지 않습니다.
  4. 기본 SAML 역할이 Admin이 아닌 경우, 새 SAML 사용자의 역할을 업데이트하기 위해 사용자가 로그아웃한 후 기존 인증 방식으로 다시 로그인해야 할 수 있습니다.
     * 이메일 + 비밀번호 계정의 경우 `https://console.clickhouse.cloud/?with=email`을 사용하십시오.
     * 소셜 로그인의 경우 **Continue with Google** 또는 **Continue with Microsoft** 버튼을 클릭하십시오.

  :::note
  위의 `?with=email`에서 `email`은 자리표시자가 아닌 실제 파라미터 값입니다.
  :::

  5. 한 번 더 로그아웃한 후 바로가기 URL을 통해 다시 로그인하여 아래 마지막 단계를 완료합니다.

  :::tip
  단계를 줄이기 위해 처음에는 SAML 기본 역할을 `Admin`으로 설정할 수 있습니다. 관리자가 IdP에서 할당되어 처음 로그인하면, 이후 기본 역할을 다른 값으로 변경할 수 있습니다.
  :::

  ### 다른 인증 방식 제거

  통합을 완료하고 IdP 연결에서 유입되는 사용자만 액세스하도록 제한하기 위해 SAML이 아닌 방식을 사용하는 사용자를 모두 제거하십시오.
</VerticalStepper>

### Okta SAML 구성 \{#configure-okta-saml\}

각 ClickHouse 조직마다 두 개의 Okta App Integration을 구성합니다. 하나는 SAML 앱이고, 다른 하나는 직접 링크를 담는 북마크 앱입니다.

<details>
   <summary>  1. 액세스 관리를 위한 그룹 생성  </summary>
   
   1. **Administrator** 권한으로 Okta 인스턴스에 로그인합니다.

   2. 왼쪽에서 **Groups**를 선택합니다.

   3. **Add group**을 클릭합니다.

   4. 그룹 이름과 설명을 입력합니다. 이 그룹은 SAML 앱과 관련 북마크 앱 간에 사용자를 일관되게 유지하는 데 사용됩니다.

   5. **Save**를 클릭합니다.

   6. 생성한 그룹의 이름을 클릭합니다.

   7. **Assign people**을 클릭하여 이 ClickHouse 조직에 대한 액세스 권한을 부여할 사용자를 지정합니다.

</details>

<details>
   <summary>  2. 사용자가 원활하게 로그인할 수 있도록 북마크 앱 생성  </summary>
   
   1. 왼쪽에서 **Applications**를 선택한 다음 **Applications** 하위 메뉴를 선택합니다.
   
   2. **Browse App Catalog**를 클릭합니다.
   
   3. **Bookmark App**을 검색하여 선택합니다.
   
   4. **Add integration**을 클릭합니다.
   
   5. 앱 레이블을 지정합니다.
   
   6. URL에 `https://console.clickhouse.cloud/?connection={organizationid}` 를 입력합니다.
   
   7. **Assignments** 탭으로 이동하여 위에서 생성한 그룹을 추가합니다.
   
</details>

<details>
   <summary>  3. 연결을 위한 SAML 앱 생성  </summary>
   
   1. 왼쪽에서 **Applications**를 선택한 다음 **Applications** 하위 메뉴를 선택합니다.
   
   2. **Create App Integration**을 클릭합니다.
   
   3. SAML 2.0을 선택하고 Next를 클릭합니다.
   
   4. 애플리케이션 이름을 입력하고 **Don't display application icon to users** 옆의 체크박스를 선택한 후 **Next**를 클릭합니다. 
   
   5. SAML 설정 화면을 다음 값으로 설정합니다.
   
      | Field                          | Value |
      |--------------------------------|-------|
      | Single Sign On URL             | 콘솔에서 Single Sign-On URL을 복사합니다 |
      | Audience URI (SP Entity ID)    | 콘솔에서 Service Provider Entity ID를 복사합니다 |
      | Default RelayState             | 비워 둡니다       |
      | Name ID format                 | Unspecified       |
      | Application username           | Email             |
      | Update application username on | Create and update |
   
   7. 다음 Attribute Statement를 입력합니다.

      | Name    | Name format   | Value      |
      |---------|---------------|------------|
      | email   | Basic         | user.email |
   
   9. **Next**를 클릭합니다.
   
   10. Feedback 화면에서 요청된 정보를 입력하고 **Finish**를 클릭합니다.
   
   11. **Assignments** 탭으로 이동하여 위에서 생성한 그룹을 추가합니다.
   
   12. 새 앱의 **Sign On** 탭에서 **Copy metadata URL** 버튼을 클릭합니다. 
   
   13. 프로세스를 계속하기 위해 [SAML 구성에 metadata URL 추가](#add-metadata-url)로 돌아갑니다.
   
</details>

### Google SAML 구성 \{#configure-google-saml\}

조직마다 하나의 SAML 앱을 Google에 구성해야 하며, 여러 조직 SSO를 사용하는 경우 사용자에게 즐겨찾기로 저장할 수 있도록 직접 링크(`https://console.clickhouse.cloud/?connection={organizationId}`)를 제공해야 합니다.

<details>
   <summary>  Google 웹 앱 생성  </summary>
   
   1. Google Admin 콘솔(admin.google.com)로 이동합니다.

   <Image img={samlGoogleApp} size="md" alt="Google SAML App" force/>

   2. **Apps**를 클릭한 다음, 왼쪽에서 **Web and mobile apps**를 클릭합니다.
   
   3. 상단 메뉴에서 **Add app**을 클릭한 뒤 **Add custom SAML app**을 선택합니다.
   
   4. 앱 이름을 입력하고 **Continue**를 클릭합니다.
   
   5. 메타데이터 URL을 복사하여 기록해 둡니다.
   
   7. 아래의 ACS URL과 Entity ID를 입력합니다.
   
      | Field     | Value |
      |-----------|-------|
      | ACS URL   | 콘솔에서 Single Sign-On URL을 복사합니다 |
      | Entity ID | 콘솔에서 Service Provider Entity ID를 복사합니다 |
   
   8. **Signed response** 체크박스를 선택합니다.
   
   9. Name ID Format으로 **EMAIL**을 선택하고, Name ID는 **Basic Information > Primary email**로 둡니다.
   
   10. **Continue**를 클릭합니다.
   
   11. 다음과 같이 Attribute mapping을 입력합니다.
       
      | Field             | Value         |
      |-------------------|---------------|
      | Basic information | Primary email |
      | App attributes    | email         |
       
   13. **Finish**를 클릭합니다.
   
   14. 앱을 활성화하려면 **OFF for everyone**을 클릭한 후 설정을 **ON for everyone**으로 변경합니다. 화면 왼쪽의 옵션을 선택하여 그룹이나 조직 단위로 액세스를 제한할 수도 있습니다.

   15. 계속 진행하려면 [SAML 구성에 메타데이터 URL 추가](#add-metadata-url)로 돌아갑니다.
       
</details>

### Azure (Microsoft) SAML 구성 \{#configure-azure-microsoft-saml\}

Azure (Microsoft) SAML은 Azure Active Directory(AD) 또는 Microsoft Entra라고도 합니다.

<details>
   <summary>  Azure 엔터프라이즈 애플리케이션 생성 </summary>
   
   각 조직마다 별도의 Single Sign-On URL을 사용하는 애플리케이션 통합을 하나 설정합니다.
   
   1. Microsoft Entra 관리 센터에 로그인합니다.
   
   2. 왼쪽 메뉴에서 **Applications > Enterprise** applications로 이동합니다.
   
   3. 상단 메뉴에서 **New application**을 클릭합니다.
   
   4. 상단 메뉴에서 **Create your own application**을 클릭합니다.
   
   5. 이름을 입력하고 **Integrate any other application you don't find in the gallery (Non-gallery)**를 선택한 후 **Create**를 클릭합니다.
   
      <Image img={samlAzureApp} size="md" alt="Azure Non-Gallery App" force/>
   
   6. 왼쪽 메뉴에서 **Users and groups**를 클릭한 후 사용자를 할당합니다.
   
   7. 왼쪽 메뉴에서 **Single sign-on**을 클릭합니다.
   
   8. **SAML**을 클릭합니다.
   
   9. 아래 설정을 사용하여 Basic SAML Configuration 화면에 값을 입력합니다.
   
      | Field                     | Value |
      |---------------------------|-------|
      | Identifier (Entity ID)    | 콘솔에서 Service Provider Entity ID를 복사합니다 |
      | Reply URL (Assertion Consumer Service URL) | 콘솔에서 Single Sign-On URL을 복사합니다 |
      | Sign on URL               | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State               | 비워 둡니다 |
      | Logout URL                | 비워 둡니다 |
   
   11. Attributes & Claims 아래에 다음 항목을 추가(A)하거나 업데이트(U)합니다.
   
       | Claim name                           | Format        | Source attribute |
       |--------------------------------------|---------------|------------------|
       | (U) Unique User Identifier (Name ID) | Email address | user.mail        |
       | (A) email                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | Omitted       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="Attributes and Claims" force/>
   
   12. 메타데이터 URL을 복사한 다음, 프로세스를 계속하기 위해 [SAML 설정에 메타데이터 URL 추가](#add-metadata-url)로 돌아갑니다.

</details>

### Duo SAML 구성 \{#configure-duo-saml\}

<details>
   <summary> Duo용 Generic SAML Service Provider 생성 </summary>
   
   1. [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic)의 지침을 따르십시오. 
   
   2. 다음 Bridge Attribute 매핑을 사용합니다:

      |  Bridge 속성       |  ClickHouse 속성       | 
      |:-------------------|:-----------------------|
      | 이메일 주소        | email                  |
   
   3. Duo에서 Cloud 애플리케이션을 업데이트할 때 다음 값을 사용합니다:

      |  필드    |  값                                       |
      |:----------|:-------------------------------------------|
      | Entity ID | 콘솔에서 Service Provider Entity ID를 복사합니다 |
      | Assertion Consumer Service (ACS) URL | 콘솔에서 Single Sign-On URL을 복사합니다 |
      | Service Provider Login URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. 메타데이터 URL을 복사한 다음, 프로세스를 계속하기 위해 [SAML 구성에 메타데이터 URL 추가](#add-metadata-url) 단계로 돌아갑니다.
   
</details>

## 동작 방식 {#how-it-works}

### SAML SSO를 통한 사용자 관리 \{#user-management-with-saml-sso\}

사용자 권한을 관리하고 SAML 연결로만 접근을 제한하는 방법에 대한 자세한 내용은 [Cloud 사용자 관리](/cloud/security/manage-cloud-users)를 참고하십시오.

### 서비스 제공자 시작 SSO \{#service-provider-initiated-sso\}

서비스 제공자 시작 SSO만 사용합니다. 이는 사용자가 `https://console.clickhouse.cloud`로 이동하여 이메일 주소를 입력하면 인증을 위해 IdP로 리디렉션된다는 의미입니다. IdP를 통해 이미 인증된 사용자는 로그인 페이지에서 이메일 주소를 입력하지 않고도 조직에 자동으로 로그인할 수 있는 직접 링크를 사용할 수 있습니다.

### 다중 조직 SSO \{#multi-org-sso\}

ClickHouse Cloud는 각 조직마다 별도의 연결을 제공하여 다중 조직 SSO를 지원합니다. 각 조직에 로그인하려면 다음 직접 링크(`https://console.clickhouse.cloud/?connection={organizationid}`)를 사용하십시오. 다른 조직에 로그인하기 전에 현재 조직에서 반드시 로그아웃하십시오.

## 추가 정보 {#additional-information}

인증과 관련해서는 보안을 최우선으로 합니다. 이러한 이유로 SSO를 구현할 때 몇 가지 결정을 내렸으며, 이에 대해 알아두어야 합니다.

- **서비스 공급자에서 시작되는 인증 플로우만 처리합니다.** 사용자는 `https://console.clickhouse.cloud`로 이동한 후 이메일 주소를 입력해야 IdP(Identity Provider)로 리디렉션됩니다. 사용자가 URL을 기억하지 않아도 되도록, 북마크 애플리케이션 또는 바로가기를 추가하는 방법을 안내합니다.

- **SSO 계정과 비 SSO 계정을 자동으로 연결하지 않습니다.** 동일한 이메일 주소를 사용하더라도 ClickHouse 사용자 목록에서 한 사용자에 대해 여러 개의 계정이 표시될 수 있습니다.

## 일반적인 문제 해결 {#troubleshooting-common-issues}

| 오류 | 원인 | 해결 방법 | 
|:------|:------|:---------|
| 시스템 구성 오류가 있거나 서비스 중단이 발생했을 수 있습니다 | ID 공급자(IdP)에서 시작한 로그인입니다 | 이 오류를 해결하려면 `https://console.clickhouse.cloud/?connection={organizationid}`와 같은 직접 링크를 사용해 보십시오. 위의 ID 공급자별 안내를 따라 이 방법을 사용자 기본 로그인 방식으로 설정하십시오 | 
| ID 공급자로 이동한 다음 다시 로그인 페이지로 돌아갑니다 | ID 공급자에 이메일 속성 매핑이 설정되어 있지 않습니다 | 위의 ID 공급자별 안내를 따라 사용자 이메일 속성을 구성한 후 다시 로그인하십시오 | 
| 사용자에게 이 애플리케이션이 할당되어 있지 않습니다 | 사용자에게 ID 공급자에서 ClickHouse 애플리케이션이 할당되지 않았습니다 | ID 공급자에서 사용자에게 애플리케이션을 할당한 후 다시 로그인하십시오 |
| SAML SSO로 통합된 여러 ClickHouse 조직이 있는데, 어떤 링크나 타일을 사용하더라도 항상 동일한 조직에만 로그인됩니다 | 첫 번째 조직에 여전히 로그인되어 있습니다 | 로그아웃한 다음 다른 조직으로 다시 로그인하십시오 |
| URL에 잠시 `access denied`가 표시됩니다 | 사용자의 이메일 도메인이 ClickHouse에 구성된 도메인과 일치하지 않습니다 | 이 오류를 해결하려면 지원팀에 문의하십시오 |