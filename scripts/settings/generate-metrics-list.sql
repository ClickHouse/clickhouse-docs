-- Generate a Markdown list of all CurrentMetrics with descriptions
SELECT
    arrayStringConcat(
        groupArray(formatted_entry),
        concat(char(10), char(10))
    )
FROM (
    SELECT concat('### ', metric, ' {#', lower(metric), '}', char(10), char(10), description) as formatted_entry
    FROM system.metrics
    ORDER BY metric
)
LIMIT 1
INTO OUTFILE 'temp-metrics-list.md' TRUNCATE
FORMAT LineAsString
