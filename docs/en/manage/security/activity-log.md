---
slug: /en/manage/security/organization-activity
sidebar_label: Organization Activity
title: Organization Activity
---

In ClickHouse Cloud, you can use the **Activity** tab on left menu to see what changes have been made, by whom, and when in your ClickHouse Cloud organization. 

<img src={require('./images/activity_log1.png').default} class="image" alt="ClickHouse Cloud activity tab" style={{width: '30%'}}/>

<br/> 

This will give you access to a table containing a list of events logged about your organization. By default, this list is sorted in a reverse-chronological order (most-recent event at the top). You can change the order of the table by clicking on the columns headers. Each item of the table contains the following fields:


- **Activity:** A text snippet describing the event.
- **User:** The user that initiated the event.
- **IP Address:** When applicable, this flied lists the IP Address of the user that initiated the event.
- **Time:** The timestamp of the event.

<img src={require('./images/activity_log2.png').default} class="image" alt="ClickHouse Cloud Activity Table" style={{width: '100%'}}/>

<br/> 

You can use the search bar provided to isolate events based on some criteria like for example service name or IP address. You can also export this information in a CSV format for distribution or analysis in an external tool.


<img src={require('./images/activity_log3.png').default} class="image" alt="ClickHouse Cloud Activity CSV export" style={{width: '70%'}}/>

<br/> 


## List of events logged

The different types of events captured for the organization are grouped in 3 categories: Service, Organization and User. The list of events logged contains:

### Service

- Service created.
- Service deleted.
- Service stopped.
- Service started.
- Service name changed.
- Service IP access list changed.
- Service password reset.

### Organization

- Organization created.
- Organization deleted.
- Organization name changed.

### User

- User role changed.
- User removed from organization.
- User invited to organization.
- User joined organization.
- User invitation deleted.
- User Left organization.


