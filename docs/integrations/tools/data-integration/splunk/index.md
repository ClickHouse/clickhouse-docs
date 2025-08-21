---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'Store ClickHouse Cloud audit logs into Splunk.'
title: 'Storing ClickHouse Cloud Audit logs into Splunk'
doc_type: overview
---

import Image from '@theme/IdealImage';
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Storing ClickHouse Cloud Audit logs into Splunk

<ClickHouseSupportedBadge/>

[Splunk](https://www.splunk.com/) is a data analytics and monitoring platform.

This add-on allows users to store the [ClickHouse Cloud audit logs](/cloud/security/audit-logging) into Splunk. It uses [ClickHouse Cloud API](/cloud/manage/api/api-overview) to download the audit logs.

This add-on contains only a modular input, no additional UI are provided with this add-on.

# Installation

## For Splunk Enterprise {#for-splunk-enterprise}

Download the ClickHouse Cloud Audit Add-on for Splunk from [Splunkbase](https://splunkbase.splunk.com/app/7709).

<Image img={splunk_001} size="lg" alt="Splunkbase website showing the ClickHouse Cloud Audit Add-on for Splunk download page" border />

In Splunk Enterprise, navigate to Apps -> Manage. Then click on Install app from file.

<Image img={splunk_002} size="lg" alt="Splunk Enterprise interface showing the Apps management page with Install app from file option" border />

Select the archived file downloaded from Splunkbase and click on Upload.

<Image img={splunk_003} size="lg" alt="Splunk app installation dialog for uploading the ClickHouse add-on" border />

If everything goes fine, you should now see the ClickHouse Audit logs application installed. If not, consult the Splunkd logs for any errors.

# Modular input configuration

To configure the modular input, you'll first need information from your ClickHouse Cloud deployment:

- The organization ID
- An admin [API Key](/cloud/manage/openapi)

## Getting information from ClickHouse Cloud {#getting-information-from-clickhouse-cloud}

Log in to the [ClickHouse Cloud console](https://console.clickhouse.cloud/).

Navigate to your Organization -> Organization details. There you can copy the Organization ID.

<Image img={splunk_004} size="lg" alt="ClickHouse Cloud console showing the Organization details page with Organization ID" border />

Then, navigate to API Keys from the left-end menu.

<Image img={splunk_005} size="lg" alt="ClickHouse Cloud console showing the API Keys section in the left navigation menu" border />

Create an API Key, give a meaningful name and select `Admin` privileges. Click on Generate API Key.

<Image img={splunk_006} size="lg" alt="ClickHouse Cloud console showing the API Key creation interface with Admin privileges selected" border />

Save the API Key and secret in a safe place.

<Image img={splunk_007} size="lg" alt="ClickHouse Cloud console showing the generated API Key and secret to be saved" border />

## Configure data input in Splunk {#configure-data-input-in-splunk}

Back in Splunk, navigate to Settings -> Data inputs.

<Image img={splunk_008} size="lg" alt="Splunk interface showing the Settings menu with Data inputs option" border />

Select the ClickHouse Cloud Audit Logs data input.

<Image img={splunk_009} size="lg" alt="Splunk Data inputs page showing the ClickHouse Cloud Audit Logs option" border />

Click "New" to configure a new instance of the data input.

<Image img={splunk_010} size="lg" alt="Splunk interface for configuring a new ClickHouse Cloud Audit Logs data input" border />

Once you have entered all the information, click Next.

<Image img={splunk_011} size="lg" alt="Splunk configuration page with completed ClickHouse data input settings" border />

The input is configured, you can start browsing the audit logs.

# Usage

The modular input stores data in Splunk. To view the data, you can use the general search view in Splunk.

<Image img={splunk_012} size="lg" alt="Splunk search interface showing ClickHouse audit logs data" border />
