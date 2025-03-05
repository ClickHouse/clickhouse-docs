---
sidebar_label: Splunk
slug: /integrations/audit-splunk
keywords: [clickhouse, Splunk, audit, cloud]
description: Store ClickHouse Cloud audit logs into Splunk.
---

import splunk_001 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_001.png';
import splunk_002 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_002.png';
import splunk_003 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_003.png';
import splunk_004 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_004.png';
import splunk_005 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_005.png';
import splunk_006 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_006.png';
import splunk_007 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_007.png';
import splunk_008 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_008.png';
import splunk_009 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_009.png';
import splunk_010 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_010.png';
import splunk_011 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_011.png';
import splunk_012 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_012.png';


# Storing ClickHouse Cloud Audit logs into Splunk

[Splunk](https://www.splunk.com/) is a data analytics and monitoring platform. 

This add-on allows users to store the [ClickHouse Cloud audit logs](/cloud/security/audit-logging) into Splunk. It uses [ClickHouse Cloud API](/cloud/manage/api/api-overview) to download the audit logs.  

This add-on contains only a modular input, no additional UI are provided with this add-on.

# Installation

## For Splunk Enterprise {#for-splunk-enterprise}

Download the ClickHouse Cloud Audit Add-on for Splunk from [Splunkbase](https://splunkbase.splunk.com/app/7709). 

<img src={splunk_001} className="image" alt="Download from Splunkbase" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

In Splunk Enterprise, navigate to Apps -> Manage. Then click on Install app from file.

<img src={splunk_002} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Select the archived file downloaded from Splunkbase and click on Upload. 

<img src={splunk_003} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

If everything goes fine, you should now see the ClickHouse Audit logs application installed. If not, consult the Splunkd logs for any errors. 

# Modular input configuration

To configure the modular input, you'll first need information from your ClickHouse Cloud deployment:

- The organization ID
- An admin [API Key](/cloud/manage/openapi)

## Getting information from ClickHouse Cloud {#getting-information-from-clickhouse-cloud}

Log in to the [ClickHouse Cloud console](https://console.clickhouse.cloud/). 

Navigate to your Organization -> Organization details. There you can copy the Organization ID. 

<img src={splunk_004} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Then, navigate to API Keys from the left-end menu.

<img src={splunk_005} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Create an API Key, give a meaningful name and select `Admin` privileges. Click on Generate API Key.

<img src={splunk_006} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Save the API Key and secret in a safe place.  

<img src={splunk_007} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

## Configure data input in Splunk {#configure-data-input-in-splunk}

Back in Splunk, navigate to Settings -> Data inputs. 

<img src={splunk_008} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Select the ClickHouse Cloud Audit Logs data input. 

<img src={splunk_009} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Click "New" to configure a new instance of the data input. 

<img src={splunk_010} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

Once you have entered all the information, click Next. 

<img src={splunk_011} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

The input is configured, you can start browsing the audit logs. 

# Usage

The modular input stores data in Splunk. To view the data, you can use the general search view in Splunk. 

<img src={splunk_012} className="image" alt="Manage apps" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>
