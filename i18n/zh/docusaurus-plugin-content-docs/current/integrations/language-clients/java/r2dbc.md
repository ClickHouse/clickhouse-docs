---
sidebar_label: 'R2DBC 驱动程序'
sidebar_position: 5
keywords: ['clickhouse', 'java', 'driver', 'integrate', 'r2dbc']
description: 'ClickHouse R2DBC 驱动程序'
slug: /integrations/java/r2dbc
title: 'R2DBC 驱动程序'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# R2DBC 驱动程序



## R2DBC 驱动

基于 [R2DBC](https://r2dbc.io/) 的 ClickHouse 异步 Java 客户端封装。

### 环境要求

* [OpenJDK](https://openjdk.java.net) 版本 &gt;= 8

### 安装与配置

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <!-- 若使用 SPI 0.9.1.RELEASE,请改为 clickhouse-r2dbc_0.9.1 -->
    <artifactId>clickhouse-r2dbc</artifactId>
    <version>0.7.1</version>
    <!-- 使用包含所有依赖的 uber jar;如需更小的 jar 包,可将 classifier 改为 http 或 grpc -->
    <classifier>all</classifier>
    <exclusions>
        <exclusion>
            <groupId>*</groupId>
            <artifactId>*</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 连接 ClickHouse

```java showLineNumbers
ConnectionFactory connectionFactory = ConnectionFactories
    .get("r2dbc:clickhouse:http://{username}:{password}@{host}:{port}/{database}");

    Mono.from(connectionFactory.create())
        .flatMapMany(connection -> connection
```

### 查询

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

### INSERT 语句

```java showLineNumbers
connection
    .createStatement("insert into clickdb.clicks values (:domain, :path, :cdate, :count)")
    .bind("domain", click.getDomain())
    .bind("path", click.getPath())
    .bind("cdate", LocalDateTime.now())
    .bind("count", 1)
    .execute();
```
