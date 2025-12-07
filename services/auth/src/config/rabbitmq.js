const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    
    // Declare exchanges
    await channel.assertExchange('user_events', 'topic', { durable: true });
    
    console.log('RabbitMQ connected and exchanges declared');
    return channel;
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    throw error;
  }
};

const publishEvent = async (exchange, routingKey, message) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  
  channel.publish(
    exchange,
    routingKey,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
};

module.exports = { connectRabbitMQ, publishEvent };
