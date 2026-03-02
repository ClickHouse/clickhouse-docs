---
description: 'ClickHouse-disks에 대한 문서'
sidebar_label: 'clickhouse-disks'
sidebar_position: 59
slug: /operations/utilities/clickhouse-disks
title: 'ClickHouse-disks'
doc_type: 'reference'
---



# Clickhouse-disks \{#clickhouse-disks\}

ClickHouse 디스크에 대해 파일 시스템과 유사한 작업을 수행하는 유틸리티입니다. 대화형 모드와 비대화형 모드 모두에서 동작할 수 있습니다.



## 프로그램 전역 옵션 \{#program-wide-options\}

* `--config-file, -C` -- ClickHouse 설정 파일 경로입니다. 기본값은 `/etc/clickhouse-server/config.xml`입니다.
* `--save-logs` -- 실행한 명령의 진행 상황을 `/var/log/clickhouse-server/clickhouse-disks.log`에 기록합니다.
* `--log-level` -- 기록할 이벤트의 [유형](../server-configuration-parameters/settings#logger)을 지정합니다. 기본값은 `none`입니다.
* `--disk` -- `mkdir, move, read, write, remove` 명령에 사용할 디스크를 지정합니다. 기본값은 `default`입니다.
* `--query, -q` -- 대화형 모드를 시작하지 않고 단일 쿼리를 실행합니다.
* `--help, -h` -- 모든 옵션과 명령 및 해당 설명을 출력합니다.



## 지연 초기화 \{#lazy-initialization\}
설정(config)에 정의된 모든 디스크는 지연 초기화됩니다. 이는 특정 디스크에 대한 객체가 해당 디스크가 어떤 명령에서 실제로 사용될 때에만 초기화된다는 의미입니다. 이러한 방식은 유틸리티의 안정성을 높이고, 설정에는 정의되어 있지만 사용자가 사용하지 않는 디스크를 건드리지 않도록 하여 초기화 과정에서 발생할 수 있는 장애를 방지하기 위한 것입니다. 그러나 clickhouse-disks를 시작할 때는 반드시 하나의 디스크가 초기화되어 있어야 합니다. 이 디스크는 명령줄(command line)의 `--disk` 매개변수로 지정되며, 기본값은 `default`입니다.



## 기본 디스크 \{#default-disks\}
실행되면, 설정에는 명시되어 있지 않지만 초기화에 사용할 수 있는 디스크가 두 개 있습니다.

1. **`local` 디스크**: 이 디스크는 `clickhouse-disks` 유틸리티가 실행된 로컬 파일 시스템을 모방하도록 설계되었습니다. 초기 경로는 `clickhouse-disks`가 시작된 디렉터리이고, 파일 시스템의 루트 디렉터리(`/`)에 마운트됩니다.

2. **`default` 디스크**: 이 디스크는 설정의 `clickhouse/path` 매개변수로 지정된 디렉터리(기본값은 `/var/lib/clickhouse`)에 로컬 파일 시스템 상에서 마운트됩니다. 초기 경로는 `/`로 설정됩니다.



## Clickhouse-disks 상태 \{#clickhouse-disks-state\}
추가된 각 디스크에 대해 유틸리티는 현재 디렉터리(일반 파일 시스템의 현재 디렉터리와 동일한 개념)를 저장합니다. 현재 디렉터리를 변경하거나 디스크를 전환할 수 있습니다.

상태는 프롬프트 "`disk_name`:`path_name`"에 반영됩니다.



## Commands \{#commands\}

이 문서에서는 필수 위치 인자는 `<parameter>`로, 이름 있는 인자는 `[--parameter value]`로 표기합니다. 모든 위치 인자는 동일한 이름을 사용해 이름 있는 인자로도 지정할 수 있습니다.

* `cd (change-dir, change_dir) [--disk disk] <path>`
  디스크 `disk`(기본값은 현재 디스크)에서 경로 `path`로 디렉터리를 변경합니다. 디스크는 변경되지 않습니다.
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  디스크 `disk_1`의 `path-from`에서 디스크 `disk_2`의 `path-to`로 데이터를 재귀적으로 복사합니다(각 디스크 인자의 기본값은 현재 디스크이며, `non-interactive` 모드에서는 매개변수 `disk`가 사용됩니다).
* `current_disk_with_path (current, current_disk, current_path)`
  현재 상태를 다음 형식으로 출력합니다:
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  명령어 `command`에 대한 도움말 메시지를 출력합니다. `command`가 지정되지 않으면 모든 명령어에 대한 정보를 출력합니다.
* `move (mv) <path-from> <path-to>`.
  현재 디스크 내에서 파일 또는 디렉터리를 `path-from`에서 `path-to`로 이동합니다.
* `remove (rm, delete) <path>`.
  현재 디스크에서 `path`를 재귀적으로 삭제합니다.
* `link (ln) <path-from> <path-to>`.
  현재 디스크에서 `path-from`에서 `path-to`로 하드링크를 생성합니다.
* `list (ls) [--recursive] <path>`
  현재 디스크의 `path`에 있는 파일을 나열합니다. 기본값은 비재귀적입니다.
* `list-disks (list_disks, ls-disks, ls_disks)`.
  디스크 이름을 나열합니다.
* `mkdir [--recursive] <path>` on a current disk.
  현재 디스크에 디렉터리를 생성합니다. 기본값은 비재귀적입니다.
* `read (r) <path-from> [--path-to path]`
  `path-from`에서 파일을 읽어 `path`로 출력합니다(지정하지 않으면 `stdout`으로 출력합니다).
* `switch-disk [--path path] <disk>`
  경로 `path`를 사용하여 디스크 `disk`로 전환합니다(`path`가 지정되지 않으면 기본값은 디스크 `disk`에서 사용하던 이전 경로입니다).
* `write (w) [--path-from path] <path-to>`.
  `path`에서 파일을 `path-to`로 기록합니다(`path`가 지정되지 않으면 `stdin`에서 읽으며, 입력은 Ctrl+D로 종료해야 합니다).
