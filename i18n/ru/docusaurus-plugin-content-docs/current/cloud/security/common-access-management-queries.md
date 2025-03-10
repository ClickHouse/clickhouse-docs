---
sidebar_label: 'Запросы управления доступом'
title: 'Запросы управления доступом'
slug: '/cloud/security/common-access-management-queries'
---

import CommonUserRolesContent from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';

# Запросы управления доступом

:::tip Самостоятельное управление
Если вы работаете с самоуправляемым ClickHouse, пожалуйста, смотрите [Пользователи SQL и роли](/guides/sre/user-management/index.md).
:::

В этой статье рассматриваются основы определения пользователей SQL и ролей, а также применения этих привилегий и разрешений к базам данных, таблицам, строкам и колонкам.

## Администратор {#admin-user}

Сервисы ClickHouse Cloud имеют пользователя-администратора, `default`, который создается при создании сервиса. Пароль предоставляется при создании сервиса, и его могут сбросить пользователи ClickHouse Cloud, у которых есть роль **Admin**.

Когда вы добавляете дополнительных пользователей SQL для вашего сервиса ClickHouse Cloud, им потребуется имя пользователя SQL и пароль. Если вы хотите, чтобы у них были привилегии уровня администратора, назначьте новым пользователям роль `default_role`. Например, добавление пользователя `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
При использовании SQL Консоли ваши SQL-запросы не будут выполнены от имени пользователя `default`. Вместо этого запросы будут выполнены от имени пользователя `sql-console:${cloud_login_email}`, где `cloud_login_email` — это электронная почта пользователя, который в данный момент выполняет запрос.

Эти автоматически созданные пользователи SQL Консоли имеют роль `default`.
:::

## Аутентификация без пароля {#passwordless-authentication}

Существует две роли, доступные для SQL консоли: `sql_console_admin` с идентичными разрешениями к `default_role` и `sql_console_read_only` с разрешениями только для чтения.

Пользователям-администраторам по умолчанию назначается роль `sql_console_admin`, так что для них ничего не меняется. Тем не менее, роль `sql_console_read_only` позволяет не-администраторам получить доступ только для чтения или полный доступ к любой инстанции. Администратор должен настроить этот доступ. Роли могут быть изменены с использованием команд `GRANT` или `REVOKE` для лучшего соответствия требованиям конкретной инстанции, и любые изменения, внесенные в эти роли, будут сохранены.

### Управление доступом на более детальном уровне {#granular-access-control}

Эта функциональность управления доступом также может быть настроена вручную для большей детальности на уровне пользователя. Перед назначением новых ролей `sql_console_*` пользователям, специфические для пользователей роли баз данных SQL консоли, соответствующие пространству имен `sql-console-role:<email>`, должны быть созданы. Например:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <некоторые права> TO sql-console-role:<email>;
```

Когда обнаруживается соответствующая роль, она будет назначена пользователю вместо стандартных ролей. Это вводит более сложные конфигурации управления доступом, такие как создание ролей, таких как `sql_console_sa_role` и `sql_console_pm_role`, и их назначение конкретным пользователям. Например:

```sql
CREATE ROLE OR REPLACE sql_console_sa_role;
GRANT <какой-либо уровень доступа> TO sql_console_sa_role;
CREATE ROLE OR REPLACE sql_console_pm_role;
GRANT <какой-либо уровень доступа> TO sql_console_pm_role;
CREATE ROLE OR REPLACE `sql-console-role:christoph@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:jake@clickhouse.com`;
CREATE ROLE OR REPLACE `sql-console-role:zach@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:christoph@clickhouse.com`;
GRANT sql_console_sa_role to `sql-console-role:jake@clickhouse.com`;
GRANT sql_console_pm_role to `sql-console-role:zach@clickhouse.com`;
```

<CommonUserRolesContent />
