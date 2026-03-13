-- Generate a Markdown table of all ProfileEvents with descriptions
-- Uses system_events_show_zero_values to include events that have not yet fired
SET system_events_show_zero_values = 1;

SELECT
    concat(
        '| Event | Description |', char(10),
        '|-------|-------------|', char(10),
        arrayStringConcat(
            groupArray(formatted_row),
            char(10)
        )
    )
FROM (
    SELECT concat('| **', event, '** | ', description, ' |') as formatted_row
    FROM system.events
    ORDER BY event
)
LIMIT 1
INTO OUTFILE 'temp-events-list.md' TRUNCATE
FORMAT LineAsString
