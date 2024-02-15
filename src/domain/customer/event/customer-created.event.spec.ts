import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerCreatedEvent from "./customer-created.event";
import EnviaConsoleLog1Handler from "./handler/envia-console-log-1.handler";
import EnviaConsoleLog2Handler from "./handler/envia-console-log-2.handler";

describe('CustomerCreatedEvent', () => {
  it('should call all handlers', () => {
    const eventData = { name: 'any_name' };
    const eventDispatcher = new EventDispatcher();
    const customerCreatedEvent = new CustomerCreatedEvent(eventData);
    const enviaConsoleLog1Handler = new EnviaConsoleLog1Handler();
    const enviaConsoleLog2Handler = new EnviaConsoleLog2Handler();

    eventDispatcher.register('CustomerCreatedEvent', enviaConsoleLog1Handler);
    eventDispatcher.register('CustomerCreatedEvent', enviaConsoleLog2Handler);

    const handleSpy1 = jest.spyOn(enviaConsoleLog1Handler, 'handle');
    const handleSpy2 = jest.spyOn(enviaConsoleLog2Handler, 'handle');

    eventDispatcher.notify(customerCreatedEvent);

    expect(handleSpy1).toHaveBeenCalledTimes(1);
    expect(handleSpy2).toHaveBeenCalledTimes(1);
    expect(handleSpy1).toHaveBeenCalledWith(customerCreatedEvent);
    expect(handleSpy2).toHaveBeenCalledWith(customerCreatedEvent);
  });
});