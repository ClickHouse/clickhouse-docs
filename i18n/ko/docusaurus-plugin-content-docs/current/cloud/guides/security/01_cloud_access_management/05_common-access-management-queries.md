---
'sidebar_label': '공통 접근 관리 쿼리'
'title': '공통 접근 관리 쿼리'
'slug': '/cloud/security/common-access-management-queries'
'description': '이 문서에서는 SQL 사용자 및 역할 정의의 기본 사항과 이러한 권한 및 허가를 데이터베이스, 테이블, 행 및 컬럼에
  적용하는 방법을 보여줍니다.'
'keywords':
- 'ClickHouse Cloud'
- 'access management'
'doc_type': 'guide'
---

import CommonUserRolesContent from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# 공통 접근 관리 쿼리

:::tip 자체 관리
자체 관리 ClickHouse를 사용 중인 경우 [SQL 사용자 및 역할](/guides/sre/user-management/index.md)을 참조하세요.
:::

이 문서에서는 SQL 사용자 및 역할을 정의하고 이러한 권한 및 허가를 데이터베이스, 테이블, 행 및 컬럼에 적용하는 기본 사항을 보여줍니다.

## 관리자 사용자 {#admin-user}

ClickHouse Cloud 서비스에는 서비스가 생성될 때 생성되는 관리자 사용자 `default`가 있습니다. 비밀번호는 서비스 생성 시 제공되며, **Admin** 역할을 가진 ClickHouse Cloud 사용자가 재설정할 수 있습니다.

ClickHouse Cloud 서비스에 추가 SQL 사용자를 추가하려면 SQL 사용자 이름과 비밀번호가 필요합니다. 그들에게 관리자 수준의 권한을 부여하려면 새로운 사용자에게 `default_role` 역할을 부여하세요. 예를 들어, 사용자 `clickhouse_admin` 추가:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL 콘솔을 사용할 때 귀하의 SQL 문은 `default` 사용자로 실행되지 않습니다. 대신, 문은 `sql-console:${cloud_login_email}`이라는 이름의 사용자로 실행되며, 여기서 `cloud_login_email`은 현재 쿼리를 실행 중인 사용자의 이메일입니다.

자동으로 생성된 SQL 콘솔 사용자는 `default` 역할을 가집니다.
:::

## 비밀번호 없는 인증 {#passwordless-authentication}

SQL 콘솔에서 사용할 수 있는 두 가지 역할이 있습니다: `default_role`과 동일한 권한을 가진 `sql_console_admin`과 읽기 전용 권한을 가진 `sql_console_read_only`입니다.

관리자 사용자는 기본적으로 `sql_console_admin` 역할이 할당되므로 이들에게는 변경 사항이 없습니다. 그러나 `sql_console_read_only` 역할은 비관리자 사용자가 모든 인스턴스에 대한 읽기 전용 또는 전체 접근 권한을 부여받을 수 있도록 합니다. 관리자가 이 접근을 구성해야 합니다. 역할은 인스턴스 특정 요구 사항에 맞게 `GRANT` 또는 `REVOKE` 명령을 사용하여 조정할 수 있으며, 이 역할에 대한 변경 사항은 지속적으로 유지됩니다.

### 세분화된 접근 제어 {#granular-access-control}

이 접근 제어 기능은 사용자 수준의 세분화된 제어를 위해 수동으로 구성할 수 있습니다. 새로운 `sql_console_*` 역할을 사용자에게 부여하기 전에, 네임스페이스 `sql-console-role:<email>`에 일치하는 SQL 콘솔 사용자 전용 데이터베이스 역할을 생성해야 합니다. 예를 들면:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

일치하는 역할이 감지되면 사용자가 보일러플레이트 역할 대신 할당됩니다. 이는 `sql_console_sa_role` 및 `sql_console_pm_role`와 같은 역할을 생성하고 특정 사용자에게 부여하는 등의 더 복잡한 접근 제어 구성을 도입합니다. 예를 들면:

```sql
CREATE ROLE OR REPLACE sql_console_sa_role;
GRANT <whatever level of access> TO sql_console_sa_role;
CREATE ROLE OR REPLACE sql_console_pm_role;
GRANT <whatever level of access> TO sql_console_pm_role;
CREATE ROLE OR REPLACE `sql-console-role:christoph@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:jake@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:zach@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:christoph@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:jake@clickhouse.com`;
GRANT sql_console_pm_role to `sql-console-role:zach@clickhouse.com`;
```

<CommonUserRolesContent />
