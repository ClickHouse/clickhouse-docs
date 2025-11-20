---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 用 Python - ClickHouse Observability スタック'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack は、テレメトリーデータ（ログとトレース）を収集するために OpenTelemetry 標準を使用します。トレースは自動インストルメンテーションによって自動生成されるため、トレースを活用するために手動インストルメンテーションを行う必要はありません。

このガイドでは、次の要素を統合します:

* **ログ**
* **メトリクス**
* **トレース**


## はじめに {#getting-started}

### ClickStack OpenTelemetry計装パッケージのインストール {#install-clickstack-otel-instrumentation-package}

以下のコマンドを使用して[ClickStack OpenTelemetryパッケージ](https://pypi.org/project/hyperdx-opentelemetry/)をインストールします。

```shell
pip install hyperdx-opentelemetry
```

Pythonアプリケーションで使用しているパッケージ向けのOpenTelemetry自動計装ライブラリをインストールします。OpenTelemetry Python SDKに付属する`opentelemetry-bootstrap`ツールを使用して、アプリケーションパッケージをスキャンし、利用可能なライブラリのリストを生成することを推奨します。

```shell
opentelemetry-bootstrap -a install
```

### 環境変数の設定 {#configure-environment-variables}

次に、テレメトリをClickStackに送信するために、シェルで以下の環境変数を設定する必要があります。

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

_`OTEL_SERVICE_NAME`環境変数は、HyperDXアプリ内でサービスを識別するために使用されます。任意の名前を指定できます。_

### OpenTelemetry Pythonエージェントでアプリケーションを実行 {#run-the-application-with-otel-python-agent}

これで、OpenTelemetry Pythonエージェント（`opentelemetry-instrument`）を使用してアプリケーションを実行できます。

```shell
opentelemetry-instrument python app.py
```

#### `Gunicorn`、`uWSGI`、または`uvicorn`を使用している場合 {#using-uvicorn-gunicorn-uwsgi}

この場合、OpenTelemetry Pythonエージェントを動作させるには追加の変更が必要です。

プリフォークWebサーバーモードを使用するアプリケーションサーバー向けにOpenTelemetryを設定するには、ポストフォークフック内で`configure_opentelemetry`メソッドを呼び出すようにしてください。

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

OpenTelemetryは現在、`--reload`フラグを使用して実行される`uvicorn`や、マルチワーカー（`--workers`）では[動作しません](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385)。テスト中はこれらのフラグを無効にするか、Gunicornを使用することを推奨します。

</TabItem>

</Tabs>


## 高度な設定 {#advanced-configuration}

#### ネットワークキャプチャ {#network-capture}

ネットワークキャプチャ機能を有効にすることで、開発者はHTTPリクエストヘッダーとボディペイロードを効果的にデバッグできます。これは`HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE`フラグを1に設定するだけで実現できます。

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```


## トラブルシューティング {#troubleshooting}

### ログレベルによるログの非表示 {#logs-not-appearing-due-to-log-level}

デフォルトでは、OpenTelemetryログハンドラは`logging.NOTSET`レベルを使用し、これはWARNINGレベルにデフォルト設定されます。ロガーを作成する際にログレベルを指定できます:

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### コンソールへのエクスポート {#exporting-to-the-console}

OpenTelemetry Python SDKは通常、エラーが発生するとコンソールに表示します。ただし、エラーが発生していないにもかかわらず、データがHyperDXに期待通りに表示されない場合は、デバッグモードを有効にすることができます。デバッグモードを有効にすると、すべてのテレメトリがコンソールに出力され、アプリケーションが期待されるデータで適切にインストルメント化されているかを確認できます。

```shell
export DEBUG=true
```

Python OpenTelemetryインストルメンテーションの詳細については、こちらをご覧ください:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
