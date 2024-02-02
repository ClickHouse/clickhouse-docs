--Step 4:
CREATE TABLE test_pypi (
    TIMESTAMP DateTime,
    COUNTRY_CODE String,
    URL String,
    PROJECT String
)
ENGINE = MergeTree
PRIMARY KEY (PROJECT, TIMESTAMP)
ORDER BY (PROJECT, TIMESTAMP, COUNTRY_CODE);

INSERT INTO test_pypi
    SELECT * FROM pypi2;


--Step 5:
SELECT
    formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
    count() AS num_of_active_parts
FROM system.parts
WHERE (active = 1) AND (table = 'test_pypi');
