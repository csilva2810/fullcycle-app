import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

const getGroupId = () => {
  const id = process.env.KAFKA_CONSUMER_GROUP_ID;

  if (!id || id === '') {
    return `my-consumer-${Math.random()}`;
  }

  return id;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      // @TODO se how to wait for the config modules to be ready to be able to inject the env vars below
      client: {
        // clientId: process.env.KAFKA_CLIENT_ID,
        // brokers: [process.env.KAFKA_BROKER],
        clientId: 'code-delivery',
        brokers: ['host.docker.internal:9094'],
      },
      consumer: {
        groupId: getGroupId(),
      },
    },
  });

  await app.startAllMicroservicesAsync();
  await app.listen(3000);
}
bootstrap();
