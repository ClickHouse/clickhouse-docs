---
sidebar_label: 'Общие запросы управления доступом'
title: 'Общие запросы управления доступом'
slug: /cloud/security/common-access-management-queries
description: 'В этой статье представлены основы определения SQL пользователей и ролей, а также применения этих привилегий и разрешений к базам данных, таблицам, строкам и колонкам.'
---

import CommonUserRolesContent from '@site/i18n/docusaurus-plugin-content-docs/ru/current/_snippets/_users-and-roles-common.md';


# Общие запросы управления доступом

:::tip Самоуправляемый
Если вы работаете с самоуправляемым ClickHouse, пожалуйста, смотрите [SQL пользователи и роли](/guides/sre/user-management/index.md).
:::

В этой статье представлены основы определения SQL пользователей и ролей, а также применения этих привилегий и разрешений к базам данных, таблицам, строкам и колонкам.

## Администраторский пользователь {#admin-user}

Сервисы ClickHouse Cloud имеют администратора, `default`, который создается при создании сервиса. Пароль предоставляется при создании сервиса и может быть сброшен пользователями ClickHouse Cloud, имеющими роль **Admin**.

Когда вы добавляете дополнительных SQL пользователей для вашего сервиса ClickHouse Cloud, им потребуется SQL имя пользователя и пароль. Если вы хотите, чтобы у них были привилегии на уровне администратора, назначьте новым пользователям роль `default_role`. Например, добавление пользователя `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
При использовании SQL Консоли ваши SQL запросы не будут выполняться от имени пользователя `default`. Вместо этого запросы будут выполняться от имени пользователя `sql-console:${cloud_login_email}`, где `cloud_login_email` — это электронная почта пользователя, который в данный момент выполняет запрос.

Эти автоматически сгенерированные пользователи SQL Консоли имеют роль `default`.
:::

## Аутентификация без пароля {#passwordless-authentication}

Существует две роли, доступные для SQL консоли: `sql_console_admin` с аналогичными правами, что и `default_role`, и `sql_console_read_only` с правами только для чтения.

Администраторы по умолчанию получают роль `sql_console_admin`, поэтому для них ничего не меняется. Однако роль `sql_console_read_only` позволяет не администраторам иметь права только на чтение или полный доступ к любому экземпляру. Администратор должен настроить этот доступ. Роли можно регулировать с помощью команд `GRANT` или `REVOKE` для более точного соответствия конкретным требованиям экземпляра, и любые изменения, внесенные в эти роли, будут сохранены.

### Гранулярный контроль доступа {#granular-access-control}

Эта функция контроля доступа также может быть настроена вручную для гранулярности на уровне пользователей. Перед назначением новых ролей `sql_console_*` пользователям, необходимо создать ролевые базы данных, специфичные для пользователей SQL консоли, соответствующие пространству имен `sql-console-role:<email>`. Например:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <некоторые привилегии> TO sql-console-role:<email>;
```

Когда совпадающая роль обнаруживается, она будет назначена пользователю вместо стандартных ролей. Это вводит более сложные конфигурации контроля доступа, такие как создание ролей `sql_console_sa_role` и `sql_console_pm_role`, и их назначение конкретным пользователям. Например:

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
