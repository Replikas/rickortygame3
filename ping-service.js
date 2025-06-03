const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  // Your Render app URL (update this after deployment)
  TARGET_URL: process.env.RENDER_URL || 'https://your-app-name.onrender.com',
  
  // Ping intervals
  PING_INTERVAL: 14 * 60 * 1000, // 14 minutes (Render free tier sleeps after 15 min)
  HEALTH_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes for health checks
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 30 * 1000, // 30 seconds
  
  // Request timeout
  TIMEOUT: 30 * 1000, // 30 seconds
};

class RenderPingService {
  constructor() {
    this.isRunning = false;
    this.pingCount = 0;
    this.lastPingTime = null;
    this.consecutiveFailures = 0;
    this.startTime = new Date();
  }

  // Make HTTP request with timeout and retries
  makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const timeout = options.timeout || CONFIG.TIMEOUT;
      
      const req = protocol.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(timeout, () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });
    });
  }

  // Ping the main application
  async pingApp() {
    try {
      console.log(`🏓 Pinging ${CONFIG.TARGET_URL}...`);
      
      const response = await this.makeRequest(CONFIG.TARGET_URL);
      
      if (response.statusCode === 200) {
        this.pingCount++;
        this.lastPingTime = new Date();
        this.consecutiveFailures = 0;
        
        console.log(`✅ Ping #${this.pingCount} successful - Status: ${response.statusCode}`);
        console.log(`📊 Uptime: ${this.getUptime()}`);
        
        return true;
      } else {
        throw new Error(`HTTP ${response.statusCode}`);
      }
    } catch (error) {
      this.consecutiveFailures++;
      console.error(`❌ Ping failed (${this.consecutiveFailures}/${CONFIG.MAX_RETRIES}): ${error.message}`);
      
      if (this.consecutiveFailures >= CONFIG.MAX_RETRIES) {
        console.error(`🚨 Max retries reached. Service may be down.`);
        // You could add notification logic here (email, webhook, etc.)
      }
      
      return false;
    }
  }

  // Health check endpoint
  async healthCheck() {
    try {
      const healthUrl = `${CONFIG.TARGET_URL}/health`;
      const response = await this.makeRequest(healthUrl);
      
      if (response.statusCode === 200) {
        const healthData = JSON.parse(response.data);
        console.log(`💚 Health check OK - App uptime: ${healthData.uptime}s`);
        return true;
      }
    } catch (error) {
      console.warn(`⚠️ Health check failed: ${error.message}`);
      return false;
    }
  }

  // Get service uptime
  getUptime() {
    const uptimeMs = Date.now() - this.startTime.getTime();
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  // Get next ping time
  getNextPingTime() {
    if (!this.lastPingTime) return 'Soon';
    const nextPing = new Date(this.lastPingTime.getTime() + CONFIG.PING_INTERVAL);
    return nextPing.toLocaleTimeString();
  }

  // Start the ping service
  start() {
    if (this.isRunning) {
      console.log('🔄 Ping service is already running');
      return;
    }

    console.log('🚀 Starting Render Ping Service');
    console.log(`📍 Target URL: ${CONFIG.TARGET_URL}`);
    console.log(`⏱️ Ping interval: ${CONFIG.PING_INTERVAL / 60000} minutes`);
    console.log(`🔍 Health check interval: ${CONFIG.HEALTH_CHECK_INTERVAL / 60000} minutes`);
    
    this.isRunning = true;

    // Initial ping
    this.pingApp();

    // Set up regular pings
    this.pingInterval = setInterval(() => {
      this.pingApp();
    }, CONFIG.PING_INTERVAL);

    // Set up health checks
    this.healthInterval = setInterval(() => {
      this.healthCheck();
    }, CONFIG.HEALTH_CHECK_INTERVAL);

    // Log status every hour
    this.statusInterval = setInterval(() => {
      console.log(`📈 Status Report:`);
      console.log(`   • Total pings: ${this.pingCount}`);
      console.log(`   • Service uptime: ${this.getUptime()}`);
      console.log(`   • Next ping: ${this.getNextPingTime()}`);
      console.log(`   • Consecutive failures: ${this.consecutiveFailures}`);
    }, 60 * 60 * 1000); // Every hour

    console.log('✅ Ping service started successfully');
  }

  // Stop the ping service
  stop() {
    if (!this.isRunning) {
      console.log('⏹️ Ping service is not running');
      return;
    }

    console.log('⏹️ Stopping ping service...');
    
    this.isRunning = false;
    
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.healthInterval) clearInterval(this.healthInterval);
    if (this.statusInterval) clearInterval(this.statusInterval);
    
    console.log('✅ Ping service stopped');
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      pingCount: this.pingCount,
      uptime: this.getUptime(),
      lastPing: this.lastPingTime,
      nextPing: this.getNextPingTime(),
      consecutiveFailures: this.consecutiveFailures,
      targetUrl: CONFIG.TARGET_URL
    };
  }
}

// Create and export service instance
const pingService = new RenderPingService();

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  pingService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  pingService.stop();
  process.exit(0);
});

// Auto-start if run directly
if (require.main === module) {
  // Check if URL is provided
  if (process.argv[2]) {
    CONFIG.TARGET_URL = process.argv[2];
  }
  
  if (!CONFIG.TARGET_URL || CONFIG.TARGET_URL.includes('your-app-name')) {
    console.error('❌ Please provide your Render app URL:');
    console.error('   node ping-service.js https://your-app-name.onrender.com');
    console.error('   OR set RENDER_URL environment variable');
    process.exit(1);
  }
  
  pingService.start();
}

module.exports = { RenderPingService, pingService };