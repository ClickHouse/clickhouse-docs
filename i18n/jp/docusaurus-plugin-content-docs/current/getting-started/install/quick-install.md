---
description: 'CLI または curl を使用して ClickHouse をすばやくインストール'
keywords: ['ClickHouse', 'インストール', 'クイック', 'curl', 'clickhousectl', 'CLI']
sidebar_label: 'クイックインストール'
slug: /install/quick-install
title: 'クイックインストール'
hide_title: true
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import QuickInstall from './_snippets/_quick_install.md'

# クイックインストール \{#quick-install\}

ClickHouse を本番環境向けにインストールする必要がない場合は、ClickHouse CLI を使うか、curl でインストールスクリプトを実行するのが、最も手早く
セットアップする方法です。

<Tabs>
  <TabItem value="cli" label="ClickHouse CLI" default>
    ClickHouse CLI (`clickhousectl`) を使用すると、ローカルの ClickHouse
    バージョンのインストールと管理、サーバーの起動、クエリの実行を行えます。

    <VerticalStepper>
      ## ClickHouse CLI をインストール \{#install-the-cli\}

      ```bash
      curl https://clickhouse.com/cli | sh
      ```

      利便性のため、`chctl` エイリアスも自動的に作成されます。

      ## ClickHouse をインストール \{#install-clickhouse\}

      ```bash
      clickhousectl local install stable
      ```

      ## clickhouse-server を起動 \{#start-clickhouse-server\}

      ```bash
      clickhousectl local server start
      ```

      サーバーはバックグラウンドで実行されます。実行中であることを確認するには、次を実行します。

      ```bash
      clickhousectl local server list
      ```

      ## clickhouse-client を起動 \{#start-clickhouse-client\}

      ```bash
      clickhousectl local client
      ```

      次のような表示が出ます。

      ```response
      ClickHouse client version 24.5.1.117 (official build).
      Connecting to localhost:9000 as user default.
      Connected to ClickHouse server version 24.5.1.

      local-host :)
      ```

      これで、ClickHouse に SQL コマンドを送信する準備が整いました。

      :::tip
      [クイックスタート](/get-started/quick-start) では、テーブルの作成とデータの挿入手順を順を追って説明します。
      :::
    </VerticalStepper>
  </TabItem>

  <TabItem value="curl" label="Curl スクリプト">
    <QuickInstall />
  </TabItem>
</Tabs>