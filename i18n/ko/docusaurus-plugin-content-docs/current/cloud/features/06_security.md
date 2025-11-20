---
'sidebar_label': '보안'
'slug': '/cloud/security'
'title': '보안'
'description': 'ClickHouse Cloud 및 BYOC 보안에 대해 더 알아보세요.'
'doc_type': 'reference'
'keywords':
- 'security'
- 'cloud security'
- 'access control'
- 'compliance'
- 'data protection'
---


# ClickHouse Cloud 보안

이 문서는 ClickHouse 조직 및 서비스 보호를 위한 보안 옵션과 모범 사례에 대해 설명합니다. 
ClickHouse는 안전한 분석 데이터베이스 솔루션을 제공하는 데 전념하고 있으며, 따라서 데이터 및 서비스 무결성을 보호하는 것이 최우선입니다. 
여기에는 사용자가 ClickHouse 환경을 보호하는 데 도움이 되는 다양한 방법이 포함되어 있습니다.

## 클라우드 콘솔 인증 {#cloud-console-auth}

### 비밀번호 인증 {#password-auth}

ClickHouse Cloud 콘솔 비밀번호는 NIST 800-63B 기준에 따라 최소 12자 이상이며, 4가지 복잡성 요구 사항 중 3가지를 충족해야 합니다: 대문자, 소문자, 숫자 및/또는 특수 문자.

