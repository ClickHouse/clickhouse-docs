---
'sidebar_label': '제너릭 MySQL'
'description': 'ClickPipes의 소스로 MySQL 인스턴스를 설정합니다.'
'slug': '/integrations/clickpipes/mysql/source/generic'
'title': '제너릭 MySQL 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'generic mysql'
- 'clickpipes'
- 'binary logging'
- 'ssl tls'
- 'mysql 8.x'
---


# 일반 MySQL 소스 설정 가이드

:::info

지원되는 제공업체 중 하나를 사용하는 경우(사이드바 참조), 해당 제공업체에 대한 특정 가이드를 참조하십시오.

:::

## 바이너리 로그 보존 활성화 {#enable-binlog-retention}

바이너리 로그는 MySQL 서버 인스턴스에서 수행된 데이터 수정에 대한 정보를 포함하며 복제에 필요합니다.

### MySQL 8.x 및 최신 버전 {#binlog-v8-x}

MySQL 인스턴스에서 바이너리 로깅을 활성화하려면 다음 설정이 구성되어 있는지 확인하십시오:

```sql
log_bin = ON                        -- default value
binlog_format = ROW                 -- default value
binlog_row_image = FULL             -- default value
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 day or higher; default is 30 days
```

이 설정을 확인하려면 다음 SQL 명령을 실행하십시오:
```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

값이 일치하지 않으면 다음 SQL 명령을 실행하여 설정할 수 있습니다:
```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

`log_bin` 설정을 변경한 경우, 변경 사항이 적용되도록 MySQL 인스턴스를 RESTART해야 합니다.

설정을 변경한 후에는 [데이터베이스 사용자 구성](#configure-database-user)으로 계속 진행하십시오.

### MySQL 5.7 {#binlog-v5-x}

MySQL 5.7 인스턴스에서 바이너리 로깅을 활성화하려면 다음 설정이 구성되어 있는지 확인하십시오:

```sql
server_id = 1            -- or greater; anything but 0
log_bin = ON
binlog_format = ROW      -- default value
binlog_row_image = FULL  -- default value
expire_logs_days = 1     -- or higher; 0 would mean logs are preserved forever
```

이 설정을 확인하려면 다음 SQL 명령을 실행하십시오:
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

값이 일치하지 않으면 구성 파일(일반적으로 `/etc/my.cnf` 또는 `/etc/mysql/my.cnf`에 위치)에서 설정할 수 있습니다:
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

변경 사항이 적용되도록 MySQL 인스턴스를 RESTART해야 합니다.

:::note

MySQL 5.7에서는 `binlog_row_metadata` 설정이 도입되지 않았기 때문에 컬럼 제외가 지원되지 않습니다.

:::

## 데이터베이스 사용자 구성 {#configure-database-user}

root 사용자로 MySQL 인스턴스에 연결하고 다음 명령을 실행하십시오:

1. ClickPipes를 위한 전용 사용자 생성:

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
```

2. 스키마 권한 부여. 다음 예는 `clickpipes` 데이터베이스에 대한 권한을 보여줍니다. 복제하고자 하는 각 데이터베이스 및 호스트에 대해 이 명령을 반복하십시오:

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
```

3. 사용자에게 복제 권한 부여:

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

:::note

`clickpipes_user`와 `some_secure_password`를 원하는 사용자 이름과 비밀번호로 바꾸는 것을 잊지 마십시오.

:::

## SSL/TLS 구성 (권장) {#ssl-tls-configuration}

SSL 인증서는 MySQL 데이터베이스에 대한 안전한 연결을 보장합니다. 구성은 인증서 유형에 따라 달라집니다:

**신뢰할 수 있는 인증 기관(DigiCert, Let's Encrypt 등)** - 추가 구성 불필요.

**내부 인증 기관** - IT 팀에서 루트 CA 인증서 파일을 받아야 합니다. ClickPipes UI에서 새로운 MySQL ClickPipe를 생성할 때 업로드합니다.

**자체 호스팅 MySQL** - MySQL 서버에서 CA 인증서(일반적으로 `/var/lib/mysql/ca.pem`에 위치)를 복사하여 새로운 MySQL ClickPipe를 생성할 때 UI에서 업로드합니다. 서버의 IP 주소를 호스트로 사용합니다.

**서버 접근 없이 자체 호스팅 MySQL** - 인증서를 IT 팀에 문의하십시오. 최후의 수단으로 ClickPipes UI의 "인증서 검증 건너뛰기" 토글을 사용할 수 있지만(보안상의 이유로 권장하지 않음) 주의가 필요합니다.

SSL/TLS 옵션에 대한 자세한 내용은 우리의 [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)를 참조하십시오.

## 다음 단계는 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 MySQL 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다.
MySQL 인스턴스를 설정하는 동안 사용한 연결 세부 정보를 메모해 두는 것을 잊지 마십시오. ClickPipe 생성 과정에서 필요할 것입니다.
