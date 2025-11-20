---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: "HyperDX のみ"
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: "HyperDX のみのデプロイ"
doc_type: "ガイド"
keywords:
  [
    "HyperDX スタンドアロンデプロイ",
    "HyperDX ClickHouse 統合",
    "HyperDX のみのデプロイ",
    "HyperDX Docker インストール",
    "ClickHouse 可視化ツール"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"
import hyperdx_2 from "@site/static/images/use-cases/observability/hyperdx-2.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

このオプションは、オブザーバビリティデータまたはイベントデータが格納された稼働中の ClickHouse インスタンスを既に保有しているユーザー向けに設計されています。

HyperDX はスタックの他のコンポーネントから独立して使用でき、OpenTelemetry (OTel) だけでなく、あらゆるデータスキーマと互換性があります。これにより、ClickHouse 上に既に構築されたカスタムオブザーバビリティパイプラインに適しています。

完全な機能を有効にするには、ダッシュボード、保存された検索、ユーザー設定、アラートなどのアプリケーション状態を保存するための MongoDB インスタンスを提供する必要があります。

このモードでは、データ取り込みは完全にユーザーに委ねられます。独自にホストした OpenTelemetry コレクター、クライアントライブラリからの直接取り込み、ClickHouse ネイティブのテーブルエンジン(Kafka や S3 など)、ETL パイプライン、または ClickPipes のようなマネージド取り込みサービスを使用して、ClickHouse にデータを取り込むことができます。このアプローチは最大限の柔軟性を提供し、既に ClickHouse を運用しており、可視化、検索、アラート機能のために HyperDX をレイヤーとして追加したいチームに適しています。

### 適している対象 {#suitable-for}

- 既存の ClickHouse ユーザー
- カスタムイベントパイプライン


## デプロイ手順 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Dockerでデプロイする {#deploy-hyperdx-with-docker}

以下のコマンドを実行します。必要に応じて`YOUR_MONGODB_URI`を変更してください。

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### HyperDX UIにアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。

要件を満たすユーザー名とパスワードを入力してユーザーを作成します。

`Create`をクリックすると、接続の詳細情報の入力を求められます。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

### 接続の詳細情報を入力する {#complete-connection-details}

外部のClickHouseクラスタ(例: ClickHouse Cloud)に接続します。

<Image img={hyperdx_2} alt='HyperDX Login' size='md' />

ソースの作成を求められた場合は、すべてのデフォルト値を保持し、`Table`フィールドに`otel_logs`を入力します。その他の設定は自動検出されるため、`Save New Source`をクリックできます。

:::note ソースの作成
ソースを作成するには、ClickHouseにテーブルが存在している必要があります。データがない場合は、ClickStack OpenTelemetryコレクターをデプロイしてテーブルを作成することを推奨します。
:::

</VerticalStepper>


## Docker Composeの使用 {#using-docker-compose}

[Docker Compose設定](/use-cases/observability/clickstack/deployment/docker-compose)を変更することで、このガイドと同じ効果を実現できます。マニフェストからOTelコレクターとClickHouseインスタンスを削除してください。


## ClickStack OpenTelemetry コレクター {#otel-collector}

スタック内の他のコンポーネントとは独立して独自の OpenTelemetry コレクターを管理している場合でも、ClickStack ディストリビューションのコレクターを使用することをお勧めします。これにより、デフォルトスキーマが使用され、取り込みのベストプラクティスが適用されます。

スタンドアロンコレクターのデプロイと設定の詳細については、[「OpenTelemetry による取り込み」](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)を参照してください。

<JSONSupport />

HyperDX 専用イメージの場合、ユーザーは `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` パラメータを設定するだけです。例:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
