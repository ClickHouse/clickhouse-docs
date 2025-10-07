## Тестирование прав администратора {#test-admin-privileges}

Выйдите из системы как пользователь `default` и войдите снова как пользователь `clickhouse_admin`.

Все эти команды должны выполниться успешно:

```sql
SHOW GRANTS FOR clickhouse_admin;
```

```sql
CREATE DATABASE db1
```

```sql
CREATE TABLE db1.table1 (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

```sql
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

```sql
SELECT * FROM db1.table1;
```

```sql
DROP TABLE db1.table1;
```

```sql
DROP DATABASE db1;
```

## Неадминистративные пользователи {#non-admin-users}

Пользователи должны иметь необходимые привилегии и не все должны быть администраторами. Остальная часть этого документа предоставляет примеры сценариев и необходимые роли.

### Подготовка {#preparation}

Создайте эти таблицы и пользователей, которые будут использоваться в примерах.

#### Создание тестовой базы данных, таблицы и строк {#creating-a-sample-database-table-and-rows}

<VerticalStepper headerLevel="h5">

##### Создание тестовой базы данных {#create-a-test-database}

```sql
CREATE DATABASE db1;
```

##### Создание таблицы {#create-a-table}

```sql
CREATE TABLE db1.table1 (
   id UInt64,
   column1 String,
   column2 String
)
ENGINE MergeTree
ORDER BY id;
```

##### Заполнение таблицы тестовыми строками {#populate}

```sql
INSERT INTO db1.table1
   (id, column1, column2)
VALUES
   (1, 'A', 'abc'),
   (2, 'A', 'def'),
   (3, 'B', 'abc'),
   (4, 'B', 'def');
```

##### Проверка таблицы {#verify}

```sql title="Query"
SELECT *
FROM db1.table1
```

```response title="Response"
Query id: 475015cc-6f51-4b20-bda2-3c9c41404e49

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
│  3 │ B       │ abc     │
│  4 │ B       │ def     │
└────┴─────────┴─────────┘
```

##### Создание `column_user` {#create-a-user-with-restricted-access-to-columns}

Создайте обычного пользователя, который будет использоваться для демонстрации ограничения доступа к определенным колонкам:

```sql
CREATE USER column_user IDENTIFIED BY 'password';
```

##### Создание `row_user` {#create-a-user-with-restricted-access-to-rows-with-certain-values}

Создайте обычного пользователя, который будет использоваться для демонстрации ограничения доступа к строкам с определенными значениями:
   
```sql
CREATE USER row_user IDENTIFIED BY 'password';
```
   
</VerticalStepper>

#### Создание ролей {#creating-roles}

В этом наборе примеров:

- будут созданы роли с различными привилегиями, такими как колонки и строки
- привилегии будут предоставлены ролям
- пользователи будут назначены каждой роли

Роли используются для определения групп пользователей с определенными привилегиями вместо управления каждым пользователем отдельно.

1. Создайте роль, чтобы ограничить пользователей этой роли только доступом к `column1` в базе данных `db1` и таблице `table1`:

```sql
CREATE ROLE column1_users;
```

2. Установите привилегии для просмотра `column1`

```sql
GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
```

3. Добавьте пользователя `column_user` в роль `column1_users`

```sql
GRANT column1_users TO column_user;
```

4. Создайте роль, чтобы ограничить пользователей этой роли только доступом к выбранным строкам, в данном случае, только к строкам, содержащим `A` в `column1`

```sql
CREATE ROLE A_rows_users;
```

5. Добавьте пользователя `row_user` в роль `A_rows_users`

```sql
GRANT A_rows_users TO row_user;
```

6. Создайте политику, чтобы разрешить доступ только к тем строкам, где `column1` имеет значение `A`

```sql
CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
```

7. Установите привилегии для базы данных и таблицы

```sql
GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
```

8. предоставьте явные разрешения для других ролей, чтобы они все еще имели доступ ко всем строкам

```sql
CREATE ROW POLICY allow_other_users_filter 
ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
```

    :::note
    При присоединении политики к таблице система применит эту политику, и только те пользователи и роли, которые определены, смогут выполнять операции с таблицей, все остальные будут лишены каких-либо операций. Чтобы не применять ограничивающую политику строк к другим пользователям, необходимо определить другую политику, позволяющую другим пользователям и ролям иметь обычный или другие типы доступа.
    :::

## Проверка {#verification}

### Тестирование прав роли с ограниченным доступом к колонкам {#testing-role-privileges-with-column-restricted-user}

1. Войдите в клиент clickhouse, используя пользователя `clickhouse_admin`

```bash
clickhouse-client --user clickhouse_admin --password password
```

2. Проверьте доступ к базе данных, таблице и всем строкам с административным пользователем.

```sql
SELECT *
FROM db1.table1
```

```response
Query id: f5e906ea-10c6-45b0-b649-36334902d31d

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
│  3 │ B       │ abc     │
│  4 │ B       │ def     │
└────┴─────────┴─────────┘
```

3. Войдите в клиент ClickHouse, используя пользователя `column_user`

```bash
clickhouse-client --user column_user --password password
```

4. Протестируйте `SELECT`, используя все колонки

```sql
SELECT *
FROM db1.table1
```

