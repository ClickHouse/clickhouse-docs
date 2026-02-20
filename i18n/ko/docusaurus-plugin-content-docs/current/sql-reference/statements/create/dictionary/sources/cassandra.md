---
slug: /sql-reference/statements/create/dictionary/sources/cassandra
title: 'Cassandra 딕셔너리 소스'
sidebar_position: 11
sidebar_label: 'Cassandra'
description: 'ClickHouse에서 Cassandra를 딕셔너리 소스로 구성합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

설정 예시:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(CASSANDRA(
        host 'localhost'
        port 9042
        user 'username'
        password 'qwerty123'
        keyspace 'database_name'
        column_family 'table_name'
        allow_filtering 1
        partition_key_prefix 1
        consistency 'One'
        where '"SomeColumn" = 42'
        max_threads 8
        query 'SELECT id, value_1, value_2 FROM database_name.table_name'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <cassandra>
            <host>localhost</host>
            <port>9042</port>
            <user>username</user>
            <password>qwerty123</password>
            <keyspase>database_name</keyspase>
            <column_family>table_name</column_family>
            <allow_filtering>1</allow_filtering>
            <partition_key_prefix>1</partition_key_prefix>
            <consistency>One</consistency>
            <where>"SomeColumn" = 42</where>
            <max_threads>8</max_threads>
            <query>SELECT id, value_1, value_2 FROM database_name.table_name</query>
        </cassandra>
    </source>
    ```
  </TabItem>
</Tabs>

설정 필드:

| Setting                | Description                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`                 | Cassandra 호스트 또는 쉼표로 구분된 호스트 목록입니다.                                                                                                                           |
| `port`                 | Cassandra 서버의 포트입니다. 지정하지 않으면 기본 포트 `9042`가 사용됩니다.                                                                                                            |
| `user`                 | Cassandra 사용자 이름입니다.                                                                                                                                          |
| `password`             | Cassandra 사용자의 비밀번호입니다.                                                                                                                                       |
| `keyspace`             | 키스페이스(데이터베이스) 이름입니다.                                                                                                                                          |
| `column_family`        | 컬럼 패밀리(테이블) 이름입니다.                                                                                                                                            |
| `allow_filtering`      | 클러스터링 키 컬럼에 대해 비용이 많이 들 수 있는 조건을 허용할지 여부를 나타내는 플래그입니다. 기본값은 `1`입니다.                                                                                           |
| `partition_key_prefix` | Cassandra 테이블의 기본 키에 포함된 파티션 키 컬럼 수입니다. 복합 키 딕셔너리에 필요합니다. 딕셔너리 정의에서 키 컬럼의 순서는 Cassandra에서의 순서와 동일해야 합니다. 기본값은 `1`이며(첫 번째 키 컬럼이 파티션 키이고 나머지 키 컬럼은 클러스터링 키입니다). |
| `consistency`          | Consistency 레벨입니다. 가능한 값: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`. 기본값은 `One`입니다.            |
| `where`                | 선택적 필터 조건입니다.                                                                                                                                                 |
| `max_threads`          | 복합 키 딕셔너리에서 여러 파티션으로부터 데이터를 로드할 때 사용할 최대 스레드 수입니다.                                                                                                            |
| `query`                | 사용자 정의 쿼리입니다. 선택 사항입니다.                                                                                                                                       |

:::note
`column_family` 또는 `where` 필드는 `query` 필드와 함께 사용할 수 없습니다. 또한 `column_family` 또는 `query` 필드 중 하나는 반드시 선언해야 합니다.
:::
