import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Producer } from '@nestjs/microservices/external/kafka.interface';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewPositionMessage } from './contracts';

@WebSocketGateway()
export class RoutesGateway implements OnModuleInit {
  private kafkaProducer: Producer;

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaProducer = await this.kafkaClient.connect();
  }

  @SubscribeMessage('new-direction')
  handleMessage(client: Socket, payload: { routeId: string }) {
    this.kafkaProducer.send({
      topic: 'route.new-direction',
      messages: [
        {
          key: 'route.new-direction',
          value: JSON.stringify({
            routeId: payload.routeId,
            clientId: client.id,
          }),
        },
      ],
    });
  }

  sendPosition(position: NewPositionMessage) {
    const { clientId, ...newPosition } = position;
    const clients = this.server.sockets.connected;

    if (!(clientId in clients)) {
      console.error(
        'Client not exists, refresh react app and send a new direction again',
      );
      return;
    }

    clients[clientId].emit('new-position', newPosition);
  }
}
