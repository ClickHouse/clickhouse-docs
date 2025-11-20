---
title: 'OpenAPI を使用した DB ClickPipes のスケーリング'
description: 'OpenAPI を使用した DB ClickPipes のスケーリングに関するドキュメント'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'スケーリング'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

:::caution ほとんどのユーザーにはこの API は不要です
DB ClickPipes のデフォルト設定は、ほとんどのワークロードをそのまま処理できるように設計されています。ご利用のワークロードでスケーリングが必要と思われる場合は、[サポートケース](https://clickhouse.com/support/program) を作成していただければ、ユースケースに最適な設定についてご案内します。
:::

スケーリング API が有用となるケース:
- 大規模な初回ロード（4 TB 超）
- 中規模データを可能な限り短時間で移行したい場合
- 同一サービスで 8 を超える CDC ClickPipes をサポートする場合

スケールアップを試みる前に、次の点を検討してください:
- ソース DB に十分な空きキャパシティがあることの確認
- ClickPipe 作成時に、まず [初回ロードの並列度とパーティション分割](/integrations/clickpipes/postgres/parallel_initial_load) を調整すること
- CDC の遅延要因となり得る、ソース側の[長時間実行トランザクション](/integrations/clickpipes/postgres/sync_control#transactions) を確認すること

**スケールを増やすと、それに比例して ClickPipes のコンピュートコストも増加します。** 初回ロードのためだけにスケールアップする場合は、スナップショット完了後にスケールを戻して予期しない課金を避けることが重要です。料金の詳細については、[Postgres CDC の料金](/cloud/reference/billing/clickpipes) を参照してください。



## この手順の前提条件 {#prerequisites}

開始する前に、以下が必要です：

1. 対象のClickHouse Cloudサービスに対する管理者権限を持つ[ClickHouse APIキー](/cloud/manage/openapi)
2. サービス内で事前にプロビジョニングされたDB ClickPipe（Postgres、MySQL、またはMongoDB）。CDCインフラストラクチャは最初のClickPipeの作成時に構築され、その時点からスケーリングエンドポイントが利用可能になります。


## DB ClickPipesのスケーリング手順 {#cdc-scaling-steps}

コマンドを実行する前に、以下の環境変数を設定してください:

```bash
ORG_ID=<ClickHouse組織ID>
SERVICE_ID=<ClickHouseサービスID>
KEY_ID=<ClickHouseキーID>
KEY_SECRET=<ClickHouseキーシークレット>
```

現在のスケーリング設定を取得します(オプション):

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

```


# 実行結果の例:

{
"result": {
"replicaCpuMillicores": 2000,
"replicaMemoryGb": 8
},
"requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
"status": 200
}

````

希望するスケーリングを設定します。サポートされる構成は、1～24個のCPUコアで、メモリ（GB）はコア数の4倍です:

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
````

設定が反映されるまで待ちます（通常3～5分）。スケーリング完了後、GETエンドポイントに新しい値が反映されます:

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

```


# 結果の例:

{
"result": {
"replicaCpuMillicores": 24000,
"replicaMemoryGb": 96
},
"requestId": "5a76d642-d29f-45af-a857-8c4d4b947bf0",
"status": 200
}

```

```
