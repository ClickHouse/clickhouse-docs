---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: 'ClickStack によるホストログ監視'
sidebar_label: '汎用ホストログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack による汎用ホストログ監視'
doc_type: 'guide'
keywords: ['ホストログ', 'systemd', 'syslog', 'OTEL', 'ClickStack', 'システム監視', 'サーバーログ']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/host-logs/log-view.png';
import search_view from '@site/static/images/clickstack/host-logs/search-view.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickStack を使用したホストログの監視 {#host-logs-clickstack}

:::note[TL;DR]
このガイドでは、OpenTelemetry collector を構成して systemd、カーネル、SSH、cron などのシステムサービスからログを収集し、ClickStack でホストのシステムログを監視する方法を説明します。次の内容を学びます:

- OTel collector を構成してシステムログファイルを読み取る
- カスタム設定を適用した ClickStack をデプロイする
- あらかじめ用意されたダッシュボードを使って、ホストログのエラー、警告、サービスアクティビティなどのインサイトを可視化する

本番ホストを設定する前に連携をテストしたい場合のために、サンプルログを含むデモデータセットが用意されています。

所要時間: 5〜10 分
:::



## 既存ホストとの統合 {#existing-hosts}

このセクションでは、既存のホストから ClickStack にシステムログを送信できるようにするために、ClickStack の OTel collector の設定を変更し、すべてのシステムログファイル（syslog、auth、kernel、daemon、およびアプリケーションログ）を読み取るように構成する方法を説明します。

