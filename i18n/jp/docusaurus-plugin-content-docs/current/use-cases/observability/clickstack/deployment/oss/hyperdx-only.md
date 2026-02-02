---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: 'HyperDX のみ'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'HyperDX のみをデプロイする'
doc_type: 'guide'
keywords: ['HyperDX スタンドアロン デプロイメント', 'HyperDX ClickHouse 連携', 'HyperDX のみをデプロイ', 'HyperDX Docker インストール', 'ClickHouse 可視化ツール']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

このオプションは、すでにオブザーバビリティまたはイベントデータが投入されて稼働している ClickHouse インスタンスを持っている場合を想定しています。

HyperDX はスタックの他のコンポーネントとは独立して利用でき、OpenTelemetry (OTel) に限らず、あらゆるデータスキーマと互換性があります。これにより、すでに ClickHouse 上に構築されている独自のオブザーバビリティパイプラインにも適しています。

完全な機能を有効にするには、ダッシュボード、保存済み検索、ユーザー設定、アラートなどのアプリケーションの状態を保存するための MongoDB インスタンスを用意する必要があります。

このモードでは、データのインジェストは完全にユーザーの責任となります。自前でホストしている OpenTelemetry collector、クライアントライブラリからの直接インジェスト、Kafka や S3 などの ClickHouse ネイティブなテーブルエンジン、ETL パイプライン、あるいは ClickPipes のようなマネージドインジェストサービスを使用して、ClickHouse にデータを取り込むことができます。このアプローチは最大限の柔軟性を提供し、すでに ClickHouse を運用していて、その上に HyperDX を重ねて可視化、検索、アラート機能を追加したいチームに適しています。


### 適している対象 \{#suitable-for\}

- 既存の ClickHouse ユーザー
- カスタムイベントパイプライン

## デプロイ手順 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">

### Docker でデプロイする \{#deploy-hyperdx-with-docker\}

必要に応じて `YOUR_MONGODB_URI` を変更して、次のコマンドを実行します。

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### HyperDX UI にアクセスする \{#navigate-to-hyperdx-ui\}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザーアカウントを作成し、要件を満たすユーザー名とパスワードを入力します。

`Create` をクリックすると、接続情報の入力を求められます。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 接続情報を入力する \{#complete-connection-details\}

自身の外部 ClickHouse クラスター（例: ClickHouse Cloud）に接続します。

<Image img={hyperdx_2} alt="HyperDX ログイン" size="md"/>

ソースの作成を求められた場合は、すべてのデフォルト値をそのままにし、`Table` フィールドに `otel_logs` を入力します。その他の設定は自動検出されるため、`Save New Source` をクリックできます。

:::note ソースの作成
ソースを作成するには、ClickHouse 内にテーブルが存在している必要があります。データがまだない場合は、テーブルを作成するために ClickStack の OpenTelemetry collector をデプロイすることを推奨します。
:::

</VerticalStepper>

## Docker Compose の使用 \{#using-docker-compose\}

このガイドと同じ構成を実現するには、[Docker Compose の構成](/use-cases/observability/clickstack/deployment/docker-compose) を変更し、マニフェストから OTel collector と ClickHouse インスタンスを削除します。

## ClickStack OpenTelemetry collector \{#otel-collector\}

他のコンポーネントとは独立して OpenTelemetry collector を運用している場合でも、ClickStack ディストリビューションの collector を使用することを推奨します。これにより、デフォルトのスキーマが使用され、インジェストに関するベストプラクティスが適用されます。

スタンドアロン collector のデプロイと設定の詳細については、「[OpenTelemetry で取り込む](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)」を参照してください。

<JSONSupport />

HyperDX 専用イメージを利用する場合は、`BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` パラメータを設定するだけで十分です。例:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
