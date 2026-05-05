---
sidebar_label: '콘솔 역할과 권한'
slug: /cloud/security/console-roles
title: '콘솔 역할과 권한'
description: '이 페이지에서는 ClickHouse Cloud 콘솔의 표준 역할과 그에 따른 권한을 설명합니다'
doc_type: 'reference'
keywords: ['콘솔 역할', '권한', '액세스 제어', '보안', 'RBAC']
---

## 조직 역할 \{#organization-roles\}

조직 역할을 할당하는 방법은 [클라우드 사용자 관리](/cloud/security/manage-cloud-users)를 참조하십시오.

ClickHouse에는 사용자 관리를 위해 네 가지 조직 수준 역할이 있습니다. 기본적으로 서비스에 액세스할 수 있는 역할은 Admin 역할뿐입니다. 다른 모든 역할은 서비스와 상호 작용하려면 서비스 수준 역할과 함께 부여되어야 합니다.

| Role      | Description                                                                                                                                                                                                                 |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Admin          | 조직에 대한 모든 관리 작업을 수행하고 모든 설정을 제어합니다. 이 역할은 조직의 첫 번째 사용자에게 기본적으로 할당되며, 모든 서비스에 대해 자동으로 Service Admin 권한을 가집니다. |
| Billing        | 사용량과 청구서를 조회하고 결제 수단을 관리합니다.                                         |
| Org API reader | 조직 수준 설정 및 사용자를 관리하기 위한 API 권한이 있으며, 서비스 액세스 권한은 없습니다. |
| Member         | 로그인만 가능하며, 개인 프로필 설정을 관리할 수 있습니다. 기본적으로 SAML SSO 사용자에게 할당됩니다. |

## 서비스 역할 \{#service-roles\}

서비스 역할을 할당하는 방법은 [클라우드 사용자 관리](/cloud/security/manage-cloud-users)를 참조하십시오.

서비스 권한은 관리자 역할이 아닌 다른 역할을 가진 사용자에게는 관리자가 명시적으로 부여해야 합니다. 서비스 관리자 역할에는 기본적으로 SQL 콘솔 관리자 액세스 권한이 포함되어 있으나, 필요에 따라 권한을 축소하거나 제거하도록 변경할 수 있습니다.

| Role                     | Description                                                  |
|--------------------------|--------------------------------------------------------------|
| Service reader           | 서비스 및 설정을 조회합니다.                                  |
| Service admin            | 서비스 설정을 관리합니다.                                     |
| Service API reader       | 모든 서비스의 서비스 설정을 읽기 위한 API 권한입니다.   |
| Service API admin        | 모든 서비스의 서비스 설정을 관리하기 위한 API 권한입니다. |
| Basic service API reader | 쿼리 API 엔드포인트를 사용하기 위한 API 권한입니다.                  |

## SQL console roles \{#sql-console-roles\}

SQL 콘솔 역할을 할당하는 방법은 [SQL 콘솔 역할 할당 관리](/cloud/guides/sql-console/manage-sql-console-role-assignments)를 참조하십시오.

| Role                  | Description                                                                                    |
|-----------------------|------------------------------------------------------------------------------------------------|
| SQL console read only | 서비스 내 데이터베이스에 대한 읽기 전용 접근 권한입니다.                                              |
| SQL console admin     | 서비스 내 데이터베이스에 대해 「Default database role」과 동일한 수준의 관리자 권한입니다. |

## 콘솔 권한 \{#console-permissions\}

아래 표에서는 ClickHouse 콘솔과 SQL 콘솔 권한을 설명합니다. 각 범주에 대한 자세한 정보는 헤더에 연결된 링크를 참조하십시오.