```response
Query id: 5576f4eb-7450-435c-a2d6-d6b49b7c4a23

0 rows in set. Elapsed: 0.006 sec.

Received exception from server (version 22.3.2):
Code: 497. DB::Exception: Received from localhost:9000. 
DB::Exception: column_user: Not enough privileges. 
To execute this query it's necessary to have grant 
SELECT(id, column1, column2) ON db1.table1. (ACCESS_DENIED)
```

   :::note
   Доступ запрещен, так как указаны все колонки, а пользователь имеет доступ только к `id` и `column1`
   :::

5. Проверьте запрос `SELECT`, указав только разрешенные колонки:

```sql
SELECT
    id,
    column1
FROM db1.table1
```

```response
Query id: cef9a083-d5ce-42ff-9678-f08dc60d4bb9

┌─id─┬─column1─┐
│  1 │ A       │
│  2 │ A       │
│  3 │ B       │
│  4 │ B       │
└────┴─────────┘
```

### Тестирование прав роли с ограниченным доступом к строкам {#testing-role-privileges-with-row-restricted-user}

1. Войдите в клиент ClickHouse, используя `row_user`

```bash
clickhouse-client --user row_user --password password
```

2. Просмотрите доступные строки

```sql
SELECT *
FROM db1.table1
```

```response
Query id: a79a113c-1eca-4c3f-be6e-d034f9a220fb

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
└────┴─────────┴─────────┘
```

   :::note
   Убедитесь, что возвращаются только вышеуказанные две строки, строки со значением `B` в `column1` должны быть исключены.
   :::

## Изменение пользователей и ролей {#modifying-users-and-roles}

Пользователям могут быть присвоены несколько ролей для комбинации необходимых привилегий. При использовании нескольких ролей система объединит роли для определения привилегий, итогом будет то, что разрешения ролей будут кумулятивными.

Например, если одна `role1` разрешает только выбор `column1`, а `role2` разрешает выбор `column1` и `column2`, тогда пользователь будет иметь доступ к обеим колонкам.

1. Используя учетную запись администратора, создайте нового пользователя, ограниченного как по строкам, так и по колонкам с ролью по умолчанию

```sql
CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
```

2. Удалите предыдущие привилегии для роли `A_rows_users`

```sql
REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
```

3. Разрешите роли `A_row_users` только выбор из `column1`

```sql
GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
```

4. Войдите в клиент ClickHouse, используя `row_and_column_user`

```bash
clickhouse-client --user row_and_column_user --password password;
```

5. Протестируйте со всеми колонками:

```sql
SELECT *
FROM db1.table1
```

```response
Query id: 8cdf0ff5-e711-4cbe-bd28-3c02e52e8bc4

0 rows in set. Elapsed: 0.005 sec.

Received exception from server (version 22.3.2):
Code: 497. DB::Exception: Received from localhost:9000. 
DB::Exception: row_and_column_user: Not enough privileges. 
To execute this query it's necessary to have grant 
SELECT(id, column1, column2) ON db1.table1. (ACCESS_DENIED)
```

6. Протестируйте с ограниченным набором разрешенных колонок:

```sql
SELECT
    id,
    column1
FROM db1.table1
```

```response
Query id: 5e30b490-507a-49e9-9778-8159799a6ed0

┌─id─┬─column1─┐
│  1 │ A       │
│  2 │ A       │
└────┴─────────┘
```

## Устранение неполадок {#troubleshooting}

Существуют случаи, когда привилегии пересекаются или комбинируются, что приводит к неожиданным результатам. Следующие команды могут быть использованы для уточнения проблемы, используя учетную запись администратора.

### Перечисление предоставлений и ролей для пользователя {#listing-the-grants-and-roles-for-a-user}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### Список ролей в ClickHouse {#list-roles-in-clickhouse}

```sql
SHOW ROLES
```

```response
Query id: 1e21440a-18d9-4e75-8f0e-66ec9b36470a

┌─name────────────┐
│ A_rows_users    │
│ column1_users   │
└─────────────────┘
```

### Отображение политик {#display-the-policies}

```sql
SHOW ROW POLICIES
```

```response
Query id: f2c636e9-f955-4d79-8e80-af40ea227ebc

┌─name───────────────────────────────────┐
│ A_row_filter ON db1.table1             │
│ allow_other_users_filter ON db1.table1 │
└────────────────────────────────────────┘
```

### Просмотр того, как была определена политика и текущие привилегии {#view-how-a-policy-was-defined-and-current-privileges}

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Пример команд для управления ролями, политиками и пользователями {#example-commands-to-manage-roles-policies-and-users}

Следующие команды можно использовать для:

- удаления привилегий
- удаления политик
- исключения пользователей из ролей
- удаления пользователей и ролей
  <br />

:::tip
Запускайте эти команды как пользователь-администратор или пользователь `default`
:::

### Удаление привилегии из роли {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### Удаление политики {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### Исключение пользователя из роли {#unassign-a-user-from-a-role}

```sql
REVOKE A_rows_users FROM row_user;
```

### Удаление роли {#delete-a-role}

```sql
DROP ROLE A_rows_users;
```

### Удаление пользователя {#delete-a-user}

```sql
DROP USER row_user;
```

## Резюме {#summary}

В этой статье были продемонстрированы основы создания SQL пользователей и ролей, а также предоставлены шаги по настройке и изменению привилегий для пользователей и ролей. Для получения более подробной информации об этом, пожалуйста, обратитесь к нашим пользовательским руководствам и справочной документации.
