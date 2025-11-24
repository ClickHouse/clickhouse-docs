---
'sidebar_label': '데이터베이스 사용자 관리'
'slug': '/cloud/security/manage-database-users'
'title': '데이터베이스 사용자 관리'
'description': '이 페이지에서는 관리자가 데이터베이스 사용자를 추가하고, 할당을 관리하며, 데이터베이스 사용자를 제거하는 방법에 대해
  설명합니다.'
'doc_type': 'guide'
'keywords':
- 'database users'
- 'access management'
- 'security'
- 'permissions'
- 'user management'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';

This guide demonstrates two ways to manage database users, within SQL console and directly within the database.

### SQL 콘솔 비밀번호 없는 인증 {#sql-console-passwordless-authentication}
SQL 콘솔 사용자는 각 세션마다 생성되고 자동으로 순환되는 X.509 인증서를 사용하여 인증됩니다. 사용자는 세션이 종료되면 제거됩니다. 감사용 접근 목록을 생성할 때는 콘솔의 서비스 설정 탭으로 이동하여 데이터베이스 사용자 외에 SQL 콘솔 접근을 참고하시기 바랍니다. 사용자 정의 역할이 구성된 경우, 사용자의 접근 권한은 사용자의 사용자 이름으로 끝나는 역할에 나열됩니다.

## SQL 콘솔 사용자 및 역할 {#sql-console-users-and-roles}

기본 SQL 콘솔 역할은 서비스 읽기 전용 및 서비스 관리자 권한이 있는 사용자에게 할당할 수 있습니다. 자세한 내용은 [SQL 콘솔 역할 할당 관리](/cloud/guides/sql-console/manage-sql-console-role-assignments)를 참조하시기 바랍니다. 이 가이드는 SQL 콘솔 사용자에 대한 사용자 정의 역할을 만드는 방법을 설명합니다.

SQL 콘솔 사용자에 대한 사용자 정의 역할을 만들고 일반 역할을 부여하려면 다음 명령을 실행하십시오. 이메일 주소는 콘솔의 사용자 이메일 주소와 일치해야 합니다.

<VerticalStepper headerLevel="h4">

#### `database_developer` 만들고 권한 부여 {#create-role-grant-permissions} 

`database_developer` 역할을 만들고 `SHOW`, `CREATE`, `ALTER`, `DELETE` 권한을 부여합니다.
    
```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

#### SQL 콘솔 사용자 역할 만들기 {#create-sql-console-user-role} 

SQL 콘솔 사용자 my.user@domain.com에 대한 역할을 만들고 `database_developer` 역할을 할당합니다.
    
```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

#### 사용자가 SQL 콘솔을 사용할 때 새 역할이 할당됨 {#use-assigned-new-role}

사용자가 SQL 콘솔을 사용할 때마다 이메일 주소에 연결된 역할이 할당됩니다.

</VerticalStepper>

## 데이터베이스 인증 {#database-authentication}

### 데이터베이스 사용자 ID 및 비밀번호 {#database-user-id--password}

비밀번호를 안전하게 하려면 [사용자 계정 만들기](/sql-reference/statements/create/user.md) 시 SHA256_hash 방법을 사용하십시오. ClickHouse 데이터베이스 비밀번호는 최소 12자 이상이어야 하며 다음의 복잡성 요구 사항을 충족해야 합니다: 대문자, 소문자, 숫자 및/또는 특수 문자.

