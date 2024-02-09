--Step 2:
SELECT
    PROJECT,
    count()
FROM s3Cluster(default,'https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2023/pypi_0_0_*.snappy.parquet')
GROUP BY PROJECT
ORDER BY 2 DESC
LIMIT 20;