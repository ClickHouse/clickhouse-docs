<details><summary>Launch Apache Superset in Docker</summary>

Superset provides [installing Superset locally using Docker Compose](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/) instructions.  After checking out the Apache Superset repo from GitHub you can run the latest development code, or a specific tag.  We recommend release 2.0.0 as it is the latest release not marked as `pre-release`.

There are a few tasks to be done before running `docker compose`:

1. Add the official ClickHouse Connect driver
2. Optain a MapBox API key and add that as an environment variable (optional)
3. Specify the version of Superset to run

:::tip
The commands below are to be run from the  top level of the GitHub repo, `superset`.
:::

## Official ClickHouse Connect driver

To make the ClickHouse Connect driver available in the Superset deployment add it to the local requirements file:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## MapBox

This is optional, you can plot location data in Superset without a MapBox API key, but you will see a message telling you that you should add a key and the background image of the map will be missing (you will only see the data points and not the map background).  MapBox provides a free tier if you would like to use it.

Some of the sample visualizations that the guides have you create use location, for example longitude and latitude, data.  Superset includes support for MapBox maps.  To use the MapBox visualizations you need a MapBox API key.  Sign up for the [MapBox free tier](https://account.mapbox.com/auth/signup/), and generate an API key.

Make the API key available to Superset:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## Deploy Superset version 2.0.0

To deploy release 2.0.0 run:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>

