import Image from '@theme/IdealImage';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

Open your service in the [ClickHouse Cloud console](https://console.clickhouse.cloud) and select **ClickStack** from the left menu and then **Start Ingestion**.

<Image img={clickstack_cloud} size="lg" alt="Launch ClickStack" border/>

The next step can be skipped, as you've already configured your collector. Click **Launch ClickStack** to continue.

ClickStack will open in a new tab and you should be automatically directed to the **Getting Started** page. If not, select **Getting Started** from the left-hand menu, then click **Start Ingestion** followed by **Next**.

<Image img={clickstack_start_ingestion} size="lg" alt="ClickStack Start Ingestion" border/>

ClickStack should automatically detect your tables and telemetry data, allowing you to proceed. Select **Start Exploring** to begin exploring your trace data.

<Image img={clickstack_start_exploring} size="lg" alt="ClickStack Start Exploring" border/>

Switch the source to `Logs` and set the time range to **Last 15 minutes**. The synthetic logs from `otelgen` should appear within a few seconds.

<Image img={clickstack_search} size="lg" alt="ClickStack Search view with logs appearing"/>

If nothing shows up:

- Confirm the auth header value passed to `otelgen` matches the one your collector expects.
- Tail your collector's logs and look for export errors.
- Verify the ClickHouse endpoint configured on the collector includes both the protocol and port (`https://...:8443`).
