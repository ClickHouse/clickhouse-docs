import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

BigQuery ClickPipe 为从 BigQuery 向 ClickHouse Cloud 摄取数据提供了一种全托管且高可靠性的方式。在 Private Preview 阶段，它支持 **initial load（初始加载）** 复制方式，帮助你批量加载 BigQuery 数据集用于探索和原型验证。未来将支持 **CDC** —— 在此之前，我们建议在完成初始加载（initial load）之后，使用 [Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview) 将 BigQuery 导出的数据持续同步到 ClickHouse Cloud。

可以通过 ClickPipes UI 手动部署和管理 BigQuery ClickPipes，也可以通过 [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 和 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) 以编程方式进行管理。