既存環境を設定する前にホストログ連携を試したい場合は、["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset) セクションにある事前構成済みセットアップとサンプルデータを使用してテストできます。

##### 前提条件 {#prerequisites}

- 稼働中の ClickStack インスタンス
- syslog ファイルを出力しているシステム
- ClickStack の設定ファイルを変更するためのアクセス権

<VerticalStepper headerLevel="h4">

#### syslog ファイルの存在を確認する {#verify-syslog}

まず、システムが syslog ファイルを書き出していることを確認します。


```bash
# syslog ファイルの存在を確認する（Linux）
ls -la /var/log/syslog /var/log/messages
```


# または macOS の場合は
ls -la /var/log/system.log



# 最近のエントリを表示する

tail -20 /var/log/syslog

````

一般的な syslog のパス:
- **Ubuntu/Debian**: `/var/log/syslog`
- **RHEL/CentOS/Fedora**: `/var/log/messages`
- **macOS**: `/var/log/system.log`

#### カスタム OTel collector 設定を作成する {#custom-otel}

ClickStack では、カスタム設定ファイルをマウントし、環境変数を設定することで、ベースとなる OpenTelemetry Collector の設定を拡張できます。

システムに合わせた設定を記述した `host-logs-monitoring.yaml` という名前のファイルを作成します:

<Tabs groupId="os-type">
<TabItem value="modern-linux" label="最新の Linux (Ubuntu 24.04+)" default>

```yaml
receivers:
  filelog/syslog:
    include:
      - /var/log/syslog
      - /var/log/**/*.log
    start_at: end
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout_type: gotime
        layout: '2006-01-02T15:04:05.999999-07:00'

      - type: add
        field: attributes.source
        value: "host-logs"

      - type: add
        field: resource["service.name"]
        value: "host-production"

service:
  pipelines:
    logs/host:
      receivers: [filelog/syslog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
````

</TabItem>
<TabItem value="legacy-linux" label="レガシー Linux (Ubuntu 20.04, RHEL, CentOS)">

```yaml
receivers:
  filelog/syslog:
    include:
      - /var/log/syslog
      - /var/log/messages
      - /var/log/**/*.log
    start_at: end
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout: "%b %d %H:%M:%S"

      - type: add
        field: attributes.source
        value: "host-logs"

      - type: add
        field: resource["service.name"]
        value: "host-production"

service:
  pipelines:
    logs/host:
      receivers: [filelog/syslog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

</TabItem>
<TabItem value="macos" label="macOS">

```yaml
receivers:
  filelog/syslog:
    include:
      - /var/log/system.log
      - /host/private/var/log/*.log
    start_at: end
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout: "%b %d %H:%M:%S"

      - type: add
        field: attributes.source
        value: "host-logs"

      - type: add
        field: resource["service.name"]
        value: "host-production"

service:
  pipelines:
    logs/host:
      receivers: [filelog/syslog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

</TabItem>
</Tabs>
<br/>
すべての構成に共通する動作:
- 標準的なパスから syslog ファイルを読み取る
- syslog フォーマットを解析し、構造化されたフィールド（タイムスタンプ、ホスト名、ユニット／サービス、PID、メッセージ）を抽出する
- 元のログのタイムスタンプを保持する
- HyperDX でのフィルタリング用に `source: host-logs` 属性を追加する
- 専用のパイプラインを介してログを ClickHouse エクスポーターへルーティングする


:::note

- カスタム設定では、新しいレシーバーとパイプラインのみを定義します。
- プロセッサ（`memory_limiter`、`transform`、`batch`）およびエクスポーター（`clickhouse`）は ClickStack のベース構成ですでに定義されているため、カスタム設定では名前で参照するだけです。
- 正規表現パーサーは syslog 形式から systemd ユニット名、PID、およびその他のメタデータを抽出します。
- この構成では、コレクター再起動時のログの再取り込みを避けるために `start_at: end` を使用しています。テスト時は `start_at: beginning` に変更すると過去のログをすぐに確認できます。
  :::

#### カスタム設定を読み込むように ClickStack を構成する {#load-custom}

既存の ClickStack デプロイメントでカスタムコレクター設定を有効にするには、次を実施する必要があります。

1. カスタム設定ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントする
2. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定する
3. コレクターが読み取れるように syslog のディレクトリをマウントする

##### Option 1: Docker Compose {#docker-compose}

Update your ClickStack deployment configuration:

```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log:/var/log:ro
      # ... other volumes ...
```

##### オプション 2: Docker Run（オールインワンイメージ） {#all-in-one}

docker run を使用してオールインワンイメージを実行する場合は、次のコマンドを使用します。

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
ClickStack コレクターが syslog ファイルを読み取るための適切な権限を持っていることを確認してください。本番環境では読み取り専用マウント（`:ro`）を使用し、最小権限の原則に従ってください。
:::

#### HyperDX でログを確認する {#verifying-logs}

設定が完了したら、HyperDX にログインしてログが流れていることを確認します。

1. 検索ビューに移動する
2. source を Logs に設定する
3. `source:host-logs` でフィルタリングしてホスト固有のログを表示する
4. `unit`、`hostname`、`pid`、`message` などのフィールドを含む構造化されたログエントリが表示されるはずです。

<Image img={search_view} alt='検索ビュー' />
<Image img={log_view} alt='ログビュー' />

</VerticalStepper>


## デモ用データセット {#demo-dataset}

本番環境を設定する前にホストログ連携をテストしたいユーザー向けに、実際の運用に近いパターンを含む事前生成済みのシステムログのサンプルデータセットを提供します。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする {#download-sample}

サンプルログファイルをダウンロードします：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

このデータセットには次の内容が含まれます。
- システムのブートシーケンス
- SSH ログインアクティビティ（成功および失敗した試行）
- セキュリティインシデント（fail2ban による応答を伴うブルートフォース攻撃）
- 計画メンテナンス作業（cron ジョブ、anacron）
- サービスの再起動（rsyslog）
- カーネルメッセージとファイアウォールのアクティビティ
- 通常運用と注目すべきイベントの混在

#### テスト用コレクター設定を作成する {#test-config}

次の設定内容で `host-logs-demo.yaml` という名前のファイルを作成します。

```yaml
cat > host-logs-demo.yaml << 'EOF'
receivers:
  filelog/journal:
    include:
      - /tmp/host-demo/journal.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%Y-%m-%dT%H:%M:%S%z'
      
      - type: add
        field: attributes.source
        value: "host-demo"
      
      - type: add
        field: resource["service.name"]
        value: "host-demo"

service:
  pipelines:
    logs/host-demo:
      receivers: [filelog/journal]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### デモ設定で ClickStack を実行する {#run-demo}

デモ用ログと設定を使用して ClickStack を実行します。

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**このコマンドはログファイルをコンテナ内に直接マウントします。これは静的なデモデータを使ったテスト目的で行っています。**
:::

#### HyperDX でログを確認する {#verify-demo-logs}

ClickStack が起動したら、次を実行します。

1. [HyperDX](http://localhost:8080/) を開き、アカウントにログインします（アカウントを持っていない場合は先に作成する必要があります）
2. Search ビューに移動し、source を `Logs` に設定します
3. 時間範囲を **2025-11-10 00:00:00 - 2025-11-13 00:00:00** に設定します

<Image img={search_view} alt="Search ビュー"/>
<Image img={log_view} alt="Log ビュー"/>

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** の期間をカバーしています。広めの時間範囲を指定することで、どの場所からアクセスしてもデモログを確認できるようにしています。ログが表示されたら、より見やすく可視化するために時間範囲を 24 時間程度に絞り込むことができます。
:::

</VerticalStepper>



## ダッシュボードと可視化 {#dashboards}

ClickStack でホストログの監視を始めやすくするために、システムログ向けの基本的な可視化を用意しています。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">ダッシュボード設定をダウンロード</TrackedLink> {#download}

#### あらかじめ用意されたダッシュボードをインポートする {#import-dashboard}

1. HyperDX を開き、Dashboards セクションに移動します
2. 右上の三点リーダー（…）メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `host-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードを表示する {#created-dashboard}

ダッシュボードは、すべての可視化があらかじめ設定された状態で作成されます。

<Image img={logs_dashboard} alt="ログダッシュボード"/>

主な可視化には次が含まれます。
- 重要度別の時間経過に伴うログ量
- ログを生成している上位の systemd ユニット
- SSH ログインアクティビティ（成功 vs 失敗）
- ファイアウォールアクティビティ（ブロック vs 許可）
- セキュリティイベント（ログイン失敗、BAN、ブロック）
- サービスの再起動アクティビティ

:::note
デモデータセットでは、時間範囲を **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。インポートされたダッシュボードには、デフォルトでは時間範囲が指定されていません。
:::

</VerticalStepper>



## トラブルシューティング

### カスタム設定が読み込まれない

環境変数が設定されていることを確認してください：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

カスタム設定ファイルがマウントされており、読み取り可能であることを確認します。

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### HyperDX にログが表示されない


**syslog ファイルが存在し、書き込まれていることを確認する:**

```bash
# syslog が存在するか確認する
ls -la /var/log/syslog /var/log/messages
```


# ログが出力されていることを確認する

tail -f /var/log/syslog

````

**コレクターがログを読み取れることを確認する：**
```bash
docker exec <container> cat /var/log/syslog | head -20
````

**有効な構成に `filelog` レシーバーが含まれていることを確認します。**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**コレクターのログにエラーが出ていないか確認する：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**デモデータセットを使用している場合は、ログファイルにアクセス可能であることを確認します。**

```bash
docker exec <container> cat /tmp/host-demo/journal.log | wc -l
```

### ログが正しく解析されない

**選択した設定と syslog フォーマットが一致していることを確認してください。**


最新の Linux ディストリビューション（Ubuntu 24.04 以降）の場合：

```bash
# ISO8601形式で表示されているはずです：2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```


旧バージョンの Linux または macOS を使用している場合:

```bash
# 従来形式で表示されます: Nov 17 14:16:16
tail -5 /var/log/syslog
# または
tail -5 /var/log/system.log
```

フォーマットが一致しない場合は、[Create custom OTel collector configuration](#custom-otel) セクションで該当する設定タブを選択してください。


## 次のステップ {#next-steps}

ホストログのモニタリングを設定したら、次の作業を行います。

- 重大なシステムイベント（サービス障害、認証失敗、ディスク警告）に対する[アラート](/use-cases/observability/clickstack/alerts)を設定する
- 特定のサービスを監視するために、対応するユニットでフィルタリングする
- 包括的なトラブルシューティングのために、ホストログとアプリケーションログを相関付ける
- セキュリティ監視（SSH 接続試行、sudo 使用状況、ファイアウォールブロック）向けのカスタムダッシュボードを作成する



## 本番環境への移行 {#going-to-production}

このガイドでは、迅速なセットアップのために ClickStack に組み込まれている OpenTelemetry Collector をベースとして拡張しています。本番環境でのデプロイでは、独自の OTel Collector を実行し、ClickStack の OTLP エンドポイントにデータを送信することを推奨します。本番環境での構成については、[OpenTelemetry データの送信](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。
