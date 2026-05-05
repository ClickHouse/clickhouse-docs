---
sidebar_label: '범용 MariaDB'
description: '어떤 MariaDB 인스턴스든 ClickPipes 소스로 설정합니다'
slug: /integrations/clickpipes/mysql/source/generic_maria
title: '범용 MariaDB 소스 설정 가이드'
doc_type: 'guide'
keywords: ['generic mariadb', 'clickpipes', '바이너리 로깅', 'ssl tls', '셀프 호스팅']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

# 일반적인 MariaDB 소스 설정 가이드 \{#generic-mariadb-source-setup-guide\}

:::info

사이드바에 나열된 지원 프로바이더를 사용하는 경우, 해당 프로바이더에 대한 별도 가이드를 참고하십시오.

:::

## 바이너리 로그 보존 활성화 \{#enable-binlog-retention\}

바이너리 로그에는 MariaDB 서버 인스턴스에서 수행된 데이터 변경 정보가 포함되며, 복제를 위해 필요합니다.

MariaDB 인스턴스에서 바이너리 로깅을 활성화하려면 다음 설정이 적용되어 있는지 확인하십시오:

```sql
server_id = 1               -- or greater; anything but 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- introduced in 10.5.0
expire_logs_days = 1        -- or higher; 0 would mean logs are preserved forever
```

이러한 설정을 확인하려면 다음 SQL 명령을 실행하십시오:

```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

값이 일치하지 않으면 설정 파일(일반적으로 `/etc/my.cnf` 또는 `/etc/my.cnf.d/mariadb-server.cnf`)에서 값을 설정할 수 있습니다:

```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

소스 데이터베이스가 레플리카라면 `log_slave_updates`도 활성화해야 합니다.

변경 사항이 적용되도록 MariaDB 인스턴스를 반드시 다시 시작해야 합니다.

:::note

`binlog_row_metadata` 설정이 아직 도입되지 않았으므로 MariaDB &lt;= 10.4에서는 컬럼 제외가 지원되지 않습니다.

:::


## 데이터베이스 사용자 구성 \{#configure-database-user\}

root 사용자로 MariaDB 인스턴스에 접속한 다음 다음 명령을 실행합니다.

1. ClickPipes 전용 사용자를 생성합니다.

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
    ```

2. 스키마 권한을 부여합니다. 다음 예시는 `clickpipes` 데이터베이스에 대한 권한을 보여 줍니다. 복제하려는 각 데이터베이스와 호스트에 대해 이 명령을 반복합니다.

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
    ```

3. 사용자에게 복제(replication) 권한을 부여합니다.

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

:::note

`clickpipes_user`와 `some_secure_password`를 원하는 사용자 이름과 비밀번호로 변경해야 합니다.

:::

## SSL/TLS 구성(권장) \{#ssl-tls-configuration\}

SSL 인증서는 MariaDB 데이터베이스에 대한 연결을 안전하게 보호합니다. 구성은 사용하는 인증서 유형에 따라 달라집니다.

**신뢰할 수 있는 인증 기관(DigiCert, Let's Encrypt 등)** - 추가 구성은 필요하지 않습니다.

**내부 인증 기관** - IT 팀에서 루트 CA 인증서 파일을 제공합니다. ClickPipes UI에서 새 MariaDB ClickPipe를 생성할 때 이 파일을 업로드합니다.

**자가 호스팅된 MariaDB** - MariaDB 서버에서 CA 인증서를 복사합니다(`my.cnf`의 `ssl_ca` 설정에 지정된 경로를 확인하십시오). ClickPipes UI에서 새 MariaDB ClickPipe를 생성할 때 이 인증서를 업로드합니다. 호스트에는 서버의 IP 주소를 사용합니다.

**MariaDB 11.4 이상 자가 호스팅 환경** - 서버에 `ssl_ca`가 설정되어 있으면 위 옵션을 따릅니다. 그렇지 않으면 IT 팀과 상의하여 적절한 인증서를 발급받으십시오. 최후의 수단으로, ClickPipes UI에서 「Skip Certificate Verification」 토글을 사용할 수 있습니다(보안상 권장되지 않습니다).

SSL/TLS 옵션에 대한 자세한 내용은 [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)를 확인하십시오.

## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하고 MariaDB 인스턴스의 데이터를 ClickHouse Cloud로 수집하기 시작할 수 있습니다.
MariaDB 인스턴스를 설정할 때 사용한 연결 정보를 반드시 기록해 두십시오. ClickPipe를 생성하는 과정에서 이 정보가 필요합니다.