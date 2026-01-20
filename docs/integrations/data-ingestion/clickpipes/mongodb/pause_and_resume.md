---
title: 'Pausing and Resuming a MongoDB ClickPipe'
description: 'Pausing and Resuming a MongoDB ClickPipe'
sidebar_label: 'Pause table'
slug: /integrations/clickpipes/mongodb/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

There are scenarios where it would be useful to pause a MongoDB ClickPipe. For example, you may want to run some analytics on existing data in a static state. Or, you might be performing upgrades on MongoDB. Here is how you can pause and resume a MongoDB ClickPipe.

## Steps to pause a MongoDB ClickPipe {#pause-clickpipe-steps}

1. In the Data Sources tab, click on the MongoDB ClickPipe you wish to pause.
2. Head over to the **Settings** tab.
3. Click on the **Pause** button.

<Image img={pause_button} border size="md"/>

4. A dialog box should appear for confirmation. Click on Pause again.

<Image img={pause_dialog} border size="md"/>

4. Head over to the **Metrics** tab.
5. Wait for the status of the pipe to be **Paused**.

<Image img={pause_status} border size="md"/>

## Steps to resume a MongoDB ClickPipe {#resume-clickpipe-steps}
1. In the Data Sources tab, click on the MongoDB ClickPipe you wish to resume. The status of the mirror should be **Paused** initially.
2. Head over to the **Settings** tab.
3. Click on the **Resume** button.

<Image img={resume_button} border size="md"/>

4. A dialog box should appear for confirmation. Click on Resume again.

<Image img={resume_dialog} border size="md"/>

5. Head over to the **Metrics** tab.
6. Wait for the status of the pipe to be **Running**.
