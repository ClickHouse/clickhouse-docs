-- Generate a Markdown list of all ProfileEvents with descriptions
-- Uses system_events_show_zero_values to include events that have not yet fired
SET system_events_show_zero_values = 1;

SELECT
    arrayStringConcat(
        groupArray(formatted_entry),
        concat(char(10), char(10))
    )
FROM (
    SELECT concat('### ', event, ' {#', lower(event), '}', char(10), char(10), description) as formatted_entry
    FROM system.events
    ORDER BY event
)
LIMIT 1
INTO OUTFILE 'temp-events-list.md' TRUNCATE
FORMAT LineAsString
