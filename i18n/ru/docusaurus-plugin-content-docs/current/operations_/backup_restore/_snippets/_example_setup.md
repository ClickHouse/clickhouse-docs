Запустите следующие команды, чтобы создать тестовую базу данных и таблицу, для которых в этом примере мы будем
создавать резервную копию и выполнять восстановление:

<details>
<summary>Команды для настройки</summary>

Создайте базу данных и таблицу:

```sql
CREATE DATABASE test_db;

CREATE TABLE test_db.test_table (
    id UUID,
    name String,
    email String,
    age UInt8,
    salary UInt32,
    created_at DateTime,
    is_active UInt8,
    department String,
    score Float32,
    country String
) ENGINE = MergeTree()
ORDER BY id;
```

Сгенерируйте одну тысячу строк случайных данных:

```sql
INSERT INTO test_table (id, name, email, age, salary, created_at, is_active, department, score, country)
SELECT
    generateUUIDv4() as id,
    concat('User_', toString(rand() % 10000)) as name,
    concat('user', toString(rand() % 10000), '@example.com') as email,
    18 + (rand() % 65) as age,
    30000 + (rand() % 100000) as salary,
    now() - toIntervalSecond(rand() % 31536000) as created_at,
    rand() % 2 as is_active,
    arrayElement(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'], (rand() % 6) + 1) as department,
    rand() / 4294967295.0 * 100 as score,
    arrayElement(['USA', 'UK', 'Germany', 'France', 'Canada', 'Australia', 'Japan', 'Brazil'], (rand() % 8) + 1) as country
FROM numbers(1000);
```

Далее вам нужно создать файл, указывающий место назначения резервной копии по
следующему пути:

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <backups>
                <type>local</type>
                <path>/backups/</path> -- для MacOS выберите: /Users/backups/
            </backups>
        </disks>
    </storage_configuration>
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path> -- для MacOS выберите: /Users/backups/
    </backups>
</clickhouse>
```

:::note
Если clickhouse-server запущен, вам нужно будет перезапустить его, чтобы изменения
вступили в силу.
:::

</details>