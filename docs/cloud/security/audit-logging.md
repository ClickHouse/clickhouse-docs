---
sidebar_label: 'Audit Logging'
slug: /cloud/security/audit-logging
title: 'Audit Logging'
description: 'This page describes Audit Logging in ClickHouse Cloud. It explains how to access and interpret the audit logs, which record changes made to a ClickHouse Cloud organization.'
keywords: [clickhouse cloud audit logging, audit logs, activity tracking, security monitoring, organization changes]
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';

In ClickHouse Cloud, navigate to your organization details. 

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud activity tab" border />

<br/>

Select the **Audit** tab on the left menu to see what changes have been made to your ClickHouse Cloud organization - including who made the change and when it occurred.

The **Activity** page displays a table containing a list of events logged about your organization. By default, this list is sorted in a reverse-chronological order (most-recent event at the top). Change the order of the table by clicking on the columns headers. Each item of the table contains the following fields:

- **Activity:** A text snippet describing the event
- **User:** The user that initiated the event
- **IP Address:** When applicable, this flied lists the IP Address of the user that initiated the event
- **Time:** The timestamp of the event

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud Activity Table" border />

<br/>

You can use the search bar provided to isolate events based on some criteria like for example service name or IP address. You can also export this information in a CSV format for distribution or analysis in an external tool.

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud Activity CSV export" border />
</div>

## List of events logged {#list-of-events-logged}

The different types of events captured for the organization are grouped in 3 categories: **Service**, **Organization** and **User**. The list of events logged contains:

### Service {#service}

- Service created
- Service deleted
- Service stopped
- Service started
- Service name changed
- Service IP access list changed
- Service password reset

### Organization {#organization}

- Organization created
- Organization deleted
- Organization name changed

### User {#user}

- User role changed
- User removed from organization
- User invited to organization
- User joined organization
- User invitation deleted
- User left organization

## API for audit events {#api-for-audit-events}

Users can use the ClickHouse Cloud API `activity` endpoint to obtain an export 
of audit events. Further details can be found in the [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger).
