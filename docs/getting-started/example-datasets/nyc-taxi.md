---
description: 'Data for billions of taxi and for-hire vehicle (Uber, Lyft, etc.) trips
  originating in New York City since 2009'
sidebar_label: 'New York taxi data'
slug: /getting-started/example-datasets/nyc-taxi
title: 'New York Taxi Data'
doc_type: 'guide'
keywords: ['example dataset', 'nyc taxi', 'tutorial', 'sample data', 'getting started']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The New York taxi data sample consists of 3+ billion taxi and for-hire vehicle (Uber, Lyft, etc.) trips originating in New York City since 2009. This getting started guide uses a 3m row sample.

The full dataset can be obtained in a couple of ways:

- insert the data directly into ClickHouse Cloud from S3 or GCS
- download prepared partitions
- Alternatively users can query the full dataset in our demo environment at [sql.clickhouse.com](https://sql.clickhouse.com/?query=U0VMRUNUIGNvdW50KCkgRlJPTSBueWNfdGF4aS50cmlwcw&chart=eyJ0eXBlIjoibGluZSIsImNvbmZpZyI6eyJ0aXRsZSI6IlRlbXBlcmF0dXJlIGJ5IGNvdW50cnkgYW5kIHllYXIiLCJ4YXhpcyI6InllYXIiLCJ5YXhpcyI6ImNvdW50KCkiLCJzZXJpZXMiOiJDQVNUKHBhc3Nlbmdlcl9jb3VudCwgJ1N0cmluZycpIn19).

:::note
The example queries below were executed on a **Production** instance of ClickHouse Cloud. For more information see
["Playground specifications"](/getting-started/playground#specifications).
:::

## Create the table trips {#create-the-table-trips}

Start by creating a table for the taxi rides:

```sql

CREATE DATABASE nyc_taxi;

CREATE TABLE nyc_taxi.trips_small (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

## Load the data directly from object storage {#load-the-data-directly-from-object-storage}

Users' can grab a small subset of the data (3 million rows) for getting familiar with it. The data is in TSV files in object storage, which is easily streamed into
ClickHouse Cloud using the `s3` table function. 

The same data is stored in both S3 and GCS; choose either tab.

<Tabs groupId="storageVendor">
<TabItem value="s3" label="S3">

The following command streams three files from an S3 bucket into the `trips_small` table (the `{0..2}` syntax is a wildcard for the values 0, 1, and 2):

```sql
INSERT INTO nyc_taxi.trips_small
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```
</TabItem>
<TabItem value="gcs" label="GCS" default>

The following command streams three files from a GCS bucket into the `trips` table (the `{0..2}` syntax is a wildcard for the values 0, 1, and 2):

```sql
INSERT INTO nyc_taxi.trips_small
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM gcs(
    'https://storage.googleapis.com/clickhouse-public-datasets/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```
</TabItem>
</Tabs>

## Sample queries {#sample-queries}

The following queries are executed on the sample described above. Users can run the sample queries on the full dataset in [sql.clickhouse.com](https://sql.clickhouse.com/?query=U0VMRUNUIGNvdW50KCkgRlJPTSBueWNfdGF4aS50cmlwcw&chart=eyJ0eXBlIjoibGluZSIsImNvbmZpZyI6eyJ0aXRsZSI6IlRlbXBlcmF0dXJlIGJ5IGNvdW50cnkgYW5kIHllYXIiLCJ4YXhpcyI6InllYXIiLCJ5YXhpcyI6ImNvdW50KCkiLCJzZXJpZXMiOiJDQVNUKHBhc3Nlbmdlcl9jb3VudCwgJ1N0cmluZycpIn19), modifying the queries below to use the table `nyc_taxi.trips`.

Let's see how many rows were inserted:

```sql runnable
SELECT count()
FROM nyc_taxi.trips_small;
```

Each TSV file has about 1M rows, and the three files have 3,000,317 rows. Let's look at a few rows:

```sql runnable
SELECT *
FROM nyc_taxi.trips_small
LIMIT 10;
```

Notice there are columns for the pickup and dropoff dates, geo coordinates, fare details, New York neighborhoods, and more.

Let's run a few queries. This query shows us the top 10 neighborhoods that have the most frequent pickups:

```sql runnable
SELECT
   pickup_ntaname,
   count(*) AS count
FROM nyc_taxi.trips_small WHERE pickup_ntaname != ''
GROUP BY pickup_ntaname
ORDER BY count DESC
LIMIT 10;
```

This query shows the average fare based on the number of passengers:

```sql runnable view='chart' chart_config='eyJ0eXBlIjoiYmFyIiwiY29uZmlnIjp7InhheGlzIjoicGFzc2VuZ2VyX2NvdW50IiwieWF4aXMiOiJhdmcodG90YWxfYW1vdW50KSIsInRpdGxlIjoiQXZlcmFnZSBmYXJlIGJ5IHBhc3NlbmdlciBjb3VudCJ9fQ'
SELECT
   passenger_count,
   avg(total_amount)
FROM nyc_taxi.trips_small
WHERE passenger_count < 10
GROUP BY passenger_count;
```

Here's a correlation between the number of passengers and the distance of the trip:

```sql runnable chart_config='eyJ0eXBlIjoiaG9yaXpvbnRhbCBiYXIiLCJjb25maWciOnsieGF4aXMiOiJwYXNzZW5nZXJfY291bnQiLCJ5YXhpcyI6ImRpc3RhbmNlIiwic2VyaWVzIjoiY291bnRyeSIsInRpdGxlIjoiQXZnIGZhcmUgYnkgcGFzc2VuZ2VyIGNvdW50In19'
SELECT
    passenger_count,
    avg(trip_distance) AS distance,
    count() AS c
FROM nyc_taxi.trips_small
GROUP BY passenger_count
ORDER BY passenger_count ASC
```

## Download of prepared partitions {#download-of-prepared-partitions}

:::note
The following steps provide information about the original dataset, and a method for loading prepared partitions into a self-managed ClickHouse server environment.
:::

See https://github.com/toddwschneider/nyc-taxi-data and http://tech.marksblogg.com/billion-nyc-taxi-rides-redshift.html for the description of a dataset and instructions for downloading.

Downloading will result in about 227 GB of uncompressed data in CSV files. The download takes about an hour over a 1 Gbit connection (parallel downloading from s3.amazonaws.com recovers at least half of a 1 Gbit channel).
Some of the files might not download fully. Check the file sizes and re-download any that seem doubtful.

```bash
$ curl -O https://datasets.clickhouse.com/trips_mergetree/partitions/trips_mergetree.tar
# Validate the checksum
$ md5sum trips_mergetree.tar
# Checksum should be equal to: f3b8d469b41d9a82da064ded7245d12c
$ tar xvf trips_mergetree.tar -C /var/lib/clickhouse # path to ClickHouse data directory
$ # check permissions of unpacked data, fix if required
$ sudo service clickhouse-server restart
$ clickhouse-client --query "select count(*) from datasets.trips_mergetree"
```

:::info
If you will run the queries described below, you have to use the full table name, `datasets.trips_mergetree`.
:::

## Results on single server {#results-on-single-server}

Q1:

```sql
SELECT cab_type, count(*) FROM trips_mergetree GROUP BY cab_type;
```

0.490 seconds.

Q2:

```sql
SELECT passenger_count, avg(total_amount) FROM trips_mergetree GROUP BY passenger_count;
```

1.224 seconds.

Q3:

```sql
SELECT passenger_count, toYear(pickup_date) AS year, count(*) FROM trips_mergetree GROUP BY passenger_count, year;
```

2.104 seconds.

Q4:

```sql
SELECT passenger_count, toYear(pickup_date) AS year, round(trip_distance) AS distance, count(*)
FROM trips_mergetree
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC;
```

3.593 seconds.

The following server was used:

Two Intel(R) Xeon(R) CPU E5-2650 v2 @ 2.60GHz, 16 physical cores total, 128 GiB RAM, 8x6 TB HD on hardware RAID-5

Execution time is the best of three runs. But starting from the second run, queries read data from the file system cache. No further caching occurs: the data is read out and processed in each run.

Creating a table on three servers:

On each server:

```sql
CREATE TABLE default.trips_mergetree_third ( trip_id UInt32,  vendor_id Enum8('1' = 1, '2' = 2, 'CMT' = 3, 'VTS' = 4, 'DDS' = 5, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14),  pickup_date Date,  pickup_datetime DateTime,  dropoff_date Date,  dropoff_datetime DateTime,  store_and_fwd_flag UInt8,  rate_code_id UInt8,  pickup_longitude Float64,  pickup_latitude Float64,  dropoff_longitude Float64,  dropoff_latitude Float64,  passenger_count UInt8,  trip_distance Float64,  fare_amount Float32,  extra Float32,  mta_tax Float32,  tip_amount Float32,  tolls_amount Float32,  ehail_fee Float32,  improvement_surcharge Float32,  total_amount Float32,  payment_type_ Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),  trip_type UInt8,  pickup FixedString(25),  dropoff FixedString(25),  cab_type Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),  pickup_nyct2010_gid UInt8,  pickup_ctlabel Float32,  pickup_borocode UInt8,  pickup_boroname Enum8('' = 0, 'Manhattan' = 1, 'Bronx' = 2, 'Brooklyn' = 3, 'Queens' = 4, 'Staten Island' = 5),  pickup_ct2010 FixedString(6),  pickup_boroct2010 FixedString(7),  pickup_cdeligibil Enum8(' ' = 0, 'E' = 1, 'I' = 2),  pickup_ntacode FixedString(4),  pickup_ntaname Enum16('' = 0, 'Airport' = 1, 'Allerton-Pelham Gardens' = 2, 'Annadale-Huguenot-Prince\'s Bay-Eltingville' = 3, 'Arden Heights' = 4, 'Astoria' = 5, 'Auburndale' = 6, 'Baisley Park' = 7, 'Bath Beach' = 8, 'Battery Park City-Lower Manhattan' = 9, 'Bay Ridge' = 10, 'Bayside-Bayside Hills' = 11, 'Bedford' = 12, 'Bedford Park-Fordham North' = 13, 'Bellerose' = 14, 'Belmont' = 15, 'Bensonhurst East' = 16, 'Bensonhurst West' = 17, 'Borough Park' = 18, 'Breezy Point-Belle Harbor-Rockaway Park-Broad Channel' = 19, 'Briarwood-Jamaica Hills' = 20, 'Brighton Beach' = 21, 'Bronxdale' = 22, 'Brooklyn Heights-Cobble Hill' = 23, 'Brownsville' = 24, 'Bushwick North' = 25, 'Bushwick South' = 26, 'Cambria Heights' = 27, 'Canarsie' = 28, 'Carroll Gardens-Columbia Street-Red Hook' = 29, 'Central Harlem North-Polo Grounds' = 30, 'Central Harlem South' = 31, 'Charleston-Richmond Valley-Tottenville' = 32, 'Chinatown' = 33, 'Claremont-Bathgate' = 34, 'Clinton' = 35, 'Clinton Hill' = 36, 'Co-op City' = 37, 'College Point' = 38, 'Corona' = 39, 'Crotona Park East' = 40, 'Crown Heights North' = 41, 'Crown Heights South' = 42, 'Cypress Hills-City Line' = 43, 'DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill' = 44, 'Douglas Manor-Douglaston-Little Neck' = 45, 'Dyker Heights' = 46, 'East Concourse-Concourse Village' = 47, 'East Elmhurst' = 48, 'East Flatbush-Farragut' = 49, 'East Flushing' = 50, 'East Harlem North' = 51, 'East Harlem South' = 52, 'East New York' = 53, 'East New York (Pennsylvania Ave)' = 54, 'East Tremont' = 55, 'East Village' = 56, 'East Williamsburg' = 57, 'Eastchester-Edenwald-Baychester' = 58, 'Elmhurst' = 59, 'Elmhurst-Maspeth' = 60, 'Erasmus' = 61, 'Far Rockaway-Bayswater' = 62, 'Flatbush' = 63, 'Flatlands' = 64, 'Flushing' = 65, 'Fordham South' = 66, 'Forest Hills' = 67, 'Fort Greene' = 68, 'Fresh Meadows-Utopia' = 69, 'Ft. Totten-Bay Terrace-Clearview' = 70, 'Georgetown-Marine Park-Bergen Beach-Mill Basin' = 71, 'Glen Oaks-Floral Park-New Hyde Park' = 72, 'Glendale' = 73, 'Gramercy' = 74, 'Grasmere-Arrochar-Ft. Wadsworth' = 75, 'Gravesend' = 76, 'Great Kills' = 77, 'Greenpoint' = 78, 'Grymes Hill-Clifton-Fox Hills' = 79, 'Hamilton Heights' = 80, 'Hammels-Arverne-Edgemere' = 81, 'Highbridge' = 82, 'Hollis' = 83, 'Homecrest' = 84, 'Hudson Yards-Chelsea-Flatiron-Union Square' = 85, 'Hunters Point-Sunnyside-West Maspeth' = 86, 'Hunts Point' = 87, 'Jackson Heights' = 88, 'Jamaica' = 89, 'Jamaica Estates-Holliswood' = 90, 'Kensington-Ocean Parkway' = 91, 'Kew Gardens' = 92, 'Kew Gardens Hills' = 93, 'Kingsbridge Heights' = 94, 'Laurelton' = 95, 'Lenox Hill-Roosevelt Island' = 96, 'Lincoln Square' = 97, 'Lindenwood-Howard Beach' = 98, 'Longwood' = 99, 'Lower East Side' = 100, 'Madison' = 101, 'Manhattanville' = 102, 'Marble Hill-Inwood' = 103, 'Mariner\'s Harbor-Arlington-Port Ivory-Graniteville' = 104, 'Maspeth' = 105, 'Melrose South-Mott Haven North' = 106, 'Middle Village' = 107, 'Midtown-Midtown South' = 108, 'Midwood' = 109, 'Morningside Heights' = 110, 'Morrisania-Melrose' = 111, 'Mott Haven-Port Morris' = 112, 'Mount Hope' = 113, 'Murray Hill' = 114, 'Murray Hill-Kips Bay' = 115, 'New Brighton-Silver Lake' = 116, 'New Dorp-Midland Beach' = 117, 'New Springville-Bloomfield-Travis' = 118, 'North Corona' = 119, 'North Riverdale-Fieldston-Riverdale' = 120, 'North Side-South Side' = 121, 'Norwood' = 122, 'Oakland Gardens' = 123, 'Oakwood-Oakwood Beach' = 124, 'Ocean Hill' = 125, 'Ocean Parkway South' = 126, 'Old Astoria' = 127, 'Old Town-Dongan Hills-South Beach' = 128, 'Ozone Park' = 129, 'Park Slope-Gowanus' = 130, 'Parkchester' = 131, 'Pelham Bay-Country Club-City Island' = 132, 'Pelham Parkway' = 133, 'Pomonok-Flushing Heights-Hillcrest' = 134, 'Port Richmond' = 135, 'Prospect Heights' = 136, 'Prospect Lefferts Gardens-Wingate' = 137, 'Queens Village' = 138, 'Queensboro Hill' = 139, 'Queensbridge-Ravenswood-Long Island City' = 140, 'Rego Park' = 141, 'Richmond Hill' = 142, 'Ridgewood' = 143, 'Rikers Island' = 144, 'Rosedale' = 145, 'Rossville-Woodrow' = 146, 'Rugby-Remsen Village' = 147, 'Schuylerville-Throgs Neck-Edgewater Park' = 148, 'Seagate-Coney Island' = 149, 'Sheepshead Bay-Gerritsen Beach-Manhattan Beach' = 150, 'SoHo-TriBeCa-Civic Center-Little Italy' = 151, 'Soundview-Bruckner' = 152, 'Soundview-Castle Hill-Clason Point-Harding Park' = 153, 'South Jamaica' = 154, 'South Ozone Park' = 155, 'Springfield Gardens North' = 156, 'Springfield Gardens South-Brookville' = 157, 'Spuyten Duyvil-Kingsbridge' = 158, 'St. Albans' = 159, 'Stapleton-Rosebank' = 160, 'Starrett City' = 161, 'Steinway' = 162, 'Stuyvesant Heights' = 163, 'Stuyvesant Town-Cooper Village' = 164, 'Sunset Park East' = 165, 'Sunset Park West' = 166, 'Todt Hill-Emerson Hill-Heartland Village-Lighthouse Hill' = 167, 'Turtle Bay-East Midtown' = 168, 'University Heights-Morris Heights' = 169, 'Upper East Side-Carnegie Hill' = 170, 'Upper West Side' = 171, 'Van Cortlandt Village' = 172, 'Van Nest-Morris Park-Westchester Square' = 173, 'Washington Heights North' = 174, 'Washington Heights South' = 175, 'West Brighton' = 176, 'West Concourse' = 177, 'West Farms-Bronx River' = 178, 'West New Brighton-New Brighton-St. George' = 179, 'West Village' = 180, 'Westchester-Unionport' = 181, 'Westerleigh' = 182, 'Whitestone' = 183, 'Williamsbridge-Olinville' = 184, 'Williamsburg' = 185, 'Windsor Terrace' = 186, 'Woodhaven' = 187, 'Woodlawn-Wakefield' = 188, 'Woodside' = 189, 'Yorkville' = 190, 'park-cemetery-etc-Bronx' = 191, 'park-cemetery-etc-Brooklyn' = 192, 'park-cemetery-etc-Manhattan' = 193, 'park-cemetery-etc-Queens' = 194, 'park-cemetery-etc-Staten Island' = 195),  pickup_puma UInt16,  dropoff_nyct2010_gid UInt8,  dropoff_ctlabel Float32,  dropoff_borocode UInt8,  dropoff_boroname Enum8('' = 0, 'Manhattan' = 1, 'Bronx' = 2, 'Brooklyn' = 3, 'Queens' = 4, 'Staten Island' = 5),  dropoff_ct2010 FixedString(6),  dropoff_boroct2010 FixedString(7),  dropoff_cdeligibil Enum8(' ' = 0, 'E' = 1, 'I' = 2),  dropoff_ntacode FixedString(4),  dropoff_ntaname Enum16('' = 0, 'Airport' = 1, 'Allerton-Pelham Gardens' = 2, 'Annadale-Huguenot-Prince\'s Bay-Eltingville' = 3, 'Arden Heights' = 4, 'Astoria' = 5, 'Auburndale' = 6, 'Baisley Park' = 7, 'Bath Beach' = 8, 'Battery Park City-Lower Manhattan' = 9, 'Bay Ridge' = 10, 'Bayside-Bayside Hills' = 11, 'Bedford' = 12, 'Bedford Park-Fordham North' = 13, 'Bellerose' = 14, 'Belmont' = 15, 'Bensonhurst East' = 16, 'Bensonhurst West' = 17, 'Borough Park' = 18, 'Breezy Point-Belle Harbor-Rockaway Park-Broad Channel' = 19, 'Briarwood-Jamaica Hills' = 20, 'Brighton Beach' = 21, 'Bronxdale' = 22, 'Brooklyn Heights-Cobble Hill' = 23, 'Brownsville' = 24, 'Bushwick North' = 25, 'Bushwick South' = 26, 'Cambria Heights' = 27, 'Canarsie' = 28, 'Carroll Gardens-Columbia Street-Red Hook' = 29, 'Central Harlem North-Polo Grounds' = 30, 'Central Harlem South' = 31, 'Charleston-Richmond Valley-Tottenville' = 32, 'Chinatown' = 33, 'Claremont-Bathgate' = 34, 'Clinton' = 35, 'Clinton Hill' = 36, 'Co-op City' = 37, 'College Point' = 38, 'Corona' = 39, 'Crotona Park East' = 40, 'Crown Heights North' = 41, 'Crown Heights South' = 42, 'Cypress Hills-City Line' = 43, 'DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill' = 44, 'Douglas Manor-Douglaston-Little Neck' = 45, 'Dyker Heights' = 46, 'East Concourse-Concourse Village' = 47, 'East Elmhurst' = 48, 'East Flatbush-Farragut' = 49, 'East Flushing' = 50, 'East Harlem North' = 51, 'East Harlem South' = 52, 'East New York' = 53, 'East New York (Pennsylvania Ave)' = 54, 'East Tremont' = 55, 'East Village' = 56, 'East Williamsburg' = 57, 'Eastchester-Edenwald-Baychester' = 58, 'Elmhurst' = 59, 'Elmhurst-Maspeth' = 60, 'Erasmus' = 61, 'Far Rockaway-Bayswater' = 62, 'Flatbush' = 63, 'Flatlands' = 64, 'Flushing' = 65, 'Fordham South' = 66, 'Forest Hills' = 67, 'Fort Greene' = 68, 'Fresh Meadows-Utopia' = 69, 'Ft. Totten-Bay Terrace-Clearview' = 70, 'Georgetown-Marine Park-Bergen Beach-Mill Basin' = 71, 'Glen Oaks-Floral Park-New Hyde Park' = 72, 'Glendale' = 73, 'Gramercy' = 74, 'Grasmere-Arrochar-Ft. Wadsworth' = 75, 'Gravesend' = 76, 'Great Kills' = 77, 'Greenpoint' = 78, 'Grymes Hill-Clifton-Fox Hills' = 79, 'Hamilton Heights' = 80, 'Hammels-Arverne-Edgemere' = 81, 'Highbridge' = 82, 'Hollis' = 83, 'Homecrest' = 84, 'Hudson Yards-Chelsea-Flatiron-Union Square' = 85, 'Hunters Point-Sunnyside-West Maspeth' = 86, 'Hunts Point' = 87, 'Jackson Heights' = 88, 'Jamaica' = 89, 'Jamaica Estates-Holliswood' = 90, 'Kensington-Ocean Parkway' = 91, 'Kew Gardens' = 92, 'Kew Gardens Hills' = 93, 'Kingsbridge Heights' = 94, 'Laurelton' = 95, 'Lenox Hill-Roosevelt Island' = 96, 'Lincoln Square' = 97, 'Lindenwood-Howard Beach' = 98, 'Longwood' = 99, 'Lower East Side' = 100, 'Madison' = 101, 'Manhattanville' = 102, 'Marble Hill-Inwood' = 103, 'Mariner\'s Harbor-Arlington-Port Ivory-Graniteville' = 104, 'Maspeth' = 105, 'Melrose South-Mott Haven North' = 106, 'Middle Village' = 107, 'Midtown-Midtown South' = 108, 'Midwood' = 109, 'Morningside Heights' = 110, 'Morrisania-Melrose' = 111, 'Mott Haven-Port Morris' = 112, 'Mount Hope' = 113, 'Murray Hill' = 114, 'Murray Hill-Kips Bay' = 115, 'New Brighton-Silver Lake' = 116, 'New Dorp-Midland Beach' = 117, 'New Springville-Bloomfield-Travis' = 118, 'North Corona' = 119, 'North Riverdale-Fieldston-Riverdale' = 120, 'North Side-South Side' = 121, 'Norwood' = 122, 'Oakland Gardens' = 123, 'Oakwood-Oakwood Beach' = 124, 'Ocean Hill' = 125, 'Ocean Parkway South' = 126, 'Old Astoria' = 127, 'Old Town-Dongan Hills-South Beach' = 128, 'Ozone Park' = 129, 'Park Slope-Gowanus' = 130, 'Parkchester' = 131, 'Pelham Bay-Country Club-City Island' = 132, 'Pelham Parkway' = 133, 'Pomonok-Flushing Heights-Hillcrest' = 134, 'Port Richmond' = 135, 'Prospect Heights' = 136, 'Prospect Lefferts Gardens-Wingate' = 137, 'Queens Village' = 138, 'Queensboro Hill' = 139, 'Queensbridge-Ravenswood-Long Island City' = 140, 'Rego Park' = 141, 'Richmond Hill' = 142, 'Ridgewood' = 143, 'Rikers Island' = 144, 'Rosedale' = 145, 'Rossville-Woodrow' = 146, 'Rugby-Remsen Village' = 147, 'Schuylerville-Throgs Neck-Edgewater Park' = 148, 'Seagate-Coney Island' = 149, 'Sheepshead Bay-Gerritsen Beach-Manhattan Beach' = 150, 'SoHo-TriBeCa-Civic Center-Little Italy' = 151, 'Soundview-Bruckner' = 152, 'Soundview-Castle Hill-Clason Point-Harding Park' = 153, 'South Jamaica' = 154, 'South Ozone Park' = 155, 'Springfield Gardens North' = 156, 'Springfield Gardens South-Brookville' = 157, 'Spuyten Duyvil-Kingsbridge' = 158, 'St. Albans' = 159, 'Stapleton-Rosebank' = 160, 'Starrett City' = 161, 'Steinway' = 162, 'Stuyvesant Heights' = 163, 'Stuyvesant Town-Cooper Village' = 164, 'Sunset Park East' = 165, 'Sunset Park West' = 166, 'Todt Hill-Emerson Hill-Heartland Village-Lighthouse Hill' = 167, 'Turtle Bay-East Midtown' = 168, 'University Heights-Morris Heights' = 169, 'Upper East Side-Carnegie Hill' = 170, 'Upper West Side' = 171, 'Van Cortlandt Village' = 172, 'Van Nest-Morris Park-Westchester Square' = 173, 'Washington Heights North' = 174, 'Washington Heights South' = 175, 'West Brighton' = 176, 'West Concourse' = 177, 'West Farms-Bronx River' = 178, 'West New Brighton-New Brighton-St. George' = 179, 'West Village' = 180, 'Westchester-Unionport' = 181, 'Westerleigh' = 182, 'Whitestone' = 183, 'Williamsbridge-Olinville' = 184, 'Williamsburg' = 185, 'Windsor Terrace' = 186, 'Woodhaven' = 187, 'Woodlawn-Wakefield' = 188, 'Woodside' = 189, 'Yorkville' = 190, 'park-cemetery-etc-Bronx' = 191, 'park-cemetery-etc-Brooklyn' = 192, 'park-cemetery-etc-Manhattan' = 193, 'park-cemetery-etc-Queens' = 194, 'park-cemetery-etc-Staten Island' = 195),  dropoff_puma UInt16) ENGINE = MergeTree(pickup_date, pickup_datetime, 8192);
```

On the source server:

```sql
CREATE TABLE trips_mergetree_x3 AS trips_mergetree_third ENGINE = Distributed(perftest, default, trips_mergetree_third, rand());
```

The following query redistributes data:

```sql
INSERT INTO trips_mergetree_x3 SELECT * FROM trips_mergetree;
```

This takes 2454 seconds.

On three servers:

Q1: 0.212 seconds.
Q2: 0.438 seconds.
Q3: 0.733 seconds.
Q4: 1.241 seconds.

No surprises here, since the queries are scaled linearly.

We also have the results from a cluster of 140 servers:

Q1: 0.028 sec.
Q2: 0.043 sec.
Q3: 0.051 sec.
Q4: 0.072 sec.

In this case, the query processing time is determined above all by network latency.
We ran queries using a client located in a different datacenter than where the cluster was located, which added about 20 ms of latency.

## Summary {#summary}

| servers | Q1    | Q2    | Q3    | Q4    |
|---------|-------|-------|-------|-------|
| 1, E5-2650v2          | 0.490 | 1.224 | 2.104 | 3.593 |
| 3, E5-2650v2          | 0.212 | 0.438 | 0.733 | 1.241 |
| 1, AWS c5n.4xlarge    | 0.249 | 1.279 | 1.738 | 3.527 |
| 1, AWS c5n.9xlarge    | 0.130 | 0.584 | 0.777 | 1.811 |
| 3, AWS c5n.9xlarge    | 0.057 | 0.231 | 0.285 | 0.641 |
| 140, E5-2650v2        | 0.028 | 0.043 | 0.051 | 0.072 |
