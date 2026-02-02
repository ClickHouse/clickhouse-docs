---
slug: /use-cases/observability/clickstack/integrations/systemd-logs
title: 'ClickStack を使用した Systemd ログの監視'
sidebar_label: 'Systemd/Journald ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Systemd および Journald ログの監視'
doc_type: 'guide'
keywords: ['systemd', 'journald', 'journal', 'OTel', 'ClickStack', 'system logs', 'systemctl']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/systemd/finish-import-systemd.png';
import example_dashboard from '@site/static/images/clickstack/systemd/systemd-logs-dashboard.png';
import search_view from '@site/static/images/clickstack/systemd/systemd-search-view.png';
import log_view from '@site/static/images/clickstack/systemd/systemd-log-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# ClickStack を使用した systemd ログの監視 \{#systemd-logs-clickstack\}

:::note[TL;DR]
このガイドでは、OpenTelemetry Collector を journald receiver とともに実行し、ClickStack を使って systemd ジャーナルログを監視する方法を説明します。次のことができるようになります。

- systemd ジャーナルエントリを読み取るために OpenTelemetry Collector をデプロイする
- OTLP 経由で systemd ログを ClickStack に送信する
- あらかじめ用意されたダッシュボードを使用して、systemd ログに関するインサイト（サービスの状態、エラー、認証イベント）を可視化する

本番環境を構成する前にインテグレーションをテストしたい場合のために、サンプルログを含むデモデータセットが用意されています。

所要時間: 10〜15 分
:::

## 既存システムとの統合 \{#existing-systems\}

OpenTelemetry Collector を `journald` レシーバー構成で実行し、既存の Linux システムの `journald` ログを監視してシステムログを収集し、OTLP 経由で ClickStack に送信します。

