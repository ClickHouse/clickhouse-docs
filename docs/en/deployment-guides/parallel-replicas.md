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

In a shared-nothing architecture, it’s very common to have a cluster split into
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

Now, let’s see how it works in practice:

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

Let’s assume we are in a situation where all replicas sent an announcement with
all the parts. Let’s see how the dynamic coordination works:

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

| Limitation  | Description |
|-------------|-------------|
|Complex Query| Currently parallel replica works fairly well for simple queries, complexity layer like CTEs, subqueries, JOINs, non-flat query, etc… can have a negative impact on query performance.|

### Small Queries

If you are executing a query that does not process a lot of rows, executing it
on multiple replicas might not yield a better performance time, given that, the
network time for the coordination between replicas can lead to additional cycles
in the query execution. You can limit these issues by using the setting:
[`parallel_replicas_min_number_of_rows_per_replica`](/docs/en/operations/settings/settings#parallel_replicas_min_number_of_rows_per_replica).

<!--
### Parallel replicas is disabled with FINAL

-->

### High Cardinality Data and Complex Aggregation

High cardinality aggregation that needs to send much data can significantly slow down your queries.

### Compatibility with the New Analyzer

The new analyzer might significantly slow down or speed up query execution in specific scenarios.

## Settings Related to Parallel Replicas