---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 用 Python - ClickHouse オブザーバビリティ スタック'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ログ', '連携', 'アプリケーション監視']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack は、テレメトリーデータ（ログとトレース）を収集するために OpenTelemetry の標準仕様を使用します。トレースは自動インストルメンテーションによって自動生成されるため、トレースを有効活用するために手動インストルメンテーションを行う必要はありません。

このガイドでは、次のものを統合します。

* **ログ**
* **メトリクス**
* **トレース**


## はじめに

### ClickStack OpenTelemetry インストルメンテーションパッケージのインストール

次のコマンドを実行して、[ClickStack OpenTelemetry パッケージ](https://pypi.org/project/hyperdx-opentelemetry/) をインストールします。

```shell
pip install hyperdx-opentelemetry
```

Python アプリケーションで使用しているパッケージ向けに OpenTelemetry の自動計装ライブラリをインストールします。アプリケーションのパッケージをスキャンして利用可能なライブラリの一覧を生成するには、OpenTelemetry Python SDK に同梱されている `opentelemetry-bootstrap` ツールを使用することをお勧めします。

```shell
opentelemetry-bootstrap -a install
```

### 環境変数を設定する

次に、ClickStack にテレメトリを送信するために、シェルで以下の環境変数を設定する必要があります。

```shell
export HYPERDX_API_KEY='<あなたの取り込みAPIキー>' \
OTEL_SERVICE_NAME='<アプリまたはサービスの名前>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

*環境変数 `OTEL_SERVICE_NAME` は、HyperDX アプリ上でサービスを識別するために使用されます。任意の名前を指定できます。*

### OpenTelemetry Python エージェントでアプリケーションを実行する

これで、OpenTelemetry Python エージェント（`opentelemetry-instrument`）を使ってアプリケーションを実行できます。

```shell
opentelemetry-instrument python app.py
```

#### `Gunicorn`、`uWSGI` または `uvicorn` を使用している場合

このようなサーバーを使用している場合、OpenTelemetry Python エージェントを正しく動作させるには追加の設定が必要になります。

pre-fork 型 Web サーバーモードを使用するアプリケーションサーバーで OpenTelemetry を構成する場合は、post-fork フック内で `configure_opentelemetry` メソッドを必ず呼び出してください。

<Tabs groupId="python-alternative">
  <TabItem value="gunicorn" label="Gunicorn" default>
    ```python
    from hyperdx.opentelemetry import configure_opentelemetry

    def post_fork(server, worker):
        configure_opentelemetry()
    ```
  </TabItem>

  <TabItem value="uwsgi" label="uWSGI" default>
    ```python
    from hyperdx.opentelemetry import configure_opentelemetry
    from uwsgidecorators import postfork

    @postfork
    def init_tracing():
        configure_opentelemetry()
    ```
  </TabItem>

  <TabItem value="uvicorn" label="uvicorn" default>
    OpenTelemetry は、`--reload` フラグを付けて実行された `uvicorn` や、マルチワーカー（`--workers`）構成では[現在動作しません](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385)。テスト中はこれらのフラグを無効にするか、Gunicorn を使用することを推奨します。
  </TabItem>
</Tabs>


## 高度な設定

#### ネットワークキャプチャ

ネットワークキャプチャ機能を有効化すると、開発者は HTTP リクエストヘッダーおよびボディのペイロードを効率的にデバッグできるようになります。これは、`HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` フラグを 1 に設定するだけで有効になります。

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```


## トラブルシューティング

### ログレベルが原因でログが表示されない

デフォルトでは、OpenTelemetry のロギングハンドラーは `logging.NOTSET` レベルを使用しており、
これは実質的に WARNING レベルとして扱われます。ロガーを作成する際に、ログレベルを明示的に指定できます。

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### コンソールへの出力

OpenTelemetry Python SDK は、通常、エラーが発生するとコンソールにエラー内容を表示します。\
しかし、エラーは発生していないのに HyperDX にデータが期待どおり表示されない場合は、デバッグモードを有効にできます。\
デバッグモードを有効にすると、すべてのテレメトリデータがコンソールに出力され、アプリケーションが期待どおりのデータで正しく計装されているかどうかを確認できます。

```shell
export DEBUG=true
```

Python 向け OpenTelemetry インストルメンテーションの詳細については、次を参照してください:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
