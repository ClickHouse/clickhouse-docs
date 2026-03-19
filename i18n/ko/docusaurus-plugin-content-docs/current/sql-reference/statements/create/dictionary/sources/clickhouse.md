---
slug: /sql-reference/statements/create/dictionary/sources/clickhouse
title: 'ClickHouse 딕셔너리 소스'
sidebar_position: 8
sidebar_label: 'ClickHouse'
description: 'ClickHouse 테이블을 딕셔너리 소스로 구성합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

설정 예:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(CLICKHOUSE(
        host 'example01-01-1'
        port 9000
        user 'default'
        password ''
        db 'default'
        table 'ids'
        where 'id=10'
        secure 1
        query 'SELECT id, value_1, value_2 FROM default.ids'
    ));
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <clickhouse>
            <host>example01-01-1</host>
            <port>9000</port>
            <user>default</user>
            <password></password>
            <db>default</db>
            <table>ids</table>
            <where>id=10</where>
            <secure>1</secure>
            <query>SELECT id, value_1, value_2 FROM default.ids</query>
        </clickhouse>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

설정 필드:

| Setting            | Description                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`             | ClickHouse 호스트입니다. 로컬 호스트인 경우 쿼리가 네트워크 통신 없이 처리됩니다. 장애 허용을 향상하려면 [Distributed](/engines/table-engines/special/distributed) 테이블을 생성한 다음 이후 구성에서 이를 입력하면 됩니다. |
| `port`             | ClickHouse 서버의 포트입니다.                                                                                                                                       |
| `user`             | ClickHouse USER의 이름입니다.                                                                                                                                     |
| `password`         | ClickHouse USER의 비밀번호입니다.                                                                                                                                   |
| `db`               | 데이터베이스 이름입니다.                                                                                                                                               |
| `table`            | 테이블 이름입니다.                                                                                                                                                  |
| `where`            | 선택 조건입니다. 선택 사항입니다.                                                                                                                                         |
| `invalidate_query` | 딕셔너리 상태를 확인하기 위한 쿼리입니다. 선택 사항입니다. 자세한 내용은 [LIFETIME을 사용한 딕셔너리 데이터 새로 고침](../lifetime.md) 절을 참고하십시오.                                                         |
| `secure`           | 연결에 SSL을 사용합니다.                                                                                                                                             |
| `query`            | 사용자 정의 쿼리입니다. 선택 사항입니다.                                                                                                                                     |

:::note
`table` 필드 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 그리고 `table` 또는 `query` 필드 중 하나는 반드시 선언해야 합니다.
:::
