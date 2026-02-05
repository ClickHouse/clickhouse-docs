---
slug: /use-cases/observability/clickstack/integrations/systemd-logs
title: 'ClickStack による Systemd ログの監視'
sidebar_label: 'Systemd/Journald ログ'
pagination_prev: null
pagination_next: null
description: 'ClickStack を使用した Systemd および Journald ログの監視'
doc_type: 'guide'
keywords: ['systemd', 'journald', 'journal', 'OTEL', 'ClickStack', 'system logs', 'systemctl']
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


# ClickStack による systemd ログの監視 \{#systemd-logs-clickstack\}

:::note[要約]
このガイドでは、OpenTelemetry Collector を journald receiver とともに実行することで、ClickStack を使って systemd ジャーナルログを監視する方法を説明します。次のことを学びます。

- OpenTelemetry Collector をデプロイして systemd ジャーナルエントリを読み取る
- OTLP 経由で systemd ログを ClickStack に送信する
- あらかじめ用意されたダッシュボードを使って、systemd ログから得られるインサイト (サービスの状態、エラー、認証イベント) を可視化する

本番システムを構成する前に統合をテストしたい場合のために、サンプルログを含むデモデータセットも用意されています。

所要時間: 10〜15分
:::

## 既存システムとの統合 \{#existing-systems\}

OpenTelemetry Collector を `journald` receiver とともに実行することで、既存の Linux システムの `journald` ログを監視し、システムログを収集して OTLP 経由で ClickStack に送信できます。

