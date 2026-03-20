---
slug: /sql-reference/statements/create/dictionary/layouts/ssd-cache
title: 'ssd_cache 딕셔너리 레이아웃 유형'
sidebar_label: 'ssd_cache'
sidebar_position: 8
description: '메모리 내 인덱스를 사용하여 딕셔너리 데이터를 SSD에 저장하는 ssd_cache 또는 complex_key_ssd_cache 유형'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## ssd_cache \{#ssd_cache\}

`cache`와 유사하지만 데이터는 SSD에, 인덱스는 RAM에 저장합니다. 업데이트 큐와 관련된 모든 캐시 딕셔너리 설정은 SSD 캐시 딕셔너리에도 적용할 수 있습니다.

딕셔너리 키는 [UInt64](/sql-reference/data-types/int-uint.md) 타입입니다.

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
    <ssd_cache>
        <!-- 바이트 단위의 기본 읽기 블록 크기입니다. SSD 페이지 크기와 같도록 설정하는 것이 좋습니다. -->
        <block_size>4096</block_size>
        <!-- 바이트 단위의 최대 캐시 파일 크기입니다. -->
        <file_size>16777216</file_size>
        <!-- SSD에서 요소를 읽기 위한 RAM 버퍼 크기(바이트)입니다. -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- SSD로 플러시하기 전에 요소를 집계하기 위한 RAM 버퍼 크기(바이트)입니다. -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- 캐시 파일이 저장될 경로입니다. -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_ssd_cache \{#complex_key_ssd_cache\}

이 저장소 유형은 복합 [키](../attributes.md#composite-key)와 함께 사용하는 것입니다. `ssd_cache`와 유사합니다.