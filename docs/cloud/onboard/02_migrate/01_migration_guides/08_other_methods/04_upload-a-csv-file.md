- `ReplacingMergeTree`
- `SummingMergeTree`
- `Null`
<br/>
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
