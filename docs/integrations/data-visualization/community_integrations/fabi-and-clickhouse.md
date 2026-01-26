---
sidebar_label: 'Fabi.ai'
slug: /integrations/fabi.ai
keywords: ['clickhouse', 'Fabi.ai', 'connect', 'integrate', 'notebook', 'ui', 'analytics']
description: 'Fabi.ai is an all-in-one collaborate data analysis platform. You can leverage SQL, Python, AI, and no-code to build dashboard and data workflows faster than ever before'
title: 'Connect ClickHouse to Fabi.ai'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';

# Connecting ClickHouse to Fabi.ai

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a> is an all-in-one collaborate data analysis platform. You can leverage SQL, Python, AI, and no-code to build dashboard and data workflows faster than ever before. Combined with the scale and power of ClickHouse, you can build and share your first highly performant dashboard on a massive dataset in minutes.

<Image size="md" img={fabi_01} alt="Fabi.ai data exploration and workflow platform" border />

## Gather Your Connection Details {#gather-your-connection-details}

<ConnectionDetails />

## Create your Fabi.ai account and connect ClickHouse {#connect-to-clickhouse}

Log in or create your Fabi.ai account: https://app.fabi.ai/

1. You’ll be prompted to connect your database when you first create your account, or if you already have an account, click on the data source panel on the left of any Smartbook and select Add Data Source.
   
   <Image size="lg" img={fabi_02} alt="Add data source" border />

2. You’ll then be prompted to enter your connection details.

   <Image size="md" img={fabi_03} alt="ClickHouse credentials form" border />

3. Congratulations! You have now integrated ClickHouse into Fabi.ai.

## Querying ClickHouse. {#querying-clickhouse}

Once you’ve connected Fabi.ai to ClickHouse, go to any [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks) and create a SQL cell. If you only have one data source connected to your Fabi.ai instance, the SQL cell will automatically default to ClickHouse, otherwise you can choose the source to query from the source dropdown.

   <Image size="lg" img={fabi_04} alt="Querying ClickHouse" border />

## Additional Resources {#additional-resources}

[Fabi.ai](https://www.fabi.ai) documentation: https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai) getting started tutorial videos: https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl
