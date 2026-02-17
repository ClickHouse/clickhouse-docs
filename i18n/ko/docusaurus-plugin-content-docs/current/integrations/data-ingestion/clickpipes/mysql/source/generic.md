---
sidebar_label: '범용 MySQL'
description: '어떤 MySQL 인스턴스든 ClickPipes 소스로 설정합니다'
slug: /integrations/clickpipes/mysql/source/generic
title: '범용 MySQL 소스 설정 가이드'
doc_type: 'guide'
keywords: ['generic mysql', 'clickpipes', 'binary logging', 'ssl tls', 'mysql 8.x']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 일반 MySQL 소스 설정 가이드 \{#generic-mysql-source-setup-guide\}

:::info

사이드바에 나열된 지원 프로바이더를 사용하는 경우, 해당 프로바이더 전용 가이드를 참고하십시오.

:::

## 바이너리 로그 보존 활성화 \{#enable-binlog-retention\}

바이너리 로그에는 MySQL 서버 인스턴스에서 수행된 데이터 변경에 대한 정보가 포함되며, 복제를 위해 필수입니다.

### MySQL 8.x 이상 \{#binlog-v8-x\}

MySQL 인스턴스에서 바이너리 로그를 활성화하려면 다음 설정이 구성되어 있어야 합니다:

```sql
log_bin = ON                        -- default value
binlog_format = ROW                 -- default value
binlog_row_image = FULL             -- default value
binlog_row_metadata = FULL
binlog_expire_logs_seconds = 86400  -- 1 day or higher; default is 30 days
```

해당 설정을 확인하려면 다음 SQL 명령어를 실행하십시오:

```sql
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
```

값이 일치하지 않는 경우 다음 SQL 명령을 실행하여 값을 설정할 수 있습니다:

```sql
SET PERSIST log_bin = ON;
SET PERSIST binlog_format = ROW;
SET PERSIST binlog_row_image = FULL;
SET PERSIST binlog_row_metadata = FULL;
SET PERSIST binlog_expire_logs_seconds = 86400;
```

`log_bin` 설정을 변경한 경우, 변경 사항이 적용되도록 MySQL 인스턴스를 다시 시작해야 합니다.

설정을 변경한 후에는 [데이터베이스 사용자 구성](#configure-database-user)을 계속 진행하십시오.


### MySQL 5.7 \{#binlog-v5-x\}

MySQL 5.7 인스턴스에서 바이너리 로깅을 활성화하려면 다음 설정이 적용되어 있는지 확인하십시오:

```sql
server_id = 1            -- or greater; anything but 0
log_bin = ON
binlog_format = ROW      -- default value
binlog_row_image = FULL  -- default value
expire_logs_days = 1     -- or higher; 0 would mean logs are preserved forever
```

이러한 설정을 확인하려면 다음 SQL 명령을 실행하십시오:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'expire_logs_days';
```

값이 일치하지 않으면 설정 파일(일반적으로 `/etc/my.cnf` 또는 `/etc/mysql/my.cnf`)에서 설정할 수 있습니다:

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
expire_logs_days = 1
```

변경 사항을 적용하려면 MySQL 인스턴스를 반드시 재시작해야 합니다.

:::note

컬럼 제외 및 스키마 변경은 MySQL 5.7 및 그 이전 버전에서는 지원되지 않습니다. 이러한 기능에는 [MySQL 8.0.1](https://dev.mysql.com/blog-archive/more-metadata-is-written-into-binary-log/) 이전의 binlog에는 포함되지 않는 테이블 메타데이터가 필요합니다.

:::


## 데이터베이스 사용자 구성 \{#configure-database-user\}

root 사용자로 MySQL 인스턴스에 연결한 후 다음 명령을 실행합니다:

1. ClickPipes 전용 사용자를 생성합니다:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. 스키마 권한을 부여합니다. 다음 예시는 `clickpipes` 데이터베이스에 대한 권한을 보여줍니다. 복제하려는 각 데이터베이스와 호스트에 대해 이 명령을 반복합니다:

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. 해당 사용자에게 복제(replication) 권한을 부여합니다:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

`clickpipes_user`와 `some_secure_password`를 원하는 사용자 이름과 비밀번호로 변경하여 사용하십시오.

:::

## SSL/TLS 구성(권장) \{#ssl-tls-configuration\}

SSL 인증서는 MySQL 데이터베이스에 대한 보안 연결을 보장합니다. 구성은 인증서 유형에 따라 달라집니다:

**신뢰할 수 있는 인증 기관(DigiCert, Let's Encrypt 등)** - 추가 구성은 필요하지 않습니다.

**내부 인증 기관** - IT 팀으로부터 루트 CA 인증서 파일을 받으십시오. ClickPipes UI에서 새 MySQL ClickPipe를 생성할 때 해당 파일을 업로드합니다.

**자가 호스팅(Self-hosted) MySQL** - MySQL 서버에서 CA 인증서를 복사한 후(일반적으로 `/var/lib/mysql/ca.pem` 경로) 새 MySQL ClickPipe를 생성할 때 UI에 업로드합니다. 호스트에는 서버의 IP 주소를 사용합니다.

**서버에 접근할 수 없는 자가 호스팅(Self-hosted) MySQL** - IT 팀에 인증서를 요청하십시오. 최후의 수단으로, 보안상 권장되지는 않지만 ClickPipes UI의 「Skip Certificate Verification」 토글을 사용할 수 있습니다.

SSL/TLS 옵션에 대한 자세한 내용은 [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)를 참고하십시오.

## 다음 단계는 무엇입니까? \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 MySQL 인스턴스의 데이터를 ClickHouse Cloud로 수집할 수 있습니다.
MySQL 인스턴스를 설정할 때 사용한 연결 정보를 반드시 기록해 두십시오. ClickPipe를 생성하는 과정에서 이 정보가 필요합니다.