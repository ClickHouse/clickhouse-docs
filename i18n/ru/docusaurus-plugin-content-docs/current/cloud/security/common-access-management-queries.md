---
sidebar_label: 'Запросы управления доступом'
title: 'Запросы управления доступом'
slug: /cloud/security/common-access-management-queries
description: 'В этой статье рассмотрены основы определения SQL пользователей и ролей, а также применения этих привилегий и разрешений к базам данных, таблицам, строкам и колонкам.'
---

import CommonUserRolesContent from '@site/docs/_snippets/_users-and-roles-common.md';


# Запросы управления доступом

:::tip Самоуправляемый
Если вы работаете с самоуправляемым ClickHouse, пожалуйста, посмотрите [SQL пользователи и роли](/guides/sre/user-management/index.md).
:::

В этой статье рассмотрены основы определения SQL пользователей и ролей, а также применения этих привилегий и разрешений к базам данных, таблицам, строкам и колонкам.

## Администраторский пользователь {#admin-user}

Службы ClickHouse Cloud имеют администратора, `default`, который создается при создании службы. Пароль предоставляется при создании службы и может быть сброшен пользователями ClickHouse Cloud, имеющими роль **Admin**.

Когда вы добавляете дополнительных SQL пользователей для вашей службы ClickHouse Cloud, им потребуется SQL имя пользователя и пароль. Если вы хотите, чтобы у них были привилегии уровня администратора, назначьте новым пользователям роль `default_role`. Например, добавление пользователя `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
При использовании SQL Консолей ваши SQL инструкции не будут выполняться от имени пользователя `default`. Вместо этого инструкции будут выполняться от имени пользователя `sql-console:${cloud_login_email}`, где `cloud_login_email` — это электронная почта пользователя, который в данный момент выполняет запрос.

Эти автоматически сгенерированные пользователи SQL Консолей имеют роль `default`.
:::

## Аутентификация без пароля {#passwordless-authentication}

Для SQL консоли доступны две роли: `sql_console_admin` с идентичными правами к `default_role` и `sql_console_read_only` с правами только для чтения. 

Администраторским пользователям по умолчанию назначается роль `sql_console_admin`, поэтому для них ничего не меняется. Однако роль `sql_console_read_only` позволяет неадминистраторским пользователям получать доступ только для чтения или полный доступ к любому экземпляру. Администратор должен настроить этот доступ. Роли можно корректировать с помощью команд `GRANT` или `REVOKE` для более точного соответствия требованиям конкретного экземпляра, и любые изменения, внесенные в эти роли, будут сохранены.

### Гранулярный контроль доступа {#granular-access-control}

Эта функциональность контроля доступа также может быть настроена вручную для гранулярности на уровне пользователя. Прежде чем назначить новые роли `sql_console_*` пользователям, должны быть созданы специфические для базы данных роли пользователей SQL консоли, соответствующие пространству имен `sql-console-role:<email>`. Например: 

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <некоторые привилегии> TO sql-console-role:<email>;
```

Когда будет обнаружена соответствующая роль, она будет назначена пользователю вместо стандартных ролей. Это вводит более сложные конфигурации контроля доступа, такие как создание ролей, таких как `sql_console_sa_role` и `sql_console_pm_role`, и назначение их конкретным пользователям. Например:

```sql
CREATE ROLE OR REPLACE sql_console_sa_role;
GRANT <любой уровень доступа> TO sql_console_sa_role;
CREATE ROLE OR REPLACE sql_console_pm_role;
GRANT <любой уровень доступа> TO sql_console_pm_role;
CREATE ROLE OR REPLACE `sql-console-role:christoph@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:jake@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:zach@clickhouse.com`;
GRANT sql_console_sa_role TO `sql-console-role:christoph@clickhouse.com`;
GRANT sql_console_sa_role TO `sql-console-role:jake@clickhouse.com`;
GRANT sql_console_pm_role TO `sql-console-role:zach@clickhouse.com`;
```

<CommonUserRolesContent />
