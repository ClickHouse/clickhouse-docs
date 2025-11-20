---
sidebar_label: 'Типовые запросы для управления доступом'
title: 'Типовые запросы для управления доступом'
slug: /cloud/security/common-access-management-queries
description: 'В этой статье рассматриваются основы определения SQL‑пользователей и ролей и применения соответствующих привилегий и разрешений к базам данных, таблицам, строкам и столбцам.'
keywords: ['ClickHouse Cloud', 'access management']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/docs/_snippets/_users-and-roles-common.md';


# Типовые запросы для управления доступом

:::tip Самостоятельное управление
Если вы используете самостоятельно управляемый ClickHouse, см. раздел [SQL users and roles](/guides/sre/user-management/index.md).
:::

В этой статье рассматриваются основы определения SQL-пользователей и ролей, а также применения соответствующих привилегий и разрешений к базам данных, таблицам, строкам и столбцам.



## Пользователь-администратор {#admin-user}

Сервисы ClickHouse Cloud имеют пользователя-администратора `default`, который создаётся при создании сервиса. Пароль задаётся при создании сервиса и может быть сброшен пользователями ClickHouse Cloud с ролью **Admin**.

При добавлении дополнительных SQL-пользователей для вашего сервиса ClickHouse Cloud им потребуется имя пользователя SQL и пароль. Если вы хотите предоставить им привилегии уровня администратора, назначьте новому пользователю (пользователям) роль `default_role`. Например, добавление пользователя `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
При использовании SQL Console ваши SQL-запросы не будут выполняться от имени пользователя `default`. Вместо этого запросы будут выполняться от имени пользователя с именем `sql-console:${cloud_login_email}`, где `cloud_login_email` — это адрес электронной почты пользователя, выполняющего запрос.

Эти автоматически созданные пользователи SQL Console имеют роль `default`.
:::


## Аутентификация без пароля {#passwordless-authentication}

Для SQL-консоли доступны две роли: `sql_console_admin` с правами, идентичными `default_role`, и `sql_console_read_only` с правами только на чтение.

Пользователям-администраторам по умолчанию назначается роль `sql_console_admin`, поэтому для них ничего не меняется. Однако роль `sql_console_read_only` позволяет предоставлять пользователям без прав администратора доступ только на чтение или полный доступ к любому экземпляру. Администратор должен настроить этот доступ. Роли можно настроить с помощью команд `GRANT` или `REVOKE` для лучшего соответствия требованиям конкретного экземпляра, при этом любые изменения этих ролей будут сохранены.

### Детализированное управление доступом {#granular-access-control}

Эту функциональность управления доступом также можно настроить вручную для детализации на уровне пользователей. Перед назначением новых ролей `sql_console_*` пользователям необходимо создать пользовательские роли базы данных SQL-консоли, соответствующие пространству имён `sql-console-role:<email>`. Например:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

При обнаружении соответствующей роли она будет назначена пользователю вместо стандартных ролей. Это позволяет создавать более сложные конфигурации управления доступом, например, создание ролей `sql_console_sa_role` и `sql_console_pm_role` и предоставление их конкретным пользователям. Например:

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
