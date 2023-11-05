# Linux/Mac Local Setup Instructions
## Initial
- Install node
- Download Oracle InstantClient
- `cd src`
- From `src/` call `npm install`
- Run `./src/scripts/mac/instantclient-setup.sh`, fill in the location of
  the Oracle instantclient installation. This will generate `src/local-start.sh`

## To run each time
- Start the oracle db tunnel with `./src/scripts/mac/db-tunnel.sh`
- Deploy locally by running `./src/local-start.sh`
- Stop the server with Ctrl + C