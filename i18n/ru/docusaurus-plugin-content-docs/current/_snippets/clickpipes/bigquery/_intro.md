import PrivatePreviewBadge from "@theme/badges/PrivatePreviewBadge"

<PrivatePreviewBadge />

:::note
Вы можете записаться в список ожидания Private Preview [здесь](https://clickhouse.com/cloud/clickpipes/bigquery-connector).
:::

ClickPipe для BigQuery предоставляет полностью управляемый и отказоустойчивый способ приёма данных из BigQuery в ClickHouse Cloud. В рамках Private Preview он поддерживает метод репликации **initial load**, позволяющий массово загружать наборы данных BigQuery для исследования и прототипирования. Поддержка **CDC** будет добавлена в будущем — до тех пор мы рекомендуем использовать [Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview) для непрерывной синхронизации экспортируемых данных BigQuery с ClickHouse Cloud после завершения первоначальной загрузки.

ClickPipes для BigQuery могут развёртываться и управляться вручную через интерфейс ClickPipes, а также программно с использованием [OpenAPI](/integrations/clickpipes/programmatic-access/openapi) и [Terraform](/integrations/clickpipes/programmatic-access/terraform).