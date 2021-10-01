## Open Source Etho Mining Pool - tuned for 8000000 block hardfork on EthoProtocol blockchain.
image to be updated soon!
![Miner's stats page](https://gyazo.com/f87ea01f762647fa3de95083e686d2c5.png)

### Features

**This pool is being further developed to provide an easy to use pool for Etho miners. This software is functional however an optimised release of the pool is expected soon. Testing and bug submissions are welcome!**

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
    sudo apt-get install build-essential make git screen unzip curl nginx tcl -y

Install GO:

    wget https://storage.googleapis.com/golang/go1.14.2.linux-amd64.tar.gz
    tar -xvf go1.14.2.linux-amd64.tar.gz
    rm go1.14.2.linux-amd64.tar.gz
    sudo mv go /usr/local
    export GOROOT=/usr/local/go
    export PATH=$GOPATH/bin:$GOROOT/bin:$PATH

Clone & compile:

    git config --global http.https://gopkg.in.followRedirects true
    git clone https://github.com/def670/ethoclub.git
    cd ethoclub
    make
  after you have completed "make" you will need to do:
    mv main.go main.go.old
    mv main.go.0 main.go
    cd api
    mv server.go server.go.old
    mv server.go.0 server.go
  This will alter the two programs to add in the charts    

Installing Redis latest version

    wget http://download.redis.io/redis-stable.tar.gz
    tar xvzf redis-stable.tar.gz
    cd redis-stable
    make
    make test
    sudo make install
    
    sudo mkdir /etc/redis
    sudo cp ~/redis-stable/redis.conf /etc/redis
    sudo nano /etc/redis/redis.conf
    
# Set supervised to systemd
  supervised systemd
# Set the dir
  dir /var/lib/redis
**Create a Redis systemd Unit File

sudo nano /etc/systemd/system/redis.service
Add

[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always

[Install]
WantedBy=multi-user.target
**Create the Redis User, Group and Directories

    sudo adduser --system --group --no-create-home redis
    sudo mkdir /var/lib/redis
    sudo chown redis:redis /var/lib/redis
    sudo chmod 770 /var/lib/redis
    Start and Test Redis
    sudo systemctl start redis
    sudo systemctl status redis
    
### Install nodejs
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt-get install nodejs -y
    
### Install Geth

    cd ~
    wget -N https://github.com/Ether1Project/Ether1/releases/download/V1.5.0/etho-linux-1.5.0.tar.gz
    tar -zxvf etho-linux-1.5.0.tar.gz
    rm etho-linux-1.5.0.tar.gz
    sudo mv geth /usr/local/bin/geth 

Make geth system service

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
 or alternatly - if you have existing ethbase keystore files you can put them into ~/.ether1/keystore/ then you will be able to use geth attach with the personal unlock above with your password where "password" is.  

### Set up pool
check out the config.examples directory for a couple different setup styles.
you can use "all.json" to start all the pool services,
or your can use "api.json, pool.json, payout.json, and unlocker.json" (all called individually) to run as 4 parts. (this way you can restart parts that need restarting without having to restart the whole pool).  
Also see the setup as a service section below - this works with either method... however do not do service setups for all 5 of the examples - either all.json or the other 4.  If all 5 are running services then your pool will bork for sure.

    cd config.examples/           <--these config files are adjusted to work with charts.  example.config.json in the root directory is not.
    nano all.json                 <--adjust your desired ports and IPs
    cp all.json ../build/bin/     <--MAKE BACKUPS of your config files - this directory will be overwritten if you do "make" on the pool again...YOU ARE WARNED!

Make pool system service

    sudo nano /etc/systemd/system/pool.service

Copy the following

[Unit]
Description=Ethoclub Pool
After=geth.target

[Service]
ExecStart=/home/<name>/ethoclub/build/bin/open-ethereum-pool /home/<name>/ethoclub/all.json

[Install]
WantedBy=multi-user.target
Then run pool by the following commands

    sudo systemctl enable all.service   <--enables system to control pool - will automatically restart if computer rebooted
    sudo systemctl start all.service    <--starts the service
    sudo systemctl status all.service   <--shows status of the service
    sudo systemctl stop all.service     <--stops the service
    sudo systemctl restart all.service  <--restarts the service
    sudo systemctl disable all.service  <--disables system control of service - will NOT automatically restart when rebooted

### Building Frontend

    cd www

Modify your configuration file

    nano ~/ethoclub/www/config/environment.js

Create frontend

    cd ~/ethoclub/www/
    
    sudo npm install -g bower
    sudo chown -R $USER:$GROUP ~/.npm
    sudo chown -R $USER:$GROUP ~/.config
    npm install
    bower install
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

[Alex Leverington]
[Primate411](https://github.com/Primate411/)
[Exlo84](https://github.com/Exlo84/)
[Don Kingdon](https://github.com/def670/)
[KJ](https://etho.club)
