const amqp = require('amqplib');
const redisClient = require('./redis');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    
    await channel.assertExchange('chat_events', 'topic', { durable: true });
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

  // Create queue for notification service
  const queue = await channel.assertQueue('notification_service_queue', { durable: true });
  
  // Bind to relevant events
  await channel.bindQueue(queue.queue, 'chat_events', 'message.sent');
  await channel.bindQueue(queue.queue, 'chat_events', 'group.message.sent');
  await channel.bindQueue(queue.queue, 'user_events', 'user.login');

  // Consume messages
  channel.consume(queue.queue, async (msg) => {
    if (msg) {
      const event = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;

      try {
        await handleEvent(routingKey, event);
        channel.ack(msg);
      } catch (error) {
        console.error('Error processing event:', error);
        channel.nack(msg, false, true); // Requeue on error
      }
    }
  });

  console.log('Consuming notification events...');
};

const handleEvent = async (routingKey, event) => {
  console.log(`Processing event: ${routingKey}`, event);

  switch (routingKey) {
    case 'message.sent':
      await handleMessageSent(event);
      break;
    case 'group.message.sent':
      await handleGroupMessageSent(event);
      break;
    case 'user.login':
      await handleUserLogin(event);
      break;
    default:
      console.log('Unhandled event type:', routingKey);
  }
};

const handleMessageSent = async (event) => {
  // Store notification in Redis for the receiver
  const notificationKey = `notifications:${event.receiverId}`;
  const notification = {
    type: 'new_message',
    senderId: event.senderId,
    conversationId: event.conversationId,
    content: event.content,
    timestamp: event.timestamp
  };

  await redisClient.lPush(notificationKey, JSON.stringify(notification));
  await redisClient.expire(notificationKey, 86400); // Expire after 24 hours

  console.log(`Notification stored for user ${event.receiverId}`);
};

const handleGroupMessageSent = async (event) => {
  // In a real implementation, you would get all group members
  // and create notifications for each (except the sender)
  console.log(`Group message notification for group ${event.groupId}`);
};

const handleUserLogin = async (event) => {
  console.log(`User ${event.userId} logged in at ${event.loginAt}`);
  // Could trigger welcome notifications, unread message counts, etc.
};

module.exports = { connectRabbitMQ, consumeEvents };
