import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge/>

The BigQuery ClickPipe provides a fully-managed and resilient way to ingest data from BigQuery into ClickHouse Cloud. In Private Preview, it supports the **initial load** replication method to help you bulk load BigQuery datasets for exploration and protyping. **CDC** will be supported in the future — in the meantime, we recommend using the [Google Cloud Storage ClickPipe](../object-storage/google-cloud-storage/01_overview.md) to continuously sync BigQuery data exports into ClickHouse Cloud once the initial load is completed.

BigQuery ClickPipes can be deployed and managed manually using the ClickPipes UI, as well as programmatically using [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) and [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).