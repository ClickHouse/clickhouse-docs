---
sidebar_label: '보안'
slug: /cloud/security
title: '보안'
description: 'ClickHouse Cloud 및 BYOC를 안전하게 보호하는 방법을 자세히 알아봅니다'
doc_type: 'reference'
keywords: ['보안', '클라우드 보안', '액세스 제어', '규정 준수', '데이터 보호']
---

# ClickHouse Cloud 보안 \{#clickhouse-cloud-security\}

이 문서는 ClickHouse 조직과 서비스를 보호하기 위해 제공되는 보안 옵션과 모범 사례를 자세히 설명합니다.
ClickHouse는 높은 보안 수준의 분석 데이터베이스 솔루션을 제공하는 데 전념하고 있으며, 데이터와 서비스 무결성 보호를 최우선 과제로 둡니다.
본 문서의 내용은 ClickHouse 환경의 보안을 강화하는 데 도움이 되도록 설계된 다양한 방법을 다룹니다.

## Cloud 콘솔 인증 \{#cloud-console-auth\}

### 비밀번호 인증 \{#password-auth\}

ClickHouse Cloud 콘솔 비밀번호는 NIST 800-63B 표준에 따라 최소 12자 이상이며, 대문자, 소문자, 숫자 및/또는 특수 문자 중 4가지 복잡성 요건 가운데 3가지를 충족하도록 설정됩니다.

