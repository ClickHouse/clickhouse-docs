---
sidebar_label: '데이터베이스 사용자 관리'
slug: /cloud/security/manage-database-users
title: '데이터베이스 사용자 관리'
description: '이 페이지에서는 관리자가 데이터베이스 사용자를 추가하고 할당을 관리하며 데이터베이스 사용자를 제거하는 방법을 설명합니다'
doc_type: 'guide'
keywords: ['database users', 'access management', 'security', 'permissions', 'user management']
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';

이 가이드는 SQL 콘솔과 데이터베이스에서 직접 데이터베이스 사용자를 관리하는 두 가지 방법을 보여줍니다.


### SQL 콘솔 비밀번호 없이 인증 \{#sql-console-passwordless-authentication\}

SQL 콘솔 사용자는 각 세션마다 생성되며, 자동으로 순환되는 X.509 인증서를 사용해 인증합니다. 세션이 종료되면 해당 사용자는 제거됩니다. 감사를 위한 액세스 목록을 생성할 때는 콘솔에서 해당 서비스의 「Settings」 탭으로 이동하여 데이터베이스에 존재하는 데이터베이스 사용자 외에 SQL 콘솔 액세스도 함께 확인하십시오. 사용자 정의 역할이 구성된 경우, 사용자의 액세스 권한은 해당 사용자의 사용자 이름으로 끝나는 역할에 표시됩니다.

## SQL 콘솔 사용자와 역할 \{#sql-console-users-and-roles\}

기본 SQL 콘솔 역할은 Service Read Only 및 Service Admin 권한을 가진 사용자에게 할당할 수 있습니다. 자세한 내용은 [SQL 콘솔 역할 할당 관리](/cloud/guides/sql-console/manage-sql-console-role-assignments)를 참조하십시오. 이 가이드에서는 SQL 콘솔 사용자에 대한 사용자 정의 역할을 생성하는 방법을 설명합니다.

SQL 콘솔 사용자에 대한 사용자 정의 역할을 생성하고 일반 역할을 부여하려면 다음 명령을 실행하십시오. 이메일 주소는 콘솔에 있는 사용자의 이메일 주소와 정확히 일치해야 합니다. 

<VerticalStepper headerLevel="h4">

#### `database_developer`를 생성하고 권한 부여 \{#create-role-grant-permissions\}

`database_developer` 역할을 생성하고 `SHOW`, `CREATE`, `ALTER`, `DELETE` 권한을 부여합니다.
    
```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

#### SQL 콘솔 사용자 역할 생성 \{#create-sql-console-user-role\}

SQL 콘솔 사용자 my.user@domain.com에 대한 역할을 생성하고 database_developer 역할을 할당합니다.
    
```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

#### 사용자가 SQL 콘솔을 사용할 때 새 역할이 할당됨 \{#use-assigned-new-role\}

사용자는 SQL 콘솔을 사용할 때마다 자신의 이메일 주소와 연결된 역할이 할당됩니다. 

</VerticalStepper>

## 데이터베이스 인증 \{#database-authentication\}

### 데이터베이스 사용자 ID와 비밀번호 \{#database-user-id--password\}

비밀번호를 안전하게 보호하기 위해 [사용자 계정 생성](/sql-reference/statements/create/user.md) 시 `SHA256_hash` 메서드를 사용합니다. ClickHouse 데이터베이스 비밀번호는 최소 12자 이상이어야 하며, 대문자, 소문자, 숫자 및/또는 특수 문자를 포함하는 복잡성 요구 사항을 충족해야 합니다.

