import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import SendManagedOTelData from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_send_managed_otel_data.md';
import SendManagedVectorData from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_send_managed_vector_data.md';

Send a test event through the ingestion path you configured.

<Tabs groupId="ingestion-sources">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

<SendManagedOTelData/>

</TabItem>

<TabItem value="vector" label="Vector">

<SendManagedVectorData/>

</TabItem>

</Tabs>
