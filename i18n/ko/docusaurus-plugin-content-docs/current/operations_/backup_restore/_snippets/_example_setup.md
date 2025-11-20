다음 명령어를 실행하여 이 예제에서 백업 및 복원을 수행할 테스트 데이터베이스와 테이블을 생성합니다:

<details>
<summary>설정 명령어</summary>

데이터베이스와 테이블 생성:

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

천 행의 임의 데이터를 전처리합니다:

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

다음으로, 아래 경로에 백업 대상을 지정하는 파일을 생성해야 합니다:

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <backups>
                <type>local</type>
                <path>/backups/</path> -- for MacOS choose: /Users/backups/
            </backups>
        </disks>
    </storage_configuration>
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path> -- for MacOS choose: /Users/backups/
    </backups>
</clickhouse>
```

:::note
clickhouse-server가 실행 중인 경우 변경 사항이 적용되도록 재시작해야 합니다.
:::

</details>
