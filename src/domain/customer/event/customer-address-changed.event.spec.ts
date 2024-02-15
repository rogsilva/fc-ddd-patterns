import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import EnviaConsoleLogHandler from "./handler/envia-console-log.handler";

describe('CustomerAddressChangedEvent', () => {
  it('should call all handlers', () => {
    const eventData = { id: 1, name: 'John Doe', address: 'any_address, 123'};
    const eventDispatcher = new EventDispatcher();
    const customerAddressChangedEvent = new CustomerAddressChangedEvent(eventData);
    const enviaConsoleLogHandler = new EnviaConsoleLogHandler();

    eventDispatcher.register('CustomerAddressChangedEvent', enviaConsoleLogHandler);

    const handleSpy = jest.spyOn(enviaConsoleLogHandler, 'handle');

    eventDispatcher.notify(customerAddressChangedEvent);

    expect(handleSpy).toHaveBeenCalledTimes(1);
    expect(handleSpy).toHaveBeenCalledWith(customerAddressChangedEvent);
  });
});