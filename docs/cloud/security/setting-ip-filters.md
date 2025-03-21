---
sidebar_label: 'Setting IP Filters'
slug: /cloud/security/setting-ip-filters
title: 'Setting IP Filters'
description: 'This page explains how to set IP filters in ClickHouse Cloud to control access to ClickHouse services.'
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## Setting IP Filters {#setting-ip-filters}

IP access lists filter traffic to your ClickHouse services by specifying which source addresses are permitted to connect to your ClickHouse service.  The lists are configurable for each service.  Lists can be configured during the deployment of a service, or afterward.  If you do not configure an IP access list during provisioning, or if you want to make changes to your initial list, then you can make those changes by selecting the service and then the **Security** tab.

:::important
If you skip the creation of the IP Access List for a ClickHouse Cloud service then no traffic will be permitted to the service.
:::

## Prepare {#prepare}
Before you begin, collect the IP Addresses or ranges that should be added to the access list.  Take into consideration remote workers, on-call locations, VPNs, etc. The IP Access List user interface accepts individual addresses and CIDR notation.

Classless Inter-domain Routing (CIDR) notation, allows you to specify IP Address ranges smaller than the traditional Class A, B, or C (8, 6, or 24) subnet mask sizes. [ARIN](https://account.arin.net/public/cidrCalculator) and several other organizations provide CIDR calculators if you need one, and if you would like more information on CIDR notation, please see the [Classless Inter-domain Routing (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFC.

## Create or modify an IP Access List {#create-or-modify-an-ip-access-list}

From your ClickHouse Cloud services list select the service and then select **Settings**.  Under the **Security** section, you will find the IP access list. Click on the hyperlink where the text says: *You can connect to this service from* **(anywhere | x specific locations)**

A sidebar will appear with options for you to configure:

- Allow incoming traffic from anywhere to the service
- Allow access from specific locations to the service
- Deny all access to the service

This screenshot shows an access list which allows traffic from a range of IP Addresses, described as "NY Office range":

<Image img={ip_filtering_after_provisioning} size="md" alt="Existing access list in ClickHouse Cloud" border/>

### Possible actions {#possible-actions}

1. To add an additional entry you can use **+ Add new IP**

  This example adds a single IP address, with a description of `London server`:

<Image img={ip_filter_add_single_ip} size="md" alt="Adding a single IP to the access list in ClickHouse Cloud" border/>

1. Delete an existing entry

  Clicking the cross (x) can deletes an entry

1. Edit an existing entry

  Directly modifying the entry

1. Switch to allow access from **Anywhere**

  This is not recommended, but it is allowed.  We recommend that you expose an application built on top of ClickHouse to the public and restrict access to the back-end ClickHouse Cloud service.

To apply the changes you made, you must click **Save**.

## Verification {#verification}

Once you create your filter confirm connectivity from within the range, and confirm that connections from outside the permitted range are denied.  A simple `curl` command can be used to verify:
```bash title="Attempt rejected from outside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
or
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="Attempt permitted from inside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
Ok.
```

## Limitations {#limitations}

- Currently, IP Access Lists support only IPv4
