---
title: 'OpenAPI を使用した DB ClickPipes のスケーリング'
description: 'OpenAPI を使用した DB ClickPipes のスケーリングに関するドキュメント'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'スケーリング'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データインジェスト', 'リアルタイム同期']
---

:::caution ほとんどのユーザーはこの API を必要としません
DB ClickPipes のデフォルト構成は、ほとんどのワークロードを標準設定のままで処理できるように設計されています。ご利用のワークロードでスケーリングが必要だと思われる場合は、[サポートケース](https://clickhouse.com/support/program)を作成してください。ユースケースに最適な設定についてご案内します。
:::

スケーリング用 API は次のような場合に役立ちます:
- 初期ロードが非常に大きい場合（4 TB 超）
- 中程度のデータ量をできるだけ早く移行したい場合
- 同一サービス内で 8 個を超える CDC ClickPipes をサポートする場合

スケールアップを試みる前に、次の点を検討してください:
- ソース DB に十分な空きキャパシティがあることを確認する
- ClickPipe 作成時に、まず[初期ロードの並列度とパーティショニング](/integrations/clickpipes/postgres/parallel_initial_load)を調整する
- CDC の遅延を引き起こしている可能性のあるソース側の[長時間実行トランザクション](/integrations/clickpipes/postgres/sync_control#transactions)を確認する

**スケールを上げると、それに比例して ClickPipes のコンピューティングコストも増加します。** 初期ロードのためだけにスケールアップする場合は、スナップショット完了後にスケールダウンして予期しない料金発生を防ぐことが重要です。料金の詳細については、[Postgres CDC の料金](/cloud/reference/billing/clickpipes)を参照してください。



## このプロセスの前提条件 {#prerequisites}

開始する前に、次のものを用意しておきます。

1. 対象となる ClickHouse Cloud サービスで Admin 権限を持つ [ClickHouse API キー](/cloud/manage/openapi)。
2. サービス内に、いずれかのタイミングでプロビジョニングされた DB ClickPipe（Postgres、MySQL、または MongoDB）。CDC インフラストラクチャは最初の ClickPipe とともに作成され、その時点からスケーリング用エンドポイントが利用可能になります。



## DB ClickPipes をスケールする手順

コマンドを実行する前に、次の環境変数を設定します。

```bash
ORG_ID=<ClickHouse組織ID>
SERVICE_ID=<ClickHouseサービスID>
KEY_ID=<ClickHouseキーID>
KEY_SECRET=<ClickHouseキーシークレット>
```

現在のスケーリング設定を取得（任意）:

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq
```


# 結果の例:

{
"result": {
"replicaCpuMillicores": 2000,
"replicaMemoryGb": 8
},
"requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
"status": 200
}

````

希望するスケーリングを設定します。サポートされる構成は、1～24個のCPUコアで、メモリ（GB）はコア数の4倍に設定されます:

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

構成が反映されるまで待機します（通常3～5分）。スケーリングが完了すると、GETエンドポイントに新しい値が反映されます:

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

```


# 実行結果の例:

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
