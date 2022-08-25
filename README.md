# HTML Canvas Game

Based on [chriscourses/my-first-game](https://github.com/chriscourses/my-first-game)


# Requirements

To persist scores, install and start a redis server either:

- with the [start_redis.sh](./start_redis.sh]) script in this repo (Docker must be running)
- roll your own, with the default port 6379 with the `--requirepass` option, password: `testing`

Its DNS name must be `redis`; you can edit your `/etc/hosts` file accordingly, e.g.:

```
127.0.0.1   redis
```

# Run

```sh
npm install
npm start
```

Then open a browser at [http://localhost:8080](http://localhost:8080)

A Dockerfile is included if you prefer running it from a container.