:::tip 비밀번호를 안전하게 생성하기
관리자보다 낮은 권한을 가진 사용자는 자신의 비밀번호를 직접 설정할 수 없습니다. 따라서 계정을 생성하기 전에
사용자에게 [이 도구](https://tools.keycdn.com/sha256-online-generator)와 같은 생성기를 사용해 비밀번호를 해시한 후 관리자에게 제공하도록 안내하십시오.
:::

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```


### 보안 셸(SSH) 인증을 사용하는 데이터베이스 사용자 \{#database-ssh\}

ClickHouse Cloud 데이터베이스 사용자에 대해 SSH 인증을 설정하려면 다음 단계를 따릅니다.

1. `ssh-keygen`을 사용하여 키 쌍을 생성합니다.
2. 공개 키를 사용하여 사용자를 생성합니다.
3. 사용자에게 역할 및/또는 권한을 부여합니다.
4. 개인 키를 사용하여 서비스에 인증하여 접속합니다.

예제와 함께 자세한 단계별 안내는 Knowledgebase에 있는 [SSH 키를 사용하여 ClickHouse Cloud에 연결하는 방법](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)을 참고하십시오.

## Database permissions \{#database-permissions\}

서비스와 데이터베이스에서 SQL [GRANT](/sql-reference/statements/grant) SQL 문을 사용하여 다음 설정을 구성합니다.

| Role                  | Description                                                                   |
|:----------------------|:------------------------------------------------------------------------------|
| Default               | 서비스에 대한 전체 관리자 권한                                                |
| Custom                | SQL [`GRANT`](/sql-reference/statements/grant) SQL 문을 사용하여 구성         |

- 데이터베이스 역할은 누적됩니다. 즉, 사용자가 두 개의 역할에 모두 속해 있는 경우, 두 역할 중 더 넓은 권한을 모두 갖게 됩니다. 역할을 추가한다고 해서 기존 권한을 잃지는 않습니다.
- 데이터베이스 역할은 다른 역할에 부여될 수 있으며, 이로 인해 계층 구조가 형성됩니다. 역할은 자신이 속한 역할의 모든 권한을 상속합니다.
- 데이터베이스 역할은 서비스마다 고유하며, 동일한 서비스 내 여러 데이터베이스에 적용될 수 있습니다.

아래 그림은 사용자에게 권한을 부여할 수 있는 다양한 방식을 보여 줍니다.

<Image img={user_grant_permissions_options} alt="사용자에게 권한을 부여할 수 있는 다양한 방식을 보여 주는 그림" size="md" background="black"/>

### 초기 설정 \{#initial-settings\}

데이터베이스에는 서비스가 생성될 때 자동으로 생성되는 `default` 계정이 있으며, 이 계정에는 기본 역할인 `default_role`이 부여됩니다. 서비스를 생성하는 사용자에게는 서비스 생성 시 `default` 계정에 할당되는 자동 생성 임의 비밀번호가 한 번 표시됩니다. 이 비밀번호는 초기 설정 이후에는 다시 표시되지 않지만, 이후 언제든지 콘솔에서 Service Admin 권한이 있는 사용자가 변경할 수 있습니다. 이 계정 또는 콘솔 내에서 Service Admin 권한을 가진 다른 계정은 언제든지 추가 데이터베이스 사용자와 역할을 설정할 수 있습니다.

:::note
콘솔에서 `default` 계정에 할당된 비밀번호를 변경하려면 왼쪽의 Services 메뉴로 이동하여 서비스를 선택한 후, Settings 탭으로 이동해 Reset password 버튼을 클릭하십시오.
:::

개인에게 연결된 새로운 사용자 계정을 생성하고 해당 사용자에게 `default_role`을 부여할 것을 권장합니다. 이렇게 하면 사용자가 수행한 작업을 사용자 ID로 식별할 수 있으며, `default` 계정은 비상(긴급) 대응과 같은 특수 상황에서만 사용하는 용도로 남겨둘 수 있습니다.

```sql
  CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
  GRANT default_role to userID;
```

SHA256 해시 생성기 또는 Python의 `hashlib`와 같은 코드 함수를 사용하여, 적절한 복잡도를 갖춘 12자 이상 비밀번호를 SHA256 문자열로 변환한 후 이를 시스템 관리자에게 비밀번호로 제공할 수 있습니다. 이렇게 하면 관리자가 평문 비밀번호를 직접 보거나 다루지 않도록 할 수 있습니다.


### SQL 콘솔 사용자를 포함한 데이터베이스 액세스 목록 \{#database-access-listings-with-sql-console-users\}

다음 절차를 사용하여 조직 내 SQL 콘솔과 데이터베이스 전반에 대한 전체 액세스 목록을 생성할 수 있습니다.

<VerticalStepper headerLevel="h4">

#### 모든 데이터베이스 권한 목록 가져오기 \{#get-a-list-of-all-database-grants\}

데이터베이스의 모든 권한 목록을 가져오려면 다음 쿼리를 실행합니다. 

```sql
SELECT grants.user_name,
grants.role_name,
users.name AS role_member,
grants.access_type,
grants.database,
grants.table
FROM system.grants LEFT OUTER JOIN system.role_grants ON grants.role_name = role_grants.granted_role_name
LEFT OUTER JOIN system.users ON role_grants.user_name = users.name

UNION ALL

SELECT grants.user_name,
grants.role_name,
role_grants.role_name AS role_member,
grants.access_type,
grants.database,
grants.table
FROM system.role_grants LEFT OUTER JOIN system.grants ON role_grants.granted_role_name = grants.role_name
WHERE role_grants.user_name is null;
```

#### SQL 콘솔에 액세스할 수 있는 Console 사용자와 권한 목록 연결하기 \{#associate-grant-list-to-console-users-with-access-to-sql-console\}

이 목록을 SQL 콘솔에 액세스할 수 있는 Console 사용자와 매핑합니다.
   
a. Console로 이동합니다.

b. 관련 서비스를 선택합니다.

c. 왼쪽에서 Settings를 선택합니다.

d. SQL console access 섹션으로 스크롤합니다.

e. 사용자 목록을 확인하려면, 데이터베이스에 액세스할 수 있는 사용자 수를 나타내는 링크 「There are # users with access to this service.」를 클릭합니다.

</VerticalStepper>

## Warehouse 사용자 \{#warehouse-users\}

Warehouse 사용자는 동일한 Warehouse 내의 서비스에서 공용으로 사용됩니다. 자세한 내용은 [Warehouse 액세스 제어](/cloud/reference/warehouses#access-controls)를 참조하십시오.