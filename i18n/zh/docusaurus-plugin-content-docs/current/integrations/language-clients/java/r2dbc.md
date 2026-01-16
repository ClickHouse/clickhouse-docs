---
sidebar_label: 'R2DBC 驱动'
sidebar_position: 5
keywords: ['clickhouse', 'java', '驱动', '集成', 'r2dbc']
description: 'ClickHouse R2DBC 驱动程序'
slug: /integrations/java/r2dbc
title: 'R2DBC 驱动'
doc_type: 'reference'
integration:
  - support_level: '核心'
  - category: '语言客户端'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# R2DBC 驱动 \\{#r2dbc-driver\\}

## R2DBC 驱动程序 \\{#r2dbc-driver\\}

基于 ClickHouse 异步 Java 客户端的 [R2DBC](https://r2dbc.io/) 封装。

### 环境要求 \\{#environment-requirements\\}

- [OpenJDK](https://openjdk.java.net) 8 或更高版本

### 设置 \\{#setup\\}

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <!-- change to clickhouse-r2dbc_0.9.1 for SPI 0.9.1.RELEASE -->
    <artifactId>clickhouse-r2dbc</artifactId>
    <version>0.7.1</version>
    <!-- use uber jar with all dependencies included, change classifier to http or grpc for smaller jar -->
    <classifier>all</classifier>
    <exclusions>
        <exclusion>
            <groupId>*</groupId>
            <artifactId>*</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 连接 ClickHouse \\{#connect-to-clickhouse\\}

```java showLineNumbers
ConnectionFactory connectionFactory = ConnectionFactories
    .get("r2dbc:clickhouse:http://{username}:{password}@{host}:{port}/{database}");

    Mono.from(connectionFactory.create())
        .flatMapMany(connection -> connection
```

### Query \\{#query\\}

```java showLineNumbers
connection
    .createStatement("select domain, path,  toDate(cdate) as d, count(1) as count from clickdb.clicks where domain = :domain group by domain, path, d")
    .bind("domain", domain)
    .execute()
    .flatMap(result -> result
    .map((row, rowMetadata) -> String.format("%s%s[%s]:%d", row.get("domain", String.class),
        row.get("path", String.class),
        row.get("d", LocalDate.class),
        row.get("count", Long.class)))
    )
    .doOnNext(System.out::println)
    .subscribe();
```

### Insert \\{#insert\\}

```java showLineNumbers
connection
    .createStatement("insert into clickdb.clicks values (:domain, :path, :cdate, :count)")
    .bind("domain", click.getDomain())
    .bind("path", click.getPath())
    .bind("cdate", LocalDateTime.now())
    .bind("count", 1)
    .execute();
```
