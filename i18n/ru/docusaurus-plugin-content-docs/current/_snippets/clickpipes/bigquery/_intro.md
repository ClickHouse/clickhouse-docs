import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

BigQuery ClickPipe обеспечивает полностью управляемый и отказоустойчивый способ приёма данных из BigQuery в ClickHouse Cloud. В режиме Private Preview он поддерживает метод репликации **initial load**, который помогает выполнять массовую загрузку наборов данных BigQuery для исследования и прототипирования. Поддержка **CDC** будет добавлена в будущем — до тех пор мы рекомендуем использовать [Google Cloud Storage ClickPipe](../object-storage/google-cloud-storage/01_overview.md) для непрерывной синхронизации экспортируемых данных BigQuery в ClickHouse Cloud после завершения **initial load**.

BigQuery ClickPipes могут развертываться и управляться вручную с помощью ClickPipes UI, а также программно с использованием [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) и [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).
