---
slug: /sql-reference/statements/create/dictionary/layouts/hierarchical
title: '계층형 딕셔너리'
sidebar_label: '계층형'
sidebar_position: 10
description: '부모-자식 키 관계를 사용하는 계층형 딕셔너리를 구성합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 계층형 딕셔너리 \{#hierarchical-dictionaries\}

ClickHouse는 [숫자 키](../keys-and-fields.md#numeric-key)를 사용하는 계층형 딕셔너리를 지원합니다.

다음과 같은 계층 구조를 살펴보십시오:

```text
0 (Common parent)
│
├── 1 (Russia)
│   │
│   └── 2 (Moscow)
│       │
│       └── 3 (Center)
│
└── 4 (Great Britain)
    │
    └── 5 (London)
```

이 계층은 다음 딕셔너리 테이블로 표현할 수 있습니다.

| region&#95;id | parent&#95;region | region&#95;name |
| ------------- | ----------------- | --------------- |
| 1             | 0                 | Russia          |
| 2             | 1                 | Moscow          |
| 3             | 2                 | Center          |
| 4             | 0                 | Great Britain   |
| 5             | 4                 | London          |

이 테이블에는 요소의 가장 가까운 부모 키를 담고 있는 `parent_region` 컬럼이 있습니다.

ClickHouse는 외부 딕셔너리 속성에 대해 계층(hierarchical) 속성을 지원합니다. 이 속성을 사용하면 위에서 설명한 것과 유사한 방식으로 계층형 딕셔너리를 구성할 수 있습니다.

[dictGetHierarchy](../../../functions/ext-dict-functions.md#dictGetHierarchy) 함수는 요소의 부모 체인(상위 계층)을 가져올 수 있습니다.

이 예제에서 딕셔너리의 구조는 다음과 같습니다:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    CREATE DICTIONARY regions_dict
    (
        region_id UInt64,
        parent_region UInt64 DEFAULT 0 HIERARCHICAL,
        region_name String DEFAULT ''
    )
    PRIMARY KEY region_id
    SOURCE(...)
    LAYOUT(HASHED())
    LIFETIME(3600);
    ```
  </TabItem>

  <TabItem value="xml" label="구성 파일">
    ```xml
    <dictionary>
        <structure>
            <id>
                <name>region_id</name>
            </id>

            <attribute>
                <name>parent_region</name>
                <type>UInt64</type>
                <null_value>0</null_value>
                <hierarchical>true</hierarchical>
            </attribute>

            <attribute>
                <name>region_name</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>

        </structure>
    </dictionary>
    ```
  </TabItem>
</Tabs>

<br />
