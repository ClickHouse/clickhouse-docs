---
sidebar_label: Tab Separated Value (TSV)
---

# Tab Separated Value
Tab separated value, or TSV, files are common and may include field headings as the first line of the file. ClickHouse can ingest TSVs, and also can query TSVs without ingesting the files.  This guide covers both of these cases.

The dataset used in this guide comes from the NYC Open Data team, and contains data about "all valid felony, misdemeanor, and violation crimes reported to the New York City Police Department (NYPD)". At the time of writing, the data file is 166MB, but it is updated regularly.

**Source**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**Terms of use**: https://www1.nyc.gov/home/terms-of-use.page

## Prerequisites
- Install [ClickHouse server and client](../../getting-started/install.md).
- Download the dataset by visiting the [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) page, clicking the Export button, and choosing **TSV for Excel**.

## Familiarize yourself with the TSV file

Before starting to work with the ClickHouse database familiarize yourself with the data. 

:::note
The examples in this guide assume that you have saved the TSV file to `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`
:::

```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
FORMAT PrettyCompact"
```

```response
CMPLNT_NUM                  Nullable(Float64)					
ADDR_PCT_CD                 Nullable(Float64)					
BORO_NM                     Nullable(String)					
CMPLNT_FR_DT                Nullable(String)					
CMPLNT_FR_TM                Nullable(String)					
CMPLNT_TO_DT                Nullable(String)					
CMPLNT_TO_TM                Nullable(String)					
CRM_ATPT_CPTD_CD            Nullable(String)					
HADEVELOPT                  Nullable(String)					
HOUSING_PSA                 Nullable(Float64)					
JURISDICTION_CODE	        Nullable(Float64)					
JURIS_DESC                  Nullable(String)					
KY_CD                       Nullable(Float64)					
LAW_CAT_CD                  Nullable(String)					
LOC_OF_OCCUR_DESC    	    Nullable(String)					
OFNS_DESC                   Nullable(String)					
PARKS_NM                    Nullable(String)					
PATROL_BORO                 Nullable(String)					
PD_CD                       Nullable(Float64)					
PD_DESC                     Nullable(String)					
PREM_TYP_DESC               Nullable(String)					
RPT_DT                      Nullable(String)					
STATION_NAME                Nullable(String)					
SUSP_AGE_GROUP              Nullable(String)					
SUSP_RACE                   Nullable(String)					
SUSP_SEX                    Nullable(String)					
TRANSIT_DISTRICT        	Nullable(Float64)					
VIC_AGE_GROUP               Nullable(String)					
VIC_RACE                    Nullable(String)					
VIC_SEX                     Nullable(String)					
X_COORD_CD                  Nullable(Float64)					
Y_COORD_CD                  Nullable(Float64)					
Latitude                    Nullable(Float64)					
Longitude                   Nullable(Float64)					
Lat_Lon                     Tuple(Nullable(Float64), Nullable(Float64))					
New Georeferenced Column	Nullable(String)	
```

At this point you can see that the columns in the TSV file match the names specified in the **Columns in this Dataset** section of the [dataset web page](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243).  The data types are not very specific, all numeric fields are set to `Nullable(Float64)`, and all other fields are `Nullable(String)`.  This will be fixed during ingest.

In order to figure out what types should be used for the fields it is necessary to know what the data looks like. For example, the field `JURISDICTION_CODE` is a `Float64`: should it be an `UInt8`, or an `Enum`, or is `Float64` appropriate?

```sql
clickhouse-local --query \
"select JURISDICTION_CODE, count() FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
 GROUP BY JURISDICTION_CODE
 ORDER BY JURISDICTION_CODE
 FORMAT PrettyCompact"
```

```response
0	405131
1	8958
2	32178
3	1473
4	101
6	12
7	8
9	6
11	44
12	8
13	10
14	192
15	20
72	270
85	5
87	11
88	198
97	881
```

The query response shows that the `JURISDICTION_CODE` fits well in an `UInt8`.

Similarly, look at some of the `String` fields and see if they are well suited to being `DateTime` or `LowCardinality(String)` fields.

For example, the field `PARKS_NM` is described as "Name of NYC park, playground or greenspace of occurrence, if applicable (state parks are not included)".  The number of parks in New York City may be a good candidate for a `LowCardinality(String)`:

```sh
clickhouse-local --query \
"select count(distinct PARKS_NM) FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
 FORMAT PrettyCompact"
```

```response
560
```

