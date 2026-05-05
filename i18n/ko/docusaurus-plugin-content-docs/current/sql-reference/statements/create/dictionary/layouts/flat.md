---
slug: /sql-reference/statements/create/dictionary/layouts/flat
title: '플랫 딕셔너리 레이아웃'
sidebar_label: '플랫'
sidebar_position: 2
description: '딕셔너리를 메모리에 플랫 배열(flat array) 형태로 저장합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

`flat` 레이아웃을 사용하면 딕셔너리가 flat 배열(flat array) 형태로 메모리에 완전히 저장됩니다.
사용되는 메모리 양은 (사용된 공간 기준으로) 가장 큰 키 값의 크기에 비례합니다.

:::tip
이 레이아웃 유형은 딕셔너리를 저장하는 모든 방식 가운데 가장 뛰어난 성능을 제공합니다.
:::

딕셔너리 키는 [UInt64](/sql-reference/data-types/int-uint.md) 타입이며 값은 `max_array_size` (기본값 — 500,000)로 제한됩니다.
딕셔너리를 생성할 때 더 큰 키가 발견되면 ClickHouse는 예외를 발생시키고 딕셔너리를 생성하지 않습니다.
딕셔너리 flat 배열의 초기 크기는 `initial_array_size` 설정(기본값 — 1024)으로 제어됩니다.

모든 유형의 소스를 지원합니다.
딕셔너리를 업데이트할 때 데이터(파일 또는 테이블에서)는 전체를 한 번에 읽습니다.

구성 예:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <layout>
      <flat>
        <initial_array_size>50000</initial_array_size>
        <max_array_size>5000000</max_array_size>
      </flat>
    </layout>
    ```
  </TabItem>
</Tabs>

<br />
