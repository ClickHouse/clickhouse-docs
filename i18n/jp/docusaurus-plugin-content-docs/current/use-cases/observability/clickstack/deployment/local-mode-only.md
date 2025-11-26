---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: 'ローカルモードのみ'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'ClickStack のローカルモード専用デプロイ - ClickHouse オブザーバビリティ スタック'
doc_type: 'guide'
keywords: ['clickstack', 'デプロイメント', 'セットアップ', '設定', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

[all-in-one イメージ](/use-cases/observability/clickstack/deployment/docker-compose) と同様に、この包括的な Docker イメージには、すべての ClickStack コンポーネントがバンドルされています：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**（ポート `4317` および `4318` で OTLP エンドポイントを公開）
* **MongoDB**（永続的なアプリケーション状態用）

**ただし、この HyperDX ディストリビューションではユーザー認証は無効になっています**

### 適した用途

* デモ
* デバッグ
* HyperDX を使用する開発


## デプロイ手順

<br />

<VerticalStepper headerLevel="h3">
  ### Docker でデプロイ

  ローカルモードでは、HyperDX UI がポート 8080 で動作します。

  ```shell
  docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
  ```

  ### HyperDX UI にアクセス

  HyperDX UI にアクセスするには、[http://localhost:8080](http://localhost:8080) を開きます。

  **このデプロイメントモードでは認証が有効になっていないため、ユーザー作成を求められることはありません。**

  ClickHouse Cloud など、ご自身の外部 ClickHouse クラスターに接続します。

  <Image img={hyperdx_2} alt="ログインの作成" size="md" />

  ソースを新規作成し、すべてのデフォルト値はそのままにして、`Table` フィールドに `otel_logs` を設定します。他の設定は自動検出されるため、そのまま `Save New Source` をクリックできます。

  <Image img={hyperdx_logs} alt="ログソースの作成" size="md" />
</VerticalStepper>

<JSONSupport />

ローカルモード専用イメージの場合は、`BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` パラメーターだけを設定すれば十分です（例:）。

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```
