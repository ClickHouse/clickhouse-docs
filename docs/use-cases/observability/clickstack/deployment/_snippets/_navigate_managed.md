import Image from '@theme/IdealImage';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Select 'Launch ClickStack' to access the ClickStack UI (HyperDX). You will automatically authenticated and redirected. 

<Tabs groupId="click-stackui-data-sources">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

Data sources will be pre-created for any OpenTelemetry data.

<Image img={clickstack_managed_ui} size="lg" alt='ClickStack UI'/>

</TabItem>
<TabItem value="vector" label="Vector" default>

If you are using Vector, you will need to create your own data sources. You will be prompted to create one on your first login. Below we show an example configuration for a logs data source.

<Image img={create_vector_datasource} alt="Create datasource - vector" size="lg"/>

This configuration assumes an Nginx-style schema with a `time_local` column used as the timestamp. This should be, where possible, the timestamp column declared in the primary key. **This column is mandatory**.

We also recommend updating the `Default SELECT` to explicitly define which columns are returned in the logs view. If additional fields are available, such as service name, log level, or a body column, these can also be configured. The timestamp display column can also be overridden if it differs from the column used in the table's primary key and configured above. 

In the example above, a `Body` column does not exist in the data. Instead, it is defined using a SQL expression that reconstructs an Nginx log line from the available fields.

For other possible options, see the [configuration reference](/use-cases/observability/clickstack/config).

Once created, you should be directed to the search view where you can immediately begin exploring your data.

<Image img={clickstack_managed_ui} size="lg" alt='ClickStack UI'/>

</TabItem>
</Tabs>

<br/>

And that’s it — you’re all set. 🎉

Go ahead and explore ClickStack: start searching logs and traces, see how logs, traces, and metrics correlate in real time, build dashboards, explore service maps, uncover event deltas and patterns, and set up alerts to stay ahead of issues.
