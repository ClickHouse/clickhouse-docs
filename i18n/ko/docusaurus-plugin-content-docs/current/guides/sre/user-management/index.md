---
'slug': '/operations/access-rights'
'sidebar_position': 1
'sidebar_label': '사용자 및 역할'
'title': '액세스 제어 및 계정 관리'
'keywords':
- 'ClickHouse Cloud'
- 'Access Control'
- 'User Management'
- 'RBAC'
- 'Security'
'description': 'ClickHouse Cloud에서의 액세스 제어 및 계정 관리를 설명합니다.'
'doc_type': 'guide'
---


# ClickHouse에서 사용자 및 역할 생성하기

ClickHouse는 [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) 접근 방식에 기반한 접근 제어 관리 기능을 지원합니다.

ClickHouse 접근 엔티티:
- [사용자 계정](#user-account-management)
- [역할](#role-management)
- [행 정책](#row-policy-management)
- [설정 프로파일](#settings-profiles-management)
- [쿼터](#quotas-management)

접근 엔티티는 다음과 같이 구성할 수 있습니다:

- SQL 기반 워크플로우.

    이 기능을 [활성화](#enabling-access-control)해야 합니다.

- 서버 [설정 파일](/operations/configuration-files.md)인 `users.xml` 및 `config.xml`.

SQL 기반 워크플로우를 사용하는 것을 권장합니다. 두 가지 설정 방법은 동시에 작동하므로, 계정 및 접근 권한 관리를 위해 서버 설정 파일을 사용하는 경우 SQL 기반 워크플로우로 원활하게 전환할 수 있습니다.

:::note
두 가지 설정 방법으로 동일한 접근 엔티티를 동시에 관리할 수 없습니다.
:::

:::note
ClickHouse Cloud 콘솔 사용자를 관리하려면 이 [페이지](/cloud/security/manage-cloud-users)를 참조하십시오.
:::

모든 사용자, 역할, 프로파일 등을 보고 그들의 모든 권한을 확인하려면 [`SHOW ACCESS`](/sql-reference/statements/show#show-access) 문을 사용하십시오.

## 개요 {#access-control-usage}

기본적으로 ClickHouse 서버는 `default` 사용자 계정을 제공합니다. 이 계정은 SQL 기반 접근 제어 및 계정 관리 사용이 허용되지 않지만 모든 권한과 허가를 가지고 있습니다. `default` 사용자 계정은 사용자 이름이 정의되지 않은 모든 경우에 사용되며, 예를 들어 클라이언트에서 로그인하거나 분산 쿼리에서 사용됩니다. 분산 쿼리 처리를 할 때는 서버 또는 클러스터의 구성에서 [사용자 및 비밀번호](/engines/table-engines/special/distributed.md) 속성이 지정되지 않으면 기본 사용자 계정이 사용됩니다.

ClickHouse 사용을 시작한 경우, 다음 시나리오를 고려하십시오:

1.  `default` 사용자에 대해 SQL 기반 접근 제어 및 계정 관리를 [활성화](#enabling-access-control)합니다.
2.  `default` 사용자 계정에 로그인하고 모든 필요한 사용자를 생성합니다. 관리자 계정(`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`)을 생성하는 것을 잊지 마십시오.
3.  `default` 사용자에 대한 [권한 제한](/operations/settings/permissions-for-queries) 및 SQL 기반 접근 제어 및 계정 관리 기능을 비활성화합니다.

### 현재 솔루션의 특성 {#access-control-properties}

- 데이터베이스와 테이블이 존재하지 않더라도 권한을 부여할 수 있습니다.
- 테이블이 삭제될 경우, 해당 테이블에 해당하는 모든 권한은 철회되지 않습니다. 즉, 나중에 동일한 이름의 새 테이블을 생성하더라도 모든 권한이 유효하게 유지됩니다. 삭제된 테이블에 대한 권한을 철회하려면, 예를 들어, `REVOKE ALL PRIVILEGES ON db.table FROM ALL` 쿼리를 실행해야 합니다.
- 권한의 수명 설정이 없습니다.

### 사용자 계정 {#user-account-management}

사용자 계정은 ClickHouse에서 인증할 수 있게 해주는 접근 엔티티입니다. 사용자 계정은 다음을 포함합니다:

- 식별 정보.
- 사용자가 실행할 수 있는 쿼리의 범위를 정의하는 [권한](/sql-reference/statements/grant.md#privileges).
- ClickHouse 서버에 연결할 수 있는 호스트.
- 할당된 역할 및 기본 역할.
- 사용자 로그인 시 기본적으로 적용되는 제약 조건이 있는 설정.
- 할당된 설정 프로파일.

사용자 계정에 권한을 부여하기 위해서는 [GRANT](/sql-reference/statements/grant.md) 쿼리 또는 [역할](#role-management)을 할당할 수 있습니다. ClickHouse는 사용자의 권한을 철회하기 위해 [REVOKE](/sql-reference/statements/revoke.md) 쿼리를 제공합니다. 사용자의 권한을 나열하려면 [SHOW GRANTS](/sql-reference/statements/show#show-grants) 문을 사용하십시오.

관리 쿼리:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 설정 적용 {#access-control-settings-applying}

설정은 사용자 계정, 할당된 역할 및 설정 프로파일에서 다르게 구성할 수 있습니다. 사용자 로그인 시, 설정이 다양한 접근 엔티티에 대해 구성되어 있는 경우, 해당 설정의 값과 제약 조건은 다음과 같은 순서(우선 순위가 높은 것부터 낮은 것까지)로 적용됩니다:

1.  사용자 계정 설정.
2.  사용자 계정의 기본 역할에 대한 설정. 어떤 역할에서 설정이 구성되어 있으면, 해당 설정의 적용 순서는 정의되지 않습니다.
3.  사용자 또는 기본 역할에 할당된 설정 프로파일의 설정. 어떤 프로파일에서 설정이 구성되어 있으면, 해당 설정의 적용 순서는 정의되지 않습니다.
4.  기본적으로 또는 [기본 프로파일](/operations/server-configuration-parameters/settings#default_profile)에서 전체 서버에 적용되는 설정.

### 역할 {#role-management}

역할은 사용자 계정에 부여할 수 있는 접근 엔티티의 컨테이너입니다.

역할은 다음을 포함합니다:

- [권한](/sql-reference/statements/grant#privileges)
- 설정 및 제약 조건
- 할당된 역할 목록

관리 쿼리:

- [CREATE ROLE](/sql-reference/statements/create/role)
- [ALTER ROLE](/sql-reference/statements/alter/role)
- [DROP ROLE](/sql-reference/statements/drop#drop-role)
- [SET ROLE](/sql-reference/statements/set-role)
- [SET DEFAULT ROLE](/sql-reference/statements/set-role)
- [SHOW CREATE ROLE](/sql-reference/statements/show#show-create-role)
- [SHOW ROLES](/sql-reference/statements/show#show-roles)

권한은 [GRANT](/sql-reference/statements/grant.md) 쿼리를 통해 역할에 부여할 수 있습니다. 역할에서 권한을 철회하려면 ClickHouse는 [REVOKE](/sql-reference/statements/revoke.md) 쿼리를 제공합니다.

#### 행 정책 {#row-policy-management}

행 정책은 사용자가 또는 역할이 사용할 수 있는 행을 정의하는 필터입니다. 행 정책은 하나의 특정 테이블에 대한 필터와 이 행 정책을 사용해야 하는 역할 및/또는 사용자 목록을 포함합니다.

:::note
행 정책은 읽기 전용 접근 권한을 가진 사용자에게만 의미가 있습니다. 사용자가 테이블을 수정하거나 테이블 간에 파티션을 복사할 수 있다면, 행 정책의 제한이 무효화됩니다.
:::

관리 쿼리:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 설정 프로파일 {#settings-profiles-management}

설정 프로파일은 [설정](/operations/settings/index.md)의 모음입니다. 설정 프로파일은 설정 및 제약 조건과 이 프로파일이 적용되는 역할 및/또는 사용자 목록을 포함합니다.

관리 쿼리:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### 쿼터 {#quotas-management}

쿼터는 자원 사용량을 제한합니다. [쿼터](/operations/quotas.md)를 참조하십시오.

쿼터는 특정 기간에 대한 제한 집합과 이 쿼터를 사용해야 하는 역할 및/또는 사용자 목록을 포함합니다.

관리 쿼리:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL 기반 접근 제어 및 계정 관리 활성화 {#enabling-access-control}

- 구성 저장을 위한 디렉토리를 설정합니다.

    ClickHouse는 [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path) 서버 구성 매개변수에 설정된 폴더에 접근 엔티티 구성을 저장합니다.

- 적어도 하나의 사용자 계정에 대해 SQL 기반 접근 제어 및 계정 관리를 활성화합니다.

    기본적으로 모든 사용자의 SQL 기반 접근 제어 및 계정 관리는 비활성화되어 있습니다. `users.xml` 구성 파일에서 적어도 한 사용자를 구성하고 [`access_management`](/operations/settings/settings-users.md#access_management-user-setting), `named_collection_control`, `show_named_collections`, `show_named_collections_secrets` 설정 값을 1로 설정해야 합니다.

## SQL 사용자 및 역할 정의하기 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloud에서 작업하는 경우, [클라우드 접근 관리](/cloud/security/console-roles)를 참조하십시오.
:::

이 문서는 SQL 사용자 및 역할 정의의 기본 사항과 이러한 권한 및 허가를 데이터베이스, 테이블, 행 및 컬럼에 적용하는 방법을 보여줍니다.

### SQL 사용자 모드 활성화 {#enabling-sql-user-mode}

1.  `<default>` 사용자 아래의 `users.xml` 파일에서 SQL 사용자 모드를 활성화합니다:
```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

    :::note
    `default` 사용자는 새로 설치 시 생성되는 유일한 사용자이며, 기본적으로 노드 간 통신에 사용되는 계정입니다.

    운영 환경에서는 SQL 관리 사용자와의 노드 간 통신 구성이 완료되면 이 사용자를 비활성화하는 것이 권장됩니다. `<secret>`, 클러스터 자격 증명 및/또는 노드 간 HTTP 및 전송 프로토콜 자격 증명으로 설정하여 `default` 계정이 노드 간 통신에 사용되기 때문입니다.
    :::

2. 노드를 재시작하여 변경 사항을 적용합니다.

3. ClickHouse 클라이언트를 시작합니다:
```sql
clickhouse-client --user default --password <password>
```
### 사용자 정의하기 {#defining-users}

1. SQL 관리자 계정을 생성합니다:
```sql
CREATE USER clickhouse_admin IDENTIFIED BY 'password';
```
2. 새 사용자에게 모든 관리 권한을 부여합니다
```sql
GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
```

## 권한 변경 {#alter-permissions}

이 문서는 권한을 정의하는 방법과 특권 사용자에 대해 `ALTER` 문을 사용할 때 권한이 어떻게 작용하는지에 대한 이해를 도와주기 위해 작성되었습니다.

`ALTER` 문은 여러 카테고리로 나뉘며, 그 중 일부는 계층적이고 일부는 그렇지 않습니다.

**예시 DB, 테이블 및 사용자 구성**
1. 관리자 사용자로 샘플 사용자를 생성합니다
```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. 샘플 데이터베이스를 생성합니다
```sql
CREATE DATABASE my_db;
```

3. 샘플 테이블을 생성합니다
```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. 권한을 부여 및 철회할 샘플 관리자 사용자를 생성합니다
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
권한을 부여하거나 철회하려면 관리자 사용자가 `WITH GRANT OPTION` 권한을 가지고 있어야 합니다.
예를 들어:
```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```
권한을 `GRANT`하거나 `REVOKE` 하려면, 사용자는 먼저 해당 권한을 가지고 있어야 합니다.
:::

**권한 부여 또는 철회하기**

`ALTER` 계층:

```response
├── ALTER (only for table and view)/
│   ├── ALTER TABLE/
│   │   ├── ALTER UPDATE
│   │   ├── ALTER DELETE
│   │   ├── ALTER COLUMN/
│   │   │   ├── ALTER ADD COLUMN
│   │   │   ├── ALTER DROP COLUMN
│   │   │   ├── ALTER MODIFY COLUMN
│   │   │   ├── ALTER COMMENT COLUMN
│   │   │   ├── ALTER CLEAR COLUMN
│   │   │   └── ALTER RENAME COLUMN
│   │   ├── ALTER INDEX/
│   │   │   ├── ALTER ORDER BY
│   │   │   ├── ALTER SAMPLE BY
│   │   │   ├── ALTER ADD INDEX
│   │   │   ├── ALTER DROP INDEX
│   │   │   ├── ALTER MATERIALIZE INDEX
│   │   │   └── ALTER CLEAR INDEX
│   │   ├── ALTER CONSTRAINT/
│   │   │   ├── ALTER ADD CONSTRAINT
│   │   │   └── ALTER DROP CONSTRAINT
│   │   ├── ALTER TTL/
│   │   │   └── ALTER MATERIALIZE TTL
│   │   ├── ALTER SETTINGS
│   │   ├── ALTER MOVE PARTITION
│   │   ├── ALTER FETCH PARTITION
│   │   └── ALTER FREEZE PARTITION
│   └── ALTER LIVE VIEW/
│       ├── ALTER LIVE VIEW REFRESH
│       └── ALTER LIVE VIEW MODIFY QUERY
├── ALTER DATABASE
├── ALTER USER
├── ALTER ROLE
├── ALTER QUOTA
├── ALTER [ROW] POLICY
└── ALTER [SETTINGS] PROFILE
```

1. 사용자 또는 역할에 `ALTER` 권한 부여하기

`GRANT ALTER on *.* TO my_user`를 사용하면 최상위 `ALTER TABLE` 및 `ALTER VIEW`에만 영향을 미치며, 다른 `ALTER` 문은 개별적으로 부여하거나 철회해야 합니다.

예를 들어, 기본 `ALTER` 권한 부여:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

결과로 얻은 권한 집합:

```sql
SHOW GRANTS FOR  my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 706befbc-525e-4ec1-a1a2-ba2508cc09e3

┌─GRANTS FOR my_user───────────────────────────────────────────┐
│ GRANT ALTER TABLE, ALTER VIEW ON my_db.my_table TO my_user   │
└──────────────────────────────────────────────────────────────┘
```

이렇게 하면 위의 예에서 `ALTER TABLE` 및 `ALTER VIEW`에 대한 모든 권한이 부여되지만, `ALTER ROW POLICY`와 같은 특정 다른 `ALTER` 권한은 부여되지 않습니다(계층 구조를 참조하면 `ALTER ROW POLICY`가 `ALTER TABLE` 또는 `ALTER VIEW`의 하위 항목이 아님을 알 수 있습니다). 이러한 권한은 명시적으로 부여하거나 철회해야 합니다.

필요한 `ALTER` 권한의 하위 집합만 필요할 경우, 각 권한을 별도로 부여할 수 있으며, 해당 권한에 하위 권한이 있는 경우, 자동으로 부여됩니다.

예를 들어:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

부여는 다음과 같이 설정됩니다:

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 47b3d03f-46ac-4385-91ec-41119010e4e2

┌─GRANTS FOR my_user────────────────────────────────┐
│ GRANT ALTER COLUMN ON default.my_table TO my_user │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

다음과 같은 하위 권한도 부여됩니다:

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. 사용자 및 역할에서 `ALTER` 권한 철회하기

`REVOKE` 문은 `GRANT` 문과 유사하게 작동합니다.

사용자/역할이 하위 권한을 부여받았다면 그 하위 권한을 직접 철회하거나 그 하위를 상속하는 상위 권한을 철회할 수 있습니다.

예를 들어, 사용자에게 `ALTER ADD COLUMN` 권한이 부여된 경우:

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 61fe0fdc-1442-4cd6-b2f3-e8f2a853c739

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 27791226-a18f-46c8-b2b4-a9e64baeb683

┌─GRANTS FOR my_user──────────────────────────────────┐
│ GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user │
└─────────────────────────────────────────────────────┘
```

특정 권한을 개별적으로 철회할 수 있습니다:

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

또는 모든 상위 수준에서 철회할 수 있습니다 (모든 COLUMN 하위 권한을 철회):

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user;
```

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user

Query id: b882ba1b-90fb-45b9-b10f-3cda251e2ccc

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: e7d341de-de65-490b-852c-fa8bb8991174

Ok.

0 rows in set. Elapsed: 0.003 sec.
```

**추가**

권한은 `WITH GRANT OPTION`을 가질 뿐만 아니라 자신의 권한도 가진 사용자에 의해 부여되어야 합니다.

1. 관리 사용자에게 권한을 부여하고 일련의 권한을 관리할 수 있도록 허용합니다.
아래는 예시입니다:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

이제 사용자는 `ALTER COLUMN` 및 모든 하위 권한을 부여하거나 철회할 수 있습니다.

**테스트**

1. `SELECT` 권한을 추가합니다
```sql
GRANT SELECT ON my_db.my_table TO my_user;
```

2. 사용자에게 컬럼 추가 권한을 추가합니다
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 제한된 사용자로 로그인합니다
```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. 컬럼 추가를 테스트합니다
```sql
ALTER TABLE my_db.my_table ADD COLUMN column2 String;
```

```response
ALTER TABLE my_db.my_table
    ADD COLUMN `column2` String

Query id: d5d6bfa1-b80c-4d9f-8dcd-d13e7bd401a5

Ok.

0 rows in set. Elapsed: 0.010 sec.
```

```sql
DESCRIBE my_db.my_table;
```

```response
DESCRIBE TABLE my_db.my_table

Query id: ab9cb2d0-5b1a-42e1-bc9c-c7ff351cb272

┌─name────┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

4. 컬럼 삭제를 테스트합니다
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: Not enough privileges. To execute this query it's necessary to have grant ALTER DROP COLUMN(column2) ON my_db.my_table. (ACCESS_DENIED)
```

5. 권한을 부여함으로써 관리자 권한을 테스트합니다
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. 관리자 변경 사용자로 로그인합니다
```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. 하위 권한을 부여합니다
```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. 관리자 변경 사용자가 갖고 있지 않은 권한을 부여 시도합니다. 이 권한은 관리자 사용자에 대한 부여의 하위 권한이 아닙니다.
```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: Not enough privileges. To execute this query it's necessary to have grant ALTER UPDATE ON my_db.my_table WITH GRANT OPTION. (ACCESS_DENIED)
```

**요약**
`ALTER` 권한은 테이블 및 뷰에 대해 계층적이지만 다른 `ALTER` 문에 대해서는 그렇지 않습니다. 권한은 세분화된 수준에서 설정하거나 권한 그룹으로 설정할 수 있으며, 유사하게 철회할 수 있습니다. 권한을 부여하거나 철회하는 사용자는 사용자에게 권한을 설정하기 위해 `WITH GRANT OPTION`을 가져야 하며, 자신이 이미 그 권한을 가져야 합니다. 권한을 부여받지 않은 사용자는 자신의 권한을 철회할 수 없습니다.
