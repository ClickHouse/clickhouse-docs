---
'description': 'ClickHouse에서 MySQL 프로토콜 인터페이스에 대한 문서로, MySQL 클라이언트가 ClickHouse에 연결할
  수 있도록 합니다.'
'sidebar_label': 'MySQL 인터페이스'
'sidebar_position': 25
'slug': '/interfaces/mysql'
'title': 'MySQL 인터페이스'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL 인터페이스

ClickHouse는 MySQL 와이어 프로토콜을 지원합니다. 이를 통해 네이티브 ClickHouse 커넥터가 없는 특정 클라이언트가 대신 MySQL 프로토콜을 활용할 수 있으며, 다음 BI 도구와 함께 검증되었습니다:

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

테스트되지 않은 클라이언트나 통합을 시도하는 경우, 다음과 같은 제한 사항이 있을 수 있습니다:

- SSL 구현이 완전히 호환되지 않을 수 있으며, 잠재적인 [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) 문제가 발생할 수 있습니다.
- 특정 도구는 아직 구현되지 않은 방언 기능(예: MySQL 전용 함수 또는 설정)을 요구할 수 있습니다.

네이티브 드라이버가 있는 경우(예: [DBeaver](../integrations/dbeaver)), MySQL 인터페이스 대신 사용하는 것이 항상 권장됩니다. 추가로, 대부분의 MySQL 언어 클라이언트는 잘 작동해야 하지만, MySQL 인터페이스는 기존 MySQL 쿼리가 있는 코드베이스의 드롭인 대체로 보장되지는 않습니다.

특정 도구의 사용 사례가 네이티브 ClickHouse 드라이버가 없는 경우 MySQL 인터페이스를 통해 사용하려고 시도했으며 특정 호환성 문제가 발생한 경우, ClickHouse 저장소에서 [문제 생성](https://github.com/ClickHouse/ClickHouse/issues)을 해주시기 바랍니다.

::::note
위 BI 도구의 SQL 방언을 더 잘 지원하기 위해, ClickHouse의 MySQL 인터페이스는 기본적으로 설정 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias)로 SELECT 쿼리를 실행합니다. 이는 끌 수 없으며, 드물게 ClickHouse의 정상 쿼리 인터페이스와 MySQL 쿼리 인터페이스 간의 서로 다른 동작을 초래할 수 있습니다.
::::

## ClickHouse Cloud에서 MySQL 인터페이스 활성화하기 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. ClickHouse Cloud 서비스를 생성한 후, `Connect` 버튼을 클릭합니다.

<br/>

<Image img={mysql0} alt="자격증명 화면 - 프롬프트" size="md"/>

2. `Connect with` 드롭다운을 `MySQL`로 변경합니다.

<br/>

<Image img={mysql1} alt="자격증명 화면 - MySQL 선택됨" size="md" />

3. 특정 서비스에 대한 MySQL 인터페이스를 활성화하도록 스위치를 전환합니다. 이렇게 하면 포트 `3306`이 이 서비스에 노출되며, 고유 MySQL 사용자 이름이 포함된 MySQL 연결 화면이表示됩니다. 비밀번호는 서비스의 기본 사용자 비밀번호와 동일합니다.

<br/>

<Image img={mysql2} alt="자격증명 화면 - MySQL 활성화됨" size="md"/>

표시된 MySQL 연결 문자열을 복사합니다.

<Image img={mysql3} alt="자격증명 화면 - 연결 문자열" size="md"/>

## ClickHouse Cloud에서 여러 MySQL 사용자 만들기 {#creating-multiple-mysql-users-in-clickhouse-cloud}

