---
slug: /tutorial
sidebar_label: 'Tutorial avanzado'
title: 'Tutorial avanzado'
description: 'Aprende a ingestar y consultar datos en ClickHouse usando una fuente de datos de ejemplo de taxis de la ciudad de Nueva York..'
sidebar_position: 0.5
keywords: ['clickhouse', 'install', 'tutorial', 'dictionary', 'dictionaries', 'example', 'advanced', 'taxi', 'new york', 'nyc']
show_related_blogs: true
---

# Tutorial avanzado

## Descripción general {#overview}

Aprende a ingestar y consultar datos en ClickHouse utilizando la fuente de datos de ejemplo de taxis de la ciudad de Nueva York.  

### Requisitos {#prerequisites}

Necesitas tener acceso a un servicio ClickHouse en funcionamiento para completar este tutorial. Para obtener instrucciones, consulta la guía de [Inicio rápido](/get-started/quick-start).

<VerticalStepper>

## Crear una nueva tabla {#create-a-new-table}

La fuente de datos de taxis de la ciudad de Nueva York contiene información sobre millones de viajes, incluyendo columnas como monto de la propina, peajes, tipo de pago y más. Crea una tabla para almacenar estos datos.

1. Conéctate a la consola SQL:  
   - En ClickHouse Cloud, selecciona un servicio del menú desplegable y luego selecciona **SQL Console** en el menú de navegación izquierdo.  
   - En ClickHouse autogestionado, conéctate a la consola SQL en `https://_hostname_:8443/play`. Consulta con tu administrador de ClickHouse para obtener los detalles.

