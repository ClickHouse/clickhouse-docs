--Step 5:
SELECT
    column,
    formatReadableSize(sum(column_data_uncompressed_bytes) AS u) AS uncompressed,
    formatReadableSize(sum(column_data_compressed_bytes) AS c) AS compressed,
    round(u / c, 2) AS compression_ratio
FROM system.parts_columns
WHERE table = 'prices_1' AND active = 1
GROUP BY column;

--Step 8:
CREATE OR REPLACE TABLE prices_2
(
    `price` UInt32 CODEC(T64, LZ4),
    `date` Date CODEC(DoubleDelta, ZSTD),
    `postcode1` String,
    `postcode2` String,
    `is_new` UInt8 CODEC(LZ4HC)
)
ENGINE = MergeTree
ORDER BY date
SETTINGS min_rows_for_wide_part=0,min_bytes_for_wide_part=0;

--Step 10:
SELECT
    column,
    formatReadableSize(sum(column_data_uncompressed_bytes) AS u) AS uncompressed,
    formatReadableSize(sum(column_data_compressed_bytes) AS c) AS compressed,
    round(u / c, 2) AS compression_ratio
FROM system.parts_columns
WHERE table = 'prices_2' AND active = 1
GROUP BY column;
