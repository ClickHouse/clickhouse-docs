# create-search-index

Parses all of the ClickHouse docs and generates objects to send to Algolia.

- `index.js` creates the objects that will be indexed by Algolia

## Usage

Define the following environment variables in a `.env` file in this folder:

```sh
ALGOLIA_APPLICATION_ID=
ALGOLIA_ADMIN_API_KEY=
ALGOLIA_INDEX=clickhouse
```

```sh
yarn start
```