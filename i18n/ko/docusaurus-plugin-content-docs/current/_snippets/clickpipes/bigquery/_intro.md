import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

:::note
Private Preview 대기자 명단에 [여기](https://clickhouse.com/cloud/clickpipes/bigquery-connector)에서 등록할 수 있습니다.
:::

BigQuery ClickPipe는 BigQuery에서 ClickHouse Cloud로 데이터를 수집하기 위한 완전 관리형이고 안정적인 방식을 제공합니다. Private Preview 단계에서는 **초기 적재(initial load)** 복제 방식을 지원하여, 탐색 및 프로토타이핑을 위해 BigQuery 데이터세트를 대량으로 적재하는 데 도움이 됩니다. **CDC**는 향후 지원될 예정이며, 그때까지는 초기 적재가 완료된 후에도 BigQuery 데이터 내보내기를 ClickHouse Cloud와 지속적으로 동기화하기 위해 [Google Cloud Storage ClickPipe](/integrations/clickpipes/object-storage/gcs/overview)를 사용하는 것을 권장합니다.

BigQuery ClickPipes는 ClickPipes UI를 사용하여 수동으로 배포 및 관리할 수 있으며, [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post)와 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe)을 사용해 프로그래밍 방식으로도 관리할 수 있습니다.
