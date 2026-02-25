---
description: '딕셔너리 생성 및 구성 방법에 대한 문서'
sidebar_label: '개요'
sidebar_position: 1
slug: /sql-reference/statements/create/dictionary
title: 'CREATE DICTIONARY'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import CloudSupportedBadge from '@theme/badges/CloudSupportedBadge';


# CREATE DICTIONARY \{#create-dictionary\}

딕셔너리는 다양한 유형의 참조 목록에 편리하게 사용할 수 있는 (`key -> attributes`) 매핑입니다.
ClickHouse는 쿼리에서 사용할 수 있는 딕셔너리용 특수 함수를 지원합니다. 참조 테이블에 대한 `JOIN`을 사용하는 것보다 함수와 함께 딕셔너리를 사용하는 편이 더 쉽고 효율적입니다.

딕셔너리는 두 가지 방식으로 생성할 수 있습니다:

- [DDL 쿼리로 생성](#creating-a-dictionary-with-a-ddl-query) (권장)
- [설정 파일로 생성](#creating-a-dictionary-with-a-configuration-file)

## DDL 쿼리로 딕셔너리 생성하기 \{#creating-a-dictionary-with-a-ddl-query\}

<CloudSupportedBadge/>

딕셔너리는 DDL 쿼리로 생성할 수 있습니다.  
이 방식이 권장되는 방법입니다. 이 방식으로 생성한 딕셔너리는 다음과 같은 장점이 있습니다:

- 서버 설정 파일에 별도의 레코드가 추가되지 않습니다.
- 딕셔너리를 테이블이나 VIEW와 같은 일급 객체처럼 사용할 수 있습니다.
- 딕셔너리 테이블 함수를 사용하는 대신 익숙한 `SELECT` 구문을 사용해 데이터를 직접 읽을 수 있습니다. `SELECT` 문을 통해 딕셔너리에 직접 접근하는 경우, 캐시된 딕셔너리는 캐시된 데이터만 반환하고, 캐시되지 않은 딕셔너리는 저장된 모든 데이터를 반환합니다.
- 딕셔너리 이름을 쉽게 변경할 수 있습니다.

### 구문 \{#syntax\}

```sql
CREATE [OR REPLACE] DICTIONARY [IF NOT EXISTS] [db.]dictionary_name [ON CLUSTER cluster]
(
    key1  type1  [DEFAULT | EXPRESSION expr1] [IS_OBJECT_ID],
    key2  type2  [DEFAULT | EXPRESSION expr2],
    attr1 type2  [DEFAULT | EXPRESSION expr3] [HIERARCHICAL|INJECTIVE],
    attr2 type2  [DEFAULT | EXPRESSION expr4] [HIERARCHICAL|INJECTIVE]
)
PRIMARY KEY key1, key2
SOURCE(SOURCE_NAME([param1 value1 ... paramN valueN]))
LAYOUT(LAYOUT_NAME([param_name param_value]))
LIFETIME({MIN min_val MAX max_val | max_val})
SETTINGS(setting_name = setting_value, setting_name = setting_value, ...)
COMMENT 'Comment'
```

| 절                                           | 설명                                                                   |
| ------------------------------------------- | -------------------------------------------------------------------- |
| [Attributes](./attributes.md)               | 딕셔너리 속성은 테이블 컬럼과 유사한 방식으로 지정합니다. 필수 속성은 타입뿐이며, 나머지는 기본값을 사용할 수 있습니다. |
| PRIMARY KEY                                 | 딕셔너리 조회를 위한 키 컬럼을 정의합니다. 레이아웃에 따라 하나 이상의 속성을 키로 지정할 수 있습니다.          |
| [`SOURCE`](./sources/overview.md)           | 딕셔너리의 데이터 소스를 정의합니다(예: ClickHouse 테이블, HTTP, PostgreSQL).            |
| [`LAYOUT`](./layouts/overview.md)           | 딕셔너리가 메모리에 저장되는 방식을 제어합니다(예: `FLAT`, `HASHED`, `CACHE`).             |
| [`LIFETIME`](./lifetime.md)                 | 딕셔너리의 갱신 주기를 설정합니다.                                                  |
| [`ON CLUSTER`](../../../distributed-ddl.md) | 클러스터에 딕셔너리를 생성합니다. 선택 사항입니다.                                         |
| `SETTINGS`                                  | 추가 딕셔너리 설정입니다. 선택 사항입니다.                                             |
| `COMMENT`                                   | 딕셔너리에 텍스트 주석을 추가합니다. 선택 사항입니다.                                       |


## 구성 파일로 딕셔너리 생성하기 \{#creating-a-dictionary-with-a-configuration-file\}

<CloudNotSupportedBadge />

:::note
구성 파일을 사용한 딕셔너리 생성은 ClickHouse Cloud에서 지원되지 않습니다. 위에서 설명한 DDL을 사용하여 `default` USER로 딕셔너리를 생성하십시오.
:::

딕셔너리 구성 파일 형식은 다음과 같습니다:

```xml
<clickhouse>
    <comment>An optional element with any content. Ignored by the ClickHouse server.</comment>

    <!--Optional element. File name with substitutions-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Dictionary configuration. -->
        <!-- There can be any number of dictionary sections in a configuration file. -->
    </dictionary>

</clickhouse>
```

같은 파일에서 여러 개의 딕셔너리를 정의할 수 있습니다.


## 관련 콘텐츠 \{#related-content\}

- [Layouts](/sql-reference/statements/create/dictionary/layouts) — 딕셔너리가 메모리에 저장되는 방식
- [Sources](/sql-reference/statements/create/dictionary/sources) — 데이터 소스에 연결하기
- [Lifetime](./lifetime.md) — 자동 새로고침 설정
- [Attributes](./attributes.md) — 키 및 속성 설정
- [Embedded Dictionaries](./embedded.md) — 내장 지오베이스 딕셔너리
- [system.dictionaries](../../../../operations/system-tables/dictionaries.md) — 딕셔너리 정보가 포함된 시스템 테이블