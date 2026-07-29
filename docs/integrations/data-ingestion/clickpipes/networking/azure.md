---
sidebar_label: 'Azure private connectivity'
description: 'Private connectivity options for ClickPipes with Azure data sources, including the status of Azure Private Link support.'
slug: /integrations/clickpipes/networking/azure
title: 'Azure private connectivity'
doc_type: 'guide'
keywords: ['azure private link', 'azure', 'clickpipes', 'private connectivity', 'ssh tunnel', 'azure flexible server']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

ClickPipes does **not** currently support Azure Private Link. Native Azure Private Link support is planned.

## Connecting to a private Azure source today {#connecting-today}

To reach an Azure data source that isn't exposed to the public internet, connect over an **SSH tunnel** through a bastion (jump) host, so ingestion traffic still avoids the public internet. See [SSH tunneling](/integrations/clickpipes/networking#ssh-tunneling) for the setup steps and the static IPs to allow through your bastion's firewall.

If your Azure source is publicly reachable, a ClickPipe can connect to it directly over its public endpoint — no additional networking setup is required.
