---
title: 'Uploading files'
slug: /cloud/migrate/upload-a-csv-file
description: 'Learn how to upload files to Cloud'
---

import Image from '@theme/IdealImage';
import csv_01 from '@site/static/images/cloud/migrate/csv_01.png';
import csv_02 from '@site/static/images/cloud/migrate/csv_02.png';
import csv_03 from '@site/static/images/cloud/migrate/csv_03.png';
import csv_04 from '@site/static/images/cloud/migrate/csv_04.png';
import csv_05 from '@site/static/images/cloud/migrate/csv_05.png';
import csv_06 from '@site/static/images/cloud/migrate/csv_06.png';
import csv_07 from '@site/static/images/cloud/migrate/csv_07.png';
import csv_08 from '@site/static/images/cloud/migrate/csv_08.png';
import csv_09 from '@site/static/images/cloud/migrate/csv_09.png';
import csv_10 from '@site/static/images/cloud/migrate/csv_10.png';

# Upload files to Cloud

ClickHouse Cloud provides an easy way to import your files and supports the
following formats:

| Format                          |
|---------------------------------|
| `CSV`                           |
| `CSVWithNamesAndTypes`          |
| `CSVWithNames`                  |
| `JSONEachRow`                   |
| `TabSeparated`                  |
| `TabSeparatedWithNames`         |
| `TabSeparatedWithNamesAndTypes` |

<VerticalStepper headerLevel="h2">
## Upload a file {#upload-file}
From the Cloud homepage, select your service as shown below:
<Image img={csv_01} alt="upload_file_02" />
If your service is idle you will need to wake it.
Select `Data sources` in the left hand tab as shown below:
<Image img={csv_02} alt="upload_file_03" />
Next select `Upload a file` on the right side of the data sources page:
<Image img={csv_03} alt="upload_file_04" />
A file dialogue will pop up allowing you to select the file that you wish to
use to insert data into a table on your Cloud service.
<Image img={csv_04} alt="upload_file_05" />
## Configure table {#configure-table}
Once the file has uploaded you will be able to configure the table where you want
to insert the data to. A preview of the table with the first three rows is shown.
<Image img={csv_08} alt="upload_file_08" />
You can now select a destination table. The options are:
- a new table
- an existing table
You can specify which database you want to upload the data to, and in the case of
a new table, the name of the table that will be created. You will also be able to select the sorting key:
<Image img={csv_05} alt="upload_file_05" />
Columns read from the file are shown as `Source field`s and for each field, you
can change:
- the inferred type
- the default value
- whether to make the column [Nullable](/sql-reference/data-types/nullable) or not
<Image img={csv_06} alt="upload_file_06" />
:::note Excluding fields
You can also remove a field if you don't want to include it in the import
:::
You can specify the type of table engine that you want to use:
- `MergeTree`
- `ReplacingMergeTree`
- `SummingMergeTree`
- `Null`
You can specify a partitioning key expression and primary
key expression.
<Image img={csv_07} alt="upload_file_07" />
Click `Import to ClickHouse` (shown above) to import the data. The data import will be queued as
indicated by the `queued` status badge in the `Status` column as shown below. You can also click
`Open as query` (shown above) to open the insert query in the SQL console. The query will insert
the file which was uploaded to an S3 bucket using the `URL` table function.
<Image img={csv_09} alt="upload_file_09" />
If the job fails you will see a `failed` status badge under the `Status` column of
the `Data upload history` tab. You can click `View Details` for more information
on why the upload failed. You may need to modify the table configuration or clean
the data based on the error message for the failed insert.
<Image img={csv_10} alt="upload_file_11" />
</VerticalStepper>
