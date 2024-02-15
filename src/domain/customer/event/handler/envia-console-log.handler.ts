import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerAdressChangedEvent from "../customer-address-changed.event";

export default class EnviaConsoleLogHandler
  implements EventHandlerInterface<CustomerAdressChangedEvent>
{
  handle(event: CustomerAdressChangedEvent): void {
    const { id, name, address } = event.eventData;
    console.log(`Endereço do cliente: ${id}, ${name} alterado para: ${address}`); 
  }
}
