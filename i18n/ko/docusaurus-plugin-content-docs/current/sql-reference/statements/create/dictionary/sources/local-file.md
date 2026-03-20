---
slug: /sql-reference/statements/create/dictionary/sources/local-file
title: '로컬 파일 딕셔너리 소스'
sidebar_position: 2
sidebar_label: '로컬 파일'
description: 'ClickHouse에서 로컬 파일을 딕셔너리 소스로 설정합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

로컬 파일 소스는 로컬 파일 시스템의 파일에서 딕셔너리 데이터를 로드합니다. 이는 TSV, CSV 또는 기타 [지원되는 포맷](/sql-reference/formats)과 같은 포맷의 플랫 파일(flat file)로 저장할 수 있는 작고 정적인 조회용 테이블에 유용합니다.

설정 예시는 다음과 같습니다:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
      <file>
        <path>/opt/dictionaries/os.tsv</path>
        <format>TabSeparated</format>
      </file>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

설정 필드는 다음과 같습니다:

| Setting  | Description                                                        |
| -------- | ------------------------------------------------------------------ |
| `path`   | 파일의 절대 경로입니다.                                                      |
| `format` | 파일 포맷입니다. [Formats](/sql-reference/formats)에 설명되어 있는 모든 포맷이 지원됩니다. |

DDL 명령어(`CREATE DICTIONARY ...`)를 통해 소스가 `FILE`인 딕셔너리를 생성하는 경우, ClickHouse 노드에서 데이터베이스 사용자가 임의의 파일에 접근하지 못하도록 소스 파일은 `user_files` 디렉터리에 위치해야 합니다.

**관련 항목**

* [Dictionary function](/sql-reference/table-functions/dictionary)