기본적으로 `mysql4<subdomain>` 사용자 계정이 내장되어 있으며, 이는 `default` 계정과 동일한 비밀번호를 사용합니다. `<subdomain>` 부분은 ClickHouse Cloud 호스트 이름의 첫 번째 세그먼트입니다. 이 형식은 안전한 연결을 구현하지만 TLS 핸드쉐이크에서 [SNI 정보를 제공하지 않는](https://www.cloudflare.com/learning/ssl/what-is-sni) 도구와 함께 작동하는 데 필요하며, 사용자 이름에 추가 힌트가 없으면 내부 라우팅을 수행할 수 없게 됩니다(MySQL 콘솔 클라이언트가 그러한 도구 중 하나입니다).

따라서 MySQL 인터페이스와 함께 사용하기 위한 새 사용자를 생성할 때 `mysql4<subdomain>_<username>` 형식을 따르는 것을 _강력히 권장_합니다. 여기서 `<subdomain>`은 Cloud 서비스를 식별하기 위한 힌트이며, `<username>`은 사용자가 선택한 임의의 접미사입니다.

:::tip
ClickHouse Cloud 호스트 이름이 `foobar.us-east1.aws.clickhouse.cloud`와 같은 경우, `<subdomain>` 부분은 `foobar`이며, 사용자 정의 MySQL 사용자 이름은 `mysql4foobar_team1`과 같은 형식을 가질 수 있습니다.
:::

예를 들어 추가적인 설정을 적용해야 하는 경우 MySQL 인터페이스와 함께 사용할 추가 사용자들을 만들 수 있습니다.

1. 선택 사항 - 사용자 지정 사용자에 적용할 [설정 프로필](/sql-reference/statements/create/settings-profile)을 만듭니다. 예를 들어, 나중에 생성할 사용자와의 연결 시 기본적으로 적용될 추가 설정이 포함된 `my_custom_profile`을 만들 수 있습니다:

```sql
CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
```

    `prefer_column_name_to_alias`는 예시로 사용된 것일 뿐, 다른 설정을 사용할 수 있습니다.
2. [사용자 생성](/sql-reference/statements/create/user) 시 다음 형식을 사용합니다: `mysql4<subdomain>_<username>` ([위 참조](#creating-multiple-mysql-users-in-clickhouse-cloud)). 비밀번호는 이중 SHA1 형식이어야 합니다. 예를 들어:

```sql
CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
```

    또는 이 사용자를 위해 사용자 정의 프로필을 사용하려는 경우:

```sql
CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
```

    여기서 `my_custom_profile`은 이전에 생성한 프로필의 이름입니다.
3. [부여](/sql-reference/statements/grant) 새 사용자에게 원하는 테이블이나 데이터베이스와 상호 작용하는 데 필요한 권한을 부여합니다. 예를 들어, `system.query_log`에만 접근을 부여하려면:

```sql
GRANT SELECT ON system.query_log TO mysql4foobar_team1;
```

4. 생성된 사용자를 사용하여 MySQL 인터페이스로 ClickHouse Cloud 서비스에 연결합니다.

### ClickHouse Cloud에서 여러 MySQL 사용자 문제 해결하기 {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

새 MySQL 사용자를 생성했으며, MySQL CLI 클라이언트를 통해 연결하는 동안 다음과 같은 오류가 나타나는 경우:

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

이 경우, 사용자 이름이 `mysql4<subdomain>_<username>` 형식을 따르는지 확인하십시오 ([위 참조](#creating-multiple-mysql-users-in-clickhouse-cloud)).

## 자체 관리 ClickHouse에서 MySQL 인터페이스 활성화하기 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

서버의 구성 파일에 [mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port) 설정을 추가합니다. 예를 들어, `config.d/` [폴더](../operations/configuration-files) 내의 새 XML 파일에서 포트를 정의할 수 있습니다:

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouse 서버를 시작하고 다음과 같은 MySQL 호환성 프로토콜을 수신하는 로그 메시지를 찾습니다:

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## MySQL을 ClickHouse에 연결하기 {#connect-mysql-to-clickhouse}

다음 명령은 MySQL 클라이언트 `mysql`를 ClickHouse에 연결하는 방법을 보여줍니다:

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

예를 들어:

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

연결이 성공하면 출력됩니다:

```text
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 4
Server version: 20.2.1.1-ClickHouse

Copyright (c) 2000, 2019, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

모든 MySQL 클라이언트와의 호환성을 위해 사용자 비밀번호는 설정 파일에서 [이중 SHA1](/operations/settings/settings-users#user-namepassword)로 지정하는 것이 좋습니다. 사용자 비밀번호가 [SHA256](/sql-reference/functions/hash-functions#SHA256)로 지정된 경우 일부 클라이언트는 인증할 수 없습니다(mysqljs 및 MySQL과 MariaDB의 구버전 커맨드 라인 도구).

제한 사항:

- 준비된 쿼리는 지원되지 않습니다.

- 일부 데이터 유형은 문자열로 전송됩니다.

긴 쿼리를 취소하려면 `KILL QUERY connection_id` 문을 사용하십시오(진행 중일 때는 `KILL QUERY WHERE query_id = connection_id`로 대체됩니다). 예를 들어:

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
