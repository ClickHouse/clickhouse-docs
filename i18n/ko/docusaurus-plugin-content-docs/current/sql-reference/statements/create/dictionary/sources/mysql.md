---
slug: /sql-reference/statements/create/dictionary/sources/mysql
title: 'MySQL 딕셔너리 소스'
sidebar_position: 7
sidebar_label: 'MySQL'
description: 'ClickHouse에서 MySQL을 딕셔너리 소스로 구성합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

설정 예:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(MYSQL(
        port 3306
        user 'clickhouse'
        password 'qwerty'
        replica(host 'example01-1' priority 1)
        replica(host 'example01-2' priority 1)
        db 'db_name'
        table 'table_name'
        where 'id=10'
        invalidate_query 'SQL_QUERY'
        fail_on_connection_loss 'true'
        query 'SELECT id, value_1, value_2 FROM db_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="구성 파일">
    ```xml
    <source>
      <mysql>
          <port>3306</port>
          <user>clickhouse</user>
          <password>qwerty</password>
          <replica>
              <host>example01-1</host>
              <priority>1</priority>
          </replica>
          <replica>
              <host>example01-2</host>
              <priority>1</priority>
          </replica>
          <db>db_name</db>
          <table>table_name</table>
          <where>id=10</where>
          <invalidate_query>SQL_QUERY</invalidate_query>
          <fail_on_connection_loss>true</fail_on_connection_loss>
          <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
      </mysql>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

설정 필드:

| Setting                   | Description                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                    | MySQL 서버의 포트입니다. 모든 레플리카에 대해 공통으로 지정하거나, 각 레플리카별로(`<replica>` 내부) 개별 지정할 수 있습니다.                                                                                                       |
| `user`                    | MySQL 사용자 이름입니다. 모든 레플리카에 대해 공통으로 지정하거나, 각 레플리카별로(`<replica>` 내부) 개별 지정할 수 있습니다.                                                                                                       |
| `password`                | MySQL 사용자의 비밀번호입니다. 모든 레플리카에 대해 공통으로 지정하거나, 각 레플리카별로(`<replica>` 내부) 개별 지정할 수 있습니다.                                                                                                    |
| `replica`                 | 레플리카 구성 섹션입니다. 여러 개를 정의할 수 있습니다.                                                                                                                                                       |
| `replica/host`            | MySQL 호스트입니다.                                                                                                                                                                          |
| `replica/priority`        | 레플리카 우선순위입니다. 연결을 시도할 때 ClickHouse는 우선순위 순서대로 레플리카에 연결을 시도합니다. 숫자가 낮을수록 우선순위가 높습니다.                                                                                                    |
| `db`                      | 데이터베이스 이름입니다.                                                                                                                                                                          |
| `table`                   | 테이블 이름입니다.                                                                                                                                                                             |
| `where`                   | 선택 조건입니다. 조건의 구문은 MySQL의 `WHERE` 절과 동일하며, 예를 들어 `id > 10 AND id < 20`과 같습니다. 선택 사항입니다.                                                                                                 |
| `invalidate_query`        | 딕셔너리 상태를 확인하기 위한 쿼리입니다. 선택 사항입니다. 자세한 내용은 [LIFETIME을 사용한 딕셔너리 데이터 새로 고침](../lifetime.md#refreshing-dictionary-data-using-lifetime) 섹션을 참고하십시오.                                         |
| `fail_on_connection_loss` | 연결 손실 시 서버 동작을 제어합니다. `true`이면 클라이언트와 서버 간 연결이 끊어졌을 때 즉시 예외를 발생시킵니다. `false`이면 ClickHouse 서버가 예외를 발생시키기 전에 쿼리 실행을 최대 3번까지 재시도합니다. 재시도는 응답 시간이 증가하는 원인이 된다는 점에 유의하십시오. 기본값: `false`입니다. |
| `query`                   | 사용자 정의 쿼리입니다. 선택 사항입니다.                                                                                                                                                                |

:::note
`table` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 또한 `table` 또는 `query` 필드 중 하나는 반드시 선언해야 합니다.
:::

:::note
명시적인 `secure` 파라미터는 없습니다. SSL 연결을 설정하는 경우 보안이 필수입니다.
:::

MySQL은 소켓을 통해 로컬 호스트에 연결할 수 있습니다. 이를 위해 `host`와 `socket`을 설정합니다.

설정 예:


<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
SOURCE(MYSQL(
    host 'localhost'
    socket '/path/to/socket/file.sock'
    user 'clickhouse'
    password 'qwerty'
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

</TabItem>
<TabItem value="xml" label="구성 파일">

```xml
<source>
  <mysql>
      <host>localhost</host>
      <socket>/path/to/socket/file.sock</socket>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

</TabItem>
</Tabs>