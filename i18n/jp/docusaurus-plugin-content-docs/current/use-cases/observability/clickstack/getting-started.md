---
slug: /use-cases/observability/clickstack/getting-started
title: 'ClickStack 入門'
sidebar_label: '入門'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'ClickStack 入門 - ClickHouse Observability スタック'
doc_type: 'guide'
keywords: ['ClickStack', 'getting started', 'Docker deployment', 'HyperDX UI', 'ClickHouse Cloud', 'local deployment']
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

**ClickStack** の利用開始は、あらかじめ用意された Docker イメージにより容易になっています。これらのイメージは公式の ClickHouse Debian パッケージに基づいており、さまざまなユースケースに対応できるよう複数のディストリビューションで提供されています。


## ローカルデプロイメント {#local-deployment}

最もシンプルなオプションは、スタックのすべてのコアコンポーネントをバンドルした**単一イメージディストリビューション**です：

- **HyperDX UI**
- **OpenTelemetry (OTel) コレクター**
- **ClickHouse**

このオールインワンイメージを使用すると、単一のコマンドでフルスタックを起動できるため、テスト、実験、または迅速なローカルデプロイメントに最適です。

<VerticalStepper headerLevel="h3">

### Dockerを使用したスタックのデプロイ {#deploy-stack-with-docker}

以下のコマンドは、OpenTelemetryコレクター（ポート4317および4318）とHyperDX UI（ポート8080）を実行します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note データと設定の永続化
コンテナの再起動後もデータと設定を永続化するには、上記のdockerコマンドを変更して、パス`/data/db`、`/var/lib/clickhouse`、および`/var/log/clickhouse-server`をマウントします。

例：


```shell
# パスをマウントするコマンドを変更
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

複雑性要件を満たすユーザー名とパスワードを入力してユーザーを作成します。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

HyperDXはローカルクラスタに自動的に接続し、ログ、トレース、メトリクス、セッションのデータソースを作成します。これにより、すぐに製品を試すことができます。

### 製品を試す {#explore-the-product}

スタックをデプロイしたら、サンプルデータセットのいずれかを試してください。

ローカルクラスタを引き続き使用する場合:

- [サンプルデータセット](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットを読み込みます。簡単な問題を診断します。
- [ローカルファイルとメトリクス](/use-cases/observability/clickstack/getting-started/local-data) - ローカルのOTelコレクタを使用して、OSXまたはLinux上でローカルファイルを読み込み、システムを監視します。

<br />
または、より大規模なデータセットを探索できるデモクラスタに接続することもできます:

- [リモートデモデータセット](/use-cases/observability/clickstack/getting-started/remote-demo-data) - デモClickHouseサービスでデモデータセットを探索します。

</VerticalStepper>


## ClickHouse Cloudでデプロイする {#deploy-with-clickhouse-cloud}

ユーザーはClickStackをClickHouse Cloudに対してデプロイでき、フルマネージドで安全なバックエンドの利点を享受しながら、データ取り込み、スキーマ、および可観測性ワークフローを完全に制御できます。

<VerticalStepper headerLevel="h3">

### ClickHouse Cloudサービスを作成する {#create-a-service}

サービスを作成するには、[ClickHouse Cloudのクイックスタートガイド](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)に従ってください。

### 接続情報をコピーする {#copy-cloud-connection-details}

HyperDXの接続情報を確認するには、ClickHouse Cloudコンソールに移動し、サイドバーの<b>Connect</b>ボタンをクリックします。

HTTP接続情報、特にHTTPSエンドポイント（`endpoint`）とパスワードをコピーします。

<Image img={connect_cloud} alt='Cloudに接続' size='md' />

:::note 本番環境へのデプロイ
HyperDXの接続には`default`ユーザーを使用しますが、[本番環境に移行する](/use-cases/observability/clickstack/production#create-a-user)際には専用ユーザーの作成を推奨します。
:::

### Dockerでデプロイする {#deploy-with-docker}

ターミナルを開き、上記でコピーした認証情報をエクスポートします：

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

以下のDockerコマンドを実行します：

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

これにより、OpenTelemetryコレクター（ポート4317および4318）とHyperDX UI（ポート8080）が公開されます。

### HyperDX UIにアクセスする {#navigate-to-hyperdx-ui-cloud}

[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。

複雑性要件を満たすユーザー名とパスワードを指定してユーザーを作成します。

<Image img={hyperdx_login} alt='HyperDXログイン' size='lg' />

### ClickHouse Cloud接続を作成する {#create-a-cloud-connection}

`Team Settings`に移動し、`Local Connection`の`Edit`をクリックします：

<Image img={edit_connection} alt='接続を編集' size='lg' />

接続名を`Cloud`に変更し、ClickHouse Cloudサービスの認証情報を入力してから`Save`をクリックします：

<Image img={edit_cloud_connection} alt='Cloud接続を作成' size='lg' />

### 製品を探索する {#explore-the-product-cloud}

スタックがデプロイされたら、以下のサンプルデータセットのいずれかを試してください。

- [サンプルデータセット](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットを読み込み、簡単な問題を診断します。
- [ローカルファイルとメトリクス](/use-cases/observability/clickstack/getting-started/local-data) - ローカルファイルを読み込み、ローカルOTelコレクターを使用してOSXまたはLinux上のシステムを監視します。

</VerticalStepper>


## ローカルモード {#local-mode}

ローカルモードは、認証なしでHyperDXをデプロイする方法です。

認証はサポートされていません。

このモードは、認証や設定の永続化が不要な、クイックテスト、開発、デモ、デバッグなどのユースケースでの使用を想定しています。

### ホスト版 {#hosted-version}

[play.hyperdx.io](https://play.hyperdx.io)で、ローカルモードのHyperDXホスト版を利用できます。

### セルフホスト版 {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Dockerで実行 {#run-local-with-docker}

セルフホスト版のローカルモードイメージには、OpenTelemetryコレクターとClickHouseサーバーが事前設定されています。これにより、アプリケーションからのテレメトリデータを取り込み、最小限の外部セットアップでHyperDXで可視化することが容易になります。セルフホスト版を開始するには、適切なポートをフォワードしてDockerコンテナを実行するだけです:

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

ローカルモードには認証が含まれていないため、ユーザー作成を求められることはありません。

### 接続認証情報の入力 {#complete-connection-credentials}

独自の**外部ClickHouseクラスター**に接続するには、接続認証情報を手動で入力できます。

または、製品を素早く試すために、**Connect to Demo Server**をクリックして、事前にロードされたデータセットにアクセスし、セットアップ不要でClickStackを試すこともできます。

<Image img={hyperdx_2} alt='認証情報' size='md' />

デモサーバーに接続する場合、ユーザーは[デモデータセット手順](/use-cases/observability/clickstack/getting-started/remote-demo-data)を使用してデータセットを探索できます。

</VerticalStepper>
