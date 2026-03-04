---
slug: /sql-reference/statements/create/dictionary/sources/redis
title: 'Redis 딕셔너리 소스'
sidebar_position: 10
sidebar_label: 'Redis'
description: 'ClickHouse에서 딕셔너리 소스로 Redis를 구성하는 방법을 설명합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

설정 예:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(REDIS(
        host 'localhost'
        port 6379
        storage_type 'simple'
        db_index 0
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="구성 파일">
    ```xml
    <source>
        <redis>
            <host>localhost</host>
            <port>6379</port>
            <storage_type>simple</storage_type>
            <db_index>0</db_index>
        </redis>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

설정 필드:

| Setting        | Description                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`         | Redis 호스트입니다.                                                                                                                                                         |
| `port`         | Redis 서버의 포트입니다.                                                                                                                                                      |
| `storage_type` | 키 작업에 사용하는 Redis 내부 스토리지 구조입니다. `simple`은 단순 소스와 해시된 단일 키 소스용이며, `hash_map`은 두 개의 키를 가진 해시된 소스용입니다. 범위 기반 소스와 복잡한 키를 가진 캐시 소스는 지원되지 않습니다. 기본값은 `simple`입니다. 선택 사항입니다. |
| `db_index`     | Redis 논리 데이터베이스의 특정 숫자 인덱스입니다. 기본값은 `0`입니다. 선택 사항입니다.                                                                                                                 |
