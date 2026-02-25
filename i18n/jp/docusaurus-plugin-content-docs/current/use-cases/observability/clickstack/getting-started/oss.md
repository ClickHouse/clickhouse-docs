---
slug: /use-cases/observability/clickstack/getting-started/oss
title: 'オープンソース版 ClickStack 入門'
sidebar_label: 'オープンソース'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'オープンソース版 ClickStack 入門'
doc_type: 'guide'
keywords: ['ClickStack Open Source', '入門', 'Docker デプロイ', 'HyperDX UI', 'ローカルデプロイ']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import add_connection from '@site/static/images/use-cases/observability/add_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import edit_cloud_connection from '@site/static/images/use-cases/observability/edit_cloud_connection.png';
import delete_source from '@site/static/images/use-cases/observability/delete_source.png';
import delete_connection from '@site/static/images/use-cases/observability/delete_connection.png';
import created_sources from '@site/static/images/use-cases/observability/created_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**ClickStack Open Source** をデプロイし、ClickHouse と ClickStack UI を自分で実行・管理する場合のために、UI、OpenTelemetry コレクター、および ClickHouse を 1 つのコンテナにまとめたビルド済み Docker イメージを提供しています。これにより、ローカル開発、テスト、およびセルフマネージドなデプロイメントを簡単に開始できます。

これらのイメージは公式の ClickHouse 向け Debian パッケージをベースとしており、さまざまなユースケースに対応できるよう複数のディストリビューションで提供されています。

最もシンプルなオプションは、スタックの中核コンポーネントをすべてひとまとめにバンドルした **単一イメージディストリビューション** です:

* **HyperDX UI**
* **OpenTelemetry (OTel) collector**
* **ClickHouse**

このオールインワンイメージを使用すると、単一のコマンドでフルスタックを起動できるため、テスト、検証、あるいはローカルでの迅速なデプロイメントに最適です。


<VerticalStepper headerLevel="h2">

## Docker を使ってスタックをデプロイする \{#deploy-stack-with-docker\}

次のコマンドで、OpenTelemetry collector（ポート 4317 と 4318）、HyperDX UI（ポート 8080）、および ClickHouse（ポート 8123）を起動します。

```shell
docker run --name clickstack -p 8123:8123 -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest clickstack
```

:::note Image Name Update
ClickStack イメージは現在 `clickhouse/clickstack-*` として公開されています（以前は `docker.hyperdx.io/hyperdx/*`）。
:::

:::tip データと設定の永続化
コンテナの再起動後もデータと設定を保持するには、上記の docker コマンドを変更し、`/data/db`、`/var/lib/clickhouse`、`/var/log/clickhouse-server` のパスをマウントします。

例:

```shell
# パスをマウントするようにコマンドを変更
docker run \
  --name clickstack \
  -p 8123:8123 \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  clickhouse/clickstack-all-in-one:latest
```
:::

## ClickStack UI にアクセスする \{#navigate-to-hyperdx-ui\}

[http://localhost:8080](http://localhost:8080) にアクセスして ClickStack UI（HyperDX）を開きます。

ユーザーを作成し、複雑性要件を満たすユーザー名とパスワードを指定します。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

HyperDX はローカルクラスターに自動的に接続し、ログ、トレース、メトリクス、セッション用のデータソースを作成します。これにより、すぐに製品を探索できます。

## 製品を探索する \{#explore-the-product\}

スタックがデプロイされたら、用意されているサンプルデータセットのいずれかを試してください。

ローカルクラスターを使い続ける場合:

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットを読み込み、シンプルな問題を診断します。
- [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - ローカルの OTel collector を使って、OSX または Linux 上のローカルファイルを読み込み、システムを監視します。

<br/>
また、より大きなデータセットを探索できるデモクラスターに接続することもできます:

- [Remote demo dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data) - デモ用 ClickHouse サービス上のデモデータセットを探索します。

</VerticalStepper>

## 代替のデプロイメントモデル \{#alternative-deployment-models\}

### ローカルモード \{#local-mode\}

ローカルモードは、認証を必要とせずに HyperDX をデプロイできるモードです。 

**認証はサポートされていません。** 

このモードは、認証や設定の永続化が不要な、迅速なテスト、開発、デモ、およびデバッグといったユースケースでの利用を目的としています。

このデプロイメントモデルの詳細については、["Local Mode Only"](/use-cases/observability/clickstack/deployment/local-mode-only) を参照してください。

### ホスト型バージョン \{#hosted-version\}

ローカルモードで利用可能な ClickStack のホスト型バージョンは、[play-clickstack.clickhouse.com](https://play-clickstack.clickstack.com) から利用できます。

### 自前ホスティング版 \{#self-hosted-version\}

<VerticalStepper headerLevel="h3">

### Docker で実行する \{#run-local-with-docker\}

自前ホスティングのローカルモードイメージには、OpenTelemetry collector、ClickStack UI、そして事前に設定済みの ClickHouse サーバーが含まれています。これにより、アプリケーションからテレメトリーデータを取り込み、最小限の外部セットアップで可視化することができます。自前ホスティング版を使い始めるには、適切なポートをフォワードして Docker コンテナを実行するだけです:

```shell
docker run -p 8080:8080 clickhouse/clickstack-local:latest
```

「All in one」イメージと異なり、**ローカルモードには認証が含まれないため、ユーザーの作成を促すプロンプトは表示されません**。

### 接続情報の設定を完了する \{#complete-connection-credentials\}

独自の **外部 ClickHouse クラスター** に接続するには、接続情報を手動で入力できます。

あるいは、製品を手早く試す場合は、**Connect to Demo Server** をクリックして、あらかじめロードされたデータセットにアクセスし、セットアップ不要で ClickStack を試すこともできます。

<Image img={hyperdx_2} alt="認証情報" size="md"/>

デモサーバーに接続した場合は、[デモデータセットの手順](/use-cases/observability/clickstack/getting-started/remote-demo-data)に従ってデータセットを探索できます。

</VerticalStepper>