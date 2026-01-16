---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 向け Python - ClickHouse Observability Stack'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ロギング', '連携', 'アプリケーション監視']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack は、テレメトリーデータ（ログとトレース）を収集するために OpenTelemetry の標準を使用します。トレースは自動インストルメンテーションによって自動生成されるため、トレースを活用するために手動でインストルメンテーションを行う必要はありません。

このガイドでは次を統合します：

* **ログ**
* **メトリクス**
* **トレース**

## はじめに \\{#getting-started\\}

### ClickStack OpenTelemetry インストルメンテーションパッケージのインストール \\{#install-clickstack-otel-instrumentation-package\\}

次のコマンドで、[ClickStack OpenTelemetry パッケージ](https://pypi.org/project/hyperdx-opentelemetry/) をインストールします。

```shell
pip install hyperdx-opentelemetry
```

Python アプリケーションで使用しているパッケージ向けの OpenTelemetry 自動計装ライブラリをインストールします。アプリケーションのパッケージをスキャンして利用可能なライブラリのリストを生成するために、OpenTelemetry Python SDK に付属する `opentelemetry-bootstrap` ツールを使用することを推奨します。

```shell
opentelemetry-bootstrap -a install
```

### 環境変数を設定する \\{#configure-environment-variables\\}

その後、ClickStack にテレメトリを送信するために、シェル環境で以下の環境変数を設定する必要があります。

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

*`OTEL_SERVICE_NAME` 環境変数は、HyperDX アプリ内でサービスを識別するために使用されます。任意の名前を指定できます。*

### OpenTelemetry Python エージェントでアプリケーションを実行する \\{#run-the-application-with-otel-python-agent\\}

OpenTelemetry Python エージェント（`opentelemetry-instrument`）を使用してアプリケーションを実行できます。

```shell
opentelemetry-instrument python app.py
```

#### `Gunicorn`、`uWSGI` または `uvicorn` を使用している場合 \\{#using-uvicorn-gunicorn-uwsgi\\}

このような場合は、OpenTelemetry Python エージェントを動作させるには追加の設定が必要です。

プリフォーク型の Web サーバーモードを使用するアプリケーションサーバーで OpenTelemetry を構成するには、post-fork フック内で `configure_opentelemetry` メソッドを必ず呼び出してください。

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

OpenTelemetry は、`--reload` フラグを付けて実行された `uvicorn` や、マルチワーカー（`--workers`）構成では[現在は動作しません](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385)。テスト時はこれらのフラグを無効にするか、代わりに Gunicorn を使用することを推奨します。

</TabItem>

</Tabs>

## 高度な設定 \\{#advanced-configuration\\}

#### ネットワークキャプチャ \\{#network-capture\\}

ネットワークキャプチャ機能を有効にすることで、開発者は HTTP リクエストヘッダーおよびリクエストボディのペイロードを効果的にデバッグできるようになります。これは、`HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` フラグを 1 に設定するだけで有効化できます。

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```

## トラブルシューティング \\{#troubleshooting\\}

### ログレベルが原因でログが表示されない場合 \\{#logs-not-appearing-due-to-log-level\\}

デフォルトでは、OpenTelemetry の logging handler は `logging.NOTSET` レベルを使用しており、
これは結果的に WARNING レベルとして扱われます。logger を作成するときに、
ログレベルを指定できます。

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### コンソールへのエクスポート \\{#exporting-to-the-console\\}

OpenTelemetry Python SDK は、通常、エラーが発生するとコンソールにエラーを表示します。しかし、エラーは発生していないにもかかわらず、期待どおりにデータが HyperDX に表示されない場合は、デバッグモードを有効にすることができます。デバッグモードを有効にすると、すべてのテレメトリーデータがコンソールに出力されるため、アプリケーションが期待どおりのデータで正しく計装されているかを確認できます。

```shell
export DEBUG=true
```

Python 向け OpenTelemetry インストルメンテーションの詳細については、こちらのドキュメントをご覧ください:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
