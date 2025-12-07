const amqp = require('amqplib');
const UserProfile = require('../models/UserProfile');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    
    await channel.assertExchange('user_events', 'topic', { durable: true });
    
    console.log('RabbitMQ connected');
    return channel;
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    throw error;
  }
};

const consumeEvents = async () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }

  // Create queue for user service
  const queue = await channel.assertQueue('user_service_queue', { durable: true });
  
  // Bind to user events
  await channel.bindQueue(queue.queue, 'user_events', 'user.created');
  await channel.bindQueue(queue.queue, 'user_events', 'user.login');

  // Consume messages
  channel.consume(queue.queue, async (msg) => {
    if (msg) {
      const event = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;

      try {
        if (routingKey === 'user.created') {
          // Create user profile when user registers
          await UserProfile.create({
            userId: event.userId,
            username: event.username,
            email: event.email,
            displayName: event.username
          });
          console.log('User profile created:', event.userId);
        }

        channel.ack(msg);
      } catch (error) {
        console.error('Error processing event:', error);
        channel.nack(msg, false, true); // Requeue on error
      }
    }
  });

  console.log('Consuming user events...');
};

module.exports = { connectRabbitMQ, consumeEvents };
