#!/usr/bin/env node

/**
 * UptimeRobot Setup Helper
 * 
 * This script helps you set up UptimeRobot monitors via their API.
 * You'll need an API key from UptimeRobot.
 * 
 * Usage:
 * 1. Get your API key from: https://uptimerobot.com/dashboard#mySettings
 * 2. Run: node setup-monitoring.js YOUR_API_KEY
 */

const https = require('https');

const services = [
  {
    name: 'Chat Gateway',
    url: 'https://chat-gateway-lfj7.onrender.com/health'
  },
  {
    name: 'Chat Auth',
    url: 'https://chat-auth.onrender.com/health'
  },
  {
    name: 'Chat User',
    url: 'https://chat-user.onrender.com/health'
  },
  {
    name: 'Chat Chat',
    url: 'https://chat-chat.onrender.com/health'
  },
  {
    name: 'Chat Notification',
    url: 'https://chat-notification.onrender.com/health'
  }
];

function createMonitor(apiKey, service) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams({
      api_key: apiKey,
      format: 'json',
      type: 1, // HTTP(s)
      friendly_name: service.name,
      url: service.url,
      interval: 300, // 5 minutes
      timeout: 30
    });

    const options = {
      hostname: 'api.uptimerobot.com',
      port: 443,
      path: '/v2/newMonitor',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.toString().length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.stat === 'ok') {
            resolve(response);
          } else {
            reject(new Error(response.error?.message || 'Unknown error'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data.toString());
    req.end();
  });
}

async function setupMonitoring(apiKey) {
  console.log('🤖 Setting up UptimeRobot monitors...\n');

  for (const service of services) {
    try {
      console.log(`Creating monitor for: ${service.name}...`);
      await createMonitor(apiKey, service);
      console.log(`✅ ${service.name} monitor created successfully!\n`);
    } catch (error) {
      console.error(`❌ Failed to create ${service.name}: ${error.message}\n`);
    }
  }

  console.log('🎉 Setup complete! Check your UptimeRobot dashboard.');
  console.log('📊 Dashboard: https://uptimerobot.com/dashboard\n');
}

// Main
const apiKey = process.argv[2];

if (!apiKey) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         UptimeRobot Setup Helper                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('This script automatically creates monitors for all your services.\n');
  console.log('📋 Steps to use:\n');
  console.log('1. Go to: https://uptimerobot.com/dashboard#mySettings');
  console.log('2. Scroll to "API Settings"');
  console.log('3. Click "Show/hide it" to reveal your Main API Key');
  console.log('4. Copy the API key');
  console.log('5. Run: node setup-monitoring.js YOUR_API_KEY\n');
  console.log('Or set it up manually following: UPTIMEROBOT_SETUP.md\n');
  console.log('Services to monitor:');
  services.forEach((service, i) => {
    console.log(`  ${i + 1}. ${service.name}`);
    console.log(`     ${service.url}`);
  });
  console.log('');
  process.exit(0);
}

setupMonitoring(apiKey).catch(console.error);
