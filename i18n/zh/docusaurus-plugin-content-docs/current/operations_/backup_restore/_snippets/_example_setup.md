运行以下命令来创建本示例中将要进行备份和恢复的测试数据库和数据表：

<details>
<summary>初始化命令</summary>

创建数据库和数据表：

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

预生成一千行随机数据：

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

接下来需要创建一个文件，在下面的路径中指定备份目标位置：

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <backups>
                <type>local</type>
                <path>/backups/</path> -- 对于 MacOS 请选择：/Users/backups/
            </backups>
        </disks>
    </storage_configuration>
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path> -- 对于 MacOS 请选择：/Users/backups/
    </backups>
</clickhouse>
```

:::note
如果 clickhouse-server 正在运行，需要重启服务以使配置生效。
:::

</details>