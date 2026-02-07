import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

BigQuery ClickPipe は、BigQuery から ClickHouse Cloud へデータを取り込むための、フルマネージドで高い堅牢性を備えた手段を提供します。Private Preview では、探索やプロトタイピングのために BigQuery データセットを一括ロードするのに役立つ **initial load** レプリケーション方式をサポートしています。将来的には **CDC（変更データキャプチャ）** にも対応予定です。それまでは、initial load が完了した後に BigQuery のデータエクスポートを ClickHouse Cloud へ継続的に同期する手段として、[Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview) の利用を推奨します。

BigQuery ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) および [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) を用いてプログラムから管理することもできます。
