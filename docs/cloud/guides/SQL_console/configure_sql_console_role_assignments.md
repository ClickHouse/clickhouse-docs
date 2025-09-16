---
slug: /cloud/guides/sql-console/config-sql-console-role-assignments
sidebar_label: 'Configuring SQL console role assignments'
title: 'Configuring SQL console role assignments'
description: 'Guide showing how to configure SQL console role assignments'
---

import Image from '@theme/IdealImage';
import step_1 from '@site/static/images/cloud/guides/sql_console/service_level_access/1_service_settings.png'
import step_2 from '@site/static/images/cloud/guides/sql_console/service_level_access/2_service_settings.png'
import step_3 from '@site/static/images/cloud/guides/sql_console/service_level_access/3_service_settings.png'
import step_4 from '@site/static/images/cloud/guides/sql_console/service_level_access/4_service_settings.png'
import step_5 from '@site/static/images/cloud/guides/sql_console/service_level_access/5_service_settings.png'
import step_6 from '@site/static/images/cloud/guides/sql_console/service_level_access/6_service_settings.png'
import step_7 from '@site/static/images/cloud/guides/sql_console/service_level_access/7_service_settings.png'

# Configuring SQL console role assignments

> This guide shows you how to configure SQL console role assignments, which
determine console-wide access permissions and the features that a user can
access within Cloud console.

<VerticalStepper>

## Access service settings {#access-service-settings}

From the services page, click the menu in the top right corner of the service
for which you want to adjust SQL console access settings.

<Image img={step_1} size="lg"/>

Select `settings` from the popup menu.

<Image img={step_2} size="lg"/>

## Adjust SQL console access {#adjust-sql-console-access}

Under the "Security" section, find the "SQL console access" area:

<Image img={step_3} size="md"/>

Select the drop-down menu for Service Admin to change the access control settings for Service Admin roles:

<Image img={step_4} size="md"/>

You can choose from the following roles:

| Role          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

Select the drop-down menu for Service Read Only to change the access control settings for Service Read Only roles:

<Image img={step_5} size="md"/>

You can choose from the following roles:

| Role          |
|---------------|
| `No access`   |
| `Read only`   |
| `Full access` |

An overview of users for the service can be viewed by selecting the user count:

<Image img={step_6} size="md"/>

A tab will open to the right of the page showing the total number of users and their roles:

<Image img={step_7} size="md"/>

</VerticalStepper>