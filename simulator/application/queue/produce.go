package queue

import (
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/csilva2810/imersaofsfc2-simulator/application/route"
	infraqueue "github.com/csilva2810/imersaofsfc2-simulator/infra/queue"
)

// {"clientID":"1","routeId":"1"}
func Produce(msg *kafka.Message) {
	producer := infraqueue.NewKafkaProducer()
	route := route.NewRoute()
	json.Unmarshal(msg.Value, &route)
	route.LoadPositions()
	positions, err := route.ExportJsonPositions()
	if err != nil {
		log.Println(err.Error())
	}
	for _, p := range positions {
		infraqueue.Publish(p, os.Getenv("KafkaProduceTopic"), producer)
		time.Sleep(time.Millisecond * 500)
	}
}
