# Installing HA-Puppet on Ubuntu using Docker Compose

This guide walks you through setting up the **ha-puppet** Home Assistant add-on on an Ubuntu Linux system using Docker Compose. It assumes you already have Home Assistant running in Docker with its configuration directory located at `~/homeassconfig`.

## Prerequisites

Before starting, you need to have Docker, Docker Compose, and Git installed on your Ubuntu system. Note: You do ***not*** need to install Chromium on the host machine, as it will be installed automatically within the Docker container.

### Step 1: Install Dependencies

Run the following commands to install Git and Docker (if not already installed):

```bash
# Update your package list
sudo apt-get update

# Install Git
sudo apt-get install -y git

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose Plugin
sudo apt-get install -y docker-compose-plugin
```

> [!TIP]
> Add your user to the docker group so you don't need to type `sudo` for every docker command:
> `sudo usermod -aG docker $USER` (Log out and back in for this to take effect).

---

## Installation Steps

### Step 2: Clone the HA-Puppet Repository

We will clone the repository into your home directory.

```bash
cd ~
git clone https://github.com/link744/home-assistant-addons.git
cd home-assistant-addons/puppet
```

### Step 3: Create and Edit `options-dev.json`

The application uses an `options-dev.json` file for configuration. 

> [!IMPORTANT]
> The `options-dev.json` file must be created inside the `ha-puppet` directory before you build the container. We will mount it via docker-compose so you can edit it later without having to rebuild the container.

Copy the sample file to create your active configuration:

```bash
cd ha-puppet
cp options-dev.json.sample options-dev.json
```

Next, edit `options-dev.json` using your favorite text editor (e.g., `nano`):

```bash
nano options-dev.json
```

Update the contents to match your environment. You will need to generate a Long-Lived Access Token in Home Assistant (go to **Profile** > **Security** > **Long-Lived Access Tokens**). 

The file should look like this:

```json
{
  "home_assistant_url": "http://<YOUR_HOME_ASSISTANT_IP>:8123",
  "access_token": "YOUR_LONG_LIVED_ACCESS_TOKEN",
  "chromium_executable": "/usr/bin/chromium",
  "keep_browser_open": false
}
```

> [!NOTE]
> - Ensure `home_assistant_url` points to your active Home Assistant instance. If HA is running on the same machine but in a separate Docker network, use the host machine's IP address (e.g., `http://192.168.1.50:8123`).
> - Set `chromium_executable` to `/usr/bin/chromium` (this is the path inside the Docker container).

### Step 4: Update the `docker-compose.yml`

Go back to the `puppet` directory and edit the `docker-compose.yml` file to ensure the Add-on can read your newly created `options-dev.json` file on the fly without needing to rebuild every time you make a change.

```bash
cd ..
nano docker-compose.yml
```

Replace the contents of `docker-compose.yml` with the following:

```yaml
services:
  ha-puppet:
    build: .
    container_name: ha-puppet
    restart: unless-stopped
    ports:
      - "10000:10000"
    volumes:
      # Mount options-dev.json directly into the container's working directory
      - ./ha-puppet/options-dev.json:/app/options-dev.json:ro
    environment:
      # Optional: Explicitly define chromium path
      - CHROMIUM_EXECUTABLE=/usr/bin/chromium
      # Optional: Set to true if UI updates inconsistently
      # - KEEP_BROWSER_OPEN=true
      # Optional: Enable debugging output
      # - DEBUG=true
```

*(Note: We removed the `ACCESS_TOKEN` and `HOME_ASSISTANT_URL` environment variables because they are now safely loaded from your `options-dev.json` file!)*

### Step 5: Build and Start the Container

Now, build and start the HA-Puppet service in detached mode:

```bash
sudo docker compose up -d --build
```

Docker will download the necessary base images, install Chromium and Node.js *inside* the container, and start the service. This may take a few minutes.

### Step 6: Verify the Installation

You can check the logs to ensure it started successfully and connected to Home Assistant:

```bash
sudo docker compose logs -f ha-puppet
```

You should see output indicating that the server is running and listening on port 10000. 

You can now access the HA-Puppet Web UI by navigating to `http://<YOUR_UBUNTU_IP>:10000` in your browser.