The dataset in use at the time of writing has 560 distinct parks and playgrounds in the `PARK_NM` column.  This is a small number based on the [LowCardinality](../../sql-reference/data-types/lowcardinality.md#lowcardinality-dscr) recommendation to stay below 10,000 distinct strings in a `LowCardinality(String)` field.

### DateTime fields
Based on the **Columns in this Dataset** section of the [dataset web page](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) there are date and time fields for the start and end of the reported event.  Looking at the min and max of the `CMPLNT_FR_DT` and `CMPLT_TO_DT` gives an idea of whether or not the fields are always populated:

```sh title="CMPLNT_FR_DT"
clickhouse-local --query \
"select min(CMPLNT_FR_DT), max(CMPLNT_FR_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
FORMAT PrettyCompact"
```

```response
┌─min(CMPLNT_FR_DT)─┬─max(CMPLNT_FR_DT)─┐
│ 01/01/1955        │ 12/31/2021        │
└───────────────────┴───────────────────┘
```

```sh title="CMPLNT_TO_DT"
clickhouse-local --query \
"select min(CMPLNT_TO_DT), max(CMPLNT_TO_DT) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
FORMAT PrettyCompact"
```

```response
┌─min(CMPLNT_TO_DT)─┬─max(CMPLNT_TO_DT)─┐
│                   │ 12/31/2021        │
└───────────────────┴───────────────────┘
```

```sh title="CMPLNT_FR_TM"
clickhouse-local --query \
"select min(CMPLNT_FR_TM), max(CMPLNT_FR_TM) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
FORMAT PrettyCompact"
```

```response
┌─min(CMPLNT_FR_TM)─┬─max(CMPLNT_FR_TM)─┐
│ 00:00:00          │ 23:59:00          │
└───────────────────┴───────────────────┘
```

```sh title="CMPLNT_TO_TM"
clickhouse-local --query \
"select min(CMPLNT_TO_TM), max(CMPLNT_TO_TM) FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
FORMAT PrettyCompact"
```

```response
┌─min(CMPLNT_TO_TM)─┬─max(CMPLNT_TO_TM)─┐
│                   │ 23:59:00          │
└───────────────────┴───────────────────┘
```
Based on the above:
- `JURISDICTION_CODE` should be cast as `UInt8`.
- `PARKS_NM` should be cast to `LowCardinality(String)`
- `CMPLNT_FR_DT` and `CMPLNT_FR_TM` are always populated (possibly with a default time of `00:00:00`)
- `CMPLNT_TO_DT` and `CMPLNT_TO_TM` may be empty
- Dates and times are stored in separate fields in the source
- Dates are `mm/dd/yyyy` format
- Times are `hh:mm:ss` format
- Dates and times can be concatenated into DateTime types
- There are some dates before January 1st 1970, which means we need a 64 bit DateTime

## Concatenate the date and time fields

To concatenate the date and time fields `CMPLNT_FR_DT` and `CMPLNT_FR_TM`, select the two fields joined by the concatenation operator: `CMPNT_FR_DT || ' ' || CMPLNT_FR_TM`

```sh
clickhouse-local --query \
"select CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM AS complaint_begin FROM
file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
LIMIT 10
FORMAT PrettyCompact"
```

```response
┌─complaint_begin─────┐
│ 12/17/2021 22:13:00 │
│ 12/17/2021 06:21:00 │
│ 12/13/2021 20:05:00 │
│ 12/07/2021 22:49:00 │
│ 12/06/2021 17:25:00 │
│ 12/05/2021 22:16:00 │
│ 12/01/2021 00:01:00 │
│ 11/13/2021 17:49:00 │
│ 11/05/2021 23:05:00 │
│ 10/28/2021 23:55:00 │
└─────────────────────┘
```
## Convert the date and time String to a DateTime64 type

Earlier in the guide we discovered that there are dates before January 1st 1970, which means that we need a 64 bit DateTime type for the dates.  Casting to `DateTime64` requires that we have a String representation of the DateTime, and we can convert the existing `MM/DD/YYYY hh:mm:ss` to `YYYY/MM/DD` using `replaceRegexpOne()`.

```sh
clickhouse-local --query \
"WITH (CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM) AS CMPLNT_START,
      (CMPLNT_TO_DT || ' ' || CMPLNT_TO_TM) AS CMPLNT_END
select parseDateTime64BestEffort(CMPLNT_START) AS complaint_begin,
       parseDateTime64BestEffortOrNull(CMPLNT_END) AS complaint_end
FROM file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
ORDER BY complaint_begin ASC
LIMIT 25
FORMAT PrettyCompact"
```

Lines 2 and 3 above contains the concatenation from the previous step, and lines 4 and 5 above parse the strings into `DateTime64`.  As the complaint end time is not guaranteed to exist `parseDateTime64BestEffortOrNull` is used.

```response
┌─────────complaint_begin─┬───────────complaint_end─┐
│ 1925-01-01 00:00:00.000 │ 2020-09-09 00:00:00.000 │
│ 1925-01-01 04:04:00.000 │ 2021-02-03 08:05:00.000 │
│ 1925-01-01 07:00:00.000 │ 2021-11-29 20:00:00.000 │
│ 1925-01-01 08:00:00.000 │ 2021-06-17 14:00:00.000 │
│ 1925-01-01 08:37:00.000 │ 2021-12-21 08:43:00.000 │
│ 1925-01-01 08:50:00.000 │ 2021-02-01 08:55:00.000 │
│ 1925-01-01 10:42:00.000 │ 2021-10-11 10:50:00.000 │
│ 1925-01-01 11:20:00.000 │ 2021-06-21 11:45:00.000 │
│ 1925-01-01 11:20:00.000 │ 2021-10-19 11:53:00.000 │
│ 1925-01-01 15:30:00.000 │ 2021-12-14 16:00:00.000 │
│ 1925-01-01 16:00:00.000 │ 2021-10-15 16:10:00.000 │
│ 1925-01-01 16:37:00.000 │                    ᴺᵁᴸᴸ │
│ 1925-01-01 18:57:00.000 │ 2021-11-07 18:57:00.000 │
│ 1925-01-01 21:00:00.000 │ 2021-05-17 21:00:00.000 │
│ 1925-01-01 21:00:00.000 │ 2021-09-07 21:14:00.000 │
│ 1925-01-01 22:00:00.000 │ 2021-07-01 08:00:00.000 │
│ 1925-01-01 23:47:00.000 │                    ᴺᵁᴸᴸ │
│ 1955-01-01 00:01:00.000 │ 1957-12-31 00:59:00.000 │
│ 1958-10-10 18:42:00.000 │ 2021-10-10 19:58:00.000 │
│ 1960-12-27 00:00:00.000 │ 1961-12-27 23:59:00.000 │
│ 1966-10-05 09:00:00.000 │                    ᴺᵁᴸᴸ │
│ 1967-01-01 00:00:00.000 │ 1967-12-31 00:00:00.000 │
│ 1969-07-14 00:01:00.000 │ 1969-01-09 00:01:00.000 │
│ 1970-04-26 13:00:00.000 │ 1970-04-26 13:30:00.000 │
│ 1971-09-09 19:00:00.000 │ 2021-09-09 19:03:00.000 │
└─────────────────────────┴─────────────────────────┘
```
:::note
The dates shown as `1925` above are from errors in the data.  There are several records in the original data with dates in the years `1019` - `1022` that should be `2019` - `2022`.  They are being stored as Jan 1st 1925 as that is the earliest date with a 64 bit DateTime.
:::

## Create a table

Putting together the changes to data types gives this table structure:

```sql
CREATE TABLE NYPD_Complaint ( complaint_number     UInt32,
                              precinct             UInt8,
                              borough              LowCardinality(String),
                              complaint_begin      DateTime64,
                              complaint_end        DateTime64,
                              was_crime_completed  String,
                              housing_authority    String,
                              housing_level_code   UInt32,
                              jurisdiction_code    UInt8, 
                              jurisdiction         LowCardinality(String),
                              offense_code         UInt8,
                              offense_level        LowCardinality(String),
                              location_descriptor  LowCardinality(String),
                              offense_description  String,
                              park_name            LowCardinality(String),
                              patrol_borough       LowCardinality(String),
                              PD_CD                UInt16,
                              PD_DESC              String,
                              location_type        LowCardinality(String),
                              date_reported        Date,
                              transit_station      LowCardinality(String),
                              suspect_age_group    LowCardinality(String),
                              suspect_race         LowCardinality(String),
                              suspect_sex          LowCardinality(String),
                              transit_district     UInt8,
                              victim_age_group     LowCardinality(String),
                              victim_race          LowCardinality(String),
                              victim_sex           LowCardinality(String),
                              NY_x_coordinate      UInt32,
                              NY_y_coordinate      UInt32,
                              Latitude             Float64,
                              Longitude            Float64
                ) ENGINE = MergeTree ORDER BY complaint_begin
```

## Preprocess and Import Data {#preprocess-import-data}

We will use `clickhouse-local` tool for data preprocessing and `clickhouse-client` to upload it.

```sql
cat ${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv \
  | clickhouse-local --table='input' --input-format='TSVWithNames' \
  --query "
WITH (CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM) AS CMPLNT_START,
     (CMPLNT_TO_DT || ' ' || CMPLNT_TO_TM) AS CMPLNT_END
    SELECT
      CMPLNT_NUM                                  AS complaint_number,
      ADDR_PCT_CD                                 AS precinct,
      BORO_NM                                     AS borough,
      parseDateTime64BestEffort(CMPLNT_START)     AS complaint_begin,
      parseDateTime64BestEffortOrNull(CMPLNT_END) AS complaint_end,
      CRM_ATPT_CPTD_CD                            AS was_crime_completed,
      HADEVELOPT                                  AS housing_authority_development,
      HOUSING_PSA                                 AS housing_level_code,
      JURISDICTION_CODE                           AS jurisdiction_code, 
      JURIS_DESC                                  AS jurisdiction,
      KY_CD                                       AS offense_code,
      LAW_CAT_CD                                  AS offense_level,
      LOC_OF_OCCUR_DESC                           AS location_descriptor,
      OFNS_DESC                                   AS offense_description, 
      PARKS_NM                                    AS park_name,
      PATROL_BORO                                 AS patrol_borough,
      PD_CD,
      PD_DESC,
      PREM_TYP_DESC                               AS location_type,
      toDate(parseDateTimeBestEffort(RPT_DT))     AS date_reported,
      STATION_NAME                                AS transit_station,
      SUSP_AGE_GROUP                              AS suspect_age_group,
      SUSP_RACE                                   AS suspect_race,
      SUSP_SEX                                    AS suspect_sex,
      TRANSIT_DISTRICT                            AS transit_district,
      VIC_AGE_GROUP                               AS victim_age_group,   
      VIC_RACE                                    AS victim_race,
      VIC_SEX                                     AS victim_sex,
      X_COORD_CD                                  AS NY_x_coordinate,
      Y_COORD_CD                                  AS NY_y_coordinate,
      Latitude,
      Longitude
    FROM input" \
  | clickhouse-client --query='INSERT INTO NYPD_Complaint FORMAT TSV'
```  

In this example, we define the structure of source data from the CSV file and specify a query to preprocess the data with `clickhouse-local`.

The preprocessing is:
- splitting the postcode to two different columns `postcode1` and `postcode2` that is better for storage and queries;
- coverting the `time` field to date as it only contains 00:00 time;
- ignoring the [UUid](../../sql-reference/data-types/uuid.md) field because we don't need it for analysis;
- transforming `type` and `duration` to more readable Enum fields with function [transform](../../sql-reference/functions/other-functions.md#transform);
- transforming `is_new` and `category` fields from single-character string (`Y`/`N` and `A`/`B`) to [UInt8](../../sql-reference/data-types/int-uint.md#uint8-uint16-uint32-uint64-uint256-int8-int16-int32-int64-int128-int256) field with 0 and 1.

Preprocessed data is piped directly to `clickhouse-client` to be inserted into ClickHouse table in streaming fashion.

```bash
clickhouse-local --input-format CSV --structure '
    uuid String,
    price UInt32,
    time DateTime,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String
' --query "
    WITH splitByChar(' ', postcode) AS p
    SELECT
        price,
        toDate(time) AS date,
        p[1] AS postcode1,
        p[2] AS postcode2,
        transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
        b = 'Y' AS is_new,
        transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
        addr1,
        addr2,
        street,
        locality,
        town,
        district,
        county,
        d = 'B' AS category
    FROM table" --date_time_input_format best_effort < pp-complete.csv | clickhouse-client --query "INSERT INTO uk_price_paid FORMAT TSV"
```

It will take about 40 seconds.

## Validate the Data {#validate-data}

Query:

```sql
SELECT count() FROM uk_price_paid;
```

Result:

```text
┌──count()─┐
│ 26321785 │
└──────────┘
```

The size of dataset in ClickHouse is just 278 MiB, check it.

Query:

```sql
SELECT formatReadableSize(total_bytes) FROM system.tables WHERE name = 'uk_price_paid';
```

Result:

```text
┌─formatReadableSize(total_bytes)─┐
│ 278.80 MiB                      │
└─────────────────────────────────┘
```

## Run Some Queries {#run-queries}

### Query 1. Average Price Per Year {#average-price}

Query:

```sql
SELECT toYear(date) AS year, round(avg(price)) AS price, bar(price, 0, 1000000, 80) FROM uk_price_paid GROUP BY year ORDER BY year;
```

Result:

```text
┌─year─┬──price─┬─bar(round(avg(price)), 0, 1000000, 80)─┐
│ 1995 │  67932 │ █████▍                                 │
│ 1996 │  71505 │ █████▋                                 │
│ 1997 │  78532 │ ██████▎                                │
│ 1998 │  85436 │ ██████▋                                │
│ 1999 │  96037 │ ███████▋                               │
│ 2000 │ 107479 │ ████████▌                              │
│ 2001 │ 118885 │ █████████▌                             │
│ 2002 │ 137941 │ ███████████                            │
│ 2003 │ 155889 │ ████████████▍                          │
│ 2004 │ 178885 │ ██████████████▎                        │
│ 2005 │ 189351 │ ███████████████▏                       │
│ 2006 │ 203528 │ ████████████████▎                      │
│ 2007 │ 219378 │ █████████████████▌                     │
│ 2008 │ 217056 │ █████████████████▎                     │
│ 2009 │ 213419 │ █████████████████                      │
│ 2010 │ 236109 │ ██████████████████▊                    │
│ 2011 │ 232805 │ ██████████████████▌                    │
│ 2012 │ 238367 │ ███████████████████                    │
│ 2013 │ 256931 │ ████████████████████▌                  │
│ 2014 │ 279915 │ ██████████████████████▍                │
│ 2015 │ 297266 │ ███████████████████████▋               │
│ 2016 │ 313201 │ █████████████████████████              │
│ 2017 │ 346097 │ ███████████████████████████▋           │
│ 2018 │ 350116 │ ████████████████████████████           │
│ 2019 │ 351013 │ ████████████████████████████           │
│ 2020 │ 369420 │ █████████████████████████████▌         │
│ 2021 │ 386903 │ ██████████████████████████████▊        │
└──────┴────────┴────────────────────────────────────────┘
```

### Query 2. Average Price per Year in London {#average-price-london}

Query:

```sql
SELECT toYear(date) AS year, round(avg(price)) AS price, bar(price, 0, 2000000, 100) FROM uk_price_paid WHERE town = 'LONDON' GROUP BY year ORDER BY year;
```

Result:

```text
┌─year─┬───price─┬─bar(round(avg(price)), 0, 2000000, 100)───────────────┐
│ 1995 │  109116 │ █████▍                                                │
│ 1996 │  118667 │ █████▊                                                │
│ 1997 │  136518 │ ██████▋                                               │
│ 1998 │  152983 │ ███████▋                                              │
│ 1999 │  180637 │ █████████                                             │
│ 2000 │  215838 │ ██████████▋                                           │
│ 2001 │  232994 │ ███████████▋                                          │
│ 2002 │  263670 │ █████████████▏                                        │
│ 2003 │  278394 │ █████████████▊                                        │
│ 2004 │  304666 │ ███████████████▏                                      │
│ 2005 │  322875 │ ████████████████▏                                     │
│ 2006 │  356191 │ █████████████████▋                                    │
│ 2007 │  404054 │ ████████████████████▏                                 │
│ 2008 │  420741 │ █████████████████████                                 │
│ 2009 │  427753 │ █████████████████████▍                                │
│ 2010 │  480306 │ ████████████████████████                              │
│ 2011 │  496274 │ ████████████████████████▋                             │
│ 2012 │  519442 │ █████████████████████████▊                            │
│ 2013 │  616212 │ ██████████████████████████████▋                       │
│ 2014 │  724154 │ ████████████████████████████████████▏                 │
│ 2015 │  792129 │ ███████████████████████████████████████▌              │
│ 2016 │  843655 │ ██████████████████████████████████████████▏           │
│ 2017 │  982642 │ █████████████████████████████████████████████████▏    │
│ 2018 │ 1016835 │ ██████████████████████████████████████████████████▋   │
│ 2019 │ 1042849 │ ████████████████████████████████████████████████████▏ │
│ 2020 │ 1011889 │ ██████████████████████████████████████████████████▌   │
│ 2021 │  960343 │ ████████████████████████████████████████████████      │
└──────┴─────────┴───────────────────────────────────────────────────────┘
```

Something happened in 2013. I don't have a clue. Maybe you have a clue what happened in 2020?

### Query 3. The Most Expensive Neighborhoods {#most-expensive-neighborhoods}

Query:

```sql
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk_price_paid
WHERE date >= '2020-01-01'
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100;
```

Result:

```text

┌─town─────────────────┬─district───────────────┬────c─┬───price─┬─bar(round(avg(price)), 0, 5000000, 100)────────────────────────────┐
│ LONDON               │ CITY OF WESTMINSTER    │ 3606 │ 3280239 │ █████████████████████████████████████████████████████████████████▌ │
│ LONDON               │ CITY OF LONDON         │  274 │ 3160502 │ ███████████████████████████████████████████████████████████████▏   │
│ LONDON               │ KENSINGTON AND CHELSEA │ 2550 │ 2308478 │ ██████████████████████████████████████████████▏                    │
│ LEATHERHEAD          │ ELMBRIDGE              │  114 │ 1897407 │ █████████████████████████████████████▊                             │
│ LONDON               │ CAMDEN                 │ 3033 │ 1805404 │ ████████████████████████████████████                               │
│ VIRGINIA WATER       │ RUNNYMEDE              │  156 │ 1753247 │ ███████████████████████████████████                                │
│ WINDLESHAM           │ SURREY HEATH           │  108 │ 1677613 │ █████████████████████████████████▌                                 │
│ THORNTON HEATH       │ CROYDON                │  546 │ 1671721 │ █████████████████████████████████▍                                 │
│ BARNET               │ ENFIELD                │  124 │ 1505840 │ ██████████████████████████████                                     │
│ COBHAM               │ ELMBRIDGE              │  387 │ 1237250 │ ████████████████████████▋                                          │
│ LONDON               │ ISLINGTON              │ 2668 │ 1236980 │ ████████████████████████▋                                          │
│ OXFORD               │ SOUTH OXFORDSHIRE      │  321 │ 1220907 │ ████████████████████████▍                                          │
│ LONDON               │ RICHMOND UPON THAMES   │  704 │ 1215551 │ ████████████████████████▎                                          │
│ LONDON               │ HOUNSLOW               │  671 │ 1207493 │ ████████████████████████▏                                          │
│ ASCOT                │ WINDSOR AND MAIDENHEAD │  407 │ 1183299 │ ███████████████████████▋                                           │
│ BEACONSFIELD         │ BUCKINGHAMSHIRE        │  330 │ 1175615 │ ███████████████████████▌                                           │
│ RICHMOND             │ RICHMOND UPON THAMES   │  874 │ 1110444 │ ██████████████████████▏                                            │
│ LONDON               │ HAMMERSMITH AND FULHAM │ 3086 │ 1053983 │ █████████████████████                                              │
│ SURBITON             │ ELMBRIDGE              │  100 │ 1011800 │ ████████████████████▏                                              │
│ RADLETT              │ HERTSMERE              │  283 │ 1011712 │ ████████████████████▏                                              │
│ SALCOMBE             │ SOUTH HAMS             │  127 │ 1011624 │ ████████████████████▏                                              │
│ WEYBRIDGE            │ ELMBRIDGE              │  655 │ 1007265 │ ████████████████████▏                                              │
│ ESHER                │ ELMBRIDGE              │  485 │  986581 │ ███████████████████▋                                               │
│ LEATHERHEAD          │ GUILDFORD              │  202 │  977320 │ ███████████████████▌                                               │
│ BURFORD              │ WEST OXFORDSHIRE       │  111 │  966893 │ ███████████████████▎                                               │
│ BROCKENHURST         │ NEW FOREST             │  129 │  956675 │ ███████████████████▏                                               │
│ HINDHEAD             │ WAVERLEY               │  137 │  953753 │ ███████████████████                                                │
│ GERRARDS CROSS       │ BUCKINGHAMSHIRE        │  419 │  951121 │ ███████████████████                                                │
│ EAST MOLESEY         │ ELMBRIDGE              │  192 │  936769 │ ██████████████████▋                                                │
│ CHALFONT ST GILES    │ BUCKINGHAMSHIRE        │  146 │  925515 │ ██████████████████▌                                                │
│ LONDON               │ TOWER HAMLETS          │ 4388 │  918304 │ ██████████████████▎                                                │
│ OLNEY                │ MILTON KEYNES          │  235 │  910646 │ ██████████████████▏                                                │
│ HENLEY-ON-THAMES     │ SOUTH OXFORDSHIRE      │  540 │  902418 │ ██████████████████                                                 │
│ LONDON               │ SOUTHWARK              │ 3885 │  892997 │ █████████████████▋                                                 │
│ KINGSTON UPON THAMES │ KINGSTON UPON THAMES   │  960 │  885969 │ █████████████████▋                                                 │
│ LONDON               │ EALING                 │ 2658 │  871755 │ █████████████████▍                                                 │
│ CRANBROOK            │ TUNBRIDGE WELLS        │  431 │  862348 │ █████████████████▏                                                 │
│ LONDON               │ MERTON                 │ 2099 │  859118 │ █████████████████▏                                                 │
│ BELVEDERE            │ BEXLEY                 │  346 │  842423 │ ████████████████▋                                                  │
│ GUILDFORD            │ WAVERLEY               │  143 │  841277 │ ████████████████▋                                                  │
│ HARPENDEN            │ ST ALBANS              │  657 │  841216 │ ████████████████▋                                                  │
│ LONDON               │ HACKNEY                │ 3307 │  837090 │ ████████████████▋                                                  │
│ LONDON               │ WANDSWORTH             │ 6566 │  832663 │ ████████████████▋                                                  │
│ MAIDENHEAD           │ BUCKINGHAMSHIRE        │  123 │  824299 │ ████████████████▍                                                  │
│ KINGS LANGLEY        │ DACORUM                │  145 │  821331 │ ████████████████▍                                                  │
│ BERKHAMSTED          │ DACORUM                │  543 │  818415 │ ████████████████▎                                                  │
│ GREAT MISSENDEN      │ BUCKINGHAMSHIRE        │  226 │  802807 │ ████████████████                                                   │
│ BILLINGSHURST        │ CHICHESTER             │  144 │  797829 │ ███████████████▊                                                   │
│ WOKING               │ GUILDFORD              │  176 │  793494 │ ███████████████▋                                                   │
│ STOCKBRIDGE          │ TEST VALLEY            │  178 │  793269 │ ███████████████▋                                                   │
│ EPSOM                │ REIGATE AND BANSTEAD   │  172 │  791862 │ ███████████████▋                                                   │
│ TONBRIDGE            │ TUNBRIDGE WELLS        │  360 │  787876 │ ███████████████▋                                                   │
│ TEDDINGTON           │ RICHMOND UPON THAMES   │  595 │  786492 │ ███████████████▋                                                   │
│ TWICKENHAM           │ RICHMOND UPON THAMES   │ 1155 │  786193 │ ███████████████▋                                                   │
│ LYNDHURST            │ NEW FOREST             │  102 │  785593 │ ███████████████▋                                                   │
│ LONDON               │ LAMBETH                │ 5228 │  774574 │ ███████████████▍                                                   │
│ LONDON               │ BARNET                 │ 3955 │  773259 │ ███████████████▍                                                   │
│ OXFORD               │ VALE OF WHITE HORSE    │  353 │  772088 │ ███████████████▍                                                   │
│ TONBRIDGE            │ MAIDSTONE              │  305 │  770740 │ ███████████████▍                                                   │
│ LUTTERWORTH          │ HARBOROUGH             │  538 │  768634 │ ███████████████▎                                                   │
│ WOODSTOCK            │ WEST OXFORDSHIRE       │  140 │  766037 │ ███████████████▎                                                   │
│ MIDHURST             │ CHICHESTER             │  257 │  764815 │ ███████████████▎                                                   │
│ MARLOW               │ BUCKINGHAMSHIRE        │  327 │  761876 │ ███████████████▏                                                   │
│ LONDON               │ NEWHAM                 │ 3237 │  761784 │ ███████████████▏                                                   │
│ ALDERLEY EDGE        │ CHESHIRE EAST          │  178 │  757318 │ ███████████████▏                                                   │
│ LUTON                │ CENTRAL BEDFORDSHIRE   │  212 │  754283 │ ███████████████                                                    │
│ PETWORTH             │ CHICHESTER             │  154 │  754220 │ ███████████████                                                    │
│ ALRESFORD            │ WINCHESTER             │  219 │  752718 │ ███████████████                                                    │
│ POTTERS BAR          │ WELWYN HATFIELD        │  174 │  748465 │ ██████████████▊                                                    │
│ HASLEMERE            │ CHICHESTER             │  128 │  746907 │ ██████████████▊                                                    │
│ TADWORTH             │ REIGATE AND BANSTEAD   │  502 │  743252 │ ██████████████▋                                                    │
│ THAMES DITTON        │ ELMBRIDGE              │  244 │  741913 │ ██████████████▋                                                    │
│ REIGATE              │ REIGATE AND BANSTEAD   │  581 │  738198 │ ██████████████▋                                                    │
│ BOURNE END           │ BUCKINGHAMSHIRE        │  138 │  735190 │ ██████████████▋                                                    │
│ SEVENOAKS            │ SEVENOAKS              │ 1156 │  730018 │ ██████████████▌                                                    │
│ OXTED                │ TANDRIDGE              │  336 │  729123 │ ██████████████▌                                                    │
│ INGATESTONE          │ BRENTWOOD              │  166 │  728103 │ ██████████████▌                                                    │
│ LONDON               │ BRENT                  │ 2079 │  720605 │ ██████████████▍                                                    │
│ LONDON               │ HARINGEY               │ 3216 │  717780 │ ██████████████▎                                                    │
│ PURLEY               │ CROYDON                │  575 │  716108 │ ██████████████▎                                                    │
│ WELWYN               │ WELWYN HATFIELD        │  222 │  710603 │ ██████████████▏                                                    │
│ RICKMANSWORTH        │ THREE RIVERS           │  798 │  704571 │ ██████████████                                                     │
│ BANSTEAD             │ REIGATE AND BANSTEAD   │  401 │  701293 │ ██████████████                                                     │
│ CHIGWELL             │ EPPING FOREST          │  261 │  701203 │ ██████████████                                                     │
│ PINNER               │ HARROW                 │  528 │  698885 │ █████████████▊                                                     │
│ HASLEMERE            │ WAVERLEY               │  280 │  696659 │ █████████████▊                                                     │
│ SLOUGH               │ BUCKINGHAMSHIRE        │  396 │  694917 │ █████████████▊                                                     │
│ WALTON-ON-THAMES     │ ELMBRIDGE              │  946 │  692395 │ █████████████▋                                                     │
│ READING              │ SOUTH OXFORDSHIRE      │  318 │  691988 │ █████████████▋                                                     │
│ NORTHWOOD            │ HILLINGDON             │  271 │  690643 │ █████████████▋                                                     │
│ FELTHAM              │ HOUNSLOW               │  763 │  688595 │ █████████████▋                                                     │
│ ASHTEAD              │ MOLE VALLEY            │  303 │  687923 │ █████████████▋                                                     │
│ BARNET               │ BARNET                 │  975 │  686980 │ █████████████▋                                                     │
│ WOKING               │ SURREY HEATH           │  283 │  686669 │ █████████████▋                                                     │
│ MALMESBURY           │ WILTSHIRE              │  323 │  683324 │ █████████████▋                                                     │
│ AMERSHAM             │ BUCKINGHAMSHIRE        │  496 │  680962 │ █████████████▌                                                     │
│ CHISLEHURST          │ BROMLEY                │  430 │  680209 │ █████████████▌                                                     │
│ HYTHE                │ FOLKESTONE AND HYTHE   │  490 │  676908 │ █████████████▌                                                     │
│ MAYFIELD             │ WEALDEN                │  101 │  676210 │ █████████████▌                                                     │
│ ASCOT                │ BRACKNELL FOREST       │  168 │  676004 │ █████████████▌                                                     │
└──────────────────────┴────────────────────────┴──────┴─────────┴────────────────────────────────────────────────────────────────────┘
```

## Let's Speed Up Queries Using Projections {#speedup-with-projections}

[Projections](../../sql-reference/statements/alter/projection.md) allow to improve queries speed by storing pre-aggregated data.

### Build a Projection {#build-projection}

Create an aggregate projection by dimensions `toYear(date)`, `district`, `town`:

```sql
ALTER TABLE uk_price_paid
    ADD PROJECTION projection_by_year_district_town
    (
        SELECT
            toYear(date),
            district,
            town,
            avg(price),
            sum(price),
            count()
        GROUP BY
            toYear(date),
            district,
            town
    );
```

Populate the projection for existing data (without it projection will be created for only newly inserted data):

```sql
ALTER TABLE uk_price_paid
    MATERIALIZE PROJECTION projection_by_year_district_town
SETTINGS mutations_sync = 1;
```

## Test Performance {#test-performance}

Let's run the same 3 queries.

[Enable](../../operations/settings/settings.md#allow-experimental-projection-optimization) projections for selects:

```sql
SET allow_experimental_projection_optimization = 1;
```

### Query 1. Average Price Per Year {#average-price-projections}

Query:

```sql
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM uk_price_paid
GROUP BY year
ORDER BY year ASC;
```

Result:

```text
┌─year─┬──price─┬─bar(round(avg(price)), 0, 1000000, 80)─┐
│ 1995 │  67932 │ █████▍                                 │
│ 1996 │  71505 │ █████▋                                 │
│ 1997 │  78532 │ ██████▎                                │
│ 1998 │  85436 │ ██████▋                                │
│ 1999 │  96037 │ ███████▋                               │
│ 2000 │ 107479 │ ████████▌                              │
│ 2001 │ 118885 │ █████████▌                             │
│ 2002 │ 137941 │ ███████████                            │
│ 2003 │ 155889 │ ████████████▍                          │
│ 2004 │ 178885 │ ██████████████▎                        │
│ 2005 │ 189351 │ ███████████████▏                       │
│ 2006 │ 203528 │ ████████████████▎                      │
│ 2007 │ 219378 │ █████████████████▌                     │
│ 2008 │ 217056 │ █████████████████▎                     │
│ 2009 │ 213419 │ █████████████████                      │
│ 2010 │ 236109 │ ██████████████████▊                    │
│ 2011 │ 232805 │ ██████████████████▌                    │
│ 2012 │ 238367 │ ███████████████████                    │
│ 2013 │ 256931 │ ████████████████████▌                  │
│ 2014 │ 279915 │ ██████████████████████▍                │
│ 2015 │ 297266 │ ███████████████████████▋               │
│ 2016 │ 313201 │ █████████████████████████              │
│ 2017 │ 346097 │ ███████████████████████████▋           │
│ 2018 │ 350116 │ ████████████████████████████           │
│ 2019 │ 351013 │ ████████████████████████████           │
│ 2020 │ 369420 │ █████████████████████████████▌         │
│ 2021 │ 386903 │ ██████████████████████████████▊        │
└──────┴────────┴────────────────────────────────────────┘
```

### Query 2. Average Price Per Year in London {#average-price-london-projections}

Query:

```sql
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 2000000, 100)
FROM uk_price_paid
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year ASC;
```

Result:

```text
┌─year─┬───price─┬─bar(round(avg(price)), 0, 2000000, 100)───────────────┐
│ 1995 │  109116 │ █████▍                                                │
│ 1996 │  118667 │ █████▊                                                │
│ 1997 │  136518 │ ██████▋                                               │
│ 1998 │  152983 │ ███████▋                                              │
│ 1999 │  180637 │ █████████                                             │
│ 2000 │  215838 │ ██████████▋                                           │
│ 2001 │  232994 │ ███████████▋                                          │
│ 2002 │  263670 │ █████████████▏                                        │
│ 2003 │  278394 │ █████████████▊                                        │
│ 2004 │  304666 │ ███████████████▏                                      │
│ 2005 │  322875 │ ████████████████▏                                     │
│ 2006 │  356191 │ █████████████████▋                                    │
│ 2007 │  404054 │ ████████████████████▏                                 │
│ 2008 │  420741 │ █████████████████████                                 │
│ 2009 │  427753 │ █████████████████████▍                                │
│ 2010 │  480306 │ ████████████████████████                              │
│ 2011 │  496274 │ ████████████████████████▋                             │
│ 2012 │  519442 │ █████████████████████████▊                            │
│ 2013 │  616212 │ ██████████████████████████████▋                       │
│ 2014 │  724154 │ ████████████████████████████████████▏                 │
│ 2015 │  792129 │ ███████████████████████████████████████▌              │
│ 2016 │  843655 │ ██████████████████████████████████████████▏           │
│ 2017 │  982642 │ █████████████████████████████████████████████████▏    │
│ 2018 │ 1016835 │ ██████████████████████████████████████████████████▋   │
│ 2019 │ 1042849 │ ████████████████████████████████████████████████████▏ │
│ 2020 │ 1011889 │ ██████████████████████████████████████████████████▌   │
│ 2021 │  960343 │ ████████████████████████████████████████████████      │
└──────┴─────────┴───────────────────────────────────────────────────────┘
```

### Query 3. The Most Expensive Neighborhoods {#most-expensive-neighborhoods-projections}

The condition (date >= '2020-01-01') needs to be modified to match projection dimension (toYear(date) >= 2020).

Query:

```sql
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk_price_paid
WHERE toYear(date) >= 2020
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100;
```

Result:

```text
┌─town─────────────────┬─district───────────────┬────c─┬───price─┬─bar(round(avg(price)), 0, 5000000, 100)────────────────────────────┐
│ LONDON               │ CITY OF WESTMINSTER    │ 3606 │ 3280239 │ █████████████████████████████████████████████████████████████████▌ │
│ LONDON               │ CITY OF LONDON         │  274 │ 3160502 │ ███████████████████████████████████████████████████████████████▏   │
│ LONDON               │ KENSINGTON AND CHELSEA │ 2550 │ 2308478 │ ██████████████████████████████████████████████▏                    │
│ LEATHERHEAD          │ ELMBRIDGE              │  114 │ 1897407 │ █████████████████████████████████████▊                             │
│ LONDON               │ CAMDEN                 │ 3033 │ 1805404 │ ████████████████████████████████████                               │
│ VIRGINIA WATER       │ RUNNYMEDE              │  156 │ 1753247 │ ███████████████████████████████████                                │
│ WINDLESHAM           │ SURREY HEATH           │  108 │ 1677613 │ █████████████████████████████████▌                                 │
│ THORNTON HEATH       │ CROYDON                │  546 │ 1671721 │ █████████████████████████████████▍                                 │
│ BARNET               │ ENFIELD                │  124 │ 1505840 │ ██████████████████████████████                                     │
│ COBHAM               │ ELMBRIDGE              │  387 │ 1237250 │ ████████████████████████▋                                          │
│ LONDON               │ ISLINGTON              │ 2668 │ 1236980 │ ████████████████████████▋                                          │
│ OXFORD               │ SOUTH OXFORDSHIRE      │  321 │ 1220907 │ ████████████████████████▍                                          │
│ LONDON               │ RICHMOND UPON THAMES   │  704 │ 1215551 │ ████████████████████████▎                                          │
│ LONDON               │ HOUNSLOW               │  671 │ 1207493 │ ████████████████████████▏                                          │
│ ASCOT                │ WINDSOR AND MAIDENHEAD │  407 │ 1183299 │ ███████████████████████▋                                           │
│ BEACONSFIELD         │ BUCKINGHAMSHIRE        │  330 │ 1175615 │ ███████████████████████▌                                           │
│ RICHMOND             │ RICHMOND UPON THAMES   │  874 │ 1110444 │ ██████████████████████▏                                            │
│ LONDON               │ HAMMERSMITH AND FULHAM │ 3086 │ 1053983 │ █████████████████████                                              │
│ SURBITON             │ ELMBRIDGE              │  100 │ 1011800 │ ████████████████████▏                                              │
│ RADLETT              │ HERTSMERE              │  283 │ 1011712 │ ████████████████████▏                                              │
│ SALCOMBE             │ SOUTH HAMS             │  127 │ 1011624 │ ████████████████████▏                                              │
│ WEYBRIDGE            │ ELMBRIDGE              │  655 │ 1007265 │ ████████████████████▏                                              │
│ ESHER                │ ELMBRIDGE              │  485 │  986581 │ ███████████████████▋                                               │
│ LEATHERHEAD          │ GUILDFORD              │  202 │  977320 │ ███████████████████▌                                               │
│ BURFORD              │ WEST OXFORDSHIRE       │  111 │  966893 │ ███████████████████▎                                               │
│ BROCKENHURST         │ NEW FOREST             │  129 │  956675 │ ███████████████████▏                                               │
│ HINDHEAD             │ WAVERLEY               │  137 │  953753 │ ███████████████████                                                │
│ GERRARDS CROSS       │ BUCKINGHAMSHIRE        │  419 │  951121 │ ███████████████████                                                │
│ EAST MOLESEY         │ ELMBRIDGE              │  192 │  936769 │ ██████████████████▋                                                │
│ CHALFONT ST GILES    │ BUCKINGHAMSHIRE        │  146 │  925515 │ ██████████████████▌                                                │
│ LONDON               │ TOWER HAMLETS          │ 4388 │  918304 │ ██████████████████▎                                                │
│ OLNEY                │ MILTON KEYNES          │  235 │  910646 │ ██████████████████▏                                                │
│ HENLEY-ON-THAMES     │ SOUTH OXFORDSHIRE      │  540 │  902418 │ ██████████████████                                                 │
│ LONDON               │ SOUTHWARK              │ 3885 │  892997 │ █████████████████▋                                                 │
│ KINGSTON UPON THAMES │ KINGSTON UPON THAMES   │  960 │  885969 │ █████████████████▋                                                 │
│ LONDON               │ EALING                 │ 2658 │  871755 │ █████████████████▍                                                 │
│ CRANBROOK            │ TUNBRIDGE WELLS        │  431 │  862348 │ █████████████████▏                                                 │
│ LONDON               │ MERTON                 │ 2099 │  859118 │ █████████████████▏                                                 │
│ BELVEDERE            │ BEXLEY                 │  346 │  842423 │ ████████████████▋                                                  │
│ GUILDFORD            │ WAVERLEY               │  143 │  841277 │ ████████████████▋                                                  │
│ HARPENDEN            │ ST ALBANS              │  657 │  841216 │ ████████████████▋                                                  │
│ LONDON               │ HACKNEY                │ 3307 │  837090 │ ████████████████▋                                                  │
│ LONDON               │ WANDSWORTH             │ 6566 │  832663 │ ████████████████▋                                                  │
│ MAIDENHEAD           │ BUCKINGHAMSHIRE        │  123 │  824299 │ ████████████████▍                                                  │
│ KINGS LANGLEY        │ DACORUM                │  145 │  821331 │ ████████████████▍                                                  │
│ BERKHAMSTED          │ DACORUM                │  543 │  818415 │ ████████████████▎                                                  │
│ GREAT MISSENDEN      │ BUCKINGHAMSHIRE        │  226 │  802807 │ ████████████████                                                   │
│ BILLINGSHURST        │ CHICHESTER             │  144 │  797829 │ ███████████████▊                                                   │
│ WOKING               │ GUILDFORD              │  176 │  793494 │ ███████████████▋                                                   │
│ STOCKBRIDGE          │ TEST VALLEY            │  178 │  793269 │ ███████████████▋                                                   │
│ EPSOM                │ REIGATE AND BANSTEAD   │  172 │  791862 │ ███████████████▋                                                   │
│ TONBRIDGE            │ TUNBRIDGE WELLS        │  360 │  787876 │ ███████████████▋                                                   │
│ TEDDINGTON           │ RICHMOND UPON THAMES   │  595 │  786492 │ ███████████████▋                                                   │
│ TWICKENHAM           │ RICHMOND UPON THAMES   │ 1155 │  786193 │ ███████████████▋                                                   │
│ LYNDHURST            │ NEW FOREST             │  102 │  785593 │ ███████████████▋                                                   │
│ LONDON               │ LAMBETH                │ 5228 │  774574 │ ███████████████▍                                                   │
│ LONDON               │ BARNET                 │ 3955 │  773259 │ ███████████████▍                                                   │
│ OXFORD               │ VALE OF WHITE HORSE    │  353 │  772088 │ ███████████████▍                                                   │
│ TONBRIDGE            │ MAIDSTONE              │  305 │  770740 │ ███████████████▍                                                   │
│ LUTTERWORTH          │ HARBOROUGH             │  538 │  768634 │ ███████████████▎                                                   │
│ WOODSTOCK            │ WEST OXFORDSHIRE       │  140 │  766037 │ ███████████████▎                                                   │
│ MIDHURST             │ CHICHESTER             │  257 │  764815 │ ███████████████▎                                                   │
│ MARLOW               │ BUCKINGHAMSHIRE        │  327 │  761876 │ ███████████████▏                                                   │
│ LONDON               │ NEWHAM                 │ 3237 │  761784 │ ███████████████▏                                                   │
│ ALDERLEY EDGE        │ CHESHIRE EAST          │  178 │  757318 │ ███████████████▏                                                   │
│ LUTON                │ CENTRAL BEDFORDSHIRE   │  212 │  754283 │ ███████████████                                                    │
│ PETWORTH             │ CHICHESTER             │  154 │  754220 │ ███████████████                                                    │
│ ALRESFORD            │ WINCHESTER             │  219 │  752718 │ ███████████████                                                    │
│ POTTERS BAR          │ WELWYN HATFIELD        │  174 │  748465 │ ██████████████▊                                                    │
│ HASLEMERE            │ CHICHESTER             │  128 │  746907 │ ██████████████▊                                                    │
│ TADWORTH             │ REIGATE AND BANSTEAD   │  502 │  743252 │ ██████████████▋                                                    │
│ THAMES DITTON        │ ELMBRIDGE              │  244 │  741913 │ ██████████████▋                                                    │
│ REIGATE              │ REIGATE AND BANSTEAD   │  581 │  738198 │ ██████████████▋                                                    │
│ BOURNE END           │ BUCKINGHAMSHIRE        │  138 │  735190 │ ██████████████▋                                                    │
│ SEVENOAKS            │ SEVENOAKS              │ 1156 │  730018 │ ██████████████▌                                                    │
│ OXTED                │ TANDRIDGE              │  336 │  729123 │ ██████████████▌                                                    │
│ INGATESTONE          │ BRENTWOOD              │  166 │  728103 │ ██████████████▌                                                    │
│ LONDON               │ BRENT                  │ 2079 │  720605 │ ██████████████▍                                                    │
│ LONDON               │ HARINGEY               │ 3216 │  717780 │ ██████████████▎                                                    │
│ PURLEY               │ CROYDON                │  575 │  716108 │ ██████████████▎                                                    │
│ WELWYN               │ WELWYN HATFIELD        │  222 │  710603 │ ██████████████▏                                                    │
│ RICKMANSWORTH        │ THREE RIVERS           │  798 │  704571 │ ██████████████                                                     │
│ BANSTEAD             │ REIGATE AND BANSTEAD   │  401 │  701293 │ ██████████████                                                     │
│ CHIGWELL             │ EPPING FOREST          │  261 │  701203 │ ██████████████                                                     │
│ PINNER               │ HARROW                 │  528 │  698885 │ █████████████▊                                                     │
│ HASLEMERE            │ WAVERLEY               │  280 │  696659 │ █████████████▊                                                     │
│ SLOUGH               │ BUCKINGHAMSHIRE        │  396 │  694917 │ █████████████▊                                                     │
│ WALTON-ON-THAMES     │ ELMBRIDGE              │  946 │  692395 │ █████████████▋                                                     │
│ READING              │ SOUTH OXFORDSHIRE      │  318 │  691988 │ █████████████▋                                                     │
│ NORTHWOOD            │ HILLINGDON             │  271 │  690643 │ █████████████▋                                                     │
│ FELTHAM              │ HOUNSLOW               │  763 │  688595 │ █████████████▋                                                     │
│ ASHTEAD              │ MOLE VALLEY            │  303 │  687923 │ █████████████▋                                                     │
│ BARNET               │ BARNET                 │  975 │  686980 │ █████████████▋                                                     │
│ WOKING               │ SURREY HEATH           │  283 │  686669 │ █████████████▋                                                     │
│ MALMESBURY           │ WILTSHIRE              │  323 │  683324 │ █████████████▋                                                     │
│ AMERSHAM             │ BUCKINGHAMSHIRE        │  496 │  680962 │ █████████████▌                                                     │
│ CHISLEHURST          │ BROMLEY                │  430 │  680209 │ █████████████▌                                                     │
│ HYTHE                │ FOLKESTONE AND HYTHE   │  490 │  676908 │ █████████████▌                                                     │
│ MAYFIELD             │ WEALDEN                │  101 │  676210 │ █████████████▌                                                     │
│ ASCOT                │ BRACKNELL FOREST       │  168 │  676004 │ █████████████▌                                                     │
└──────────────────────┴────────────────────────┴──────┴─────────┴────────────────────────────────────────────────────────────────────┘
```

### Summary {#summary}

All 3 queries work much faster and read fewer rows.

```text
Query 1

no projection: 27 rows in set. Elapsed: 0.158 sec. Processed 26.32 million rows, 157.93 MB (166.57 million rows/s., 999.39 MB/s.)
   projection: 27 rows in set. Elapsed: 0.007 sec. Processed 105.96 thousand rows, 3.33 MB (14.58 million rows/s., 458.13 MB/s.)


Query 2

no projection: 27 rows in set. Elapsed: 0.163 sec. Processed 26.32 million rows, 80.01 MB (161.75 million rows/s., 491.64 MB/s.)
   projection: 27 rows in set. Elapsed: 0.008 sec. Processed 105.96 thousand rows, 3.67 MB (13.29 million rows/s., 459.89 MB/s.)

Query 3

no projection: 100 rows in set. Elapsed: 0.069 sec. Processed 26.32 million rows, 62.47 MB (382.13 million rows/s., 906.93 MB/s.)
   projection: 100 rows in set. Elapsed: 0.029 sec. Processed 8.08 thousand rows, 511.08 KB (276.06 thousand rows/s., 17.47 MB/s.)
```

### Test It in Playground {#playground}

The dataset is also available in the [Online Playground](https://gh-api.clickhouse.com/play?user=play#U0VMRUNUIHRvd24sIGRpc3RyaWN0LCBjb3VudCgpIEFTIGMsIHJvdW5kKGF2ZyhwcmljZSkpIEFTIHByaWNlLCBiYXIocHJpY2UsIDAsIDUwMDAwMDAsIDEwMCkgRlJPTSB1a19wcmljZV9wYWlkIFdIRVJFIGRhdGUgPj0gJzIwMjAtMDEtMDEnIEdST1VQIEJZIHRvd24sIGRpc3RyaWN0IEhBVklORyBjID49IDEwMCBPUkRFUiBCWSBwcmljZSBERVNDIExJTUlUIDEwMA==).
