import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

BigQuery ClickPipe は、BigQuery から ClickHouse Cloud へデータを完全マネージドかつ堅牢な方法で取り込む手段を提供します。本 Private Preview では、BigQuery のデータセットを一括で読み込んで探索やプロトタイピングを行うのに役立つ **initial load** レプリケーション方式をサポートしています。**CDC（変更データキャプチャ）** は今後サポート予定です。それまでは、初回の一括ロード完了後に BigQuery データエクスポートを継続的に ClickHouse Cloud へ同期するため、[Google Cloud Storage ClickPipe](../object-storage/google-cloud-storage/01_overview.md) の利用を推奨します。

BigQuery ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) や [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) を用いてプログラムから操作することもできます。
