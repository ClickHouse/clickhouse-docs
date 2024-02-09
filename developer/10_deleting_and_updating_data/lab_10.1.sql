--Step 1:
CREATE TABLE rates_monthly (
    month Date,
    variable Decimal32(2),
    fixed Decimal32(2),
    bank Decimal32(2)
)
ENGINE = ReplacingMergeTree
PRIMARY KEY month;

--Step 5:
INSERT INTO rates_monthly VALUES
    ('2022-05-31', 3.2, 3.0, 1.1);

--Step 7:
SELECT *
FROM rates_monthly FINAL
WHERE month = '2022-05-31';

--Step 8:
CREATE TABLE rates_monthly2 (
    month Date,
    variable Decimal32(2),
    fixed Decimal32(2),
    bank Decimal32(2),
    version UInt32
)
ENGINE = ReplacingMergeTree(version)
PRIMARY KEY month;

--Step 9:
INSERT INTO rates_monthly2
    SELECT
        month, variable, fixed, bank, 1
    FROM rates_monthly;

--Step 12:
OPTIMIZE TABLE rates_monthly2 FINAL;

SELECT *
FROM rates_monthly2
WHERE month = '2022-04-30';
