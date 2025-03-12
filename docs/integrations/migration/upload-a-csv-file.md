---
title: 'Upload a CSV File'
slug: /integrations/migration/upload-a-csv-file
description: 'Learn about Upload a CSV File'
---

import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';

# Upload a CSV File

You can upload a CSV or TSV file that contains a header row with the column names, and ClickHouse will preprocess a batch
of rows to infer the data types of the columns, then insert the rows into a new table.

1. Start by going to the **Details** page of your ClickHouse Cloud service:

<img src={uploadcsv1} class="image" alt="Details page" />

2. Select **Load data** from the **Actions** dropdown menu:

<img src={uploadcsv2} class="image" alt="Add data" />

3. Click the **File upload** button on the **Datasources** page and select the file you want to upload in the dialog window that appears. Click **Open** to proceed ( Example below is on macOS, other operating systems may vary).

<img src={uploadcsv3} class="image" alt="Select the file to upload" />

4. ClickHouse shows you the data types that it inferred.

<img src={uploadcsv4} class="image" alt="Inferred data types" />

5. ***Enter a new table name*** to insert the data into, then click the **Import to ClickHouse** button.

<img src={uploadcsv5} class="image" alt="Select the file to upload" />

6. Connect to your ClickHouse service, verify the table was created successfully, and your data is ready to go! If you want to visualize your data, check out some of the [BI tools](../data-visualization/index.md) that can easily connect to ClickHouse.
