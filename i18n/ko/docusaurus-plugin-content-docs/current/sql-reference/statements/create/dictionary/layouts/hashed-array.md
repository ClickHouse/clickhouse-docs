---
slug: /sql-reference/statements/create/dictionary/layouts/hashed-array
title: 'hashed_array 딕셔너리 레이아웃 유형'
sidebar_label: 'hashed_array'
sidebar_position: 4
description: '속성 배열이 있는 해시 테이블을 사용하여 딕셔너리를 메모리에 저장합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## hashed_array \{#hashed_array\}

딕셔너리는 통째로 메모리에 저장됩니다. 각 속성은 배열에 저장됩니다. 키 속성은 값이 속성 배열의 인덱스인 해시 테이블 형태로 저장됩니다. 딕셔너리는 임의의 식별자를 가진 임의 개수의 요소를 포함할 수 있습니다. 실제로는 키 개수가 수천만 개에 이를 수 있습니다.

딕셔너리 키는 [UInt64](../../../data-types/int-uint.md) 타입입니다.

모든 유형의 소스를 지원합니다. 업데이트 시에는 데이터(파일 또는 테이블에서)가 전체가 한 번에 읽힙니다.

구성 예시는 다음과 같습니다.

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_hashed_array \{#complex_key_hashed_array\}

이 저장소 유형은 복합 [키](../keys-and-fields.md#dictionary-key-and-fields)를 위한 것입니다. [hashed_array](#hashed_array)와 유사합니다.

구성 예:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

</TabItem>
<TabItem value="xml" label="구성 파일">

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

</TabItem>
</Tabs>

<br/>