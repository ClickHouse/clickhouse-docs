---
slug: /sql-reference/statements/create/dictionary/sources/executable-pool
title: 'Executable Pool 딕셔너리 소스'
sidebar_position: 4
sidebar_label: 'Executable Pool'
description: 'ClickHouse에서 딕셔너리 소스로 사용할 Executable Pool을 구성합니다.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Executable pool은 프로세스 풀에서 데이터를 로드할 수 있게 합니다.
이 소스는 모든 데이터를 한 번에 소스에서 로드해야 하는 딕셔너리 레이아웃과는 함께 동작하지 않습니다.

Executable pool은 딕셔너리가 다음 레이아웃 중 하나를 사용하여 [저장](../layouts/#ways-to-store-dictionaries-in-memory)되는 경우에 동작합니다:

* `cache`
* `complex_key_cache`
* `ssd_cache`
* `complex_key_ssd_cache`
* `direct`
* `complex_key_direct`

Executable pool은 지정된 명령으로 프로세스 풀을 생성하고, 프로세스가 종료될 때까지 실행 상태를 유지합니다. 프로그램은 가능한 동안 STDIN에서 데이터를 읽고, 결과를 STDOUT으로 출력해야 합니다. STDIN에서 다음 데이터 블록을 대기할 수 있습니다. ClickHouse는 데이터 블록을 처리한 후 STDIN을 닫지 않고, 필요할 때 또 다른 데이터 청크를 파이프를 통해 전달합니다. 실행 스크립트는 이러한 방식의 데이터 처리에 대비되어 있어야 하며, STDIN을 폴링하고 데이터를 STDOUT으로 가능한 한 일찍 플러시해야 합니다.

설정 예:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(EXECUTABLE_POOL(
        command 'while read key; do printf "$key\tData for key $key\n"; done'
        format 'TabSeparated'
        pool_size 10
        max_command_execution_time 10
        implicit_key false
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <executable_pool>
            <command><command>while read key; do printf "$key\tData for key $key\n"; done</command</command>
            <format>TabSeparated</format>
            <pool_size>10</pool_size>
            <max_command_execution_time>10<max_command_execution_time>
            <implicit_key>false</implicit_key>
        </executable_pool>
    </source>
    ```
  </TabItem>
</Tabs>

설정 필드:

| Setting                       | Description                                                                                                                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`                     | 실행 파일의 절대 경로이거나, 프로그램 디렉터리가 `PATH`에 포함되어 있는 경우 파일 이름입니다.                                                                                                                                                                                                                                                                          |
| `format`                      | 파일 포맷입니다. [Formats](/sql-reference/formats)에 설명된 모든 포맷을 지원합니다.                                                                                                                                                                                                                                                                    |
| `pool_size`                   | 풀 크기입니다. `pool_size`가 0으로 지정되면 풀 크기에 대한 제한이 없습니다. 기본값은 `16`입니다.                                                                                                                                                                                                                                                                   |
| `command_termination_timeout` | 실행 스크립트에는 기본 read-write 루프가 포함되어 있어야 합니다. 딕셔너리가 삭제되면 파이프가 닫히고, 실행 파일은 ClickHouse가 자식 프로세스에 SIGTERM 시그널을 보내기 전에 종료하기 위해 `command_termination_timeout`초가 주어집니다. 초 단위로 지정합니다. 기본값은 `10`입니다. 선택 사항입니다.                                                                                                                                |
| `max_command_execution_time`  | 데이터 블록을 처리하기 위한 실행 스크립트 명령의 최대 실행 시간입니다. 초 단위로 지정합니다. 기본값은 `10`입니다. 선택 사항입니다.                                                                                                                                                                                                                                                     |
| `command_read_timeout`        | 명령 stdout에서 데이터를 읽기 위한 타임아웃으로, 밀리초 단위입니다. 기본값은 `10000`입니다. 선택 사항입니다.                                                                                                                                                                                                                                                              |
| `command_write_timeout`       | 명령 stdin에 데이터를 쓰기 위한 타임아웃으로, 밀리초 단위입니다. 기본값은 `10000`입니다. 선택 사항입니다.                                                                                                                                                                                                                                                                |
| `implicit_key`                | 실행 소스 파일은 값만 반환할 수 있으며, 요청된 키에 대한 대응 관계는 결과에서 행의 순서에 의해 암묵적으로 결정됩니다. 기본값은 `false`입니다. 선택 사항입니다.                                                                                                                                                                                                                                   |
| `execute_direct`              | `execute_direct` = `1`이면, `command`는 [user&#95;scripts&#95;path](/operations/server-configuration-parameters/settings#user_scripts_path)에 지정된 user&#95;scripts 폴더 내에서 검색됩니다. 추가 스크립트 인자는 공백 구분자를 사용하여 지정할 수 있습니다. 예: `script_name arg1 arg2`. `execute_direct` = `0`이면, `command`는 `bin/sh -c`의 인자로 전달됩니다. 기본값은 `1`입니다. 선택 사항입니다. |
| `send_chunk_header`           | 프로세스로 데이터 청크를 보내기 전에 행 개수를 전송할지 여부를 제어합니다. 기본값은 `false`입니다. 선택 사항입니다.                                                                                                                                                                                                                                                             |

이 딕셔너리 소스는 XML 설정을 통해서만 구성할 수 있습니다. DDL을 통해 executable 소스를 사용하는 딕셔너리를 생성하는 기능은 비활성화되어 있으며, 그렇지 않으면 DB 사용자가 ClickHouse 노드에서 임의의 바이너리를 실행할 수 있게 되기 때문입니다.
