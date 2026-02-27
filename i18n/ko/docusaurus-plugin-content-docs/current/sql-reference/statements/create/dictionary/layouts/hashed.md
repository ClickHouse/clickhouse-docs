---
slug: /sql-reference/statements/create/dictionary/layouts/hashed
title: 'hashed 딕셔너리 레이아웃 유형'
sidebar_label: 'hashed'
sidebar_position: 3
description: '해시 테이블을 사용하여 딕셔너리를 메모리에 저장합니다: hashed, sparse_hashed, complex_key_hashed, complex_key_sparse_hashed'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## hashed \{#hashed\}

딕셔너리는 해시 테이블(hash table) 형태로 전체가 메모리에 저장됩니다. 딕셔너리에는 어떤 식별자를 가진 요소든 개수 제한 없이 포함될 수 있습니다. 실제로는 키 개수가 수천만 개에 이를 수 있습니다.

딕셔너리 키는 [UInt64](/sql-reference/data-types/int-uint.md) 타입입니다.

모든 유형의 소스를 지원합니다. 업데이트 시에는 데이터(파일 또는 테이블)는 전체를 한 번에 읽습니다.

구성 예:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED())
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <hashed />
</layout>
```

</TabItem>
</Tabs>

<br/>

설정이 포함된 구성 예:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <hashed>
    <!-- shards 값이 1보다 크면(기본값은 `1`) 딕셔너리가 데이터를
         병렬로 로드합니다. 하나의 딕셔너리에 매우 많은 요소가 있을 때
         유용합니다. -->
    <shards>10</shards>

    <!-- 병렬 큐에서 블록에 대한 backlog 크기입니다.

         병렬 로딩에서의 병목 지점은 rehash 작업이므로, 스레드가
         rehash를 수행하느라 멈춰 있는 상황을 피하려면 일정량의
         backlog가 필요합니다.

         10000은 메모리 사용량과 속도 사이의 좋은 균형입니다.
         10e10개의 요소에 대해서도 기아(starvation) 없이 모든 로드를
         처리할 수 있습니다. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- 해시 테이블의 최대 load factor입니다. 값이 클수록 메모리가
         더 효율적으로 사용되어(낭비되는 메모리가 적어져) 메모리 효율은
         좋아지지만, 읽기/성능이 저하될 수 있습니다.

         유효한 값: [0.5, 0.99]
         기본값: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

## sparse_hashed \{#sparse_hashed\}

`hashed`와 유사하지만, 메모리를 더 적게 사용하는 대신 CPU 사용량이 더 많습니다.

딕셔너리 키는 [UInt64](/sql-reference/data-types/int-uint.md) 타입입니다.

구성 예시:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

이 딕셔너리 타입에서도 `shards`를 사용할 수 있으며, `sparse_hashed`는 `hashed`보다 느리므로 `hashed`보다 `sparse_hashed`에서 `shards` 사용이 더 중요합니다.

## complex_key_hashed \{#complex_key_hashed\}

이 저장 방식은 복합 [키](../attributes.md#composite-key)에 사용합니다. `hashed`와 유사합니다.

구성 예시는 다음과 같습니다.

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_sparse_hashed \{#complex_key_sparse_hashed\}

이 저장소 유형은 복합 [키](../attributes.md#composite-key)에 사용되는 유형입니다. [sparse_hashed](#sparse_hashed)와 유사합니다.

구성 예제:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

</TabItem>
</Tabs>

<br/>