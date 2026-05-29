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

RUN mkdir -p /home/user/myproject && \
    cd /home/user/myproject && \
    cat >package.json <<'EOF'
{
  "name": "m2m-junction-bulk-hooks",
  "version": "1.0.0",
  "description": "Sequelize many-to-many junction bulk hooks test",
  "main": "run.js",
  "dependencies": {
    "sequelize": "^6.37.0",
    "sqlite3": "^5.1.7"
  }
}
EOF

LABEL Author="generate-harbor-tasks"
LABEL Description="Node.js environment with Sequelize and SQLite3 for testing many-to-many junction bulk hooks."

CMD ["/bin/bash", "-c", "trap : TERM INT; sleep infinity & wait"]

# Container contents:
#   - always required apt packages: curl wget ca-certificates git python3 python3-pip python3-pytest bash ripgrep
#   - additional apt packages: sqlite3
#   - always required pip3 packages: pytest-json-ctrf
#   - Node.js v24 for running Sequelize scripts
#   - /home/user/myproject: project directory with package.json pre-configured
