---
'title': 'OpenAPIを使用したDB ClickPipesのスケーリング'
'description': 'OpenAPIを使用したDB ClickPipesのスケーリングに関するドキュメント'
'slug': '/integrations/clickpipes/postgres/scaling'
'sidebar_label': 'スケーリング'
'doc_type': 'guide'
---

:::caution このAPIはほとんどのユーザーには必要ありません
DB ClickPipesのデフォルト設定は、ほとんどのワークロードに対処できるように設計されています。ワークロードのスケーリングが必要だと思われる場合は、[サポートケース](https://clickhouse.com/support/program)を開いていただければ、ユースケースに最適な設定を案内します。
:::

スケーリングAPIが役立つ場合：
- 大規模な初期ロード（4 TB以上）
- 適度な量のデータをできるだけ早く移行すること
- 同じサービスの下で8つ以上のCDC ClickPipesをサポートすること

スケールアップを試みる前に考慮すべきこと：
- ソースDBに十分な可用容量があることを確認する
- ClickPipeを作成する際に[初期ロードの並列処理とパーティション設定](/integrations/clickpipes/postgres/parallel_initial_load)をまず調整する
- ソース上でCDCの遅延を引き起こしている可能性のある[長時間実行中のトランザクション](/integrations/clickpipes/postgres/sync_control#transactions)を確認する

**スケールを増加させると、ClickPipesの計算コストも比例して増加します。** 初期ロードのためだけにスケールアップしている場合は、スナップショットが完了した後にスケールダウンすることが重要です。想定外の料金を避けるために。料金の詳細については、[Postgres CDC料金](/cloud/reference/billing/clickpipes)をご覧ください。

## このプロセスの前提条件 {#prerequisites}

開始する前に必要なもの：
1. ターゲットClickHouse CloudサービスでAdmin権限のある[ClickHouse APIキー](/cloud/manage/openapi)
2. かつてサービスにプロビジョニングされたDB ClickPipe（Postgres、MySQLまたはMongoDB）。CDCインフラが最初のClickPipeと共に作成され、その時点以降からスケーリングエンドポイントが利用可能になります。

## DB ClickPipesをスケールする手順 {#cdc-scaling-steps}

コマンドを実行する前に、次の環境変数を設定してください：

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

現在のスケーリング設定を取得する（オプション）：

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

希望するスケーリングを設定します。サポートされている構成は、1〜24 CPUコアで、メモリ（GB）はコア数の4倍に設定されています：

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

設定が伝播するのを待ちます（通常3〜5分）。スケーリングが完了すると、GETエンドポイントは新しい値を反映します：

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
