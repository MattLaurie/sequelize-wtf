ARG MYSQL_IMAGE=mysql
ARG MYSQL_VERSION=8.0.35

FROM ${MYSQL_IMAGE}:${MYSQL_VERSION}

# MySQL will not apply world-writable conf.d files and Docker Desktop on Windows defaults shares to 777.
COPY conf.d /etc/mysql/conf.d/
RUN chmod 644 /etc/mysql/conf.d/*.cnf

EXPOSE 3306
