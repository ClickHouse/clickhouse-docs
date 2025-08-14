---
slug: /intro
sidebar_label: '¿Qué es ClickHouse?'
description: 'ClickHouse® es un sistema de gestión de bases de datos (DBMS) orientado a columnas para el procesamiento analítico en línea (OLAP). Está disponible tanto como software de código abierto como en una oferta en la nube.'
title: '¿Qué es ClickHouse?'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® es un sistema de gestión de bases de datos (DBMS) orientado a columnas para el procesamiento analítico en línea (OLAP). Está disponible tanto como [software de código abierto](https://github.com/ClickHouse/ClickHouse) como en una [oferta en la nube](https://clickhouse.com/cloud).

## ¿Qué es la analítica? {#what-are-analytics}

La analítica, también conocida como OLAP (Online Analytical Processing), se refiere a consultas SQL con cálculos complejos (por ejemplo, agregaciones, procesamiento de cadenas, operaciones aritméticas) sobre conjuntos de datos masivos.

A diferencia de las consultas transaccionales (o OLTP, Online Transaction Processing), que leen y escriben solo unas pocas filas por consulta y, por lo tanto, se completan en milisegundos, las consultas analíticas procesan rutinariamente miles de millones o billones de filas.

En muchos casos de uso, [las consultas analíticas deben ser “en tiempo real”](https://clickhouse.com/engineering-resources/what-is-real-time-analytics), es decir, devolver un resultado en menos de un segundo.

## Almacenamiento orientado a filas vs. orientado a columnas {#row-oriented-vs-column-oriented-storage}

Un nivel de rendimiento como este solo puede alcanzarse con la orientación de datos adecuada.

Las bases de datos almacenan la información ya sea de forma [orientada a filas o a columnas](https://clickhouse.com/engineering-resources/what-is-columnar-database).

En una base de datos orientada a filas, las filas consecutivas de una tabla se almacenan secuencialmente una tras otra. Este formato permite recuperar filas rápidamente, ya que los valores de las columnas de cada fila se guardan juntos.

ClickHouse es una base de datos orientada a columnas. En este tipo de sistemas, las tablas se almacenan como una colección de columnas, es decir, los valores de cada columna se guardan secuencialmente uno tras otro. Este formato hace que sea más difícil reconstruir filas individuales (ya que ahora existen “saltos” entre los valores de las filas), pero las operaciones por columna, como filtros o agregaciones, se vuelven mucho más rápidas que en una base de datos orientada a filas.

La diferencia se entiende mejor con un ejemplo de consulta ejecutada sobre 100 millones de filas de [datos reales y anonimizados de analítica web](/getting-started/example-datasets/metrica):

```sql
SELECT MobilePhoneModel, COUNT() AS c
FROM metrica.hits
WHERE
      RegionID = 229
  AND EventDate >= '2013-07-01'
  AND EventDate <= '2013-07-31'
  AND MobilePhone != 0
  AND MobilePhoneModel not in ['', 'iPad']
GROUP BY MobilePhoneModel
ORDER BY c DESC
LIMIT 8;
```

Puedes ejecutar esta consulta en el [ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true), que selecciona y filtra [solo unas pocas de entre más de 100](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true) columnas existentes, devolviendo el resultado en milisegundos:

<Image img={column_example} alt="Example query in a column-oriented database" size="lg"/>

Como puedes ver en la sección de estadísticas del diagrama anterior, la consulta procesó 100 millones de filas en 92 milisegundos, con un rendimiento de aproximadamente más de 1.000 millones de filas por segundo o algo menos de 7 GB de datos transferidos por segundo.

**SGBD (DBMS) orientado a filas**

En una base de datos orientada a filas, aunque la consulta solo necesite unas pocas columnas, el sistema debe cargar también las demás, ya que los datos se almacenan en fragmentos de tamaño fijo llamados [bloques](https://en.wikipedia.org/wiki/Block_(data_storage)) (por ejemplo, 4 KB u 8 KB). Los bloques son la unidad mínima que se lee del disco a la memoria. Así, incluso si solo se requiere una parte de un bloque, este se carga completo, tanto por la forma en que funciona el disco como por las reglas del sistema de archivos.

<Image img={row_orientated} alt="Row-oriented database structure" size="lg"/>

**SGBD (DBMS) orientado a columnas**

Dado que los valores de cada columna se almacenan de forma secuencial en el disco, la consulta anterior no carga datos innecesarios. El almacenamiento y la transferencia por bloques, alineados con el patrón de acceso de las consultas analíticas, permiten leer únicamente las columnas requeridas, evitando E/S innecesaria sobre datos no utilizados. Esto resulta mucho más rápido que el almacenamiento por filas, donde se leen filas completas que incluyen columnas irrelevantes:

<Image img={column_orientated} alt="Column-oriented database structure" size="lg"/>

## Replicación e integridad de los datos {#data-replication-and-integrity}

ClickHouse emplea un esquema de replicación asíncrona multi-maestro para asegurar el almacenamiento redundante de los datos en varios nodos. Una vez que la información se escribe en cualquier réplica disponible, las demás la reciben en segundo plano. El sistema garantiza que todas las réplicas conserven datos idénticos y permite la recuperación automática tras la mayoría de fallos, o semiautomática en escenarios más complejos.

## Control de acceso basado en roles {#role-based-access-control}

ClickHouse implementa la gestión de cuentas de usuario mediante consultas SQL y permite configurar el control de acceso basado en roles, similar a lo que se encuentra en el estándar ANSI SQL y en los sistemas populares de gestión de bases de datos relacionales.

## Compatibilidad con SQL {#sql-support}

ClickHouse admite un [lenguaje de consultas declarativo basado en SQL](/sql-reference) que, en muchos casos, es idéntico al estándar ANSI SQL. Las cláusulas de consulta admitidas incluyen [GROUP BY](/sql-reference/statements/select/group-by), [ORDER BY](/sql-reference/statements/select/order-by), subconsultas en [FROM](/sql-reference/statements/select/from), cláusula [JOIN](/sql-reference/statements/select/join), operador [IN](/sql-reference/operators/in), [funciones de ventana](/sql-reference/window-functions) y subconsultas escalares.


## Cálculo aproximado {#approximate-calculation}

ClickHouse permite sacrificar un poco de precisión a cambio de un mayor rendimiento. Por ejemplo, algunas funciones de agregación calculan de manera aproximada el conteo de valores distintos, la mediana y los cuantiles. También es posible ejecutar consultas sobre una muestra de los datos para obtener resultados aproximados en menos tiempo. Además, las agregaciones pueden limitarse a un número reducido de claves en lugar de procesarlas todas. Según el grado de sesgo en la distribución de las claves, este enfoque puede ofrecer resultados suficientemente precisos utilizando muchos menos recursos que un cálculo exacto.

## Algoritmos adaptativos de join {#adaptive-join-algorithms}

ClickHouse elige el algoritmo de *join* de forma adaptativa: comienza con *hash joins* rápidos y recurre a *merge joins* si hay más de una tabla grande.

## Rendimiento superior en consultas {#superior-query-performance}

ClickHouse es bien conocido por ofrecer un rendimiento de consultas extremadamente rápido. Para conocer por qué ClickHouse es tan rápido, consulta la guía [¿Por qué ClickHouse es rápido?](/concepts/why-clickhouse-is-so-fast.mdx).