[비밀번호 인증](/cloud/security/manage-my-account#email-and-password)에 대해 자세히 알아보십시오.

### 소셜 Single Sign-On(SSO) \{#social-sso\}

ClickHouse Cloud는 소셜 Single Sign-On(SSO)을 위해 Google 또는 Microsoft 소셜 계정을 이용한 인증을 지원합니다.

자세한 내용은 [소셜 SSO](/cloud/security/manage-my-account#social-sso)를 참고하십시오.

### 다단계 인증 \{#mfa\}

이메일과 비밀번호 또는 소셜 SSO를 사용하는 경우, Authy나 Google Authenticator와 같은 인증 앱을 사용하여 다단계 인증을 추가로 설정할 수 있습니다.

자세한 내용은 [다단계 인증](/cloud/security/manage-my-account/#mfa)을 참조하십시오.

### Security Assertion Markup Language (SAML) 인증 \{#saml-auth\}

엔터프라이즈 고객은 SAML 인증을 설정할 수 있습니다.

자세한 내용은 [SAML 인증](/cloud/security/saml-setup)을(를) 참고하십시오.

### API 인증 \{#api-auth\}

고객은 OpenAPI, Terraform 및 Query API 엔드포인트에서 사용할 API 키를 구성할 수 있습니다.

자세한 내용은 [API 인증](/cloud/manage/openapi)을(를) 참고하십시오.

## 데이터베이스 인증 \{#database-auth\}

### 데이터베이스 비밀번호 인증 \{#db-password-auth\}

ClickHouse 데이터베이스 사용자 비밀번호는 NIST 800-63B 표준에 따라 설정되며, 최소 12자 길이와 대문자, 소문자, 숫자 및/또는 특수 문자를 포함해야 하는 복잡도 요구 사항을 충족합니다.

자세한 내용은 [데이터베이스 비밀번호 인증](/cloud/security/manage-database-users#database-user-id--password)을(를) 참고하십시오.

### Secure Shell(SSH) 데이터베이스 인증 \{#ssh-auth\}

ClickHouse 데이터베이스 사용자는 SSH 인증을 사용하도록 구성할 수 있습니다.

자세한 내용은 [SSH 인증](/cloud/security/manage-database-users#database-ssh)을(를) 참고하십시오.

## 액세스 제어 \{#access-control\}

### Console 역할 기반 접근 제어(RBAC) \{#console-rbac\}

ClickHouse Cloud는 조직, 서비스 및 데이터베이스 권한에 대한 역할 할당을 지원합니다. 이 방법을 통한 데이터베이스 권한 관리는 SQL 콘솔에서만 지원됩니다.

자세한 내용은 [콘솔 RBAC](/cloud/security/console-roles)을(를) 참조하십시오.

### 데이터베이스 USER 권한 부여 \{#database-user-grants\}

ClickHouse 데이터베이스는 USER 권한 부여를 통해 세분화된 권한 관리와 역할 기반 접근 제어를 지원합니다.

자세한 내용은 [데이터베이스 USER 권한](/cloud/security/manage-database-users#database-permissions)을 참고하십시오.

## 네트워크 보안 \{#network-security\}

### IP 필터 \{#ip-filters\}

IP 필터를 구성하여 ClickHouse 서비스로 들어오는 인바운드 연결을 제한합니다.

자세한 내용은 [IP 필터](/cloud/security/setting-ip-filters)를 참조하십시오.

### 프라이빗 연결 \{#private-connectivity\}

프라이빗 연결을 사용하면 AWS, GCP 또는 Azure에서 ClickHouse 클러스터에 연결할 수 있습니다.

자세한 내용은 [프라이빗 연결](/cloud/security/connectivity/private-networking)을 참조하십시오.

## 암호화 \{#encryption\}

### 스토리지 수준 암호화 \{#storage-encryption\}

ClickHouse Cloud는 기본적으로 클라우드 제공자가 관리하는 AES 256 키를 사용하여 디스크에 저장된 데이터(데이터 at rest)를 암호화합니다.

자세한 내용은 [스토리지 암호화](/cloud/security/cmek#storage-encryption)를 참조하십시오.

### 투명한 데이터 암호화 \{#tde\}

저장소 암호화와 더불어, ClickHouse Cloud Enterprise 고객은 추가적인 보호를 위해 데이터베이스 수준의 투명한 데이터 암호화를 활성화할 수 있습니다.

자세한 내용은 [투명한 데이터 암호화](/cloud/security/cmek#transparent-data-encryption-tde)를 참조하십시오.

### 고객이 관리하는 암호화 키 \{#cmek\}

ClickHouse Cloud Enterprise 고객은 데이터베이스 수준 암호화를 위해 자체 키를 사용할 수 있습니다.

[고객이 관리하는 암호화 키](/cloud/security/cmek#customer-managed-encryption-keys-cmek)에 대해 자세히 알아보십시오.

## 감사 및 로깅 \{#auditing-logging\}

### 콘솔 감사 로그 \{#console-audit-log\}

콘솔 내 활동은 모두 로그로 기록됩니다. 로그는 검토하거나 내보낼 수 있습니다.

[콘솔 감사 로그](/cloud/security/audit-logging/console-audit-log)에 대해 자세히 알아보십시오.

### 데이터베이스 감사 로그 \{#database-audit-logs\}

데이터베이스 내 활동은 로그로 기록됩니다. 이러한 로그는 검토하거나 내보낼 수 있습니다.

[데이터베이스 감사 로그](/cloud/security/audit-logging/database-audit-log)에 대해 자세히 알아보려면 문서를 참고하십시오.

### BYOC 보안 플레이북 \{#byoc-security-playbook\}

ClickHouse BYOC 인스턴스를 관리하는 보안 팀을 위한 보안 탐지용 샘플 쿼리입니다.

자세한 내용은 [BYOC 보안 플레이북](/cloud/security/audit-logging/byoc-security-playbook)을 참조하십시오.

## 규정 준수 \{#compliance\}

### 보안 및 컴플라이언스 보고서 \{#compliance-reports\}

ClickHouse는 강력한 보안 및 컴플라이언스 프로그램을 운영하고 있습니다. 새로운 제3자 감사 보고서가 공개되는지 주기적으로 확인하십시오.

자세한 내용은 [보안 및 컴플라이언스 보고서](/cloud/security/compliance-overview)를 참조하십시오.

### HIPAA 준수 서비스 \{#hipaa-compliance\}

ClickHouse Cloud Enterprise 고객은 Business Associate Agreement(BAA)에 서명한 후, 보호 대상 건강 정보(PHI)를 저장하는 서비스를 HIPAA 준수 리전에 배포할 수 있습니다.

[HIPAA 컴플라이언스](/cloud/security/compliance/hipaa-onboarding)에 대해 자세히 알아보십시오.

### PCI Compliant Services \{#pci-compliance\}

ClickHouse Cloud Enterprise 고객은 신용카드 정보를 저장하는 서비스를 PCI 규정을 준수하는 리전에 배포할 수 있습니다.

[PCI 규정 준수](/cloud/security/compliance/pci-onboarding)에 대해 자세히 알아보십시오.