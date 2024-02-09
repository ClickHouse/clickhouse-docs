--Step 4:
SELECT
    event_time,
    query
FROM clusterAllReplicas(default, system.query_log)
ORDER BY  event_time DESC
LIMIT 20;

--Step 5:
SELECT
    query
FROM clusterAllReplicas(default, system.query_log)
WHERE has(tables, 'default.uk_price_paid');

--Step 6:
SELECT count()
FROM clusterAllReplicas(default, system.query_log)
WHERE positionCaseInsensitive(query, 'insert') > 0;

--Step 8:
SELECT count()
FROM clusterAllReplicas(default, system.parts);
