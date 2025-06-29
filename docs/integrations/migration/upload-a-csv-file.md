---
title: 'Upload a CSV File'
slug: /integrations/migration/upload-a-csv-file
description: 'Learn about Upload a CSV File'
---

import Image from '@theme/IdealImage';
import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';

# Upload a CSV file

You can upload a CSV or TSV file that contains a header row with the column names, and ClickHouse will preprocess a batch
of rows to infer the data types of the columns, then insert the rows into a new table.

1. Start by going to the **Details** page of your ClickHouse Cloud service:

<Image img={uploadcsv1} size='md' alt='Details page' />

2. Select **Load data** from the **Actions** dropdown menu:

<Image img={uploadcsv2} size='sm' alt='Add data'/>

3. Click the **File upload** button on the **Datasources** page and select the file you want to upload in the dialog window that appears. Click **Open** to proceed ( Example below is on macOS, other operating systems may vary).

<Image img={uploadcsv3} size='md' alt='Select the file to upload' />

4. ClickHouse shows you the data types that it inferred.

<Image img={uploadcsv4} size='md' alt='Inferred data types' />

5. ***Enter a new table name*** to insert the data into, then click the **Import to ClickHouse** button.

<Image img={uploadcsv5} size='md' alt='Select the file to upload'/>

6. Connect to your ClickHouse service, verify the table was created successfully, and your data is ready to go! If you want to visualize your data, check out some of the [BI tools](../data-visualization/index.md) that can easily connect to ClickHouse.
