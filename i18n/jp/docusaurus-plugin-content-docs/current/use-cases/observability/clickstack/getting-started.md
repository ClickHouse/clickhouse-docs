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

事前にビルド済みの Docker イメージが提供されているおかげで、**ClickStack** を簡単に使い始めることができます。これらのイメージは公式の ClickHouse の Debian パッケージに基づいており、さまざまなユースケースに対応できるよう複数のディストリビューションで提供されています。

## ローカルデプロイ {#local-deployment}

最も簡単なオプションは、スタックのすべてのコアコンポーネントを 1 つにまとめた **単一イメージディストリビューション**です。

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

このオールインワンイメージを使うと、1 つのコマンドでフルスタックを起動できるため、テストや実験、クイックなローカルデプロイに最適です。

<VerticalStepper headerLevel="h3">

### docker でスタックをデプロイする {#deploy-stack-with-docker}

以下のコマンドは、OpenTelemetry collector（ポート 4317 と 4318）と HyperDX UI（ポート 8080）を起動します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note イメージ名の更新
ClickStack のイメージは現在 `clickhouse/clickstack-*`（以前は `docker.hyperdx.io/hyperdx/*`）として公開されています。
:::

:::tip データと設定の永続化
コンテナの再起動後もデータと設定を保持するには、上記の docker コマンドを変更して、`/data/db`、`/var/lib/clickhouse`、`/var/log/clickhouse-server` のパスをマウントします。

例:

```shell
# modify command to mount paths
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

ユーザーを作成し、複雑さ要件を満たすユーザー名とパスワードを入力します。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX はローカルクラスターに自動的に接続し、ログ・トレース・メトリクス・セッション用のデータソースを作成します。これにより、すぐに製品を探索できます。

### 製品を操作してみる {#explore-the-product}

スタックがデプロイできたら、用意されたデータセットのいずれかを試してみてください。

ローカルクラスターを使い続ける場合:

- [サンプルデータセット](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットをロードし、簡単な問題を診断します。
- [ローカルファイルとメトリクス](/use-cases/observability/clickstack/getting-started/local-data) - ローカルの OTel collector を使って、OSX または Linux 上のローカルファイルをロードし、システムを監視します。

<br/>
別の方法として、より大きなデータセットを探索できるデモクラスターに接続することもできます。

- [リモートデモデータセット](/use-cases/observability/clickstack/getting-started/remote-demo-data) - デモ用 ClickHouse サービス内のデモデータセットを探索します。

</VerticalStepper>

## ClickHouse Cloud でデプロイする {#deploy-with-clickhouse-cloud}

ユーザーは ClickHouse Cloud をバックエンドとして ClickStack をデプロイでき、完全にマネージドで安全なバックエンドの利点を享受しつつ、インジェスト、スキーマ、オブザーバビリティのワークフローを完全に制御できます。

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud サービスを作成する {#create-a-service}

サービスを作成するには、[ClickHouse Cloud のクイックスタートガイド](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)に従ってください。

### 接続情報をコピーする {#copy-cloud-connection-details}

HyperDX 用の接続情報を確認するには、ClickHouse Cloud コンソールに移動し、サイドバーの <b>Connect</b> ボタンをクリックします。

HTTP 接続情報、特に HTTPS エンドポイント (`endpoint`) とパスワードをコピーします。

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note 本番環境へのデプロイ
ここでは HyperDX への接続に `default` ユーザーを使用しますが、[本番運用に移行する際](/use-cases/observability/clickstack/production#create-a-user)には専用のユーザーを作成することを推奨します。
:::

### docker でデプロイする {#deploy-with-docker}

ターミナルを開き、先ほどコピーした認証情報を環境変数としてエクスポートします:

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

ユーザー名と、複雑性要件を満たすパスワードを指定してユーザーを作成します。

<Image img={hyperdx_login} alt="HyperDX ログイン" size="lg"/>

### ClickHouse Cloud 接続を作成する {#create-a-cloud-connection}

`Team Settings` に移動し、`Local Connection` の `Edit` をクリックします:

<Image img={edit_connection} alt="接続を編集" size="lg"/>

接続名を `Cloud` に変更し、その後のフォームに ClickHouse Cloud サービスの認証情報を入力してから `Save` をクリックします:

<Image img={edit_cloud_connection} alt="Cloud 接続を作成" size="lg"/>

### プロダクトを触ってみる {#explore-the-product-cloud}

スタックのデプロイが完了したら、用意されているデータセットのいずれかを試してみてください。

- [サンプルデータセット](/use-cases/observability/clickstack/getting-started/sample-data) - パブリックデモからサンプルデータセットをロードし、簡単な問題を診断します。
- [ローカルファイルとメトリクス](/use-cases/observability/clickstack/getting-started/local-data) - ローカルの OTel collector を使用して、OSX または Linux 上でローカルファイルをロードし、システムを監視します。

</VerticalStepper>

## ローカルモード {#local-mode}

ローカルモードは、認証なしで HyperDX をデプロイするための方法です。 

このモードでは認証はサポートされません。 

このモードは、認証や設定の永続化が不要な、迅速なテスト、開発、デモ、およびデバッグといったユースケース向けに想定されています。

### ホスト型バージョン {#hosted-version}

[play.hyperdx.io](https://play.hyperdx.io) で利用可能なローカルモードの HyperDX ホスト型バージョンを使用できます。

### セルフホスト版 {#self-hosted-version}

<VerticalStepper headerLevel="h3">

### Docker で実行する {#run-local-with-docker}

セルフホストのローカルモードイメージには、OpenTelemetry collector と ClickHouse サーバーがあらかじめ設定された状態で含まれています。これにより、アプリケーションからテレメトリデータを取り込み、最小限の追加設定で HyperDX 上に可視化できます。セルフホスト版を使い始めるには、適切なポートをフォワードして Docker コンテナを実行するだけです:

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

ローカルモードには認証機能が含まれていないため、ユーザーの作成を求められることはありません。

### 接続情報の入力 {#complete-connection-credentials}

独自の **外部 ClickHouse クラスター** に接続するには、接続情報を手動で入力できます。

また、製品を手早く試したい場合は、**Connect to Demo Server** をクリックして、あらかじめロードされたデータセットにアクセスし、セットアップ不要で ClickStack を試すこともできます。

<Image img={hyperdx_2} alt="Credentials" size="md"/>

デモサーバーに接続した場合は、[デモデータセットの手順](/use-cases/observability/clickstack/getting-started/remote-demo-data)に従ってデータセットを探索できます。

</VerticalStepper>