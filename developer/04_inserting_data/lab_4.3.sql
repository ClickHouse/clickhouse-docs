--Step 1:
SELECT count()
FROM s3('https://learn-clickhouse.s3.us-east-2.amazonaws.com/operating_budget.csv')
SETTINGS format_csv_delimiter = '~';

--Step 2:
SELECT formatReadableQuantity(sum(actual_amount))
FROM s3('https://learn-clickhouse.s3.us-east-2.amazonaws.com/operating_budget.csv')
SETTINGS format_csv_delimiter = '~';

--Step 3:
SELECT formatReadableQuantity(sum(approve_amount))
FROM s3('https://learn-clickhouse.s3.us-east-2.amazonaws.com/operating_budget.csv')
SETTINGS format_csv_delimiter = '~';

-- You get an exception telling you that trying to sum a String column is not allowed. Apparently, the approved_amount column is not entirely numeric data, and ClickHouse inferred that column as a String.

--Step 4:
DESCRIBE s3('https://learn-clickhouse.s3.us-east-2.amazonaws.com/operating_budget.csv')
SETTINGS format_csv_delimiter = '~';

--Step 5:
SELECT
    formatReadableQuantity(sum(toUInt32OrZero(approved_amount))),
    formatReadableQuantity(sum(toUInt32OrZero(recommended_amount)))
FROM s3('https://learn-clickhouse.s3.us-east-2.amazonaws.com/operating_budget.csv')
SETTINGS format_csv_delimiter = '~';

--Step 7:
CREATE TABLE operating_budget (
    fiscal_year LowCardinality(String),
    service LowCardinality(String),
    department LowCardinality(String),
    program LowCardinality(String),
    program_code UInt32,
    description String,
    item_category LowCardinality(String),
    approved_amount UInt32,
    recommended_amount UInt32,
    actual_amount Decimal(12,2),
    fund LowCardinality(String),
    fund_type Enum8('GENERAL FUNDS' = 1, 'FEDERAL FUNDS' = 2, 'OTHER FUNDS' = 3)
)
ENGINE = MergeTree
PRIMARY KEY (fiscal_year, program);

--Step 8:
INSERT INTO operating_budget
    WITH
        splitByChar('(', c4) AS result
    SELECT
        c1 AS fiscal_year,
        c2 AS service,
        c3 AS department,
        result[1] AS program,
        toUInt32OrZero(splitByChar(')',result[2])[1]) AS program_code,
        c5 AS description,
        c6 AS item_category,
        toUInt32OrZero(c7) AS approved_amount,
        toUInt32OrZero(c8) AS recommended_amount,
        toDecimal64(c9, 2) AS actual_amount,
        c10 AS fund,
        c11 AS fund_type
    FROM s3(
        'https://learn-clickhouse.s3.us-east-2.amazonaws.com/operating_budget.csv',
        'CSV',
        'c1 String,
        c2 String,
        c3 String,
        c4 String,
        c5 String,
        c6 String,
        c7 String,
        c8 String,
        c9 String,
        c10 String,
        c11 String'
        )
    SETTINGS
        format_csv_delimiter = '~',
        input_format_csv_skip_first_lines=1;

--Step 9:
SELECT * FROM operating_budget;

--Step 10:
SELECT formatReadableQuantity(sum(approved_amount))
FROM operating_budget
WHERE fiscal_year = '2022';

--Step 11:
SELECT sum(actual_amount)
FROM operating_budget
WHERE fiscal_year = '2022'
AND program_code = 31;
