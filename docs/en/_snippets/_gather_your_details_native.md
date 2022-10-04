To connect to ClickHouse with native TCP you need this information:

- The HOST and PORT: typically, the port is 9440 when using TLS, or 9000 when not using TLS.

- The DATABASE NAME: out of the box there is a database named `default`, use the name of the database that you want to connect to.

- The USERNAME and PASSWORD: out of the box the username is `default`. Use the username appropriate for your use case.

The details for your ClickHouse Cloud service are available in the ClickHouse Cloud console.  Select the service that you will connect to and click **Connect**:

![ClickHouse Cloud service connect button](@site/docs/en/_snippets/images/cloud-connect-button.png)

Choose **Native**, and the details are available in an example `clickhouse-client` command. 

![ClickHouse Cloud Native TCP connection details](@site/docs/en/_snippets/images/connection-details-native.png)

If you are using self-managed ClickHouse, the connection details are set by your ClickHouse administrator.
