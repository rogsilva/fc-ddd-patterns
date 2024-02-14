import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  const customerRepository = new CustomerRepository();
  const productRepository = new ProductRepository();
  const orderRepository = new OrderRepository();

  async function createCustomer(): Promise<Customer>{
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);
    return customer;
  }

  async function createProduct(id: string, name: string, price: number): Promise<Product> {
    const product = new Product(id, name, price);
    await productRepository.create(product);
    return product;
  }

  async function createOrder(id: string, customer: Customer, items: OrderItem[]): Promise<Order> {
    const order = new Order(id, customer.id, items);
    await orderRepository.create(order);
    return order;
  }

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customer = await createCustomer();  
    const product = await createProduct("123", "Product 1", 10);
    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );
    const order = await createOrder("123", customer, [orderItem]);
    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update an existing order", async () => {
    const customer = await createCustomer();  
    const product = await createProduct("123", "Product 1", 10);
    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );
    const order = await createOrder("123", customer, [orderItem]);
    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });

    const product2 = await createProduct("124", "Product 2", 20);
    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      3
    );

    order.addItem(orderItem2);
    await orderRepository.update(order);

    const orderUpdatedModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderUpdatedModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
        {
          id: orderItem2.id,
          name: orderItem2.name,
          price: orderItem2.price,
          quantity: orderItem2.quantity,
          order_id: "123",
          product_id: "124",
        },
      ],
    });
  });

  it("should find an existing order", async () => {
    const customer = await createCustomer();  
    const product = await createProduct("123", "Product 1", 10);
    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );
    const order = await createOrder("123", customer, [orderItem]);
    const orderFound = await orderRepository.find(order.id);

    expect(orderFound).toStrictEqual(order);
  });

  it("should throw an error when order not found", async () => {
    await expect(orderRepository.find("123")).rejects.toThrow("Order not found");
  });

  it("should find all orders", async () => {
    const customer = await createCustomer();  
    const product = await createProduct("111", "Product 1", 10);
    const product2 = await createProduct("222", "Product 2", 20);
    const product3 = await createProduct("333", "Product 3", 30);
    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );
    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      3
    );
    const orderItem3 = new OrderItem(
      "3",
      product3.name,
      product3.price,
      product3.id,
      1
    );
    const order = await createOrder("111", customer, [orderItem]);
    const order2 = await createOrder("222", customer, [orderItem2, orderItem3]);
    const orders = await orderRepository.findAll();

    expect(orders.length).toBe(2);
    expect(orders).toContainEqual(order);
    expect(orders).toContainEqual(order2);
  });
});
