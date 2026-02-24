---
description: 'ClickHouse Keeper 클라이언트 유틸리티에 대한 문서'
sidebar_label: 'clickhouse-keeper-client'
slug: /operations/utilities/clickhouse-keeper-client
title: 'clickhouse-keeper-client 유틸리티'
doc_type: 'reference'
---



# clickhouse-keeper-client 유틸리티 \{#clickhouse-keeper-client-utility\}

네이티브 프로토콜을 사용하여 clickhouse-keeper와 상호 작용하는 클라이언트 애플리케이션입니다.



## Keys \{#clickhouse-keeper-client\}

-   `-q QUERY`, `--query=QUERY` — 실행할 쿼리입니다. 이 매개변수를 지정하지 않으면 `clickhouse-keeper-client`가 대화형 모드로 시작됩니다.
-   `-h HOST`, `--host=HOST` — 서버 호스트입니다. 기본값: `localhost`.
-   `-p N`, `--port=N` — 서버 포트입니다. 기본값: 9181
-   `-c FILE_PATH`, `--config-file=FILE_PATH` — 연결 문자열을 가져올 구성 파일 경로를 설정합니다. 기본값: `config.xml`.
-   `--connection-timeout=TIMEOUT` — 연결 타임아웃을 초 단위로 설정합니다. 기본값: 10s.
-   `--session-timeout=TIMEOUT` — 세션 타임아웃을 초 단위로 설정합니다. 기본값: 10s.
-   `--operation-timeout=TIMEOUT` — 작업 타임아웃을 초 단위로 설정합니다. 기본값: 10s.
-   `--history-file=FILE_PATH` — 히스토리 파일 경로를 설정합니다. 기본값: `~/.keeper-client-history`.
-   `--log-level=LEVEL` — 로그 레벨을 설정합니다. 기본값: `information`.
-   `--no-confirmation` — 설정되면 여러 명령에서 확인을 요구하지 않습니다. 대화형 모드의 기본값은 `false`, 쿼리 모드의 기본값은 `true`입니다.
-   `--help` — 도움말 메시지를 표시합니다.



## 예제 \{#clickhouse-keeper-client-example\}

```bash
./clickhouse-keeper-client -h localhost -p 9181 --connection-timeout 30 --session-timeout 30 --operation-timeout 30
Connected to ZooKeeper at [::1]:9181 with session_id 137
/ :) ls
keeper foo bar
/ :) cd 'keeper'
/keeper :) ls
api_version
/keeper :) cd 'api_version'
/keeper/api_version :) ls

/keeper/api_version :) cd 'xyz'
Path /keeper/api_version/xyz does not exist
/keeper/api_version :) cd ../../
/ :) ls
keeper foo bar
/ :) get 'keeper/api_version'
2
```


## 명령어 \{#clickhouse-keeper-client-commands\}

-   `ls '[path]'` -- 지정된 경로의 노드를 나열합니다 (기본값: 현재 작업 디렉터리)
-   `cd '[path]'` -- 작업 경로를 변경합니다 (기본값: `.`)
-   `cp '<src>' '<dest>'`  -- 'src' 노드를 'dest' 경로로 복사합니다
-   `cpr '<src>' '<dest>'`  -- 'src' 노드 서브트리를 'dest' 경로로 복사합니다
-   `mv '<src>' '<dest>'`  -- 'src' 노드를 'dest' 경로로 이동합니다
-   `mvr '<src>' '<dest>'`  -- 'src' 노드 서브트리를 'dest' 경로로 이동합니다
-   `exists '<path>'` -- 노드가 존재하면 `1`, 그렇지 않으면 `0`을 반환합니다
-   `set '<path>' <value> [version]` -- 노드의 값을 업데이트합니다. 버전이 일치할 때만 업데이트합니다 (기본값: -1)
-   `create '<path>' <value> [mode]` -- 지정된 값으로 새 노드를 생성합니다
-   `touch '<path>'` -- 값이 빈 문자열인 새 노드를 생성합니다. 노드가 이미 존재하더라도 예외를 발생시키지 않습니다
-   `get '<path>'` -- 노드의 값을 반환합니다
-   `rm '<path>' [version]` -- 버전이 일치하는 경우에만 노드를 제거합니다 (기본값: -1)
-   `rmr '<path>' [limit]` -- 서브트리 크기가 limit보다 작은 경우 해당 경로를 재귀적으로 삭제합니다. 삭제 전에 확인이 필요합니다 (기본 limit = 100)
-   `flwc <command>` -- four-letter-word 명령을 실행합니다
-   `help` -- 이 메시지를 출력합니다
-   `get_direct_children_number '[path]'` -- 특정 경로 아래의 직접 자식 노드 개수를 가져옵니다
-   `get_all_children_number '[path]'` -- 특정 경로 아래의 모든 자식 노드 개수를 가져옵니다
-   `get_stat '[path]'` -- 노드의 stat 정보를 반환합니다 (기본값: `.`)
-   `find_super_nodes <threshold> '[path]'` -- 지정된 경로에서 자식 수가 threshold보다 큰 노드를 찾습니다 (기본값: `.`)
-   `delete_stale_backups` -- 현재 비활성 상태인 백업용 ClickHouse 노드를 삭제합니다
-   `find_big_family [path] [n]` -- 서브트리에서 자식이 가장 많은 상위 n개 노드를 반환합니다 (기본 경로 = `.` 및 n = 10)
-   `sync '<path>'` -- 프로세스와 리더 간에 노드를 동기화합니다
-   `reconfig <add|remove|set> "<arg>" [version]` -- Keeper 클러스터를 재구성합니다. /docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration을 참조하십시오
