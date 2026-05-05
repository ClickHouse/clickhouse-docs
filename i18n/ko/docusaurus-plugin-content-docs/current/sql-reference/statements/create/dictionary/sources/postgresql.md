---
slug: /sql-reference/statements/create/dictionary/sources/postgresql
title: 'PostgreSQL 딕셔너리 소스'
sidebar_position: 12
sidebar_label: 'PostgreSQL'
description: 'ClickHouse에서 PostgreSQL을 딕셔너리 소스로 구성하는 방법.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

설정 예시:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(POSTGRESQL(
        port 5432
        host 'postgresql-hostname'
        user 'postgres_user'
        password 'postgres_password'
        db 'db_name'
        table 'table_name'
        replica(host 'example01-1' port 5432 priority 1)
        replica(host 'example01-2' port 5432 priority 2)
        where 'id=10'
        invalidate_query 'SQL_QUERY'
        query 'SELECT id, value_1, value_2 FROM db_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
      <postgresql>
          <host>postgresql-hostname</hoat>
          <port>5432</port>
          <user>clickhouse</user>
          <password>qwerty</password>
          <db>db_name</db>
          <table>table_name</table>
          <where>id=10</where>
          <invalidate_query>SQL_QUERY</invalidate_query>
          <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
      </postgresql>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

설정 필드:

| Setting                | Description                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `host`                 | PostgreSQL 서버의 호스트입니다. 모든 레플리카에 동일하게 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).              |
| `port`                 | PostgreSQL 서버의 포트입니다. 모든 레플리카에 동일하게 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).               |
| `user`                 | PostgreSQL 사용자 이름입니다. 모든 레플리카에 동일하게 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).               |
| `password`             | PostgreSQL 사용자의 비밀번호입니다. 모든 레플리카에 동일하게 지정하거나, 각 레플리카별로 개별적으로 지정할 수 있습니다 (`<replica>` 내부).            |
| `replica`              | 레플리카 구성 섹션입니다. 여러 개의 섹션을 정의할 수 있습니다.                                                                 |
| `replica/host`         | PostgreSQL 호스트입니다.                                                                                   |
| `replica/port`         | PostgreSQL 포트입니다.                                                                                    |
| `replica/priority`     | 레플리카 우선순위입니다. 연결을 시도할 때 ClickHouse는 레플리카를 우선순위 순서대로 순회합니다. 숫자가 낮을수록 우선순위가 높습니다.                      |
| `db`                   | 데이터베이스 이름입니다.                                                                                        |
| `table`                | 테이블 이름입니다.                                                                                           |
| `where`                | 선택 조건입니다. 조건 구문은 PostgreSQL의 `WHERE` 절과 동일합니다. 예: `id > 10 AND id < 20`. 선택 사항입니다.                   |
| `invalidate_query`     | 딕셔너리 상태를 확인하기 위한 쿼리입니다. 선택 사항입니다. 자세한 내용은 [LIFETIME을 사용한 딕셔너리 데이터 새로 고침](../lifetime.md) 섹션을 참고하십시오. |
| `background_reconnect` | 연결이 실패할 경우 백그라운드에서 레플리카에 다시 연결합니다. 선택 사항입니다.                                                         |
| `query`                | 사용자 정의 쿼리입니다. 선택 사항입니다.                                                                              |

:::note
`table` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 또한 `table` 또는 `query` 필드 중 하나는 반드시 선언해야 합니다.
:::
