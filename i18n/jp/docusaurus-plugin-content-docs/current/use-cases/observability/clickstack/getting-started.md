---
slug: /use-cases/observability/clickstack/getting-started
title: 'ClickStack のはじめ方'
sidebar_label: 'はじめに'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'ClickStack のはじめ方 - ClickHouse Observability スタック'
doc_type: 'ガイド'
keywords: ['ClickStack', 'はじめに', 'Docker デプロイメント', 'HyperDX UI', 'ClickHouse Cloud', 'ローカル デプロイメント']
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

事前ビルド済みの Docker イメージが利用できるため、**ClickStack** はすぐに使い始めることができます。これらのイメージは公式の ClickHouse Debian パッケージに基づいており、さまざまなユースケースに対応する複数のディストリビューションが用意されています。


## ローカルデプロイメント {#local-deployment}

最もシンプルな選択肢は、スタックのすべてのコアコンポーネントをバンドルした**単一イメージディストリビューション**です：

- **HyperDX UI**
- **OpenTelemetry（OTel）コレクター**
- **ClickHouse**

このオールインワンイメージを使用すると、単一のコマンドでフルスタックを起動できるため、テスト、実験、または迅速なローカルデプロイメントに最適です。

<VerticalStepper headerLevel="h3">

### Dockerでスタックをデプロイする {#deploy-stack-with-docker}

以下のコマンドは、OpenTelemetryコレクター（ポート4317および4318）とHyperDX UI（ポート8080）を実行します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note データと設定の永続化
コンテナの再起動後もデータと設定を永続化するには、上記のdockerコマンドを変更して、パス`/data/db`、`/var/lib/clickhouse`、`/var/log/clickhouse-server`をマウントします。

例：


```shell
# パスをマウントするようにコマンドを変更
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::

### HyperDX UIへのアクセス {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。

複雑性要件を満たすユーザー名とパスワードを指定してユーザーを作成します。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

HyperDXはローカルクラスターに自動的に接続し、ログ、トレース、メトリクス、セッションのデータソースを作成します。これにより、すぐに製品を使い始めることができます。

### 製品の使用 {#explore-the-product}

スタックをデプロイした後、サンプルデータセットのいずれかを試してください。

ローカルクラスターを引き続き使用する場合:

- [サンプルデータセット](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットを読み込みます。簡単な問題を診断します。
- [ローカルファイルとメトリクス](/use-cases/observability/clickstack/getting-started/local-data) - ローカルのOTel collectorを使用して、OSXまたはLinux上のローカルファイルを読み込み、システムを監視します。

<br />
または、より大規模なデータセットを試せるデモクラスターに接続することもできます:

- [リモートデモデータセット](/use-cases/observability/clickstack/getting-started/remote-demo-data) - デモClickHouseサービスでデモデータセットを試します。

</VerticalStepper>


## ClickHouse Cloud へのデプロイ {#deploy-with-clickhouse-cloud}

ユーザーは ClickHouse Cloud をバックエンドとして ClickStack をデプロイできます。これにより、完全にマネージドでセキュアなバックエンドの利点を享受しつつ、インジェスト、スキーマ、およびオブザーバビリティワークフローに対する完全な制御を維持できます。

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud サービスを作成する {#create-a-service}

サービスを作成するには、[ClickHouse Cloud のクイックスタートガイド](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)に従ってください。

### 接続情報をコピーする {#copy-cloud-connection-details}

HyperDX 用の接続情報を確認するには、ClickHouse Cloud コンソールに移動し、サイドバーの <b>Connect</b> ボタンをクリックします。 

HTTP 接続情報、特に HTTPS エンドポイント（`endpoint`）とパスワードをコピーします。

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note 本番環境へのデプロイ
ここでは HyperDX への接続に `default` ユーザーを使用しますが、[本番環境に移行する](/use-cases/observability/clickstack/production#create-a-user)際には専用ユーザーを作成することを推奨します。
:::

### Docker でデプロイする {#deploy-with-docker}

ターミナルを開き、上でコピーした認証情報をエクスポートします:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

次の Docker コマンドを実行します:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

これにより、OpenTelemetry collector（ポート 4317 および 4318）と HyperDX UI（ポート 8080）が公開されます。

### HyperDX UI にアクセスする {#navigate-to-hyperdx-ui-cloud}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザー名と複雑性要件を満たすパスワードを入力してユーザーを作成します。 

<Image img={hyperdx_login} alt="HyperDX ログイン" size="lg"/>

### ClickHouse Cloud 接続を作成する {#create-a-cloud-connection}

`Team Settings` に移動し、`Local Connection` の `Edit` をクリックします:

<Image img={edit_connection} alt="接続を編集" size="lg"/>

接続名を `Cloud` に変更し、ClickHouse Cloud サービスの認証情報で後続のフォームを入力してから `Save` をクリックします:

<Image img={edit_cloud_connection} alt="Cloud 接続を作成" size="lg"/>

### 製品を試す {#explore-the-product-cloud}

スタックのデプロイが完了したら、いずれかのサンプルデータセットを試してみてください。

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットをロードし、単純な問題を診断します。
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - ローカルの OTel collector を使用して、OSX または Linux 上のローカルファイルをロードし、システムを監視します。

</VerticalStepper>



## ローカルモード {#local-mode}

ローカルモードは、認証なしで HyperDX をデプロイするための方法です。 

認証はサポートされていません。 

このモードは、認証や設定の永続化が不要な、簡易なテスト、開発、デモ、デバッグといったユースケース向けに設計されています。

### ホスト版 {#hosted-version}

[play.hyperdx.io](https://play.hyperdx.io) で利用可能なローカルモードのホスト版 HyperDX を使用できます。

### 自己ホスト版 {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Docker で実行する {#run-local-with-docker}

自己ホスト型ローカルモードのイメージには、事前に設定済みの OpenTelemetry collector と ClickHouse サーバーが同梱されています。これにより、アプリケーションからテレメトリデータを取り込み、最小限の外部セットアップで HyperDX 上に可視化できます。自己ホスト版を使い始めるには、適切なポートをフォワードして Docker コンテナを実行するだけです：

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

ローカルモードには認証機能が含まれていないため、ユーザーアカウントの作成を促されることはありません。

### 接続クレデンシャルの設定 {#complete-connection-credentials}

独自の **外部 ClickHouse クラスター** に接続するには、接続クレデンシャルを手動で入力できます。

あるいは、製品をすばやく試してみたい場合は、**Connect to Demo Server** をクリックして、あらかじめ読み込まれたデータセットにアクセスし、セットアップ不要で ClickStack を試すこともできます。

<Image img={hyperdx_2} alt="Credentials" size="md"/>

デモサーバーに接続している場合、ユーザーは [demo dataset instructions](/use-cases/observability/clickstack/getting-started/remote-demo-data) に従ってデータセットを探索できます。

</VerticalStepper>
