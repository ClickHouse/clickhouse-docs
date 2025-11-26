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


## ローカルデプロイメント {#local-deployment}

最も簡単なオプションは、スタックのすべてのコアコンポーネントをひとつにまとめた **単一イメージのディストリビューション** です。

- **HyperDX UI**
- **OpenTelemetry (OTel) collector**
- **ClickHouse**

このオールインワンイメージを使うと、単一のコマンドでフルスタックを起動できるため、テスト、検証・実験、またはローカル環境での迅速なデプロイに最適です。

<VerticalStepper headerLevel="h3">

### Docker を使ってスタックをデプロイ {#deploy-stack-with-docker}

次のコマンドでは、OpenTelemetry (OTel) collector（ポート 4317 および 4318）と HyperDX UI（ポート 8080）を起動します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

:::note データと設定の永続化
コンテナの再起動をまたいでデータと設定を永続化するには、上記の Docker コマンドを変更し、`/data/db`、`/var/lib/clickhouse`、`/var/log/clickhouse-server` のパスをマウントします。

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
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
:::

### HyperDX UI にアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザーを作成して、複雑さ要件を満たすユーザー名とパスワードを設定します。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX はローカルクラスタに自動的に接続し、ログ、トレース、メトリクス、セッション用のデータソースを作成します。これにより、すぐに製品を探索し始めることができます。

### 製品を探索する {#explore-the-product}

スタックがデプロイされたら、用意されているデータセットのいずれかを試してみてください。

ローカルクラスタを使い続ける場合:

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットを読み込み、シンプルな問題を診断します。
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - ローカルの OTel collector を使用して、OSX または Linux 上のローカルファイルを読み込み、システムを監視します。

<br/>
あるいは、より大きなデータセットを探索できるデモクラスタに接続することもできます。

- [Remote demo dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data) - デモ用 ClickHouse サービス内のデモデータセットを探索します。

</VerticalStepper>

## ClickHouse Cloud でデプロイする {#deploy-with-clickhouse-cloud}

ユーザーは ClickStack を ClickHouse Cloud をバックエンドとしてデプロイでき、フルマネージドでセキュアなバックエンドの利点を享受しつつ、インジェスト処理、スキーマ、およびオブザーバビリティのワークフローを完全に制御できます。

<VerticalStepper headerLevel="h3">

### ClickHouse Cloud サービスを作成する {#create-a-service}

サービスの作成手順については、[ClickHouse Cloud のクイックスタートガイド](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)に従ってください。

### 接続情報をコピーする {#copy-cloud-connection-details}

HyperDX 用の接続情報を確認するには、ClickHouse Cloud コンソールに移動し、サイドバーの <b>Connect</b> ボタンをクリックします。 

HTTP 接続情報のうち、特に HTTPS エンドポイント（`endpoint`）とパスワードをコピーします。

<Image img={connect_cloud} alt="Connect Cloud" size="md"/>

:::note 本番環境へのデプロイ
ここでは HyperDX への接続に `default` ユーザーを使用しますが、[本番環境に移行する](/use-cases/observability/clickstack/production#create-a-user)際には専用ユーザーを作成することを推奨します。
:::

### Docker でデプロイする {#deploy-with-docker}

ターミナルを開き、先ほどコピーした認証情報をエクスポートします:

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

ユーザーを作成し、パスワードポリシーの要件を満たすユーザー名とパスワードを入力します。 

<Image img={hyperdx_login} alt="HyperDX Login" size="lg"/>

### ClickHouse Cloud 接続を作成する {#create-a-cloud-connection}

`Team Settings` に移動し、`Local Connection` の `Edit` をクリックします:

<Image img={edit_connection} alt="Edit Connection" size="lg"/>

接続名を `Cloud` に変更し、フォームに ClickHouse Cloud サービスの認証情報を入力してから `Save` をクリックします:

<Image img={edit_cloud_connection} alt="Create Cloud connection" size="lg"/>

### プロダクトを試す {#explore-the-product-cloud}

スタックのデプロイが完了したら、サンプルデータセットのいずれかを試してみてください。

- [サンプルデータセット](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットを読み込み、簡単な問題を診断します。
- [ローカルファイルとメトリクス](/use-cases/observability/clickstack/getting-started/local-data) - ローカルの OTel collector を使用して、macOS または Linux 上のローカルファイルを読み込み、システムを監視します。

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

セルフホストのローカルモード用イメージには、OpenTelemetry collector と ClickHouse サーバーがあらかじめ設定済みで含まれています。これにより、最小限の外部セットアップでアプリケーションからテレメトリーデータを取り込み、HyperDX 上で可視化できます。セルフホスト版を使い始めるには、次のように必要なポートをフォワードして Docker コンテナを実行します。

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

ローカルモードには認証機能が含まれていないため、ユーザーの作成を求められることはありません。

### 接続クレデンシャルの入力 {#complete-connection-credentials}

自身の **外部 ClickHouse クラスター** に接続するには、接続クレデンシャルを手動で入力します。

また、製品をすばやく試したい場合は、**デモサーバーに接続** をクリックして、あらかじめ読み込まれたデータセットにアクセスし、セットアップ不要で ClickStack を試すこともできます。

<Image img={hyperdx_2} alt="クレデンシャル" size="md"/>

デモサーバーに接続した場合は、[デモデータセットの利用手順](/use-cases/observability/clickstack/getting-started/remote-demo-data)に従ってデータセットを探索できます。

</VerticalStepper>