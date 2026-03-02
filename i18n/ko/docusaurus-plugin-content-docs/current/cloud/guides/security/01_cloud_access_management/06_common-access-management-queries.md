---
sidebar_label: '일반적인 액세스 관리 쿼리'
title: '일반적인 액세스 관리 쿼리'
slug: /cloud/security/common-access-management-queries
description: '이 문서에서는 SQL 사용자와 역할을 정의하는 기본 개념과 이러한 권한을 데이터베이스, 테이블, 행, 컬럼에 부여하고 적용하는 방법을 다룹니다.'
keywords: ['ClickHouse Cloud', 'access management']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# 일반적인 액세스 관리 쿼리 \{#common-access-management-queries\}

:::tip 자가 관리형
자가 관리형 ClickHouse를 사용하는 경우 [SQL users and roles](/guides/sre/user-management/index.md)를 참조하십시오.
:::

이 문서에서는 SQL 사용자와 역할을 정의하고, 해당 권한을 데이터베이스, 테이블, 행, 컬럼에 적용하는 기본 사항을 다룹니다.

## Admin 사용자 \{#admin-user\}

ClickHouse Cloud 서비스에는 서비스가 생성될 때 함께 생성되는 `default`라는 Admin 사용자가 있습니다. 비밀번호는 서비스 생성 시 제공되며, **Admin** 역할을 가진 ClickHouse Cloud 사용자가 재설정할 수 있습니다.

ClickHouse Cloud 서비스에 추가 SQL 사용자를 생성하면 각 사용자에게 SQL 사용자 이름과 비밀번호가 필요합니다. 이들에게 관리자 수준 권한을 부여하려면 새 사용자에게 `default_role` 역할을 할당하십시오. 예를 들어 `clickhouse_admin` 사용자를 추가하는 경우는 다음과 같습니다:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
SQL Console에서 실행하는 SQL 문은 `default` 사용자로 실행되지 않습니다. 대신, `sql-console:${cloud_login_email}`라는 이름의 사용자로 실행되며, 여기서 `cloud_login_email`은 현재 쿼리를 실행 중인 사용자의 이메일입니다.

이와 같이 자동으로 생성되는 SQL Console 사용자는 `default` 역할을 가집니다.
:::


## 비밀번호 없는 인증 \{#passwordless-authentication\}

SQL 콘솔에는 두 가지 역할이 있습니다. `default_role`과 동일한 권한을 가진 `sql_console_admin`과 읽기 전용 권한을 가진 `sql_console_read_only`입니다. 

관리자 사용자는 기본적으로 `sql_console_admin` 역할이 할당되므로 별도 변경 사항은 없습니다. 그러나 `sql_console_read_only` 역할을 사용하면 비관리자 사용자에게도 어떤 인스턴스에 대해서든 읽기 전용 또는 전체 접근 권한을 부여할 수 있습니다. 이 접근 권한은 관리자가 구성해야 합니다. 인스턴스별 요구 사항에 더 잘 맞도록 `GRANT` 또는 `REVOKE` 명령을 사용해 역할을 조정할 수 있으며, 이러한 역할에 대해 수행한 모든 변경 사항은 그대로 유지됩니다.

### 세분화된 액세스 제어 \{#granular-access-control\}

이 액세스 제어 기능은 사용자 단위로 세밀하게 수동 구성할 수도 있습니다. 새 `sql_console_*` 역할을 사용자에게 할당하기 전에, 네임스페이스 `sql-console-role:<email>`과(와) 일치하는 SQL 콘솔 사용자별 데이터베이스 역할을 먼저 생성해야 합니다. 예를 들면 다음과 같습니다.

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

일치하는 역할이 확인되면, 기본 제공 역할 대신 해당 역할이 사용자에게 부여됩니다. 이를 통해 `sql_console_sa_role`, `sql_console_pm_role`과 같은 역할을 생성하고 특정 사용자에게 부여하는 등, 보다 복잡한 액세스 제어 구성을 할 수 있습니다. 예를 들면 다음과 같습니다:

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
