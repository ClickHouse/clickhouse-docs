---
'slug': '/operations/access-rights'
'sidebar_position': 1
'sidebar_label': 'Пользователи и роли'
'title': 'Контроль доступа и управление учетными записями'
'keywords':
- 'ClickHouse Cloud'
- 'Access Control'
- 'User Management'
- 'RBAC'
- 'Security'
'description': 'Описывает контроль доступа и управление учетными записями в ClickHouse
  Cloud'
'doc_type': 'guide'
---


# Создание пользователей и ролей в ClickHouse

ClickHouse поддерживает управление контролем доступа на основе подхода [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control).

Сущности доступа ClickHouse:
- [Учетная запись пользователя](#user-account-management)
- [Роль](#role-management)
- [Политика строк](#row-policy-management)
- [Профиль настроек](#settings-profiles-management)
- [Квота](#quotas-management)

Вы можете настраивать сущности доступа с помощью:

- SQL-ориентированного рабочего процесса.

    Вам нужно [включить](#enabling-access-control) эту функциональность.

- Файлов [конфигурации сервера](/operations/configuration-files.md) `users.xml` и `config.xml`.

Мы рекомендуем использовать SQL-ориентированный рабочий процесс. Оба метода конфигурации работают одновременно, поэтому, если вы используете файлы конфигурации сервера для управления учетными записями и правами доступа, вы можете плавно перейти на SQL-ориентированный рабочий процесс.

:::note
Нельзя управлять одной и той же сущностью доступа с помощью обоих методов конфигурации одновременно.
:::

:::note
Если вы хотите управлять пользователями консоли ClickHouse Cloud, пожалуйста, обратитесь к этой [странице](/cloud/security/cloud-access-management).
:::

Чтобы увидеть всех пользователей, роли, профили и т.д. и все их права, используйте оператор [`SHOW ACCESS`](/sql-reference/statements/show#show-access).

## Обзор {#access-control-usage}

По умолчанию сервер ClickHouse предоставляет учетную запись пользователя `default`, для которой не разрешено использование управления доступом и учетными записями на основе SQL, но она имеет все права и разрешения. Учетная запись пользователя `default` используется в любых случаях, когда имя пользователя не определено, например, при входе с клиента или в распределенных запросах. В распределенной обработке запросов используется учетная запись пользователя по умолчанию, если конфигурация сервера или кластера не указывает свойства [user и password](/engines/table-engines/special/distributed.md).

Если вы только начали использовать ClickHouse, рассмотрите следующий сценарий:

1.  [Включите](#enabling-access-control) управление доступом и учетными записями на основе SQL для учетной записи `default`.
2.  Войдите в учетную запись пользователя `default` и создайте всех необходимых пользователей. Не забудьте создать учетную запись администратора (`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`).
3.  [Ограничьте права](#permissions-for-queries) для пользователя `default` и отключите управление доступом и учетными записями на основе SQL для него.

### Свойства текущего решения {#access-control-properties}

- Вы можете предоставлять права на базы данных и таблицы, даже если они не существуют.
- Если таблица удалена, все привилегии, соответствующие этой таблице, не отменяются. Это означает, что даже если вы позже создадите новую таблицу с тем же именем, все привилегии останутся действительными. Чтобы отозвать привилегии, соответствующие удаленной таблице, вам нужно выполнить, например, запрос `REVOKE ALL PRIVILEGES ON db.table FROM ALL`.
- У привилегий нет настроек времени жизни.

### Учетная запись пользователя {#user-account-management}

Учетная запись пользователя — это сущность доступа, которая позволяет авторизовать кого-либо в ClickHouse. Учетная запись пользователя содержит:

- Идентификационную информацию.
- [Привилегии](/sql-reference/statements/grant.md#privileges), которые определяют диапазон запросов, которые может выполнять пользователь.
- Хосты, которым разрешено подключаться к серверу ClickHouse.
- Назначенные и роли по умолчанию.
- Настройки с их ограничениями, применяемыми по умолчанию при входе пользователя.
- Назначенные профили настроек.

Привилегии могут быть предоставлены учетной записи пользователя с помощью запроса [GRANT](/sql-reference/statements/grant.md) или путем назначения [ролей](#role-management). Чтобы отозвать привилегии у пользователя, ClickHouse предоставляет запрос [REVOKE](/sql-reference/statements/revoke.md). Чтобы перечислить привилегии для пользователя, используйте оператор [SHOW GRANTS](/sql-reference/statements/show#show-grants).

Запросы управления:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### Применение настроек {#access-control-settings-applying}

Настройки могут быть настроены различным образом: для учетной записи пользователя, в ее предоставленных ролях и в профилях настроек. При входе пользователя, если настройка настроена для различных сущностей доступа, значение и ограничения этой настройки применяются следующим образом (от более высокого приоритета к более низкому):

1.  Настройки учетной записи пользователя.
2.  Настройки для ролей по умолчанию учетной записи пользователя. Если настройка настроена в некоторых ролях, порядок применения настройки не определен.
3.  Настройки из профилей настроек, назначенных пользователю или его ролям по умолчанию. Если настройка настроена в некоторых профилях, порядок применения настройки не определен.
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

Привилегии могут быть предоставлены роли с помощью запроса [GRANT](/sql-reference/statements/grant.md). Чтобы отозвать привилегии у роли, ClickHouse предоставляет запрос [REVOKE](/sql-reference/statements/revoke.md).

#### Политика строк {#row-policy-management}

Политика строк — это фильтр, который определяет, какие строки доступны пользователю или роли. Политика строк содержит фильтры для одной конкретной таблицы, а также список ролей и/или пользователей, которым следует использовать эту политику строк.

:::note
Политики строк имеют смысл только для пользователей с доступом только для чтения. Если пользователи могут изменять таблицу или копировать партиции между таблицами, это сводит на нет ограничения политик строк.
:::

Запросы управления:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### Профиль настроек {#settings-profiles-management}

Профиль настроек — это коллекция [настроек](/operations/settings/index.md). Профиль настроек содержит настройки и ограничения, а также список ролей и/или пользователей, к которым применяется этот профиль.

Запросы управления:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### Квота {#quotas-management}

Квота ограничивает использование ресурсов. См. [Квоты](/operations/quotas.md).

Квота содержит набор ограничений на некоторые промежутки времени, а также список ролей и/или пользователей, которые должны использовать эту квоту.

Запросы управления:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### Включение управления доступом и учетными записями на основе SQL {#enabling-access-control}

- Настроить директорию для хранения конфигурации.

    ClickHouse хранит конфигурации сущностей доступа в папке, заданной в серверном параметре [access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path).

- Включить управление доступом и учетными записями на основе SQL для как минимум одной учетной записи пользователя.

    По умолчанию управление доступом и учетными записями на основе SQL отключено для всех пользователей. Вам нужно настроить хотя бы одного пользователя в конфигурационном файле `users.xml` и установить значения настроек [`access_management`](/operations/settings/settings-users.md#access_management-user-setting), `named_collection_control`, `show_named_collections` и `show_named_collections_secrets` на 1.

## Определение пользователей и ролей SQL {#defining-sql-users-and-roles}

:::tip
Если вы работаете в ClickHouse Cloud, пожалуйста, смотрите [Управление доступом в облаке](/cloud/security/cloud-access-management).
:::

Эта статья показывает основы определения пользователей и ролей SQL и применения этих прав и разрешений к базам данных, таблицам, строкам и колонкам.

### Включение режима пользователя SQL {#enabling-sql-user-mode}

1.  Включите режим пользователя SQL в файле `users.xml` под пользователем `<default>`:
```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

    :::note
    Пользователь `default` — это единственный пользователь, который создается при свежей установке, и он также является учетной записью, используемой для межузловых коммуникаций по умолчанию.

    В производственной среде рекомендуется отключить этого пользователя, как только межузловая связь будет настроена с использованием SQL-администратора и были установлены учетные данные для межузловой связи с `<secret>`, кластерными учетными данными и/или учетными данными HTTP и транспортного протокола межузловой связи, так как учетная запись `default` используется для межузловой связи.
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

2. Предоставьте новому пользователю полные административные права
```sql
GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
```

## Изменение прав {#alter-permissions}

Эта статья предназначена для того, чтобы помочь вам лучше понять, как определить права и как права работают при использовании операторов `ALTER` для административных пользователей.

Операторы `ALTER` делятся на несколько категорий, некоторые из которых иерархические, а некоторые — нет и должны быть явно определены.

**Пример конфигурации базы данных, таблицы и пользователя**
1. С администраторской учетной записью создайте пример пользователя
```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. Создайте пример базы данных
```sql
CREATE DATABASE my_db;
```

3. Создайте пример таблицы
```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. Создайте пример учетной записи администратора для предоставления/отзыва привилегий
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
Чтобы предоставить или отозвать права, у администратора должна быть привилегия `WITH GRANT OPTION`.
Например:
```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```
Чтобы `GRANT` или `REVOKE` привилегии, пользователь сначала должен сам иметь эти привилегии.
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

Использование `GRANT ALTER on *.* TO my_user` затронет только верхнеуровневые `ALTER TABLE` и `ALTER VIEW`, другие операторы `ALTER` должны быть предоставлены или отозваны индивидуально.

например, предоставление базовой привилегии `ALTER`:

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

Это предоставит все разрешения под `ALTER TABLE` и `ALTER VIEW` из примера выше, однако это не предоставит определенные другие привилегии `ALTER`, такие как `ALTER ROW POLICY` (обратитесь к иерархии, и вы увидите, что `ALTER ROW POLICY` не является дочерним элементом `ALTER TABLE` или `ALTER VIEW`). Эти привилегии должны быть явно предоставлены или отозваны.

Если требуется только подмножество привилегий `ALTER`, то каждую из них можно предоставить отдельно; если у этой привилегии есть подпривилегии, то они также будут предоставлены автоматически.

Например:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

Предоставляемые привилегии будут установлены как:

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

Это также дает следующие подпривилегии:

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

Если пользователю/роли была предоставлена подпривилегия, вы можете либо отозвать эту подпривилегию непосредственно, либо отозвать более высокую привилегию, от которой она наследуется.

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

Привилегию можно отозвать индивидуально:

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

Или можно отозвать с любого из верхних уровней (отозвать все подпривилегии COLUMN):

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

Привилегии должны предоставляться пользователем, который не только имеет `WITH GRANT OPTION`, но и сам имеет эти привилегии.

1. Чтобы предоставить администратору привилегию и также разрешить ему управлять набором привилегий
Ниже приведен пример:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

Теперь пользователь может предоставлять или отзывать `ALTER COLUMN` и все подпривилегии.

**Тестирование**

1. Добавьте привилегию `SELECT`
```sql
GRANT SELECT ON my_db.my_table TO my_user;
```

2. Добавьте привилегию на добавление столбца для пользователя
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. Войдите с ограниченной учетной записью
```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. Протестируйте добавление столбца
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

4. Протестируйте удаление столбца
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

5. Тестирование администратора изменения, предоставив разрешение
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. Войдите с учетной записью администратора изменения
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

8. Протестируйте предоставление привилегии, которую пользователь администратора изменения не имеет, поскольку она не является подпривилегией предоставленных прав для учетной записи администратора.
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

**Итоги**
Привилегии ALTER иерархичны для `ALTER` с таблицами и представлениями, но не для других операторов `ALTER`. Привилегии могут быть установлены на детальном уровне или группировками, а также отозваны аналогично. Пользователь, предоставляющий или отзывающий привилегии, должен иметь `WITH GRANT OPTION`, чтобы устанавливать привилегии для пользователей, включая самих действующих пользователей, и должен уже иметь эту привилегию. Действующий пользователь не может отозвать свои собственные привилегии, если у него нет привилегии на предоставление.
