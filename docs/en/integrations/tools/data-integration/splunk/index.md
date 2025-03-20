---
sidebar_label: Splunk
slug: /en/integrations/audit-splunk
keywords: [clickhouse, Splunk, audit, cloud]
description: Store ClickHouse Cloud audit logs into Splunk.
---
# Storing ClickHouse Cloud Audit logs into Splunk

[Splunk](https://www.splunk.com/) is a data analytics and monitoring platform. 

This add-on allows users to store the [ClickHouse Cloud audit logs](https://clickhouse.com/docs/en/cloud/security/audit-logging) into Splunk. It uses [ClickHouse Cloud API](https://clickhouse.com/docs/en/cloud/manage/api/api-overview) to download the audit logs.  

This add-on contains only a modular input, no additional UI are provided with this add-on.

# Installation

## For Splunk Enterprise 

Download the ClickHouse Cloud Audit Add-on for Splunk from [Splunkbase](https://splunkbase.splunk.com/app/7709). 

<img src={require('./images/splunk_001.png').default} className="image" alt="Download from Splunkbase" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

In Splunk Enterprise, navigate to Apps -> Manage. Then click on Install app from file.

<img src={require('./images/splunk_002.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Select the archived file downloaded from Splunkbase and click on Upload. 

<img src={require('./images/splunk_003.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

If everything goes fine, you should now see the ClickHouse Audit logs application installed. If not, consult the Splunkd logs for any errors. 

# Modular input configuration

To configure the modular input, you'll first need information from your ClickHouse Cloud deployment:

- The organization ID
- An admin [API Key](https://clickhouse.com/docs/en/cloud/manage/openapi)

## Getting information from ClickHouse Cloud

Log in to the [ClickHouse Cloud console](https://console.clickhouse.cloud/). 

Navigate to your Organization -> Organization details. There you can copy the Organization ID. 

<img src={require('./images/splunk_004.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Then, navigate to API Keys from the left-end menu.

<img src={require('./images/splunk_005.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Create an API Key, give a meaningful name and select `Admin` privileges. Click on Generate API Key.

<img src={require('./images/splunk_006.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Save the API Key and secret in a safe place.  

<img src={require('./images/splunk_007.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

## Configure data input in Splunk

Back in Splunk, navigate to Settings -> Data inputs. 

<img src={require('./images/splunk_008.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Select the ClickHouse Cloud Audit Logs data input. 

<img src={require('./images/splunk_009.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Click "New" to configure a new instance of the data input. 

<img src={require('./images/splunk_010.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Once you have entered all the information, click Next. 

<img src={require('./images/splunk_011.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

The input is configured, you can start browsing the audit logs. 

# Usage

The modular input stores data in Splunk. To view the data, you can use the general search view in Splunk. 

<img src={require('./images/splunk_012.png').default} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>