2. Crea la siguiente tabla `trips` en la base de datos `default`:
    ```sql
    CREATE TABLE trips
    (
        `trip_id` UInt32,
        `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
        `pickup_date` Date,
        `pickup_datetime` DateTime,
        `dropoff_date` Date,
        `dropoff_datetime` DateTime,
        `store_and_fwd_flag` UInt8,
        `rate_code_id` UInt8,
        `pickup_longitude` Float64,
        `pickup_latitude` Float64,
        `dropoff_longitude` Float64,
        `dropoff_latitude` Float64,
        `passenger_count` UInt8,
        `trip_distance` Float64,
        `fare_amount` Float32,
        `extra` Float32,
        `mta_tax` Float32,
        `tip_amount` Float32,
        `tolls_amount` Float32,
        `ehail_fee` Float32,
        `improvement_surcharge` Float32,
        `total_amount` Float32,
        `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
        `trip_type` UInt8,
        `pickup` FixedString(25),
        `dropoff` FixedString(25),
        `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
        `pickup_nyct2010_gid` Int8,
        `pickup_ctlabel` Float32,
        `pickup_borocode` Int8,
        `pickup_ct2010` String,
        `pickup_boroct2010` String,
        `pickup_cdeligibil` String,
        `pickup_ntacode` FixedString(4),
        `pickup_ntaname` String,
        `pickup_puma` UInt16,
        `dropoff_nyct2010_gid` UInt8,
        `dropoff_ctlabel` Float32,
        `dropoff_borocode` UInt8,
        `dropoff_ct2010` String,
        `dropoff_boroct2010` String,
        `dropoff_cdeligibil` String,
        `dropoff_ntacode` FixedString(4),
        `dropoff_ntaname` String,
        `dropoff_puma` UInt16
    )
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(pickup_date)
    ORDER BY pickup_datetime;
    ```

## Agregar la fuente de datos {#add-the-dataset}

Ahora que has creado la tabla, agrega los datos de taxis de la ciudad de Nueva York desde archivos CSV en S3.

1. El siguiente comando inserta aproximadamente 2,000,000 de filas en tu tabla `trips` desde dos archivos diferentes en S3:

`trips_1.tsv.gz` and `trips_2.tsv.gz`:

    ```sql
    INSERT INTO trips
    SELECT * FROM s3(
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{1..2}.gz',
        'TabSeparatedWithNames', "
        `trip_id` UInt32,
        `vendor_id` Enum8('1' = 1, '2' = 2, '3' = 3, '4' = 4, 'CMT' = 5, 'VTS' = 6, 'DDS' = 7, 'B02512' = 10, 'B02598' = 11, 'B02617' = 12, 'B02682' = 13, 'B02764' = 14, '' = 15),
        `pickup_date` Date,
        `pickup_datetime` DateTime,
        `dropoff_date` Date,
        `dropoff_datetime` DateTime,
        `store_and_fwd_flag` UInt8,
        `rate_code_id` UInt8,
        `pickup_longitude` Float64,
        `pickup_latitude` Float64,
        `dropoff_longitude` Float64,
        `dropoff_latitude` Float64,
        `passenger_count` UInt8,
        `trip_distance` Float64,
        `fare_amount` Float32,
        `extra` Float32,
        `mta_tax` Float32,
        `tip_amount` Float32,
        `tolls_amount` Float32,
        `ehail_fee` Float32,
        `improvement_surcharge` Float32,
        `total_amount` Float32,
        `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4),
        `trip_type` UInt8,
        `pickup` FixedString(25),
        `dropoff` FixedString(25),
        `cab_type` Enum8('yellow' = 1, 'green' = 2, 'uber' = 3),
        `pickup_nyct2010_gid` Int8,
        `pickup_ctlabel` Float32,
        `pickup_borocode` Int8,
        `pickup_ct2010` String,
        `pickup_boroct2010` String,
        `pickup_cdeligibil` String,
        `pickup_ntacode` FixedString(4),
        `pickup_ntaname` String,
        `pickup_puma` UInt16,
        `dropoff_nyct2010_gid` UInt8,
        `dropoff_ctlabel` Float32,
        `dropoff_borocode` UInt8,
        `dropoff_ct2010` String,
        `dropoff_boroct2010` String,
        `dropoff_cdeligibil` String,
        `dropoff_ntacode` FixedString(4),
        `dropoff_ntaname` String,
        `dropoff_puma` UInt16
    ") SETTINGS input_format_try_infer_datetimes = 0
    ```
2. Espera a que el `INSERT` termine. Puede tardar un momento, ya que se deben descargar aproximadamente 150 MB de datos.

3. Cuando la inserción haya finalizado, verifica que se realizó correctamente:
    ```sql
    SELECT count() FROM trips
    ```

    Esta consulta debería devolver 1,999,657 filas.

## Analizar los datos {#analyze-the-data}

Ejecuta algunas consultas para analizar los datos. Explora los siguientes ejemplos o prueba tu propia consulta SQL.

- Calcula el monto promedio de propina:
    ```sql
    SELECT round(avg(tip_amount), 2) FROM trips
    ```
    <details>
    <summary>Expected output</summary>
    <p>
    
    ```response
    ┌─round(avg(tip_amount), 2)─┐
    │                      1.68 │
    └───────────────────────────┘
    ```

    </p>
    </details>

- Calcula el costo promedio según el número de pasajeros:

    ```sql
    SELECT
        passenger_count,
        ceil(avg(total_amount),2) AS average_total_amount
    FROM trips
    GROUP BY passenger_count
    ```
    
    <details>
    <summary>Expected output</summary>
    <p>

    The `passenger_count` ranges from 0 to 9:

    ```response
    ┌─passenger_count─┬─average_total_amount─┐
    │               0 │                22.69 │
    │               1 │                15.97 │
    │               2 │                17.15 │
    │               3 │                16.76 │
    │               4 │                17.33 │
    │               5 │                16.35 │
    │               6 │                16.04 │
    │               7 │                 59.8 │
    │               8 │                36.41 │
    │               9 │                 9.81 │
    └─────────────────┴──────────────────────┘
    ```

    </p>
    </details>

- Calcula el número diario de recogidas por vecindario:

    ```sql
    SELECT
        pickup_date,
        pickup_ntaname,
        SUM(1) AS number_of_trips
    FROM trips
    GROUP BY pickup_date, pickup_ntaname
    ORDER BY pickup_date ASC
    ```

    <details>
    <summary>Expected output</summary>
    <p>

    ```response
    ┌─pickup_date─┬─pickup_ntaname───────────────────────────────────────────┬─number_of_trips─┐
    │  2015-07-01 │ Brooklyn Heights-Cobble Hill                             │              13 │
    │  2015-07-01 │ Old Astoria                                              │               5 │
    │  2015-07-01 │ Flushing                                                 │               1 │
    │  2015-07-01 │ Yorkville                                                │             378 │
    │  2015-07-01 │ Gramercy                                                 │             344 │
    │  2015-07-01 │ Fordham South                                            │               2 │
    │  2015-07-01 │ SoHo-TriBeCa-Civic Center-Little Italy                   │             621 │
    │  2015-07-01 │ Park Slope-Gowanus                                       │              29 │
    │  2015-07-01 │ Bushwick South                                           │               5 │
    ```

    </p>
    </details>

- Calcula la duración de cada viaje en minutos y luego agrupa los resultados por duración del viaje:

    ```sql
    SELECT
        avg(tip_amount) AS avg_tip,
        avg(fare_amount) AS avg_fare,
        avg(passenger_count) AS avg_passenger,
        count() AS count,
        truncate(date_diff('second', pickup_datetime, dropoff_datetime)/60) as trip_minutes
    FROM trips
    WHERE trip_minutes > 0
    GROUP BY trip_minutes
    ORDER BY trip_minutes DESC
    ```
    <details>
    <summary>Expected output</summary>
    <p>
    
    ```response
    ┌──────────────avg_tip─┬───────────avg_fare─┬──────avg_passenger─┬──count─┬─trip_minutes─┐
    │   1.9600000381469727 │                  8 │                  1 │      1 │        27511 │
    │                    0 │                 12 │                  2 │      1 │        27500 │
    │    0.542166673981895 │ 19.716666666666665 │ 1.9166666666666667 │     60 │         1439 │
    │    0.902499997522682 │ 11.270625001192093 │            1.95625 │    160 │         1438 │
    │   0.9715789457909146 │ 13.646616541353383 │ 2.0526315789473686 │    133 │         1437 │
    │   0.9682692398245518 │ 14.134615384615385 │  2.076923076923077 │    104 │         1436 │
    │   1.1022105210705808 │ 13.778947368421052 │  2.042105263157895 │     95 │         1435 │
    ```
    </p>
    </details>

- Muestra el número de recogidas en cada barrio desglosado por hora del día:

    ```sql
    SELECT
        pickup_ntaname,
        toHour(pickup_datetime) as pickup_hour,
        SUM(1) AS pickups
    FROM trips
    WHERE pickup_ntaname != ''
    GROUP BY pickup_ntaname, pickup_hour
    ORDER BY pickup_ntaname, pickup_hour
    ```
    <details>
    <summary>Expected output</summary>
    <p>

    ```response
    ┌─pickup_ntaname───────────────────────────────────────────┬─pickup_hour─┬─pickups─┐
    │ Airport                                                  │           0 │    3509 │
    │ Airport                                                  │           1 │    1184 │
    │ Airport                                                  │           2 │     401 │
    │ Airport                                                  │           3 │     152 │
    │ Airport                                                  │           4 │     213 │
    │ Airport                                                  │           5 │     955 │
    │ Airport                                                  │           6 │    2161 │
    │ Airport                                                  │           7 │    3013 │
    │ Airport                                                  │           8 │    3601 │
    │ Airport                                                  │           9 │    3792 │
    │ Airport                                                  │          10 │    4546 │
    │ Airport                                                  │          11 │    4659 │
    │ Airport                                                  │          12 │    4621 │
    │ Airport                                                  │          13 │    5348 │
    │ Airport                                                  │          14 │    5889 │
    │ Airport                                                  │          15 │    6505 │
    │ Airport                                                  │          16 │    6119 │
    │ Airport                                                  │          17 │    6341 │
    │ Airport                                                  │          18 │    6173 │
    │ Airport                                                  │          19 │    6329 │
    │ Airport                                                  │          20 │    6271 │
    │ Airport                                                  │          21 │    6649 │
    │ Airport                                                  │          22 │    6356 │
    │ Airport                                                  │          23 │    6016 │
    │ Allerton-Pelham Gardens                                  │           4 │       1 │
    │ Allerton-Pelham Gardens                                  │           6 │       1 │
    │ Allerton-Pelham Gardens                                  │           7 │       1 │
    │ Allerton-Pelham Gardens                                  │           9 │       5 │
    │ Allerton-Pelham Gardens                                  │          10 │       3 │
    │ Allerton-Pelham Gardens                                  │          15 │       1 │
    │ Allerton-Pelham Gardens                                  │          20 │       2 │
    │ Allerton-Pelham Gardens                                  │          23 │       1 │
    │ Annadale-Huguenot-Prince's Bay-Eltingville               │          23 │       1 │
    │ Arden Heights                                            │          11 │       1 │
    ```

    </p>
    </details>
    
7. Recupera los viajes hacia los aeropuertos LaGuardia o JFK:

    ```sql
    SELECT
        pickup_datetime,
        dropoff_datetime,
        total_amount,
        pickup_nyct2010_gid,
        dropoff_nyct2010_gid,
        CASE
            WHEN dropoff_nyct2010_gid = 138 THEN 'LGA'
            WHEN dropoff_nyct2010_gid = 132 THEN 'JFK'
        END AS airport_code,
        EXTRACT(YEAR FROM pickup_datetime) AS year,
        EXTRACT(DAY FROM pickup_datetime) AS day,
        EXTRACT(HOUR FROM pickup_datetime) AS hour
    FROM trips
    WHERE dropoff_nyct2010_gid IN (132, 138)
    ORDER BY pickup_datetime
    ```

    <details>
    <summary>Expected output</summary>
    <p>

    ```response
    ┌─────pickup_datetime─┬────dropoff_datetime─┬─total_amount─┬─pickup_nyct2010_gid─┬─dropoff_nyct2010_gid─┬─airport_code─┬─year─┬─day─┬─hour─┐
    │ 2015-07-01 00:04:14 │ 2015-07-01 00:15:29 │         13.3 │                 -34 │                  132 │ JFK          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:09:42 │ 2015-07-01 00:12:55 │          6.8 │                  50 │                  138 │ LGA          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:23:04 │ 2015-07-01 00:24:39 │          4.8 │                -125 │                  132 │ JFK          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:27:51 │ 2015-07-01 00:39:02 │        14.72 │                -101 │                  138 │ LGA          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:32:03 │ 2015-07-01 00:55:39 │        39.34 │                  48 │                  138 │ LGA          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:34:12 │ 2015-07-01 00:40:48 │         9.95 │                 -93 │                  132 │ JFK          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:38:26 │ 2015-07-01 00:49:00 │         13.3 │                 -11 │                  138 │ LGA          │ 2015 │   1 │    0 │
    │ 2015-07-01 00:41:48 │ 2015-07-01 00:44:45 │          6.3 │                 -94 │                  132 │ JFK          │ 2015 │   1 │    0 │
    │ 2015-07-01 01:06:18 │ 2015-07-01 01:14:43 │        11.76 │                  37 │                  132 │ JFK          │ 2015 │   1 │    1 │
    ```

    </p>
    </details>

## Crear un diccionario {#create-a-dictionary}

Un diccionario es un mapeo de pares clave-valor almacenado en memoria. Para más detalles, consulta [Dictionaries](/sql-reference/dictionaries/index.md).

Crea un diccionario asociado a una tabla en tu servicio ClickHouse.

La tabla y el diccionario se basan en un archivo CSV que contiene una fila por cada vecindario de Nueva York.

Los vecindarios se asignan a los nombres de los cinco distritos de Nueva York (Bronx, Brooklyn, Manhattan, Queens y Staten Island), así como al Aeropuerto de Newark (EWR).

Aquí tienes un extracto del archivo CSV que estás usando, en formato de tabla. La columna `LocationID` en el archivo se mapea a las columnas `pickup_nyct2010_gid` y `dropoff_nyct2010_gid` en tu tabla `trips`:


  | LocationID      | Borough |  Zone      | service_zone |
  | ----------- | ----------- |   ----------- | ----------- |
  | 1      | EWR       |  Newark Airport   | EWR        |
  | 2    |   Queens     |   Jamaica Bay   |      Boro Zone   |
  | 3   |   Bronx     |  Allerton/Pelham Gardens    |    Boro Zone     |
  | 4     |    Manhattan    |    Alphabet City  |     Yellow Zone    |
  | 5     |  Staten Island      |   Arden Heights   |    Boro Zone     |

1. Ejecuta el siguiente comando SQL, que crea un diccionario llamado `taxi_zone_dictionary` y lo llena a partir del archivo CSV en S3.  
La URL del archivo es `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv`:

  ```sql
  CREATE DICTIONARY taxi_zone_dictionary
  (
    `LocationID` UInt16 DEFAULT 0,
    `Borough` String,
    `Zone` String,
    `service_zone` String
  )
  PRIMARY KEY LocationID
  SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
  LIFETIME(MIN 0 MAX 0)
  LAYOUT(HASHED_ARRAY())
  ```

:::note
Configurar `LIFETIME` en 0 desactiva las actualizaciones automáticas para evitar tráfico innecesario hacia nuestro bucket de S3. En otros casos, podrías configurarlo de manera diferente. Para más detalles, consulta [Actualizar los datos de un diccionario usando LIFETIME](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).
:::


3. Verifica que haya funcionado. La siguiente consulta debería devolver 265 filas, es decir, una fila por cada barrio:

    ```sql
    SELECT * FROM taxi_zone_dictionary
    ```

4. Usa la función `dictGet` ([o sus variaciones](./sql-reference/functions/ext-dict-functions.md)) para obtener un valor de un diccionario. Debes pasar el nombre del diccionario, el valor que deseas recuperar y la clave (en nuestro ejemplo, la columna `LocationID` del diccionario `taxi_zone_dictionary`).

    Por ejemplo, la siguiente consulta devuelve el `Borough` cuyo `LocationID` es 132, que corresponde al aeropuerto JFK:

    ```sql
    SELECT dictGet('taxi_zone_dictionary', 'Borough', 132)
    ```

    JFK se encuentra en Queens. Observa que el tiempo para recuperar el valor es prácticamente 0:

    ```response
    ┌─dictGet('taxi_zone_dictionary', 'Borough', 132)─┐
    │ Queens                                          │
    └─────────────────────────────────────────────────┘

    1 rows in set. Elapsed: 0.004 sec.
    ```

5. Usa la función `dictHas` para verificar si una clave está presente en el diccionario. Por ejemplo, la siguiente consulta devuelve `1` (que representa "true" en ClickHouse):

    ```sql
    SELECT dictHas('taxi_zone_dictionary', 132)
    ```

6. La siguiente consulta devuelve `0` porque 4567 no es un valor de `LocationID` en el diccionario:

    ```sql
    SELECT dictHas('taxi_zone_dictionary', 4567)
    ```

7. Usa la función `dictGet` para recuperar el nombre de un `borough` en una consulta. Por ejemplo:

    ```sql
    SELECT
        count(1) AS total,
        dictGetOrDefault('taxi_zone_dictionary','Borough', toUInt64(pickup_nyct2010_gid), 'Unknown') AS borough_name
    FROM trips
    WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
    GROUP BY borough_name
    ORDER BY total DESC
    ```

    Esta consulta suma el número de viajes de taxi por `borough` que terminan en los aeropuertos LaGuardia o JFK. El resultado se verá así, y notarás que hay varios viajes donde el barrio de origen es desconocido:

    ```response
    ┌─total─┬─borough_name──┐
    │ 23683 │ Unknown       │
    │  7053 │ Manhattan     │
    │  6828 │ Brooklyn      │
    │  4458 │ Queens        │
    │  2670 │ Bronx         │
    │   554 │ Staten Island │
    │    53 │ EWR           │
    └───────┴───────────────┘

    7 rows in set. Elapsed: 0.019 sec. Processed 2.00 million rows, 4.00 MB (105.70 million rows/s., 211.40 MB/s.)
    ```

## Realizar un JOIN {#perform-a-join}

Escribe algunas consultas que unan la `taxi_zone_dictionary` con tu tabla `trips`.

1. Comienza con un `JOIN` simple que funcione de manera similar a la consulta de aeropuertos anterior:
    ```sql
    SELECT
        count(1) AS total,
        Borough
    FROM trips
    JOIN taxi_zone_dictionary ON toUInt64(trips.pickup_nyct2010_gid) = taxi_zone_dictionary.LocationID
    WHERE dropoff_nyct2010_gid = 132 OR dropoff_nyct2010_gid = 138
    GROUP BY Borough
    ORDER BY total DESC
    ```

    La respuesta es idéntica a la consulta `dictGet`:
    
    ```response
    ┌─total─┬─Borough───────┐
    │  7053 │ Manhattan     │
    │  6828 │ Brooklyn      │
    │  4458 │ Queens        │
    │  2670 │ Bronx         │
    │   554 │ Staten Island │
    │    53 │ EWR           │
    └───────┴───────────────┘

    6 rows in set. Elapsed: 0.034 sec. Processed 2.00 million rows, 4.00 MB (59.14 million rows/s., 118.29 MB/s.)
    ```

    :::note
    Observa que el resultado de la consulta `JOIN` anterior es el mismo que el de la consulta anterior que utilizaba `dictGetOrDefault` (excepto que los valores `Unknown` no están incluidos). Detrás de escena, ClickHouse en realidad está llamando a la función `dictGet` para el diccionario `taxi_zone_dictionary`, pero la sintaxis `JOIN` resulta más familiar para los desarrolladores de SQL.
    :::

2. Esta consulta devuelve las filas correspondientes a los 1000 viajes con mayor propina, y luego realiza un **inner join** de cada fila con el diccionario:

    ```sql
    SELECT *
    FROM trips
    JOIN taxi_zone_dictionary
        ON trips.dropoff_nyct2010_gid = taxi_zone_dictionary.LocationID
    WHERE tip_amount > 0
    ORDER BY tip_amount DESC
    LIMIT 1000
    ```
        :::note
        Generalmente, se evita usar `SELECT *` con frecuencia en ClickHouse. Solo se deben recuperar las columnas que realmente necesitas. Sin embargo, esta consulta es más lenta para fines del ejemplo.
        :::


</VerticalStepper>

## Próximos pasos {#next-steps}

Aprende más sobre ClickHouse con la siguiente documentación:

- [Introducción a los índices primarios en ClickHouse](./guides/best-practices/sparse-primary-indexes.md): Aprende cómo ClickHouse utiliza índices primarios dispersos para localizar eficientemente los datos relevantes durante las consultas. 
- [Integrar una fuente de datos externa](/integrations/index.mdx): Revisa las opciones de integración de fuentes de datos, incluyendo archivos, Kafka, PostgreSQL, pipelines de datos y muchas más.
- [Visualizar datos en ClickHouse](./integrations/data-visualization/index.md): Conecta tu herramienta UI/BI favorita a ClickHouse.
- [Referencia SQL](./sql-reference/index.md): Explora las funciones SQL disponibles en ClickHouse para transformar, procesar y analizar datos.