既存のセットアップを変更せずにまずこの統合をテストしたい場合は、[デモデータセットのセクション](#demo-dataset)までスキップしてください。

##### 前提条件 \{#prerequisites\}

- ClickStack インスタンスが稼働していること
- systemd を使用する Linux システム (Ubuntu 16.04+、CentOS 7+、Debian 8+)
- 監視対象システムに Docker または Docker Compose がインストールされていること

<VerticalStepper headerLevel="h4">

#### ClickStack の API キーを取得する \{#get-api-key\}

OpenTelemetry Collector は、認証が必要な ClickStack の OTLP エンドポイントにデータを送信します。

1. ClickStack の URL (例: http://localhost:8080) で HyperDX を開きます
2. 必要に応じてアカウントを作成するか、ログインします
3. **Team Settings → API Keys** に移動します
4. **Ingestion API Key** をコピーします

<Image img={api_key} alt="ClickStack API Key"/>

5. それを環境変数として設定します:

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

#### systemd journal が動作していることを確認する \{#verify-systemd\}

システムが systemd を使用しており、journal ログが存在することを確認します:

```bash
# systemd バージョンを確認
systemctl --version

# 直近の journal エントリを表示
journalctl -n 20

# journal のディスク使用量を確認
journalctl --disk-usage
```

journal ストレージがメモリのみの場合は、永続ストレージを有効化します:

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
`journald` レシーバは journal ファイルを読み取るために `journalctl` バイナリを必要とします。公式の `otel/opentelemetry-collector-contrib` イメージには、デフォルトでは `journalctl` が含まれていません。

コンテナ化されたデプロイメントでは、OTel collector をホスト上に直接インストールするか、systemd ユーティリティを含めたカスタムイメージをビルドすることができます。詳細は [トラブルシューティングセクション](#journalctl-not-found) を参照してください。
:::

次の例は、ClickStack と並行して OTel collector をデプロイする方法を示します:

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

#### HyperDX でログを確認する \{#verifying-logs\}

設定が完了したら、HyperDX にログインしてログが流れていることを確認します:

1. Search ビューに移動します
2. source を Logs に設定します
3. `service.name:systemd-logs` でフィルタします
4. `unit`、`priority`、`MESSAGE`、`_HOSTNAME` などのフィールドを持つ構造化ログエントリが表示されるはずです

<Image img={search_view} alt="ログ検索ビュー"/>

<Image img={log_view} alt="ログビュー"/>

</VerticalStepper>

## デモ用データセット \{#demo-dataset\}

本番システムを構成する前に systemd ログ連携をテストしたいユーザー向けに、現実的なパターンを含む事前生成済みの systemd ログのサンプルデータセットを提供します。

<VerticalStepper headerLevel="h4">

#### サンプルデータセットのダウンロード \{#download-sample\}

サンプルログファイルをダウンロードします:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/systemd/systemd-demo.log
```

#### デモ用 collector 設定の作成 \{#demo-config\}

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

#### デモデータで ClickStack を実行する \{#run-demo\}

デモログを使って ClickStack を起動します:

```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/systemd-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/systemd-demo.log:/tmp/systemd-demo/systemd-demo.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

:::note
このデモでは、コンテナ内で `journalctl` を必要としないようにするため、`journald` の代わりにテキストログを扱う `filelog` receiver を使用しています。
:::

#### HyperDX でログを確認する \{#verify-demo-logs\}

ClickStack が起動したら、次の手順を実行します:

1. [HyperDX](http://localhost:8080/) を開き、自分のアカウントでログインします
2. `Search` ビューに移動し、`Source` を `Logs` に設定します
3. 時間範囲を **2025-11-14 00:00:00 - 2025-11-17 00:00:00** に設定します

<Image img={search_view} alt="ログ検索ビュー"/>

<Image img={log_view} alt="ログビュー"/>

:::note[タイムゾーン表示]
HyperDX はタイムスタンプをブラウザのローカルタイムゾーンで表示します。デモデータは **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)** の期間をカバーしています。広い時間範囲を指定することで、どのロケーションからアクセスしてもデモログを確認できるようにしています。
:::

</VerticalStepper>

## ダッシュボードと可視化 \{#dashboards\}

ClickStack で systemd ログの監視をスムーズに開始できるように、systemd ジャーナルデータ向けの基本的な可視化を提供します。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/systemd-logs-dashboard.json')} download="systemd-logs-dashboard.json" eventName="docs.systemd_logs_monitoring.dashboard_download">ダウンロード</TrackedLink> ダッシュボード設定 \{#download\}

#### 事前構成済みダッシュボードをインポートする \{#import-dashboard\}

1. HyperDX を開き、Dashboards セクションに移動します
2. 右上の三点リーダー（三点アイコン）を開き、**Import Dashboard** をクリックします

<Image img={import_dashboard} alt="ダッシュボードインポートボタン"/>

3. `systemd-logs-dashboard.json` ファイルをアップロードし、**Finish Import** をクリックします

<Image img={finish_import} alt="インポートの完了"/>

#### ダッシュボードを表示する \{#created-dashboard\}

ダッシュボードには次の可視化が含まれます:
- 時間経過に伴うログボリューム
- ログ件数の多い上位 systemd ユニット
- SSH 認証イベント
- サービスの障害
- エラー率

<Image img={example_dashboard} alt="ダッシュボード例"/>

:::note
デモデータセットの場合、時間範囲を **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)** に設定してください（ローカルタイムゾーンに合わせて調整してください）。
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

結果が出ない場合は、コレクターのログを確認してください。

```bash
docker logs otel-collector | grep -i "error\|journald" | tail -20
```


### journalctl が見つからないエラー \{#journalctl-not-found\}

`exec: "journalctl": executable file not found in $PATH` と表示される場合:

`otel/opentelemetry-collector-contrib` イメージには `journalctl` が含まれていません。次のいずれかを実行できます:

1. **ホストに collector をインストールする**:

```bash
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.115.0/otelcol-contrib_0.115.0_linux_amd64.tar.gz
tar -xzf otelcol-contrib_0.115.0_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/
otelcol-contrib --config=otel-config.yaml
```

2. **テキストエクスポート方式を使用する**（デモと同様）。`filelog` receiver で journald のテキストエクスポートを読み取る


## 本番環境での運用 \{#going-to-production\}

このガイドでは、専用の OpenTelemetry Collector を使用して systemd ログを読み取り、ClickStack の OTLP エンドポイントに送信します。これは推奨される本番運用パターンです。

複数ホストからなる本番環境では、次の点を検討してください。

- コレクターを Kubernetes のデーモンセットとしてデプロイする
- 各ホストでコレクターを systemd サービスとして実行する
- デプロイメントの自動化に OpenTelemetry Operator を使用する

本番環境でのデプロイメントパターンについては、[OpenTelemetry による取り込み](/use-cases/observability/clickstack/ingesting-data/opentelemetry) を参照してください。