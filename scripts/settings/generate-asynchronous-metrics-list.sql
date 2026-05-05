-- Generate a Markdown list of all asynchronous metrics with descriptions
SELECT
    arrayStringConcat(
        groupArray(formatted_entry),
        concat(char(10), char(10))
    )
FROM (
    SELECT concat('### ', metric, ' {#', lower(metric), '}', char(10), char(10), description) as formatted_entry
    FROM system.asynchronous_metrics
    ORDER BY metric
)
LIMIT 1
INTO OUTFILE 'temp-asynchronous-metrics-list.md' TRUNCATE
FORMAT LineAsString
