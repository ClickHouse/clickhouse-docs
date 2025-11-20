---
title: 'OpenAPI を使用した DB ClickPipes のスケーリング'
description: 'OpenAPI を使用した DB ClickPipes のスケーリングに関するドキュメント'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'スケーリング'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

:::caution ほとんどのユーザーはこの API を必要としません
DB ClickPipes のデフォルト構成は、ほとんどのワークロードに対してそのままで対応できるように設計されています。ご利用のワークロードにスケーリングが必要だと思われる場合は、[サポートケース](https://clickhouse.com/support/program) を作成していただければ、お客様のユースケースに最適な設定についてご案内します。
:::

スケーリング API は次のような場合に役立ちます:
- 初期ロードが大規模な場合（4 TB 超）
- 中程度のデータ量を可能な限り速く移行したい場合
- 同一サービス配下で 8 を超える CDC ClickPipes をサポートする場合

スケールアップを試みる前に、次の点を検討してください:
- ソース DB に十分な空きキャパシティがあることを確認する
- ClickPipe 作成時に、まず [initial load の並列度とパーティショニング](/integrations/clickpipes/postgres/parallel_initial_load) を調整する
- CDC の遅延を引き起こしている可能性のあるソース側の [長時間実行トランザクション](/integrations/clickpipes/postgres/sync_control#transactions) がないか確認する

**スケールを増やすと、ClickPipes のコンピュートコストも比例して増加します。** 初期ロードのためだけにスケールアップする場合は、スナップショット完了後にスケールダウンして、予期しない料金発生を避けることが重要です。料金の詳細については、[Postgres CDC の料金](/cloud/reference/billing/clickpipes) を参照してください。



## このプロセスの前提条件 {#prerequisites}

開始する前に、以下が必要です：

1. 対象のClickHouse Cloudサービスに対する管理者権限を持つ[ClickHouse APIキー](/cloud/manage/openapi)。
2. サービス内で過去にプロビジョニングされたDB ClickPipe（Postgres、MySQL、またはMongoDB）。CDCインフラストラクチャは最初のClickPipeの作成時に構築され、その時点以降スケーリングエンドポイントが利用可能になります。


## DB ClickPipesのスケーリング手順 {#cdc-scaling-steps}

コマンドを実行する前に、以下の環境変数を設定してください：

```bash
ORG_ID=<ClickHouse組織ID>
SERVICE_ID=<ClickHouseサービスID>
KEY_ID=<ClickHouseキーID>
KEY_SECRET=<ClickHouseキーシークレット>
```

現在のスケーリング設定を取得する（オプション）：

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

希望するスケーリング設定を行います。サポートされる構成は、CPUコア数1～24個で、メモリ（GB）はコア数の4倍です:

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

設定が反映されるまで待ちます（通常3～5分）。スケーリング完了後、GETエンドポイントで新しい値を確認できます:

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
