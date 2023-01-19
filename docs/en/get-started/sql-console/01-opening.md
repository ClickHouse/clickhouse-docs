---
slug: /en/get-started/sql-console/opening
pagination_next: en/get-started/sql-console/exploring-tables
---
# Opening the SQL Console

SQL console is the fastest and easiest way to explore and query your databases in ClickHouse Cloud.  You can use the SQL console to:
- Connect to your ClickHouse Cloud Services
- View, filter, and sort table data
- Execute queries and visualize result data in just a few clicks
- Share queries with team members and collaborate more effectively.

## Opening SQL Console from Control Plane

The SQL console can be opened directly from your Service overview screen.  Simply click the ‘Connect’ button and select ‘Open SQL console’.

  ![Open the SQL console from a service](@site/docs/en/cloud/images/sqlconsole/open-sql-console-from-service.png)

The SQL Console will open in a new tab and prompt you to input your service credentials:

  ![Enter credentials](@site/docs/en/cloud/images/sqlconsole/enter-credentials.png)

After inputting your credentials, click ‘Connect’ and the SQL Console will attempt to connect and authenticate.  If this is successful, you should now be able to see the SQL Console interface:

  ![Authentication success](@site/docs/en/cloud/images/sqlconsole/authentication-success.png)

## Loading the SQL Console Directly

The SQL Console can also be loaded directly by navigating to https://console.clickhouse.cloud.  After logging into your ClickHouse Cloud account, you will be presented with a list of services.  Select one and enter your service credentials on the service authentication screen:

  ![Select a service](@site/docs/en/cloud/images/sqlconsole/select-a-service.png)

:::note
If only one service exists in your organization, the SQL Console will immediately direct you to the service authentication screen
:::

## Using the service switcher

You can easily switch between your services directly from the SQL Console.  Simply open the service switcher in the top right corner of the Console and select a different service:

  ![Switch services](@site/docs/en/cloud/images/sqlconsole/switch-services.png)
