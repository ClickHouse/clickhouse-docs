---
slug: /deployment-modes
sidebar_label: 'Modos de despliegue'
description: 'ClickHouse ofrece cuatro opciones de despliegue que utilizan el mismo potente motor de base de datos, pero empaquetadas de manera diferente para adaptarse a tus necesidades específicas.'
title: 'Modos de despliegue'
keywords: ['Deployment Modes', 'chDB']
show_related_blogs: true
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse es un sistema de base de datos versátil que puede desplegarse de varias maneras según tus necesidades. En su núcleo, todas las opciones de despliegue **utilizan el mismo potente motor de base de datos ClickHouse**; lo que varía es cómo interactúas con él y dónde se ejecuta.

Ya sea que estés realizando análisis a gran escala en producción, haciendo análisis de datos localmente o desarrollando aplicaciones, existe una opción de despliegue diseñada para tu caso de uso. La consistencia del motor subyacente garantiza el mismo alto rendimiento y compatibilidad con SQL en todos los modos de despliegue.  

Esta guía explora las cuatro principales formas de desplegar y usar ClickHouse:

* **ClickHouse Server** para despliegues tradicionales cliente/servidor  
* **ClickHouse Cloud** para operaciones de base de datos totalmente gestionadas  
* **clickhouse-local** para procesamiento de datos desde la línea de comandos  
* **chDB** para integrar ClickHouse directamente en aplicaciones  

Cada modo de despliegue tiene sus propias fortalezas y casos de uso ideales, que exploraremos en detalle a continuación.

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Server representa la arquitectura tradicional cliente/servidor y es ideal para despliegues en producción. Este modo de despliegue ofrece todas las capacidades de una base de datos OLAP, con alto rendimiento y baja latencia en las consultas, características por las que ClickHouse es reconocido.

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

ClickHouse Server se puede instalar en tu máquina local para desarrollo o pruebas, desplegarse en los principales proveedores de nube como AWS, GCP o Azure, o configurarse en tu propio hardware local. Para operaciones a gran escala, puede configurarse como un clúster distribuido para manejar mayor carga y garantizar alta disponibilidad.

Este modo de despliegue es la opción recomendada para entornos de producción donde la fiabilidad, el rendimiento y el acceso completo a las funciones son fundamentales.

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) es una versión totalmente gestionada de ClickHouse que elimina la carga operativa de ejecutar tu propio despliegue. Aunque mantiene todas las capacidades del ClickHouse Server, añade funciones diseñadas para simplificar el desarrollo y la operación.

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

Una de las principales ventajas de ClickHouse Cloud es su conjunto de herramientas integradas. [ClickPipes](/getting-started/quick-start/cloud/#clickpipes) proporciona un marco robusto de ingestión de datos, permitiendo conectar y transmitir datos desde diversas fuentes sin gestionar complejas canalizaciones ETL. La plataforma también ofrece una [API de consultas](/cloud/get-started/query-endpoints), facilitando la creación de aplicaciones.

La consola SQL en ClickHouse Cloud incluye funciones de [panel de control](/cloud/manage/dashboards), permitiendo transformar tus consultas en visualizaciones interactivas. Puedes crear y compartir tableros basados en tus consultas guardadas, con elementos interactivos mediante parámetros de consulta y filtros globales.

Para monitoreo y optimización, ClickHouse Cloud incluye gráficos incorporados y [análisis de consultas](/cloud/get-started/query-insights), ofreciendo visibilidad profunda sobre el rendimiento del clúster, patrones de consulta, uso de recursos y oportunidades de optimización. Esto resulta especialmente útil para equipos que necesitan mantener análisis de alto rendimiento sin dedicar recursos a la administración de infraestructura.

El servicio gestionado maneja automáticamente actualizaciones, respaldos, escalado y parches de seguridad, siendo ideal para organizaciones que prefieren centrarse en sus datos y aplicaciones en lugar de en la administración de la base de datos.

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) es una herramienta de línea de comandos que ofrece toda la funcionalidad de ClickHouse en un ejecutable independiente. Es esencialmente la misma base de datos que ClickHouse Server, pero empaquetada para usar directamente desde la línea de comandos sin ejecutar un servidor.

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

Esta herramienta es ideal para análisis ad-hoc de datos, especialmente con archivos locales o datos almacenados en la nube. Permite consultar archivos en distintos formatos (CSV, JSON, Parquet, etc.) usando el dialecto SQL de ClickHouse, perfecta para exploraciones rápidas o análisis puntuales.

clickhouse-local incluye todas las funciones de ClickHouse, permitiendo realizar transformaciones de datos, conversiones de formato o cualquier operación que normalmente harías con ClickHouse Server. También puede persistir datos usando los mismos motores de almacenamiento que ClickHouse Server.

La combinación de funciones de tabla remotas y acceso al sistema de archivos local hace clickhouse-local especialmente útil para unir datos entre un ClickHouse Server y archivos locales, ideal para datos temporales o sensibles que no deseas subir a un servidor.

## chDB {#chdb}

[chDB](/chdb) es ClickHouse embebido como motor de base de datos en proceso, con Python como implementación principal, disponible también para Go, Rust, NodeJS y Bun. Esta opción permite aprovechar las capacidades OLAP de ClickHouse directamente en tu aplicación, sin necesidad de una instalación separada de la base de datos.

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDB se integra de manera fluida con el ecosistema de tu aplicación. En Python, por ejemplo, funciona eficientemente con herramientas de ciencia de datos como Pandas y Arrow, minimizando la copia de datos mediante `memoryview`, lo que resulta muy útil para analistas que quieren aprovechar el rendimiento de ClickHouse en sus flujos de trabajo existentes.

chDB también puede conectarse a bases de datos creadas con clickhouse-local, ofreciendo flexibilidad para trabajar con datos. Esto permite pasar sin problemas entre desarrollo local, exploración de datos en Python y soluciones de almacenamiento más permanentes sin cambiar los patrones de acceso a los datos.
