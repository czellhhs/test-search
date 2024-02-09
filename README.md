# Local tester for ElasticSearch

1. Have access to the CCG website - `https://github.com/CMS-Enterprise/ccg-redev-ui`
2. Get Docker installed
3. With Docker installed, do a:
```
docker run --rm --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e 'http.cors.allow-origin=http://localhost:3000' -e "http.cors.enabled=true" -e "http.cors.allow-headers=X-Requested-With,X-Auth-Token,Content-Type,Content-Length,Authorization" -e "http.cors.allow-credentials=true"  elasticsearch:8.12.1
```
which runs ElasticSearch in a docker container locally - with NO security and CORS basically wide-open - for testing.

4. Run the updateSearch script from CCG project from the root of that project.  (Read that script's header comments for proper usage and setup).
5. From the root of this project, then do an `npm install`.
6. Then do an `npm start`... the running Docker ES instance lets client from localhost:3000 query with no CORS issues.  So make sure you're running this project on 3000.
7. Interact with the UI (explore the search API messages on the Dev Console etc).

Note: Once you stop the Docker (with a Ctrl+C [unless you run it headless,detached]) you'll need to re-run the search updater script (most likely).