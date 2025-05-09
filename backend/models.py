from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Enum, Column, Boolean, Table, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Таблица связи для заказов и продуктов
order_product = Table(
    'order_product',
    Base.metadata,
    Column('order_id', Integer, ForeignKey('orders.id'), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.id'), primary_key=True),
    Column('quantity', Integer, nullable=False),
    Column('price_at_time', Float, nullable=False)  # Цена продукта на момент заказа
)

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    email: Mapped[str] = Column(String, unique=True, index=True)
    username: Mapped[str] = Column(String, unique=True, index=True)
    hashed_password: Mapped[str] = Column(String)
    is_active: Mapped[bool] = Column(Boolean, default=True)
    is_admin: Mapped[bool] = Column(Boolean, default=False)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="user")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="user")
    cart_items: Mapped[List["CartItem"]] = relationship("CartItem", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    name: Mapped[str] = Column(String, unique=True, index=True)
    description: Mapped[str] = Column(String)
    price: Mapped[float] = Column(Float)
    stock: Mapped[int] = Column(Integer)
    category_id: Mapped[int] = Column(Integer, ForeignKey("categories.id"))
    supplier_id: Mapped[int] = Column(Integer, ForeignKey("suppliers.id"))
    supply_price: Mapped[float] = Column(Float)
    last_supply_date: Mapped[datetime] = Column(DateTime(timezone=True))
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    category: Mapped["Category"] = relationship("Category", back_populates="products")
    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="products")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="product")
    cart_items: Mapped[List["CartItem"]] = relationship("CartItem", back_populates="product")
    orders: Mapped[List["Order"]] = relationship("Order", secondary=order_product, back_populates="products")

class Category(Base):
    __tablename__ = "categories"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    name: Mapped[str] = Column(String, unique=True, index=True)
    description: Mapped[str] = Column(String)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    products: Mapped[List["Product"]] = relationship("Product", back_populates="category")

class Order(Base):
    __tablename__ = "orders"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = Column(Integer, ForeignKey("users.id"))
    status: Mapped[str] = Column(String, default="pending")
    total_amount: Mapped[float] = Column(Float)
    shipping_address: Mapped[str] = Column(String)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user: Mapped["User"] = relationship("User", back_populates="orders")
    products: Mapped[List["Product"]] = relationship(
        "Product",
        secondary=order_product,
        back_populates="orders"
    )

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = Column(Integer, ForeignKey("users.id"))
    product_id: Mapped[int] = Column(Integer, ForeignKey("products.id"))
    rating: Mapped[int] = Column(Integer)  # 1-5
    comment: Mapped[str] = Column(Text)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user: Mapped["User"] = relationship("User", back_populates="reviews")
    product: Mapped["Product"] = relationship("Product", back_populates="reviews")

class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = Column(Integer, ForeignKey("users.id"))
    product_id: Mapped[int] = Column(Integer, ForeignKey("products.id"))
    quantity: Mapped[int] = Column(Integer)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user: Mapped["User"] = relationship("User", back_populates="cart_items")
    product: Mapped["Product"] = relationship("Product", back_populates="cart_items")

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    name: Mapped[str] = Column(String, unique=True, index=True)
    contact_person: Mapped[str] = Column(String)
    email: Mapped[str] = Column(String, unique=True)
    phone: Mapped[str] = Column(String)
    address: Mapped[str] = Column(String)
    created_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    products: Mapped[List["Product"]] = relationship("Product", back_populates="supplier")

class OrderProduct(Base):
    __tablename__ = "order_products"

    order_id: Mapped[int] = Column(Integer, ForeignKey("orders.id"), primary_key=True)
    product_id: Mapped[int] = Column(Integer, ForeignKey("products.id"), primary_key=True)
    quantity: Mapped[int] = Column(Integer, default=1)
    price_at_time: Mapped[float] = Column(Float)  # Цена товара на момент заказа 