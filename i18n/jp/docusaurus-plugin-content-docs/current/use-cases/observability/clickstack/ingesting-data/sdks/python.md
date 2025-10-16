---
'slug': '/use-cases/observability/clickstack/sdks/python'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'Python for ClickStack - The ClickHouse 可観測性スタック'
'title': 'Python'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStackは、テレメトリーデータ（ログとトレース）を収集するためにOpenTelemetry標準を使用しています。トレースは自動計測により自動生成されるため、トレーシングから価値を引き出すために手動での計測は必要ありません。

このガイドは以下を統合しています：

- **ログ**
- **メトリック**
- **トレース**

## 始めに {#getting-started}

### ClickStack OpenTelemetry計測パッケージのインストール {#install-clickstack-otel-instrumentation-package}

次のコマンドを使用して[ClickStack OpenTelemetryパッケージ](https://pypi.org/project/hyperdx-opentelemetry/)をインストールします。

```shell
pip install hyperdx-opentelemetry
```

Pythonアプリケーションで使用されるパッケージのために、OpenTelemetry自動計測ライブラリをインストールします。アプリケーションパッケージをスキャンして利用可能なライブラリのリストを生成するために、OpenTelemetry Python SDKに付属の`opentelemetry-bootstrap`ツールを使用することをお勧めします。

```shell
opentelemetry-bootstrap -a install
```

### 環境変数の設定 {#configure-environment-variables}

その後、テレメトリをClickStackに送信するために、シェル内で以下の環境変数を設定する必要があります：

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

_`OTEL_SERVICE_NAME`環境変数は、HyperDXアプリでサービスを識別するために使用され、任意の名前を付けることができます。_

### OpenTelemetry Pythonエージェントでアプリケーションを実行する {#run-the-application-with-otel-python-agent}

これで、OpenTelemetry Pythonエージェント（`opentelemetry-instrument`）を使用してアプリケーションを実行できます。

```shell
opentelemetry-instrument python app.py
```

#### `Gunicorn`、`uWSGI`、または`uvicorn`を使用している場合 {#using-uvicorn-gunicorn-uwsgi}

この場合、OpenTelemetry Pythonエージェントが動作するためには追加の変更が必要です。

フォーク前のウェブサーバーモードを使用してアプリケーションサーバーのOpenTelemetryを構成するには、ポストフォークフック内で`configure_opentelemetry`メソッドを呼び出すことを確認してください。

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

OpenTelemetryは、`--reload`フラグを使用して実行される`uvicorn`やマルチワーカー（`--workers`）では[現在動作しません](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385)。テスト中はこれらのフラグを無効にするか、Gunicornを使用することをお勧めします。

</TabItem>

</Tabs>

## 高度な構成 {#advanced-configuration}

#### ネットワークキャプチャ {#network-capture}

ネットワークキャプチャ機能を有効にすることで、開発者はHTTPリクエストヘッダーやボディペイロードを効果的にデバッグする能力を得ます。これは、`HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE`フラグを1に設定するだけで実現できます。

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```

## トラブルシューティング {#troubleshooting}

### ログレベルによるログ未表示 {#logs-not-appearing-due-to-log-level}

デフォルトでは、OpenTelemetryのロギングハンドラーは`logging.NOTSET`レベルを使用し、これがWARNINGレベルになります。ロガーを作成するときにロギングレベルを指定できます：

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### コンソールへのエクスポート {#exporting-to-the-console}

OpenTelemetry Python SDKは、エラーが発生すると通常コンソールに表示します。しかし、エラーに遭遇しないがデータがHyperDXに期待通りに表示されない場合は、デバッグモードを有効にするオプションがあります。デバッグモードが有効になると、すべてのテレメトリーがコンソールに印刷され、アプリケーションが期待されるデータで正しく計測されているかどうかを確認できます。

```shell
export DEBUG=true
```

Python OpenTelemetry計測についての詳しい情報は、こちらを参照してください：
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
