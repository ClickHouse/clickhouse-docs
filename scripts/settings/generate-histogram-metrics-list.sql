-- Generate a Markdown list of all histogram metrics with descriptions
SELECT
    arrayStringConcat(
        groupArray(formatted_entry),
        concat(char(10), char(10))
    )
FROM (
    SELECT concat('### ', metric, ' {#', lower(metric), '}', char(10), char(10), description) as formatted_entry
    FROM system.histogram_metrics
    ORDER BY metric
)
LIMIT 1
INTO OUTFILE 'temp-histogram-metrics-list.md' TRUNCATE
FORMAT LineAsString
