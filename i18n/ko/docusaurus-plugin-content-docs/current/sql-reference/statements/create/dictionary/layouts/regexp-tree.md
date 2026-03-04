---
slug: /sql-reference/statements/create/dictionary/layouts/regexp-tree
title: '정규 표현식 트리 딕셔너리 레이아웃'
sidebar_label: '정규 표현식 트리'
sidebar_position: 12
description: '패턴 기반 조회를 위한 정규 표현식 트리 딕셔너리를 구성합니다.'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


## 개요 \{#overview\}

`regexp_tree` 딕셔너리를 사용하면 계층적 정규 표현식 패턴을 기반으로 키와 값을 매핑할 수 있습니다.
이 딕셔너리는 정확한 키 일치보다 정규 표현식 패턴 일치(예: 사용자 에이전트 문자열을 정규 표현식 패턴 매칭으로 분류하는 작업) 조회에 더 최적화되어 있습니다.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="ClickHouse regex tree 딕셔너리 소개" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## YAMLRegExpTree 소스를 사용하는 정규식 트리 딕셔너리 \{#use-regular-expression-tree-dictionary-in-clickhouse-open-source\}

<CloudNotSupportedBadge />

정규식 트리 딕셔너리는 ClickHouse 오픈 소스 버전에서 [`YAMLRegExpTree`](../sources/yamlregexptree.md) 소스를 사용하여 정의합니다. 이때 정규식 트리가 포함된 YAML 파일의 경로를 해당 소스에 전달합니다.

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
...
```

딕셔너리 소스 [`YAMLRegExpTree`](../sources/yamlregexptree.md)는 정규식 트리의 구조를 나타냅니다. 예를 들면 다음과 같습니다.

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

이 설정은 정규식 트리 노드 목록으로 구성됩니다. 각 노드는 다음과 같은 구조를 가집니다.

* **regexp**: 노드의 정규 표현식입니다.
* **attributes**: 사용자 정의 딕셔너리 속성(attribute) 목록입니다. 이 예제에는 `name`과 `version` 두 개의 속성이 있습니다. 첫 번째 노드는 두 속성을 모두 정의합니다. 두 번째 노드는 `name` 속성만 정의합니다. `version` 속성은 두 번째 노드의 자식 노드에서 제공합니다.
  * 속성 값에는 매칭된 정규 표현식의 캡처 그룹을 참조하는 **역참조(back reference)** 를 포함할 수 있습니다. 예제에서 첫 번째 노드의 `version` 속성 값은 정규 표현식의 캡처 그룹 `(\d+[\.\d]*)` 에 대한 역참조 `\1` 로 구성됩니다. 역참조 번호는 1에서 9까지이며 `$1` 또는 `\1` (번호 1의 경우)처럼 표기합니다. 역참조는 쿼리 실행 중에 매칭된 캡처 그룹으로 치환됩니다.
* **child nodes**: 각자 자신의 attributes와 (필요한 경우) 자식 노드를 가지는 regexp 트리 노드의 자식 목록입니다. 문자열 매칭은 깊이 우선 방식으로 진행됩니다. 어떤 문자열이 regexp 노드와 매칭되면, 딕셔너리는 해당 문자열이 그 노드의 자식 노드와도 매칭되는지 확인합니다. 그렇게 되면, 가장 깊이 매칭된 노드의 attributes가 할당됩니다. 자식 노드의 속성은 동일한 이름을 가진 상위 노드의 속성을 덮어씁니다. YAML 파일에서 child node의 이름은 위 예제의 `versions` 와 같이 임의로 지정할 수 있습니다.

Regexp 트리 딕셔너리에는 `dictGet`, `dictGetOrDefault`, `dictGetAll` 함수만을 사용해 접근할 수 있습니다. 예를 들면 다음과 같습니다.

```sql title="Query"
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

