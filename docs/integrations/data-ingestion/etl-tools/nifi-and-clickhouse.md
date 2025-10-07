---
sidebar_label: 'NiFi'
sidebar_position: 12
keywords: ['clickhouse', 'NiFi', 'connect', 'integrate', 'etl', 'data integration']
slug: /integrations/nifi
description: 'Stream data into ClickHouse using NiFi data pipelines'
title: 'Connect Apache NiFi to ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import nifi01 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_01.png';
import nifi02 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_02.png';
import nifi03 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_03.png';
import nifi04 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_04.png';
import nifi05 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_05.png';
import nifi06 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_06.png';
import nifi07 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_07.png';
import nifi08 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_08.png';
import nifi09 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_09.png';
import nifi10 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_10.png';
import nifi11 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_11.png';
import nifi12 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_12.png';
import nifi13 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_13.png';
import nifi14 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_14.png';
import nifi15 from '@site/static/images/integrations/data-ingestion/etl-tools/nifi_15.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Connect Apache NiFi to ClickHouse

<CommunityMaintainedBadge/>

<a href="https://nifi.apache.org/" target="_blank">Apache NiFi</a> is an open-source workflow management software designed to automate data flow between software systems. It allows the creation of ETL data pipelines and is shipped with more than 300 data processors. This step-by-step tutorial shows how to connect Apache NiFi to ClickHouse as both a source and destination, and to load a sample dataset.

## 1. Gather your connection details {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Download and run Apache NiFi {#2-download-and-run-apache-nifi}

1. For a new setup, download the binary from https://nifi.apache.org/download.html and start by running `./bin/nifi.sh start`

## 3. Download the ClickHouse JDBC driver {#3-download-the-clickhouse-jdbc-driver}

1. Visit the <a href="https://github.com/ClickHouse/clickhouse-java/releases" target="_blank">ClickHouse JDBC driver release page</a> on GitHub and look for  the latest JDBC release version
2. In the release version, click on "Show all xx assets" and look for the JAR file containing the keyword "shaded" or "all", for example, `clickhouse-jdbc-0.5.0-all.jar`
3. Place the JAR file in a folder accessible by Apache NiFi and take note of the absolute path

## 4. Add `DBCPConnectionPool` Controller Service and configure its properties {#4-add-dbcpconnectionpool-controller-service-and-configure-its-properties}

1. To configure a Controller Service in Apache NiFi, visit the NiFi Flow Configuration page by clicking on the "gear" button

    <Image img={nifi01} size="sm" border alt="NiFi Flow Configuration page with gear button highlighted" />

2. Select the Controller Services tab and add a new Controller Service by clicking on the `+` button at the top right

    <Image img={nifi02} size="lg" border alt="Controller Services tab with add button highlighted" />

3. Search for `DBCPConnectionPool` and click on the "Add" button

    <Image img={nifi03} size="lg" border alt="Controller Service selection dialog with DBCPConnectionPool highlighted" />

4. The newly added `DBCPConnectionPool` will be in an Invalid state by default. Click on the "gear" button to start configuring

    <Image img={nifi04} size="lg" border alt="Controller Services list showing invalid DBCPConnectionPool with gear button highlighted" />

5. Under the "Properties" section, input the following values

  | Property                    | Value                                                              | Remark                                                                        |
  | --------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
  | Database Connection URL     | jdbc:ch:https://HOSTNAME:8443/default?ssl=true                     | Replace HOSTNAME in the connection URL accordingly                            |
  | Database Driver Class Name  | com.clickhouse.jdbc.ClickHouseDriver                               ||
  | Database Driver Location(s) | /etc/nifi/nifi-X.XX.X/lib/clickhouse-jdbc-0.X.X-patchXX-shaded.jar | Absolute path to the ClickHouse JDBC driver JAR file                          |
  | Database User               | default                                                            | ClickHouse username                                                           |
  | Password                    | password                                                 | ClickHouse password                                                           |

6. In the Settings section, change the name of the Controller Service to "ClickHouse JDBC" for easy reference

    <Image img={nifi05} size="lg" border alt="DBCPConnectionPool configuration dialog showing properties filled in" />