既存のセットアップを変更せずにまずこの統合を試したい場合は、[デモデータセットのセクション](#demo-dataset)に進んでください。

##### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること
- systemd を使用する Linux システム (Ubuntu 16.04+、CentOS 7+、Debian 8+)
- 監視対象システムに Docker または Docker Compose がインストールされていること

<VerticalStepper headerLevel="h4">

#### ClickStack API key を取得する \{#get-api-key\}

OpenTelemetry Collector は ClickStack の OTLP エンドポイントにデータを送信します。このエンドポイントへの送信には認証が必要です。

1. ClickStack の URL (例: http://localhost:8080) で HyperDX を開きます
2. 必要に応じてアカウントを作成するかログインします
3. **Team Settings → API Keys** に移動します
4. **Ingestion API Key** をコピーします

<Image img={api_key} alt="ClickStack API Key"/>

5. コピーしたキーを環境変数として設定します:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### systemd journal が稼働していることを確認する \{#verify-systemd\}

システムが systemd を使用しており、journal ログが有効になっていることを確認します:

```bash
# systemd のバージョンを確認
systemctl --version

# 直近の journal エントリを表示
journalctl -n 20

# journal のディスク使用量を確認
journalctl --disk-usage
```

journal の保存先がメモリのみの場合は、永続ストレージを有効化します:

```bash
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
sudo systemctl restart systemd-journald
```

#### OpenTelemetry Collector の設定を作成する \{#create-otel-config\}

OpenTelemetry Collector 用の設定ファイルを作成します:

```yaml
cat > otel-config.yaml << 'EOF'
receivers:
  journald:
    directory: /var/log/journal
    priority: info
    units:
      - sshd
      - nginx
      - docker
      - containerd
      - systemd

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
  
  resource:
    attributes:
      - key: service.name
        value: systemd-logs
        action: insert
      - key: host.name
        from_attribute: _HOSTNAME
        action: upsert
  
  attributes:
    actions:
      - key: unit
        from_attribute: _SYSTEMD_UNIT
        action: upsert
      - key: priority
        from_attribute: PRIORITY
        action: upsert

exporters:
  otlphttp:
    endpoint: ${CLICKSTACK_ENDPOINT}
    headers:
      authorization: ${CLICKSTACK_API_KEY}

service:
  pipelines:
    logs:
      receivers: [journald]
      processors: [resource, attributes, batch]
      exporters: [otlphttp]
EOF
```

#### Docker Compose でデプロイする \{#deploy-docker-compose\}

:::note
`journald` レシーバーは、journal ファイルを読み取るために `journalctl` バイナリを必要とします。公式の `otel/opentelemetry-collector-contrib` イメージには、デフォルトでは `journalctl` が含まれていません。

コンテナ化された環境でデプロイする場合は、collector をホストに直接インストールするか、systemd ユーティリティを含むカスタムイメージをビルドすることができます。詳細は [トラブルシューティングのセクション](#journalctl-not-found) を参照してください。
:::

次の例では、OTel collector を ClickStack と一緒にデプロイします:

```yaml
services:
  clickstack:
    image: clickhouse/clickstack-all-in-one:latest
    ports:
      - "8080:8080"
      - "4317:4317"
      - "4318:4318"
    networks:
      - monitoring
  
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.115.1
    depends_on:
      - clickstack
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
      - CLICKSTACK_ENDPOINT=http://clickstack:4318
    volumes:
      - ./otel-config.yaml:/etc/otelcol/config.yaml:ro
      - /var/log/journal:/var/log/journal:ro
      - /run/log/journal:/run/log/journal:ro
      - /etc/machine-id:/etc/machine-id:ro
    command: ["--config=/etc/otelcol/config.yaml"]
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
```

サービスを起動します:

```bash
docker compose up -d
```

#### HyperDX 上でログを確認する \{#verifying-logs\}

設定が完了したら、HyperDX にログインしてログがインジェストされていることを確認します:

1. Search ビューに移動します
2. source を Logs に設定します
3. `service.name:systemd-logs` でフィルタします
4. `unit`、`priority`、`MESSAGE`、`_HOSTNAME` などのフィールドを含む構造化ログエントリが表示されるはずです

<Image img={search_view} alt="ログ検索ビュー"/>

<Image img={log_view} alt="ログビュー"/>

</VerticalStepper>

## デモデータセット \{#demo-dataset\}

本番環境を構成する前に systemd ログ連携を試したいユーザー向けに、現実的なパターンを含む事前生成済みの systemd ログのサンプルデータセットを提供します。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットをダウンロードする \{#download-sample\}

サンプルログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/systemd/systemd-demo.log
```

#### デモ用 Collector 設定を作成する \{#demo-config\}

デモ用の設定ファイルを作成します:

```bash
cat > systemd-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/systemd-demo/systemd-demo.log
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
        value: "systemd-demo"

service:
  pipelines:
    logs/systemd-demo:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### デモデータで ClickStack を起動する \{#run-demo\}

デモログを使用して ClickStack を起動します:

```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/systemd-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/systemd-demo.log:/tmp/systemd-demo/systemd-demo.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

:::note
このデモでは、コンテナ内で `journalctl` を必要としないようにするため、`journald` ではなくテキストログを扱う `filelog` receiver を使用しています。
:::

#### HyperDX でログを確認する \{#verify-demo-logs\}

ClickStack が起動したら、次の手順を実行します:

1. [HyperDX](http://localhost:8080/) を開き、自分のアカウントにログインします
2. Search ビューに移動し、ソースを `Logs` に設定します
3. タイムレンジを **2025-11-14 00:00:00 - 2025-11-17 00:00:00** に設定します

<Image img={search_view} alt="ログ検索ビュー"/>

<Image img={log_view} alt="ログビュー"/>

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)** の期間をカバーしています。広めのタイムレンジを指定することで、どの地域からアクセスしてもデモログが表示されるようにしています。
:::

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

ClickStack で systemd ログの監視を開始するにあたって役立つように、systemd ジャーナルデータ向けの基本的な可視化を提供しています。

<VerticalStepper headerLevel="h4">

#### ダッシュボード設定を<TrackedLink href={useBaseUrl('/examples/systemd-logs-dashboard.json')} download="systemd-logs-dashboard.json" eventName="docs.systemd_logs_monitoring.dashboard_download">ダウンロード</TrackedLink> \{#download\}

#### あらかじめ用意されたダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します
2. 右上の省略記号メニューから **Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードのインポートボタン"/>

3. `systemd-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードを表示する \{#created-dashboard\}

このダッシュボードには、次のような可視化が含まれます:
- 時間経過に伴うログボリューム
- ログ数が多い上位の systemd ユニット
- SSH 認証イベント
- サービス障害
- エラー率

<Image img={example_dashboard} alt="ダッシュボードの例"/>

:::note
デモデータセットの場合、時間範囲を **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに応じて調整してください）。
:::

</VerticalStepper>

## トラブルシューティング \{#troubleshooting\}

### HyperDX にログが表示されない \{#no-logs\}

ログが ClickHouse に届いているか確認してください。

```bash
docker exec clickstack clickhouse-client --query "
SELECT COUNT(*) as log_count
FROM otel_logs
WHERE ServiceName = 'systemd-logs'
"
```

結果が得られない場合は、collector のログを確認してください:

```bash
docker logs otel-collector | grep -i "error\|journald" | tail -20
```


### journalctl が見つからないエラー \{#journalctl-not-found\}

`exec: "journalctl": executable file not found in $PATH` が表示される場合:

`otel/opentelemetry-collector-contrib` イメージには `journalctl` が含まれていません。次のいずれかを実行してください:

1. **ホストにコレクターをインストールする**:

```bash
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.115.0/otelcol-contrib_0.115.0_linux_amd64.tar.gz
tar -xzf otelcol-contrib_0.115.0_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/
otelcol-contrib --config=otel-config.yaml
```

2. デモと同様に journald のエクスポートを `filelog` レシーバーで読み込む **テキストエクスポート方式** を使用する


## 本番運用への移行 \{#going-to-production\}

このガイドでは、独立した OpenTelemetry Collector を使用して systemd ログを読み取り、ClickStack の OTLP エンドポイントへ送信します。これは本番環境で推奨されるパターンです。

複数ホストを含む本番環境では、次の内容を検討してください。

- コレクターを Kubernetes のデーモンセットとしてデプロイする
- 各ホストでコレクターを systemd サービスとして実行する
- 自動デプロイのために OpenTelemetry Operator を使用する

本番環境でのデプロイパターンについては、[OpenTelemetry を使用した取り込み](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。