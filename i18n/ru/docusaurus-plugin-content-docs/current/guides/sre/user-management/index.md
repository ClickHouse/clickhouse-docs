---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: 'Пользователи и роли'
title: 'Управление доступом и учетными записями'
keywords: ['ClickHouse Cloud', 'Access Control', 'User Management', 'RBAC', 'Security']
description: 'Описание управления доступом и учетными записями в ClickHouse Cloud'
doc_type: 'guide'
---



# Создание пользователей и ролей в ClickHouse

ClickHouse поддерживает управление доступом на основе подхода [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control).

Объекты управления доступом в ClickHouse:
- [Учетная запись пользователя](#user-account-management)
- [Роль](#role-management)
- [Политика по строкам](#row-policy-management)
- [Профиль настроек](#settings-profiles-management)
- [Квота](#quotas-management)

Вы можете настраивать объекты управления доступом с помощью:

- SQL-ориентированного процесса.

    Для этого необходимо [включить](#enabling-access-control) соответствующую функциональность.

- [Конфигурационных файлов](/operations/configuration-files.md) сервера `users.xml` и `config.xml`.

Мы рекомендуем использовать SQL-ориентированный процесс. Оба способа конфигурации работают одновременно, поэтому, если вы используете конфигурационные файлы сервера для управления учетными записями и правами доступа, вы можете безболезненно перейти на SQL-ориентированный процесс.

:::note
Нельзя управлять одним и тем же объектом управления доступом одновременно обоими способами конфигурации.
:::

:::note
Если вы хотите управлять пользователями консоли ClickHouse Cloud, перейдите на эту [страницу](/cloud/security/manage-cloud-users)
:::

Чтобы увидеть всех пользователей, роли, профили и т. д., а также все их привилегии, используйте оператор [`SHOW ACCESS`](/sql-reference/statements/show#show-access).



## Обзор {#access-control-usage}

По умолчанию сервер ClickHouse предоставляет учетную запись пользователя `default`, для которой не разрешено использование управления доступом и учетными записями на основе SQL, но которая имеет все права и разрешения. Учетная запись пользователя `default` используется во всех случаях, когда имя пользователя не определено, например, при входе из клиента или в распределенных запросах. При обработке распределенных запросов используется учетная запись пользователя по умолчанию, если в конфигурации сервера или кластера не указаны свойства [user и password](/engines/table-engines/special/distributed.md).

Если вы только начали использовать ClickHouse, рассмотрите следующий сценарий:

1.  [Включите](#enabling-access-control) управление доступом и учетными записями на основе SQL для пользователя `default`.
2.  Войдите в учетную запись пользователя `default` и создайте всех необходимых пользователей. Не забудьте создать учетную запись администратора (`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`).
3.  [Ограничьте разрешения](/operations/settings/permissions-for-queries) для пользователя `default` и отключите для него управление доступом и учетными записями на основе SQL.

### Свойства текущего решения {#access-control-properties}

- Вы можете предоставлять разрешения для баз данных и таблиц, даже если они не существуют.
- Если таблица удалена, все привилегии, соответствующие этой таблице, не отзываются. Это означает, что даже если вы позже создадите новую таблицу с тем же именем, все привилегии останутся действительными. Чтобы отозвать привилегии, соответствующие удаленной таблице, необходимо выполнить, например, запрос `REVOKE ALL PRIVILEGES ON db.table FROM ALL`.
- Для привилегий отсутствуют настройки времени жизни.

### Учетная запись пользователя {#user-account-management}

Учетная запись пользователя — это сущность доступа, которая позволяет авторизовать кого-либо в ClickHouse. Учетная запись пользователя содержит:

- Идентификационную информацию.
- [Привилегии](/sql-reference/statements/grant.md#privileges), которые определяют область запросов, которые может выполнять пользователь.
- Хосты, которым разрешено подключаться к серверу ClickHouse.
- Назначенные роли и роли по умолчанию.
- Настройки с их ограничениями, применяемые по умолчанию при входе пользователя.
- Назначенные профили настроек.

Привилегии могут быть предоставлены учетной записи пользователя с помощью запроса [GRANT](/sql-reference/statements/grant.md) или путем назначения [ролей](#role-management). Для отзыва привилегий у пользователя ClickHouse предоставляет запрос [REVOKE](/sql-reference/statements/revoke.md). Для вывода списка привилегий пользователя используйте оператор [SHOW GRANTS](/sql-reference/statements/show#show-grants).

Запросы управления:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### Применение настроек {#access-control-settings-applying}

Настройки могут быть сконфигурированы по-разному: для учетной записи пользователя, в ее предоставленных ролях и в профилях настроек. При входе пользователя, если настройка сконфигурирована для различных сущностей доступа, значение и ограничения этой настройки применяются следующим образом (от более высокого к более низкому приоритету):

1.  Настройки учетной записи пользователя.
2.  Настройки для ролей по умолчанию учетной записи пользователя. Если настройка сконфигурирована в нескольких ролях, то порядок применения настройки не определен.
3.  Настройки из профилей настроек, назначенных пользователю или его ролям по умолчанию. Если настройка сконфигурирована в нескольких профилях, то порядок применения настройки не определен.
4.  Настройки, применяемые ко всему серверу по умолчанию или из [профиля по умолчанию](/operations/server-configuration-parameters/settings#default_profile).

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

Привилегии могут быть предоставлены роли с помощью запроса [GRANT](/sql-reference/statements/grant.md). Для отзыва привилегий у роли ClickHouse предоставляет запрос [REVOKE](/sql-reference/statements/revoke.md).

#### Политика строк {#row-policy-management}


Политика строк — это фильтр, определяющий, какие строки доступны пользователю или роли. Политика строк содержит фильтры для конкретной таблицы, а также список ролей и/или пользователей, которые должны использовать данную политику строк.

:::note
Политики строк имеют смысл только для пользователей с доступом только для чтения. Если пользователи могут изменять таблицу или копировать партиции между таблицами, это обходит ограничения политик строк.
:::

Запросы управления:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### Профиль настроек {#settings-profiles-management}

Профиль настроек — это набор [настроек](/operations/settings/index.md). Профиль настроек содержит настройки и ограничения, а также список ролей и/или пользователей, к которым применяется данный профиль.

Запросы управления:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### Квота {#quotas-management}

Квота ограничивает использование ресурсов. См. [Квоты](/operations/quotas.md).

Квота содержит набор ограничений для определенных периодов времени, а также список ролей и/или пользователей, которые должны использовать данную квоту.

Запросы управления:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### Включение управления доступом и учетными записями через SQL {#enabling-access-control}

- Настройте каталог для хранения конфигурации.

  ClickHouse хранит конфигурации сущностей доступа в папке, указанной в параметре конфигурации сервера [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path).

- Включите управление доступом и учетными записями через SQL как минимум для одной учетной записи пользователя.

  По умолчанию управление доступом и учетными записями через SQL отключено для всех пользователей. Необходимо настроить как минимум одного пользователя в конфигурационном файле `users.xml` и установить значения настроек [`access_management`](/operations/settings/settings-users.md#access_management-user-setting), `named_collection_control`, `show_named_collections` и `show_named_collections_secrets` равными 1.


## Определение пользователей и ролей SQL {#defining-sql-users-and-roles}

:::tip
Если вы работаете в ClickHouse Cloud, см. раздел [Управление доступом в Cloud](/cloud/security/console-roles).
:::

В этой статье описываются основы определения пользователей и ролей SQL, а также применения привилегий и разрешений к базам данных, таблицам, строкам и столбцам.

### Включение режима пользователей SQL {#enabling-sql-user-mode}

1.  Включите режим пользователей SQL в файле `users.xml` для пользователя `<default>`:

    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    Пользователь `default` — это единственный пользователь, который создается при новой установке, и по умолчанию он также используется для межузловых коммуникаций.

    В производственной среде рекомендуется отключить этого пользователя после того, как межузловая коммуникация будет настроена с учетной записью администратора SQL, а межузловые коммуникации будут установлены с помощью `<secret>`, учетных данных кластера и/или учетных данных для межузловых протоколов HTTP и transport, поскольку учетная запись `default` используется для межузловой коммуникации.
    :::

2.  Перезапустите узлы, чтобы применить изменения.

3.  Запустите клиент ClickHouse:
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


## Права доступа ALTER {#alter-permissions}

Эта статья поможет вам лучше понять, как определять права доступа и как они работают при использовании операторов `ALTER` для привилегированных пользователей.

Операторы `ALTER` разделены на несколько категорий, некоторые из которых являются иерархическими, а другие нет и должны быть определены явно.

**Пример конфигурации БД, таблицы и пользователя**

1. От имени администратора создайте тестового пользователя

```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. Создайте тестовую базу данных

```sql
CREATE DATABASE my_db;
```

3. Создайте тестовую таблицу

```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. Создайте тестового пользователя-администратора для выдачи/отзыва привилегий

```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
Для выдачи или отзыва прав доступа пользователь-администратор должен иметь привилегию `WITH GRANT OPTION`.
Например:

```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```

Для выполнения `GRANT` или `REVOKE` пользователь сначала должен сам обладать этими привилегиями.
:::

**Выдача или отзыв привилегий**

Иерархия `ALTER`:

```response
├── ALTER (только для таблиц и представлений)/
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

1. Выдача привилегий `ALTER` пользователю или роли

Использование `GRANT ALTER on *.* TO my_user` повлияет только на `ALTER TABLE` и `ALTER VIEW` верхнего уровня, другие операторы `ALTER` должны быть выданы или отозваны индивидуально.

Например, выдача базовой привилегии `ALTER`:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

Результирующий набор привилегий:

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

Это выдаст все права доступа в рамках `ALTER TABLE` и `ALTER VIEW` из примера выше, однако не выдаст некоторые другие права доступа `ALTER`, такие как `ALTER ROW POLICY` (обратитесь к иерархии, и вы увидите, что `ALTER ROW POLICY` не является дочерним элементом `ALTER TABLE` или `ALTER VIEW`). Они должны быть выданы или отозваны явно.

Если требуется только подмножество прав доступа `ALTER`, то каждое из них может быть выдано отдельно; если у этого права есть подпривилегии, то они также будут выданы автоматически.

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

Это также даёт следующие подпривилегии:

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

Если пользователю/роли была выдана подкprivилегия, вы можете либо отозвать её напрямую, либо отозвать привилегию более высокого уровня, от которой она наследуется.

Например, если пользователю была выдана привилегия `ALTER ADD COLUMN`

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 61fe0fdc-1442-4cd6-b2f3-e8f2a853c739

Ok.

0 строк в наборе. Затрачено: 0.002 сек.
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

Отдельную привилегию можно отозвать:

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

Или может быть отозвано на любом из верхних уровней (отозвав все подпривилегии COLUMN):

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user;
```

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user

Query id: b882ba1b-90fb-45b9-b10f-3cda251e2ccc

Ok.

0 строк в наборе. Затрачено: 0.002 сек.
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

Привилегии должны быть выданы пользователем, который не только обладает правом `WITH GRANT OPTION`, но и сам имеет эти привилегии.

1. Чтобы выдать пользователю-администратору привилегию и также разрешить ему управлять набором привилегий\
   Ниже приведён пример:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

Теперь пользователь может выдать или отозвать привилегию `ALTER COLUMN` и все её подпривилегии.

**Тестирование**

1. Добавьте привилегию `SELECT`

```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. Добавьте пользователю привилегию `ADD COLUMN`

```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. Войдите в систему под пользователем с ограниченными правами

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

4. Тестирование удаления столбца
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
````

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

Получено исключение от сервера (версия 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: Недостаточно прав. Для выполнения этого запроса необходима привилегия ALTER DROP COLUMN(column2) ON my_db.my_table. (ACCESS_DENIED)
```

5. Тестирование администратора ALTER путем выдачи разрешения

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. Войдите под пользователем alter&#95;admin

```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. Предоставьте вложенную привилегию

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ок.
```

8. Проверьте, что попытка выдать привилегию, которой у пользователя-администратора с правами `ALTER` нет и которая не является подпривилегией уже предоставленных администратору привилегий, завершается ошибкой.

```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Идентификатор запроса: 191690dc-55a6-4625-8fee-abc3d14a5545

Возвращено строк: 0. Затрачено: 0.004 сек.

Получено исключение от сервера (версия 22.5.1):
Код: 497. DB::Exception: Получено от chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: Недостаточно привилегий. Для выполнения этого запроса необходима привилегия ALTER UPDATE ON my_db.my_table WITH GRANT OPTION. (ACCESS_DENIED)
```

**Итог**
Привилегии `ALTER` имеют иерархическую структуру для операций `ALTER` с таблицами и представлениями, но не для других операторов `ALTER`. Права могут назначаться на детализированном уровне или через группы прав, а также аналогичным образом отзыватьcя. Пользователь, который выдает или отзывает привилегии, должен иметь право `WITH GRANT OPTION`, чтобы назначать права другим пользователям, включая самого действующего пользователя, и при этом уже должен обладать соответствующей привилегией. Действующий пользователь не может отозвать свои собственные привилегии, если у него самого нет привилегии `WITH GRANT OPTION`.
