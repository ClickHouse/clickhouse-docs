---
'description': 'Clickhouse-disks에 대한 문서'
'sidebar_label': 'clickhouse-disks'
'sidebar_position': 59
'slug': '/operations/utilities/clickhouse-disks'
'title': 'Clickhouse-disks'
'doc_type': 'reference'
---


# Clickhouse-disks

ClickHouse 디스크에 대한 파일 시스템과 유사한 작업을 제공하는 유틸리티입니다. 상호작용 모드와 비상호작용 모드 모두에서 작동할 수 있습니다.

## Program-wide options {#program-wide-options}

* `--config-file, -C` -- ClickHouse 구성 파일의 경로로 기본값은 `/etc/clickhouse-server/config.xml`입니다.
* `--save-logs` -- 호출된 명령의 진행 상황을 `/var/log/clickhouse-server/clickhouse-disks.log`에 기록합니다.
* `--log-level` -- 어떤 [유형](../server-configuration-parameters/settings#logger)의 이벤트를 기록할지, 기본값은 `none`입니다.
* `--disk` -- `mkdir, move, read, write, remove` 명령에 사용할 디스크입니다. 기본값은 `default`입니다.
* `--query, -q` -- 상호작용 모드를 실행하지 않고 수행할 수 있는 단일 쿼리입니다.
* `--help, -h` -- 모든 옵션 및 명령을 설명과 함께 출력합니다.

## Lazy initialization {#lazy-initialization}
구성에서 사용 가능한 모든 디스크는 지연 초기화 됩니다. 이는 명령에서 해당 디스크가 사용될 때만 디스크에 대한 해당 객체가 초기화됨을 의미합니다. 이는 유틸리티를 더 견고하게 만들고 구성에 설명되어 있지만 사용자가 사용하지 않아 초기화 중 실패할 수 있는 디스크에 손대지 않도록 하기 위해 수행됩니다. 그러나 clickhouse-disks 시작 시 초기화된 디스크가 있어야 합니다. 이 디스크는 명령줄을 통해 `--disk` 매개변수로 지정됩니다 (기본값은 `default`입니다).

## Default Disks {#default-disks}
시작 후, 구성에서 지정되지 않지만 초기화 가능할 두 개의 디스크가 있습니다.

1. **`local` Disk**: 이 디스크는 `clickhouse-disks` 유틸리티가 시작된 로컬 파일 시스템을 모방하도록 설계되었습니다. 초기 경로는 `clickhouse-disks`가 시작된 디렉토리이며, 파일 시스템의 루트 디렉토리에 마운트됩니다.

2. **`default` Disk**: 이 디스크는 구성에서 `clickhouse/path` 매개변수로 지정된 디렉토리에 로컬 파일 시스템에 마운트됩니다 (기본값은 `/var/lib/clickhouse`입니다). 초기 경로는 `/`로 설정됩니다.

## Clickhouse-disks state {#clickhouse-disks-state}
추가된 각 디스크에 대해 유틸리티는 현재 디렉토리(일반 파일 시스템과 유사한 형식)를 저장합니다. 사용자는 현재 디렉토리를 변경하고 디스크 간 전환할 수 있습니다.

상태는 프롬프트 "`disk_name`:`path_name`"에 반영됩니다.

## Commands {#commands}

이 문서 파일에서 모든 필수 위치 인수는 `<parameter>`로 언급되며, 명명된 인수는 `[--parameter value]`로 언급됩니다. 모든 위치 매개변수는 해당 이름으로 명명된 매개변수로 언급될 수 있습니다.

* `cd (change-dir, change_dir) [--disk disk] <path>`
  디스크 `disk`에서 경로 `path`로 디렉토리를 변경합니다 (기본값은 현재 디스크입니다). 디스크 전환은 발생하지 않습니다.
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  디스크 `disk_1`에서 `path-from`의 데이터를 재귀적으로 `disk_2`의 `path-to`로 복사합니다 (기본값은 현재 디스크입니다 (비상호작용 모드에서의 매개변수 `disk`)).
* `current_disk_with_path (current, current_disk, current_path)`
  형식으로 현재 상태를 출력합니다:
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  명령 `command`에 대한 도움 메시지를 출력합니다. `command`가 지정되지 않은 경우 모든 명령에 대한 정보를 출력합니다.
* `move (mv) <path-from> <path-to>`.
  현재 디스크 내에서 `path-from`에서 `path-to`로 파일 또는 디렉토리를 이동합니다.
* `remove (rm, delete) <path>`.
  현재 디스크에서 `path`를 재귀적으로 제거합니다.
* `link (ln) <path-from> <path-to>`.
  현재 디스크에서 `path-from`에서 `path-to`로 하드 링크를 생성합니다.
* `list (ls) [--recursive] <path>`
  현재 디스크의 `path`에서 파일 목록을 표시합니다. 기본적으로 비재귀적입니다.
* `list-disks (list_disks, ls-disks, ls_disks)`.
  디스크 이름 목록을 표시합니다.
* `mkdir [--recursive] <path>` 현재 디스크에서.
  디렉토리를 생성합니다. 기본적으로 비재귀적입니다.
* `read (r) <path-from> [--path-to path]`
  `path-from`에서 파일을 읽어 `path`로 (제공되지 않은 경우 `stdout`으로) 출력합니다.
* `switch-disk [--path path] <disk>`
  경로 `path`에서 디스크 `disk`로 전환합니다 (경로 `path`가 지정되지 않은 경우 기본값은 디스크 `disk`의 이전 경로입니다).
* `write (w) [--path-from path] <path-to>`.
  `path`에서 (제공되지 않은 경우 `stdin`으로, 입력은 Ctrl+D로 종료해야 함) `path-to`로 파일을 씁니다.
