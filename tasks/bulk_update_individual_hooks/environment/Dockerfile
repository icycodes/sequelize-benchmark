FROM ubuntu:24.04

RUN apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        curl wget ca-certificates git python3 python3-pip python3-pytest bash ripgrep sqlite3 && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    pip3 install --break-system-packages pytest-json-ctrf && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/user && chmod 0755 /home/user

RUN mkdir -p /home/user/project && \
    cd /home/user/project && \
    npm init -y && \
    npm install sequelize sqlite3 && \
    sqlite3 database.sqlite "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(255), status VARCHAR(255), lastActivatedAt DATETIME, createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL);" && \
    sqlite3 database.sqlite "INSERT INTO Users (username, status, createdAt, updatedAt) VALUES ('alice', 'pending', datetime('now'), datetime('now')), ('bob', 'pending', datetime('now'), datetime('now')), ('charlie', 'active', datetime('now'), datetime('now'));"

LABEL Author="generate-harbor-tasks"
LABEL Description="Sequelize task environment with Node.js v24 and a seeded SQLite database."

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]

# Container contents:
#   - always required apt packages: curl wget ca-certificates git python3 python3-pip python3-pytest bash ripgrep
#   - always required pip3 packages: pytest-json-ctrf
#   - sqlite3 apt package for database verification and seeding
#   - Node.js v24
#   - /home/user/project: project directory with sequelize and sqlite3 installed
#   - /home/user/project/database.sqlite: seeded SQLite database
