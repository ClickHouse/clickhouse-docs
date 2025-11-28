---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: 'Пользователи и роли'
title: 'Контроль доступа и управление учетными записями'
keywords: ['ClickHouse Cloud', 'Контроль доступа', 'Управление пользователями', 'RBAC', 'Безопасность']
description: 'Описывает контроль доступа и управление учетными записями в ClickHouse Cloud'
doc_type: 'guide'
---



# Создание пользователей и ролей в ClickHouse

ClickHouse поддерживает управление доступом на основе подхода [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control).

Объекты управления доступом в ClickHouse:
- [Учетная запись пользователя](#user-account-management)
- [Роль](#role-management)
- [Политика строк (Row Policy)](#row-policy-management)
- [Профиль настроек (Settings Profile)](#settings-profiles-management)
- [Квота](#quotas-management)

Вы можете настраивать объекты доступа с помощью:

- SQL-ориентированного подхода.

    Для этого необходимо [включить](#enabling-access-control) эту функциональность.

- [Конфигурационных файлов](/operations/configuration-files.md) сервера `users.xml` и `config.xml`.

Мы рекомендуем использовать SQL-ориентированный подход. Оба метода конфигурации работают одновременно, поэтому, если вы используете конфигурационные файлы сервера для управления учетными записями и правами доступа, вы можете безболезненно перейти на подход, основанный на SQL.

:::note
Нельзя управлять одной и той же сущностью доступа одновременно с помощью обоих методов конфигурации.
:::

:::note
Если вы хотите управлять пользователями консоли ClickHouse Cloud, обратитесь к этой [странице](/cloud/security/manage-cloud-users)
:::

Чтобы просмотреть всех пользователей, роли, профили и т. д., а также все их выдачи (grants), используйте оператор [`SHOW ACCESS`](/sql-reference/statements/show#show-access).



## Обзор {#access-control-usage}

По умолчанию сервер ClickHouse предоставляет учетную запись `default`, для которой нельзя использовать управление доступом и учетными записями на основе SQL, но которая имеет все права и разрешения. Учетная запись `default` используется во всех случаях, когда имя пользователя не определено, например, при входе с клиента или в распределенных запросах. При обработке распределенного запроса учетная запись `default` используется, если в конфигурации сервера или кластера не указаны свойства [user и password](/engines/table-engines/special/distributed.md).

Если вы только начали использовать ClickHouse, рассмотрите следующий сценарий:

1.  [Включите](#enabling-access-control) управление доступом и учетными записями на основе SQL для пользователя `default`.
2.  Войдите под учетной записью `default` и создайте всех необходимых пользователей. Не забудьте создать учетную запись администратора (`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`).
3.  [Ограничьте права](/operations/settings/permissions-for-queries) для пользователя `default` и отключите для него управление доступом и учетными записями на основе SQL.

### Свойства текущего решения {#access-control-properties}

- Вы можете выдавать права на базы данных и таблицы, даже если они еще не существуют.
- Если таблица удалена, все привилегии, соответствующие этой таблице, не отзываются. Это означает, что даже если позже вы создадите новую таблицу с тем же именем, все привилегии останутся действительными. Чтобы отозвать привилегии, соответствующие удаленной таблице, нужно выполнить, например, запрос `REVOKE ALL PRIVILEGES ON db.table FROM ALL`.
- Для привилегий не задаются сроки действия.

### Учетная запись пользователя {#user-account-management}

Учетная запись пользователя — это объект управления доступом, который используется для аутентификации в ClickHouse. Учетная запись пользователя содержит:

- Идентификационную информацию.
- [Привилегии](/sql-reference/statements/grant.md#privileges), которые определяют область запросов, которые пользователь может выполнять.
- Хосты, с которых разрешено подключение к серверу ClickHouse.
- Назначенные роли и роли по умолчанию.
- Настройки с их ограничениями, применяемые по умолчанию при входе пользователя.
- Назначенные профили настроек.

Привилегии могут быть выданы учетной записи пользователя с помощью запроса [GRANT](/sql-reference/statements/grant.md) или путем назначения [ролей](#role-management). Для отзыва привилегий у пользователя в ClickHouse предусмотрен запрос [REVOKE](/sql-reference/statements/revoke.md). Чтобы вывести список привилегий пользователя, используйте оператор [SHOW GRANTS](/sql-reference/statements/show#show-grants).

Запросы управления:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### Применение настроек {#access-control-settings-applying}

Настройки могут быть заданы по-разному: для учетной записи пользователя, в назначенных ей ролях и в профилях настроек. При входе пользователя, если одна и та же настройка задана для разных объектов управления доступом, ее значение и ограничения применяются в следующем порядке (от более высокого приоритета к более низкому):

1.  Настройки учетной записи пользователя.
2.  Настройки для ролей по умолчанию учетной записи пользователя. Если настройка задана в нескольких ролях, порядок ее применения не определен.
3.  Настройки из профилей настроек, назначенных пользователю или его ролям по умолчанию. Если настройка задана в нескольких профилях, порядок ее применения не определен.
4.  Настройки, применяемые ко всему серверу по умолчанию или из [профиля по умолчанию](/operations/server-configuration-parameters/settings#default_profile).

### Роль {#role-management}

Роль — это контейнер для объектов управления доступом, который может быть назначен учетной записи пользователя.

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

Привилегии могут быть выданы роли с помощью запроса [GRANT](/sql-reference/statements/grant.md). Для отзыва привилегий у роли в ClickHouse предусмотрен запрос [REVOKE](/sql-reference/statements/revoke.md).

#### Политика строк {#row-policy-management}



Политика строк — это фильтр, который определяет, какие строки доступны пользователю или роли. Политика строк содержит фильтры для одной конкретной таблицы, а также список ролей и/или пользователей, к которым применяется эта политика строк.

:::note
Политики строк имеют смысл только для пользователей с доступом `readonly`. Если пользователи могут изменять таблицу или копировать партиции между таблицами, это сводит на нет ограничения политик строк.
:::

Запросы управления:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### Профиль настроек {#settings-profiles-management}

Профиль настроек — это набор [настроек](/operations/settings/index.md). Профиль настроек содержит параметры и ограничения, а также список ролей и/или пользователей, к которым применяется этот профиль.

Запросы управления:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### Квота {#quotas-management}

Квота ограничивает использование ресурсов. См. [Quotas](/operations/quotas.md).

Квота содержит набор ограничений для некоторых интервалов времени, а также список ролей и/или пользователей, к которым применяется эта квота.

Запросы управления:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### Включение управления доступом и учетными записями на основе SQL {#enabling-access-control}

- Настройте каталог для хранения конфигураций.

    ClickHouse хранит конфигурации объектов управления доступом в каталоге, заданном параметром конфигурации сервера [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path).

- Включите управление доступом и учетными записями на основе SQL как минимум для одной учетной записи пользователя.

    По умолчанию управление доступом и учетными записями на основе SQL отключено для всех пользователей. Необходимо настроить как минимум одного пользователя в конфигурационном файле `users.xml` и установить значения настроек [`access_management`](/operations/settings/settings-users.md#access_management-user-setting), `named_collection_control`, `show_named_collections` и `show_named_collections_secrets` равными 1.



## Определение SQL-пользователей и ролей {#defining-sql-users-and-roles}

:::tip
Если вы работаете в ClickHouse Cloud, см. раздел [Управление доступом в Cloud](/cloud/security/console-roles).
:::

В этой статье рассматриваются основы определения SQL-пользователей и ролей, а также применения соответствующих прав и разрешений к базам данных, таблицам, строкам и столбцам.

### Включение режима SQL-пользователей {#enabling-sql-user-mode}

1.  Включите режим SQL-пользователей в файле `users.xml` для пользователя `<default>`:
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    Пользователь `default` — единственный пользователь, который создаётся при новой установке, и по умолчанию он также используется для межузлового взаимодействия.

    В продуктивной среде рекомендуется отключить этого пользователя после того, как межузловое взаимодействие будет настроено с использованием SQL-администратора, а для межузловых коммуникаций будут заданы `<secret>`, учётные данные кластера и/или учётные данные межузловых HTTP- и транспортных протоколов, поскольку учётная запись `default` используется для межузлового взаимодействия.
    :::

2. Перезапустите узлы, чтобы применить изменения.

3. Запустите клиент ClickHouse:
    ```sql
    clickhouse-client --user default --password <password>
    ```
### Определение пользователей {#defining-users}

1. Создайте учётную запись SQL-администратора:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. Предоставьте новому пользователю полные административные права:
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```



## Изменение прав доступа

Эта статья предназначена для того, чтобы помочь вам лучше понять, как определять права доступа и как они работают при использовании операторов `ALTER` для привилегированных пользователей.

Операторы `ALTER` разделены на несколько категорий, некоторые из них образуют иерархию, а некоторые — нет и должны быть заданы явно.

**Пример конфигурации БД, таблицы и пользователя**

1. Под учетной записью администратора создайте тестового пользователя

```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. Создайте тестовую базу данных

```sql
CREATE DATABASE my_db;
```

3. Создайте демонстрационную таблицу

```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. Создайте тестового пользователя-администратора для выдачи и отзыва привилегий

```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
Чтобы предоставить или отозвать права, пользователь с правами администратора должен иметь привилегию `WITH GRANT OPTION`.
Например:

```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```

Чтобы выполнить `GRANT` или `REVOKE` привилегий, пользователь должен сначала сам обладать этими привилегиями.
:::

**Предоставление или отзыв привилегий**

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

1. Предоставление привилегий `ALTER` пользователю или роли

Использование `GRANT ALTER on *.* TO my_user` повлияет только на верхнеуровневые операции `ALTER TABLE` и `ALTER VIEW`, остальные операторы `ALTER` должны предоставляться или отзываться по отдельности.

Например, предоставление базовой привилегии `ALTER`:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

Итоговый набор привилегий:

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

Это предоставит все привилегии, подпадающие под `ALTER TABLE` и `ALTER VIEW` в приведённом выше примере, однако не предоставит некоторые другие привилегии `ALTER`, такие как `ALTER ROW POLICY` (обратитесь к иерархии, и вы увидите, что `ALTER ROW POLICY` не является дочерним элементом `ALTER TABLE` или `ALTER VIEW`). Эти привилегии должны быть явно выданы или отозваны.

Если требуется только подмножество привилегий `ALTER`, каждую из них можно выдать отдельно; если у этой привилегии есть подпривилегии, они также будут автоматически выданы.

Например:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

Права доступа будут настроены следующим образом:

```sql
SHOW GRANTS FOR my_user;
```


```response
SHOW GRANTS FOR my_user

ID запроса: 47b3d03f-46ac-4385-91ec-41119010e4e2

┌─GRANTS FOR my_user────────────────────────────────┐
│ GRANT ALTER COLUMN ON default.my_table TO my_user │
└───────────────────────────────────────────────────┘

Получена 1 строка. Время выполнения: 0.004 сек.
```

Это также предоставляет следующие подпривилегии:

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

Получено 0 строк. Время выполнения: 0.002 сек.
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

Привилегию можно отозвать по отдельности:

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

Или их можно отозвать на любом из вышестоящих уровней (отозвать все подпривилегии на уровне COLUMN):

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

Привилегии должны быть выданы пользователем, который не только имеет `WITH GRANT OPTION`, но и обладает самими этими привилегиями.

1. Чтобы выдать администратору привилегию и также предоставить ему возможность управлять набором привилегий\
   Ниже приведён пример:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

Теперь пользователь может выдавать или отзывать привилегию `ALTER COLUMN` и все её подпривилегии.

**Тестирование**

1. Добавьте привилегию `SELECT`

```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. Добавьте пользователю право на добавление столбцов

```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. Войдите в систему под учетной записью пользователя с ограниченными правами

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


┌─имя─────┬─тип────┬─тип&#95;по&#95;умолчанию─┬─выражение&#95;по&#95;умолчанию─┬─комментарий─┬─выражение&#95;кодека─┬─выражение&#95;TTL─┐
│ id      │ UInt64 │              │                    │             │                  │                  │
│ column1 │ String │              │                    │             │                  │                  │
│ column2 │ String │              │                    │             │                  │                  │
└─────────┴────────┴─────────────────────┴────────────────────────────┴─────────────┴──────────────────┴──────────────────┘

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

5. Проверка привилегии `ALTER ADMIN` путём выдачи соответствующих прав

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. Войдите в систему под пользователем alter admin

```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. Предоставить подпривилегию

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. Проверьте, что выдаваемая привилегия, которой у пользователя alter admin нет, не рассматривается как подпривилегия уже выданных этому администратору привилегий.

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

**Краткое содержание**
Привилегии `ALTER` имеют иерархическую структуру для операций `ALTER` над таблицами и представлениями, но не для других операторов `ALTER`. Права могут задаваться на детализированном уровне или в виде групп привилегий, а также аналогичным образом отзыватьcя. Пользователь, выдающий или отзывающий права, должен иметь `WITH GRANT OPTION`, чтобы назначать привилегии пользователям, включая себя как действующего пользователя, и при этом уже обладать соответствующей привилегией. Действующий пользователь не может отозвать собственные привилегии, если сам не обладает привилегией `GRANT OPTION`.
