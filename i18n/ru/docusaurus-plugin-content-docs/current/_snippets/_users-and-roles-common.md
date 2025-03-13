## Проверка привилегий администратора {#test-admin-privileges}

Выйдите из учетной записи `default` и войдите снова как пользователь `clickhouse_admin`.

Все из этих запросов должны успешно выполниться:

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

## Неадминистраторские пользователи {#non-admin-users}

Пользователи должны иметь необходимые привилегии, а не все должны быть администраторами. Остальная часть этого документа предоставляет примеры сценариев и необходимые роли.

### Подготовка {#preparation}

Создайте эти таблицы и пользователей для примеров.

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

3. Заполните таблицу тестовыми строками

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

5. Создайте обычного пользователя, который будет использован для демонстрации ограниченного доступа к определенным колонкам:

   ```sql
   CREATE USER column_user IDENTIFIED BY 'password';
   ```

6. Создайте обычного пользователя, который будет использован для демонстрации ограничения доступа к строкам с определенными значениями:
   ```sql
   CREATE USER row_user IDENTIFIED BY 'password';
   ```

#### Создание ролей {#creating-roles}

С этим набором примеров:

- будут созданы роли для различных привилегий, таких как колонки и строки
- привилегии будут предоставлены ролям
- пользователи будут назначены каждой роли

Роли используются для определения групп пользователей для определенных привилегий, вместо управления каждой учетной записью отдельно.

1. Создайте роль, чтобы ограничить пользователей этой роли видеть только `column1` в базе данных `db1` и `table1`:

   ```sql
   CREATE ROLE column1_users;
   ```

2. Установите привилегии для разрешения просмотра `column1`

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
   ```

3. Добавьте пользователя `column_user` к роли `column1_users`

   ```sql
   GRANT column1_users TO column_user;
   ```

4. Создайте роль, чтобы ограничить пользователей этой роли видеть только выбранные строки, в данном случае, только строки, содержащие `A` в `column1`

   ```sql
   CREATE ROLE A_rows_users;
   ```

5. Добавьте пользователя `row_user` к роли `A_rows_users`

   ```sql
   GRANT A_rows_users TO row_user;
   ```

6. Создайте политику, чтобы разрешить просмотр только там, где `column1` имеет значение `A`

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
   При прикреплении политики к таблице, система применит эту политику, и только те пользователи и роли, которые определены, смогут выполнять операции с таблицей, всем остальным будет отказано в каких-либо операциях. Чтобы не применять ограничительную политику строки к другим пользователям, должна быть определена другая политика, чтобы разрешить другим пользователям и ролям иметь обычный или другой тип доступа.
   :::

## Проверка {#verification}

### Проверка привилегий ролей с пользователем с ограничениями по колонкам {#testing-role-privileges-with-column-restricted-user}

1. Войдите в клиент ClickHouse с использованием пользователя `clickhouse_admin`

   ```bash
   clickhouse-client --user clickhouse_admin --password password
   ```

2. Проверьте доступ к базе данных, таблице и всем строкам с администраторским пользователем.

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

3. Войдите в клиент ClickHouse с использованием пользователя `column_user`

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
   Доступ запрещен, так как были указаны все колонки, а у пользователя есть доступ только к `id` и `column1`
   :::

5. Проверьте запрос `SELECT` с указанием только разрешенных колонок:

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

### Проверка привилегий ролей с пользователем с ограничениями по строкам {#testing-role-privileges-with-row-restricted-user}

1. Войдите в клиент ClickHouse, используя `row_user`

   ```bash
   clickhouse-client --user row_user --password password
   ```

2. Посмотреть доступные строки

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
   Убедитесь, что возвращены только указанные выше две строки, строки со значением `B` в `column1` должны быть исключены.
   :::

## Модификация пользователей и ролей {#modifying-users-and-roles}

Пользователям можно назначить несколько ролей для комбинации необходимых привилегий. При использовании нескольких ролей система будет комбинировать роли для определения привилегий, чистый эффект будет заключаться в том, что разрешения ролей будут кумулятивными.

Например, если одна `role1` разрешает только выбор в `column1`, а `role2` разрешает выбор в `column1` и `column2`, то у пользователя будет доступ к обоим колонкам.

1. Используя учетную запись администратора, создайте нового пользователя для ограничения как по строкам, так и по колонкам с по умолчанию назначенными ролями

   ```sql
   CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
   ```

2. Удалите предыдущие привилегии для роли `A_rows_users`

   ```sql
   REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
   ```

3. Разрешите роли `A_row_users` выбирать только из `column1`

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
   ```

4. Войдите в клиент ClickHouse, используя `row_and_column_user`

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

6. Проверьте с использованием ограниченных разрешенных колонок:

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

Иногда привилегии пересекаются или комбинируются, чтобы произвести неожиданные результаты, следующие команды могут быть использованы для уточнения проблемы с использованием учетной записи администратора

### Список привилегий и ролей для пользователя {#listing-the-grants-and-roles-for-a-user}

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

### Просмотр, как была определена политика и текущие привилегии {#view-how-a-policy-was-defined-and-current-privileges}

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

Следующие команды могут использоваться для:

- удаления привилегий
- удаления политик
- отмены назначения пользователей на роли
- удаления пользователей и ролей
  <br />

:::tip
Запускайте эти команды как пользователь администратора или пользователь `default`
:::

### Удаление привилегии из роли {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### Удаление политики {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### Аннулирование назначения пользователя с роли {#unassign-a-user-from-a-role}

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

В этой статье были продемонстрированы основы создания SQL пользователей и ролей, а также представлены шаги по установке и изменению привилегий для пользователей и ролей. Для более подробной информации по каждому пункту, пожалуйста, обратитесь к нашим руководствам пользователей и справочной документации.
