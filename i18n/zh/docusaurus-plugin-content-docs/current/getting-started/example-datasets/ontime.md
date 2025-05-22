该数据集包含来自交通统计局的数据。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE `ontime`
(
    `Year`                            UInt16,
    `Quarter`                         UInt8,
    `Month`                           UInt8,
    `DayofMonth`                      UInt8,
    `DayOfWeek`                       UInt8,
    `FlightDate`                      Date,
    `Reporting_Airline`               LowCardinality(String),
    `DOT_ID_Reporting_Airline`        Int32,
    `IATA_CODE_Reporting_Airline`     LowCardinality(String),
    `Tail_Number`                     LowCardinality(String),
    `Flight_Number_Reporting_Airline` LowCardinality(String),
    `OriginAirportID`                 Int32,
    `OriginAirportSeqID`              Int32,
    `OriginCityMarketID`              Int32,
    `Origin`                          FixedString(5),
    `OriginCityName`                  LowCardinality(String),
    `OriginState`                     FixedString(2),
    `OriginStateFips`                 FixedString(2),
    `OriginStateName`                 LowCardinality(String),
    `OriginWac`                       Int32,
    `DestAirportID`                   Int32,
    `DestAirportSeqID`                Int32,
    `DestCityMarketID`                Int32,
    `Dest`                            FixedString(5),
    `DestCityName`                    LowCardinality(String),
    `DestState`                       FixedString(2),
    `DestStateFips`                   FixedString(2),
    `DestStateName`                   LowCardinality(String),
    `DestWac`                         Int32,
    `CRSDepTime`                      Int32,
    `DepTime`                         Int32,
    `DepDelay`                        Int32,
    `DepDelayMinutes`                 Int32,
    `DepDel15`                        Int32,
    `DepartureDelayGroups`            LowCardinality(String),
    `DepTimeBlk`                      LowCardinality(String),
    `TaxiOut`                         Int32,
    `WheelsOff`                       LowCardinality(String),
    `WheelsOn`                        LowCardinality(String),
    `TaxiIn`                          Int32,
    `CRSArrTime`                      Int32,
    `ArrTime`                         Int32,
    `ArrDelay`                        Int32,
    `ArrDelayMinutes`                 Int32,
    `ArrDel15`                        Int32,
    `ArrivalDelayGroups`              LowCardinality(String),
    `ArrTimeBlk`                      LowCardinality(String),
    `Cancelled`                       Int8,
    `CancellationCode`                FixedString(1),
    `Diverted`                        Int8,
    `CRSElapsedTime`                  Int32,
    `ActualElapsedTime`               Int32,
    `AirTime`                         Int32,
    `Flights`                         Int32,
    `Distance`                        Int32,
    `DistanceGroup`                   Int8,
    `CarrierDelay`                    Int32,
    `WeatherDelay`                    Int32,
    `NASDelay`                        Int32,
    `SecurityDelay`                   Int32,
    `LateAircraftDelay`               Int32,
    `FirstDepTime`                    Int16,
    `TotalAddGTime`                   Int16,
    `LongestAddGTime`                 Int16,
    `DivAirportLandings`              Int8,
    `DivReachedDest`                  Int8,
    `DivActualElapsedTime`            Int16,
    `DivArrDelay`                     Int16,
    `DivDistance`                     Int16,
    `Div1Airport`                     LowCardinality(String),
    `Div1AirportID`                   Int32,
    `Div1AirportSeqID`                Int32,
    `Div1WheelsOn`                    Int16,
    `Div1TotalGTime`                  Int16,
    `Div1LongestGTime`                Int16,
    `Div1WheelsOff`                   Int16,
    `Div1TailNum`                     LowCardinality(String),
    `Div2Airport`                     LowCardinality(String),
    `Div2AirportID`                   Int32,
    `Div2AirportSeqID`                Int32,
    `Div2WheelsOn`                    Int16,
    `Div2TotalGTime`                  Int16,
    `Div2LongestGTime`                Int16,
    `Div2WheelsOff`                   Int16,
    `Div2TailNum`                     LowCardinality(String),
    `Div3Airport`                     LowCardinality(String),
    `Div3AirportID`                   Int32,
    `Div3AirportSeqID`                Int32,
    `Div3WheelsOn`                    Int16,
    `Div3TotalGTime`                  Int16,
    `Div3LongestGTime`                Int16,
    `Div3WheelsOff`                   Int16,
    `Div3TailNum`                     LowCardinality(String),
    `Div4Airport`                     LowCardinality(String),
    `Div4AirportID`                   Int32,
    `Div4AirportSeqID`                Int32,
    `Div4WheelsOn`                    Int16,
    `Div4TotalGTime`                  Int16,
    `Div4LongestGTime`                Int16,
    `Div4WheelsOff`                   Int16,
    `Div4TailNum`                     LowCardinality(String),
    `Div5Airport`                     LowCardinality(String),
    `Div5AirportID`                   Int32,
    `Div5AirportSeqID`                Int32,
    `Div5WheelsOn`                    Int16,
    `Div5TotalGTime`                  Int16,
    `Div5LongestGTime`                Int16,
    `Div5WheelsOff`                   Int16,
    `Div5TailNum`                     LowCardinality(String)
) ENGINE = MergeTree
  ORDER BY (Year, Quarter, Month, DayofMonth, FlightDate, IATA_CODE_Reporting_Airline);
