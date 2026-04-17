import PrivatePreviewBadge from "@theme/badges/PrivatePreviewBadge"

<PrivatePreviewBadge />

:::note
Private Preview のウェイトリストには[こちら](https://clickhouse.com/cloud/clickpipes/bigquery-connector)から登録できます。
:::

BigQuery ClickPipe は、BigQuery から ClickHouse Cloud へデータを取り込むための、フルマネージドで高い堅牢性を備えた手段を提供します。Private Preview では、探索やプロトタイピングのために BigQuery データセットを一括ロードするのに役立つ **initial load** レプリケーション方式をサポートしています。将来的には **CDC (変更データキャプチャ)&#x20;**&#x20;にも対応予定です。それまでは、initial load が完了した後に BigQuery のデータエクスポートを ClickHouse Cloud へ継続的に同期する手段として、[Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview) の利用を推奨します。

BigQuery ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](/integrations/clickpipes/programmatic-access/openapi) および [Terraform](/integrations/clickpipes/programmatic-access/terraform) を用いてプログラムから管理することもできます。