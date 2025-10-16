---
'slug': '/use-cases/observability/clickstack/getting-started'
'title': 'ClickStackの始め方'
'sidebar_label': '始め方'
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/example-datasets/index'
'description': 'ClickStackの始め方 - ClickHouseの可観測性スタック'
'doc_type': 'guide'
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

Getting started with **ClickStack** is straightforward thanks to the availability of prebuilt Docker images. These images are based on the official ClickHouse Debian package and are available in multiple distributions to suit different use cases.

## Local deployment {#local-deployment}

The simplest option is a **single-image distribution** that includes all core components of the stack bundled together:

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

This all-in-one image allows you to launch the full stack with a single command, making it ideal for testing, experimentation, or quick local deployments.

<VerticalStepper headerLevel="h3">

### Deploy stack with docker {#deploy-stack-with-docker}

The following will run an OpenTelemetry collector (on port 4317 and 4318) and the HyperDX UI (on port 8080).

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note Persisting data and settings
データと設定をコンテナの再起動にわたって持続させるために、ユーザーは上記のdockerコマンドを変更して `/data/db`, `/var/lib/clickhouse` および `/var/log/clickhouse-server` のパスをマウントすることができます。

例えば：

```shell

# modify command to mount paths
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

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスしてHyperDX UIを利用します。

ユーザーを作成し、複雑さの要件を満たすユーザー名とパスワードを提供します。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDXはローカルクラスターに自動的に接続し、ログ、トレース、メトリクス、およびセッションのデータソースを作成します。これにより、すぐに製品を探索できます。

### Explore the product {#explore-the-product}

スタックがデプロイされると、私たちの同じデータセットのいずれかを試してみてください。

ローカルクラスターを引き続き使用するには：

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからのサンプルデータセットをロードします。単純な問題を診断します。
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - ローカルファイルをロードし、OSXまたはLinuxでローカルOTelコレクターを使用してシステムを監視します。

<br/>
または、デモクラスターに接続して、より大きなデータセットを探索できます：

- [Remote demo dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data) - デモClickHouseサービス内のデモデータセットを探索します。

</VerticalStepper>

## Deploy with ClickHouse Cloud {#deploy-with-clickhouse-cloud}

ユーザーはClickHouse Cloudに対してClickStackをデプロイでき、完全に管理された安全なバックエンドを利用しつつ、取り込み、スキーマ、および可観測性ワークフローに対する完全なコントロールを保持できます。

<VerticalStepper headerLevel="h3">

### Create a ClickHouse Cloud service {#create-a-service}

[ClickHouse Cloudのスターターガイド](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)をフォローしてサービスを作成します。

### Copy connection details {#copy-cloud-connection-details}

HyperDXの接続情報を見つけるには、ClickHouse Cloudコンソールに移動し、サイドバーの<b>Connect</b>ボタンをクリックします。

HTTP接続の詳細、具体的にはHTTPSエンドポイント(`endpoint`)とパスワードをコピーします。

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note Deploying to production
HyperDXに接続するために`default`ユーザーを使用しますが、[本番環境に移行する際](/use-cases/observability/clickstack/production#create-a-user)には専用のユーザーを作成することをお勧めします。
:::

### Deploy with docker {#deploy-with-docker}

ターミナルを開いて、上記でコピーした認証情報をエクスポートします：

```shell
export CLICKHOUSE_USER=default
export CLICKHOUSE_ENDPOINT=<YOUR HTTPS ENDPOINT>
export CLICKHOUSE_PASSWORD=<YOUR_PASSWORD>
```

次のdockerコマンドを実行します：

```shell
docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

これにより、OpenTelemetryコレクター（ポート4317および4318）とHyperDX UI（ポート8080）が公開されます。

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui-cloud}

[http://localhost:8080](http://localhost:8080) にアクセスしてHyperDX UIを利用します。

ユーザーを作成し、複雑さの要件を満たすユーザー名とパスワードを提供します。

<Image img={hyperdx_login} alt="HyperDX Login" size="lg"/>

### Create a ClickHouse Cloud connection {#create-a-cloud-connection}

`Team Settings`に移動し、`Local Connection`の`Edit`をクリックします：

<Image img={edit_connection} alt="Edit Connection" size="lg"/>

接続名を`Cloud`に変更し、次のフォームにClickHouse Cloudサービスの認証情報を入力し、`Save`をクリックします：

<Image img={edit_cloud_connection} alt="Create Cloud connection" size="lg"/>

### Explore the product {#explore-the-product-cloud}

スタックがデプロイされると、私たちの同じデータセットのいずれかを試してみてください。

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからのサンプルデータセットをロードします。単純な問題を診断します。
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - ローカルファイルをロードし、OSXまたはLinuxでローカルOTelコレクターを使用してシステムを監視します。

</VerticalStepper>

## Local mode {#local-mode}

ローカルモードは、認証なしでHyperDXをデプロイする方法です。

認証はサポートされていません。

このモードは、認証や設定の持続が必要ないクイックテスト、開発、デモ、およびデバッグのユースケースに使用することを意図しています。

### Hosted version {#hosted-version}

ローカルモードで利用できるHyperDXのホスティング版を[play.hyperdx.io](https://play.hyperdx.io)で使用できます。

### Self-hosted version {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Run with docker {#run-local-with-docker}

セルフホスティングのローカルモードイメージは、OpenTelemetryコレクターとClickHouseサーバーが事前に設定されています。これにより、アプリケーションからのテレメトリーデータを消費し、HyperDXで視覚化するための外部設定が最小限に抑えられます。セルフホスティング版を開始するには、適切なポートをフォワードしてDockerコンテナを実行します：

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

ローカルモードには認証が含まれていないため、ユーザーを作成するように促されることはありません。

### Complete connection credentials {#complete-connection-credentials}

自身の**外部ClickHouseクラスタ**に接続するには、接続資格情報を手動で入力できます。

代わりに、製品をすぐに探索するために**Connect to Demo Server**をクリックして事前にロードされたデータセットにアクセスし、設定なしでClickStackを試すことができます。

<Image img={hyperdx_2} alt="Credentials" size="md"/>

デモサーバーに接続している場合、ユーザーは[デモデータセットの指示](/use-cases/observability/clickstack/getting-started/remote-demo-data)に従ってデータセットを探索できます。

</VerticalStepper>
