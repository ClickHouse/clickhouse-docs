---
slug: /sql-reference/statements/create/dictionary/sources/yamlregexptree
title: 'YAMLRegExpTree 딕셔너리 소스'
sidebar_position: 15
sidebar_label: 'YAMLRegExpTree'
description: 'YAML 파일을 정규 표현식 트리 딕셔너리의 소스로 설정합니다.'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

`YAMLRegExpTree` 소스는 로컬 파일 시스템의 YAML 파일에서 정규 표현식 트리를 로드합니다.
이 소스는 [`regexp_tree`](../layouts/regexp-tree.md) 딕셔너리 레이아웃 전용으로 설계되었으며,
user agent 파싱과 같은 패턴 기반 조회를 위해 정규 표현식과 속성 간의 계층적 매핑을 제공합니다.

:::note
`YAMLRegExpTree` 소스는 ClickHouse 오픈 소스에서만 사용할 수 있습니다.
ClickHouse Cloud에서는 딕셔너리를 CSV로 내보낸 후 [ClickHouse 테이블 소스](./clickhouse.md)를 통해 로드하십시오.
자세한 내용은 [ClickHouse Cloud에서 regexp&#95;tree 딕셔너리 사용](../layouts/regexp-tree#use-regular-expression-tree-dictionary-in-clickhouse-cloud)을 참고하십시오.
:::


## 설정 \{#configuration\}

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0);
```

설정 항목:

| Setting | 설명                                                                             |
| ------- | ------------------------------------------------------------------------------ |
| `PATH`  | 정규 표현식 트리가 포함된 YAML 파일의 절대 경로입니다. DDL로 생성하는 경우 파일은 `user_files` 디렉터리에 있어야 합니다. |


## YAML 파일 구조 \{#yaml-file-structure\}

YAML 파일은 정규 표현식 트리 노드 목록으로 구성됩니다. 각 노드는 속성과 자식 노드를 가질 수 있으며, 이들로 계층 구조를 이룹니다:

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tclwebkit'
      version: '12'
    - regexp: '30/tclwebkit'
      version: '11'
    - regexp: '29/tclwebkit'
      version: '10'
```

각 노드는 다음과 같은 구조입니다:

* **`regexp`**: 이 노드에 대한 정규 표현식입니다.
* **attributes**: 사용자 정의 딕셔너리 속성입니다(예: `name`, `version`). 속성 값에는 정규 표현식의 캡처 그룹에 대한 **역참조(back reference)** 를 포함할 수 있으며, `\1` 또는 `$1` (숫자 1–9) 형태로 작성합니다. 이는 쿼리 시점에 일치한 캡처 그룹으로 대체됩니다.
* **child nodes**: 각자 자체 속성과 선택적으로 더 많은 자식을 가지는 자식 노드 목록입니다. 자식 목록의 이름은 임의로 정할 수 있습니다(예: 위의 `versions`). 문자열 매칭은 깊이 우선으로 진행됩니다. 문자열이 어떤 노드와 일치하면 해당 노드의 자식도 검사합니다. 가장 깊은 수준에서 일치한 노드의 속성이 우선하며, 동일한 이름의 상위 속성을 덮어씁니다.


## 관련 페이지 \{#related-pages\}

- [regexp_tree dictionary layout](../layouts/regexp-tree.md) — 레이아웃 구성, 쿼리 예제, 매칭 모드
- [dictGet](/sql-reference/functions/ext-dict-functions#dictGet), [dictGetAll](/sql-reference/functions/ext-dict-functions#dictGetAll) — regexp tree 딕셔너리를 대상으로 쿼리하는 함수