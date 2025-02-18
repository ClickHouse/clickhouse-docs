---
slug: /en/deployment-guides/parallel-replicas
title: Parallel Replicas
keywords: ["parallel replica"]
description: "In this guide, we will first discuss how ClickHouse distributes a 
query across multiple shards via distributed tables, and then how a query can 
leverage multiple replicas for its execution."
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

ClickHouse processes queries extremely quickly, but how are these queries 
distributed and parallelized across multiple servers? 
In this guide, we will first discuss how ClickHouse distributes a query across
multiple shards via distributed tables, and then how a query can leverage 
multiple replicas for its execution.

## Sharded Architecture

In a shared-nothing architecture, it's very common to have a cluster split into
multiple shards, with each shard containing a subset of the overall data. On top
of these shards, is a distributed table.

Reads can be sent to the local table. Query execution will occur only 
on the specified shard, or it can be sent to the distributed table, and in that
case, each shard will execute the given queries. The server where the distributed
table was queried will aggregate the data and respond to the client:

![sharded architecture](@site/docs/en/deployment-guides/images/parallel-replicas-1.png)

<ol>
    <li>
        The select query is sent to a distributed table on a node arbitrarily 
        (via a round-robin strategy or after being routed to a specific server 
        by a load balancer). This node is now going to act as a coordinator.
    </li>
    <li>
        The node is going to locate each shard that needs to execute the query 
        via the information specified by the distributed table, and the query is
        sent to each shard.
    </li>
    <li>
        Each shard is going to read, filter, and aggregate the data locally and 
        send back a mergeable state to the coordinator.
    </li>
    <li>
        The coordinating node merges the data and then sends back the response 
        to the client.
    </li>
</ol>

Now if you add replicas into the mix, the process is fairly similar, the only 
difference is that only a single replica from each shard will execute the query,
meaning that more queries can then be processed in parallel. 

## Non-sharded architecture