```text title="Response"
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

이 경우, 먼저 최상위 계층의 두 번째 노드에서 정규식 `\d+/tclwebkit(?:\d+[\.\d]*)`과 일치합니다.
이후 딕셔너리는 자식 노드를 계속 탐색하여 문자열이 `3[12]/tclwebkit`에도 일치한다는 것을 확인합니다.
그 결과 속성 `name`의 값은 (첫 번째 계층에서 정의된) `Android`가 되고, 속성 `version`의 값은 (자식 노드에서 정의된) `12`가 됩니다.

정교한 YAML 구성 파일을 사용하면 정규식 트리 딕셔너리를 사용자 에이전트 문자열 파서로 활용할 수 있습니다.
ClickHouse는 [uap-core](https://github.com/ua-parser/uap-core)를 지원하며, 기능 테스트 [02504&#95;regexp&#95;dictionary&#95;ua&#95;parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)에서 사용 방법을 확인할 수 있습니다.


### 속성 값 수집 \{#collecting-attribute-values\}

여러 개의 정규식에 매칭된 값들을 리프 노드의 값뿐만 아니라 함께 반환해야 하는 경우가 있습니다. 이때는 전용 함수 [`dictGetAll`](/sql-reference/functions/ext-dict-functions.md#dictGetAll)을 사용할 수 있습니다. 어떤 노드가 타입 `T`의 속성 값을 가지면 `dictGetAll`은 0개 이상의 값을 포함하는 `Array(T)`를 반환합니다.

기본적으로 키마다 반환되는 매치(일치 항목)의 개수에는 상한이 없습니다. 선택적인 네 번째 인수로 상한을 `dictGetAll`에 전달할 수 있습니다. 배열은 *위상 순서(topological order)*로 채워지며, 이는 자식 노드가 부모 노드보다 앞에 오고, 형제 노드는 소스에 나온 순서를 따른다는 의미입니다.

예시:

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String,
    topological_index Int64,
    captured Nullable(String),
    parent String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0)
```

```yaml
# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'clickhouse\.com'
  tag: 'ClickHouse'
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: 'ClickHouse Documentation'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: 'Documentation'
  topological_index: 2

- regexp: 'github.com'
  tag: 'GitHub'
  topological_index: 3
  captured: 'NULL'
```

```sql
CREATE TABLE urls (url String) ENGINE=MergeTree ORDER BY url;
INSERT INTO urls VALUES ('clickhouse.com'), ('clickhouse.com/docs/en'), ('github.com/clickhouse/tree/master/docs');
SELECT url, dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2) FROM urls;
```

결과:

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```


### 매칭 모드 \{#matching-modes\}

패턴 매칭 동작은 특정 딕셔너리 설정으로 조정할 수 있습니다:

- `regexp_dict_flag_case_insensitive`: 대소문자를 구분하지 않는 매칭을 사용합니다 (기본값은 `false`입니다). 개별 표현식에서는 `(?i)` 및 `(?-i)`로 재정의할 수 있습니다.
- `regexp_dict_flag_dotall`: '.'이 개행 문자와도 매칭되도록 허용합니다 (기본값은 `false`입니다).

## ClickHouse Cloud에서 정규식 트리 딕셔너리 사용 \{#use-regular-expression-tree-dictionary-in-clickhouse-cloud\}

[`YAMLRegExpTree`](../sources/yamlregexptree.md) 소스는 ClickHouse 오픈 소스에서는 동작하지만 ClickHouse Cloud에서는 동작하지 않습니다.
ClickHouse Cloud에서 regexp 트리 딕셔너리를 사용하려면, 먼저 ClickHouse 오픈 소스에서 YAML 파일을 사용해 로컬에 regexp 트리 딕셔너리를 생성한 다음, `dictionary` 테이블 함수와 [INTO OUTFILE](/sql-reference/statements/select/into-outfile.md) 절을 사용하여 이 딕셔너리를 CSV 파일로 내보냅니다.

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSV 파일의 내용은 다음과 같습니다.

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

덤프된 파일의 스키마는 다음과 같습니다.

* `id UInt64`: RegexpTree 노드의 id입니다.
* `parent_id UInt64`: 노드의 부모 id입니다.
* `regexp String`: 정규표현식 문자열입니다.
* `keys Array(String)`: 사용자 정의 속성 이름입니다.
* `values Array(String)`: 사용자 정의 속성 값입니다.

ClickHouse Cloud에서 딕셔너리를 생성하려면, 먼저 아래 테이블 구조로 `regexp_dictionary_source_table` 테이블을 생성합니다.

```sql
CREATE TABLE regexp_dictionary_source_table
(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys   Array(String),
    values Array(String)
) ENGINE=Memory;
```

그런 다음 로컬 CSV 파일을 다음과 같이 사용합니다.

```bash
clickhouse client \
    --host MY_HOST \
    --secure \
    --password MY_PASSWORD \
    --query "
    INSERT INTO regexp_dictionary_source_table
    SELECT * FROM input ('id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
    FORMAT CSV" < regexp_dict.csv
```

자세한 내용은 [Insert Local Files](/integrations/data-ingestion/insert-local-files) 문서를 참조하십시오. 소스 테이블을 초기화한 후에는 테이블 소스를 기반으로 RegexpTree를 생성할 수 있습니다.

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_dictionary_source_table'))
LIFETIME(0)
LAYOUT(regexp_tree);
```
