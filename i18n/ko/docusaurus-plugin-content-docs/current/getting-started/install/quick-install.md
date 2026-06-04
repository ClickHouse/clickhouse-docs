---
description: 'ClickHouse CLI를 사용하여 ClickHouse를 빠르게 설치합니다'
keywords: ['ClickHouse', '설치', '빠른', 'clickhousectl', 'CLI']
sidebar_label: '빠른 설치'
slug: /install/quick-install
title: '빠른 설치'
hide_title: true
doc_type: 'guide'
---

프로덕션 환경용으로 ClickHouse를 설치할 필요가 없다면, 로컬 ClickHouse 버전을 설치하고, 서버를 시작하고, 쿼리를 실행하고, ClickHouse Cloud를 관리하는 데 도움이 되는 ClickHouse CLI(`clickhousectl`)를 사용하는 것이 가장 빠른 설정 방법입니다.

:::note Windows 사용자
ClickHouse는 Linux와 macOS에서 네이티브로 실행됩니다. Windows에서는
[Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/about) 내에서 이 단계를 실행하십시오.
:::

<VerticalStepper>
  ## ClickHouse CLI 설치 \{#install-the-cli\}

  ```bash
  curl https://clickhouse.com/cli | sh
  ```

  편의를 위해 `chctl` 별칭도 자동으로 생성됩니다.

  ## ClickHouse 설치 \{#install-clickhouse\}

  최신 안정 버전의 ClickHouse를 설치하고 이를 기본값으로 설정합니다.

  ```bash
  clickhousectl local use stable
  ```

  `local use`는 해당 버전이 아직 없으면 설치하고, 이를 기본값으로 설정하며, `~/.local/bin`(`PATH` 내)에 `clickhouse` 심볼릭 링크를 생성합니다. 따라서 `clickhouse` 바이너리를 직접 호출할 수 있습니다. 이후 이 문서에서 `clickhouse` 명령어를 실행하는 모든 단계는 그대로 동작합니다.

  :::note[use와 install]
  `clickhousectl local use <version>`은 버전을 설치하고 *동시에* 이를 기본값으로 설정하며, `PATH`의 `clickhouse` 심볼릭 링크를 업데이트합니다. 기본값을 변경하거나 심볼릭 링크를 업데이트하지 않고 버전만 다운로드하려면 대신 `clickhousectl local install <version>`을 사용하십시오.
  :::

  ## clickhouse-server 시작 \{#start-clickhouse-server\}

  ```bash
  clickhousectl local server start
  ```

  서버는 백그라운드에서 실행됩니다. 실행 중인지 확인하려면 다음 명령어를 사용하십시오.

  ```bash
  clickhousectl local server list
  ```

  ## clickhouse-client 시작 \{#start-clickhouse-client\}

  ```bash
  clickhousectl local client
  ```

  다음과 비슷한 출력이 표시됩니다.

  ```response
  ClickHouse client version 24.5.1.117 (official build).
  Connecting to localhost:9000 as user default.
  Connected to ClickHouse server version 24.5.1.

  local-host :)
  ```

  이제 ClickHouse에 SQL 명령어를 보낼 준비가 되었습니다.

  :::tip
  [Quick Start](/get-started/quick-start)에서는 테이블을 생성하고 데이터를 삽입하는 단계를 안내합니다.
  :::
</VerticalStepper>