Now, in our cloud, we have a very different architecture than the one presented 
above. (See ["ClickHouse Cloud Architecture"](https://clickhouse.com/docs/en/cloud/reference/architecture)
for more details). With separation of compute and storage, and with virtually an
infinite amount of storage, the need for shards is less present. This is what our
architecture looks like: 

![non-sharded architecture](@site/docs/en/deployment-guides/images/parallel-replicas-2.png)

This architecture allows us to be able to add and remove replicas almost 
instantaneously, ensuring a very high scalability of the cluster. The ClickHouse
Keeper cluster ensures that we have a single source of truth for the metadata, 
the replicas can fetch the metadata from the ClickHouse Keeper cluster and 
maintain the same data. The data themselves are stored in the object storage, and
the cache allows us to speed up queries, but how can we now distribute a query 
execution through multiple servers? In a sharded architecture, it was fairly 
obvious given each shard could actually execute a query on a subset of the data,
how does it work when there is no sharding?

## Introducing Parallel Replicas

<BetaBadge/>

In order to parallelize the query execution through multiple servers, we need 
first to be able to assign one of our servers as the coordinator, the one that 
will create the list of tasks that need to be executed, ensure they are all 
executed, aggregated and the result returned to the client. Like in most 
distributed systems, this will be the role of the node receiving the initial 
query. We also need to define the unit of work, in a sharded architecture, the
unit of work was the shard, a subset of the data, with parallel replica we will
use a small portion of the tables (granules, please refer to this documentation
page if you are not familiar with the concept).

Now, let's see how it works in practice:

![Parallel replicas](@site/docs/en/deployment-guides/images/parallel-replicas-3.png)

<ol>
    <li>
        The query from the client is sent to one node after going through a load
        balancer. The node becomes the coordinator for this query.
    </li>
    <li>
        The node is going to analyze the index, and select the right parts and 
        granules to process.
    </li>
    <li>
        The coordinator splits the workload into a set of granules that can be 
        assigned to different replicas.
    </li>
    <li>
        Each set of granules is processed by the corresponding replicas and a 
        mergeable state is sent to the coordinator.
    </li>
    <li>
        The coordinator merges all the results from the replicas and then 
        returns a response to the client. 
    </li>
</ol>

This is how it works in theory. Now, in practice, there are a lot of factors 
that could prevent such logic from working perfectly:

<ol>
    <li>
        What if some replicas are unavailable? 
    </li>
    <li>
        The replication in ClickHouse is asynchronous, some replicas might not 
        have the same parts at some point in time.
    </li>
    <li>
        How to handle tail latency between replicas?
    </li>
    <li>
        The filesystem cache varies from replica to replica based on the 
        activity on each replica, meaning that a random task assignment might 
        lead to less optimal performance given the cache locality.
    </li>
</ol>

## Announcements

To address (1) and (2) from the list above, we introduced the concept of an
announcement. Let's try to visualize how this works:

![Announcements](@site/docs/en/deployment-guides/images/parallel-replicas-4.png)

<ol>
    <li>
        The query from the client is sent to one node after going through a load
        balancer. The node becomes the coordinator for this query.
    </li>
    <li>
        The coordinating node is sending a request to get the announcement from
        all the replicas in the cluster. Replicas may have slightly different
        views of the current set of parts for a table. thus we need to collect
        this information to avoid incorrect scheduling decisions.
    </li>
    <li>
        The replica is using the announcements to define a set of granules that
        can be assigned to different replicas, here for example, we can see that
        no granules from part 3 have been assigned to replica 2 because this
        replica did not provide this part in its announcement. We can also note
        that no tasks were assigned to replica 3 because the replica did not
        provide an announcement.
    </li>
    <li>
        After each replica processed the query on their subset of granules and
        the mergeable state has been sent to the coordinator, the coordinator
        merges the results and the response is sent to the client.
    </li>
</ol>

## Dynamic Coordination

To address the issue of tail latency, we added dynamic coordination. This means
that all the granules are not sent to a replica in one request, but each replica
will be able to request a new task (set of granules to be processed) to the
coordinator. The coordinator will give the replica the set of granule based on
the announcement received.

Let's assume we are in a situation where all replicas sent an announcement with
all the parts. Let's see how the dynamic coordination works:

![Dynamic Coordination - part 1](@site/docs/en/deployment-guides/images/parallel-replicas-4.png)

<ol>
    <li>
        Replicas let the coordinator node know that they can process tasks, they
        can also specify how much work they can process.
    </li>
    <li>
        The coordinator assigns tasks to the replicas.
    </li>
</ol>

![Dynamic Coordination - part 2](@site/docs/en/deployment-guides/images/parallel-replicas-5.png)

<ol>
    <li>
        The replica 1 and 2 are able to finish their task very quickly. They
        will request another task from the coordinator node.
    </li>
    <li>
        The coordinator assigns new tasks to the replica 1 and 2.
    </li>
</ol>

![Dynamic Coordination - part 3](@site/docs/en/deployment-guides/images/parallel-replicas-6.png)

<ol>
    <li>
        All the replicas are now done with the processing of their task. They
        ask for more tasks.
    </li>
    <li>
        The coordinator, using the announcements, checks the remaining tasks to
        process, but there are no more tasks.
    </li>
    <li>
        The coordinator tells the replicas that everything has been processed.
        It will now merge all the mergeable states and respond to the query.
    </li>
</ol>

## Managing Cache Locality

The last remaining potential issue is how we handle cache locality. If the query
is executed multiple times, how can we ensure the same task gets rooted to the
same replica? In the previous example, we had the following tasks assigned:

<table>
    <thead>
        <tr>
            <th></th>
            <th>Replica 1</th>
            <th>Replica 2</th>
            <th>Replica 3</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Part 1</td>
            <td>g1, g6, g7</td>
            <td>g2, g4, g5</td>
            <td>g3</td>
        </tr>
        <tr>
            <td>Part 2</td>
            <td>g1</td>
            <td>g2, g4, g5</td>
            <td>g3</td>
        </tr>
        <tr>
            <td>Part 3</td>
            <td>g1, g6</td>
            <td>g2, g4, g5</td>
            <td>g3</td>
        </tr>
    </tbody>
</table>

To make sure that the same tasks are assigned to the same replicas and can
benefit from the cache, we can compute a hash of the part + set of
granules (task) and apply a modulo of the number of replicas for the task
assignment.

This sounds great on paper, but in reality, a sudden load on one replica, a
network degradation, can introduce a tail latency if we consistently use the
same replica for executing certain tasks. If `max_parallel_replicas` is less
than the number of replicas, random replicas are picked for query execution.

## Task Stealing

if some replica processes tasks slower than others, other replicas will try to
'steal' tasks that in principle belong to that replica by hash to reduce
'tail latency'

## Limitations

This feature has known limitations, the major ones are documented here, if you
find any issues and suspect parallel replica to be the cause, and you cannot
find it here, please report it on GitHub using the label `comp-parallel-replicas`

| Limitation                                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Complex Query                                 | Currently parallel replica works fairly well for simple queries, complexity layer like CTEs, subqueries, JOINs, non-flat query, etc… can have a negative impact on query performance.                                                                                                                                                                                                                                                                                   |
| Small Queries                                 | If you are executing a query that does not process a lot of rows, executing it on multiple replicas might not yield a better performance time, given that, the network time for the coordination between replicas can lead to additional cycles in the query execution. You can limit these issues by using the setting: [`parallel_replicas_min_number_of_rows_per_replica`](/docs/en/operations/settings/settings#parallel_replicas_min_number_of_rows_per_replica).  |
| Parallel replicas is disabled with FINAL      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| High Cardinality Data and Complex Aggregation | High cardinality aggregation that needs to send much data can significantly slow down your queries.                                                                                                                                                                                                                                                                                                                                                                     |
| Compatibility with the New Analyzer           | The new analyzer might significantly slow down or speed up query execution in specific scenarios.                                                                                                                                                                                                                                                                                                                                                                       | 

## Settings Related to Parallel Replicas

| Setting                                            | Description                                                                                                                                                                                                                                                         |
|----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enable_parallel_replicas`                         | `0`: disabled, `1`: enabled, `2`: Force the usage of parallel replica, will throw an exception if not used                                                                                                                                                          |
| `cluster_for_parallel_replicas`                    | The cluster name to use for parallel replication; if you are using ClickHouse Cloud, use 'default'.                                                                                                                                                                 |
| `max_parallel_replicas`                            | Maximum number of replicas to use for the query execution on multiple replicas, if a number lower than the number of replicas in the cluster is specified, nodes will be selected randomly. This value can also be overcommitted to account for horizontal scaling. |
| `parallel_replicas_min_number_of_rows_per_replica` | Help limiting the number of replicas used based on the number of rows that need to be processed the number of replicas used is defined by `estimated rows to read` / `min_number_of_rows_per_replica`                                                               |
| `allow_experimental_analyzer`                      | `0`: use the old analyzer, `1`: use the new analyzer. The behavior of parallel replicas might change based on the analyzer used.                                                                                                                                    |

## Investigating an Issue with Parallel Replica

You can check what settings are being used for each query in the 
[`system.query_log`](/docs/en/operations/system-tables/query_log) table. You can
also look at the [`system.events`](/docs/en/operations/system-tables/events) to 
see all the events that happen on the server, you can use the [`clusterAllReplicas`](/docs/en/sql-reference/table-functions/cluster)
table function to see the tables on all the replicas (if you are a cloud user, 
use `default`).

```sql title="Query"
SELECT
   hostname(),
   *
FROM clusterAllReplicas('default', system.events)
WHERE event ILIKE '%ParallelReplicas%'
```
<details>
<summary>Response</summary>
```response title="Response"
┌─hostname()───────────────────────┬─event──────────────────────────────────────────┬─value─┬─description──────────────────────────────────────────────────────────────────────────────────────────┐
│ c-crimson-vd-86-server-rdhnsx3-0 │ ParallelReplicasHandleRequestMicroseconds      │   438 │ Time spent processing requests for marks from replicas                                               │
│ c-crimson-vd-86-server-rdhnsx3-0 │ ParallelReplicasHandleAnnouncementMicroseconds │   558 │ Time spent processing replicas announcements                                                         │
│ c-crimson-vd-86-server-rdhnsx3-0 │ ParallelReplicasReadUnassignedMarks            │   240 │ Sum across all replicas of how many unassigned marks were scheduled                                  │
│ c-crimson-vd-86-server-rdhnsx3-0 │ ParallelReplicasReadAssignedForStealingMarks   │     4 │ Sum across all replicas of how many of scheduled marks were assigned for stealing by consistent hash │
│ c-crimson-vd-86-server-rdhnsx3-0 │ ParallelReplicasStealingByHashMicroseconds     │     5 │ Time spent collecting segments meant for stealing by hash                                            │
│ c-crimson-vd-86-server-rdhnsx3-0 │ ParallelReplicasProcessingPartsMicroseconds    │     5 │ Time spent processing data parts                                                                     │
│ c-crimson-vd-86-server-rdhnsx3-0 │ ParallelReplicasStealingLeftoversMicroseconds  │     3 │ Time spent collecting orphaned segments                                                              │
│ c-crimson-vd-86-server-rdhnsx3-0 │ ParallelReplicasUsedCount                      │     2 │ Number of replicas used to execute a query with task-based parallel replicas                         │
│ c-crimson-vd-86-server-rdhnsx3-0 │ ParallelReplicasAvailableCount                 │     6 │ Number of replicas available to execute a query with task-based parallel replicas                    │
└──────────────────────────────────┴────────────────────────────────────────────────┴───────┴──────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌─hostname()───────────────────────┬─event──────────────────────────────────────────┬─value─┬─description──────────────────────────────────────────────────────────────────────────────────────────┐
│ c-crimson-vd-86-server-e9kp5f0-0 │ ParallelReplicasHandleRequestMicroseconds      │   698 │ Time spent processing requests for marks from replicas                                               │
│ c-crimson-vd-86-server-e9kp5f0-0 │ ParallelReplicasHandleAnnouncementMicroseconds │   644 │ Time spent processing replicas announcements                                                         │
│ c-crimson-vd-86-server-e9kp5f0-0 │ ParallelReplicasReadUnassignedMarks            │   190 │ Sum across all replicas of how many unassigned marks were scheduled                                  │
│ c-crimson-vd-86-server-e9kp5f0-0 │ ParallelReplicasReadAssignedForStealingMarks   │    54 │ Sum across all replicas of how many of scheduled marks were assigned for stealing by consistent hash │
│ c-crimson-vd-86-server-e9kp5f0-0 │ ParallelReplicasStealingByHashMicroseconds     │     8 │ Time spent collecting segments meant for stealing by hash                                            │
│ c-crimson-vd-86-server-e9kp5f0-0 │ ParallelReplicasProcessingPartsMicroseconds    │     4 │ Time spent processing data parts                                                                     │
│ c-crimson-vd-86-server-e9kp5f0-0 │ ParallelReplicasStealingLeftoversMicroseconds  │     2 │ Time spent collecting orphaned segments                                                              │
│ c-crimson-vd-86-server-e9kp5f0-0 │ ParallelReplicasUsedCount                      │     2 │ Number of replicas used to execute a query with task-based parallel replicas                         │
│ c-crimson-vd-86-server-e9kp5f0-0 │ ParallelReplicasAvailableCount                 │     6 │ Number of replicas available to execute a query with task-based parallel replicas                    │
└──────────────────────────────────┴────────────────────────────────────────────────┴───────┴──────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌─hostname()───────────────────────┬─event──────────────────────────────────────────┬─value─┬─description──────────────────────────────────────────────────────────────────────────────────────────┐
│ c-crimson-vd-86-server-ybtm18n-0 │ ParallelReplicasHandleRequestMicroseconds      │   620 │ Time spent processing requests for marks from replicas                                               │
│ c-crimson-vd-86-server-ybtm18n-0 │ ParallelReplicasHandleAnnouncementMicroseconds │   656 │ Time spent processing replicas announcements                                                         │
│ c-crimson-vd-86-server-ybtm18n-0 │ ParallelReplicasReadUnassignedMarks            │     1 │ Sum across all replicas of how many unassigned marks were scheduled                                  │
│ c-crimson-vd-86-server-ybtm18n-0 │ ParallelReplicasReadAssignedForStealingMarks   │     1 │ Sum across all replicas of how many of scheduled marks were assigned for stealing by consistent hash │
│ c-crimson-vd-86-server-ybtm18n-0 │ ParallelReplicasStealingByHashMicroseconds     │     4 │ Time spent collecting segments meant for stealing by hash                                            │
│ c-crimson-vd-86-server-ybtm18n-0 │ ParallelReplicasProcessingPartsMicroseconds    │     3 │ Time spent processing data parts                                                                     │
│ c-crimson-vd-86-server-ybtm18n-0 │ ParallelReplicasStealingLeftoversMicroseconds  │     1 │ Time spent collecting orphaned segments                                                              │
│ c-crimson-vd-86-server-ybtm18n-0 │ ParallelReplicasUsedCount                      │     2 │ Number of replicas used to execute a query with task-based parallel replicas                         │
│ c-crimson-vd-86-server-ybtm18n-0 │ ParallelReplicasAvailableCount                 │    12 │ Number of replicas available to execute a query with task-based parallel replicas                    │
└──────────────────────────────────┴────────────────────────────────────────────────┴───────┴──────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌─hostname()───────────────────────┬─event──────────────────────────────────────────┬─value─┬─description──────────────────────────────────────────────────────────────────────────────────────────┐
│ c-crimson-vd-86-server-16j1ncj-0 │ ParallelReplicasHandleRequestMicroseconds      │   696 │ Time spent processing requests for marks from replicas                                               │
│ c-crimson-vd-86-server-16j1ncj-0 │ ParallelReplicasHandleAnnouncementMicroseconds │   717 │ Time spent processing replicas announcements                                                         │
│ c-crimson-vd-86-server-16j1ncj-0 │ ParallelReplicasReadUnassignedMarks            │     2 │ Sum across all replicas of how many unassigned marks were scheduled                                  │
│ c-crimson-vd-86-server-16j1ncj-0 │ ParallelReplicasReadAssignedForStealingMarks   │     2 │ Sum across all replicas of how many of scheduled marks were assigned for stealing by consistent hash │
│ c-crimson-vd-86-server-16j1ncj-0 │ ParallelReplicasStealingByHashMicroseconds     │    10 │ Time spent collecting segments meant for stealing by hash                                            │
│ c-crimson-vd-86-server-16j1ncj-0 │ ParallelReplicasProcessingPartsMicroseconds    │     6 │ Time spent processing data parts                                                                     │
│ c-crimson-vd-86-server-16j1ncj-0 │ ParallelReplicasStealingLeftoversMicroseconds  │     2 │ Time spent collecting orphaned segments                                                              │
│ c-crimson-vd-86-server-16j1ncj-0 │ ParallelReplicasUsedCount                      │     2 │ Number of replicas used to execute a query with task-based parallel replicas                         │
│ c-crimson-vd-86-server-16j1ncj-0 │ ParallelReplicasAvailableCount                 │    12 │ Number of replicas available to execute a query with task-based parallel replicas                    │
└──────────────────────────────────┴────────────────────────────────────────────────┴───────┴──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
</details>

The [`system.text_log`](/docs/en/operations/system-tables/text_log) table also 
contains information about the execution of queries using parallel replicas:

```sql title="Query"
SELECT message
FROM clusterAllReplicas('default', system.text_log)
WHERE query_id = 'ad40c712-d25d-45c4-b1a1-a28ba8d4019c'
ORDER BY event_time_microseconds ASC
```

<details>
<summary>Response</summary>
```response title="Response"
┌─message────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ (from 54.218.178.249:59198) SELECT * FROM session_events WHERE type='type2' LIMIT 10 SETTINGS allow_experimental_parallel_reading_from_replicas=2; (stage: Complete)                                                                                       │
│ Query SELECT __table1.clientId AS clientId, __table1.sessionId AS sessionId, __table1.pageId AS pageId, __table1.timestamp AS timestamp, __table1.type AS type FROM default.session_events AS __table1 WHERE __table1.type = 'type2' LIMIT _CAST(10, 'UInt64') SETTINGS allow_experimental_parallel_reading_from_replicas = 2 to stage Complete │
│ Access granted: SELECT(clientId, sessionId, pageId, timestamp, type) ON default.session_events                                                                                                                                                             │
│ Query SELECT __table1.clientId AS clientId, __table1.sessionId AS sessionId, __table1.pageId AS pageId, __table1.timestamp AS timestamp, __table1.type AS type FROM default.session_events AS __table1 WHERE __table1.type = 'type2' LIMIT _CAST(10, 'UInt64') to stage WithMergeableState only analyze │
│ Access granted: SELECT(clientId, sessionId, pageId, timestamp, type) ON default.session_events                                                                                                                                                             │
│ Query SELECT __table1.clientId AS clientId, __table1.sessionId AS sessionId, __table1.pageId AS pageId, __table1.timestamp AS timestamp, __table1.type AS type FROM default.session_events AS __table1 WHERE __table1.type = 'type2' LIMIT _CAST(10, 'UInt64') from stage FetchColumns to stage WithMergeableState only analyze │
│ Query SELECT __table1.clientId AS clientId, __table1.sessionId AS sessionId, __table1.pageId AS pageId, __table1.timestamp AS timestamp, __table1.type AS type FROM default.session_events AS __table1 WHERE __table1.type = 'type2' LIMIT _CAST(10, 'UInt64') SETTINGS allow_experimental_parallel_reading_from_replicas = 2 to stage WithMergeableState only analyze │
│ Access granted: SELECT(clientId, sessionId, pageId, timestamp, type) ON default.session_events                                                                                                                                                             │
│ Query SELECT __table1.clientId AS clientId, __table1.sessionId AS sessionId, __table1.pageId AS pageId, __table1.timestamp AS timestamp, __table1.type AS type FROM default.session_events AS __table1 WHERE __table1.type = 'type2' LIMIT _CAST(10, 'UInt64') SETTINGS allow_experimental_parallel_reading_from_replicas = 2 from stage FetchColumns to stage WithMergeableState only analyze │
│ Query SELECT __table1.clientId AS clientId, __table1.sessionId AS sessionId, __table1.pageId AS pageId, __table1.timestamp AS timestamp, __table1.type AS type FROM default.session_events AS __table1 WHERE __table1.type = 'type2' LIMIT _CAST(10, 'UInt64') SETTINGS allow_experimental_parallel_reading_from_replicas = 2 from stage WithMergeableState to stage Complete │
│ The number of replicas requested (100) is bigger than the real number available in the cluster (6). Will use the latter number to execute the query.                                                                                                       │
│ Initial request from replica 4: 2 parts: [part all_0_2_1 with ranges [(0, 182)], part all_3_3_0 with ranges [(0, 62)]]----------
Received from 4 replica
                                                                                                   │
│ Reading state is fully initialized: part all_0_2_1 with ranges [(0, 182)] in replicas [4]; part all_3_3_0 with ranges [(0, 62)] in replicas [4]                                                                                                            │
│ Sent initial requests: 1 Replicas count: 6                                                                                                                                                                                                                 │
│ Initial request from replica 2: 2 parts: [part all_0_2_1 with ranges [(0, 182)], part all_3_3_0 with ranges [(0, 62)]]----------
Received from 2 replica
                                                                                                   │
│ Sent initial requests: 2 Replicas count: 6                                                                                                                                                                                                                 │
│ Handling request from replica 4, minimal marks size is 240                                                                                                                                                                                                 │
│ Going to respond to replica 4 with 1 parts: [part all_0_2_1 with ranges [(128, 182)]]. Finish: false; mine_marks=0, stolen_by_hash=54, stolen_rest=0                                                                                                       │
│ Initial request from replica 1: 2 parts: [part all_0_2_1 with ranges [(0, 182)], part all_3_3_0 with ranges [(0, 62)]]----------
Received from 1 replica
                                                                                                   │
│ Sent initial requests: 3 Replicas count: 6                                                                                                                                                                                                                 │
│ Handling request from replica 4, minimal marks size is 240                                                                                                                                                                                                 │
│ Going to respond to replica 4 with 2 parts: [part all_0_2_1 with ranges [(0, 128)], part all_3_3_0 with ranges [(0, 62)]]. Finish: false; mine_marks=0, stolen_by_hash=0, stolen_rest=190                                                                  │
│ Initial request from replica 0: 2 parts: [part all_0_2_1 with ranges [(0, 182)], part all_3_3_0 with ranges [(0, 62)]]----------
Received from 0 replica
                                                                                                   │
│ Sent initial requests: 4 Replicas count: 6                                                                                                                                                                                                                 │
│ Initial request from replica 5: 2 parts: [part all_0_2_1 with ranges [(0, 182)], part all_3_3_0 with ranges [(0, 62)]]----------
Received from 5 replica
                                                                                                   │
│ Sent initial requests: 5 Replicas count: 6                                                                                                                                                                                                                 │
│ Handling request from replica 2, minimal marks size is 240                                                                                                                                                                                                 │
│ Going to respond to replica 2 with 0 parts: []. Finish: true; mine_marks=0, stolen_by_hash=0, stolen_rest=0                                                                                                                                                │
│ Initial request from replica 3: 2 parts: [part all_0_2_1 with ranges [(0, 182)], part all_3_3_0 with ranges [(0, 62)]]----------
Received from 3 replica
                                                                                                   │
│ Sent initial requests: 6 Replicas count: 6                                                                                                                                                                                                                 │
│ Total rows to read: 2000000                                                                                                                                                                                                                                │
│ Handling request from replica 5, minimal marks size is 240                                                                                                                                                                                                 │
│ Going to respond to replica 5 with 0 parts: []. Finish: true; mine_marks=0, stolen_by_hash=0, stolen_rest=0                                                                                                                                                │
│ Handling request from replica 0, minimal marks size is 240                                                                                                                                                                                                 │
│ Going to respond to replica 0 with 0 parts: []. Finish: true; mine_marks=0, stolen_by_hash=0, stolen_rest=0                                                                                                                                                │
│ Handling request from replica 1, minimal marks size is 240                                                                                                                                                                                                 │
│ Going to respond to replica 1 with 0 parts: []. Finish: true; mine_marks=0, stolen_by_hash=0, stolen_rest=0                                                                                                                                                │
│ Handling request from replica 3, minimal marks size is 240                                                                                                                                                                                                 │
│ Going to respond to replica 3 with 0 parts: []. Finish: true; mine_marks=0, stolen_by_hash=0, stolen_rest=0                                                                                                                                                │
│ (c-crimson-vd-86-server-rdhnsx3-0.c-crimson-vd-86-server-headless.ns-crimson-vd-86.svc.cluster.local:9000) Cancelling query because enough data has been read                                                                                              │
│ Read 81920 rows, 5.16 MiB in 0.013166 sec., 6222087.194288318 rows/sec., 391.63 MiB/sec.                                                                                                                                                                   │
│ Coordination done: Statistics: replica 0 - {requests: 2 marks: 0 assigned_to_me: 0 stolen_by_hash: 0 stolen_unassigned: 0}; replica 1 - {requests: 2 marks: 0 assigned_to_me: 0 stolen_by_hash: 0 stolen_unassigned: 0}; replica 2 - {requests: 2 marks: 0 assigned_to_me: 0 stolen_by_hash: 0 stolen_unassigned: 0}; replica 3 - {requests: 2 marks: 0 assigned_to_me: 0 stolen_by_hash: 0 stolen_unassigned: 0}; replica 4 - {requests: 3 marks: 244 assigned_to_me: 0 stolen_by_hash: 54 stolen_unassigned: 190}; replica 5 - {requests: 2 marks: 0 assigned_to_me: 0 stolen_by_hash: 0 stolen_unassigned: 0} │
│ Peak memory usage (for query): 1.81 MiB.                                                                                                                                                                                                                   │
│ Processed in 0.024095586 sec.                                                                                                                                                                                                                              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
</details>

Finally, you can also use the `EXPLAIN PIPELINE`. It highlights how ClickHouse 
is going to execute a query and what resources are going to be used for the 
execution of the query. Let’s take the following query for example:

```sql
SELECT count(), uniq(pageId) , min(timestamp), max(timestamp) 
FROM session_events 
WHERE type='type3' 
GROUP BY toYear(timestamp) LIMIT 10
```

Let’s have a look at the query pipeline without parallel replica:

```sql title="EXPLAIN PIPELINE (without parallel replica)"
EXPLAIN PIPELINE graph = 1, compact = 0 
SELECT count(), uniq(pageId) , min(timestamp), max(timestamp) 
FROM session_events 
WHERE type='type3' 
GROUP BY toYear(timestamp) 
LIMIT 10 
SETTINGS allow_experimental_parallel_reading_from_replicas=0 
FORMAT TSV;
```

![EXPLAIN without parallel_replica](@site/docs/en/deployment-guides/images/parallel-replicas-7.png)

And now with parallel replica:

```sql title="EXPLAIN PIPELINE (with parallel replica)"
EXPLAIN PIPELINE graph = 1, compact = 0 
SELECT count(), uniq(pageId) , min(timestamp), max(timestamp) 
FROM session_events 
WHERE type='type3' 
GROUP BY toYear(timestamp) 
LIMIT 10 
SETTINGS allow_experimental_parallel_reading_from_replicas=2 
FORMAT TSV;
```

![EXPLAIN without parallel_replica](@site/docs/en/deployment-guides/images/parallel-replicas-8.png)
