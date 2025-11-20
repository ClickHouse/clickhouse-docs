---
'description': 'ClickHouse에서 PostgreSQL 와이어 프로토콜 인터페이스에 대한 문서'
'sidebar_label': 'PostgreSQL 인터페이스'
'sidebar_position': 20
'slug': '/interfaces/postgresql'
'title': 'PostgreSQL 인터페이스'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# PostgreSQL 인터페이스

<CloudNotSupportedBadge/>

ClickHouse는 PostgreSQL 와이어 프로토콜을 지원하여 Postgres 클라이언트를 사용하여 ClickHouse에 연결할 수 있습니다. 어떤 면에서는 ClickHouse가 PostgreSQL 인스턴스인 것처럼 가장할 수 있으며, 이를 통해 ClickHouse에 직접적으로 지원되지 않는 PostgreSQL 클라이언트 애플리케이션(예: Amazon Redshift)을 연결할 수 있습니다.

PostgreSQL 와이어 프로토콜을 활성화하려면 서버의 구성 파일에 [postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port) 설정을 추가하십시오. 예를 들어, `config.d` 폴더의 새 XML 파일에 포트를 정의할 수 있습니다:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

ClickHouse 서버를 시작하고 **Listening for PostgreSQL compatibility protocol**라는 로그 메시지를 찾으십시오:

```response
{} <Information> Application: Listening for PostgreSQL compatibility protocol: 127.0.0.1:9005
```

## psql을 ClickHouse에 연결하기 {#connect-psql-to-clickhouse}

다음 명령은 PostgreSQL 클라이언트 `psql`을 ClickHouse에 연결하는 방법을 보여줍니다:

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

예를 들어:

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql` 클라이언트는 비밀번호로 로그인해야 하므로 비밀번호가 없는 `default` 사용자로는 연결할 수 없습니다. `default` 사용자에게 비밀번호를 부여하거나 다른 사용자로 로그인하십시오.
:::

`psql` 클라이언트는 비밀번호를 입력하라는 메시지를 표시합니다:

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

그게 다입니다! 이제 PostgreSQL 클라이언트가 ClickHouse에 연결되었으며 모든 명령과 쿼리는 ClickHouse에서 실행됩니다.

:::note
현재 PostgreSQL 프로토콜은 평문 비밀번호만 지원합니다.
:::

## SSL 사용하기 {#using-ssl}

ClickHouse 인스턴스에 SSL/TLS가 구성되어 있다면, `postgresql_port`는 동일한 설정을 사용할 것입니다(포트는 안전한 클라이언트와 안전하지 않은 클라이언트 모두에게 공유됩니다).

각 클라이언트는 SSL을 사용하여 연결하는 방법이 다릅니다. 다음 명령은 인증서와 키를 전달하여 `psql`을 ClickHouse에 안전하게 연결하는 방법을 보여줍니다:

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## SCRAM-SHA-256으로 ClickHouse 사용자 인증 구성하기 {#using-scram-sha256}

ClickHouse에서 안전한 사용자 인증을 보장하기 위해 SCRAM-SHA-256 프로토콜을 사용하는 것이 권장됩니다. 사용자 구성은 users.xml 파일에서 `password_scram_sha256_hex` 요소를 지정하여 수행됩니다. 비밀번호 해시는 num_iterations=4096으로 생성되어야 합니다.

psql 클라이언트가 연결할 때 SCRAM-SHA-256을 지원하고 협상하는지 확인하십시오.

비밀번호 `abacaba`를 가진 사용자 `user_with_sha256`의 예제 구성:

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

자세한 SSL 설정은 [PostgreSQL 문서](https://jdbc.postgresql.org/documentation/head/ssl-client.html)를 참조하십시오.
