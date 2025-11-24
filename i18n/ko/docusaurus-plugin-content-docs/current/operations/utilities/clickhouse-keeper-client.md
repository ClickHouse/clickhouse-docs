---
'description': 'ClickHouse Keeper 클라이언트 유틸리티에 대한 문서'
'sidebar_label': 'clickhouse-keeper-client'
'slug': '/operations/utilities/clickhouse-keeper-client'
'title': 'clickhouse-keeper-client 유틸리티'
'doc_type': 'reference'
---


# clickhouse-keeper-client 유틸리티

clickhouse-keeper와의 상호작용을 위한 클라이언트 애플리케이션.

## 키 {#clickhouse-keeper-client}

-   `-q QUERY`, `--query=QUERY` — 실행할 쿼리. 이 매개변수가 전달되지 않으면 `clickhouse-keeper-client`는 대화형 모드로 시작됩니다.
-   `-h HOST`, `--host=HOST` — 서버 호스트. 기본값: `localhost`.
-   `-p N`, `--port=N` — 서버 포트. 기본값: 9181
-   `-c FILE_PATH`, `--config-file=FILE_PATH` — 연결 문자열을 얻기 위한 설정 파일 경로. 기본값: `config.xml`.
-   `--connection-timeout=TIMEOUT` — 초 단위의 연결 시간 초과 설정. 기본값: 10s.
-   `--session-timeout=TIMEOUT` — 초 단위의 세션 시간 초과 설정. 기본값: 10s.
-   `--operation-timeout=TIMEOUT` — 초 단위의 작업 시간 초과 설정. 기본값: 10s.
-   `--history-file=FILE_PATH` — 기록 파일의 경로 설정. 기본값: `~/.keeper-client-history`.
-   `--log-level=LEVEL` — 로그 수준 설정. 기본값: `information`.
-   `--no-confirmation` — 설정 시 몇 가지 명령에 대한 확인을 요구하지 않음. 대화형의 경우 기본값: `false`, 쿼리의 경우 기본값: `true`
-   `--help` — 도움말 메시지를 표시합니다.

## 예제 {#clickhouse-keeper-client-example}

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

## 명령어 {#clickhouse-keeper-client-commands}

-   `ls '[path]'` -- 주어진 경로의 노드를 나열합니다 (기본값: cwd)
-   `cd '[path]'` -- 작업 경로를 변경합니다 (기본값 `.`)
-   `cp '<src>' '<dest>'`  -- 'src' 노드를 'dest' 경로로 복사합니다
-   `cpr '<src>' '<dest>'`  -- 'src' 노드 서브트리를 'dest' 경로로 복사합니다
-   `mv '<src>' '<dest>'`  -- 'src' 노드를 'dest' 경로로 이동합니다
-   `mvr '<src>' '<dest>'`  -- 'src' 노드 서브트리를 'dest' 경로로 이동합니다
-   `exists '<path>'` -- 노드가 존재하면 `1`을 반환하고, 그렇지 않으면 `0`을 반환합니다
-   `set '<path>' <value> [version]` -- 노드의 값을 업데이트합니다. 버전이 일치할 때만 업데이트 됩니다 (기본값: -1)
-   `create '<path>' <value> [mode]` -- 설정된 값으로 새로운 노드를 생성합니다
-   `touch '<path>'` -- 빈 문자열을 값으로 가지는 새로운 노드를 생성합니다. 노드가 이미 존재하는 경우 예외를 발생시키지 않습니다
-   `get '<path>'` -- 노드의 값을 반환합니다
-   `rm '<path>' [version]` -- 버전이 일치할 경우에만 노드를 제거합니다 (기본값: -1)
-   `rmr '<path>' [limit]` -- 서브트리 크기가 제한보다 작으면 경로를 재귀적으로 삭제합니다. 확인이 필요합니다 (기본 제한 = 100)
-   `flwc <command>` -- 네 글자 단어 명령어를 실행합니다
-   `help` -- 이 메시지를 출력합니다
-   `get_direct_children_number '[path]'` -- 특정 경로 아래의 직접 자식 노드 수를 가져옵니다
-   `get_all_children_number '[path]'` -- 특정 경로 아래의 모든 자식 노드 수를 가져옵니다
-   `get_stat '[path]'` -- 노드의 통계를 반환합니다 (기본값 `.`)
-   `find_super_nodes <threshold> '[path]'` -- 주어진 경로에 대해 자식 수가 임계값보다 큰 노드를 찾습니다 (기본값 `.`)
-   `delete_stale_backups` -- 현재 비활성화된 백업용 ClickHouse 노드를 삭제합니다
-   `find_big_family [path] [n]` -- 서브트리에서 가장 큰 패밀리를 가진 상위 n 노드를 반환합니다 (기본 경로 = `.` 및 n = 10)
-   `sync '<path>'` -- 프로세스와 리더 간의 노드를 동기화합니다
-   `reconfig <add|remove|set> "<arg>" [version]` -- Keeper 클러스터의 재구성을 수행합니다. /docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration 을 참조하세요.
