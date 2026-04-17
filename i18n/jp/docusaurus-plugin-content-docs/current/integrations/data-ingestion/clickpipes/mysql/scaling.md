---
title: "OpenAPI による MySQL ClickPipes のスケーリング"
description: "OpenAPI を使用して MySQL ClickPipes をスケーリングする方法"
slug: /integrations/clickpipes/mysql/scaling
sidebar_label: "スケーリング"
doc_type: "guide"
keywords:
  ["clickpipes", "mysql", "cdc", "data ingestion", "real-time sync", "scaling"]
integration:
  - support_level: "core"
  - category: "clickpipes"
---

:::caution ほとんどのユーザーにはこの API は必要ありません
DB ClickPipes のデフォルト設定は、ほとんどのワークロードにそのまま対応できるよう設計されています。ワークロードに対してスケーリングが必要だと思われる場合は、[サポートケース](https://clickhouse.com/support/program)を起票してください。ユースケースに最適な設定をご案内します。
:::

スケーリング API は、次のような場合に役立つことがあります。

* 大規模な初期ロード (4 TB 超)
* 中程度のデータ量をできるだけ短時間で移行したい場合
* 同一サービスで 8 個を超える CDC ClickPipes をサポートする場合

スケールアップを試みる前に、次の点を検討してください。

* ソース DB に十分な空き処理能力があることを確認する
* ClickPipe の作成時に、まず[初期ロードの並列度とパーティション化](/integrations/clickpipes/mysql/parallel_initial_load)を調整する
* CDC の遅延を引き起こしている可能性がある、ソース側の[長時間実行されているトランザクション](/integrations/clickpipes/mysql/sync_control#transactions)を確認する

**スケールを上げると、ClickPipes のコンピュートコストも比例して増加します。** 初期ロードのためだけにスケールアップする場合は、予期しない課金を避けるため、スナップショットの完了後にスケールダウンすることが重要です。料金の詳細については、[ClickPipes の料金](/cloud/reference/billing/clickpipes)を参照してください。

## このプロセスの前提条件 \{#prerequisites\}

開始する前に、次のものが必要です。

1. 対象の ClickHouse Cloud サービスに対する Admin 権限を持つ [ClickHouse APIキー](/cloud/manage/openapi)。
2. これまでのいずれかの時点で、そのサービスに DB ClickPipe (Postgres、MySQL、または MongoDB) がプロビジョニングされていること。CDC インフラストラクチャは最初の ClickPipe とともに作成され、スケーリング用エンドポイントはその時点以降利用可能になります。

## DB ClickPipes をスケールする手順 \{#cdc-scaling-steps\}

命令語を実行する前に、以下の環境変数を設定してください。

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

現在のスケーリング設定を取得します (省略可) :

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 2000,
    "replicaMemoryGb": 8
  },
  "requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
  "status": 200
}
```

必要なスケールを設定します。サポートされる構成は、CPU コア数が1～24、メモリ (GB) がコア数の4倍です：

```bash
cat <<EOF | tee cdc_scaling.json
{
  "replicaCpuMillicores": 24000,
  "replicaMemoryGb": 96
}
EOF

curl --silent --user $KEY_ID:$KEY_SECRET \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
-d @cdc_scaling.json | jq
```

設定が反映されるまで待ちます (通常は3〜5分) 。スケーリングが完了すると、GET エンドポイントに新しい値が反映されます。

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 24000,
    "replicaMemoryGb": 96
  },
  "requestId": "5a76d642-d29f-45af-a857-8c4d4b947bf0",
  "status": 200
}
```