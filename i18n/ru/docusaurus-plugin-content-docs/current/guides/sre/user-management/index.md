---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: 'Пользователи и роли'
title: 'Контроль доступа и управление учетными записями'
keywords: ['ClickHouse Cloud', 'Контроль доступа', 'Управление пользователями', 'RBAC', 'Безопасность']
description: 'Описывает контроль доступа и управление учетными записями в ClickHouse Cloud'
doc_type: 'guide'
---



# Создание пользователей и ролей в ClickHouse {#creating-users-and-roles-in-clickhouse}

ClickHouse поддерживает управление доступом на основе подхода [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control).

Объекты управления доступом в ClickHouse:
- [Учетная запись пользователя](#user-account-management)
- [Role](#role-management)
- [Row Policy](#row-policy-management)
- [Settings Profile](#settings-profiles-management)
- [Quota](#quotas-management)

Вы можете настраивать объекты управления доступом с помощью:

- SQL-управляемого рабочего процесса.

    Для этого необходимо [включить](#enabling-access-control) эту функциональность.

- [Файлов конфигурации](/operations/configuration-files.md) сервера `users.xml` и `config.xml`.

Мы рекомендуем использовать SQL-управляемый рабочий процесс. Оба метода конфигурации работают одновременно, поэтому, если вы используете файлы конфигурации сервера для управления учетными записями и правами доступа, вы можете без проблем перейти на SQL-управляемый рабочий процесс.

:::note
Нельзя управлять одной и той же сущностью доступа одновременно обоими методами конфигурации.
:::

:::note
Если вы хотите управлять пользователями консоли ClickHouse Cloud, обратитесь к этой [странице](/cloud/security/manage-cloud-users)
:::

Чтобы посмотреть всех пользователей, роли, профили и т. д., а также все их права, используйте команду [`SHOW ACCESS`](/sql-reference/statements/show#show-access).



## Обзор {#access-control-usage}

По умолчанию сервер ClickHouse предоставляет учетную запись пользователя `default`, для которой не допускается использование управления доступом и учетными записями на основе SQL, но которая обладает всеми правами и разрешениями. Учетная запись пользователя `default` используется во всех случаях, когда имя пользователя не определено, например, при подключении клиента или в распределённых запросах. При распределённой обработке запросов используется учетная запись пользователя `default`, если в конфигурации сервера или кластера не указаны свойства [user and password](/engines/table-engines/special/distributed.md).

Если вы только начинаете использовать ClickHouse, рассмотрите следующий сценарий:

1.  [Включите](#enabling-access-control) управление доступом и учетными записями на основе SQL для пользователя `default`.
2.  Войдите под учетной записью пользователя `default` и создайте всех необходимых пользователей. Не забудьте создать учетную запись администратора (`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`).
3.  [Ограничьте права](/operations/settings/permissions-for-queries) для пользователя `default` и отключите для него управление доступом и учетными записями на основе SQL.

### Свойства текущего решения {#access-control-properties}

- Вы можете выдавать права для баз данных и таблиц, даже если они ещё не существуют.
- Если таблица удалена, все привилегии, которые соответствуют этой таблице, не отзываются. Это означает, что даже если позже вы создадите новую таблицу с тем же именем, все привилегии останутся действительными. Чтобы отозвать привилегии, соответствующие удалённой таблице, необходимо выполнить, например, запрос `REVOKE ALL PRIVILEGES ON db.table FROM ALL`.
- Для привилегий не заданы параметры времени жизни.

### Учетная запись пользователя {#user-account-management}

Учетная запись пользователя — это сущность доступа, которая позволяет авторизовать кого-либо в ClickHouse. Учетная запись пользователя содержит:

- Идентификационную информацию.
- [Привилегии](/sql-reference/statements/grant.md#privileges), определяющие набор запросов, которые пользователь может выполнять.
- Хосты, с которых разрешено подключаться к серверу ClickHouse.
- Назначенные и используемые по умолчанию роли.
- Настройки с их ограничениями, применяемые по умолчанию при входе пользователя.
- Назначенные профили настроек.

Привилегии могут быть выданы учетной записи пользователя с помощью запроса [GRANT](/sql-reference/statements/grant.md) или путём назначения [ролей](#role-management). Для отзыва привилегий у пользователя ClickHouse предоставляет запрос [REVOKE](/sql-reference/statements/revoke.md). Чтобы вывести список привилегий для пользователя, используйте команду [SHOW GRANTS](/sql-reference/statements/show#show-grants).

Запросы управления:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### Применение настроек {#access-control-settings-applying}

Настройки могут быть сконфигурированы по-разному: для учетной записи пользователя, в её назначенных ролях и в профилях настроек. При входе пользователя, если одна и та же настройка задана для разных сущностей доступа, значение и ограничения этой настройки применяются следующим образом (от более высокого приоритета к более низкому):

1.  Настройки учетной записи пользователя.
2.  Настройки для ролей по умолчанию учетной записи пользователя. Если настройка задана в нескольких ролях, порядок применения настройки не определён.
3.  Настройки из профилей настроек, назначенных пользователю или его ролям по умолчанию. Если настройка задана в нескольких профилях, порядок применения настройки не определён.
4.  Настройки, применяемые ко всему серверу по умолчанию или из [default profile](/operations/server-configuration-parameters/settings#default_profile).

### Роль {#role-management}

Роль — это контейнер для сущностей доступа, который может быть назначен учетной записи пользователя.

Роль содержит:

- [Привилегии](/sql-reference/statements/grant#privileges)
- Настройки и ограничения
- Список назначенных ролей

Запросы управления:

- [CREATE ROLE](/sql-reference/statements/create/role)
- [ALTER ROLE](/sql-reference/statements/alter/role)
- [DROP ROLE](/sql-reference/statements/drop#drop-role)
- [SET ROLE](/sql-reference/statements/set-role)
- [SET DEFAULT ROLE](/sql-reference/statements/set-role)
- [SHOW CREATE ROLE](/sql-reference/statements/show#show-create-role)
- [SHOW ROLES](/sql-reference/statements/show#show-roles)

Привилегии могут быть выданы роли с помощью запроса [GRANT](/sql-reference/statements/grant.md). Для отзыва привилегий у роли, ClickHouse предоставляет запрос [REVOKE](/sql-reference/statements/revoke.md).

#### Политика по строкам {#row-policy-management}



Row policy — это фильтр, который определяет, какие из строк доступны пользователю или роли. Row policy содержит фильтры для одной конкретной таблицы, а также список ролей и/или пользователей, к которым должна применяться эта row policy.

:::note
Row policies применимы только для пользователей с доступом только на чтение (readonly). Если пользователи могут изменять таблицу или копировать партиции между таблицами, это сводит на нет ограничения row policies.
:::

Управляющие запросы:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### Settings profile {#settings-profiles-management}

Settings profile — это набор [настроек](/operations/settings/index.md). Settings profile содержит настройки и ограничения, а также список ролей и/или пользователей, к которым применяется этот профиль.

Управляющие запросы:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### Quota {#quotas-management}

Quota ограничивает использование ресурсов. См. [Quotas](/operations/quotas.md).

Quota содержит набор лимитов для различных интервалов времени, а также список ролей и/или пользователей, для которых действует эта quota.

Управляющие запросы:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### Enabling SQL-driven access control and account management {#enabling-access-control}

- Настройте каталог для хранения конфигураций.

    ClickHouse хранит конфигурации объектов контроля доступа в каталоге, указанном в параметре конфигурации сервера [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path).

- Включите управление доступом и учетными записями на основе SQL как минимум для одной учетной записи пользователя.

    По умолчанию управление доступом и учетными записями на основе SQL отключено для всех пользователей. Необходимо настроить как минимум одного пользователя в конфигурационном файле `users.xml` и установить значения настроек [`access_management`](/operations/settings/settings-users.md#access_management-user-setting), `named_collection_control`, `show_named_collections` и `show_named_collections_secrets` равными 1.



## Определение SQL-пользователей и ролей {#defining-sql-users-and-roles}

:::tip
Если вы работаете в ClickHouse Cloud, см. раздел [Cloud access management](/cloud/security/console-roles).
:::

В этой статье рассматриваются основы определения SQL-пользователей и ролей, а также применения соответствующих привилегий и разрешений к базам данных, таблицам, строкам и столбцам.

### Включение режима SQL-пользователей {#enabling-sql-user-mode}

1.  Включите режим SQL-пользователей в файле `users.xml` для пользователя `<default>`:
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    Пользователь `default` — единственный пользователь, который создается при новой установке, и по умолчанию это также учетная запись, используемая для межузлового взаимодействия.

    В продуктивной среде рекомендуется отключить этого пользователя после того, как межузловое взаимодействие будет настроено с использованием SQL-учетной записи администратора, а также будут заданы параметры межузлового взаимодействия с помощью `<secret>`, учетных данных кластера и/или учетных данных для межузловых HTTP- и транспортных протоколов, поскольку учетная запись `default` используется для межузлового взаимодействия.
    :::

2. Перезапустите узлы, чтобы применить изменения.

3. Запустите клиент ClickHouse:
    ```sql
    clickhouse-client --user default --password <password>
    ```
### Определение пользователей {#defining-users}

1. Создайте учетную запись SQL-администратора:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. Предоставьте новому пользователю полные административные права:
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```



## Изменение прав доступа {#alter-permissions}

Эта статья предназначена для того, чтобы помочь вам лучше понять, как определять права доступа и как они работают при использовании команд `ALTER` для привилегированных пользователей.

Команды `ALTER` разделены на несколько категорий, некоторые из которых являются иерархическими, а некоторые — нет и должны быть явно определены.

**Пример конфигурации БД, таблицы и пользователя**

1. Работая под учетной записью администратора, создайте тестового пользователя

```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. Создайте тестовую базу данных

```sql
CREATE DATABASE my_db;
```

3. Создайте примерную таблицу

```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. Создайте тестового пользователя-администратора для выдачи и отзыва привилегий

```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
Чтобы предоставить или отозвать привилегии, пользователь с правами администратора должен иметь привилегию `WITH GRANT OPTION`.
Например:

```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```

Чтобы выдать (`GRANT`) или отозвать (`REVOKE`) привилегии, пользователь должен предварительно сам обладать этими привилегиями.
:::

**Предоставление или отзыв привилегий**

Иерархия `ALTER`:

```response
├── ALTER (only for table and view)/
│   ├── ALTER TABLE/
│   │   ├── ALTER UPDATE
│   │   ├── ALTER DELETE
│   │   ├── ALTER COLUMN/
│   │   │   ├── ALTER ADD COLUMN
│   │   │   ├── ALTER DROP COLUMN
│   │   │   ├── ALTER MODIFY COLUMN
│   │   │   ├── ALTER COMMENT COLUMN
│   │   │   ├── ALTER CLEAR COLUMN
│   │   │   └── ALTER RENAME COLUMN
│   │   ├── ALTER INDEX/
│   │   │   ├── ALTER ORDER BY
│   │   │   ├── ALTER SAMPLE BY
│   │   │   ├── ALTER ADD INDEX
│   │   │   ├── ALTER DROP INDEX
│   │   │   ├── ALTER MATERIALIZE INDEX
│   │   │   └── ALTER CLEAR INDEX
│   │   ├── ALTER CONSTRAINT/
│   │   │   ├── ALTER ADD CONSTRAINT
│   │   │   └── ALTER DROP CONSTRAINT
│   │   ├── ALTER TTL/
│   │   │   └── ALTER MATERIALIZE TTL
│   │   ├── ALTER SETTINGS
│   │   ├── ALTER MOVE PARTITION
│   │   ├── ALTER FETCH PARTITION
│   │   └── ALTER FREEZE PARTITION
│   └── ALTER LIVE VIEW/
│       ├── ALTER LIVE VIEW REFRESH
│       └── ALTER LIVE VIEW MODIFY QUERY
├── ALTER DATABASE
├── ALTER USER
├── ALTER ROLE
├── ALTER QUOTA
├── ALTER [ROW] POLICY
└── ALTER [SETTINGS] PROFILE
```

1. Предоставление привилегий `ALTER` пользователю или роли

Использование команды `GRANT ALTER on *.* TO my_user` повлияет только на верхнеуровневые операции `ALTER TABLE` и `ALTER VIEW`, остальные команды `ALTER` должны предоставляться или отзыватьcя отдельно.

Например, предоставление базовой привилегии `ALTER`:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

Итоговый набор прав:

```sql
SHOW GRANTS FOR  my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 706befbc-525e-4ec1-a1a2-ba2508cc09e3

┌─GRANTS FOR my_user───────────────────────────────────────────┐
│ GRANT ALTER TABLE, ALTER VIEW ON my_db.my_table TO my_user   │
└──────────────────────────────────────────────────────────────┘
```

Это предоставит все привилегии из `ALTER TABLE` и `ALTER VIEW` из приведённого выше примера, однако не предоставит некоторые другие привилегии `ALTER`, такие как `ALTER ROW POLICY` (обратитесь к иерархии, и вы увидите, что `ALTER ROW POLICY` не является дочерней привилегией `ALTER TABLE` или `ALTER VIEW`). Такие привилегии должны быть явно выданы или отозваны.

Если требуется только подмножество привилегий `ALTER`, то каждую из них можно выдать отдельно; если у этой привилегии есть подпривилегии, то они также будут автоматически выданы.

Например:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

Права можно настроить следующим образом:

```sql
SHOW GRANTS FOR my_user;
```


```response
SHOW GRANTS FOR my_user

Query id: 47b3d03f-46ac-4385-91ec-41119010e4e2

┌─GRANTS FOR my_user────────────────────────────────┐
│ GRANT ALTER COLUMN ON default.my_table TO my_user │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

При этом также предоставляются следующие дополнительные привилегии:

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. Отзыв привилегий `ALTER` у пользователей и ролей

Оператор `REVOKE` работает аналогично оператору `GRANT`.

Если пользователю/роли была предоставлена подпривилегия, вы можете либо отозвать эту подпривилегию напрямую, либо отозвать привилегию более высокого уровня, от которой она наследуется.

Например, если пользователю была предоставлена привилегия `ALTER ADD COLUMN`

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 61fe0fdc-1442-4cd6-b2f3-e8f2a853c739

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 27791226-a18f-46c8-b2b4-a9e64baeb683

┌─GRANTS FOR my_user──────────────────────────────────┐
│ GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user │
└─────────────────────────────────────────────────────┘
```

Привилегию можно отозвать отдельно:

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

Или их можно отозвать на любом из вышестоящих уровней (отозвать все подпривилегии для COLUMN):

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user;
```

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user

Query id: b882ba1b-90fb-45b9-b10f-3cda251e2ccc

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: e7d341de-de65-490b-852c-fa8bb8991174

Ok.

0 rows in set. Elapsed: 0.003 sec.
```

**Дополнительно**

Привилегии должен предоставлять пользователь, который не только имеет `WITH GRANT OPTION`, но и обладает самими этими привилегиями.

1. Чтобы выдать пользователю-администратору привилегию и также позволить ему управлять набором привилегий
   Ниже приведён пример:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

Теперь пользователь может предоставлять или отзывать право `ALTER COLUMN` и все его подпривилегии.

**Тестирование**

1. Добавьте право `SELECT`

```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. Предоставьте пользователю привилегию на добавление столбца

```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. Войдите под пользователем с ограниченными правами

```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. Проверьте добавление столбца

```sql
ALTER TABLE my_db.my_table ADD COLUMN column2 String;
```

```response
ALTER TABLE my_db.my_table
    ADD COLUMN `column2` String

Query id: d5d6bfa1-b80c-4d9f-8dcd-d13e7bd401a5

Ok.

0 rows in set. Elapsed: 0.010 sec.
```

```sql
DESCRIBE my_db.my_table;
```

```response
DESCRIBE TABLE my_db.my_table

Query id: ab9cb2d0-5b1a-42e1-bc9c-c7ff351cb272
```


┌─name────┬─type───┬─default&#95;type─┬─default&#95;expression─┬─comment─┬─codec&#95;expression─┬─ttl&#95;expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

````

4. Test deleting a column
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
````

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: Not enough privileges. To execute this query it's necessary to have grant ALTER DROP COLUMN(column2) ON my_db.my_table. (ACCESS_DENIED)
```

5. Проверьте роль alter&#95;admin, выдав ей это разрешение

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. Войдите в систему пользователем alter admin

```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. Предоставьте подпривилегию

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. Проверьте попытку выдать привилегию, которой у пользователя alter admin нет и которая не является подпривилегией привилегий пользователя admin.

```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: Not enough privileges. To execute this query it's necessary to have grant ALTER UPDATE ON my_db.my_table WITH GRANT OPTION. (ACCESS_DENIED)
```

**Краткое содержание**
Привилегии `ALTER` имеют иерархическую структуру для операций `ALTER` над таблицами и представлениями, но не для других команд `ALTER`. Права могут назначаться как по отдельности, так и группами, и аналогичным образом отзываться. Пользователь, выдающий или отзывающий права, должен иметь `WITH GRANT OPTION`, чтобы назначать привилегии пользователям, включая самого себя, и уже должен обладать соответствующей привилегией. Действующий пользователь не может отозвать собственные привилегии, если он сам не обладает для них привилегией `WITH GRANT OPTION`.
