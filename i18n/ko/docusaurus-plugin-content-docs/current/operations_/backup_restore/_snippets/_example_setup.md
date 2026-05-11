이 예제에서 백업과 복원을 수행할 테스트 데이터베이스와 테이블을 생성하려면
아래 명령을 실행하십시오:

<details>
<summary>설정 명령어</summary>

데이터베이스와 테이블을 생성하십시오:

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

무작위 데이터 1,000행을 미리 생성하여 삽입합니다:

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

다음으로 아래 경로에 백업 대상 위치를 지정하는 파일을 생성해야 합니다:

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <backups>
                <type>local</type>
                <path>/backups/</path> -- MacOS에서는 /Users/backups/ 를 사용하십시오
            </backups>
        </disks>
    </storage_configuration>
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path> -- MacOS에서는 /Users/backups/ 를 사용하십시오
    </backups>
</clickhouse>
```

:::note
clickhouse-server가 실행 중이면 변경 사항이 반영되도록 재시작해야 합니다.
:::

</details>