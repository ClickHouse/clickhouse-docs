-- Generate a Markdown table of all CurrentMetrics with descriptions
SELECT
    concat(
        '| Metric | Description |', char(10),
        '|--------|-------------|', char(10),
        arrayStringConcat(
            groupArray(formatted_row),
            char(10)
        )
    )
FROM (
    SELECT concat('| **', metric, '** | ', description, ' |') as formatted_row
    FROM system.metrics
    ORDER BY metric
)
LIMIT 1
INTO OUTFILE 'temp-metrics-list.md' TRUNCATE
FORMAT LineAsString
