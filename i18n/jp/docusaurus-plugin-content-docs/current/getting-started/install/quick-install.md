---
description: 'ClickHouse CLI を使用して ClickHouse をすばやくインストール'
keywords: ['ClickHouse', 'インストール', 'クイック', 'clickhousectl', 'CLI']
sidebar_label: 'クイックインストール'
slug: /install/quick-install
title: 'クイックインストール'
hide_title: true
doc_type: 'guide'
---

ClickHouse を本番環境向けにインストールする必要がない場合は、ClickHouse CLI (`clickhousectl`) を使うのが最も手早い
セットアップ方法です。これを使うと、ローカルの ClickHouse バージョンのインストール、
サーバーの起動、クエリの実行、ClickHouse
Cloud の管理を行えます。

:::note Windows ユーザー
ClickHouse は Linux と macOS でネイティブに動作します。Windows では、これらの手順を
[Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/about) 内で実行してください。
:::

<VerticalStepper>
  ## ClickHouse CLI をインストール \{#install-the-cli\}

  ```bash
  curl https://clickhouse.com/cli | sh
  ```

  利便性のため、`chctl` エイリアスも自動的に作成されます。

  ## ClickHouse をインストール \{#install-clickhouse\}

  ClickHouse の最新の stable バージョンをインストールし、デフォルトに設定します。

  ```bash
  clickhousectl local use stable
  ```

  `local use` は、そのバージョンがまだ存在しない場合はインストールし、それを
  デフォルトとして設定し、`~/.local/bin` (`PATH` 上) に `clickhouse` シンボリックリンクを作成します。
  これにより、`clickhouse` binary を直接呼び出せるようになります。以降、このドキュメント内で
  `clickhouse` コマンドを実行する手順は、そのまま動作します。

  :::note[Use と install の違い]
  `clickhousectl local use <version>` は、バージョンをインストールし、さらにそれを
  デフォルトに設定して、`PATH` 上の `clickhouse` シンボリックリンクを更新します。デフォルトを変更したり
  シンボリックリンクを更新したりせずにバージョンだけをダウンロードするには、代わりに
  `clickhousectl local install <version>` を使用してください。
  :::

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