---
'sidebar_label': '일반적인 Postgres'
'description': 'ClickPipes의 소스로 사용할 수 있도록 모든 Postgres 인스턴스를 설정하십시오.'
'slug': '/integrations/clickpipes/postgres/source/generic'
'title': '일반적인 Postgres 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'postgres'
- 'clickpipes'
- 'logical replication'
- 'pg_hba.conf'
- 'wal level'
---


# 일반적인 Postgres 소스 설정 가이드

:::info

지원되는 제공업체 중 하나를 사용하는 경우 (사이드바에 있음), 해당 제공업체에 대한 특정 가이드를 참조하시기 바랍니다.

:::

ClickPipes는 Postgres 버전 12 이상을 지원합니다.

## 논리 복제 활성화 {#enable-logical-replication}

1. Postgres 인스턴스에서 복제를 활성화하려면, 다음 설정이 적용되었는지 확인해야 합니다:

```sql
wal_level = logical
```
   이를 확인하려면, 다음 SQL 명령어를 실행할 수 있습니다:
```sql
SHOW wal_level;
```

   출력은 `logical`이어야 합니다. 그렇지 않으면, 다음을 실행하십시오:
```sql
ALTER SYSTEM SET wal_level = logical;
```

2. 또한, Postgres 인스턴스에서 설정하는 것이 권장되는 다음 설정이 있습니다:
```sql
max_wal_senders > 1
max_replication_slots >= 4
```
   이를 확인하려면, 다음 SQL 명령어를 실행할 수 있습니다:
```sql
SHOW max_wal_senders;
SHOW max_replication_slots;
```

   값이 권장 값과 일치하지 않는 경우, 다음 SQL 명령어를 실행하여 설정할 수 있습니다:
```sql
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET max_replication_slots = 10;
```
3. 위에서 언급한 대로 구성에 변경을 가했다면, 변경 사항이 적용되도록 Postgres 인스턴스를 반드시 재시작해야 합니다.

## 권한 및 게시물을 가진 사용자 생성 {#creating-a-user-with-permissions-and-publication}

CDC에 적합한 필요한 권한으로 ClickPipes용 새 사용자를 생성하고, 복제를 위해 사용할 게시물도 생성해 보겠습니다.

이를 위해, Postgres 인스턴스에 연결하고 다음 SQL 명령어를 실행할 수 있습니다:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the pipe
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```
:::note

`clickpipes_user` 및 `clickpipes_password`를 원하는 사용자 이름 및 비밀번호로 교체하는 것을 잊지 마십시오.

:::

## ClickPipes 사용자에 대한 pg_hba.conf의 연결 활성화 {#enabling-connections-in-pg_hbaconf-to-the-clickpipes-user}

자체 서비스를 제공하는 경우, ClickPipes IP 주소에서 ClickPipes 사용자로의 연결을 허용해야 합니다. 다음 단계를 따르십시오. 관리되는 서비스를 사용하는 경우, 제공업체의 문서를 따라 같은 작업을 수행할 수 있습니다.

1. ClickPipes IP 주소에서 ClickPipes 사용자로의 연결을 허용하기 위해 `pg_hba.conf` 파일에 필요한 변경을 합니다. `pg_hba.conf` 파일의 예제 항목은 다음과 같습니다:
```response
host    all   clickpipes_user     0.0.0.0/0          scram-sha-256
```

2. 변경 사항이 적용되도록 PostgreSQL 인스턴스를 다시 로드합니다:
```sql
SELECT pg_reload_conf();
```

## `max_slot_wal_keep_size` 증가 {#increase-max_slot_wal_keep_size}

이것은 대규모 트랜잭션/커밋이 복제 슬롯이 삭제되는 것을 방지하기 위한 권장 구성 변경입니다.

PostgreSQL 인스턴스의 `max_slot_wal_keep_size` 매개변수를 더 높은 값 (최소 100GB 또는 `102400`)으로 증가시킬 수 있습니다. `postgresql.conf` 파일을 업데이트하여 설정할 수 있습니다.

```sql
max_slot_wal_keep_size = 102400
```

변경 사항이 적용되도록 Postgres 인스턴스를 다시 로드할 수 있습니다:
```sql
SELECT pg_reload_conf();
```

:::note

이 값에 대한 더 나은 권장 사항이 필요하면 ClickPipes 팀에 문의하십시오.

:::

## 다음 단계는 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 Postgres 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다. Postgres 인스턴스를 설정하는 동안 사용한 연결 세부 정보를 메모해 두는 것을 잊지 마십시오. ClickPipe 생성 과정에서 필요할 것입니다.