```

## 从原始数据导入 {#import-from-raw-data}

下载数据：

```bash
wget --no-check-certificate --continue https://transtats.bts.gov/PREZIP/On_Time_Reporting_Carrier_On_Time_Performance_1987_present_{1987..2022}_{1..12}.zip
```

使用多个线程加载数据：

```bash
ls -1 *.zip | xargs -I{} -P $(nproc) bash -c "echo {}; unzip -cq {} '*.csv' | sed 's/\.00//g' | clickhouse-client --input_format_csv_empty_as_default 1 --query='INSERT INTO ontime FORMAT CSVWithNames'"
```

（如果您的服务器内存不足或遇到其他问题，请移除 `-P $(nproc)` 部分）

## 从保存的副本导入 {#import-from-a-saved-copy}

或者，您可以通过以下查询从保存的副本导入数据：

```sql
INSERT INTO ontime SELECT * FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/ontime/csv_by_year/*.csv.gz', CSVWithNames) SETTINGS max_insert_threads = 40;
```

快照创建于 2022-05-29。

## 查询 {#queries}

Q0.

```sql
SELECT avg(c1)
FROM
(
    SELECT Year, Month, count(*) AS c1
    FROM ontime
    GROUP BY Year, Month
);
```

Q1. 从2000年到2008年每天的航班数量

```sql
SELECT DayOfWeek, count(*) AS c
FROM ontime
WHERE Year>=2000 AND Year<=2008
GROUP BY DayOfWeek
ORDER BY c DESC;
```

Q2. 2000-2008年每周航班延误超过10分钟的数量

```sql
SELECT DayOfWeek, count(*) AS c
FROM ontime
WHERE DepDelay>10 AND Year>=2000 AND Year<=2008
GROUP BY DayOfWeek
ORDER BY c DESC;
```

Q3. 2000-2008年按机场统计的延误数量

```sql
SELECT Origin, count(*) AS c
FROM ontime
WHERE DepDelay>10 AND Year>=2000 AND Year<=2008
GROUP BY Origin
ORDER BY c DESC
LIMIT 10;
```

Q4. 2007年按航空公司统计的延误数量

```sql
SELECT IATA_CODE_Reporting_Airline AS Carrier, count(*)
FROM ontime
WHERE DepDelay>10 AND Year=2007
GROUP BY Carrier
ORDER BY count(*) DESC;
```

Q5. 2007年按航空公司统计的延误百分比

```sql
SELECT Carrier, c, c2, c*100/c2 as c3
FROM
(
    SELECT
        IATA_CODE_Reporting_Airline AS Carrier,
        count(*) AS c
    FROM ontime
    WHERE DepDelay>10
        AND Year=2007
    GROUP BY Carrier
) q
JOIN
(
    SELECT
        IATA_CODE_Reporting_Airline AS Carrier,
        count(*) AS c2
    FROM ontime
    WHERE Year=2007
    GROUP BY Carrier
) qq USING Carrier
ORDER BY c3 DESC;
```

更优版本的相同查询：

```sql
SELECT IATA_CODE_Reporting_Airline AS Carrier, avg(DepDelay>10)*100 AS c3
FROM ontime
WHERE Year=2007
GROUP BY Carrier
ORDER BY c3 DESC
```

Q6. 之前对更广泛年份范围（2000-2008）的请求

```sql
SELECT Carrier, c, c2, c*100/c2 as c3
FROM
(
    SELECT
        IATA_CODE_Reporting_Airline AS Carrier,
        count(*) AS c
    FROM ontime
    WHERE DepDelay>10
        AND Year>=2000 AND Year<=2008
    GROUP BY Carrier
) q
JOIN
(
    SELECT
        IATA_CODE_Reporting_Airline AS Carrier,
        count(*) AS c2
    FROM ontime
    WHERE Year>=2000 AND Year<=2008
    GROUP BY Carrier
) qq USING Carrier
ORDER BY c3 DESC;
```

更优版本的相同查询：

```sql
SELECT IATA_CODE_Reporting_Airline AS Carrier, avg(DepDelay>10)*100 AS c3
FROM ontime
WHERE Year>=2000 AND Year<=2008
GROUP BY Carrier
ORDER BY c3 DESC;
```

Q7. 按年份统计延误超过10分钟的航班百分比

```sql
SELECT Year, c1/c2
FROM
(
    select
        Year,
        count(*)*100 as c1
    from ontime
    WHERE DepDelay>10
    GROUP BY Year
) q
JOIN
(
    select
        Year,
        count(*) as c2
    from ontime
    GROUP BY Year
) qq USING (Year)
ORDER BY Year;
```

更优版本的相同查询：

```sql
SELECT Year, avg(DepDelay>10)*100
FROM ontime
GROUP BY Year
ORDER BY Year;
```

Q8. 按直接连接城市数量统计的不同年份范围内最受欢迎的目的地

```sql
SELECT DestCityName, uniqExact(OriginCityName) AS u
FROM ontime
WHERE Year >= 2000 and Year <= 2010
GROUP BY DestCityName
ORDER BY u DESC LIMIT 10;
```

Q9.

```sql
SELECT Year, count(*) AS c1
FROM ontime
GROUP BY Year;
```

Q10.

```sql
SELECT
   min(Year), max(Year), IATA_CODE_Reporting_Airline AS Carrier, count(*) AS cnt,
   sum(ArrDelayMinutes>30) AS flights_delayed,
   round(sum(ArrDelayMinutes>30)/count(*),2) AS rate
FROM ontime
WHERE
   DayOfWeek NOT IN (6,7) AND OriginState NOT IN ('AK', 'HI', 'PR', 'VI')
   AND DestState NOT IN ('AK', 'HI', 'PR', 'VI')
   AND FlightDate < '2010-01-01'
GROUP by Carrier
HAVING cnt>100000 and max(Year)>1990
ORDER by rate DESC
LIMIT 1000;
```

额外：

```sql
SELECT avg(cnt)
FROM
(
    SELECT Year,Month,count(*) AS cnt
    FROM ontime
    WHERE DepDel15=1
    GROUP BY Year,Month
);

SELECT avg(c1) FROM
(
    SELECT Year,Month,count(*) AS c1
    FROM ontime
    GROUP BY Year,Month
);

SELECT DestCityName, uniqExact(OriginCityName) AS u
FROM ontime
GROUP BY DestCityName
ORDER BY u DESC
LIMIT 10;

SELECT OriginCityName, DestCityName, count() AS c
FROM ontime
GROUP BY OriginCityName, DestCityName
ORDER BY c DESC
LIMIT 10;

SELECT OriginCityName, count() AS c
FROM ontime
GROUP BY OriginCityName
ORDER BY c DESC
LIMIT 10;
```

您还可以在 Playground 中玩转这些数据， [示例](https://sql.clickhouse.com?query_id=M4FSVBVMSHY98NKCQP8N4K)。

此性能测试由 Vadim Tkachenko 创建。请参见：

- https://www.percona.com/blog/2009/10/02/analyzing-air-traffic-performance-with-infobright-and-monetdb/
- https://www.percona.com/blog/2009/10/26/air-traffic-queries-in-luciddb/
- https://www.percona.com/blog/2009/11/02/air-traffic-queries-in-infinidb-early-alpha/
- https://www.percona.com/blog/2014/04/21/using-apache-hadoop-and-impala-together-with-mysql-for-data-analysis/
- https://www.percona.com/blog/2016/01/07/apache-spark-with-air-ontime-performance-data/
- http://nickmakos.blogspot.ru/2012/08/analyzing-air-traffic-performance-with.html
