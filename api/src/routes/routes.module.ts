import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Route, RouteSchema } from './entities/route.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { RoutesGateway } from './routes.gateway';

const getGroupId = () => {
  const id = process.env.KAFKA_CONSUMER_GROUP_ID;

  if (!id || id === '') {
    return `my-consumer-${Math.random()}`;
  }

  return id;
};

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Route.name, schema: RouteSchema }]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        useFactory: async () => {
          return {
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
          };
        },
      },
    ]),
  ],
  controllers: [RoutesController],
  providers: [RoutesService, RoutesGateway],
})
export class RoutesModule {}
