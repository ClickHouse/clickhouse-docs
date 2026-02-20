---
slug: /sql-reference/statements/create/dictionary/layouts/direct
title: 'direct 딕셔너리 레이아웃'
sidebar_label: 'direct'
sidebar_position: 9
description: '캐시 없이 소스를 직접 조회하는 딕셔너리 레이아웃입니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## direct \{#direct\}

딕셔너리는 메모리에 저장되지 않고, 요청을 처리하는 동안마다 소스에 직접 접근합니다.

딕셔너리 키는 [UInt64](../../../data-types/int-uint.md) 타입입니다.

로컬 파일을 제외한 모든 유형의 [소스](../sources/#dictionary-sources)를 지원합니다.

구성 예시는 다음과 같습니다:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(DIRECT())
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <direct />
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_direct \{#complex_key_direct\}

이 스토리지 유형은 복합 [키](../keys-and-fields.md#dictionary-key-and-fields)를 사용할 때 사용합니다. `direct` 유형과 유사합니다.