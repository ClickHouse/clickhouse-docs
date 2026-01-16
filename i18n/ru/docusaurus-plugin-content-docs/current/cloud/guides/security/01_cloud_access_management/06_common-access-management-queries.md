---
sidebar_label: 'Типовые запросы для управления доступом'
title: 'Типовые запросы для управления доступом'
slug: /cloud/security/common-access-management-queries
description: 'В этой статье показаны основы определения SQL-пользователей и ролей и применения соответствующих привилегий и разрешений к базам данных, таблицам, строкам и столбцам.'
keywords: ['ClickHouse Cloud', 'access management']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# Типовые запросы по управлению доступом \{#common-access-management-queries\}

:::tip Самоуправляемый
Если вы работаете с самоуправляемым ClickHouse, см. раздел [SQL users and roles](/guides/sre/user-management/index.md).
:::

В этой статье рассматриваются основы определения SQL-пользователей и ролей, а также применения соответствующих привилегий и прав доступа к базам данных, таблицам, строкам и столбцам.

## Учетная запись администратора \{#admin-user\}

Сервисы ClickHouse Cloud имеют пользователя‑администратора `default`, который создаётся вместе с сервисом. Пароль задаётся при создании сервиса, и его могут сбросить пользователи ClickHouse Cloud с ролью **Admin**.

Когда вы добавляете дополнительных SQL‑пользователей для своего сервиса ClickHouse Cloud, им потребуются имя SQL‑пользователя и пароль. Если вы хотите предоставить им привилегии уровня администратора, назначьте новому пользователю (пользователям) роль `default_role`. Например, добавление пользователя `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
При использовании SQL Console ваши SQL-команды не будут выполняться от имени пользователя `default`. Вместо этого команды будут выполняться от имени пользователя `sql-console:${cloud_login_email}`, где `cloud_login_email` — это адрес электронной почты пользователя, который в данный момент выполняет запрос.

Эти автоматически создаваемые пользователи SQL Console имеют роль `default`.
:::


## Аутентификация без пароля \\{#passwordless-authentication\\}

Для SQL-консоли доступны две роли: `sql_console_admin` с такими же правами, как у `default_role`, и `sql_console_read_only` с правами только на чтение. 

Пользователям‑администраторам по умолчанию назначается роль `sql_console_admin`, поэтому для них ничего не меняется. Однако роль `sql_console_read_only` позволяет предоставлять пользователям без прав администратора доступ только на чтение или полный доступ к любому экземпляру. Настроить этот доступ должен администратор. Роли можно изменять с помощью команд `GRANT` или `REVOKE`, чтобы лучше соответствовать требованиям конкретного экземпляра, и все изменения этих ролей будут сохраняться.

### Детализированное управление доступом \{#granular-access-control\}

Эту функцию управления доступом можно также настроить вручную на уровне отдельных пользователей. Прежде чем назначать пользователям новые роли `sql_console_*`, необходимо создать пользовательские роли базы данных для SQL console, соответствующие пространству имен `sql-console-role:&lt;email&gt;`. Например:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

Когда обнаруживается соответствующая роль, она назначается пользователю вместо шаблонных ролей. Это позволяет реализовать более сложные конфигурации управления доступом, такие как создание ролей `sql_console_sa_role` и `sql_console_pm_role` и назначение их конкретным пользователям. Например:

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
