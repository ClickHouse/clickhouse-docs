---
slug: /cloud/guides/sql-console/configure-org-service-role-assignments
sidebar_label: 'Configuring organization and service role assignments'
title: 'Configuring organization and service role assignments within the console'
description: 'Guide showing how to configure org and service role assignments within the console'
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/org_level_access/1_org_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/org_level_access/2_org_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/org_level_access/3_org_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/org_level_access/4_org_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/org_level_access/5_org_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/org_level_access/6_org_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/org_level_access/7_org_settings.png'

# Configuring organization and service role assignments within the console

> This guide shows you how to configure role assignments at the organization and service level.

<VerticalStepper>

## Access organization settings {#access-service-settings}

From the services page, select the name of your organization:

<Image img={step_1} size="md"/>

Select the `Users and roles` menu item from the popup menu.

<Image img={step_2} size="md"/>

## Adjust access per user {#access-per-user}

Select the menu item at the end of the row for the user that you which to modify
access for:

<Image img={step_3} size="lg"/>

Select `edit`:

<Image img={step_4} size="lg"/>

A tab will display on the right hand side of the page:

<Image img={step_5} size="lg"/>

Select the drop-down menu items to adjust console-wide access permissions and which features a user can access from within the ClickHouse console.
This manages high-level access and administrative settings for an organization:

| Role        | Description                                                                      |
|-------------|----------------------------------------------------------------------------------|
| `Admin`     | Perform all administrative activities for an organization, control all settings. |
| `Developer` | View everything except Services, create API keys with equal or lower access.     |
| `Member`    | Sign in only with ability to manage personal profile settings.                   |
| `Billing`   | View usage and invoices, and manage payment methods                              |

Select the drop-down menu items to adjust the access scope of the service role of the selected user.
This defines security and operational settings for individual services:

| Access scope        |
|---------------------|
| `All services`      |
| `Specific services` |
| `No services`       |

When selecting `Specific services`, you can control the role of the user per
service:

<Image img={step_6} size="md"/>

You can choose from the following roles:

| Role        | Description                                                        |
|-------------|--------------------------------------------------------------------|
| `Admin`     | Full control over configuration and security. Can delete service.  |
| `Read-only` | Can see service data and security settings. Can't modify anything. |
| `No access` | Doesn't know the service exists.                                   |

Save your changes with the `Save changes` button at the bottom of the tab:

<Image img={step_7} size="md"/>

</VerticalStepper>