[비밀번호 인증](/cloud/security/manage-my-account#email-and-password)에 대해 자세히 알아보세요.

### 소셜 SSO (단일 인증) {#social-sso}

ClickHouse Cloud는 Google 또는 Microsoft 소셜 인증을 지원하여 단일 인증(SSO)을 제공합니다.

[소셜 SSO](/cloud/security/manage-my-account#social-sso)에 대해 자세히 알아보세요.

### 다단계 인증 {#mfa}

이메일과 비밀번호 또는 소셜 SSO를 사용하는 사용자는 Authy 또는 Google Authenticator와 같은 인증 앱을 사용하여 다단계 인증을 구성할 수 있습니다.

[다단계 인증](/cloud/security/manage-my-account/#mfa)에 대해 자세히 알아보세요.

### SAML 인증 {#saml-auth}

기업 고객은 SAML 인증을 구성할 수 있습니다.

[SAML 인증](/cloud/security/saml-setup)에 대해 자세히 알아보세요.

### API 인증 {#api-auth}

고객은 OpenAPI, Terraform 및 쿼리 API 엔드포인트에 사용할 API 키를 구성할 수 있습니다.

[API 인증](/cloud/manage/openapi)에 대해 자세히 알아보세요.

## 데이터베이스 인증 {#database-auth}

### 데이터베이스 비밀번호 인증 {#db-password-auth}

ClickHouse 데이터베이스 사용자 비밀번호는 NIST 800-63B 기준에 따라 최소 12자 이상이며 복잡성 요구 사항: 대문자, 소문자, 숫자 및/또는 특수 문자를 충족해야 합니다.

[데이터베이스 비밀번호 인증](/cloud/security/manage-database-users#database-user-id--password)에 대해 자세히 알아보세요.

### 보안 셸 (SSH) 데이터베이스 인증 {#ssh-auth}

ClickHouse 데이터베이스 사용자는 SSH 인증을 사용하도록 구성할 수 있습니다.

[SSH 인증](/cloud/security/manage-database-users#database-ssh)에 대해 자세히 알아보세요.

## 접근 제어 {#access-control}

### 콘솔 역할 기반 접근 제어 (RBAC) {#console-rbac}

ClickHouse Cloud는 조직, 서비스 및 데이터베이스 권한에 대한 역할 할당을 지원합니다. 이 방법을 사용하는 데이터베이스 권한은 SQL 콘솔에서만 지원됩니다.

[콘솔 RBAC](/cloud/security/console-roles)에 대해 자세히 알아보세요.

### 데이터베이스 사용자 권한 부여 {#database-user-grants}

ClickHouse 데이터베이스는 사용자 권한 부여를 통해 세분화된 권한 관리 및 역할 기반 접근을 지원합니다.

[데이터베이스 사용자 권한 부여](/cloud/security/manage-database-users#database-permissions)에 대해 자세히 알아보세요.

## 네트워크 보안 {#network-security}

### IP 필터 {#ip-filters}

IP 필터를 구성하여 ClickHouse 서비스로의 수신 연결을 제한합니다.

[IP 필터](/cloud/security/setting-ip-filters)에 대해 자세히 알아보세요.

### 전용 연결 {#private-connectivity}

AWS, GCP 또는 Azure에서 전용 연결을 사용하여 ClickHouse 클러스터에 연결합니다.

[전용 연결](/cloud/security/connectivity/private-networking)에 대해 자세히 알아보세요.

## 암호화 {#encryption}

### 저장소 수준 암호화 {#storage-encryption}

ClickHouse Cloud는 기본적으로 클라우드 공급자가 관리하는 AES 256 키를 사용하여 데이터의 휴대 상태에서 암호화합니다.

[저장소 암호화](/cloud/security/cmek#storage-encryption)에 대해 자세히 알아보세요.

### 투명한 데이터 암호화 {#tde}

저장소 암호화 외에도 ClickHouse Cloud 기업 고객은 추가 보호를 위해 데이터베이스 수준의 투명한 데이터 암호화를 활성화할 수 있습니다.

[투명한 데이터 암호화](/cloud/security/cmek#transparent-data-encryption-tde)에 대해 자세히 알아보세요.

### 고객 관리 암호화 키 {#cmek}

ClickHouse Cloud 기업 고객은 데이터베이스 수준의 암호화를 위해 자신의 키를 사용할 수 있습니다.

[고객 관리 암호화 키](/cloud/security/cmek#customer-managed-encryption-keys-cmek)에 대해 자세히 알아보세요.

## 감사 및 로깅 {#auditing-logging}

### 콘솔 감사 로그 {#console-audit-log}

콘솔 내에서 수행된 활동이 로그로 기록됩니다. 로그는 검토 및 내보내기를 위해 사용할 수 있습니다.

[콘솔 감사 로그](/cloud/security/audit-logging/console-audit-log)에 대해 자세히 알아보세요.

### 데이터베이스 감사 로그 {#database-audit-logs}

데이터베이스 내에서 수행된 활동이 로그로 기록됩니다. 로그는 검토 및 내보내기를 위해 사용할 수 있습니다.

[데이터베이스 감사 로그](/cloud/security/audit-logging/database-audit-log)에 대해 자세히 알아보세요.

### BYOC 보안 플레이북 {#byoc-security-playbook}

ClickHouse BYOC 인스턴스를 관리하는 보안 팀을 위한 샘플 탐지 쿼리.

[BYOC 보안 플레이북](/cloud/security/audit-logging/byoc-security-playbook)에 대해 자세히 알아보세요.

## 준수 {#compliance}

### 보안 및 준수 보고서 {#compliance-reports}

ClickHouse는 강력한 보안 및 준수 프로그램을 유지합니다. 새로운 제3자 감사 보고서를 정기적으로 확인하세요.

[보안 및 준수 보고서](/cloud/security/compliance-overview)에 대해 자세히 알아보세요.

### HIPAA 준수 서비스 {#hipaa-compliance}

ClickHouse Cloud 기업 고객은 비즈니스 파트너 계약(Business Associate Agreement, BAA)에 서명한 후 HIPAA 준수 지역에 보호 건강 정보(PHI)를 저장하는 서비스를 배포할 수 있습니다.

[HIPAA 준수](/cloud/security/compliance/hipaa-onboarding)에 대해 자세히 알아보세요.

### PCI 준수 서비스 {#pci-compliance}

ClickHouse Cloud 기업 고객은 PCI 준수 지역에 신용 카드 정보를 저장하는 서비스를 배포할 수 있습니다.

[PCI 준수](/cloud/security/compliance/pci-onboarding)에 대해 자세히 알아보세요.
