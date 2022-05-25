---
sidebar_label: Tab Separated Value (TSV)
---

# Tab Separated Value
Tab separated value, or TSV, files are common and may include field headings as the first line of the file. ClickHouse can ingest TSVs, and also can query TSVs without ingesting the files.  This guide covers both of these cases.

The dataset used in this guide comes from the NYC Open Data team, and contains data about "all valid felony, misdemeanor, and violation crimes reported to the New York City Police Department (NYPD)". At the time of writing, the data file is 166MB, but it is updated regularly.

**Source**: [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243)  
**Terms of use**: https://www1.nyc.gov/home/terms-of-use.page

## Prerequisites
- Download the dataset by visiting the [NYPD Complaint Data Current (Year To Date)](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243) page, clicking the Export button, and choosing **TSV for Excel**.
- Install [ClickHouse server and client](../../getting-started/install.md).
- [Launch](../../getting-started/install.md#launch) ClickHouse server, and connect with `clickhouse-client`

### A note about the commands described in this guide
There are two types of commands in this guide:
- Some of the commands are querying the TSV files, these are run at the command prompt.
- The rest of the commands are querying ClickHouse, and these are run in the `clickhouse-client` or Play UI.

:::note
The examples in this guide assume that you have saved the TSV file to `${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv`
:::

## Familiarize yourself with the TSV file

Before starting to work with the ClickHouse database familiarize yourself with the data. 

### Look at the fields in the source TSV file

Run this command at your command prompt.  You will be using `clickhouse-local` to query the data in the TSV file you downloaded.
```sh
clickhouse-local --query \
"describe file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')"
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

At this point you can see that the columns in the TSV file match the names specified in the **Columns in this Dataset** section of the [dataset web page](https://data.cityofnewyork.us/Public-Safety/NYPD-Complaint-Data-Current-Year-To-Date-/5uac-w243).  The data types are not very specific, all numeric fields are set to `Nullable(Float64)`, and all other fields are `Nullable(String)`.  When you create a ClickHouse table to store the data you can specify more appropriate and performant types.

### Determine the proper schema

In order to figure out what types should be used for the fields it is necessary to know what the data looks like. For example, the field `JURISDICTION_CODE` is a numeric: should it be a `UInt8`, or an `Enum`, or is `Float64` appropriate?

```sql
clickhouse-local --query \
"select JURISDICTION_CODE, count() FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
 GROUP BY JURISDICTION_CODE
 ORDER BY JURISDICTION_CODE
 FORMAT PrettyCompact"
```

```response
┌─JURISDICTION_CODE─┬─count()─┐
│                 0 │  405131 │
│                 1 │    8958 │
│                 2 │   32178 │
│                 3 │    1473 │
│                 4 │     101 │
│                 6 │      12 │
│                 7 │       8 │
│                 9 │       6 │
│                11 │      44 │
│                12 │       8 │
│                13 │      10 │
│                14 │     192 │
│                15 │      20 │
│                72 │     270 │
│                85 │       5 │
│                87 │      11 │
│                88 │     198 │
│                97 │     881 │
└───────────────────┴─────────┘
```

The query response shows that the `JURISDICTION_CODE` fits well in a `UInt8`.

Similarly, look at some of the `String` fields and see if they are well suited to being `DateTime` or [`LowCardinality(String)`](../../sql-reference/data-types/lowcardinality.md) fields.

For example, the field `PARKS_NM` is described as "Name of NYC park, playground or greenspace of occurrence, if applicable (state parks are not included)".  The names of parks in New York City may be a good candidate for a `LowCardinality(String)`:

```sh
clickhouse-local --query \
"select count(distinct PARKS_NM) FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
 FORMAT PrettyCompact"
```

```response
┌─uniqExact(PARKS_NM)─┐
│                 560 │
└─────────────────────┘
```

Have a look at some of the park names:
```sql
clickhouse-local --query \
"select distinct PARKS_NM FROM
 file('${HOME}/NYPD_Complaint_Data_Current__Year_To_Date_.tsv', 'TabSeparatedWithNames')
 LIMIT 10
 FORMAT PrettyCompact"
```

```response
┌─PARKS_NM───────────────┐
│                        │
│ BRYANT PARK            │
│ J.J. BYRNE PLAYGROUND  │
│ ST. CATHERINE'S PARK   │
│ RAILROAD PARK BRONX    │
│ CENTRAL PARK           │
│ MADISON SQUARE PARK    │
│ FORT GREENE PARK       │
│ UNION SQUARE PARK      │
│ SARA D. ROOSEVELT PARK │
└────────────────────────┘
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

## Make a plan

Based on the above investigation:
- `JURISDICTION_CODE` should be cast as `UInt8`.
- `PARKS_NM` should be cast to `LowCardinality(String)`
- `CMPLNT_FR_DT` and `CMPLNT_FR_TM` are always populated (possibly with a default time of `00:00:00`)
- `CMPLNT_TO_DT` and `CMPLNT_TO_TM` may be empty
- Dates and times are stored in separate fields in the source
- Dates are `mm/dd/yyyy` format
- Times are `hh:mm:ss` format
- Dates and times can be concatenated into DateTime types
- There are some dates before January 1st 1970, which means we need a 64 bit DateTime

:::note
There are many more changes to be made to the types, they all can be determined by following the same investigation steps.  Look at the number of distinct strings in a field, the min and max of the numerics, and make your decisions.  The table schema that is given later in the guide has many low cardinality strings and unsigned integer fields and very few floating point numerics.
:::

## Concatenate the date and time fields

To concatenate the date and time fields `CMPLNT_FR_DT` and `CMPLNT_FR_TM` into a single `String` that can be cast to a `DateTime`, select the two fields joined by the concatenation operator: `CMPLNT_FR_DT || ' ' || CMPLNT_FR_TM`.  The `CMPLNT_TO_DT` and `CMPLNT_TO_TM` fields are handled similarly.

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

Earlier in the guide we discovered that there are dates in the TSV file before January 1st 1970, which means that we need a 64 bit DateTime type for the dates.  The dates also need to be converted from `MM/DD/YYYY` to `YYYY/MM/DD` format.  Both of these can be done with [`parseDateTime64BestEffort()`](../../sql-reference/functions/type-conversion-functions.md#parsedatetime64besteffort).

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

Lines 2 and 3 above contain the concatenation from the previous step, and lines 4 and 5 above parse the strings into `DateTime64`.  As the complaint end time is not guaranteed to exist `parseDateTime64BestEffortOrNull` is used.

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
                              complaint_begin      DateTime64(0,'America/New_York'),
                              complaint_end        DateTime64(0,'America/New_York'),
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

## Validate the Data {#validate-data}

Query:

```sql
SELECT count()
FROM NYPD_Complaint
```

Result:

```text
┌─count()─┐
│  449506 │
└─────────┘

1 row in set. Elapsed: 0.001 sec. 
```

The size of the dataset in ClickHouse is just 13% of the original TSV file, check it.

Query:

```sql
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'NYPD_Complaint'
```

Result:
```text
┌─formatReadableSize(total_bytes)─┐
│ 21.92 MiB                       │
└─────────────────────────────────┘
```


## Run Some Queries {#run-queries}

### Query 1. Compare the number of complaints by month for the year 2021

Query:

```sql
SELECT
    dateName('month', complaint_begin) AS month,
    count() AS complaints,
    bar(complaints, 0, 50000, 80)
FROM NYPD_Complaint
WHERE toYear(complaint_begin) = 2021
GROUP BY month
ORDER BY complaints DESC
```

```response
┌─month─────┬─complaints─┬─bar(count(), 0, 50000, 80)────────────────────────────────────────┐
│ October   │      40654 │ █████████████████████████████████████████████████████████████████ │
│ September │      38866 │ ██████████████████████████████████████████████████████████████▏   │
│ July      │      38459 │ █████████████████████████████████████████████████████████████▌    │
│ November  │      38365 │ █████████████████████████████████████████████████████████████▍    │
│ August    │      37838 │ ████████████████████████████████████████████████████████████▌     │
│ May       │      37535 │ ████████████████████████████████████████████████████████████      │
│ June      │      36631 │ ██████████████████████████████████████████████████████████▌       │
│ January   │      35895 │ █████████████████████████████████████████████████████████▍        │
│ December  │      35724 │ █████████████████████████████████████████████████████████▏        │
│ March     │      34932 │ ███████████████████████████████████████████████████████▊          │
│ April     │      34043 │ ██████████████████████████████████████████████████████▍           │
│ February  │      30683 │ █████████████████████████████████████████████████                 │
└───────────┴────────────┴───────────────────────────────────────────────────────────────────┘

12 rows in set. Elapsed: 0.012 sec. Processed 441.31 thousand rows, 3.53 MB (36.75 million rows/s., 293.97 MB/s.)
```

### Query 2. Compare total number of complaints by Borough

Query:

```sql
SELECT
    borough,
    count() AS complaints,
    bar(complaints, 0, 125000, 60)
FROM NYPD_Complaint
WHERE (toYear(complaint_begin) = 2021) AND (borough != '')
GROUP BY borough
ORDER BY complaints DESC
```

Result:
```response
┌─borough───────┬─complaints─┬─bar(count(), 0, 125000, 60)──────────────────────────────────┐
│ BROOKLYN      │     123505 │ ███████████████████████████████████████████████████████████▎ │
│ MANHATTAN     │     108520 │ ████████████████████████████████████████████████████         │
│ QUEENS        │      95901 │ ██████████████████████████████████████████████               │
│ BRONX         │      92206 │ ████████████████████████████████████████████▎                │
│ STATEN ISLAND │      18370 │ ████████▋                                                    │
└───────────────┴────────────┴──────────────────────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.010 sec. Processed 441.31 thousand rows, 3.97 MB (43.75 million rows/s., 393.79 MB/s.)
```
