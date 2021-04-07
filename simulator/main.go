package main

import (
	"fmt"
	"log"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	appqueue "github.com/csilva2810/imersaofsfc2-simulator/application/queue"
	infraqueue "github.com/csilva2810/imersaofsfc2-simulator/infra/queue"

	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {
	msgChan := make(chan *kafka.Message)
	consumer := infraqueue.NewKafkaConsumer(msgChan)
	go consumer.Consume()

	for msg := range msgChan {
		fmt.Println(string(msg.Value))
		go appqueue.Produce(msg)
	}
}
