---
slug: /sql-reference/statements/create/dictionary/sources/executable-file
title: '실행 파일 딕셔너리 소스'
sidebar_position: 3
sidebar_label: '실행 파일'
description: 'ClickHouse에서 실행 파일을 딕셔너리 소스로 설정합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

실행 파일을 사용하는 방식은 [딕셔너리가 메모리에 저장되는 방법](../layouts/)에 따라 달라집니다. 딕셔너리가 `cache` 및 `complex_key_cache`를 사용해 저장되는 경우 ClickHouse는 실행 파일의 STDIN으로 요청을 전송해 필요한 키를 조회합니다. 그렇지 않은 경우 ClickHouse는 실행 파일을 시작하고 그 출력을 딕셔너리 데이터로 처리합니다.

설정 예시:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(EXECUTABLE(
        command 'cat /opt/dictionaries/os.tsv'
        format 'TabSeparated'
        implicit_key false
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <executable>
            <command>cat /opt/dictionaries/os.tsv</command>
            <format>TabSeparated</format>
            <implicit_key>false</implicit_key>
        </executable>
    </source>
    ```
  </TabItem>
</Tabs>

설정 필드:

| Setting                       | Description                                                                                                                                                                                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`                     | 실행 파일의 절대 경로이거나, (명령의 디렉터리가 `PATH`에 있는 경우) 파일 이름입니다.                                                                                                                                                                                                                                                                               |
| `format`                      | 파일 형식입니다. [Formats](/sql-reference/formats)에 설명된 모든 형식을 지원합니다.                                                                                                                                                                                                                                                                     |
| `command_termination_timeout` | 실행 스크립트에는 기본 읽기/쓰기 루프가 포함되어야 합니다. 딕셔너리가 파괴된 후 파이프가 닫히며, 실행 파일은 ClickHouse가 자식 프로세스에 SIGTERM 신호를 보내기 전에 종료할 수 있도록 `command_termination_timeout` 초가 주어집니다. 초 단위로 지정합니다. 기본값은 `10`입니다. 선택 사항입니다.                                                                                                                                      |
| `command_read_timeout`        | 명령 stdout에서 데이터를 읽는 타임아웃(밀리초)입니다. 기본값은 `10000`입니다. 선택 사항입니다.                                                                                                                                                                                                                                                                       |
| `command_write_timeout`       | 명령 stdin에 데이터를 쓰는 타임아웃(밀리초)입니다. 기본값은 `10000`입니다. 선택 사항입니다.                                                                                                                                                                                                                                                                         |
| `implicit_key`                | 실행 소스 파일은 값만 반환할 수 있으며, 요청된 키와의 대응은 결과의 행 순서에 따라 암묵적으로 결정됩니다. 기본값은 `false`입니다.                                                                                                                                                                                                                                                     |
| `execute_direct`              | `execute_direct` = `1`인 경우 `command`는 [user&#95;scripts&#95;path](/operations/server-configuration-parameters/settings#user_scripts_path)에 지정된 user&#95;scripts 폴더 내에서 검색됩니다. 공백 구분자를 사용해 추가 스크립트 인자를 지정할 수 있습니다. 예: `script_name arg1 arg2`. `execute_direct` = `0`인 경우 `command`는 `bin/sh -c`의 인자로 전달됩니다. 기본값은 `0`입니다. 선택 사항입니다. |
| `send_chunk_header`           | 프로세스로 데이터 청크를 전송하기 전에, 먼저 해당 청크의 행 수를 보낼지 여부를 제어합니다. 기본값은 `false`입니다. 선택 사항입니다.                                                                                                                                                                                                                                                    |

이 딕셔너리 소스는 XML 설정을 통해서만 구성할 수 있습니다. DDL을 통해 실행 가능한 소스를 사용하는 딕셔너리를 생성하는 기능은 비활성화되어 있으며, 그렇지 않으면 DB 사용자가 ClickHouse 노드에서 임의의 바이너리를 실행할 수 있게 되기 때문입니다.