7. Activate the `DBCPConnectionPool` Controller Service by clicking on the "lightning" button and then the "Enable" button

    <Image img={nifi06} size="lg" border alt="Controller Services list with lightning button highlighted" />

    <br/>

    <Image img={nifi07} size="lg" border alt="Enable Controller Service confirmation dialog" />

8. Check the Controller Services tab and ensure that the Controller Service is enabled

    <Image img={nifi08} size="lg" border alt="Controller Services list showing enabled ClickHouse JDBC service" />

## 5. Read from a table using the `ExecuteSQL` processor {#5-read-from-a-table-using-the-executesql-processor}

1. Add an ​`​ExecuteSQL` processor, along with the appropriate upstream and downstream processors

    <Image img={nifi09} size="md" border alt="NiFi canvas showing ExecuteSQL processor in a workflow" />

2. Under the "Properties" section of the ​`​ExecuteSQL` processor, input the following values

    | Property                            | Value                                | Remark                                                  |
    |-------------------------------------|--------------------------------------|---------------------------------------------------------|
    | Database Connection Pooling Service | ClickHouse JDBC                      | Select the Controller Service configured for ClickHouse |
    | SQL select query                    | SELECT * FROM system.metrics         | Input your query here                                   |

3. Start the `​​ExecuteSQL` processor

    <Image img={nifi10} size="lg" border alt="ExecuteSQL processor configuration with properties filled in" />

4. To confirm that the query has been processed successfully, inspect one of the `FlowFile` in the output queue

    <Image img={nifi11} size="lg" border alt="List queue dialog showing flowfiles ready for inspection" />

5. Switch view to "formatted" to view the result of the output `FlowFile`

    <Image img={nifi12} size="lg" border alt="FlowFile content viewer showing query results in formatted view" />

## 6. Write to a table using `MergeRecord` and `PutDatabaseRecord` processor {#6-write-to-a-table-using-mergerecord-and-putdatabaserecord-processor}

1. To write multiple rows in a single insert, we first need to merge multiple records into a single record. This can be done using the `MergeRecord` processor

2. Under the "Properties" section of the `MergeRecord` processor, input the following values

    | Property                  | Value             | Remark                                                                                                                          |
    |---------------------------|-------------------|---------------------------------------------------------------------------------------------------------------------------------|
    | Record Reader             | `JSONTreeReader`    | Select the appropriate record reader                                                                                            |
    | Record Writer             | `JSONReadSetWriter` | Select the appropriate record writer                                                                                            |
    | Minimum Number of Records | 1000              | Change this to a higher number so that the minimum number of rows are merged to form a single record. Default to 1 row |
    | Maximum Number of Records | 10000             | Change this to a higher number than "Minimum Number of Records". Default to 1,000 rows                                         |

3. To confirm that multiple records are merged into one, examine the input and output of the `MergeRecord` processor. Note that the output is an array of multiple input records

    Input
    <Image img={nifi13} size="sm" border alt="MergeRecord processor input showing single records" />

    Output
    <Image img={nifi14} size="sm" border alt="MergeRecord processor output showing merged array of records" />

4. Under the "Properties" section of the `PutDatabaseRecord` processor, input the following values

    | Property                            | Value           | Remark                                                                                                                                   |
    | ----------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
    | Record Reader                       | `JSONTreeReader`  | Select the appropriate record reader                                                                                                     |
    | Database Type                       | Generic         | Leave as default                                                                                                                         |
    | Statement Type                      | INSERT          |                                                                                                                                          |
    | Database Connection Pooling Service | ClickHouse JDBC | Select the ClickHouse controller service                                                                                                 |
    | Table Name                          | tbl             | Input your table name here                                                                                                               |
    | Translate Field Names               | false           | Set to "false" so that field names inserted must match the column name                                                                                      |
    | Maximum Batch Size                  | 1000            | Maximum number of rows per insert. This value should not be lower than the value of "Minimum Number of Records" in `MergeRecord` processor |

4. To confirm that each insert contains multiple rows, check that the row count in the table is incrementing by at least the value of "Minimum Number of Records" defined in `MergeRecord`.

    <Image img={nifi15} size="sm" border alt="Query results showing row count in the destination table" />

5. Congratulations - you have successfully loaded your data into ClickHouse using Apache NiFi !
