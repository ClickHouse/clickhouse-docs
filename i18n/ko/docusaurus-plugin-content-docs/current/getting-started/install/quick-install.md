---
description: 'CLI 또는 curl로 ClickHouse를 빠르게 설치합니다'
keywords: ['ClickHouse', 'install', 'quick', 'curl', 'clickhousectl', 'CLI']
sidebar_label: '빠른 설치'
slug: /install/quick-install
title: '빠른 설치'
hide_title: true
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import QuickInstall from './_snippets/_quick_install.md'

# 빠른 설치 \{#quick-install\}

프로덕션 환경용으로 ClickHouse를 설치할 필요가 없다면, ClickHouse CLI를 사용하거나 `curl`로 설치 스크립트를 실행하는 것이 가장 빠른 설정 방법입니다.

<Tabs>
  <TabItem value="cli" label="ClickHouse CLI" default>
    ClickHouse CLI(`clickhousectl`)를 사용하면 로컬 ClickHouse 버전을 설치하고 관리하며, 서버를 시작하고, 쿼리를 실행할 수 있습니다.

    <VerticalStepper>
      ## ClickHouse CLI 설치 \{#install-the-cli\}

      ```bash
      curl https://clickhouse.com/cli | sh
      ```

      편의를 위해 `chctl` 별칭도 자동으로 생성됩니다.

      ## ClickHouse 설치 \{#install-clickhouse\}

      ```bash
      clickhousectl local install stable
      ```

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
  </TabItem>

  <TabItem value="curl" label="Curl script">
    <QuickInstall />
  </TabItem>
</Tabs>