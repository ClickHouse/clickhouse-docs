---
sidebar_label: 'Распространенные запросы для управления доступом'
title: 'Распространенные запросы для управления доступом'
slug: /cloud/security/common-access-management-queries
description: 'В этой статье описаны основы создания SQL-пользователей и ролей, а также назначения их привилегий и прав базам данных, таблицам, строкам и столбцам.'
keywords: ['ClickHouse Cloud', 'управление доступом']
doc_type: 'guide'
---

import CommonUserRolesContent from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_users-and-roles-common.md';

# Распространённые вопросы по управлению доступом {#common-access-management-queries}

:::tip Самостоятельное развертывание
Если вы работаете с самостоятельно управляемым (self-managed) ClickHouse, см. раздел [SQL-пользователи и роли](/guides/sre/user-management/index.md).
:::

В этой статье рассматриваются основы создания SQL-пользователей и ролей и назначения привилегий и прав доступа к базам данных, таблицам, строкам и столбцам.

## Пользователь-администратор {#admin-user}

В сервисах ClickHouse Cloud есть пользователь-администратор `default`, который создаётся при создании сервиса. Пароль задаётся при создании сервиса, и его могут сбросить пользователи ClickHouse Cloud с ролью **Admin**.

Когда вы добавляете дополнительных SQL‑пользователей для своего сервиса ClickHouse Cloud, им понадобятся имя SQL‑пользователя и пароль. Если вы хотите предоставить им привилегии уровня администратора, назначьте новому пользователю (пользователям) роль `default_role`. Например, добавление пользователя `clickhouse_admin`:

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'P!@ssword42!';
```

```sql
GRANT default_role TO clickhouse_admin;
```

:::note
При использовании SQL Console ваши SQL-запросы не будут выполняться от имени пользователя `default`. Вместо этого они будут выполняться от имени пользователя с именем `sql-console:${cloud_login_email}`, где `cloud_login_email` — это адрес электронной почты пользователя, который в данный момент выполняет запрос.

Эти автоматически создаваемые пользователи SQL Console имеют роль `default`.
:::

## Аутентификация без пароля {#passwordless-authentication}

Для SQL-консоли доступны две роли: `sql_console_admin` с правами, идентичными `default_role`, и `sql_console_read_only` с правами только на чтение.

Пользователи-администраторы по умолчанию получают роль `sql_console_admin`, поэтому для них ничего не меняется. Однако роль `sql_console_read_only` позволяет предоставлять пользователям без прав администратора доступ только на чтение или полный доступ к любому экземпляру. Настроить этот доступ должен администратор. Роли можно изменять с помощью команд `GRANT` или `REVOKE`, чтобы лучше соответствовать требованиям конкретного экземпляра; все изменения этих ролей будут сохраняться.

### Тонкий контроль доступа {#granular-access-control}

Эту функциональность контроля доступа также можно настроить вручную с точностью до отдельных пользователей. Перед назначением пользователям новых ролей `sql_console_*` необходимо создать роли баз данных для пользователей SQL-консоли, соответствующие пространству имен `sql-console-role:<email>`. Например:

```sql
CREATE ROLE OR REPLACE sql-console-role:<email>;
GRANT <some grants> TO sql-console-role:<email>;
```

Когда обнаруживается подходящая роль, она назначается пользователю вместо базовых ролей. Это позволяет настраивать более сложное управление доступом, например создавать роли `sql_console_sa_role` и `sql_console_pm_role` и назначать их конкретным пользователям. Например:

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
