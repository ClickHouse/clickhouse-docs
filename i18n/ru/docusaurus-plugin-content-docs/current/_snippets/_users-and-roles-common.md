## Проверка полномочий админа {#test-admin-privileges}

Выйдите из системы как пользователь `default` и войдите заново как пользователь `clickhouse_admin`.

Все из следующего должно выполниться успешно:

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

## Обычные пользователи {#non-admin-users}

Пользователи должны иметь необходимые полномочия и не все должны быть администратором. Остальная часть этого документа предоставляет примерные сценарии и необходимые роли.

### Подготовка {#preparation}

Создайте эти таблицы и пользователей для использования в примерах.

#### Создание тестовой базы данных, таблицы и строк {#creating-a-sample-database-table-and-rows}

1. Создайте тестовую базу данных

   ```sql
   CREATE DATABASE db1;
   ```

2. Создайте таблицу

   ```sql
   CREATE TABLE db1.table1 (
       id UInt64,
       column1 String,
       column2 String
   )
   ENGINE MergeTree
   ORDER BY id;
   ```

3. Заполните таблицу образцовыми строками

   ```sql
   INSERT INTO db1.table1
       (id, column1, column2)
   VALUES
       (1, 'A', 'abc'),
       (2, 'A', 'def'),
       (3, 'B', 'abc'),
       (4, 'B', 'def');
   ```

4. Проверьте таблицу:

   ```sql
   SELECT *
   FROM db1.table1
   ```

   ```response
   Query id: 475015cc-6f51-4b20-bda2-3c9c41404e49

   ┌─id─┬─column1─┬─column2─┐
   │  1 │ A       │ abc     │
   │  2 │ A       │ def     │
   │  3 │ B       │ abc     │
   │  4 │ B       │ def     │
   └────┴─────────┴─────────┘
   ```

5. Создайте обычного пользователя, который будет использоваться для демонстрации ограничения доступа к определенным колонкам:

   ```sql
   CREATE USER column_user IDENTIFIED BY 'password';
   ```

6. Создайте обычного пользователя, который будет использоваться для демонстрации ограничения доступа к строкам с определенными значениями:
   ```sql
   CREATE USER row_user IDENTIFIED BY 'password';
   ```

#### Создание ролей {#creating-roles}

С этим набором примеров:

- будут созданы роли для различных полномочий, таких как колонки и строки
- полномочия будут предоставлены ролям
- пользователи будут назначены каждой роли

Роли используются для определения групп пользователей для определенных полномочий вместо управления каждым пользователем отдельно.

1.  Создайте роль, чтобы ограничить пользователей этой роли только просмотром `column1` в базе данных `db1` и `table1`:

    ```sql
    CREATE ROLE column1_users;
    ```

2.  Установите полномочия для разрешения просмотра `column1`

    ```sql
    GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
    ```

3.  Добавьте пользователя `column_user` в роль `column1_users`

    ```sql
    GRANT column1_users TO column_user;
    ```

4.  Создайте роль, чтобы ограничить пользователей этой роли только просмотром выбранных строк, в данном случае, только строк, содержащих `A` в `column1`

    ```sql
    CREATE ROLE A_rows_users;
    ```

5.  Добавьте `row_user` в роль `A_rows_users`

    ```sql
    GRANT A_rows_users TO row_user;
    ```

6.  Создайте политику для разрешения просмотра только тех строк, где `column1` имеет значение `A`

    ```sql
    CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
    ```

7.  Установите полномочия для базы данных и таблицы

    ```sql
    GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
    ```

8.  предоставьте явные разрешения для других ролей, чтобы они все еще имели доступ ко всем строкам

    ```sql
    CREATE ROW POLICY allow_other_users_filter 
    ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
    ```

    :::note
    Когда политика прикрепляется к таблице, система применяет эту политику, и только те пользователи и роли, которые определены, смогут выполнять операции с таблицей, всем остальным будет отказано в любых операциях. Чтобы у других пользователей не применялась ограничительная политика строк, необходимо определить другую политику, которая позволит другим пользователям и ролям иметь обычный или другие типы доступа.
    :::

## Проверка {#verification}

### Проверка полномочий роли с пользователем, ограниченным по колонкам {#testing-role-privileges-with-column-restricted-user}

1. Войдите в клиент ClickHouse как пользователь `clickhouse_admin`

   ```bash
   clickhouse-client --user clickhouse_admin --password password
   ```

2. Проверьте доступ к базе данных, таблице и всем строкам с помощью учетной записи администратора.

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

3. Войдите в клиент ClickHouse как пользователь `column_user`

   ```bash
   clickhouse-client --user column_user --password password
   ```

4. Проверьте `SELECT`, используя все колонки

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
   Доступ отклонен, так как были указаны все колонки, а у пользователя есть доступ только к `id` и `column1`
   :::

5. Проверьте запрос `SELECT` с указанными и разрешенными колонками:

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

### Проверка полномочий роли с пользователем, ограниченным по строкам {#testing-role-privileges-with-row-restricted-user}

1. Войдите в клиент ClickHouse как `row_user`

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
   Убедитесь, что возвращены только вышеуказанные две строки, строки со значением `B` в `column1` должны быть исключены.
   :::

## Изменение пользователей и ролей {#modifying-users-and-roles}

Пользователи могут быть назначены нескольким ролям для комбинирования необходимых полномочий. При использовании нескольких ролей система объединяет роли для определения полномочий, и чистый эффект будет заключаться в том, что разрешения ролей будут кумулятивными.

Например, если одна `role1` разрешает только выбор из `column1`, а `role2` разрешает выбор из `column1` и `column2`, то у пользователя будет доступ ко обеим колонкам.

1. Используя учетную запись администратора, создайте нового пользователя, чтобы ограничить как по строкам, так и по колонкам с назначенными по умолчанию ролями

   ```sql
   CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
   ```

2. Удалите предыдущие полномочия для роли `A_rows_users`

   ```sql
   REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
   ```

3. Разрешите роли `A_row_users` выбирать только из `column1`

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
   ```

4. Войдите в клиент ClickHouse как `row_and_column_user`

   ```bash
   clickhouse-client --user row_and_column_user --password password;
   ```

5. Проверьте с использованием всех колонок:

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

6. Проверьте с ограниченными разрешенными колонками:

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

Существуют случаи, когда полномочия пересекаются или комбинируются, чтобы получить неожиданные результаты. Следующие команды можно использовать для уточнения проблемы с учетной записью администратора.

### Перечень предоставленных полномочий и ролей для пользователя {#listing-the-grants-and-roles-for-a-user}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### Перечень ролей в ClickHouse {#list-roles-in-clickhouse}

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

### Просмотр того, как была определена политика и текущие полномочия {#view-how-a-policy-was-defined-and-current-privileges}

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Примеры команд для управления ролями, политиками и пользователями {#example-commands-to-manage-roles-policies-and-users}

Следующие команды можно использовать для:

- удаления полномочий
- удаления политик
- исключения пользователей из ролей
- удаления пользователей и ролей
  <br />

:::tip
Запускайте эти команды как администратор или пользователь `default`
:::

### Удаление полномочия из роли {#remove-privilege-from-a-role}

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

В этой статье продемонстрированы основы создания SQL пользователей и ролей, а также предоставлены шаги для установки и изменения полномочий пользователей и ролей. Для получения более подробной информации о каждом из них, пожалуйста, обратитесь к нашим пользовательским руководствам и справочной документации.
