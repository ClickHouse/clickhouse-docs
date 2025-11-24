---
'sidebar_label': '콘솔 역할 및 권한'
'slug': '/cloud/security/console-roles'
'title': '콘솔 역할 및 권한'
'description': '이 페이지는 ClickHouse Cloud 콘솔의 표준 역할 및 관련 권한을 설명합니다.'
'doc_type': 'reference'
'keywords':
- 'console roles'
- 'permissions'
- 'access control'
- 'security'
- 'rbac'
---

## Organization roles {#organization-roles}
[클라우드 사용자 관리하기](/cloud/security/manage-cloud-users)를 참조하여 조직 역할을 할당하는 방법에 대한 지침을 확인하세요.

ClickHouse에는 사용자 관리를 위한 네 가지 조직 수준 역할이 있습니다. admin 역할만 기본 서비스 접근 권한이 있으며, 다른 모든 역할은 서비스와 상호작용하기 위해 서비스 수준 역할과 결합해야 합니다.

| 역할      | 설명                                                                                                                                                                                                                 |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Admin     | 조직의 모든 관리 활동을 수행하고 모든 설정을 제어합니다. 이 역할은 기본적으로 조직의 첫 번째 사용자에게 할당되며 모든 서비스에서 Service Admin 권한을 자동으로 가집니다.                                                |
| Developer | 조직에 대한 조회 접근 권한과 동일한 권한 또는 낮은 권한으로 API 키를 생성할 수 있는 능력이 있습니다.                                                                                                   |
| Billing   | 사용량 및 청구서를 조회하고 결제 방법을 관리합니다.                                                                                                                                                                        |
| Member    | 개인 프로필 설정 관리 기능이 있는 로그인만 가능하며, 기본적으로 SAML SSO 사용자에게 할당됩니다.                                                                                                                   |

## Service roles {#service-roles}
[클라우드 사용자 관리하기](/cloud/security/manage-cloud-users)를 참조하여 서비스 역할을 할당하는 방법에 대한 지침을 확인하세요.

서비스 권한은 admin이 아닌 기타 역할의 사용자에게 명시적으로 부여되어야 합니다. Service Admin은 SQL 콘솔 관리자 접근 권한으로 사전 구성되어 있지만, 권한을 줄이거나 제거하기 위해 수정할 수 있습니다.

| 역할              | 설명                 |
|-------------------|---------------------|
| Service read only | 서비스 및 설정을 조회합니다. |
| Service admin     | 서비스 설정을 관리합니다.    |

## SQL console roles {#sql-console-roles}
[SQL 콘솔 역할 할당 관리하기](/cloud/guides/sql-console/manage-sql-console-role-assignments)를 참조하여 SQL 콘솔 역할을 할당하는 방법에 대한 지침을 확인하세요.

| 역할                  | 설명                                                                                    |
|-----------------------|-----------------------------------------------------------------------------------------|
| SQL console read only | 서비스 내 데이터베이스에 대한 읽기 전용 접근 권한입니다.                                         |
| SQL console admin     | 기본 데이터베이스 역할에 해당하는 서비스 내 데이터베이스에 대한 관리 접근 권한입니다. |
