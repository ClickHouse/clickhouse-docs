

# Connecting Retool to ClickHouse

<CommunityMaintainedBadge/>

## 1. Gather your connection details 
<ConnectionDetails />

## 2. Create a ClickHouse resource 

Login to your Retool account and navigate to the _Resources_ tab. Choose "Create New" -> "Resource":


<br/>

Select "JDBC" from the list of available connectors:


<br/>

In the setup wizard, make sure you select `com.clickhouse.jdbc.ClickHouseDriver` as the "Driver name":


<br/>

Fill in your ClickHouse credentials in the following format: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`.
If your instance requires SSL or you are using ClickHouse Cloud, add `&ssl=true` to the connection string, so it looks like `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`


<br/>

After that, test your connection:


<br/>

Now, you should be able to proceed to your app using your ClickHouse resource.
