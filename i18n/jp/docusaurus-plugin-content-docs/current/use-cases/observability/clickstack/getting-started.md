---
slug: /use-cases/observability/clickstack/getting-started
title: 'ClickStack のはじめ方'
sidebar_label: 'はじめに'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'ClickStack のはじめ方 - ClickHouse オブザーバビリティスタック'
doc_type: 'guide'
keywords: ['ClickStack', 'はじめに', 'Docker でのデプロイ', 'HyperDX UI', 'ClickHouse Cloud', 'ローカル環境へのデプロイ']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud-creds.png';
import add_connection from '@site/static/images/use-cases/observability/add_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import edit_cloud_connection from '@site/static/images/use-cases/observability/edit_cloud_connection.png';
import delete_source from '@site/static/images/use-cases/observability/delete_source.png';
import delete_connection from '@site/static/images/use-cases/observability/delete_connection.png';
import created_sources from '@site/static/images/use-cases/observability/created_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';

あらかじめビルド済みの Docker イメージが利用できるため、**ClickStack** を使い始めるのは容易です。これらのイメージは公式の ClickHouse Debian パッケージをベースとしており、さまざまなユースケースに対応できるよう複数のディストリビューションが用意されています。


## ローカルデプロイメント {#local-deployment}

最も簡単なオプションは、スタックのすべてのコアコンポーネントをバンドルした**単一イメージのディストリビューション**です:

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

このオールインワンイメージにより、単一のコマンドでフルスタックを起動できるため、テストや検証、迅速なローカルデプロイメントに最適です。

<VerticalStepper headerLevel="h3">

### docker でスタックをデプロイする {#deploy-stack-with-docker}

次のコマンドは、OpenTelemetry collector（ポート 4317 と 4318）と HyperDX UI（ポート 8080）を実行します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note イメージ名の更新
ClickStack のイメージは現在 `clickhouse/clickstack-*` として公開されています（以前は `docker.hyperdx.io/hyperdx/*`）。
:::

:::tip データと設定の永続化
コンテナの再起動間でデータと設定を永続化するには、上記の docker コマンドを変更して、`/data/db`、`/var/lib/clickhouse`、`/var/log/clickhouse-server` のパスをマウントします。

例:

```shell
# パスをマウントするようにコマンドを変更
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  clickhouse/clickstack-all-in-one:latest
```
:::

### HyperDX UI にアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザーを作成し、複雑性要件を満たすユーザー名とパスワードを設定します。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX はローカルクラスターに自動的に接続し、ログ、トレース、メトリクス、セッション用のデータソースを作成します。これにより、すぐに製品を探索できます。

### 製品を探索する {#explore-the-product}

スタックがデプロイされたら、提供しているサンプルデータセットのいずれかを試してみてください。

ローカルクラスターを使い続ける場合:

- [サンプルデータセット](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットをロードし、シンプルな問題を診断します。
- [ローカルファイルとメトリクス](/use-cases/observability/clickstack/getting-started/local-data) - ローカルの OTel collector を使って、OSX または Linux 上のローカルファイルをロードし、システムを監視します。

<br/>
または、より大きなデータセットを探索できるデモクラスターに接続することもできます:

- [リモートデモデータセット](/use-cases/observability/clickstack/getting-started/remote-demo-data) - デモ ClickHouse サービス内のデモデータセットを探索します。

</VerticalStepper>

## ClickHouse Cloud でデプロイする {#deploy-with-clickhouse-cloud}

ClickStack を ClickHouse Cloud 上にデプロイすることで、フルマネージドで安全なバックエンドの利点を享受しつつ、インジェスト、スキーマ、オブザーバビリティのワークフローを完全に制御できます。

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud サービスを作成する {#create-a-service}

サービスを作成するには、[ClickHouse Cloud のクイックスタートガイド](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)に従ってください。

### 接続情報をコピーする {#copy-cloud-connection-details}

HyperDX 用の接続情報を確認するには、ClickHouse Cloud コンソールを開き、サイドバーの <b>Connect</b> ボタンをクリックします。

HTTP 接続情報のうち、特に HTTPS エンドポイント（`endpoint`）とパスワードをコピーします。

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note 本番環境へのデプロイ
ここでは HyperDX への接続に `default` ユーザーを使用しますが、[本番環境に移行する際](/use-cases/observability/clickstack/production#create-a-user)には専用のユーザーを作成することを推奨します。
:::

### docker でデプロイする {#deploy-with-docker}

ターミナルを開き、先ほどコピーした認証情報をエクスポートします:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

次の docker コマンドを実行します:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

これにより、OpenTelemetry collector（ポート 4317 および 4318）と HyperDX UI（ポート 8080）が公開されます。

### HyperDX UI にアクセスする {#navigate-to-hyperdx-ui-cloud}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザー名と、複雑さの要件を満たすパスワードを指定してユーザーを作成します。

<Image img={hyperdx_login} alt="HyperDX Login" size="lg"/>

### ClickHouse Cloud 接続を作成する {#create-a-cloud-connection}

`Team Settings` に移動し、`Local Connection` の `Edit` をクリックします:

<Image img={edit_connection} alt="Edit Connection" size="lg"/>

接続名を `Cloud` に変更し、ClickHouse Cloud サービスの認証情報で以降のフォームを入力してから `Save` をクリックします:

<Image img={edit_cloud_connection} alt="Create Cloud connection" size="lg"/>

### 製品を試す {#explore-the-product-cloud}

スタックがデプロイされたら、用意されているデータセットのいずれかを試してみてください。

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットをロードし、簡単な問題を診断します。
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - ローカルファイルをロードし、ローカルの OTel collector を使用して OSX または Linux 上のシステムを監視します。

</VerticalStepper>

## ローカルモード {#local-mode}

ローカルモードは、認証なしで HyperDX をデプロイするための方式です。 

認証機能はサポートされていません。 

このモードは、認証や設定の永続化が不要な簡易なテスト、開発、デモ、デバッグといった用途での利用を想定しています。

### ホスト型バージョン {#hosted-version}

ローカルモードでは、[play.hyperdx.io](https://play.hyperdx.io) で提供されているホスト型の HyperDX を利用できます。

### 自己ホスト版 {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Docker で実行する {#run-local-with-docker}

自己ホストのローカルモードイメージには、OpenTelemetry collector と ClickHouse server があらかじめ設定された状態で含まれています。これにより、アプリケーションからテレメトリーデータを取り込み、最小限の外部でのセットアップで HyperDX 上に可視化できます。自己ホスト版を使い始めるには、適切なポートをフォワードして Docker コンテナを実行するだけです:

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

ローカルモードには認証機能が含まれていないため、ユーザー作成を促されることはありません。

### 接続クレデンシャルの入力 {#complete-connection-credentials}

独自の **外部 ClickHouse クラスター** に接続するには、接続クレデンシャルを手動で入力できます。

また、製品を手早く試したい場合は、**Connect to Demo Server** をクリックして、あらかじめロードされたデータセットにアクセスし、セットアップ不要で ClickStack を試すこともできます。

<Image img={hyperdx_2} alt="Credentials" size="md"/>

デモサーバーに接続した場合は、[デモデータセットに関する手順](/use-cases/observability/clickstack/getting-started/remote-demo-data)に従ってデータセットを探索できます。

</VerticalStepper>