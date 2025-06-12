

# Storing ClickHouse Cloud Audit logs into Splunk

<ClickHouseSupportedBadge/>

[Splunk](https://www.splunk.com/) is a data analytics and monitoring platform.

This add-on allows users to store the [ClickHouse Cloud audit logs](/cloud/security/audit-logging) into Splunk. It uses [ClickHouse Cloud API](/cloud/manage/api/api-overview) to download the audit logs.

This add-on contains only a modular input, no additional UI are provided with this add-on.

# Installation

## For Splunk Enterprise 

Download the ClickHouse Cloud Audit Add-on for Splunk from [Splunkbase](https://splunkbase.splunk.com/app/7709).



In Splunk Enterprise, navigate to Apps -> Manage. Then click on Install app from file.



Select the archived file downloaded from Splunkbase and click on Upload.



If everything goes fine, you should now see the ClickHouse Audit logs application installed. If not, consult the Splunkd logs for any errors.

# Modular input configuration

To configure the modular input, you'll first need information from your ClickHouse Cloud deployment:

- The organization ID
- An admin [API Key](/cloud/manage/openapi)

## Getting information from ClickHouse Cloud 

Log in to the [ClickHouse Cloud console](https://console.clickhouse.cloud/).

Navigate to your Organization -> Organization details. There you can copy the Organization ID.



Then, navigate to API Keys from the left-end menu.



Create an API Key, give a meaningful name and select `Admin` privileges. Click on Generate API Key.



Save the API Key and secret in a safe place.



## Configure data input in Splunk 

Back in Splunk, navigate to Settings -> Data inputs.



Select the ClickHouse Cloud Audit Logs data input.



Click "New" to configure a new instance of the data input.



Once you have entered all the information, click Next.



The input is configured, you can start browsing the audit logs.

# Usage

The modular input stores data in Splunk. To view the data, you can use the general search view in Splunk.


