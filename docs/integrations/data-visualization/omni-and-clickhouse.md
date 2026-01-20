---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni is an enterprise platform for BI, data applications, and embedded analytics that helps you explore and share insights in real time.'
title: 'Omni'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Omni

<PartnerBadge/>

Omni can connect to ClickHouse Cloud or on-premise deployment via the official ClickHouse data source.

## 1. Gather your connection details {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Create a ClickHouse data source {#2-create-a-clickhouse-data-source}

Navigate to Admin -> Connections and click the "Add Connection" button in the top right corner.

<Image size="lg" img={omni_01} alt="Omni admin interface showing the Add Connection button in the Connections section" border />
<br/>

Select `ClickHouse`. Enter your credentials in the form.

<Image size="lg" img={omni_02} alt="Omni connection configuration interface for ClickHouse showing credential form fields" border />
<br/>

Now you should can query and visualize data from ClickHouse in Omni.
