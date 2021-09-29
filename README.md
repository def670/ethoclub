## Open Source Xerom Mining Pool

![Miner's stats page](https://i.gyazo.com/f5361009debf4921a21f5fb3bd06b3b2.png)

### Features

**This pool is being further developed to provide an easy to use pool for Ethereum miners. This software is functional however an optimised release of the pool is expected soon. Testing and bug submissions are welcome!**

* Support for HTTP and Stratum mining
* Detailed block stats with luck percentage and full reward
* Failover geth instances: geth high availability built in
* Modern beautiful Ember.js frontend
* Separate stats for workers: can highlight timed-out workers so miners can perform maintenance of rigs
* JSON-API for stats

### Building on Linux

Dependencies:

  * go >= 1.9
  * geth or parity
  * redis-server >= 2.8.0
  * nodejs >= 4 LTS
  * nginx

First of all let's get up to date and install the dependencies:

    sudo apt-get update && sudo apt-get dist-upgrade -y
    sudo apt-get install build-essential make git screen unzip curl nginx -y

Install GO:

    wget https://storage.googleapis.com/golang/go1.14.2.linux-amd64.tar.gz
    tar -xvf go1.14.2.linux-amd64.tar.gz
    rm go1.14.2.linux-amd64.tar.gz
    sudo mv go /usr/local
    export GOROOT=/usr/local/go
    export PATH=$GOPATH/bin:$GOROOT/bin:$PATH

Clone & compile:

    git config --global http.https://gopkg.in.followRedirects true
    git clone https://github.com/Exlo84/XeroDreamPool.git
    cd XeroDreamPool
    make

Installing Redis latest version

    wget http://download.redis.io/redis-stable.tar.gz
    tar xvzf redis-stable.tar.gz
    cd redis-stable
    make
    
    sudo cp src/redis-server /usr/local/bin/
    sudo cp src/redis-cli /usr/local/bin/
        
    sudo mkdir /etc/redis
    sudo mkdir /var/redis
            
    sudo cp utils/redis_init_script /etc/init.d/redis_6379
    sudo cp redis.conf /etc/redis/6379.conf
    sudo nano /etc/redis/6379.conf
    
*Edit the configuration file, making sure to perform the following changes:

* Set daemonize to yes (by default it is set to no).
* Set the dir to /var/redis/6379 (very important step!)

Run

    sudo mkdir /var/redis/6379
    sudo update-rc.d redis_6379 defaults
    sudo /etc/init.d/redis_6379 start   
    
### Install Geth

    cd ~
    wget -N https://github.com/xero-official/go-xerom/releases/download/2.1.0/geth-linux.zip
    unzip geth-linux.zip
    rm geth-linux.zip
    sudo mv geth /usr/local/bin/geth 

Make geth system sercive

    sudo nano /etc/systemd/system/geth.service
    
Copy the following

    [Unit]
    Description=Geth for Pool
    After=network-online.target
    
    [Service]
    ExecStart=/usr/local/bin/geth --rpc --rpcaddr 127.0.0.1 --rpcport 8545 --syncmode "fast" --etherbase <your-address> --mine --extradata "<your-pool>"
    User=<your-user-name>
    
    [Install]
    WantedBy=multi-user.target

Then run geth by the following commands

    sudo systemctl enable geth
    sudo systemctl start geth
    sudo systemctl status geth

Run console

    geth attach

Register pool account and open wallet for transaction. This process is always required, when the wallet node is restarted.

    personal.newAccount()
    personal.unlockAccount(eth.accounts[0],"password",40000000)

### Set up pool

    mv config.example.json config.json
    nano config.json

Make pool system service

    sudo nano /etc/systemd/system/pool.service

Copy the following

    [Unit]
    Description=Xeropool
    After=geth.target
    
    [Service]
    ExecStart=/home/<name>/XeroDreamPool/build/bin/open-ethereum-pool /home/<name>/XeroDreamPool/build/bin/config.json
    
    [Install]
    WantedBy=multi-user.target

Then run pool by the following commands

    sudo systemctl enable pool
    sudo systemctl start pool
    sudo systemctl status pool

### Building Frontend

    cd www

Modify your configuration file

    nano ~/XeroDreamPool/www/config/environment.js

Create frontend

    cd ~/XeroDreamPool/www/
    
    sudo npm install -g ember-cli@2.9.1
    sudo npm install -g bower
    sudo chown -R $USER:$GROUP ~/.npm
    sudo chown -R $USER:$GROUP ~/.config
    npm install
    bower install
    npm i intl-format-cache
    ./build.sh


Configure nginx to serve API on <code>/api</code> subdirectory.
Configure nginx to serve <code>www/dist</code> as static website.

#### Serving API using nginx

Edit this

    sudo nano /etc/nginx/sites-available/default

Delete everything in the file and replace it with the text below.
Be sure to change with your info

    upstream api {
            server 127.0.0.1:8080;
    }
    
    server {
      listen 80 default_server;
      listen [::]:80 default_server;
      root /home/<name>/XeroDreamPool/www/dist;
     
     index index.html index.htm index.nginx-debian.html;
     
    server_name _;
     
    location / {
            try_files $uri $uri/ =404;
            }
      
    location /api {
            proxy_pass http://api;
            }
    }
    
Save and close

Restart nginx

    sudo service nginx restart

### Notes

* Unlocking and payouts are sequential, 1st tx go, 2nd waiting for 1st to confirm and so on. You can disable that in code. Carefully read `docs/PAYOUTS.md`.
* Also, keep in mind that **unlocking and payouts will halt in case of backend or node RPC errors**. In that case check everything and restart.
* You must restart module if you see errors with the word *suspended*.
* Don't run payouts and unlocker modules as part of mining node. Create separate configs for both, launch independently and make sure you have a single instance of each module running.
* If `poolFeeAddress` is not specified all pool profit will remain on coinbase address. If it specified, make sure to periodically send some dust back required for payments.

### Credits

Made by sammy007. Licensed under GPLv3.

#### Contributors

[Alex Leverington](https://github.com/subtly)
[Primate411](https://github.com/Primate411/)
