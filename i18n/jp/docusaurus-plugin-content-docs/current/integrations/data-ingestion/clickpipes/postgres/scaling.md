---
title: 'OpenAPI を使用した DB ClickPipes のスケーリング'
description: 'OpenAPI を使用した DB ClickPipes のスケーリングに関するドキュメント'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'スケーリング'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

:::caution ほとんどのユーザーはこの API を必要としません
DB ClickPipes のデフォルト構成は、ほとんどのワークロードをそのまま処理できるように設計されています。ご利用中のワークロードにスケーリングが必要だと考えられる場合は、[サポートケース](https://clickhouse.com/support/program) を開いてください。お客様のユースケースに最適な設定についてご案内します。
:::

スケーリング API が有効なユースケース:

- 大規模な初回ロード（4 TB 超）
- 中程度のデータ量を可能な限り高速に移行したい場合
- 同一サービス上で 8 個を超える CDC ClickPipes をサポートする場合

スケールアップを試みる前に、次の点を検討してください:

- ソース DB に十分な余剰キャパシティがあることを確認する
- ClickPipe 作成時に、まず [初回ロードの並列度とパーティション分割](/integrations/clickpipes/postgres/parallel_initial_load) を調整する
- CDC の遅延を引き起こしている可能性のある、ソース側の[長時間実行トランザクション](/integrations/clickpipes/postgres/sync_control#transactions) を確認する

**スケールを増やすと、それに比例して ClickPipes のコンピュートコストも増加します。** 初回ロードのみのためにスケールアップする場合は、スナップショット完了後にスケールダウンして予期しない課金を避けることが重要です。料金の詳細については、[Postgres CDC の料金](/cloud/reference/billing/clickpipes) を参照してください。

## この手順の前提条件 \{#prerequisites\}

開始する前に、次のものが必要です。

1. 対象の ClickHouse Cloud サービスに対して Admin 権限を持つ [ClickHouse API key](/cloud/manage/openapi)。
2. サービス内で過去のいずれかの時点にプロビジョニングされた DB ClickPipe（Postgres、MySQL、または MongoDB）。CDC インフラストラクチャは最初の ClickPipe の作成時に合わせて構築され、それ以降はスケーリング用エンドポイントが利用可能になります。

## DB ClickPipes のスケーリング手順 \{#cdc-scaling-steps\}

コマンドを実行する前に、以下の環境変数を設定します。

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

現在のスケーリング設定を取得します（省略可）:

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

希望するスケーリングを設定します。サポートされる構成は CPU コア数 1～24 で、メモリ (GB) はコア数の 4 倍に設定します。

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

構成の変更が反映されるまで待ちます（通常 3～5 分）。スケーリングが完了すると、GET エンドポイントに新しい値が反映されます。

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