:::tip 안전한 비밀번호 생성
관리 권한이 없는 사용자는 비밀번호를 직접 설정할 수 없으므로, 사용자가 계정을 설정할 수 있도록 비밀번호를 해시하여 관리자에게 제공하기 전에 [이 생성기](https://tools.keycdn.com/sha256-online-generator)를 사용해 해시하도록 요청하십시오.
:::

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```

### 안전한 셸(SSH) 인증을 사용하는 데이터베이스 사용자 {#database-ssh}

ClickHouse Cloud 데이터베이스 사용자에 대한 SSH 인증을 설정하려면 다음 단계를 따르십시오.

1. ssh-keygen을 사용하여 키 쌍을 생성합니다.
2. 공개 키를 사용하여 사용자를 생성합니다.
3. 역할 및/또는 권한을 사용자에게 할당합니다.
4. 개인 키를 사용하여 서비스에 대해 인증합니다.

자세한 예제와 함께하는 설명서는 [SSH 키를 사용하여 ClickHouse Cloud에 연결하는 방법](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)에서 확인할 수 있습니다.

## 데이터베이스 권한 {#database-permissions}
서비스 및 데이터베이스 내에서 SQL [GRANT](/sql-reference/statements/grant) 문을 사용하여 다음을 구성하십시오.

| 역할                  | 설명                                                                       |
|:----------------------|:---------------------------------------------------------------------------|
| 기본                  | 서비스에 대한 전체 관리 액세스                                           |
| 사용자 정의           | SQL [`GRANT`](/sql-reference/statements/grant) 문을 사용하여 구성        |

- 데이터베이스 역할은 누적적입니다. 즉, 사용자가 두 개의 역할에 속하는 경우, 사용자는 두 역할에서 부여된 최대 액세스를 갖습니다. 역할을 추가한다고 해서 액세스가 줄어들지 않습니다.
- 데이터베이스 역할은 다른 역할에 부여될 수 있어 계층 구조를 형성합니다. 역할은 속한 역할의 모든 권한을 상속받습니다.
- 데이터베이스 역할은 서비스마다 고유하며, 동일한 서비스 내의 여러 데이터베이스에 걸쳐 적용할 수 있습니다.

아래 그림은 사용자가 권한을 부여받을 수 있는 다양한 방법을 보여줍니다.

<Image img={user_grant_permissions_options} alt='사용자가 권한을 부여받을 수 있는 다양한 방법을 보여주는 그림' size="md" background="black"/>

### 초기 설정 {#initial-settings} 
데이터베이스에는 서비스 생성 시 기본 역할이 부여되는 `default`라는 계정이 자동으로 추가됩니다. 서비스를 생성한 사용자는 서비스가 생성될 때 `default` 계정에 할당된 자동 생성된 임의 비밀번호를 받습니다. 초기 설정 후에는 비밀번호가 표시되지 않지만, 이후에 콘솔에서 서비스 관리자 권한이 있는 사용자가 변경할 수 있습니다. 이 계정이나 콘솔에서 서비스 관리자 권한이 있는 계정은 언제든지 추가 데이터베이스 사용자 및 역할을 설정할 수 있습니다.

:::note
콘솔에서 `default` 계정에 할당된 비밀번호를 변경하려면, 왼쪽의 서비스 메뉴로 이동하여 서비스를 선택하고, 설정 탭으로 가서 비밀번호 재설정 버튼을 클릭하십시오.
:::

우리는 사용자가 특정 개인과 관련된 새 사용자 계정을 만들고 기본 역할을 부여할 것을 권장합니다. 이는 사용자가 수행한 활동이 사용자 ID로 식별되도록 하고 `default` 계정은 비상 상황에서만 사용되도록 하기 위함입니다.

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

사용자는 SHA256 해시 생성기 또는 Python의 `hashlib`와 같은 코드 기능을 사용하여 적절한 복잡성 있는 12자 이상의 비밀번호를 SHA256 문자열로 변환하여 시스템 관리자에게 비밀번호로 제공할 수 있습니다. 이는 관리자가 일반 텍스트 비밀번호를 보거나 처리하지 않도록 보장합니다.

### SQL 콘솔 사용자를 통한 데이터베이스 접근 목록 {#database-access-listings-with-sql-console-users}
다음 프로세스를 사용하여 귀하의 조직 내 SQL 콘솔 및 데이터베이스에서 전체 접근 목록을 생성할 수 있습니다.

<VerticalStepper headerLevel="h4">

#### 모든 데이터베이스 권한 목록 가져오기 {#get-a-list-of-all-database-grants}

다음 쿼리를 실행하여 데이터베이스의 모든 권한 목록을 가져옵니다. 

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

#### SQL 콘솔에 접근할 수 있는 콘솔 사용자와 권한 목록 연결 {#associate-grant-list-to-console-users-with-access-to-sql-console}

이 목록을 SQL 콘솔에 접근할 수 있는 콘솔 사용자와 연결합니다.
   
a. 콘솔로 이동합니다.

b. 관련 서비스를 선택합니다.

c. 왼쪽에서 설정을 선택합니다.

d. SQL 콘솔 접근 섹션으로 스크롤합니다.

e. 데이터베이스에 접근할 수 있는 사용자 수를 나타내는 `There are # users with access to this service.` 링크를 클릭하여 사용자 목록을 확인합니다.

</VerticalStepper>

## 웨어하우스 사용자 {#warehouse-users}

웨어하우스 사용자는 동일한 웨어하우스 내의 서비스 간에 공유됩니다. 자세한 내용은 [웨어하우스 접근 제어](/cloud/reference/warehouses#access-controls)를 검토하시기 바랍니다.
