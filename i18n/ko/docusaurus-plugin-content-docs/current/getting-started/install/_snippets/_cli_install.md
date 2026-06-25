# ClickHouse CLI로 ClickHouse 설치 \{#install-clickhouse-using-the-clickhouse-cli\}

ClickHouse CLI(`clickhousectl`)를 사용하면 로컬 환경의 ClickHouse 버전을 설치 및 관리하고,
서버를 시작하며 쿼리를 실행할 수 있습니다.

<VerticalStepper>
  ## ClickHouse CLI 설치 \{#install-the-cli\}

  ```bash
  curl https://clickhouse.com/cli | sh
  ```

  편의를 위해 `chctl` 별칭도 자동으로 생성됩니다.

  ## ClickHouse 설치 \{#cli-install-clickhouse\}

  최신 안정 버전의 ClickHouse를 설치하고 기본값으로 설정하십시오:

  ```bash
  clickhousectl local use stable
  ```

  `local use`는 해당 버전이 아직 없으면 설치하고, 기본값으로 설정하며, `~/.local/bin`(`PATH` 상)에 `clickhouse` 심볼릭 링크를 생성하므로 `clickhouse` 바이너리를 직접 호출할 수 있습니다. 따라서 이 문서의 이후 단계에서 `clickhouse` 명령어를 실행하는 경우 그대로 동작합니다.

  특정 버전을 선택할 수도 있습니다:

  ```bash
  clickhousectl local use lts             # 최신 LTS 릴리스
  clickhousectl local use 25.6            # 최신 25.6.x.x
  clickhousectl local use 25.6.1.1        # 정확한 버전
  ```

  :::note[use와 install]
  `clickhousectl local use <version>`은 버전을 설치하고 *동시에* 기본값으로 설정하며,
  `PATH` 상의 `clickhouse` 심볼릭 링크를 업데이트합니다. 기본값을 변경하거나 심볼릭 링크를
  업데이트하지 않고 버전만 다운로드하려면 대신
  `clickhousectl local install <version>`을 사용하십시오.
  :::

  ## ClickHouse 서버 시작 \{#cli-start-clickhouse-server\}

  ```bash
  clickhousectl local server start
  ```

  서버는 백그라운드에서 실행됩니다. 실행 중인지 확인하려면 다음 명령어를 사용하십시오:

  ```bash
  clickhousectl local server list
  ```

  ## clickhouse-client 시작 \{#cli-start-clickhouse-client\}

  ```bash
  clickhousectl local client
  ```

  다음과 비슷한 출력이 표시됩니다:

  ```response
  ClickHouse client version 24.5.1.117 (official build).
  Connecting to localhost:9000 as user default.
  Connected to ClickHouse server version 24.5.1.

  local-host :)
  ```

  이제 ClickHouse에 SQL 명령어를 보낼 준비가 되었습니다!

  :::tip
  [빠른 시작](/get-started/quick-start)에서는 테이블을 생성하고 데이터를 삽입하는 단계를 안내합니다.
  :::
</VerticalStepper>