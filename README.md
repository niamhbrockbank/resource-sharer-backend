# Resource Sharer

The front end repo for this project can be found <a href='https://github.com/niamhbrockbank/resource-sharer'>here</a>.
## Usage:

Set up your local database using the SQL commands within the sql folder.
 1. Run `createTables.sql`
 2. (Optional) Run `populateData.sql` if you'd like some placeholder data to work with.


## Install

`yarn`

## DB Setup

Copy .env.example to .env and set `DATABASE_URL` and `PORT` to your liking.

Example for a local database: `DATABASE_URL=postgres://userl@localhost/resource_db`

You will need to create your own databases for this project - one locally and one on Heroku.

## Running locally

`yarn start:dev`

This will set the env var LOCAL to true, which will cause the db connection configuration to NOT use SSL (appropriate for your local db)

