---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: 'Пользователи и Роли'
title: 'Контроль Доступа и Управление Учетными Записями'
keywords: ['ClickHouse Cloud', 'Контроль Доступа', 'Управление Пользователями', 'RBAC', 'Безопасность']
description: 'Описывает контроль доступа и управление учетными записями в ClickHouse Cloud'
---


# Создание Пользователей и Ролей в ClickHouse

ClickHouse поддерживает управление контролем доступа на основе подхода [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control).

Сущности доступа ClickHouse:
- [Учетная запись пользователя](#user-account-management)
- [Роль](#role-management)
- [Политика строк](#row-policy-management)
- [Профиль настроек](#settings-profiles-management)
- [Квота](#quotas-management)

Вы можете настраивать сущности доступа с помощью:

- Рабочего процесса на основе SQL.

    Вы должны [включить](#enabling-access-control) эту функциональность.

- Файлов [конфигурации сервера](/operations/configuration-files.md) `users.xml` и `config.xml`.

Мы рекомендуем использовать рабочий процесс на основе SQL. Оба метода конфигурации работают одновременно, поэтому, если вы используете файлы конфигурации сервера для управления учетными записями и правами доступа, вы можете плавно переключиться на рабочий процесс на основе SQL.

:::note
Вы не можете управлять одной и той же сущностью доступа обоими методами конфигурации одновременно.
:::

:::note
Если вы ищете управление пользователями консоли ClickHouse Cloud, пожалуйста, обратитесь к этой [странице](/cloud/security/cloud-access-management).
:::

Чтобы увидеть всех пользователей, роли, профили и т.д. и все их привилегии, используйте оператор [`SHOW ACCESS`](/sql-reference/statements/show#show-access).

## Обзор {#access-control-usage}

По умолчанию сервер ClickHouse предоставляет учетную запись пользователя `default`, которой не разрешено использовать управление доступом и учетными записями на основе SQL, но она имеет все права и разрешения. Учетная запись пользователя `default` используется в любых случаях, когда имя пользователя не указано, например, при входе от клиента или в распределенных запросах. В обработке распределённых запросов используется учетная запись пользователя по умолчанию, если в конфигурации сервера или кластера не указаны свойства [пользователя и пароля](/engines/table-engines/special/distributed.md).

Если вы только начали использовать ClickHouse, рассмотрите следующий сценарий:

1.  [Включите](#enabling-access-control) SQL-управление доступом и учетными записями для учетной записи `default`.
2.  Войдите в учетную запись пользователя `default` и создайте всех необходимых пользователей. Не забудьте создать учетную запись администратора (`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`).
3.  [Ограничьте разрешения](/operations/settings/permissions-for-queries) для учетной записи `default` и отключите управление доступом и учетными записями на основе SQL для неё.

### Свойства Текущего Решения {#access-control-properties}

- Вы можете предоставлять разрешения для баз данных и таблиц, даже если они не существуют.
- Если таблица удалена, все привилегии, соответствующие этой таблице, не отзываются. Это означает, что даже если вы позже создадите новую таблицу с тем же именем, все привилегии останутся действительными. Чтобы отозвать привилегии, соответствующие удаленной таблице, необходимо выполнить, например, запрос `REVOKE ALL PRIVILEGES ON db.table FROM ALL`.
- Для привилегий нет настроек срока действия.

### Учетная Запись Пользователя {#user-account-management}

Учетная запись пользователя — это сущность доступа, которая позволяет авторизовать кого-то в ClickHouse. Учетная запись пользователя содержит:

- Идентификационную информацию.
- [Привилегии](/sql-reference/statements/grant.md#privileges), которые определяют объем запросов, которые пользователь может выполнять.
- Хосты, которым разрешено подключение к серверу ClickHouse.
- Назначенные и роли по умолчанию.
- Настройки с ограничениями, применяемыми по умолчанию при входе пользователя.
- Назначенные профили настроек.

Привилегии могут быть предоставлены учетной записи пользователя с помощью запроса [GRANT](/sql-reference/statements/grant.md) или присвоением [ролей](#role-management). Чтобы отозвать привилегии у пользователя, ClickHouse предоставляет запрос [REVOKE](/sql-reference/statements/revoke.md). Чтобы перечислить привилегии для пользователя, используйте оператор [SHOW GRANTS](/sql-reference/statements/show#show-grants).

Запросы управления:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### Применение Настроек {#access-control-settings-applying}

Настройки могут быть настроены по-разному: для учетной записи пользователя, в его назначенных ролях и в профилях настроек. При входе пользователя, если настройка настроена для различных сущностей доступа, значение и ограничения этой настройки применяются следующим образом (от более высокого к более низкому приоритету):

1.  Настройки учетной записи пользователя.
2.  Настройки для ролей по умолчанию учетной записи пользователя. Если настройка настроена в некоторых ролях, то порядок применения настройки не определен.
3.  Настройки из профилей настроек, назначенных пользователю или его ролям по умолчанию. Если настройка настроена в некоторых профилях, то порядок применения настройки не определен.
4.  Настройки, применяемые по умолчанию ко всему серверу или из [профиля по умолчанию](/operations/server-configuration-parameters/settings#default_profile).

### Роль {#role-management}

Роль — это контейнер для сущностей доступа, которые могут быть предоставлены учетной записи пользователя.

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

Привилегии могут быть предоставлены роли с помощью запроса [GRANT](/sql-reference/statements/grant.md). Чтобы отозвать привилегии у роли, ClickHouse предоставляет запрос [REVOKE](/sql-reference/statements/revoke.md).

#### Политика Строк {#row-policy-management}

Политика строк — это фильтр, который определяет, какие строки доступны пользователю или роли. Политика строк содержит фильтры для одной конкретной таблицы, а также список ролей и/или пользователей, которые должны использовать эту политику строк.

:::note
Политики строк имеют смысл только для пользователей с доступом только для чтения. Если пользователи могут изменять таблицы или копировать партиции между таблицами, это нарушает ограничения политик строк.
:::

Запросы управления:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### Профиль Настроек {#settings-profiles-management}

Профиль настроек — это набор [настроек](/operations/settings/index.md). Профиль настроек содержит настройки и ограничения, а также список ролей и/или пользователей, к которым применяется этот профиль.

Запросы управления:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### Квота {#quotas-management}

Квота ограничивает использование ресурсов. См. [Квоты](/operations/quotas.md).

Квота содержит набор ограничений для некоторых периодов, а также список ролей и/или пользователей, которые должны использовать эту квоту.

Запросы управления:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### Включение Управления Доступом и Учетными Записями на Основе SQL {#enabling-access-control}

- Настройте каталог для хранения конфигурации.

    ClickHouse хранит конфигурации сущностей доступа в папке, установленной в параметре конфигурации сервера [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path).

- Включите управление доступом и учетными записями на основе SQL для как минимум одной учетной записи пользователя.

    По умолчанию управление доступом и учетными записями на основе SQL отключено для всех пользователей. Вам необходимо настроить как минимум одного пользователя в файле конфигурации `users.xml` и установить значения настроек [`access_management`](/operations/settings/settings-users.md#access_management-user-setting), `named_collection_control`, `show_named_collections` и `show_named_collections_secrets` на 1.

## Определение Пользователей и Ролей SQL {#defining-sql-users-and-roles}

:::tip
Если вы работаете в ClickHouse Cloud, пожалуйста, смотрите [Управление доступом в облаке](/cloud/security/cloud-access-management).
:::

Эта статья показывает основы определения пользователей и ролей SQL и применения этих привилегий и разрешений к базам данных, таблицам, строкам и колонкам.

### Включение Режима Пользователя SQL {#enabling-sql-user-mode}

1.  Включите режим пользователя SQL в файле `users.xml` под пользователем `<default>`:
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    Учетная запись `default` — это единственный пользователь, который создается при новой установке, и она также является учетной записью, используемой для межузловых коммуникаций по умолчанию.

    В производственной среде рекомендуется отключить этого пользователя, как только межузловая связь будет настроена с помощью SQL-администратора и межузловые коммуникации будут установлены с помощью `<secret>`, учетных данных кластера и/или учетных данных межузловой HTTP и транспортного протокола, так как учетная запись `default` используется для межузловой связи.
    :::

2. Перезапустите узлы, чтобы применить изменения.

3. Запустите клиент ClickHouse:
    ```sql
    clickhouse-client --user default --password <password>
    ```
### Определение пользователей {#defining-users}

1. Создайте учетную запись администратора SQL:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. Предоставьте новому пользователю полные административные права:
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

## Права ALTER {#alter-permissions}

Эта статья направлена на то, чтобы дать вам лучшее понимание того, как определять права, и как права работают при использовании операторов `ALTER` для привилегированных пользователей.

Операторы `ALTER` делятся на несколько категорий, некоторые из которых являются иерархическими, а некоторые — нет, и их необходимо явно определять.

**Пример настройки БД, таблицы и пользователя**
1. С администратором создайте пример пользователя:
```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. Создайте пример базы данных:
```sql
CREATE DATABASE my_db;
```

3. Создайте пример таблицы:
```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. Создайте пример пользователя-администратора для предоставления/отзыва привилегий:
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
Чтобы предоставить или отозвать привилегии, у администратора должна быть привилегия `WITH GRANT OPTION`.
Например:
  ```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
  ```
Чтобы `GRANT` или `REVOKE` привилегии, пользователь должен сначала иметь эти привилегии.
:::

**Предоставление или отзыв привилегий**

Иерархия `ALTER`:

```response
├── ALTER (только для таблицы и представления)/
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

1. Предоставление привилегий `ALTER` пользователю или роли:

Использование `GRANT ALTER on *.* TO my_user` будет касаться только верхнеуровневых `ALTER TABLE` и `ALTER VIEW`, другие операторы `ALTER` должны быть предоставлены или отозваны индивидуально.

Например, предоставление базовой привилегии `ALTER`:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

Результирующий набор привилегий:

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 706befbc-525e-4ec1-a1a2-ba2508cc09e3

┌─GRANTS FOR my_user───────────────────────────────────────────┐
│ GRANT ALTER TABLE, ALTER VIEW ON my_db.my_table TO my_user   │
└──────────────────────────────────────────────────────────────┘
```

Это предоставит все разрешения из `ALTER TABLE` и `ALTER VIEW` из приведенного выше примера, однако это не предоставит некоторые другие разрешения `ALTER`, такие как `ALTER ROW POLICY` (обратитесь к иерархии, и вы увидите, что `ALTER ROW POLICY` не является дочерним элементом `ALTER TABLE` или `ALTER VIEW`). Эти привилегии должны быть явно предоставлены или отозваны.

Если нужна только подмножество привилегий `ALTER`, то каждую из них можно предоставить отдельно, если у привилегии есть под-привилегии, то они будут также предоставлены автоматически.

Например:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

Привилегии будут установлены как:

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

Это также дает следующие под-привилегии:

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. Отзыв привилегий `ALTER` у пользователей и ролей.

Оператор `REVOKE` работает аналогично оператору `GRANT`.

Если пользователю/роли была предоставлена под-привилегия, вы можете отозвать эту под-привилегию непосредственно или отозвать привилегию более высокого уровня, которую она наследует.

Например, если пользователю была предоставлена привилегия `ALTER ADD COLUMN`:

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

Привилегия может быть отозвана индивидуально:

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

Или может быть отозвана от любого из верхних уровней (отозвать все под-привилегии COLUMN):

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

Привилегии должны предоставляться пользователем, который обладает не только `WITH GRANT OPTION`, но и самими привилегиями.

1. Чтобы предоставить пользователю-администратору привилегию и также разрешить ему управлять набором привилегий, ниже приведен пример:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

Теперь пользователь может предоставлять или отозвать `ALTER COLUMN` и все под-привилегии.

**Тестирование**

1. Добавьте привилегию `SELECT`:
```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. Добавьте привилегию добавления колонки пользователю:
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. Войдите с ограниченной учетной записью:
```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. Протестируйте добавление колонки:
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

┌─name────┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

4. Протестируйте удаление колонки:
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47


0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: Not enough privileges. To execute this query it's necessary to have grant ALTER DROP COLUMN(column2) ON my_db.my_table. (ACCESS_DENIED)
```

5. Тестирование администратора изменения путем предоставления права:
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. Войдите с учетной записью администратора изменения:
```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. Предоставьте под-привилегию:
```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. Протестируйте предоставление привилегии, которую учетная запись администратора изменения не имеет, это не под-привилегия предоставлений для администратора.
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

**Резюме**
Привилегии ALTER являются иерархическими для `ALTER` с таблицами и представлениями, но не для других операторов `ALTER`. Привилегии могут быть заданы на детальном уровне или группой привилегий, а также отозваны аналогично. Пользователь, который предоставляет или отзывает, должен обладать `WITH GRANT OPTION`, чтобы устанавливать привилегии пользователям, включая самих действующих пользователей, и должен уже иметь данную привилегию. Действующий пользователь не может отозвать свои собственные привилегии, если он не обладает привилегией возможности предоставления.
