---
slug: /use-cases/observability/clickstack/getting-started
title: 'ClickStack 入門'
sidebar_label: 'はじめに'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'ClickStack 入門 - ClickHouse オブザーバビリティスタック'
doc_type: 'guide'
keywords: ['ClickStack', '入門', 'Docker デプロイ', 'HyperDX UI', 'ClickHouse Cloud', 'ローカルデプロイ']
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

あらかじめ用意された Docker イメージが利用できるため、**ClickStack** を使い始めるのは簡単です。これらのイメージは公式の ClickHouse Debian パッケージをベースとしており、さまざまなユースケースに対応できるよう複数のディストリビューションが提供されています。


## ローカルデプロイメント \\{#local-deployment\\}

最も簡単なオプションは、スタックのすべてのコアコンポーネントをまとめた **単一イメージのディストリビューション** です。

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

このオールインワンイメージを使用すると、単一のコマンドでフルスタックを起動できるため、テスト、検証、あるいは迅速なローカルデプロイメントに最適です。

<VerticalStepper headerLevel="h3">

### Docker でスタックをデプロイ \\{#deploy-stack-with-docker\\}

次のコマンドは、OpenTelemetry collector（ポート 4317 と 4318）と HyperDX UI（ポート 8080）を起動します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note イメージ名の更新
ClickStack のイメージは、現在 `clickhouse/clickstack-*` として公開されています（以前は `docker.hyperdx.io/hyperdx/*`）。
:::

:::tip データと設定の永続化
コンテナの再起動間でデータと設定を永続化するには、上記の docker コマンドを修正し、`/data/db`、`/var/lib/clickhouse`、`/var/log/clickhouse-server` のパスをマウントします。

例:

```shell
# パスをマウントするようにコマンドを修正
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

### HyperDX UI にアクセスする \\{#navigate-to-hyperdx-ui\\}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザーを作成し、パスワードポリシーの要件を満たすユーザー名とパスワードを入力します。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX はローカルクラスターに自動的に接続し、ログ、トレース、メトリクス、セッション用のデータソースを作成します。これにより、すぐに製品を探索できます。

### 製品を探索する \\{#explore-the-product\\}

スタックがデプロイされたら、サンプルデータセットのいずれかを試してみてください。

ローカルクラスターを使い続けるには、次のいずれかを実行します。

- [サンプルデータセット](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットをロードし、簡単な問題の診断を体験します。
- [ローカルファイルとメトリクス](/use-cases/observability/clickstack/getting-started/local-data) - ローカル OTel collector を使用して、macOS または Linux 上のローカルファイルをロードし、システムを監視します。

<br/>
別の方法として、より大きなデータセットを探索できるデモクラスターに接続することもできます。

- [リモートデモデータセット](/use-cases/observability/clickstack/getting-started/remote-demo-data) - デモ ClickHouse サービス上のデモデータセットを探索します。

</VerticalStepper>

## ClickHouse Cloud でデプロイする \\{#deploy-with-clickhouse-cloud\\}

ClickStack を ClickHouse Cloud 上にデプロイすることで、完全マネージドでセキュアなバックエンドの利点を得つつ、インジェスト、スキーマ、オブザーバビリティのワークフローに対する完全な制御を維持できます。

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud サービスを作成する \\{#create-a-service\\}

[ClickHouse Cloud のクイックスタートガイド](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)に従ってサービスを作成します。

### 接続情報をコピーする \\{#copy-cloud-connection-details\\}

HyperDX 用の接続情報を確認するには、ClickHouse Cloud コンソールに移動し、サイドバーの <b>Connect</b> ボタンをクリックします。

HTTP 接続情報のうち、特に HTTPS エンドポイント（`endpoint`）とパスワードをコピーします。

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note 本番環境へのデプロイ
HyperDX への接続には `default` ユーザーを使用しますが、[本番環境へ移行する](/use-cases/observability/clickstack/production#create-a-user)際には専用ユーザーの作成を推奨します。
:::

### Docker でデプロイする \\{#deploy-with-docker\\}

ターミナルを開き、先ほどコピーした認証情報を環境変数としてエクスポートします:

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

次の Docker コマンドを実行します:

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

これにより、OpenTelemetry collector（ポート 4317 および 4318）と HyperDX UI（ポート 8080）が公開されます。

### HyperDX UI にアクセスする \\{#navigate-to-hyperdx-ui-cloud\\}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザーを作成し、ユーザー名と、パスワードポリシーの要件を満たすパスワードを入力します。

<Image img={hyperdx_login} alt="HyperDX Login" size="lg"/>

### ClickHouse Cloud 接続を作成する \\{#create-a-cloud-connection\\}

`Team Settings` に移動し、`Local Connection` の `Edit` をクリックします:

<Image img={edit_connection} alt="Edit Connection" size="lg"/>

接続名を `Cloud` に変更し、ClickHouse Cloud サービスの認証情報で後続のフォームを入力してから `Save` をクリックします:

<Image img={edit_cloud_connection} alt="Create Cloud connection" size="lg"/>

### 製品を試してみる \\{#explore-the-product-cloud\\}

スタックがデプロイされたら、サンプルデータセットのいずれかを試してみてください。

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - パブリックデモからサンプルデータセットをロードして、簡単な問題を診断します。
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - ローカルの OTel collector を使用して、OSX または Linux 上のローカルファイルをロードし、システムを監視します。

</VerticalStepper>

## ローカルモード \\{#local-mode\\}

ローカルモードは、認証なしで HyperDX をデプロイするためのモードです。

認証はサポートされていません。

このモードは、認証や設定の永続化が不要な、テスト、開発、デモ、デバッグといった用途での利用を想定しています。

### ホスト型版 \\{#hosted-version\\}

ローカルモードでは、[play.hyperdx.io](https://play.hyperdx.io) で提供されているホスト型 HyperDX を利用できます。

### セルフホスト版 \\{#self-hosted-version\\}

<VerticalStepper headerLevel="h3">

### Docker で実行する \\{#run-local-with-docker\\}

セルフホストのローカルモード用イメージには、事前に設定済みの OpenTelemetry collector と ClickHouse サーバーが含まれています。これにより、外部での追加セットアップを最小限に抑えつつ、アプリケーションからのテレメトリデータを取り込み、HyperDX 上で可視化できます。セルフホスト版を使い始めるには、適切なポートをフォワードして Docker コンテナを実行するだけです:

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

ローカルモードには認証機能が含まれていないため、ユーザー作成を求められることはありません。

### 接続認証情報の入力 \\{#complete-connection-credentials\\}

独自の **外部 ClickHouse クラスター** に接続する場合は、接続認証情報を手動で入力できます。

あるいは、製品をすばやく試したい場合は、**Connect to Demo Server** をクリックして、あらかじめロードされたデータセットにアクセスし、事前のセットアップなしで ClickStack を試すこともできます。

<Image img={hyperdx_2} alt="接続情報" size="md"/>

デモサーバーに接続した場合は、[デモデータセットの手順](/use-cases/observability/clickstack/getting-started/remote-demo-data)に従ってデータセットを探索できます。

</VerticalStepper>