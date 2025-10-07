---
'sidebar_label': 'Общие Запросы Управления Доступом'
'title': 'Общие Запросы Управления Доступом'
'slug': '/cloud/security/common-access-management-queries'
'description': 'Эта статья описывает основы определения SQL пользователей и ролей,
  а также применение этих привилегий и разрешений к DATABASE, TABLE, строкам и колонкам.'
'doc_type': 'guide'
---

import CommonUserRolesContent from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';


# Общие запросы управления доступом

:::tip Самоуправляемый
Если вы работаете с самоуправляемым ClickHouse, пожалуйста, посмотрите [SQL пользователи и роли](/guides/sre/user-management/index.md).
:::

В этой статье представлены основы определения SQL пользователей и ролей, а также применения этих привилегий и разрешений к базам данных, таблицам, строкам и столбцам.

## Администратор {#admin-user}

Сервисы ClickHouse Cloud имеют администратора, `default`, который создается при создании сервиса. Пароль предоставляется при создании сервиса и может быть сброшен пользователями ClickHouse Cloud, у которых есть роль **Admin**.

Когда вы добавляете дополнительных SQL пользователей для вашего сервиса ClickHouse Cloud, им понадобится SQL имя пользователя и пароль. Если вы хотите, чтобы у них были привилегии на уровне администратора, назначьте новым пользователям роль `default_role`. Например, добавление пользователя `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
При использовании SQL консоли ваши SQL запросы не будут выполняться от имени пользователя `default`. Вместо этого запросы будут выполняться от лица пользователя с именем `sql-console:${cloud_login_email}`, где `cloud_login_email` — это электронная почта пользователя, который в данный момент выполняет запрос.

Эти автоматически сгенерированные пользователи SQL консоли имеют роль `default`.
:::

## Аутентификация без пароля {#passwordless-authentication}

Доступны две роли для SQL консоли: `sql_console_admin` с аналогичными разрешениями к `default_role` и `sql_console_read_only` с правами только на чтение.

Администраторские пользователи по умолчанию получают роль `sql_console_admin`, поэтому для них ничего не меняется. Однако роль `sql_console_read_only` позволяет неадминистраторским пользователям иметь доступ только для чтения или полный доступ к любому экземпляру. Администратор должен настроить этот доступ. Роли могут быть настроены с использованием команд `GRANT` или `REVOKE`, чтобы лучше соответствовать конкретным требованиям экземпляра, и любые изменения, внесенные в эти роли, будут сохранены.

### Гранулярный контроль доступа {#granular-access-control}

Эта функциональность контроля доступа также может быть настроена вручную для гранулярного контроля на уровне пользователей. Прежде чем назначать новые роли `sql_console_*` пользователям, должны быть созданы пользовательские роли баз данных, соответствующие пространству имен `sql-console-role:<email>`. Например:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

Когда будет обнаружена соответствующая роль, она будет назначена пользователю вместо стандартных ролей. Это вводит более сложные конфигурации контроля доступа, такие как создание ролей вроде `sql_console_sa_role` и `sql_console_pm_role`, и назначение их конкретным пользователям. Например:

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
