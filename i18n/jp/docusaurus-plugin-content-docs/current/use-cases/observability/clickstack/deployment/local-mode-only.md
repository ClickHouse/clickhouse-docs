---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: 'ローカルモードのみ'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'ローカルモードのみで ClickStack をデプロイ - ClickHouse Observability スタック'
doc_type: 'ガイド'
keywords: ['clickstack', 'デプロイメント', 'セットアップ', '構成', '可観測性']
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

[all-in-one image](/use-cases/observability/clickstack/deployment/docker-compose) と同様に、この包括的な Docker イメージには、すべての ClickStack コンポーネントが含まれています：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**（ポート `4317` および `4318` で OTLP を公開）
* **MongoDB**（アプリケーション状態の永続化用）

**ただし、この HyperDX のディストリビューションではユーザー認証は無効になっています**

### 適した用途 {#suitable-for}

* デモ
* デバッグ
* HyperDX を用いた開発

## デプロイ手順 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">
  ### Docker でデプロイする

  ローカルモードでは、HyperDX UI がポート 8080 で起動します。

  ```shell
  docker run -p 8080:8080 clickhouse/clickstack-local:latest
  ```

  ### HyperDX UI にアクセスする

  HyperDX UI にアクセスするには、[http://localhost:8080](http://localhost:8080) を開きます。

  **このデプロイモードでは認証が有効になっていないため、ユーザー作成画面は表示されません。**

  外部の ClickHouse クラスター（例: ClickHouse Cloud）に接続します。

  <Image img={hyperdx_2} alt="ログイン情報を作成" size="md" />

  ソースを作成し、すべてのデフォルト値はそのままにして、`Table` フィールドに `otel_logs` を入力します。その他の設定は自動検出されるはずなので、`Save New Source` をクリックします。

  <Image img={hyperdx_logs} alt="ログソースを作成" size="md" />
</VerticalStepper>

<JSONSupport />

ローカルモード専用イメージの場合は、`BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` パラメーターを設定するだけで十分です（例: 環境変数として設定）。

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 clickhouse/clickstack-local:latest
```
