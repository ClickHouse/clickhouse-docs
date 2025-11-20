この例でバックアップおよびリストアを行うテスト用データベースとテーブルを作成するために、次のコマンドを実行します。

<details>
<summary>セットアップ用コマンド</summary>

データベースとテーブルを作成します:

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

前処理として、ランダムな 1,000 行のデータを挿入します:

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

次に、バックアップ先を指定するファイルを、以下のパスに作成します:

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <backups>
                <type>local</type>
                <path>/backups/</path> -- MacOS の場合は /Users/backups/ を使用
            </backups>
        </disks>
    </storage_configuration>
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path> -- MacOS の場合は /Users/backups/ を使用
    </backups>
</clickhouse>
```

:::note
clickhouse-server が起動中の場合は、変更を反映させるために再起動が必要です。
:::

</details>