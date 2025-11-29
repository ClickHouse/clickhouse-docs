## Проверьте права администратора {#test-admin-privileges}

Выйдите из системы пользователем `default` и войдите снова под пользователем `clickhouse_admin`.

Все перечисленные ниже действия должны выполняться успешно:

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


## Пользователи без прав администратора {#non-admin-users}

Пользователи должны обладать только необходимыми привилегиями, и не все должны быть администраторами. В остальной части документа приведены примеры сценариев и требуемые роли.

### Подготовка {#preparation}

Создайте таблицы и пользователей для использования в примерах.

#### Создание тестовой базы данных, таблицы и строк {#creating-a-sample-database-table-and-rows}

<VerticalStepper headerLevel="h5">

##### Создайте тестовую базу данных {#create-a-test-database}

```sql
CREATE DATABASE db1;
```

##### Создайте таблицу {#create-a-table}

```sql
CREATE TABLE db1.table1 (
   id UInt64,
   column1 String,
   column2 String
)
ENGINE MergeTree
ORDER BY id;
```

##### Заполните таблицу тестовыми строками {#populate}

```sql
INSERT INTO db1.table1
   (id, column1, column2)
VALUES
   (1, 'A', 'abc'),
   (2, 'A', 'def'),
   (3, 'B', 'abc'),
   (4, 'B', 'def');
```

##### Проверьте таблицу {#verify}

```sql title="Запрос"
SELECT *
FROM db1.table1
```

```response title="Ответ"
Query id: 475015cc-6f51-4b20-bda2-3c9c41404e49

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
│  3 │ B       │ abc     │
│  4 │ B       │ def     │
└────┴─────────┴─────────┘
```

##### Создайте пользователя `column_user` {#create-a-user-with-restricted-access-to-columns}

Создайте обычного пользователя для демонстрации ограничения доступа к определённым столбцам:

```sql
CREATE USER column_user IDENTIFIED BY 'password';
```

##### Создайте пользователя `row_user` {#create-a-user-with-restricted-access-to-rows-with-certain-values}

Создайте обычного пользователя для демонстрации ограничения доступа к строкам с определёнными значениями:

```sql
CREATE USER row_user IDENTIFIED BY 'password';
```

</VerticalStepper>

#### Создание ролей {#creating-roles}

В этом наборе примеров:

- будут созданы роли для различных привилегий, таких как доступ к столбцам и строкам
- привилегии будут предоставлены ролям
- пользователи будут назначены каждой роли

Роли используются для определения групп пользователей с определёнными привилегиями вместо управления каждым пользователем по отдельности.

<VerticalStepper headerLevel="h5">

##### Создайте роль для ограничения пользователей этой роли просмотром только `column1` в базе данных `db1` и таблице `table1`: {#create-column-role}

    ```sql
    CREATE ROLE column1_users;
    ```

##### Установите привилегии для разрешения просмотра `column1` {#set-column-privileges}

    ```sql
    GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
    ```

##### Добавьте пользователя `column_user` в роль `column1_users` {#add-column-user-to-role}

    ```sql
    GRANT column1_users TO column_user;
    ```

##### Создайте роль для ограничения пользователей этой роли просмотром только выбранных строк, в данном случае только строк, содержащих `A` в `column1` {#create-row-role}

    ```sql
    CREATE ROLE A_rows_users;
    ```

##### Добавьте пользователя `row_user` в роль `A_rows_users` {#add-row-user-to-role}

    ```sql
    GRANT A_rows_users TO row_user;
    ```

##### Создайте политику для разрешения просмотра только строк, где `column1` имеет значение `A` {#create-row-policy}

    ```sql
    CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
    ```

##### Установите привилегии для базы данных и таблицы {#set-db-table-privileges}

    ```sql
    GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
    ```

##### Предоставьте явные разрешения другим ролям для сохранения доступа ко всем строкам {#grant-other-roles-access}

    ```sql
    CREATE ROW POLICY allow_other_users_filter
    ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
    ```


    :::note
    При привязке политики к таблице система применит её, и только указанные в ней пользователи и роли смогут выполнять операции с таблицей — всем остальным будет запрещён любой доступ. Чтобы ограничительная политика строк не распространялась на других пользователей, необходимо определить дополнительную политику, предоставляющую им стандартный или иной тип доступа.
    :::

</VerticalStepper>


## Проверка {#verification}

### Тестирование привилегий роли с пользователем, ограниченным по столбцам {#testing-role-privileges-with-column-restricted-user}

