---
sidebar_label: '일반 Postgres'
description: '임의의 Postgres 인스턴스를 ClickPipes 소스로 설정합니다'
slug: /integrations/clickpipes/postgres/source/generic
title: '일반 Postgres 소스 설정 가이드'
doc_type: 'guide'
keywords: ['postgres', 'clickpipes', 'logical replication', 'pg_hba.conf', 'wal level']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 일반적인 Postgres 소스 설정 가이드 \{#generic-postgres-source-setup-guide\}

:::info

사이드바에 표시된 지원 프로바이더를 사용하는 경우, 해당 프로바이더에 대한 전용 가이드를 참조하십시오.

:::

ClickPipes는 Postgres 버전 12 이상을 지원합니다.

## 논리 복제 활성화 \{#enable-logical-replication\}

1. Postgres 인스턴스에서 복제를 활성화하려면 다음 설정이 지정되어 있는지 확인해야 합니다:

    ```sql
    wal_level = logical
    ```
   이를 확인하려면 다음 SQL 명령을 실행하면 됩니다:
    ```sql
    SHOW wal_level;
    ```

   출력 값은 `logical`이어야 합니다. 그렇지 않은 경우 다음을 실행하십시오:
    ```sql
    ALTER SYSTEM SET wal_level = logical;
    ```

2. 추가로, Postgres 인스턴스에 다음 설정을 지정할 것을 권장합니다:
    ```sql
    max_wal_senders > 1
    max_replication_slots >= 4
    ```
   이를 확인하려면 다음 SQL 명령을 실행하면 됩니다:
    ```sql
    SHOW max_wal_senders;
    SHOW max_replication_slots;
    ```

   값이 권장 값과 일치하지 않는 경우, 다음 SQL 명령을 실행하여 값을 설정할 수 있습니다:
    ```sql
    ALTER SYSTEM SET max_wal_senders = 10;
    ALTER SYSTEM SET max_replication_slots = 10;
    ```
3. 위에서 언급한 구성을 변경한 경우, 변경 사항을 적용하기 위해 반드시 Postgres 인스턴스를 재시작해야 합니다.

## 권한과 publication이 있는 사용자 생성 \{#creating-a-user-with-permissions-and-publication\}

관리자 권한 사용자로 Postgres 인스턴스에 연결한 후 다음 명령을 실행합니다.

1. ClickPipes용 전용 사용자를 생성합니다.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 이전 단계에서 생성한 사용자에게 스키마 수준의 읽기 전용 권한을 부여합니다. 다음 예시는 `public` 스키마에 대한 권한을 보여 줍니다. 복제하려는 테이블이 포함된 각 스키마에 대해 다음 명령을 반복합니다.
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 사용자에게 복제 권한을 부여합니다.

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. 복제하려는 테이블을 포함하는 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 줄이기 위해 publication에는 필요한 테이블만 포함할 것을 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블에는 **기본 키(Primary Key)**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위 지정에 대한 가이드는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참조하십시오.
   :::

   - 특정 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 특정 스키마의 모든 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication에는 지정된 테이블에서 생성된 변경 이벤트 집합이 포함되며, 이후 복제 스트림을 수집하는 데 사용됩니다.

## ClickPipes 사용자에 대한 pg_hba.conf 연결 활성화 \{#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user\}

자체 호스팅 환경인 경우 아래 단계에 따라 ClickPipes IP 주소에서 ClickPipes 사용자로의 연결을 허용해야 합니다. 관리형 서비스를 사용하는 경우에는 서비스 제공자의 문서를 참고하여 동일한 구성을 적용하면 됩니다.

1. `pg_hba.conf` 파일에서 ClickPipes IP 주소에서 ClickPipes 사용자로의 연결을 허용하도록 필요한 설정을 변경합니다. `pg_hba.conf` 파일의 예시 항목은 다음과 같습니다:
    ```response
    host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
    ```

2. 변경 사항이 적용되도록 PostgreSQL 인스턴스를 다시 로드합니다:
    ```sql
    SELECT pg_reload_conf();
    ```

## `max_slot_wal_keep_size` 값 늘리기 \{#increase-max_slot_wal_keep_size\}

대용량 트랜잭션/커밋으로 인해 replication slot이 삭제되지 않도록 하기 위한 권장 설정 변경입니다.

`postgresql.conf` 파일을 업데이트하여 PostgreSQL 인스턴스의 `max_slot_wal_keep_size` 파라미터 값을 더 크게(최소 100GB 또는 `102400`) 설정할 수 있습니다.

```sql
max_slot_wal_keep_size = 102400
```

변경 사항을 적용하려면 Postgres 인스턴스를 다시 로드하면 됩니다:

```sql
SELECT pg_reload_conf();
```

:::note

이 값에 대해 보다 적절한 설정값을 추천받으려면 ClickPipes 팀에 문의하십시오.

:::


## 다음 단계는? \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집하기 시작할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 정보를 반드시 메모해 두십시오. ClickPipe를 생성하는 과정에서 해당 정보가 필요합니다.