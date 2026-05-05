---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: '사용자 및 역할'
title: '액세스 제어 및 계정 관리'
keywords: ['ClickHouse Cloud', '액세스 제어', '사용자 관리', 'RBAC', '보안']
description: 'ClickHouse Cloud에서 액세스 제어 및 계정 관리에 대해 설명합니다'
doc_type: 'guide'
---

# ClickHouse에서 사용자 및 역할 생성 \{#creating-users-and-roles-in-clickhouse\}

ClickHouse는 [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) 방식에 기반한 액세스 제어 관리를 지원합니다.

ClickHouse 액세스 엔터티:

- [사용자 계정](#user-account-management)
- [역할](#role-management)
- [Row Policy](#row-policy-management)
- [Settings Profile](#settings-profiles-management)
- [Quota](#quotas-management)

다음 방법을 사용하여 액세스 엔터티를 구성할 수 있습니다:

- SQL 기반 워크플로우.

    이 기능을 사용하려면 [액세스 제어를 활성화](#enabling-access-control)해야 합니다.

- 서버 [설정 파일](/operations/configuration-files.md) `users.xml` 및 `config.xml`.

SQL 기반 워크플로우 사용을 권장합니다. 두 가지 구성 방법은 동시에 동작하므로, 서버 설정 파일로 계정 및 액세스 권한을 관리하는 경우에도 SQL 기반 워크플로우로 원활하게 전환할 수 있습니다.

:::note
두 구성 방법을 동시에 사용하여 동일한 액세스 엔터티를 관리할 수는 없습니다.
:::

:::note
ClickHouse Cloud 콘솔 사용자를 관리하려는 경우 이 [페이지](/cloud/security/manage-cloud-users)를 참조하십시오.
:::

모든 사용자, 역할, 프로필 등과 이들에 대한 모든 grant를 확인하려면 [`SHOW ACCESS`](/sql-reference/statements/show#show-access) SQL 문을 사용하십시오.

## 개요 \{#access-control-usage\}

기본적으로 ClickHouse 서버는 SQL 기반 액세스 제어와 계정 관리의 적용을 받지 않지만 모든 권한을 가진 `default` 사용자 계정을 제공합니다. `default` 사용자 계정은 예를 들어 클라이언트에서 로그인할 때나 분산 쿼리를 실행할 때처럼 사용자 이름이 지정되지 않은 모든 경우에 사용됩니다. 분산 쿼리를 처리할 때 서버 또는 클러스터 구성에서 [user and password](/engines/table-engines/special/distributed.md) 속성을 지정하지 않은 경우에도 `default` 사용자 계정을 사용합니다.

ClickHouse 사용을 막 시작했다면 다음 시나리오를 고려하십시오.

1.  `default` 사용자에 대해 SQL 기반 액세스 제어와 계정 관리를 [활성화](#enabling-access-control)합니다.
2.  `default` 사용자 계정으로 로그인한 후 필요한 모든 사용자를 생성합니다. 관리자 계정(`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`) 생성을 잊지 마십시오.
3.  `default` 사용자의 [권한을 제한](/operations/settings/permissions-for-queries)하고, 해당 사용자에 대한 SQL 기반 액세스 제어와 계정 관리를 비활성화합니다.

### 현재 솔루션의 속성 \{#access-control-properties\}

- 존재하지 않는 데이터베이스와 테이블에 대해서도 권한을 부여할 수 있습니다.
- 테이블이 삭제되더라도 해당 테이블에 해당하는 모든 권한은 자동으로 취소되지 않습니다. 이는 나중에 동일한 이름으로 새 테이블을 생성하더라도 모든 권한이 그대로 유효하게 남는다는 뜻입니다. 삭제된 테이블에 해당하는 권한을 취소하려면, 예를 들어 `REVOKE ALL PRIVILEGES ON db.table FROM ALL` 쿼리를 실행해야 합니다.
- 권한에 대한 유효 기간(lifetime)을 설정하는 기능은 없습니다.

### 사용자 계정 \{#user-account-management\}

사용자 계정은 ClickHouse에서 사용자를 인증하는 데 사용되는 접근 개체입니다. 사용자 계정에는 다음이 포함됩니다:

- 식별 정보
- 사용자가 실행할 수 있는 쿼리 범위를 정의하는 [권한](/sql-reference/statements/grant.md#privileges)
- ClickHouse 서버에 연결하도록 허용된 호스트
- 할당된 역할과 기본 역할
- 사용자 로그인 시 기본적으로 적용되는 제약이 포함된 설정
- 할당된 설정 프로필

권한은 [GRANT](/sql-reference/statements/grant.md) 쿼리나 [역할](#role-management)을 할당하여 사용자 계정에 부여할 수 있습니다. 사용자로부터 권한을 회수하려면 ClickHouse에서 제공하는 [REVOKE](/sql-reference/statements/revoke.md) 쿼리를 사용합니다. 사용자의 권한 목록을 확인하려면 [SHOW GRANTS](/sql-reference/statements/show#show-grants) SQL 문을 사용합니다.

관리 쿼리:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 설정 적용 \{#access-control-settings-applying\}

설정은 사용자 계정, 해당 계정에 부여된 역할, 그리고 settings profile에서 서로 다르게 구성할 수 있습니다. 사용자가 로그인할 때 하나의 설정이 서로 다른 액세스 엔터티에 대해 구성되어 있다면, 이 설정의 값과 제약 조건은 다음과 같은 순서(우선순위가 높은 것부터 낮은 것 순)로 적용됩니다.

1.  사용자 계정 설정입니다.
2.  사용자 계정의 기본 역할에 대한 설정입니다. 일부 역할에만 설정이 구성되어 있는 경우, 해당 설정이 적용되는 순서는 정의되지 않습니다.
3.  사용자 또는 해당 기본 역할에 할당된 settings profile의 설정입니다. 일부 프로필에만 설정이 구성되어 있는 경우, 해당 설정이 적용되는 순서는 정의되지 않습니다.
4.  기본값으로 전체 서버에 적용되는 설정 또는 [default profile](/operations/server-configuration-parameters/settings#default_profile)의 설정입니다.

### 역할 \{#role-management\}

역할은 사용자 계정에 부여할 수 있는 접근 엔터티를 담는 컨테이너입니다.

역할에는 다음이 포함됩니다.

- [권한](/sql-reference/statements/grant#privileges)
- 설정 및 제약 조건
- 할당된 역할 목록

관리용 쿼리:

- [CREATE ROLE](/sql-reference/statements/create/role)
- [ALTER ROLE](/sql-reference/statements/alter/role)
- [DROP ROLE](/sql-reference/statements/drop#drop-role)
- [SET ROLE](/sql-reference/statements/set-role)
- [SET DEFAULT ROLE](/sql-reference/statements/set-role)
- [SHOW CREATE ROLE](/sql-reference/statements/show#show-create-role)
- [SHOW ROLES](/sql-reference/statements/show#show-roles)

권한은 [GRANT](/sql-reference/statements/grant.md) 쿼리를 사용하여 역할에 부여할 수 있습니다. 역할에서 권한을 취소하려면 ClickHouse에서 [REVOKE](/sql-reference/statements/revoke.md) 쿼리를 사용할 수 있습니다.

#### Row policy \{#row-policy-management\}

Row policy는 어떤 행이 특정 사용자나 역할에 사용 가능한지를 정의하는 필터입니다. Row policy에는 하나의 특정 테이블에 대한 필터와 이 Row policy를 사용하도록 지정된 역할 및/또는 사용자 목록이 포함됩니다.

:::note
Row policy는 읽기 전용(readonly) 권한이 있을 때만 의미가 있습니다. 테이블을 수정하거나 테이블 간에 파티션을 복사할 수 있다면, Row policy의 제한이 사실상 무력화됩니다.
:::

관리용 쿼리:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### Settings profile \{#settings-profiles-management\}

Settings profile은(는) [settings](/operations/settings/index.md)의 컬렉션입니다. Settings profile에는 settings(설정)와 제약 조건, 그리고 이 프로필이 적용되는 역할(role) 및/또는 사용자 목록이 포함됩니다.

관리 쿼리:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### Quota \{#quotas-management\}

Quota는 리소스 사용량을 제한하는 기능입니다. 자세한 내용은 [Quotas](/operations/quotas.md)를 참조하십시오.

Quota에는 여러 기간에 대한 제한 값 집합과, 이 Quota를 사용하도록 지정된 역할 및/또는 사용자 목록이 포함됩니다.

관리용 쿼리:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL 기반 액세스 제어 및 계정 관리 활성화 \{#enabling-access-control\}

- 구성 저장용 디렉터리를 설정합니다.

    ClickHouse는 액세스 엔터티 구성을 [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path) 서버 구성 파라미터에 지정된 폴더에 저장합니다.

- 최소 하나의 사용자 계정에 대해 SQL 기반 액세스 제어 및 계정 관리를 활성화합니다.

    기본적으로 SQL 기반 액세스 제어 및 계정 관리는 모든 사용자에 대해 비활성화되어 있습니다. `users.xml` 구성 파일에서 최소 한 명의 사용자를 정의하고, [`access_management`](/operations/settings/settings-users.md#access_management-user-setting), `named_collection_control`, `show_named_collections`, `show_named_collections_secrets` 설정 값을 1로 설정해야 합니다.

## SQL 사용자와 역할 정의 \{#defining-sql-users-and-roles\}

:::tip
ClickHouse Cloud에서 작업하는 경우 [Cloud 액세스 관리](/cloud/security/console-roles)를 참고하십시오.
:::

이 문서에서는 SQL 사용자와 역할을 정의하는 기본 개념과 해당 권한과 퍼미션을 데이터베이스, 테이블, 행, 컬럼에 적용하는 방법을 소개합니다.

### SQL 사용자 모드 활성화 \{#enabling-sql-user-mode\}

1.  `users.xml` 파일에서 `<default>` 사용자 아래에 SQL 사용자 모드를 활성화합니다:
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default` 사용자는 새로 설치할 때 생성되는 유일한 사용자이며, 기본적으로 노드 간 통신에 사용되는 계정입니다.

    운영 환경에서는 SQL 관리자 사용자로 노드 간 통신을 구성하고, `<secret>`과 클러스터 자격 증명, 그리고/또는 노드 간 HTTP 및 전송 프로토콜 자격 증명을 사용하여 노드 간 통신을 설정한 이후에는, `default` 계정이 노드 간 통신에 사용되므로 이 사용자를 비활성화하는 것이 좋습니다.
    :::

2. 변경 사항을 적용하려면 노드를 다시 시작합니다.

3. ClickHouse 클라이언트를 시작합니다:
    ```sql
    clickhouse-client --user default --password <password>
    ```

### 사용자 정의하기 \{#defining-users\}

1. SQL 관리자 계정을 생성합니다:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. 새 사용자에게 전체 관리자 권한을 부여합니다:
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

## 권한 변경 \{#alter-permissions\}

이 문서는 권한을 정의하는 방법과, 특권 사용자가 `ALTER` SQL 문을 사용할 때 권한이 어떻게 동작하는지에 대해 이해하는 데 도움이 되는 내용을 설명합니다.

`ALTER` SQL 문은 여러 범주로 나뉘며, 일부는 계층적 구조를 가지지만 일부는 그렇지 않아 명시적으로 정의해야 합니다.

**예시 DB, 테이블 및 사용자 설정**

1. 관리자 권한 사용자로 샘플 사용자를 생성합니다.

```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. 샘플 데이터베이스 생성하기

```sql
CREATE DATABASE my_db;
```

3. 예제 테이블을 생성합니다

```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. 권한을 부여/회수할 샘플 관리자 계정을 생성합니다

```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
권한을 부여하거나 취소하려면 관리자 사용자는 `WITH GRANT OPTION` 권한을 가지고 있어야 합니다.
예를 들어:

```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
```

`GRANT` 또는 `REVOKE` 권한을 실행하려면, 먼저 해당 권한을 보유하고 있어야 합니다.
:::

**권한 부여 및 회수**

`ALTER` 계층 구조:

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

1. `ALTER` 권한을 사용자 또는 역할에 부여하기

`GRANT ALTER on *.* TO my_user`를 사용하면 상위 수준의 `ALTER TABLE` 및 `ALTER VIEW`에만 영향을 주며, 그 외 `ALTER` 관련 SQL 문은 각각 개별적으로 부여하거나 회수해야 합니다.

예를 들어, 기본 `ALTER` 권한을 부여하려면 다음과 같습니다:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

결과적으로 부여되는 권한:

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

앞선 예시에서처럼 `ALTER TABLE` 및 `ALTER VIEW` 아래의 모든 권한이 부여되지만, `ALTER ROW POLICY`와 같은 다른 일부 `ALTER` 권한은 부여되지 않습니다(계층 구조를 다시 보면 `ALTER ROW POLICY`는 `ALTER TABLE`이나 `ALTER VIEW`의 하위 권한이 아님을 알 수 있습니다). 이러한 권한은 명시적으로 GRANT 또는 REVOKE 해야 합니다.

`ALTER` 권한 중 일부만 필요하다면 각각 별도로 GRANT 할 수 있으며, 해당 권한에 하위 권한이 존재하는 경우에는 이러한 하위 권한도 자동으로 함께 부여됩니다.

예를 들어:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

권한은 다음과 같이 설정합니다:

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

이는 다음 하위 권한도 함께 부여합니다:

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. 사용자와 역할에서 `ALTER` 권한 취소

`REVOKE` 문은 `GRANT` 문과 유사하게 동작합니다.

사용자/역할에 하위 권한이 부여된 경우, 해당 하위 권한을 직접 취소하거나 이것이 상속받은 상위 권한을 취소하면 됩니다.

예를 들어, 사용자에게 `ALTER ADD COLUMN` 권한이 부여되었다면

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

권한은 개별적으로 취소할 수 있습니다:

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

또는 상위 레벨에서 취소할 수 있습니다(모든 COLUMN 하위 권한 취소):

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

권한은 `WITH GRANT OPTION`뿐만 아니라 해당 권한 자체도 보유한 사용자가 부여해야 합니다.

1. 관리자 USER에게 권한을 부여하고 특정 권한 집합을 관리할 수 있도록 하려면
   아래 예시를 참고하십시오:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

이제 사용자는 `ALTER COLUMN` 및 모든 하위 권한을 부여하거나 취소할 수 있습니다.

**테스트**

1. `SELECT` 권한을 추가합니다

```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. USER에 컬럼 추가 권한을 부여합니다

```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 제한된 권한을 가진 USER로 로그인하십시오

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

5. 권한을 부여해 alter admin 테스트하기

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. alter 관리자 USER 계정으로 로그인합니다

```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. 하위 권한 부여

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. alter admin 사용자가 가지고 있지 않고 admin 사용자에게 부여된 권한의 하위 권한도 아닌 권한을 부여하려 시도하여 동작을 테스트합니다.

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
`ALTER` 권한은 테이블과 뷰에 대한 `ALTER`에는 계층 구조가 적용되지만, 다른 `ALTER` SQL 문에는 적용되지 않습니다. 권한은 세밀한 단위로 설정하거나 여러 권한을 묶어 설정할 수 있으며, 동일한 방식으로 회수할 수도 있습니다. 권한을 부여하거나 회수하는 사용자는 다른 사용자(자기 자신 포함)에 대한 권한을 설정하려면 `WITH GRANT OPTION` 권한을 가지고 있어야 하며, 부여·회수하려는 권한 자체도 이미 보유하고 있어야 합니다. `WITH GRANT OPTION` 권한이 없는 사용자는 자신의 권한을 스스로 회수할 수 없습니다.
