---
sidebar_label: 'Общие запросы управления доступом'
title: 'Общие запросы управления доступом'
slug: /cloud/security/common-access-management-queries
description: 'В этой статье объясняется основа определения SQL пользователей и ролей, а также применения этих привилегий и прав к базам данных, таблицам, строкам и столбцам.'
---

import CommonUserRolesContent from '@site/docs/_snippets/_users-and-roles-common.md';


# Общие запросы управления доступом

:::tip Самоуправляемый
Если вы работаете с самоуправляемым ClickHouse, обратитесь к [SQL пользователям и ролям](/guides/sre/user-management/index.md).
:::

В этой статье объясняется основа определения SQL пользователей и ролей, а также применения этих привилегий и прав к базам данных, таблицам, строкам и столбцам.

## Администраторский пользователь {#admin-user}

Сервисы ClickHouse Cloud имеют администратора, пользователя `default`, который создается при создании сервиса. Пароль предоставляется при создании сервиса, и его можно сбросить пользователями ClickHouse Cloud, у которых есть роль **Admin**.

Когда вы добавляете дополнительные SQL пользователей для вашего сервиса ClickHouse Cloud, они будут нуждаться в SQL имени пользователя и пароле. Если вы хотите, чтобы у них были административные привилегии, назначьте новым пользователям роль `default_role`. Например, добавление пользователя `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
При использовании SQL консоли ваши SQL команды не будут выполняться от имени пользователя `default`. Вместо этого команды будут выполняться от имени пользователя с именем `sql-console:${cloud_login_email}`, где `cloud_login_email` - это адрес электронной почты пользователя, который в настоящее время выполняет запрос.

Эти автоматически сгенерированные пользователи SQL консоли имеют роль `default`.
:::

## Аутентификация без пароля {#passwordless-authentication}

Для SQL консоли доступны две роли: `sql_console_admin` с идентичными правами как у `default_role` и `sql_console_read_only` с правами только для чтения.

Администраторы по умолчанию получают роль `sql_console_admin`, так что для них ничего не меняется. Однако роль `sql_console_read_only` позволяет неадминистративным пользователям получить права только для чтения или полный доступ к любой инстанции. Это должно быть настроено администратором. Роли могут быть настроены с помощью команд `GRANT` или `REVOKE`, чтобы лучше соответствовать специфическим требованиям инстанса, и любые изменения, внесенные в эти роли, будут сохранены.

### Детализированный контроль доступа {#granular-access-control}

Эта функциональность контроля доступа также может быть настроена вручную для пользовательского уровня детализации. Перед тем как назначить новые роли `sql_console_*` пользователям, специфические для базы данных роли пользователей SQL консоли, соответствующие пространству имен `sql-console-role:<email>`, должны быть созданы. Например:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <некоторые права> TO sql-console-role:<email>;
```

Когда будет обнаружена соответствующая роль, она будет назначена пользователю вместо стандартных ролей. Это вводит более сложные конфигурации контроля доступа, такие как создание ролей, таких как `sql_console_sa_role` и `sql_console_pm_role`, и предоставление их конкретным пользователям. Например:

```sql
CREATE ROLE OR REPLACE sql_console_sa_role;
GRANT <любой уровень доступа> TO sql_console_sa_role;
CREATE ROLE OR REPLACE sql_console_pm_role;
GRANT <любой уровень доступа> TO sql_console_pm_role;
CREATE ROLE OR REPLACE `sql-console-role:christoph@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:jake@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:zach@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:christoph@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:jake@clickhouse.com`;
GRANT sql_console_pm_role to `sql-console-role:zach@clickhouse.com`;
```

<CommonUserRolesContent />
