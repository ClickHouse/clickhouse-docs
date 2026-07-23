import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import clickstack_ingestion_test from '@site/static/images/clickstack/getting-started/clickstack_ingestion_test.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';

Open the logs view in ClickStack.

<Tabs groupId="ingestion-sources">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

Search for `ClickStack ingestion test`.

The result should include the test event with the `clickstack-docs-test` service name.

<Image img={clickstack_ingestion_test} size="lg" alt="ClickStack logs view showing the ClickStack ingestion test event" border/>

</TabItem>

<TabItem value="vector" label="Vector">

Select the data source for your table and confirm that the logs view contains the event you sent.

<Image img={clickstack_managed_ui} size="lg" alt="Logs in the ClickStack UI"/>

</TabItem>

</Tabs>
