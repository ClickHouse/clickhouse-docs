---
'sidebar_label': '일반적인 MariaDB'
'description': 'ClickPipes용으로 모든 MariaDB 인스턴스를 소스로 설정합니다.'
'slug': '/integrations/clickpipes/mysql/source/generic_maria'
'title': '일반적인 MariaDB 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'generic mariadb'
- 'clickpipes'
- 'binary logging'
- 'ssl tls'
- 'self hosted'
---


# 일반 MariaDB 소스 설정 가이드

:::info

지원되는 공급자 중 하나를 사용하는 경우(사이드바에 있음), 해당 공급자에 대한 특정 가이드를 참조하십시오.

:::

## 바이너리 로그 보존 활성화 {#enable-binlog-retention}

바이너리 로그에는 MariaDB 서버 인스턴스에서 수행된 데이터 수정에 대한 정보가 포함되어 있으며, 복제에 필요합니다.

MariaDB 인스턴스에서 바이너리 로그를 활성화하려면 다음 설정이 구성되어 있는지 확인하십시오:

```sql
server_id = 1               -- or greater; anything but 0
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  -- introduced in 10.5.0
expire_logs_days = 1        -- or higher; 0 would mean logs are preserved forever
```

이 설정을 확인하려면 다음 SQL 명령을 실행하십시오:
```sql
SHOW VARIABLES LIKE 'server_id';
SHOW VARIABLES LIKE 'log_bin';
SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'binlog_row_image';
SHOW VARIABLES LIKE 'binlog_row_metadata';
SHOW VARIABLES LIKE 'expire_logs_days';
```

값이 일치하지 않으면 구성 파일(일반적으로 `/etc/my.cnf` 또는 `/etc/my.cnf.d/mariadb-server.cnf`)에서 설정할 수 있습니다:
```ini
[mysqld]
server_id = 1
log_bin = ON
binlog_format = ROW
binlog_row_image = FULL
binlog_row_metadata = FULL  ; only in 10.5.0 and newer
expire_logs_days = 1
```

소스 데이터베이스가 복제본인 경우 `log_slave_updates`도 활성화해야 합니다.

변경 사항이 적용되도록 하려면 MariaDB 인스턴스를 반드시 재시작해야 합니다.

:::note

MariaDB \<= 10.4에서는 `binlog_row_metadata` 설정이 도입되지 않았기 때문에 컬럼 제외가 지원되지 않습니다.

:::

## 데이터베이스 사용자 구성 {#configure-database-user}

루트 사용자로 MariaDB 인스턴스에 연결하고 다음 명령을 실행하십시오:

1. ClickPipes를 위한 전용 사용자 생성:

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some_secure_password';
```

2. 스키마 권한 부여. 다음 예는 `clickpipes` 데이터베이스의 권한을 보여줍니다. 복제하려는 각 데이터베이스 및 호스트에 대해 이 명령을 반복하십시오:

```sql
GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'%';
```

3. 사용자에게 복제 권한 부여:

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

:::note

`clickpipes_user` 및 `some_secure_password`를 원하는 사용자 이름 및 비밀번호로 변경했는지 확인하십시오.

:::

## SSL/TLS 구성 (권장) {#ssl-tls-configuration}

SSL 인증서는 MariaDB 데이터베이스에 대한 보안 연결을 보장합니다. 구성은 인증서 유형에 따라 다릅니다:

**신뢰할 수 있는 인증 기관(DigiCert, Let's Encrypt 등)** - 추가 구성 필요없음.

**내부 인증 기관** - IT 팀으로부터 루트 CA 인증서 파일을 얻으십시오. ClickPipes UI에서 새로운 MariaDB ClickPipe를 생성할 때 업로드합니다.

**자체 호스팅된 MariaDB** - MariaDB 서버에서 CA 인증서를 복사합니다(`my.cnf`의 `ssl_ca` 설정을 통해 경로를 확인하십시오). ClickPipes UI에서 새로운 MariaDB ClickPipe를 생성할 때 업로드합니다. 서버의 IP 주소를 호스트로 사용하십시오.

**11.4 이상 자체 호스팅된 MariaDB** - 서버에 `ssl_ca`가 설정되어 있으면 위의 옵션을 따르십시오. 그렇지 않을 경우, IT 팀에 적절한 인증서를 배포하도록 상담하십시오. 마지막 수단으로 ClickPipes UI에서 "인증서 검증 건너뛰기" 토글을 사용할 수 있지만(보안상의 이유로 권장되지 않음) 참고하십시오.

SSL/TLS 옵션에 대한 더 많은 정보는 [FAQ](https://clickhouse.com/docs/integrations/clickpipes/mysql/faq#tls-certificate-validation-error)를 확인하십시오.

## 다음 단계는 무엇입니까? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 MariaDB 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다. MariaDB 인스턴스를 설정하는 동안 사용한 연결 세부정보를 기록해 두는 것을 잊지 마십시오. ClickPipe 생성 과정에서 필요할 것입니다.
