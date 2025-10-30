import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

To connect to ClickHouse with native TCP you need this information:

| Parameter(s)              | Description                                                                                                   |
|---------------------------|---------------------------------------------------------------------------------------------------------------|
| `HOST` and `PORT`         | Typically, the port is 9440 when using TLS, or 9000 when not using TLS.                                       |
| `DATABASE NAME`           | Out of the box there is a database named `default`, use the name of the database that you want to connect to. |
| `USERNAME` and `PASSWORD` | Out of the box the username is `default`. Use the username appropriate for your use case.                     |

The details for your ClickHouse Cloud service are available in the ClickHouse Cloud console.
Select the service that you will connect to and click **Connect**:

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud service connect button" border/>

Choose **Native**, and the details are available in an example `clickhouse-client` command.

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP connection details" border/>

If you are using self-managed ClickHouse, the connection details are set by your ClickHouse administrator.
