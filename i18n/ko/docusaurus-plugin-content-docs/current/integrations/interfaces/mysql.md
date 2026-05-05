---
description: 'ClickHouse의 MySQL 프로토콜 인터페이스에 대한 문서로, MySQL 클라이언트가 ClickHouse에 연결할 수 있도록 하는 방법을 설명합니다'
sidebar_label: 'MySQL 인터페이스'
sidebar_position: 25
slug: /interfaces/mysql
title: 'MySQL 인터페이스'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL 인터페이스 \{#mysql-interface\}

ClickHouse는 MySQL wire 프로토콜을 지원합니다. 이를 통해 기본 ClickHouse 커넥터가 없는 일부 클라이언트도 MySQL 프로토콜을 대신 활용할 수 있으며, 다음 BI 도구와 함께 동작하는 것으로 검증되었습니다:

- [Looker Studio](../data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

아직 테스트되지 않은 다른 클라이언트나 통합을 사용하려는 경우, 다음과 같은 제한 사항이 있을 수 있음을 유의해야 합니다:

- SSL 구현이 완전히 호환되지 않을 수 있으며, 잠재적인 [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) 관련 문제가 발생할 수 있습니다.
- 특정 도구에서 아직 ClickHouse에 구현되지 않은 SQL 방언 기능(예: MySQL 전용 함수나 설정)을 요구할 수 있습니다.

네이티브 드라이버가 제공되는 경우(예: [DBeaver](../integrations/dbeaver))에는 항상 MySQL 인터페이스 대신 해당 드라이버를 사용하는 것이 바람직합니다. 또한 대부분의 MySQL 클라이언트는 정상적으로 동작하지만, MySQL 인터페이스가 기존 MySQL 쿼리를 사용하는 코드베이스에 대해 완전한 대체(drop-in replacement)가 된다고 보장되지는 않습니다.

특정 도구에 네이티브 ClickHouse 드라이버가 없어 MySQL 인터페이스를 통해 사용하려는 상황에서 호환성 문제가 발견된 경우, ClickHouse 저장소에 [이슈를 생성](https://github.com/ClickHouse/ClickHouse/issues)해 주십시오.

::::note
위 BI 도구들의 SQL 방언을 더 잘 지원하기 위해, ClickHouse의 MySQL 인터페이스는 SELECT 쿼리를 설정 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias)과 함께 암묵적으로 실행합니다.
이는 비활성화할 수 없으며, 드문 엣지 케이스에서는 ClickHouse의 일반 쿼리 인터페이스와 MySQL 쿼리 인터페이스로 전송된 쿼리 간에 서로 다른 동작을 초래할 수 있습니다.
::::

## ClickHouse Cloud에서 MySQL 인터페이스 활성화 \{#enabling-the-mysql-interface-on-clickhouse-cloud\}

1. ClickHouse Cloud 서비스를 생성한 후 `Connect` 버튼을 클릭합니다.

<br/>

<Image img={mysql0} alt="자격 증명 화면 - 프롬프트" size="md"/>

2. `Connect with` 드롭다운 메뉴를 `MySQL`로 변경합니다. 

<br/>

<Image img={mysql1} alt="자격 증명 화면 - MySQL 선택됨" size="md" />

3. 토글 스위치를 전환하여 이 서비스에 대해 MySQL 인터페이스를 활성화합니다. 이렇게 하면 이 서비스에서 포트 `3306`이 노출되며, 고유한 MySQL 사용자 이름이 포함된 MySQL 연결 화면이 표시됩니다. 비밀번호는 서비스 기본 사용자 계정의 비밀번호와 동일합니다.

<br/>

<Image img={mysql2} alt="자격 증명 화면 - MySQL 활성화됨" size="md"/>

표시된 MySQL 연결 문자열을 복사합니다.

<Image img={mysql3} alt="자격 증명 화면 - 연결 문자열" size="md"/>

## ClickHouse Cloud에서 여러 MySQL 사용자 생성 \{#creating-multiple-mysql-users-in-clickhouse-cloud\}

기본적으로 `default` 사용자와 동일한 비밀번호를 사용하는 `mysql4<subdomain>`라는 내장 사용자가 있습니다. `<subdomain>` 부분은 ClickHouse Cloud 호스트명의 첫 번째 세그먼트입니다. 이 형식은 보안 연결은 사용하지만 [TLS 핸드셰이크에서 SNI 정보를 제공하지 않는](https://www.cloudflare.com/learning/ssl/what-is-sni) 도구와 함께 작동하기 위해 필요합니다. 이러한 도구의 경우 사용자 이름에 추가 힌트가 없으면 내부 라우팅을 수행할 수 없습니다(MySQL 콘솔 클라이언트가 그러한 도구 중 하나입니다).

이러한 이유로 MySQL 인터페이스에서 사용할 새 사용자를 생성할 때 `mysql4<subdomain>_<username>` 형식을 따를 것을 _강력히 권장합니다_. 여기서 `<subdomain>`은 Cloud 서비스 식별을 위한 힌트이고, `<username>`은 임의로 선택하는 접미사입니다.

:::tip
ClickHouse Cloud 호스트명이 `foobar.us-east1.aws.clickhouse.cloud`인 경우 `<subdomain>` 부분은 `foobar`이며, 사용자 지정 MySQL 사용자 이름은 `mysql4foobar_team1`과 같이 지정할 수 있습니다.
:::

예를 들어 추가 설정을 적용해야 하는 경우 MySQL 인터페이스와 함께 사용할 추가 사용자를 생성할 수 있습니다.

1. 선택 사항: 사용자 정의 사용자에 적용할 [settings profile](/sql-reference/statements/create/settings-profile)을 생성합니다. 예를 들어, 나중에 생성하는 사용자로 접속할 때 기본적으로 적용될 추가 설정이 포함된 `my_custom_profile`을 생성할 수 있습니다:

    ```sql
    CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
    ```

    `prefer_column_name_to_alias`는 단순한 예시일 뿐이며, 여기에 다른 설정을 사용할 수도 있습니다.
2. 다음 형식을 사용하여 [사용자를 생성](/sql-reference/statements/create/user)합니다: `mysql4<subdomain>_<username>`([위 설명 참조](#creating-multiple-mysql-users-in-clickhouse-cloud)). 비밀번호는 double SHA1 형식이어야 합니다. 예를 들어:

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
    ```

    또는 이 사용자에 대해 사용자 지정 프로필을 사용하려는 경우:

    ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
    ```

    여기서 `my_custom_profile`은 이전에 생성한 프로필의 이름입니다.
3. 새 사용자에게 원하는 테이블이나 데이터베이스와 상호 작용하는 데 필요한 권한을 [부여](/sql-reference/statements/grant)합니다. 예를 들어 `system.query_log`에만 접근 권한을 부여하려는 경우:

    ```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
    ```

4. 생성한 사용자를 사용하여 MySQL 인터페이스를 통해 ClickHouse Cloud 서비스에 연결합니다.

### ClickHouse Cloud에서 여러 MySQL 사용자 문제 해결 \{#troubleshooting-multiple-mysql-users-in-clickhouse-cloud\}

새 MySQL 사용자를 생성한 뒤 MySQL CLI 클라이언트로 접속할 때 다음 오류가 발생하는 경우:

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

이 경우 사용자 이름이 `mysql4&lt;subdomain&gt;_&lt;username&gt;` 형식을 따르도록, ([위](#creating-multiple-mysql-users-in-clickhouse-cloud))에서 설명한 대로 설정하십시오.


## 자가 관리형 ClickHouse에서 MySQL 인터페이스 활성화 \{#enabling-the-mysql-interface-on-self-managed-clickhouse\}

서버 구성 파일에 [mysql&#95;port](../../operations/server-configuration-parameters/settings.md#mysql_port) 설정을 추가합니다. 예를 들어 `config.d/` [폴더](/operations/configuration-files)에 새 XML 파일을 만들어 포트 번호를 정의할 수 있습니다.

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

ClickHouse 서버를 시작한 후, 「Listening for MySQL compatibility protocol」이라는 내용이 포함된 아래와 유사한 로그 메시지를 확인하십시오.

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```


## MySQL을 ClickHouse에 연결하기 \{#connect-mysql-to-clickhouse\}

다음 명령은 MySQL 클라이언트 `mysql`을 사용해 ClickHouse에 연결하는 방법을 보여줍니다.

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

예를 들어:

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

연결에 성공하면 다음과 같은 출력이 표시됩니다:

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

모든 MySQL 클라이언트와의 호환성을 위해 설정 파일에서 [double SHA1](/operations/settings/settings-users#user-namepassword)로 사용자 비밀번호를 지정할 것을 권장합니다.
사용자 비밀번호를 [SHA256](/sql-reference/functions/hash-functions#SHA256)으로 지정하면 일부 클라이언트(mysqljs 및 구버전 MySQL, MariaDB 명령줄 도구)는 인증을 수행하지 못합니다.

제한 사항:

* prepared 쿼리는 지원되지 않습니다

* 일부 데이터 타입은 문자열로 전송됩니다

긴 쿼리를 취소하려면 `KILL QUERY connection_id` 문을 사용합니다(처리되는 동안 `KILL QUERY WHERE query_id = connection_id`로 대체됩니다). 예를 들어:

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