<VerticalStepper headerLevel="h5">

##### Войдите в клиент ClickHouse, используя пользователя `clickhouse_admin` {#login-admin-user}

   ```bash
   clickhouse-client --user clickhouse_admin --password password
   ```

##### Проверьте доступ к базе данных, таблице и всем строкам от имени пользователя-администратора. {#verify-admin-access}

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

##### Войдите в клиент ClickHouse, используя пользователя `column_user` {#login-column-user}

   ```bash
   clickhouse-client --user column_user --password password
   ```

##### Проверьте выполнение запроса `SELECT` с использованием всех столбцов {#test-select-all-columns}

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
   Доступ запрещён, так как были указаны все столбцы, а у пользователя есть доступ только к `id` и `column1`.
   :::

##### Проверьте запрос `SELECT` только с явно указанными разрешёнными столбцами: {#verify-allowed-columns}

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

</VerticalStepper>

### Тестирование привилегий роли с пользователем, ограниченным по строкам {#testing-role-privileges-with-row-restricted-user}

<VerticalStepper headerLevel="h5">

##### Войдите в клиент ClickHouse, используя пользователя `row_user` {#login-row-user}

   ```bash
   clickhouse-client --user row_user --password password
   ```

##### Просмотрите доступные строки {#view-available-rows}

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
   Убедитесь, что возвращаются только две строки, показанные выше; строки со значением `B` в `column1` должны быть исключены.
   :::

</VerticalStepper>



## Изменение пользователей и ролей {#modifying-users-and-roles}

Пользователю можно назначить несколько ролей для получения нужной комбинации привилегий. При использовании нескольких ролей система объединяет их при определении привилегий, в результате права, предоставляемые ролями, будут суммироваться.

Например, если одна роль `role1` разрешает выполнять `SELECT` только по `column1`, а `role2` разрешает `SELECT` по `column1` и `column2`, пользователь будет иметь доступ к обоим столбцам.

<VerticalStepper headerLevel="h5">

##### Используя учетную запись администратора, создайте нового пользователя с ограничением и по строкам, и по столбцам, с ролями по умолчанию {#create-restricted-user}

   ```sql
   CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
   ```

##### Удалите ранее выданные привилегии для роли `A_rows_users` {#remove-prior-privileges}

   ```sql
   REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
   ```

##### Разрешите роли `A_row_users` выполнять выборку только из `column1` {#allow-column1-select}

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
   ```

##### Войдите в клиент ClickHouse, используя пользователя `row_and_column_user` {#login-restricted-user}

   ```bash
   clickhouse-client --user row_and_column_user --password password;
   ```

##### Проверьте выборку всех столбцов: {#test-all-columns-restricted}

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

##### Проверьте с ограниченным набором разрешенных столбцов: {#test-limited-columns}

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
</VerticalStepper>



## Устранение неполадок {#troubleshooting}

Иногда привилегии пересекаются или комбинируются, что приводит к неожиданным результатам. Следующие команды можно использовать для уточнения причины проблемы при работе под учетной записью администратора.

### Просмотр назначенных пользователю прав и ролей {#listing-the-grants-and-roles-for-a-user}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### Просмотреть роли в ClickHouse {#list-roles-in-clickhouse}

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

### Просмотр политик {#display-the-policies}

```sql
SHOW ROW POLICIES
```

```response
Идентификатор запроса: f2c636e9-f955-4d79-8e80-af40ea227ebc

┌─name───────────────────────────────────┐
│ A_row_filter ON db1.table1             │
│ allow_other_users_filter ON db1.table1 │
└────────────────────────────────────────┘
```

### Просмотр определения политики и её текущих привилегий {#view-how-a-policy-was-defined-and-current-privileges}

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

Следующие команды можно использовать, чтобы:

* удалить привилегии
* удалить политики
* открепить пользователей от ролей
* удалить пользователей и роли
  <br />

:::tip
Выполняйте эти команды от имени администратора или пользователя `default`
:::

### Удалить привилегию у роли {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### Удаление политики {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### Отменить назначение роли пользователю {#unassign-a-user-from-a-role}

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


## Итоги {#summary}

В этой статье были рассмотрены основы создания SQL-пользователей и ролей, а также приведены шаги по назначению и изменению привилегий для пользователей и ролей. Для получения более подробной информации по каждой теме обратитесь к нашим руководствам для пользователей и справочной документации.