| 권한                                                                                         | 설명                                                                                         |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **조직** ([자세한 정보](/cloud/security/manage-cloud-users))                                      | 조직 수준 권한                                                                                   |
| control-plane:organization:view                                                            | 조직 세부 정보와 읽기 전용 메타데이터를 확인합니다.                                                              |
| control-plane:organization:manage                                                          | 조직 설정과 사용자를 관리합니다.                                                                         |
| **청구** ([자세한 정보](/cloud/manage/billing))                                                   | 청구 및 송장 관리                                                                                 |
| control-plane:organization:manage-billing                                                  | 청구 설정, 결제 수단, 송장을 관리합니다.                                                                   |
| control-plane:organization:view-billing                                                    | 청구 사용량과 송장을 확인합니다.                                                                         |
| **API 키** ([자세한 정보](/cloud/manage/cloud-api))                                              | 조직 API 키 관리                                                                                |
| control-plane:organization:view-api-keys                                                   | 조직의 API 키를 확인합니다.                                                                          |
| control-plane:organization:create-api-keys                                                 | 조직의 새 API 키를 생성합니다.                                                                        |
| control-plane:organization:update-api-keys                                                 | 기존 API 키와 해당 권한을 업데이트합니다.                                                                  |
| control-plane:organization:delete-api-keys                                                 | API 키를 해지하거나 삭제합니다.                                                                        |
| **지원** ([자세한 정보](/cloud/support))                                                          | 지원 케이스 관리                                                                                  |
| control-plane:support:manage                                                               | 지원 케이스를 생성 및 관리하고 ClickHouse 지원팀과의 커뮤니케이션을 관리합니다.                                          |
| **서비스 (일반)**                                                                               | 일반 서비스 수준 권한                                                                               |
| control-plane:service:view                                                                 | 서비스 수준 메타데이터, 설정, 상태를 확인합니다.                                                               |
| control-plane:service:manage                                                               | 서비스 구성과 수명 주기 작업을 관리합니다.                                                                   |
| **백업** ([자세한 정보](/cloud/features/backups))                                                 | 서비스 백업 및 복원 지점                                                                             |
| control-plane:service:view-backups                                                         | 서비스의 백업 및 복원 지점을 확인합니다.                                                                    |
| control-plane:service:manage-backups                                                       | 서비스 백업을 생성, 관리, 복원합니다.                                                                     |
| **IP 액세스 목록** ([자세한 정보](/cloud/security/setting-ip-filters))                               | IP 액세스 목록 및 네트워크 필터링 관리                                                                    |
| control-plane:service:manage-ip-access-list                                                | 서비스의 IP 액세스 목록과 네트워크 필터링을 관리합니다.                                                           |
| **생성형 AI** ([자세한 정보](/cloud/features/ai-ml/ask-ai))                                        | 생성형 AI 기능 구성                                                                               |
| control-plane:service:manage-generative-ai                                                 | 서비스의 생성형 AI 기능과 설정을 구성하고 관리합니다.                                                            |
| **Query API 엔드포인트** ([자세한 정보](/cloud/get-started/query-endpoints))                         | Query API 엔드포인트                                                                            |
| control-plane:service:view-query-api-endpoints                                             | Query API 엔드포인트와 해당 구성을 확인합니다.                                                             |
| control-plane:service:manage-query-api-endpoints                                           | Query API 엔드포인트를 생성하고 관리합니다.                                                               |
| **프라이빗 엔드포인트** ([자세한 정보](/cloud/security/connectivity/private-networking))                 | 프라이빗 네트워킹 및 엔드포인트                                                                          |
| control-plane:service:view-private-endpoints                                               | 서비스의 프라이빗 엔드포인트 구성을 확인합니다.                                                                 |
| control-plane:service:manage-private-endpoints                                             | 프라이빗 엔드포인트와 프라이빗 네트워킹을 생성하고 관리합니다.                                                         |
| **ClickPipes** ([자세한 정보](/integrations/clickpipes))                                        | ClickPipes 통합                                                                              |
| control-plane:service:manage-clickpipes                                                    | ClickPipes 통합과 관련 설정을 관리합니다.                                                               |
| **스케일링** ([자세한 정보](/manage/scaling))                                                       | 스케일링 및 자동 스케일링 구성                                                                          |
| control-plane:service:view-scaling-config                                                  | 서비스의 스케일링 구성과 자동 스케일링 설정을 확인합니다.                                                           |
| control-plane:service:manage-scaling-config                                                | 스케일링 구성을 수정하고 스케일링 작업을 실행합니다.                                                              |
| **ClickStack** ([자세한 정보](/use-cases/observability/clickstack/overview))                    | ClickStack 관측성 통합                                                                          |
| control-plane:service:manage-clickstack-api                                                | ClickStack API 액세스와 관련 통합을 관리합니다.                                                          |
| **SQL 콘솔 역할 매핑** ([자세한 정보](/cloud/guides/sql-console/manage-sql-console-role-assignments)) | SQL 콘솔 역할 할당 관리                                                                            |
| sql-console:database:access                                                                | SQL 콘솔을 통해 비밀번호 없이 데이터베이스에 액세스합니다(sql-console-admin 또는 sql-console-readonly와 함께만 사용할 수 있음) |