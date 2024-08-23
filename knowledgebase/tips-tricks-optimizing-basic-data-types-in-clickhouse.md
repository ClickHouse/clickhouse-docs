---
title: Tips and tricks on optimizing basic data types in ClickHouse
description: “Tips and tricks on optimizing basic data types in ClickHouse“
date: 2024-07-02
---

# Tips and tricks on optimizing basic data types in ClickHouse

### Question

What data types should I use in ClickHouse to optimize my queries for speed and storage?

### Answer

Many times when using an automated conversion from another system or trying to choose a data type, users will often choose the "more is better" or "choose what's easier" or "choose the most generic" approaches.  This will likely work for small datasets in the millions, maybe even billions of rows.  It may not be noticeable and is acceptable for those type of sets where users' queries difference is small in their use-cases.

It will not be acceptable, however, as the data grows and becomes more noticeable.

The difference between a query taking 50ms and 500ms may be okay for most use-cases, for example in a webUI, but one is 10x slower than the other, even though for a front-end user, is not very noticeable. 

Example initial table:
```
timestamp Datetime64(9),
group_id Int64,
vendor_id String,
product_id String,
category1 Int64,
code_name String,
paid_status String,
country_code String,
description String,
price Float64,
attributes Map(String, String)
```

Sample data:
```
3456, 0123456789, bd6087b7-6026-4974-9122-bc99faae5d84, "2024-03-01 01:00:01.000", 98, "bear", paid", "us", "corvette model car", 123.45, {"color" : "blue", "size" : "S"}
156, 0000012345, bd6087b7-6026-4974-9122-bc99faae5d84, "2024-03-01 01:00:02:123", 45, "tiger", "not paid", "uk", "electric car", 53432.10, {"color" : "red", "model" : "X"} 
...
```

Below are some recommendations where this data could be optimized:

`timestamp : DateTime64(9)`  
Unless needing scientific precision, a value of 9 precision (nanoseconds), is unlikely necessary. Possibly could be for display or ordering, but usually not in queries for searching, primary keys, etc.
+ **Recommendation:**  
For PK, order by:  DateTime  
For display or ordering: add additional column - i.e. `timestamp_microseconds : DateTime64(6)`  

`group_id : Int64`  
This appears to be an integer, select the smallest integer type that will fit the max number for the column required.  From this sample dataset and name of the column, it is unlikely to need a quintillion values, probably an Int16 would work where it could have up to 16k values.
- **Recommendation**: Int16

`vendor_id : String`  
This column looks like to be a number but has leading zeros, likely important to keep formatting. Also appears to be only a certain number of chars.
- **Recommendation**: FixedString(10)

`product_id : String`  
This one is alphanumeric so intuitively would be a string, however, it is also a UUID. 
- **Recommendation**: UUID

`category1 : Int64`  
The values are small, probably not very many categories and not looking to grow very much or limited. Less than 255
- **Recommendation**: UInt8

`code_name : String`  
This field looks like it may have only a limited number of strings that would be used.
For this kind of situation where the number of string values might be in the hundreds or thousands, low cardinality fields help.
- **Recommendation**: LowCardinality(String)

`paid_status : String`  
There is a string value of "paid" or "not_paid". For situations where there may be only two values, use a boolean.
- **Recommendation**: Bool

`country_code : String`  
Sometimes there are columns which meet multiple optimizations. In this example, there are only a certain number of country codes and they are all two character identifiers.
- **Recommendation**: LowCardinality(FixedString(2))

`price : Float64`  
Floats are not recommended when there is a fixed precision that is known, especially for financial data and calculations. Best is to use Decimal types for the precision necessary. For this use-case, it is likely that the price of the item is not over 999,999.00
- **Recommendation**: Decimal(10,2)

`attributes : map`  
Often there might be a table with dynamic attributes in maps. Searching for keys or values is usually slower. There’s a couple of ways that the maps can be made faster. If there are keys that will be present in most records, best to place those in a separate column as low cardinality and those that will be sparse in another column high cardinality. From there, it will be more efficient to create skip indexes although it may increase the complexity of the queries.
- **Recommendation:** lc_attributes: Map(String, String), hc_attributes: Map(String, String).  

Depending on the queries, the options that can also be used to create a skip index and/or extract the attributes are:  
Using Array Join to extract into columns using a Materialized View:
https://clickhouse.com/docs/knowledgebase/using-array-join-to-extract-and-query-attributes  
Using a skip index for the keys:
https://clickhouse.com/docs/knowledgebase/improve-map-performance